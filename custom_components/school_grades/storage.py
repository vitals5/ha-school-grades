"""Data storage and grade calculation manager for Schulnoten integration."""
from __future__ import annotations

import logging
import uuid
from datetime import date as dt_date, datetime as dt_datetime, timedelta
from typing import Any

from .const import (
    COUNTRY_GRADING_SYSTEMS,
    DEFAULT_COUNTRY,
    DEFAULT_SECTION_VISIBILITY,
    DEFAULT_SUBJECTS,
)

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY = "school_grades.{entry_id}"

DEFAULT_TIMETABLE_SLOTS = [
    {"id": "slot_1", "type": "lesson", "number": "1", "label": "1. Stunde", "start": "08:00", "end": "08:45"},
    {"id": "slot_2", "type": "lesson", "number": "2", "label": "2. Stunde", "start": "08:45", "end": "09:30"},
    {"id": "break_1", "type": "break", "label": "1. Pause", "start": "09:30", "end": "09:45"},
    {"id": "slot_3", "type": "lesson", "number": "3", "label": "3. Stunde", "start": "09:45", "end": "10:30"},
    {"id": "slot_4", "type": "lesson", "number": "4", "label": "4. Stunde", "start": "10:30", "end": "11:15"},
    {"id": "break_2", "type": "break", "label": "2. Pause", "start": "11:15", "end": "11:30"},
    {"id": "slot_5", "type": "lesson", "number": "5", "label": "5. Stunde", "start": "11:30", "end": "12:15"},
    {"id": "slot_6", "type": "lesson", "number": "6", "label": "6. Stunde", "start": "12:15", "end": "13:00"},
]


