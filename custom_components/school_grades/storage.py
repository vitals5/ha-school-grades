"""Data storage and grade calculation manager for Schulnoten integration."""
from __future__ import annotations

import logging
import uuid
from datetime import date as dt_date
from typing import Any

from .const import COUNTRY_GRADING_SYSTEMS, DEFAULT_COUNTRY, DEFAULT_SUBJECTS

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY = "school_grades.{entry_id}"

DEFAULT_TIMETABLE_SLOTS = [
    {"id": "s1", "type": "lesson", "number": 1, "start": "08:00", "end": "08:45"},
    {"id": "s2", "type": "lesson", "number": 2, "start": "08:45", "end": "09:30"},
    {"id": "b1", "type": "break", "label": "1. Pause", "start": "09:30", "end": "09:50"},
    {"id": "s3", "type": "lesson", "number": 3, "start": "09:50", "end": "10:35"},
    {"id": "s4", "type": "lesson", "number": 4, "start": "10:35", "end": "11:20"},
    {"id": "b2", "type": "break", "label": "2. Pause", "start": "11:20", "end": "11:40"},
    {"id": "s5", "type": "lesson", "number": 5, "start": "11:40", "end": "12:25"},
    {"id": "s6", "type": "lesson", "number": 6, "start": "12:25", "end": "13:10"},
]


class SchoolGradesData:
    """Class to manage school grades data structure and weighted calculations."""

    def __init__(self, child_name: str, data: dict[str, Any] | None = None) -> None:
        """Initialize data manager."""
        self.child_name = child_name
        if data is None:
            self.country: str = DEFAULT_COUNTRY
            self.calendar_entity: str | None = None
            self._subjects: list[str] = list(DEFAULT_SUBJECTS)
            self._grades: dict[str, list[dict[str, Any]]] = {
                subj: [] for subj in self._subjects
            }
            self.timetable: dict[str, Any] = {
                "slots": list(DEFAULT_TIMETABLE_SLOTS),
                "schedule": {},
            }
        else:
            self.child_name = data.get("child_name", child_name)
            self.country = str(data.get("country", DEFAULT_COUNTRY)).upper()
            if self.country not in COUNTRY_GRADING_SYSTEMS:
                self.country = DEFAULT_COUNTRY
            self.calendar_entity = data.get("calendar_entity")
            self._subjects = data.get("subjects", list(DEFAULT_SUBJECTS))
            self._grades = data.get("grades", {})
            self.timetable = data.get(
                "timetable",
                {"slots": list(DEFAULT_TIMETABLE_SLOTS), "schedule": {}},
            )
            # Ensure all subjects have an entry in grades dict
            for subj in self._subjects:
                if subj not in self._grades:
                    self._grades[subj] = []

    def to_dict(self) -> dict[str, Any]:
        """Convert data to dictionary for JSON persistence."""
        return {
            "child_name": self.child_name,
            "country": self.country,
            "calendar_entity": self.calendar_entity,
            "subjects": self._subjects,
            "grades": self._grades,
            "timetable": self.timetable,
        }

    def set_country(self, country_code: str) -> bool:
        """Set or update country code."""
        code_upper = str(country_code).strip().upper()
        if code_upper in COUNTRY_GRADING_SYSTEMS:
            self.country = code_upper
            return True
        return False

    def set_calendar_entity(self, calendar_entity: str | None) -> None:
        """Set or update assigned calendar entity."""
        if calendar_entity:
            clean_cal = str(calendar_entity).strip()
            self.calendar_entity = clean_cal if clean_cal else None
        else:
            self.calendar_entity = None

    def update_timetable(self, timetable_data: dict[str, Any]) -> None:
        """Update timetable slots and schedule data."""
        if isinstance(timetable_data, dict):
            self.timetable = timetable_data

    def update_timetable_cell(
        self, slot_id: str, day: str, subject: str, room: str = "", teacher: str = ""
    ) -> None:
        """Update or clear a single cell in the timetable matrix."""
        if "schedule" not in self.timetable or not isinstance(self.timetable["schedule"], dict):
            self.timetable["schedule"] = {}
        if slot_id not in self.timetable["schedule"]:
            self.timetable["schedule"][slot_id] = {}

        clean_subj = subject.strip()
        if not clean_subj:
            self.timetable["schedule"][slot_id].pop(day, None)
        else:
            self.timetable["schedule"][slot_id][day] = {
                "subject": clean_subj,
                "room": room.strip(),
                "teacher": teacher.strip(),
            }

    def import_timetable_data(self, timetable_data: dict[str, Any]) -> bool:
        """Import a full timetable configuration (parsed from YAML or dict)."""
        if not isinstance(timetable_data, dict):
            return False

        import copy
        new_timetable = copy.deepcopy(self.timetable)

        if "slots" in timetable_data and isinstance(timetable_data["slots"], list):
            new_timetable["slots"] = timetable_data["slots"]

        if "schedule" in timetable_data and isinstance(timetable_data["schedule"], dict):
            raw_schedule = timetable_data["schedule"]
            normalized_schedule: dict[str, Any] = {}
            valid_days = {"monday", "tuesday", "wednesday", "thursday", "friday"}

            for key1, val1 in raw_schedule.items():
                if not isinstance(val1, dict):
                    continue
                k1_lower = str(key1).lower()

                if k1_lower in valid_days:
                    # Format: schedule[monday][slot_1] = {subject: "Mathe"}
                    day = k1_lower
                    for slot_id, cell in val1.items():
                        if isinstance(cell, dict):
                            normalized_schedule.setdefault(str(slot_id), {})[day] = {
                                "subject": str(cell.get("subject", "") or "").strip(),
                                "room": str(cell.get("room", "") or "").strip(),
                                "teacher": str(cell.get("teacher", "") or "").strip(),
                            }
                else:
                    # Format: schedule[slot_1][monday] = {subject: "Mathe"}
                    slot_id = str(key1)
                    for day_key, cell in val1.items():
                        day = str(day_key).lower()
                        if isinstance(cell, dict) and day in valid_days:
                            normalized_schedule.setdefault(slot_id, {})[day] = {
                                "subject": str(cell.get("subject", "") or "").strip(),
                                "room": str(cell.get("room", "") or "").strip(),
                                "teacher": str(cell.get("teacher", "") or "").strip(),
                            }

            new_timetable["schedule"] = normalized_schedule

        self.timetable = new_timetable
        return True


    @property
    def subjects(self) -> list[str]:
        """Get sorted list of subject names."""
        return sorted(self._subjects)

    def add_subject(self, subject: str) -> bool:
        """Add a new subject if it does not exist."""
        clean_subj = subject.strip()
        if not clean_subj or clean_subj in self._subjects:
            return False
        self._subjects.append(clean_subj)
        self._grades[clean_subj] = []
        return True

    def remove_subject(self, subject: str) -> bool:
        """Remove a subject and all its recorded grades."""
        clean_subj = subject.strip()
        if clean_subj not in self._subjects:
            return False
        self._subjects.remove(clean_subj)
        self._grades.pop(clean_subj, None)
        return True

    def add_grade(
        self,
        subject: str,
        grade: float,
        weight: float = 1.0,
        name: str = "",
        date_str: str | None = None,
    ) -> dict[str, Any] | None:
        """Add a grade to a subject with weight and optional metadata."""
        clean_subj = subject.strip()
        if clean_subj not in self._subjects:
            # Automatically create subject if missing
            self.add_subject(clean_subj)

        if not date_str:
            date_str = dt_date.today().isoformat()

        grade_entry = {
            "id": str(uuid.uuid4())[:8],
            "grade": round(float(grade), 2),
            "weight": round(float(weight), 2),
            "name": name.strip(),
            "date": str(date_str),
        }
        self._grades[clean_subj].append(grade_entry)
        return grade_entry

    def remove_grade(self, subject: str, grade_id: str) -> bool:
        """Remove a grade entry by ID."""
        clean_subj = subject.strip()
        if clean_subj not in self._grades:
            return False

        initial_len = len(self._grades[clean_subj])
        self._grades[clean_subj] = [
            g for g in self._grades[clean_subj] if str(g.get("id")) != str(grade_id)
        ]
        return len(self._grades[clean_subj]) < initial_len

    def get_grades(self, subject: str) -> list[dict[str, Any]]:
        """Get grade history for a subject as a fresh copy to trigger HA state change detection."""
        grades = self._grades.get(subject.strip(), [])
        return [dict(g) for g in grades]

    def calculate_subject_average(self, subject: str) -> float | None:
        """Calculate weighted arithmetic mean for a single subject.

        Formula: sum(grade * weight) / sum(weight)
        Returns None if no grades exist for the subject.
        """
        grades = self.get_grades(subject)
        if not grades:
            return None

        try:
            total_points = 0.0
            total_weights = 0.0
            for g in grades:
                g_val = float(g.get("grade", 0))
                w_val = float(g.get("weight", 1.0))
                total_points += g_val * w_val
                total_weights += w_val

            if total_weights <= 0:
                return None

            return round(total_points / total_weights, 2)
        except Exception as err:
            _LOGGER.error("Error calculating average for %s: %s", subject, err)
            return None

    def calculate_total_average(self) -> float | None:
        """Calculate overall average across all subjects with available averages.

        Returns None if no subjects have grades.
        """
        try:
            subject_averages = [
                self.calculate_subject_average(subj)
                for subj in self._subjects
            ]
            valid_averages = [avg for avg in subject_averages if avg is not None]

            if not valid_averages:
                return None

            return round(sum(valid_averages) / len(valid_averages), 2)
        except Exception as err:
            _LOGGER.error("Error calculating total average: %s", err)
            return None


