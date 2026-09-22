"""Binary sensor platform for Schulnoten (School Grades) integration."""
from __future__ import annotations

from datetime import date, datetime, timedelta
import logging
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import DOMAIN, SIGNAL_UPDATE_GRADES
from .storage import SchoolGradesStorage

_LOGGER = logging.getLogger(__name__)

DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
DAY_NAMES_DE = {
    "monday": "Montag",
    "tuesday": "Dienstag",
    "wednesday": "Mittwoch",
    "thursday": "Donnerstag",
    "friday": "Freitag",
    "saturday": "Samstag",
    "sunday": "Sonntag",
}
DAY_NAMES_EN = {
    "monday": "Monday",
    "tuesday": "Tuesday",
    "wednesday": "Wednesday",
    "thursday": "Thursday",
    "friday": "Friday",
    "saturday": "Saturday",
    "sunday": "Sunday",
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Schulnoten binary sensor entities from a config entry."""
    storage: SchoolGradesStorage = hass.data[DOMAIN][entry.entry_id]

    async_add_entities([
        SchoolGradeNextDayExamsBinarySensor(storage, entry.entry_id),
        SchoolGradeHomeworkDoneBinarySensor(storage, entry.entry_id),
        SchoolGradePreparationDoneBinarySensor(storage, entry.entry_id),
    ])


class SchoolGradeNextDayExamsBinarySensor(BinarySensorEntity):
    """Binary sensor indicating if there are calendar events/exams scheduled for the next day."""

    _attr_icon = "mdi:calendar-alert"
    _attr_has_entity_name = False
    _attr_should_poll = True

    def __init__(self, storage: SchoolGradesStorage, entry_id: str) -> None:
        """Initialize next day exams binary sensor."""
        self.storage = storage
        self.entry_id = entry_id
        self._attr_name = f"{storage.child_name} Anstehende Termine Morgen"
        self._attr_unique_id = f"school_grades_{entry_id}_next_day_exams"
        self._is_on: bool = False
        self._attributes: dict[str, Any] = {}

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info to group entities under child device."""
        return DeviceInfo(
            identifiers={(DOMAIN, self.entry_id)},
            name=f"Schulnoten ({self.storage.child_name})",
            manufacturer="Schulnoten",
            model="Notenverwaltung",
        )

    @property
    def is_on(self) -> bool:
        """Return True if there are upcoming events for next day."""
        return self._is_on

    @property
    def icon(self) -> str:
        """Return dynamic icon based on state."""
        return "mdi:bell-alert" if self._is_on else "mdi:calendar-check"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return detailed attributes for automations and TTS speech."""
        return self._attributes

    async def async_update(self) -> None:
        """Fetch calendar events and compute next day status."""
        cal_entity = self.storage.data.calendar_entity
        now_dt = dt_util.now()
        today = now_dt.date()

        # Determine target date(s):
        tomorrow = today + timedelta(days=1)
        target_dates = [tomorrow]
        if today.weekday() in (4, 5):
            days_to_monday = (7 - today.weekday()) % 7
            monday = today + timedelta(days=days_to_monday)
            if monday not in target_dates:
                target_dates.append(monday)

        matched_events: list[dict[str, Any]] = []

        if cal_entity and self.hass and self.hass.states.get(cal_entity):
            try:
                from homeassistant.components.calendar import async_get_events

                start_search = now_dt
                end_search = now_dt + timedelta(days=7)
                raw_events = await async_get_events(self.hass, cal_entity, start_search, end_search)

                for evt in raw_events:
                    start_val = getattr(evt, "start", None)
                    end_val = getattr(evt, "end", None)

                    evt_start_date = self._parse_to_date(start_val)
                    evt_end_date = self._parse_to_date(end_val)

                    if not evt_start_date:
                        continue

                    for t_date in target_dates:
                        is_match = False
                        if evt_end_date:
                            if evt_start_date <= t_date < evt_end_date or (evt_start_date == t_date and evt_end_date == t_date):
                                is_match = True
                        else:
                            if evt_start_date == t_date:
                                is_match = True

                        if is_match:
                            summary = getattr(evt, "summary", "") or getattr(evt, "title", "Termin")
                            matched_events.append({
                                "summary": summary,
                                "date": t_date.isoformat(),
                                "start": str(start_val),
                                "end": str(end_val),
                                "location": getattr(evt, "location", "") or "",
                                "description": getattr(evt, "description", "") or "",
                            })
                            break
            except Exception as err:
                _LOGGER.debug("Could not fetch calendar events in binary sensor for %s: %s", cal_entity, err)

        # Deduplicate matched events
        unique_events = []
        seen = set()
        for e in matched_events:
            key = (e["summary"], e["date"])
            if key not in seen:
                seen.add(key)
                unique_events.append(e)

        self._is_on = len(unique_events) > 0

        # Primary target date
        primary_target_date = target_dates[0] if target_dates else tomorrow
        if unique_events:
            try:
                primary_target_date = date.fromisoformat(unique_events[0]["date"])
            except Exception:
                pass

        day_key = DAY_KEYS[primary_target_date.weekday()]
        lang = getattr(getattr(self.hass, "config", None), "language", "de")
        is_en = str(lang).lower().startswith("en")
        day_name = DAY_NAMES_EN.get(day_key, day_key) if is_en else DAY_NAMES_DE.get(day_key, day_key)

        event_names = [e["summary"] for e in unique_events]
        if not event_names:
            event_titles = ""
            if is_en:
                message = f"No upcoming events for {day_name}."
            else:
                message = f"Keine anstehenden Termine für {day_name}."
        elif len(event_names) == 1:
            event_titles = event_names[0]
            if is_en:
                message = f"Tomorrow ({day_name}) there is 1 upcoming event: {event_titles}."
            else:
                message = f"Am {day_name} steht 1 Termin an: {event_titles}."
        else:
            event_titles = ", ".join(event_names[:-1]) + (" and " if is_en else " und ") + event_names[-1]
            if is_en:
                message = f"Tomorrow ({day_name}) there are {len(event_names)} upcoming events: {event_titles}."
            else:
                message = f"Am {day_name} stehen {len(event_names)} Termine an: {event_titles}."

        # Fetch timetable subjects for target day
        timetable_subjects = []
        tt = self.storage.data.timetable
        if isinstance(tt, dict) and "schedule" in tt:
            sched = tt["schedule"]
            if isinstance(sched, dict) and day_key in sched:
                day_sched = sched[day_key]
                if isinstance(day_sched, dict):
                    for slot_info in day_sched.values():
                        if isinstance(slot_info, dict) and slot_info.get("subject"):
                            subj = slot_info["subject"].strip()
                            if subj and subj not in timetable_subjects:
                                timetable_subjects.append(subj)

        self._attributes = {
            "kind_name": self.storage.child_name,
            "country": self.storage.data.country,
            "section_visibility": self.storage.data.section_visibility,
            "calendar_entity": cal_entity,
            "target_date": primary_target_date.isoformat(),
            "target_day_name": day_name,
            "event_count": len(unique_events),
            "event_names": event_names,
            "event_titles": event_titles,
            "events": unique_events,
            "message": message,
            "timetable_subjects": timetable_subjects,
        }

    def _parse_to_date(self, val: Any) -> date | None:
        """Helper to parse datetime/date object or string to datetime.date."""
        if val is None:
            return None
        if hasattr(val, "date") and callable(val.date):
            return val.date()
        if isinstance(val, date):
            return val
        if isinstance(val, str):
            try:
                date_part = val.split("T")[0]
                return date.fromisoformat(date_part)
            except Exception:
                pass
        return None

    async def async_added_to_hass(self) -> None:
        """Register update listener when added to Home Assistant."""
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_UPDATE_GRADES.format(entry_id=self.entry_id),
                self._handle_update,
            )
        )

    @callback
    def _handle_update(self) -> None:
        """Handle signal update and write state to Home Assistant."""
        self.async_schedule_update_ha_state(True)


class SchoolGradeHomeworkDoneBinarySensor(BinarySensorEntity):
    """Binary sensor indicating if homework is completed for the current day."""

    _attr_has_entity_name = False
    _attr_should_poll = True

    def __init__(self, storage: SchoolGradesStorage, entry_id: str) -> None:
        """Initialize homework done binary sensor."""
        self.storage = storage
        self.entry_id = entry_id
        self._attr_name = f"{storage.child_name} Hausaufgaben Erledigt"
        self._attr_unique_id = f"school_grades_{entry_id}_homework_done"

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info to group entities under child device."""
        return DeviceInfo(
            identifiers={(DOMAIN, self.entry_id)},
            name=f"Schulnoten ({self.storage.child_name})",
            manufacturer="Schulnoten",
            model="Notenverwaltung",
        )

    @property
    def is_on(self) -> bool:
        """Return True if homework is marked as done."""
        return self.storage.data.homework_done

    @property
    def icon(self) -> str:
        """Return dynamic icon based on state."""
        return "mdi:book-check" if self.is_on else "mdi:book-open-variant"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        return {
            "kind_name": self.storage.child_name,
            "homework_last_reset": self.storage.data.homework_last_reset,
        }

    async def async_update(self) -> None:
        """Perform daily reset check if new school day has started."""
        today_str = dt_util.now().date().isoformat()
        if self.storage.data.check_and_reset_homework_daily(today_str):
            await self.storage.async_save()

    async def async_added_to_hass(self) -> None:
        """Register update listener when added to Home Assistant."""
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_UPDATE_GRADES.format(entry_id=self.entry_id),
                self._handle_update,
            )
        )

    @callback
    def _handle_update(self) -> None:
        """Handle signal update and write state to Home Assistant."""
        self.async_schedule_update_ha_state(True)


