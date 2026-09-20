"""Sensor platform for Schulnoten (School Grades) integration."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import slugify

from .const import DOMAIN, SIGNAL_UPDATE_GRADES
from .storage import SchoolGradesStorage

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Schulnoten sensor entities from a config entry."""
    storage: SchoolGradesStorage = hass.data[DOMAIN][entry.entry_id]

    known_subjects: set[str] = set()

    @callback
    def update_entities() -> None:
        """Add new entities if new subjects were added."""
        new_entities: list[SensorEntity] = []

        current_subjects = set(storage.data.subjects)
        missing_subjects = current_subjects - known_subjects

        for subj in missing_subjects:
            known_subjects.add(subj)
            new_entities.append(
                SchoolGradeSubjectSensor(storage, entry.entry_id, subj)
            )

        if new_entities:
            async_add_entities(new_entities)

    # Register Total Average Sensor & Initial Subject Sensors
    initial_entities: list[SensorEntity] = [
        SchoolGradeTotalSensor(storage, entry.entry_id)
    ]

    for subj in storage.data.subjects:
        known_subjects.add(subj)
        initial_entities.append(
            SchoolGradeSubjectSensor(storage, entry.entry_id, subj)
        )

    async_add_entities(initial_entities)

    # Listen for update signals on ConfigEntry to dynamically add subject sensors
    entry.async_on_unload(
        async_dispatcher_connect(
            hass,
            SIGNAL_UPDATE_GRADES.format(entry_id=entry.entry_id),
            update_entities,
        )
    )


class SchoolGradeSubjectSensor(SensorEntity):
    """Sensor representing the weighted average grade for a specific subject."""

    _attr_icon = "mdi:school"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_has_entity_name = False

    def __init__(
        self, storage: SchoolGradesStorage, entry_id: str, subject: str
    ) -> None:
        """Initialize subject sensor."""
        self.storage = storage
        self.entry_id = entry_id
        self.subject = subject
        self._attr_name = f"{storage.child_name} {subject} Durchschnitt"
        self._attr_unique_id = f"school_grades_{entry_id}_{slugify(subject)}"

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
    def native_value(self) -> float | None:
        """Return average grade as native state value."""
        return self.storage.data.calculate_subject_average(self.subject)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return detailed grade history and subject attributes."""
        grades = self.storage.data.get_grades(self.subject)
        return {
            "kind_name": self.storage.child_name,
            "subject_name": self.subject,
            "grade_count": len(grades),
            "grades": grades,
        }

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
        if self.subject not in self.storage.data.subjects:
            self.hass.async_create_task(self.async_remove())
            return
        self.async_schedule_update_ha_state(True)


class SchoolGradeTotalSensor(SensorEntity):
    """Sensor representing the overall average grade across all subjects."""

    _attr_icon = "mdi:calculator-variant"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_has_entity_name = False

    def __init__(self, storage: SchoolGradesStorage, entry_id: str) -> None:
        """Initialize total average sensor."""
        self.storage = storage
        self.entry_id = entry_id
        self._attr_name = f"{storage.child_name} Gesamtdurchschnitt"
        self._attr_unique_id = f"school_grades_{entry_id}_gesamtdurchschnitt"

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
    def native_value(self) -> float | None:
        """Return total weighted average as native state value."""
        return self.storage.data.calculate_total_average()

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return summary of all subject averages, assigned calendar entity, and timetable."""
        return {
            "kind_name": self.storage.child_name,
            "calendar_entity": self.storage.data.calendar_entity,
            "timetable": self.storage.data.timetable,
            "subjects_summary": {
                subj: self.storage.data.calculate_subject_average(subj)
                for subj in self.storage.data.subjects
            },
        }

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
