"""Data storage and grade calculation manager for Schulnoten integration."""
from __future__ import annotations

import logging
import uuid
from datetime import date as dt_date
from typing import Any

from .const import DEFAULT_SUBJECTS

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY = "school_grades.{entry_id}"


class SchoolGradesData:
    """Class to manage school grades data structure and weighted calculations."""

    def __init__(self, child_name: str, data: dict[str, Any] | None = None) -> None:
        """Initialize data manager."""
        self.child_name = child_name
        if data is None:
            self.calendar_entity: str | None = None
            self._subjects: list[str] = list(DEFAULT_SUBJECTS)
            self._grades: dict[str, list[dict[str, Any]]] = {
                subj: [] for subj in self._subjects
            }
        else:
            self.child_name = data.get("child_name", child_name)
            self.calendar_entity = data.get("calendar_entity")
            self._subjects = data.get("subjects", list(DEFAULT_SUBJECTS))
            self._grades = data.get("grades", {})
            # Ensure all subjects have an entry in grades dict
            for subj in self._subjects:
                if subj not in self._grades:
                    self._grades[subj] = []

    def to_dict(self) -> dict[str, Any]:
        """Convert data to dictionary for JSON persistence."""
        return {
            "child_name": self.child_name,
            "calendar_entity": self.calendar_entity,
            "subjects": self._subjects,
            "grades": self._grades,
        }

    def set_calendar_entity(self, calendar_entity: str | None) -> None:
        """Set or update assigned calendar entity."""
        if calendar_entity:
            clean_cal = str(calendar_entity).strip()
            self.calendar_entity = clean_cal if clean_cal else None
        else:
            self.calendar_entity = None

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
