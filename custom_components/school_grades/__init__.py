"""The Schulnoten (School Grades) integration."""
from __future__ import annotations

import logging
import os
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, panel_custom
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_send

from .const import (
    CONF_CALENDAR,
    CONF_CHILD_NAME,
    CONF_DATE,
    CONF_DAY,
    CONF_GRADE,
    CONF_GRADE_ID,
    CONF_NAME,
    CONF_ROOM,
    CONF_SLOT_ID,
    CONF_SUBJECT,
    CONF_TEACHER,
    CONF_WEIGHT,
    CONF_YAML_CONTENT,
    DEFAULT_WEIGHT,
    DOMAIN,
    SERVICE_ADD_GRADE,
    SERVICE_ADD_SUBJECT,
    SERVICE_IMPORT_TIMETABLE,
    SERVICE_REMOVE_GRADE,
    SERVICE_REMOVE_SUBJECT,
    SERVICE_SET_CALENDAR,
    SERVICE_UPDATE_TIMETABLE_CELL,
    SIGNAL_UPDATE_GRADES,
)
from .storage import SchoolGradesStorage

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor", "binary_sensor"]

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend")
URL_BASE = "/school_grades_ui"

# Voluptuous Schemas for Action/Service Calls
SCHEMA_ADD_SUBJECT = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_SUBJECT): cv.string,
    }
)

SCHEMA_REMOVE_SUBJECT = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_SUBJECT): cv.string,
    }
)

SCHEMA_ADD_GRADE = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_SUBJECT): cv.string,
        vol.Required(CONF_GRADE): vol.Coerce(float),
        vol.Optional(CONF_WEIGHT, default=DEFAULT_WEIGHT): vol.Coerce(float),
        vol.Optional(CONF_NAME, default=""): cv.string,
        vol.Optional(CONF_DATE): cv.string,
    }
)

SCHEMA_REMOVE_GRADE = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_SUBJECT): cv.string,
        vol.Required(CONF_GRADE_ID): cv.string,
    }
)

SCHEMA_SET_CALENDAR = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Optional(CONF_CALENDAR): cv.string,
    }
)

SCHEMA_UPDATE_TIMETABLE_CELL = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_SLOT_ID): cv.string,
        vol.Required(CONF_DAY): cv.string,
        vol.Optional(CONF_SUBJECT, default=""): cv.string,
        vol.Optional(CONF_ROOM, default=""): cv.string,
        vol.Optional(CONF_TEACHER, default=""): cv.string,
    }
)

SCHEMA_IMPORT_TIMETABLE = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Optional(CONF_YAML_CONTENT): cv.string,
        vol.Optional("timetable_data"): dict,
    }
)