class SchoolGradesStorage:
    """Home Assistant Store wrapper for SchoolGradesData."""

    def __init__(self, hass: Any, entry_id: str, child_name: str) -> None:
        """Initialize storage wrapper."""
        self.hass = hass
        self.entry_id = entry_id
        self.child_name = child_name
        self.data = SchoolGradesData(child_name)
        self._store: Any = None
        try:
            from homeassistant.helpers.storage import Store
            self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY.format(entry_id=entry_id))
        except Exception:
            _LOGGER.debug("Home Assistant Store not loaded in test environment")

    async def async_load(self) -> None:
        """Load data from Home Assistant storage file."""
        if self._store is None:
            return
        try:
            raw_data = await self._store.async_load()
            if raw_data:
                self.data = SchoolGradesData(self.child_name, raw_data)
                _LOGGER.info("Successfully loaded school grades storage for %s", self.child_name)
        except Exception as err:
            _LOGGER.error("Failed to load school grades storage for %s: %s", self.child_name, err)

    async def async_save(self) -> None:
        """Save current data to Home Assistant storage file."""
        if self._store is None:
            return
        try:
            await self._store.async_save(self.data.to_dict())
            _LOGGER.debug("Successfully saved school grades storage for %s", self.child_name)
        except Exception as err:
            _LOGGER.error("Failed to save school grades storage for %s: %s", self.child_name, err)