class SchoolGradesData:
    """Class to manage school grades data structure and weighted calculations."""

    def __init__(self, child_name: str, data: dict[str, Any] | None = None) -> None:
        """Initialize data manager."""
        self.child_name = child_name
        self.section_visibility: dict[str, bool] = dict(DEFAULT_SECTION_VISIBILITY)

        if data is None:
            self.country: str = DEFAULT_COUNTRY
            self.grade_level: str = ""
            self.homework_done: bool = False
            self.homework_last_reset: str = ""
            self.preparation_done: bool = False
            self.prepared_subjects: dict[str, bool] = {}
            self.prepared_subjects_date: str = ""
            self.calendar_entity: str | None = None
            self._subjects: list[str] = list(DEFAULT_SUBJECTS)
            self._grades: dict[str, list[dict[str, Any]]] = {
                subj: [] for subj in self._subjects
            }
            self.timetable: dict[str, Any] = {
                "slots": list(DEFAULT_TIMETABLE_SLOTS),
                "schedule": {},
            }
            self.timetable_version: int = 1
        else:
            self.child_name = data.get("child_name", child_name)
            self.country = str(data.get("country", DEFAULT_COUNTRY)).upper()
            if self.country not in COUNTRY_GRADING_SYSTEMS:
                self.country = DEFAULT_COUNTRY
            self.grade_level = str(data.get("grade_level", "")).strip()
            self.homework_done = bool(data.get("homework_done", False))
            self.homework_last_reset = str(data.get("homework_last_reset", ""))
            self.preparation_done = bool(data.get("preparation_done", False))
            self.prepared_subjects = data.get("prepared_subjects", {}) if isinstance(data.get("prepared_subjects"), dict) else {}
            self.prepared_subjects_date = str(data.get("prepared_subjects_date", ""))
            if "section_visibility" in data and isinstance(data["section_visibility"], dict):
                self.section_visibility.update(data["section_visibility"])
            self.calendar_entity = data.get("calendar_entity")
            self._subjects = data.get("subjects", list(DEFAULT_SUBJECTS))
            self._grades = data.get("grades", {})
            self.timetable = data.get(
                "timetable",
                {"slots": list(DEFAULT_TIMETABLE_SLOTS), "schedule": {}},
            )
            self.timetable_version = int(data.get("timetable_version", 1))
            # Ensure all subjects have an entry in grades dict
            for subj in self._subjects:
                if subj not in self._grades:
                    self._grades[subj] = []

    def to_dict(self) -> dict[str, Any]:
        """Convert data to dictionary for JSON persistence."""
        return {
            "child_name": self.child_name,
            "country": self.country,
            "grade_level": self.grade_level,
            "homework_done": self.homework_done,
            "homework_last_reset": self.homework_last_reset,
            "preparation_done": self.preparation_done,
            "prepared_subjects": self.prepared_subjects,
            "prepared_subjects_date": self.prepared_subjects_date,
            "section_visibility": self.section_visibility,
            "calendar_entity": self.calendar_entity,
            "subjects": self._subjects,
            "grades": self._grades,
            "timetable": self.timetable,
            "timetable_version": getattr(self, "timetable_version", 1),
        }

    def set_grade_level(self, grade_level: str) -> None:
        """Set or update class / grade level."""
        self.grade_level = str(grade_level).strip()

    def set_homework_done(self, state: bool) -> None:
        """Set homework done status."""
        self.homework_done = bool(state)

    def check_and_reset_homework_daily(self, current_date_str: str) -> bool:
        """Reset homework status daily if on a new date."""
        if self.homework_last_reset != current_date_str:
            self.homework_done = False
            self.homework_last_reset = current_date_str
            return True
        return False

    def get_next_school_day_date(self, ref_date: dt_date | None = None) -> tuple[str, dt_date]:
        """Return (day_key, target_date) for the next school day.

        day_key is one of: monday, tuesday, wednesday, thursday, friday.
        """
        if ref_date is None:
            ref_date = dt_date.today()

        w = ref_date.weekday()  # Monday is 0, Sunday is 6
        if w == 4:  # Friday -> Monday (+3 days)
            days_ahead = 3
            day_key = "monday"
        elif w == 5:  # Saturday -> Monday (+2 days)
            days_ahead = 2
            day_key = "monday"
        elif w == 6:  # Sunday -> Monday (+1 day)
            days_ahead = 1
            day_key = "monday"
        else:  # Monday (0) -> Tue, etc.
            day_keys = ["monday", "tuesday", "wednesday", "thursday", "friday"]
            days_ahead = 1
            day_key = day_keys[w + 1]

        target_date = ref_date + timedelta(days=days_ahead)
        return day_key, target_date

    def get_next_school_day_subjects(self, ref_date: dt_date | None = None) -> list[str]:
        """Return unique list of subjects on the timetable for the next school day."""
        day_key, _ = self.get_next_school_day_date(ref_date)
        timetable = self.timetable or {}
        slots = timetable.get("slots", [])
        schedule = timetable.get("schedule", {})

        needed: list[str] = []
        slot_ids = [s.get("id") for s in slots if s.get("type") != "break"]
        for sid in schedule.keys():
            if sid not in slot_ids:
                slot_ids.append(sid)

        for slot_id in slot_ids:
            cell = schedule.get(slot_id, {}).get(day_key, {})
            subj = str(cell.get("subject", "")).strip()
            if subj and subj not in needed:
                needed.append(subj)
        return needed

    def check_and_reset_preparation_daily(
        self, ref_date: dt_date | None = None, target_date_str: str = ""
    ) -> bool:
        """Reset preparation status if target school date has changed."""
        if not target_date_str:
            _, target_date = self.get_next_school_day_date(ref_date)
            target_date_str = target_date.isoformat()

        if self.prepared_subjects_date != target_date_str:
            self.prepared_subjects = {}
            self.prepared_subjects_date = target_date_str
            self.preparation_done = False
            return True
        return False

    def set_preparation_done(
        self, state: bool, ref_date: dt_date | None = None, target_date_str: str = ""
    ) -> None:
        """Set overall preparation done status programmatically."""
        self.check_and_reset_preparation_daily(ref_date, target_date_str)
        self.preparation_done = bool(state)
        # Sync all timetable subjects for the target school day
        needed = self.get_next_school_day_subjects(ref_date)
        for s in needed:
            self.prepared_subjects[s] = bool(state)

    def toggle_prepared_subject(
        self,
        subject: str,
        state: bool | None = None,
        target_date_str: str = "",
        ref_date: dt_date | None = None,
    ) -> bool:
        """Toggle or set preparation status for a single subject and auto-update overall status."""
        self.check_and_reset_preparation_daily(ref_date, target_date_str)

        clean_subj = subject.strip()
        if not clean_subj:
            return False

        if state is None:
            new_val = not self.prepared_subjects.get(clean_subj, False)
        else:
            new_val = bool(state)

        self.prepared_subjects[clean_subj] = new_val

        # Check if all needed subjects for next school day are prepared
        needed_subjects = self.get_next_school_day_subjects(ref_date)
        if needed_subjects:
            self.preparation_done = all(
                self.prepared_subjects.get(s, False) for s in needed_subjects
            )
        else:
            self.preparation_done = new_val

        return new_val

    def get_current_school_status(
        self, ref_dt: dt_datetime | None = None
    ) -> tuple[bool, dict[str, Any]]:
        """Determine if a school lesson is currently active and return detailed status.

        Returns:
            (is_school_time, attributes_dict)
            is_school_time is True only if a lesson with a scheduled subject is currently running.
            is_school_time is False during breaks, free periods, after/before school, or on weekends.
        """
        if ref_dt is None:
            ref_dt = dt_datetime.now()

        weekday = ref_dt.weekday()
        day_keys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        day_key = day_keys[weekday]

        base_attrs: dict[str, Any] = {
            "kind_name": self.child_name,
            "is_school_time": False,
            "current_subject": None,
            "current_room": None,
            "current_teacher": None,
            "current_slot": None,
            "current_slot_start": None,
            "current_slot_end": None,
            "is_break": False,
            "is_free_period": False,
            "is_school_day": False,
            "school_finished": False,
            "before_school": False,
            "school_day_start": None,
            "school_day_end": None,
            "next_subject": None,
            "next_slot": None,
            "next_slot_start": None,
            "lessons_today": [],
            "weekday": day_key,
        }

        # Weekend: Saturday (5) or Sunday (6)
        if weekday >= 5:
            return False, base_attrs

        timetable = self.timetable if isinstance(self.timetable, dict) else {}
        slots = timetable.get("slots", [])
        schedule = timetable.get("schedule", {})

        if not slots or not isinstance(slots, list):
            return False, base_attrs

        def _to_mins(time_str: Any) -> int | None:
            if not isinstance(time_str, str) or ":" not in time_str:
                return None
            try:
                parts = time_str.strip().split(":")
                return int(parts[0]) * 60 + int(parts[1])
            except (ValueError, IndexError):
                return None

        current_minutes = ref_dt.hour * 60 + ref_dt.minute

        # Parse slots and sort by start time
        parsed_slots: list[dict[str, Any]] = []
        for slot in slots:
            if not isinstance(slot, dict):
                continue
            s_min = _to_mins(slot.get("start"))
            e_min = _to_mins(slot.get("end"))
            if s_min is not None and e_min is not None and s_min < e_min:
                parsed_slots.append({
                    "id": str(slot.get("id", "")),
                    "type": str(slot.get("type", "lesson")),
                    "label": str(slot.get("label", "")),
                    "number": str(slot.get("number", "")),
                    "start": str(slot.get("start", "")),
                    "end": str(slot.get("end", "")),
                    "start_m": s_min,
                    "end_m": e_min,
                })
        parsed_slots.sort(key=lambda s: s["start_m"])

        if not parsed_slots:
            return False, base_attrs

        # Gather scheduled lessons for today
        lessons_today: list[dict[str, Any]] = []
        earliest_lesson_start: int | None = None
        latest_lesson_end: int | None = None

        for s in parsed_slots:
            slot_id = s["id"]
            is_break_type = (s["type"] == "break") or ("pause" in s["label"].lower())
            cell = schedule.get(slot_id, {}).get(day_key, {}) if isinstance(schedule, dict) else {}
            subj = str(cell.get("subject", "")).strip()
            room = str(cell.get("room", "")).strip()
            teacher = str(cell.get("teacher", "")).strip()

            if not is_break_type and subj:
                lessons_today.append({
                    "slot_id": slot_id,
                    "slot_label": s["label"],
                    "subject": subj,
                    "room": room,
                    "teacher": teacher,
                    "start": s["start"],
                    "end": s["end"],
                    "start_m": s["start_m"],
                    "end_m": s["end_m"],
                })
                if earliest_lesson_start is None or s["start_m"] < earliest_lesson_start:
                    earliest_lesson_start = s["start_m"]
                if latest_lesson_end is None or s["end_m"] > latest_lesson_end:
                    latest_lesson_end = s["end_m"]

        is_school_day = len(lessons_today) > 0
        base_attrs["is_school_day"] = is_school_day
        base_attrs["lessons_today"] = [l["subject"] for l in lessons_today]

        if earliest_lesson_start is not None:
            base_attrs["school_day_start"] = f"{earliest_lesson_start // 60:02d}:{earliest_lesson_start % 60:02d}"
        if latest_lesson_end is not None:
            base_attrs["school_day_end"] = f"{latest_lesson_end // 60:02d}:{latest_lesson_end % 60:02d}"

        # If no lessons today at all
        if not is_school_day:
            return False, base_attrs

        # Check if before earliest lesson
        if earliest_lesson_start is not None and current_minutes < earliest_lesson_start:
            base_attrs["before_school"] = True
            base_attrs["next_subject"] = lessons_today[0]["subject"]
            base_attrs["next_slot"] = lessons_today[0]["slot_label"]
            base_attrs["next_slot_start"] = lessons_today[0]["start"]
            return False, base_attrs

        # Check if after latest lesson
        if latest_lesson_end is not None and current_minutes >= latest_lesson_end:
            base_attrs["school_finished"] = True
            return False, base_attrs

        # Find current slot
        current_slot_info: dict[str, Any] | None = None
        for s in parsed_slots:
            if s["start_m"] <= current_minutes < s["end_m"]:
                current_slot_info = s
                break

        # Find next upcoming lesson today
        for lesson in lessons_today:
            if lesson["start_m"] > current_minutes:
                base_attrs["next_subject"] = lesson["subject"]
                base_attrs["next_slot"] = lesson["slot_label"]
                base_attrs["next_slot_start"] = lesson["start"]
                break

        if current_slot_info is not None:
            slot_id = current_slot_info["id"]
            is_break_type = (current_slot_info["type"] == "break") or ("pause" in current_slot_info["label"].lower())
            base_attrs["current_slot"] = current_slot_info["label"]
            base_attrs["current_slot_start"] = current_slot_info["start"]
            base_attrs["current_slot_end"] = current_slot_info["end"]

            if is_break_type:
                base_attrs["is_break"] = True
                base_attrs["is_school_time"] = False
                return False, base_attrs

            cell = schedule.get(slot_id, {}).get(day_key, {}) if isinstance(schedule, dict) else {}
            subj = str(cell.get("subject", "")).strip()
            if subj:
                base_attrs["is_school_time"] = True
                base_attrs["current_subject"] = subj
                base_attrs["current_room"] = str(cell.get("room", "")).strip() or None
                base_attrs["current_teacher"] = str(cell.get("teacher", "")).strip() or None
                return True, base_attrs
            else:
                # Free period (Freistunde)
                base_attrs["is_free_period"] = True
                base_attrs["is_school_time"] = False
                return False, base_attrs

        # If between slots (e.g. gap)
        base_attrs["is_school_time"] = False
        return False, base_attrs

    def set_section_visibility(self, visibility_dict: dict[str, Any]) -> None:
        """Update section visibility toggles."""
        for k, v in visibility_dict.items():
            if k in self.section_visibility:
                self.section_visibility[k] = bool(v)

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
            import copy
            self.timetable = copy.deepcopy(timetable_data)
            self.timetable_version = getattr(self, "timetable_version", 1) + 1

    def update_timetable_cell(
        self, slot_id: str, day: str, subject: str, room: str = "", teacher: str = ""
    ) -> None:
        """Update or clear a single cell in the timetable matrix."""
        import copy
        new_timetable = copy.deepcopy(self.timetable)
        if "schedule" not in new_timetable or not isinstance(new_timetable["schedule"], dict):
            new_timetable["schedule"] = {}
        if slot_id not in new_timetable["schedule"]:
            new_timetable["schedule"][slot_id] = {}

        clean_subj = str(subject or "").strip()
        clean_day = str(day or "").strip().lower()
        if not clean_subj:
            new_timetable["schedule"][slot_id].pop(clean_day, None)
        else:
            new_timetable["schedule"][slot_id][clean_day] = {
                "subject": clean_subj,
                "room": str(room or "").strip(),
                "teacher": str(teacher or "").strip(),
            }
            # Automatically register new subject in child's subjects list if not yet present
            if clean_subj not in self._subjects:
                self._subjects.append(clean_subj)
                if clean_subj not in self._grades:
                    self._grades[clean_subj] = []

        self.timetable = new_timetable
        self.timetable_version = getattr(self, "timetable_version", 1) + 1

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
                            subj = str(cell.get("subject", "") or "").strip()
                            normalized_schedule.setdefault(str(slot_id), {})[day] = {
                                "subject": subj,
                                "room": str(cell.get("room", "") or "").strip(),
                                "teacher": str(cell.get("teacher", "") or "").strip(),
                            }
                            if subj and subj not in self._subjects:
                                self._subjects.append(subj)
                                if subj not in self._grades:
                                    self._grades[subj] = []
                else:
                    # Format: schedule[slot_1][monday] = {subject: "Mathe"}
                    slot_id = str(key1)
                    for day_key, cell in val1.items():
                        day = str(day_key).lower()
                        if isinstance(cell, dict) and day in valid_days:
                            subj = str(cell.get("subject", "") or "").strip()
                            normalized_schedule.setdefault(slot_id, {})[day] = {
                                "subject": subj,
                                "room": str(cell.get("room", "") or "").strip(),
                                "teacher": str(cell.get("teacher", "") or "").strip(),
                            }
                            if subj and subj not in self._subjects:
                                self._subjects.append(subj)
                                if subj not in self._grades:
                                    self._grades[subj] = []

            new_timetable["schedule"] = normalized_schedule

        self.timetable = new_timetable
        self.timetable_version = getattr(self, "timetable_version", 1) + 1
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