async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Schulnoten entry from a config flow."""
    child_name = entry.data.get(CONF_CHILD_NAME, "Kind")

    storage = SchoolGradesStorage(hass, entry.entry_id, child_name)
    await storage.async_load()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = storage

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Setup custom sidebar panel & static HTTP assets
    await _async_setup_frontend(hass)

    # Register services once if first entry
    _register_services(hass)

    return True


async def _async_setup_frontend(hass: HomeAssistant) -> None:
    """Register HTTP static path and custom sidebar panel."""
    if hasattr(hass.http, "async_register_static_paths"):
        from homeassistant.components.http import StaticPathConfig
        await hass.http.async_register_static_paths([
            StaticPathConfig(URL_BASE, FRONTEND_DIR, cache_headers=False)
        ])
    else:
        hass.http.register_static_path(URL_BASE, FRONTEND_DIR, cache_headers=False)

    if not hass.data.get(f"{DOMAIN}_panel_registered"):
        hass.data[f"{DOMAIN}_panel_registered"] = True
        try:
            await panel_custom.async_register_panel(
                hass=hass,
                frontend_url_path="schulnoten",
                webcomponent_name="school-grades-panel",
                sidebar_title="Schulnoten",
                sidebar_icon="mdi:school",
                module_url=f"{URL_BASE}/school-grades-panel.js",
                embed_iframe=False,
                require_admin=False,
            )
            _LOGGER.info("Successfully registered Schulnoten sidebar panel at /schulnoten")
        except Exception as err:
            _LOGGER.error("Failed to register Schulnoten panel: %s", err)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a Schulnoten entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
        if not hass.data[DOMAIN]:
            _unregister_services(hass)
            if hass.data.get(f"{DOMAIN}_panel_registered"):
                try:
                    frontend.async_remove_panel(hass, "schulnoten")
                except Exception as err:
                    _LOGGER.warning("Could not remove sidebar panel: %s", err)
                hass.data.pop(f"{DOMAIN}_panel_registered", None)

    return unload_ok


def _get_storage(hass: HomeAssistant, child_name: str | None = None) -> SchoolGradesStorage | None:
    """Helper to locate target storage instance by child_name or default."""
    entries: dict[str, SchoolGradesStorage] = hass.data.get(DOMAIN, {})
    if not entries:
        return None

    if child_name:
        for storage in entries.values():
            if storage.child_name.lower() == child_name.lower():
                return storage

    # Default to first storage if child_name not specified or single instance
    return next(iter(entries.values()))


def _register_services(hass: HomeAssistant) -> None:
    """Register custom integration services/actions."""
    if hass.services.has_service(DOMAIN, SERVICE_ADD_SUBJECT):
        return

    async def handle_add_subject(call: ServiceCall) -> None:
        """Handle add_subject action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        subject = call.data[CONF_SUBJECT]

        storage = _get_storage(hass, child_name)
        if storage:
            if storage.data.add_subject(subject):
                await storage.async_save()
                async_dispatcher_send(
                    hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
                )

    async def handle_remove_subject(call: ServiceCall) -> None:
        """Handle remove_subject action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        subject = call.data[CONF_SUBJECT]

        storage = _get_storage(hass, child_name)
        if storage:
            if storage.data.remove_subject(subject):
                await storage.async_save()
                async_dispatcher_send(
                    hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
                )

    async def handle_add_grade(call: ServiceCall) -> None:
        """Handle add_grade action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        subject = call.data[CONF_SUBJECT]
        grade = call.data[CONF_GRADE]
        weight = call.data.get(CONF_WEIGHT, DEFAULT_WEIGHT)
        name = call.data.get(CONF_NAME, "")
        date_str = call.data.get(CONF_DATE)

        storage = _get_storage(hass, child_name)
        if storage:
            storage.data.add_grade(
                subject=subject,
                grade=grade,
                weight=weight,
                name=name,
                date_str=date_str,
            )
            await storage.async_save()
            async_dispatcher_send(
                hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
            )

    async def handle_remove_grade(call: ServiceCall) -> None:
        """Handle remove_grade action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        subject = call.data[CONF_SUBJECT]
        grade_id = call.data[CONF_GRADE_ID]

        storage = _get_storage(hass, child_name)
        if storage:
            if storage.data.remove_grade(subject, grade_id):
                await storage.async_save()
                async_dispatcher_send(
                    hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
                )

    async def handle_set_calendar(call: ServiceCall) -> None:
        """Handle set_calendar action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        calendar_entity = call.data.get(CONF_CALENDAR)

        storage = _get_storage(hass, child_name)
        if storage:
            storage.data.set_calendar_entity(calendar_entity)
            await storage.async_save()
            async_dispatcher_send(
                hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
            )

    async def handle_update_timetable_cell(call: ServiceCall) -> None:
        """Handle update_timetable_cell action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        slot_id = call.data[CONF_SLOT_ID]
        day = call.data[CONF_DAY]
        subject = call.data.get(CONF_SUBJECT, "")
        room = call.data.get(CONF_ROOM, "")
        teacher = call.data.get(CONF_TEACHER, "")

        storage = _get_storage(hass, child_name)
        if storage:
            storage.data.update_timetable_cell(
                slot_id=slot_id, day=day, subject=subject, room=room, teacher=teacher
            )
            await storage.async_save()
            async_dispatcher_send(
                hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
            )

    async def handle_import_timetable(call: ServiceCall) -> None:
        """Handle import_timetable action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        yaml_content = call.data.get(CONF_YAML_CONTENT)
        timetable_data = call.data.get("timetable_data")

        if yaml_content and isinstance(yaml_content, str):
            try:
                import yaml
                timetable_data = yaml.safe_load(yaml_content)
            except Exception as err:
                _LOGGER.error("Failed to parse YAML content for timetable import: %s", err)
                return

        if not timetable_data or not isinstance(timetable_data, dict):
            _LOGGER.error("Invalid timetable data supplied for import")
            return

        storage = _get_storage(hass, child_name)
        if storage:
            if storage.data.import_timetable_data(timetable_data):
                await storage.async_save()
                async_dispatcher_send(
                    hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
                )

    hass.services.async_register(
        DOMAIN, SERVICE_ADD_SUBJECT, handle_add_subject, schema=SCHEMA_ADD_SUBJECT
    )
    hass.services.async_register(
        DOMAIN, SERVICE_REMOVE_SUBJECT, handle_remove_subject, schema=SCHEMA_REMOVE_SUBJECT
    )
    hass.services.async_register(
        DOMAIN, SERVICE_ADD_GRADE, handle_add_grade, schema=SCHEMA_ADD_GRADE
    )
    hass.services.async_register(
        DOMAIN, SERVICE_REMOVE_GRADE, handle_remove_grade, schema=SCHEMA_REMOVE_GRADE
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_CALENDAR, handle_set_calendar, schema=SCHEMA_SET_CALENDAR
    )
    hass.services.async_register(
        DOMAIN, SERVICE_UPDATE_TIMETABLE_CELL, handle_update_timetable_cell, schema=SCHEMA_UPDATE_TIMETABLE_CELL
    )
    hass.services.async_register(
        DOMAIN, SERVICE_IMPORT_TIMETABLE, handle_import_timetable, schema=SCHEMA_IMPORT_TIMETABLE
    )


def _unregister_services(hass: HomeAssistant) -> None:
    """Unregister services when no config entries remain."""
    hass.services.async_remove(DOMAIN, SERVICE_ADD_SUBJECT)
    hass.services.async_remove(DOMAIN, SERVICE_REMOVE_SUBJECT)
    hass.services.async_remove(DOMAIN, SERVICE_ADD_GRADE)
    hass.services.async_remove(DOMAIN, SERVICE_REMOVE_GRADE)
    hass.services.async_remove(DOMAIN, SERVICE_SET_CALENDAR)
    hass.services.async_remove(DOMAIN, SERVICE_UPDATE_TIMETABLE_CELL)
    hass.services.async_remove(DOMAIN, SERVICE_IMPORT_TIMETABLE)

