"""Config flow and Options flow for Schulnoten integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_send

from .const import (
    CONF_CHILD_NAME,
    CONF_DATE,
    CONF_GRADE,
    CONF_GRADE_ID,
    CONF_NAME,
    CONF_SUBJECT,
    CONF_WEIGHT,
    DEFAULT_WEIGHT,
    DOMAIN,
    SIGNAL_UPDATE_GRADES,
)
from .storage import SchoolGradesStorage

_LOGGER = logging.getLogger(__name__)


class SchoolGradesConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Schulnoten."""

    VERSION = 1
    DOMAIN = DOMAIN

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial user step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            child_name = user_input[CONF_CHILD_NAME].strip()

            # Check for duplicate child names
            existing_entries = self._async_current_entries()
            for entry in existing_entries:
                if entry.data.get(CONF_CHILD_NAME, "").lower() == child_name.lower():
                    errors["base"] = "already_configured"
                    break

            if not errors:
                return self.async_create_entry(
                    title=child_name,
                    data={CONF_CHILD_NAME: child_name},
                )

        schema = vol.Schema(
            {
                vol.Required(CONF_CHILD_NAME): cv.string,
            }
        )

        return self.async_show_form(
            step_id="user", data_schema=schema, errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Get the options flow for this handler."""
        return SchoolGradesOptionsFlowHandler(config_entry)


class SchoolGradesOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for managing subjects and grades via Home Assistant UI."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        super().__init__()
        self._config_entry = config_entry

    @property
    def config_entry(self) -> config_entries.ConfigEntry:
        """Return config entry."""
        return self._config_entry

    @property
    def storage(self) -> SchoolGradesStorage | None:
        """Get storage instance from hass data."""
        if DOMAIN in self.hass.data and self.config_entry.entry_id in self.hass.data[DOMAIN]:
            return self.hass.data[DOMAIN][self.config_entry.entry_id]
        return None

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options menu."""
        return self.async_show_menu(
            step_id="init",
            menu_options=["add_grade", "add_subject", "remove_grade", "remove_subject"],
        )

    async def async_step_add_subject(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle adding a new subject via UI."""
        errors: dict[str, str] = {}
        if user_input is not None:
            subject = user_input[CONF_SUBJECT].strip()
            if self.storage:
                if self.storage.data.add_subject(subject):
                    await self.storage.async_save()
                    async_dispatcher_send(
                        self.hass,
                        SIGNAL_UPDATE_GRADES.format(entry_id=self.config_entry.entry_id),
                    )
                    return self.async_create_entry(title="", data={})
                errors["base"] = "subject_exists"

        schema = vol.Schema({vol.Required(CONF_SUBJECT): cv.string})
        return self.async_show_form(
            step_id="add_subject", data_schema=schema, errors=errors
        )

    async def async_step_remove_subject(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle removing a subject via UI."""
        errors: dict[str, str] = {}
        subjects = self.storage.data.subjects if self.storage else []

        if not subjects:
            return self.async_abort(reason="no_subjects")

        if user_input is not None:
            subject = user_input[CONF_SUBJECT]
            if self.storage and self.storage.data.remove_subject(subject):
                await self.storage.async_save()
                async_dispatcher_send(
                    self.hass,
                    SIGNAL_UPDATE_GRADES.format(entry_id=self.config_entry.entry_id),
                )
                return self.async_create_entry(title="", data={})

        schema = vol.Schema({vol.Required(CONF_SUBJECT): vol.In(subjects)})
        return self.async_show_form(
            step_id="remove_subject", data_schema=schema, errors=errors
        )

    async def async_step_add_grade(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle adding a grade via UI."""
        errors: dict[str, str] = {}
        subjects = self.storage.data.subjects if self.storage else []

        if not subjects:
            return self.async_abort(reason="no_subjects")

        if user_input is not None:
            subject = user_input[CONF_SUBJECT]
            grade = user_input[CONF_GRADE]
            weight = user_input.get(CONF_WEIGHT, 1.0)
            name = user_input.get(CONF_NAME, "")

            if self.storage:
                self.storage.data.add_grade(
                    subject=subject,
                    grade=grade,
                    weight=weight,
                    name=name,
                )
                await self.storage.async_save()
                async_dispatcher_send(
                    self.hass,
                    SIGNAL_UPDATE_GRADES.format(entry_id=self.config_entry.entry_id),
                )
                return self.async_create_entry(title="", data={})

        schema = vol.Schema(
            {
                vol.Required(CONF_SUBJECT): vol.In(subjects),
                vol.Required(CONF_GRADE): vol.All(
                    vol.Coerce(float), vol.Range(min=1.0, max=6.0)
                ),
                vol.Required(CONF_WEIGHT, default=1.0): vol.In([1.0, 2.0, 3.0, 4.0]),
                vol.Optional(CONF_NAME, default=""): cv.string,
            }
        )
        return self.async_show_form(
            step_id="add_grade", data_schema=schema, errors=errors
        )

    async def async_step_remove_grade(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle removing a grade via UI."""
        errors: dict[str, str] = {}
        if not self.storage:
            return self.async_abort(reason="unknown")

        all_grades: list[tuple[str, str, str]] = []  # (display_text, subject, grade_id)
        for subj in self.storage.data.subjects:
            for g in self.storage.data.get_grades(subj):
                label = f"{subj}: Note {g['grade']} ({g['weight']}x) - {g['name'] or 'Ohne Text'} [{g['date']}]"
                all_grades.append((label, subj, g["id"]))

        if not all_grades:
            return self.async_abort(reason="no_grades")

        grade_options = {g[2]: g[0] for g in all_grades}

        if user_input is not None:
            grade_id = user_input[CONF_GRADE_ID]
            # Find subject for grade_id
            target_subject = next(
                (g[1] for g in all_grades if g[2] == grade_id), None
            )
            if target_subject and self.storage.data.remove_grade(target_subject, grade_id):
                await self.storage.async_save()
                async_dispatcher_send(
                    self.hass,
                    SIGNAL_UPDATE_GRADES.format(entry_id=self.config_entry.entry_id),
                )
                return self.async_create_entry(title="", data={})

        schema = vol.Schema({vol.Required(CONF_GRADE_ID): vol.In(grade_options)})
        return self.async_show_form(
            step_id="remove_grade", data_schema=schema, errors=errors
        )
