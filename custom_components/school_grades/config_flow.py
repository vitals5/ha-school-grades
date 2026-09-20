"""Config flow for Schulnoten integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult
import homeassistant.helpers.config_validation as cv

from .const import CONF_CHILD_NAME, DOMAIN

_LOGGER = logging.getLogger(__name__)


class SchoolGradesConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Schulnoten (creating a child instance)."""

    VERSION = 1
    DOMAIN = DOMAIN

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial user step to create a child instance."""
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
