"""The Schulnoten (School Grades) integration."""
from __future__ import annotations

import logging
import os
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import async_dispatcher_send
from .const import (
    CONF_ALIASES_YAML,
    CONF_CALENDAR,
    CONF_CHILD_NAME,
    CONF_COUNTRY,
    CONF_DATE,
    CONF_DAY,
    CONF_DESCRIPTION,
    CONF_GRADE,
    CONF_GRADE_ID,
    CONF_GRADE_LEVEL,
    CONF_HOMEWORK_DONE,
    CONF_NAME,
    CONF_PORTAL_ENABLED,
    CONF_PORTAL_PASSWORD,
    CONF_PORTAL_SCHOOL,
    CONF_PORTAL_STUDENT_ID,
    CONF_PORTAL_STUDENT_NAME,
    CONF_PORTAL_SYNC_EXAMS,
    CONF_PORTAL_SYNC_SUBSTITUTIONS,
    CONF_PORTAL_SYNC_TIMETABLE,
    CONF_PORTAL_USERNAME,
    CONF_PREPARATION_DONE,
    CONF_ROOM,
    CONF_SHOW_CALENDAR,
    CONF_SHOW_OVERVIEW,
    CONF_SHOW_PREP,
    CONF_SHOW_TIMETABLE,
    CONF_SLOT_ID,
    CONF_START_TIME,
    CONF_SUBJECT,
    CONF_SUBJECT_ALIASES,
    CONF_SUMMARY,
    CONF_TEACHER,
    CONF_WEIGHT,
    CONF_YAML_CONTENT,
    DEFAULT_WEIGHT,
    DOMAIN,
    SERVICE_ADD_CALENDAR_EVENT,
    SERVICE_ADD_GRADE,
    SERVICE_ADD_SUBJECT,
    SERVICE_IMPORT_PORTAL_TIMETABLE,
    SERVICE_IMPORT_TIMETABLE,
    SERVICE_REMOVE_CALENDAR_EVENT,
    SERVICE_REMOVE_GRADE,
    SERVICE_REMOVE_SUBJECT,
    SERVICE_SET_CALENDAR,
    SERVICE_SET_HOMEWORK_DONE,
    SERVICE_SET_PREPARATION_DONE,
    SERVICE_SYNC_ELTERNPORTAL,
    SERVICE_TEST_ELTERNPORTAL,
    SERVICE_TOGGLE_PREPARED_SUBJECT,
    SERVICE_UPDATE_CALENDAR_EVENT,
    SERVICE_UPDATE_PORTAL_SETTINGS,
    SERVICE_UPDATE_SETTINGS,
    SERVICE_UPDATE_SUBJECT_ALIASES,
    SERVICE_UPDATE_TIMETABLE_CELL,
    SIGNAL_UPDATE_GRADES,
)
from .portal import (
    async_fetch_child_portal_data,
    async_validate_and_get_students,
    convert_portal_lessons_to_timetable,
    parse_subject_aliases_yaml,
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
        vol.Required(CONF_GRADE_ID): cv.string,
        vol.Required(CONF_SUBJECT): cv.string,
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

SCHEMA_UPDATE_SETTINGS = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Optional(CONF_COUNTRY): cv.string,
        vol.Optional(CONF_GRADE_LEVEL): cv.string,
        vol.Optional(CONF_CALENDAR): cv.string,
        vol.Optional(CONF_SHOW_PREP): cv.boolean,
        vol.Optional(CONF_SHOW_CALENDAR): cv.boolean,
        vol.Optional(CONF_SHOW_TIMETABLE): cv.boolean,
        vol.Optional(CONF_SHOW_OVERVIEW): cv.boolean,
    }
)

SCHEMA_SET_HOMEWORK_DONE = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_HOMEWORK_DONE): cv.boolean,
    }
)

SCHEMA_SET_PREPARATION_DONE = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_PREPARATION_DONE): cv.boolean,
    }
)

SCHEMA_TOGGLE_PREPARED_SUBJECT = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_SUBJECT): cv.string,
        vol.Optional("state"): cv.boolean,
        vol.Optional("target_date"): cv.string,
    }
)

SCHEMA_ADD_CALENDAR_EVENT = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Optional(CONF_CALENDAR): cv.string,
        vol.Required(CONF_SUMMARY): cv.string,
        vol.Required(CONF_DATE): cv.string,
        vol.Optional(CONF_START_TIME, default="08:00"): cv.string,
        vol.Optional(CONF_DESCRIPTION, default=""): cv.string,
    }
)

SCHEMA_UPDATE_CALENDAR_EVENT = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Optional(CONF_CALENDAR): cv.string,
        vol.Optional("uid"): cv.string,
        vol.Optional("original_summary"): cv.string,
        vol.Optional("original_date"): cv.string,
        vol.Required(CONF_SUMMARY): cv.string,
        vol.Required(CONF_DATE): cv.string,
        vol.Optional(CONF_START_TIME, default="08:00"): cv.string,
        vol.Optional(CONF_DESCRIPTION, default=""): cv.string,
    }
)