class SchoolGradePreparationDoneBinarySensor(BinarySensorEntity):
    """Binary sensor indicating if preparation for next school day is completed."""

    _attr_has_entity_name = False
    _attr_should_poll = True

    def __init__(self, storage: SchoolGradesStorage, entry_id: str) -> None:
        """Initialize preparation done binary sensor."""
        self.storage = storage
        self.entry_id = entry_id
        self._attr_name = f"{storage.child_name} Vorbereitung Erledigt"
        self._attr_unique_id = f"school_grades_{entry_id}_preparation_done"

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info to group entities under child device."""
        return DeviceInfo(
            identifiers={(DOMAIN, self.entry_id)},
            name=f"Schulnoten ({self.storage.child_name})",
            manufacturer="Schulnoten",
            model="Notenverwaltung",
        )

    @property
    def is_on(self) -> bool:
        """Return True if preparation is marked as done."""
        return self.storage.data.preparation_done

    @property
    def icon(self) -> str:
        """Return dynamic icon based on state."""
        return "mdi:checkbox-marked-circle-outline" if self.is_on else "mdi:checkbox-blank-circle-outline"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes for automations and notifications."""
        today = dt_util.now().date()
        needed = self.storage.data.get_next_school_day_subjects(today)
        prepared = [s for s in needed if self.storage.data.prepared_subjects.get(s, False)]
        missing = [s for s in needed if not self.storage.data.prepared_subjects.get(s, False)]
        day_key, target_date = self.storage.data.get_next_school_day_date(today)
        return {
            "kind_name": self.storage.child_name,
            "target_school_day": day_key,
            "target_date": target_date.isoformat(),
            "needed_subjects": needed,
            "prepared_subjects_list": prepared,
            "missing_subjects": missing,
            "prepared_subjects": self.storage.data.prepared_subjects,
            "prepared_subjects_date": self.storage.data.prepared_subjects_date,
        }

    async def async_update(self) -> None:
        """Perform daily reset check if target school day has changed."""
        today = dt_util.now().date()
        if self.storage.data.check_and_reset_preparation_daily(today):
            await self.storage.async_save()

    async def async_added_to_hass(self) -> None:
        """Register update listener when added to Home Assistant."""
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_UPDATE_GRADES.format(entry_id=self.entry_id),
                self._handle_update,
            )
        )

    @callback
    def _handle_update(self) -> None:
        """Handle signal update and write state to Home Assistant."""
        self.async_schedule_update_ha_state(True)