SCHEMA_REMOVE_CALENDAR_EVENT = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Optional(CONF_CALENDAR): cv.string,
        vol.Optional("uid"): cv.string,
        vol.Optional("original_summary"): cv.string,
        vol.Optional("original_date"): cv.string,
        vol.Optional(CONF_SUMMARY): cv.string,
        vol.Optional(CONF_DATE): cv.string,
    }
)

SCHEMA_TEST_ELTERNPORTAL = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_PORTAL_SCHOOL): cv.string,
        vol.Optional(CONF_PORTAL_USERNAME, default=""): cv.string,
        vol.Optional(CONF_PORTAL_PASSWORD, default=""): cv.string,
    }
)

SCHEMA_UPDATE_PORTAL_SETTINGS = vol.Schema(
    {
        vol.Required(CONF_CHILD_NAME): cv.string,
        vol.Required(CONF_PORTAL_ENABLED): cv.boolean,
        vol.Optional(CONF_PORTAL_SCHOOL, default=""): cv.string,
        vol.Optional(CONF_PORTAL_USERNAME, default=""): cv.string,
        vol.Optional(CONF_PORTAL_PASSWORD, default=""): cv.string,
        vol.Optional(CONF_PORTAL_STUDENT_ID, default=""): cv.string,
        vol.Optional(CONF_PORTAL_STUDENT_NAME, default=""): cv.string,
        vol.Optional(CONF_PORTAL_SYNC_TIMETABLE, default=False): cv.boolean,
        vol.Optional(CONF_PORTAL_SYNC_SUBSTITUTIONS, default=True): cv.boolean,
        vol.Optional(CONF_PORTAL_SYNC_EXAMS, default=True): cv.boolean,
        vol.Optional("copy_sibling_name"): cv.string,
    }
)

SCHEMA_SYNC_ELTERNPORTAL = vol.Schema(
    {
        vol.Optional(CONF_CHILD_NAME): cv.string,
    }
)

SCHEMA_IMPORT_PORTAL_TIMETABLE = vol.Schema(
    {
        vol.Required(CONF_CHILD_NAME): cv.string,
    }
)

SCHEMA_UPDATE_SUBJECT_ALIASES = vol.Schema(
    {
        vol.Required(CONF_CHILD_NAME): cv.string,
        vol.Optional(CONF_ALIASES_YAML): cv.string,
        vol.Optional(CONF_SUBJECT_ALIASES): vol.Schema({cv.string: vol.All(cv.ensure_list, [cv.string])}),
    }
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Schulnoten entry from a config flow."""
    child_name = entry.data.get(CONF_CHILD_NAME, "Kind")
    country = entry.data.get(CONF_COUNTRY)

    storage = SchoolGradesStorage(hass, entry.entry_id, child_name)
    await storage.async_load()

    if country and not storage.data.country:
        storage.data.set_country(country)

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

    version_str = "1.2.7"
    try:
        js_file = os.path.join(FRONTEND_DIR, "school-grades-panel.js")
        if os.path.exists(js_file):
            version_str = f"{version_str}.{int(os.path.getmtime(js_file))}"
    except Exception:
        pass

    if not hass.data.get(f"{DOMAIN}_panel_registered"):
        hass.data[f"{DOMAIN}_panel_registered"] = True
        try:
            await panel_custom.async_register_panel(
                hass=hass,
                frontend_url_path="schulnoten",
                webcomponent_name="school-grades-panel",
                sidebar_title="Schulnoten",
                sidebar_icon="mdi:school",
                module_url=f"{URL_BASE}/school-grades-panel.js?v={version_str}",
                embed_iframe=False,
                require_admin=False,
            )
            _LOGGER.info("Successfully registered Schulnoten sidebar panel at /schulnoten (v=%s)", version_str)
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

    async def handle_update_settings(call: ServiceCall) -> None:
        """Handle update_settings action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        country = call.data.get(CONF_COUNTRY)
        grade_level = call.data.get(CONF_GRADE_LEVEL)
        calendar_entity = call.data.get(CONF_CALENDAR)

        storage = _get_storage(hass, child_name)
        if storage:
            updated = False
            if country:
                if storage.data.set_country(country):
                    updated = True
                    entry = hass.config_entries.async_get_entry(storage.entry_id)
                    if entry:
                        new_data = {**entry.data, CONF_COUNTRY: country}
                        hass.config_entries.async_update_entry(entry, data=new_data)
            if grade_level is not None:
                storage.data.set_grade_level(grade_level)
                updated = True
            if CONF_CALENDAR in call.data:
                storage.data.set_calendar_entity(calendar_entity)
                updated = True

            vis_keys = [
                CONF_SHOW_PREP,
                CONF_SHOW_CALENDAR,
                CONF_SHOW_TIMETABLE,
                CONF_SHOW_OVERVIEW,
            ]
            vis_updates = {k: call.data[k] for k in vis_keys if k in call.data}
            if vis_updates:
                storage.data.set_section_visibility(vis_updates)
                updated = True

            if updated:
                await storage.async_save()
                async_dispatcher_send(
                    hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
                )

    async def handle_set_homework_done(call: ServiceCall) -> None:
        """Handle set_homework_done action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        state = call.data[CONF_HOMEWORK_DONE]
        storage = _get_storage(hass, child_name)
        if storage:
            storage.data.set_homework_done(state)
            await storage.async_save()
            async_dispatcher_send(
                hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
            )

    async def handle_set_preparation_done(call: ServiceCall) -> None:
        """Handle set_preparation_done action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        state = call.data[CONF_PREPARATION_DONE]
        storage = _get_storage(hass, child_name)
        if storage:
            storage.data.set_preparation_done(state)
            await storage.async_save()
            async_dispatcher_send(
                hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
            )

    async def handle_toggle_prepared_subject(call: ServiceCall) -> None:
        """Handle toggle_prepared_subject action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        subject = call.data[CONF_SUBJECT]
        state = call.data.get("state")
        target_date = call.data.get("target_date", "")
        storage = _get_storage(hass, child_name)
        if storage:
            storage.data.toggle_prepared_subject(subject, state, target_date)
            await storage.async_save()
            async_dispatcher_send(
                hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
            )

    async def handle_test_elternportal(call: ServiceCall) -> dict[str, Any]:
        """Test connection to Eltern-Portal and retrieve student list."""
        child_name = call.data.get(CONF_CHILD_NAME)
        school = call.data[CONF_PORTAL_SCHOOL]
        username = call.data.get(CONF_PORTAL_USERNAME, "")
        password = call.data.get(CONF_PORTAL_PASSWORD, "")

        if (not password or not username) and child_name:
            storage = _get_storage(hass, child_name)
            if storage:
                if not username and storage.data.portal_username:
                    username = storage.data.portal_username
                if not password and storage.data.portal_password:
                    password = storage.data.portal_password
                if not school and storage.data.portal_school:
                    school = storage.data.portal_school

        session = async_get_clientsession(hass)
        result = await async_validate_and_get_students(session, school, username, password)
        return result

    async def handle_update_portal_settings(call: ServiceCall) -> None:
        """Update Eltern-Portal settings for a specific child."""
        child_name = call.data[CONF_CHILD_NAME]
        enabled = call.data[CONF_PORTAL_ENABLED]
        school = call.data.get(CONF_PORTAL_SCHOOL, "")
        username = call.data.get(CONF_PORTAL_USERNAME, "")
        password = call.data.get(CONF_PORTAL_PASSWORD, "")
        student_id = call.data.get(CONF_PORTAL_STUDENT_ID, "")
        student_name = call.data.get(CONF_PORTAL_STUDENT_NAME, "")
        sync_timetable = call.data.get(CONF_PORTAL_SYNC_TIMETABLE, False)
        sync_substitutions = call.data.get(CONF_PORTAL_SYNC_SUBSTITUTIONS, True)
        sync_exams = call.data.get(CONF_PORTAL_SYNC_EXAMS, True)

        copy_sibling = call.data.get("copy_sibling_name")
        storage = _get_storage(hass, child_name)
        if storage:
            if not password and copy_sibling:
                sib_storage = _get_storage(hass, copy_sibling)
                if sib_storage and sib_storage.data.portal_password:
                    password = sib_storage.data.portal_password
            pwd = password if password else None
            storage.data.set_portal_settings(
                enabled=enabled,
                school=school,
                username=username,
                password=pwd,
                student_id=student_id,
                student_name=student_name,
                sync_timetable=sync_timetable,
                sync_substitutions=sync_substitutions,
                sync_exams=sync_exams,
            )
            await storage.async_save()
            async_dispatcher_send(
                hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
            )
            _LOGGER.info(
                "Updated Eltern-Portal settings for %s (enabled: %s, school: %s, student_id: %s)",
                child_name, enabled, school, student_id,
            )

    @websocket_api.websocket_command(
        {
            vol.Required("type"): "school_grades/get_sibling_portal_credentials",
            vol.Required("sibling_name"): str,
        }
    )
    @websocket_api.async_response
    async def ws_get_sibling_portal_credentials(
        hass_inner: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle websocket getting portal credentials from sibling child."""
        sib_name = msg["sibling_name"]
        sib_storage = _get_storage(hass, sib_name)
        if not sib_storage:
            connection.send_result(msg["id"], {"success": False, "error": "sibling_not_found"})
            return
        connection.send_result(
            msg["id"],
            {
                "success": True,
                "school": sib_storage.data.portal_school,
                "username": sib_storage.data.portal_username,
                "password": sib_storage.data.portal_password,
                "student_id": sib_storage.data.portal_student_id,
            },
        )

    @websocket_api.websocket_command(
        {
            vol.Required("type"): "school_grades/test_elternportal",
            vol.Required("school"): str,
            vol.Optional("username", default=""): str,
            vol.Optional("password", default=""): str,
            vol.Optional("child_name"): str,
            vol.Optional("copy_sibling_name"): str,
        }
    )
    @websocket_api.async_response
    async def ws_test_elternportal(
        hass_inner: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle websocket test connection to Eltern-Portal."""
        child_name = msg.get("child_name")
        school = msg["school"]
        username = msg.get("username", "")
        password = msg.get("password", "")
        copy_sibling = msg.get("copy_sibling_name")

        if not password and copy_sibling:
            sib_storage = _get_storage(hass, copy_sibling)
            if sib_storage and sib_storage.data.portal_password:
                password = sib_storage.data.portal_password

        if (not password or not username) and child_name:
            storage = _get_storage(hass, child_name)
            if storage:
                if not username and storage.data.portal_username:
                    username = storage.data.portal_username
                if not password and storage.data.portal_password:
                    password = storage.data.portal_password
                if not school and storage.data.portal_school:
                    school = storage.data.portal_school

        session = async_get_clientsession(hass)
        result = await async_validate_and_get_students(session, school, username, password)
        connection.send_result(msg["id"], result)

    async def _async_sync_child_portal(storage: SchoolGradesStorage, force_timetable: bool = False) -> dict[str, Any]:
        """Fetch and update data from Eltern-Portal for a child."""
        data = storage.data
        if not data.portal_enabled:
            return {
                "success": False,
                "child_name": data.child_name,
                "error": "not_enabled",
                "message": "Eltern-Portal ist für dieses Kind nicht aktiviert.",
            }
        if not data.portal_school or not data.portal_username or not data.portal_password or not data.portal_student_id:
            return {
                "success": False,
                "child_name": data.child_name,
                "error": "missing_credentials",
                "message": "Zugangsdaten unvollständig (Schule, Benutzername, Passwort oder Schüler-ID fehlt). Bitte in den Einstellungen eintragen.",
            }

        import time
        cooldowns = hass.data.setdefault(f"{DOMAIN}_portal_sync_cooldowns", {})
        now_ts = time.time()
        last_ts = cooldowns.get(data.child_name, 0.0)
        if not force_timetable and (now_ts - last_ts < 60.0):
            wait_s = int(60.0 - (now_ts - last_ts))
            return {
                "success": False,
                "child_name": data.child_name,
                "error": "rate_limited",
                "message": f"Synchronisierung ist limitiert auf maximal 1x pro Minute. Bitte noch {wait_s} Sekunden warten.",
            }

        session = async_get_clientsession(hass)
        sync_tt = force_timetable or data.portal_sync_timetable
        sync_subst = data.portal_sync_substitutions
        res = await async_fetch_child_portal_data(
            session=session,
            school=data.portal_school,
            username=data.portal_username,
            password=data.portal_password,
            student_id=data.portal_student_id,
            fetch_timetable=sync_tt,
            fetch_substitutions=sync_subst,
        )
        from datetime import datetime
        data.portal_last_sync = datetime.now().isoformat()

        if not res.get("success"):
            err_msg = res.get("message", "Unbekannter Fehler")
            data.portal_last_status = f"Fehler: {err_msg}"
            await storage.async_save()
            async_dispatcher_send(hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id))
            return res

        data.portal_last_status = "ok"
        cooldowns[data.child_name] = now_ts

        # Update substitutions if fetched
        if sync_subst and "substitutions" in res:
            data.set_portal_substitutions(res["substitutions"])

        # Update timetable if requested
        if sync_tt and "timetable" in res and res["timetable"]:
            tt_converted = convert_portal_lessons_to_timetable(
                lessons=res["timetable"],
                aliases=data.subject_aliases,
                existing_subjects=data.subjects,
                existing_slots=data.timetable.get("slots"),
            )
            data.import_timetable_data(tt_converted)

        await storage.async_save()
        async_dispatcher_send(hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id))
        _LOGGER.info("Successfully synchronized Eltern-Portal for %s", data.child_name)
        return {"success": True, "child_name": data.child_name, "last_sync": data.portal_last_sync}

    async def handle_sync_elternportal(call: ServiceCall) -> dict[str, Any]:
        """Synchronize data from Eltern-Portal."""
        child_name = call.data.get(CONF_CHILD_NAME)
        results = []
        if child_name:
            storage = _get_storage(hass, child_name)
            if storage:
                res = await _async_sync_child_portal(storage)
                results.append(res)
        else:
            domain_data = hass.data.get(DOMAIN, {})
            for storage in domain_data.values():
                if isinstance(storage, SchoolGradesStorage) and storage.data.portal_enabled:
                    res = await _async_sync_child_portal(storage)
                    results.append(res)
        return {"results": results}

    async def handle_import_portal_timetable(call: ServiceCall) -> dict[str, Any]:
        """Import timetable directly from Eltern-Portal, resolving subject aliases."""
        child_name = call.data[CONF_CHILD_NAME]
        storage = _get_storage(hass, child_name)
        if not storage:
            return {"success": False, "error": "child_not_found", "message": f"Kind '{child_name}' nicht gefunden."}
        return await _async_sync_child_portal(storage, force_timetable=True)

    async def handle_update_subject_aliases(call: ServiceCall) -> None:
        """Update subject aliases dictionary or YAML for a child."""
        child_name = call.data[CONF_CHILD_NAME]
        storage = _get_storage(hass, child_name)
        if not storage:
            return
        yaml_text = call.data.get(CONF_ALIASES_YAML)
        aliases_dict = call.data.get(CONF_SUBJECT_ALIASES)
        if yaml_text is not None:
            try:
                parsed = parse_subject_aliases_yaml(yaml_text)
                storage.data.set_subject_aliases(parsed)
            except ValueError as err:
                _LOGGER.error("Fehler beim Parsen der Fach-Aliase für %s: %s", child_name, err)
                return
        elif aliases_dict is not None:
            storage.data.set_subject_aliases(aliases_dict)

        storage.data.set_portal_substitutions(storage.data.portal_substitutions)
        await storage.async_save()
        async_dispatcher_send(hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id))
        _LOGGER.info("Updated subject aliases for %s", child_name)

    @websocket_api.websocket_command(
        {
            vol.Required("type"): "school_grades/sync_elternportal",
            vol.Optional("child_name"): str,
        }
    )
    @websocket_api.async_response
    async def ws_sync_elternportal(
        hass_inner: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle websocket request to sync Eltern-Portal."""
        child_name = msg.get("child_name")
        if child_name:
            storage = _get_storage(hass, child_name)
            if not storage:
                connection.send_result(msg["id"], {"success": False, "error": "child_not_found"})
                return
            res = await _async_sync_child_portal(storage)
            connection.send_result(msg["id"], res)
        else:
            results = []
            for storage in hass.data.get(DOMAIN, {}).values():
                if isinstance(storage, SchoolGradesStorage) and storage.data.portal_enabled:
                    res = await _async_sync_child_portal(storage)
                    results.append(res)
            connection.send_result(msg["id"], {"success": True, "results": results})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): "school_grades/import_portal_timetable",
            vol.Required("child_name"): str,
        }
    )
    @websocket_api.async_response
    async def ws_import_portal_timetable(
        hass_inner: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle websocket request to import timetable from Eltern-Portal."""
        child_name = msg["child_name"]
        storage = _get_storage(hass, child_name)
        if not storage:
            connection.send_result(msg["id"], {"success": False, "error": "child_not_found"})
            return
        res = await _async_sync_child_portal(storage, force_timetable=True)
        connection.send_result(msg["id"], res)

    @websocket_api.websocket_command(
        {
            vol.Required("type"): "school_grades/update_subject_aliases",
            vol.Required("child_name"): str,
            vol.Optional("aliases_yaml"): str,
            vol.Optional("subject_aliases"): dict,
        }
    )
    @websocket_api.async_response
    async def ws_update_subject_aliases(
        hass_inner: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle websocket request to update subject aliases."""
        child_name = msg["child_name"]
        storage = _get_storage(hass, child_name)
        if not storage:
            connection.send_result(msg["id"], {"success": False, "error": "child_not_found"})
            return
        yaml_text = msg.get("aliases_yaml")
        aliases_dict = msg.get("subject_aliases")
        if yaml_text is not None:
            try:
                parsed = parse_subject_aliases_yaml(yaml_text)
                storage.data.set_subject_aliases(parsed)
            except ValueError as err:
                connection.send_result(
                    msg["id"],
                    {"success": False, "error": str(err)},
                )
                return
        elif aliases_dict is not None:
            storage.data.set_subject_aliases(aliases_dict)
        storage.data.set_portal_substitutions(storage.data.portal_substitutions)
        await storage.async_save()
        async_dispatcher_send(hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id))
        connection.send_result(
            msg["id"],
            {
                "success": True,
                "aliases": storage.data.subject_aliases,
                "yaml": storage.data.get_subject_aliases_yaml(),
            },
        )

    def _parse_event_datetime(d_str: str, t_str: str) -> tuple[str, str]:
        from datetime import datetime, timedelta
        c_date = d_str.strip()
        if "T" in c_date:
            c_date = c_date.split("T")[0]

        c_time = (t_str or "08:00").strip()
        if "T" in c_time:
            c_time = c_time.split("T")[-1]
        if len(c_time) >= 5 and ":" in c_time:
            c_time = c_time[:5]
        else:
            c_time = "08:00"

        start_dt = datetime.fromisoformat(f"{c_date}T{c_time}:00")
        end_dt = start_dt + timedelta(hours=1)
        return (start_dt.isoformat(), end_dt.isoformat())

    async def handle_add_calendar_event(call: ServiceCall) -> None:
        """Handle add_calendar_event action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        summary = call.data[CONF_SUMMARY]
        date_str = call.data[CONF_DATE]
        start_time_str = call.data.get(CONF_START_TIME, "08:00") or "08:00"
        description = call.data.get(CONF_DESCRIPTION, "")
        target_calendar = call.data.get(CONF_CALENDAR)

        storage = _get_storage(hass, child_name)
        if storage and not target_calendar:
            target_calendar = storage.data.calendar_entity

        if not target_calendar:
            _LOGGER.error("No target calendar specified or assigned for child %s", child_name)
            return

        try:
            start_iso, end_iso = _parse_event_datetime(date_str, start_time_str)

            service_data = {
                "entity_id": target_calendar,
                "summary": summary,
                "start_date_time": start_iso,
                "end_date_time": end_iso,
            }
            if description:
                service_data["description"] = description

            await hass.services.async_call(
                "calendar",
                "create_event",
                service_data,
                blocking=True,
            )
            _LOGGER.info("Successfully created calendar event '%s' on %s", summary, target_calendar)

            if storage:
                async_dispatcher_send(
                    hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
                )
        except Exception as err:
            _LOGGER.error("Failed to create calendar event on %s: %s", target_calendar, err)

    def _find_calendar_service(action_type: str) -> tuple[str, str]:
        """Find available service domain and service name for create, update, or delete."""
        candidates = {
            "create": [
                ("calendar", "create_event"),
                ("google", "create_event"),
                ("google", "add_event"),
            ],
            "update": [
                ("calendar", "update_event"),
                ("calendar", "edit_event"),
                ("google", "update_event"),
                ("google", "edit_event"),
            ],
            "delete": [
                ("calendar", "delete_event"),
                ("calendar", "remove_event"),
                ("google", "delete_event"),
                ("google", "remove_event"),
            ],
        }

        for domain, svc in candidates.get(action_type, []):
            if hass.services.has_service(domain, svc):
                return (domain, svc)

        defaults = {
            "create": ("calendar", "create_event"),
            "update": ("calendar", "update_event"),
            "delete": ("calendar", "delete_event"),
        }
        return defaults[action_type]

    async def _async_find_event_uid(
        target_calendar: str, summary: str | None, date_str: str | None
    ) -> str | None:
        """Helper to locate a calendar event UID by summary and date if UID is missing."""
        if not summary or not date_str:
            return None
        try:
            from datetime import datetime, timedelta
            from homeassistant.components.calendar import async_get_events

            clean_date = date_str.strip()
            if len(clean_date) > 10:
                clean_date = clean_date[:10]

            target_date = datetime.fromisoformat(f"{clean_date}T00:00:00")
            start_search = target_date - timedelta(days=1)
            end_search = target_date + timedelta(days=2)

            raw_events = await async_get_events(hass, target_calendar, start_search, end_search)
            clean_summary = summary.strip().lower()

            for evt in raw_events:
                evt_summary = (getattr(evt, "summary", "") or getattr(evt, "title", "") or "").strip().lower()
                if clean_summary in evt_summary or evt_summary in clean_summary:
                    uid_val = getattr(evt, "uid", None) or getattr(evt, "id", None) or getattr(evt, "event_id", None)
                    if uid_val:
                        return str(uid_val)
        except Exception as err:
            _LOGGER.debug("Error finding event UID for %s on %s: %s", summary, target_calendar, err)
        return None

    async def _async_delete_calendar_event(target_calendar: str, uid: str) -> bool:
        """Helper to delete a calendar event using direct entity calls or service calls."""
        if not target_calendar or not uid:
            return False

        # Method 1: Try direct CalendarEntity.async_delete_event on registered entity
        try:
            entity_components = hass.data.get("entity_components", {})
            cal_component = entity_components.get("calendar")
            if cal_component:
                entity = cal_component.get_entity(target_calendar)
                if entity and hasattr(entity, "async_delete_event"):
                    await entity.async_delete_event(uid)
                    _LOGGER.info("Successfully deleted calendar event %s directly via entity on %s", uid, target_calendar)
                    return True
        except Exception as direct_err:
            _LOGGER.debug("Direct entity delete_event failed on %s: %s", target_calendar, direct_err)

        # Method 2: Try calendar.delete_event service call with event_uid
        del_domain, del_svc = _find_calendar_service("delete")
        try:
            await hass.services.async_call(
                del_domain, del_svc, {"entity_id": target_calendar, "event_uid": uid}, blocking=True
            )
            return True
        except Exception as err1:
            _LOGGER.debug("Delete action %s.%s with event_uid failed: %s", del_domain, del_svc, err1)

        # Method 3: Try calendar.delete_event service call with uid
        try:
            await hass.services.async_call(
                del_domain, del_svc, {"entity_id": target_calendar, "uid": uid}, blocking=True
            )
            return True
        except Exception as err2:
            _LOGGER.debug("Delete action %s.%s with uid key failed: %s", del_domain, del_svc, err2)

        return False

    async def handle_update_calendar_event(call: ServiceCall) -> None:
        """Handle update_calendar_event action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        uid = call.data.get("uid")
        original_summary = call.data.get("original_summary")
        original_date = call.data.get("original_date")
        summary = call.data[CONF_SUMMARY]
        date_str = call.data[CONF_DATE]
        start_time_str = call.data.get(CONF_START_TIME, "08:00") or "08:00"
        description = call.data.get(CONF_DESCRIPTION, "")
        target_calendar = call.data.get(CONF_CALENDAR)

        storage = _get_storage(hass, child_name)
        if storage and not target_calendar:
            target_calendar = storage.data.calendar_entity

        if not target_calendar:
            _LOGGER.error("No target calendar specified or assigned for child %s", child_name)
            return

        if not uid or not str(uid).strip():
            uid = await _async_find_event_uid(target_calendar, original_summary or summary, original_date or date_str)

        try:
            start_iso, end_iso = _parse_event_datetime(date_str, start_time_str)

            success = False
            domain, svc_name = _find_calendar_service("update")

            if uid:
                payload1 = {
                    "entity_id": target_calendar,
                    "event_uid": uid,
                    "summary": summary,
                    "start_date_time": start_iso,
                    "end_date_time": end_iso,
                }
                if description:
                    payload1["description"] = description

                try:
                    await hass.services.async_call(domain, svc_name, payload1, blocking=True)
                    success = True
                except Exception as err1:
                    _LOGGER.debug("Update action %s.%s with event_uid failed: %s, trying uid key", domain, svc_name, err1)
                    payload2 = {
                        "entity_id": target_calendar,
                        "uid": uid,
                        "summary": summary,
                        "start_date_time": start_iso,
                        "end_date_time": end_iso,
                    }
                    if description:
                        payload2["description"] = description
                    try:
                        await hass.services.async_call(domain, svc_name, payload2, blocking=True)
                        success = True
                    except Exception as err2:
                        _LOGGER.debug("Update action %s.%s with uid key failed: %s", domain, svc_name, err2)

            if not success:
                # Fallback: Delete old event if possible and create new event
                if uid:
                    await _async_delete_calendar_event(target_calendar, uid)

                c_domain, c_svc = _find_calendar_service("create")
                create_data = {
                    "entity_id": target_calendar,
                    "summary": summary,
                    "start_date_time": start_iso,
                    "end_date_time": end_iso,
                }
                if description:
                    create_data["description"] = description
                await hass.services.async_call(c_domain, c_svc, create_data, blocking=True)

            _LOGGER.info("Successfully updated calendar event '%s' on %s", summary, target_calendar)

            if storage:
                async_dispatcher_send(
                    hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
                )
        except Exception as err:
            _LOGGER.error("Failed to update calendar event on %s: %s", target_calendar, err)

    async def handle_remove_calendar_event(call: ServiceCall) -> None:
        """Handle remove_calendar_event action call."""
        child_name = call.data.get(CONF_CHILD_NAME)
        uid = call.data.get("uid")
        original_summary = call.data.get("original_summary")
        original_date = call.data.get("original_date")
        summary = call.data.get(CONF_SUMMARY)
        date_str = call.data.get(CONF_DATE)
        target_calendar = call.data.get(CONF_CALENDAR)

        storage = _get_storage(hass, child_name)
        if storage and not target_calendar:
            target_calendar = storage.data.calendar_entity

        if not target_calendar:
            _LOGGER.error("No target calendar specified or assigned for child %s", child_name)
            return

        deleted = False
        if uid and str(uid).strip():
            deleted = await _async_delete_calendar_event(target_calendar, str(uid).strip())

        if not deleted and (summary or original_summary):
            found_uid = await _async_find_event_uid(target_calendar, original_summary or summary, original_date or date_str)
            if found_uid and found_uid != uid:
                deleted = await _async_delete_calendar_event(target_calendar, found_uid)

        if deleted:
            _LOGGER.info("Successfully deleted calendar event on %s", target_calendar)
            if storage:
                async_dispatcher_send(
                    hass, SIGNAL_UPDATE_GRADES.format(entry_id=storage.entry_id)
                )
        else:
            _LOGGER.warning("Could not delete event on %s - ensure calendar entity supports deletion", target_calendar)

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
    hass.services.async_register(
        DOMAIN, SERVICE_UPDATE_SETTINGS, handle_update_settings, schema=SCHEMA_UPDATE_SETTINGS
    )
    hass.services.async_register(
        DOMAIN, SERVICE_ADD_CALENDAR_EVENT, handle_add_calendar_event, schema=SCHEMA_ADD_CALENDAR_EVENT
    )
    hass.services.async_register(
        DOMAIN, SERVICE_UPDATE_CALENDAR_EVENT, handle_update_calendar_event, schema=SCHEMA_UPDATE_CALENDAR_EVENT
    )
    hass.services.async_register(
        DOMAIN, SERVICE_REMOVE_CALENDAR_EVENT, handle_remove_calendar_event, schema=SCHEMA_REMOVE_CALENDAR_EVENT
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_HOMEWORK_DONE, handle_set_homework_done, schema=SCHEMA_SET_HOMEWORK_DONE
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_PREPARATION_DONE, handle_set_preparation_done, schema=SCHEMA_SET_PREPARATION_DONE
    )
    hass.services.async_register(
        DOMAIN, SERVICE_TOGGLE_PREPARED_SUBJECT, handle_toggle_prepared_subject, schema=SCHEMA_TOGGLE_PREPARED_SUBJECT
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_TEST_ELTERNPORTAL,
        handle_test_elternportal,
        schema=SCHEMA_TEST_ELTERNPORTAL,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_PORTAL_SETTINGS,
        handle_update_portal_settings,
        schema=SCHEMA_UPDATE_PORTAL_SETTINGS,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SYNC_ELTERNPORTAL,
        handle_sync_elternportal,
        schema=SCHEMA_SYNC_ELTERNPORTAL,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_IMPORT_PORTAL_TIMETABLE,
        handle_import_portal_timetable,
        schema=SCHEMA_IMPORT_PORTAL_TIMETABLE,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_SUBJECT_ALIASES,
        handle_update_subject_aliases,
        schema=SCHEMA_UPDATE_SUBJECT_ALIASES,
    )
    websocket_api.async_register_command(hass, ws_test_elternportal)
    websocket_api.async_register_command(hass, ws_sync_elternportal)
    websocket_api.async_register_command(hass, ws_import_portal_timetable)
    websocket_api.async_register_command(hass, ws_update_subject_aliases)
    websocket_api.async_register_command(hass, ws_get_sibling_portal_credentials)


def _unregister_services(hass: HomeAssistant) -> None:
    """Unregister services when no config entries remain."""
    hass.services.async_remove(DOMAIN, SERVICE_ADD_SUBJECT)
    hass.services.async_remove(DOMAIN, SERVICE_REMOVE_SUBJECT)
    hass.services.async_remove(DOMAIN, SERVICE_ADD_GRADE)
    hass.services.async_remove(DOMAIN, SERVICE_REMOVE_GRADE)
    hass.services.async_remove(DOMAIN, SERVICE_SET_CALENDAR)
    hass.services.async_remove(DOMAIN, SERVICE_UPDATE_TIMETABLE_CELL)
    hass.services.async_remove(DOMAIN, SERVICE_IMPORT_TIMETABLE)
    hass.services.async_remove(DOMAIN, SERVICE_UPDATE_SETTINGS)
    hass.services.async_remove(DOMAIN, SERVICE_ADD_CALENDAR_EVENT)
    hass.services.async_remove(DOMAIN, SERVICE_UPDATE_CALENDAR_EVENT)
    hass.services.async_remove(DOMAIN, SERVICE_REMOVE_CALENDAR_EVENT)
    hass.services.async_remove(DOMAIN, SERVICE_SET_HOMEWORK_DONE)
    hass.services.async_remove(DOMAIN, SERVICE_SET_PREPARATION_DONE)
    hass.services.async_remove(DOMAIN, SERVICE_TOGGLE_PREPARED_SUBJECT)
    hass.services.async_remove(DOMAIN, SERVICE_TEST_ELTERNPORTAL)
    hass.services.async_remove(DOMAIN, SERVICE_UPDATE_PORTAL_SETTINGS)
    hass.services.async_remove(DOMAIN, SERVICE_SYNC_ELTERNPORTAL)
    hass.services.async_remove(DOMAIN, SERVICE_IMPORT_PORTAL_TIMETABLE)
    hass.services.async_remove(DOMAIN, SERVICE_UPDATE_SUBJECT_ALIASES)


