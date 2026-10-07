"""Data storage and grade calculation manager for Schulnoten integration."""
from __future__ import annotations

import logging
import re
import uuid
from datetime import date as dt_date, datetime as dt_datetime, time as dt_time, timedelta
from typing import Any

from .const import (
    COUNTRY_GRADING_SYSTEMS,
    DEFAULT_COUNTRY,
    DEFAULT_SECTION_VISIBILITY,
    DEFAULT_SUBJECTS,
    DEFAULT_SUBJECT_ALIASES,
    DEFAULT_TIMETABLE_SLOTS,
)
try:
    from .portal import (
        school_from_input,
        resolve_subject_name,
        resolve_subject_with_index,
        parse_subject_aliases_yaml,
        dump_subject_aliases_yaml,
    )
except Exception:
    def school_from_input(value: str) -> str:
        val = value.strip().lower()
        if "eltern-portal.org" in val:
            if "://" not in val:
                val = f"https://{val}"
            from urllib import parse
            return (parse.urlparse(val).hostname or "").split(".")[0]
        return val.split("/")[0].strip()

    def resolve_subject_name(raw_name: str, aliases_dict=None, existing_subjects=None) -> str:
        return raw_name.strip()

    def resolve_subject_with_index(raw_name: str, aliases_dict=None, existing_subjects=None) -> tuple[str, int | None]:
        return (raw_name.strip(), None)

    def parse_subject_aliases_yaml(yaml_text: str) -> dict[str, list[str]]:
        return dict(DEFAULT_SUBJECT_ALIASES)

    def dump_subject_aliases_yaml(aliases: dict[str, list[str]]) -> str:
        return ""

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY = "school_grades.{entry_id}"


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
            # Eltern-Portal fields
            self.portal_enabled: bool = False
            self.portal_school: str = ""
            self.portal_username: str = ""
            self.portal_password: str = ""
            self.portal_student_id: str = ""
            self.portal_student_name: str = ""
            self.portal_sync_timetable: bool = False
            self.portal_sync_substitutions: bool = True
            self.portal_sync_exams: bool = True
            self.portal_ignore_info_events: bool = False
            self.portal_last_sync: str = ""
            self.portal_last_status: str = ""
            self.subject_aliases: dict[str, list[str]] = dict(DEFAULT_SUBJECT_ALIASES)
            self.portal_substitutions: dict[str, Any] = {"days": [], "stand": None, "available": False}
            self.portal_appointments: list[dict[str, Any]] = []
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
            # Eltern-Portal fields
            self.portal_enabled = bool(data.get("portal_enabled", False))
            self.portal_school = school_from_input(str(data.get("portal_school", "")))
            self.portal_username = str(data.get("portal_username", ""))
            self.portal_password = str(data.get("portal_password", ""))
            self.portal_student_id = str(data.get("portal_student_id", ""))
            self.portal_student_name = str(data.get("portal_student_name", ""))
            self.portal_sync_timetable = bool(data.get("portal_sync_timetable", False))
            self.portal_sync_substitutions = bool(data.get("portal_sync_substitutions", True))
            self.portal_sync_exams = bool(data.get("portal_sync_exams", True))
            self.portal_ignore_info_events = bool(data.get("portal_ignore_info_events", False))
            self.portal_last_sync = str(data.get("portal_last_sync", ""))
            self.portal_last_status = str(data.get("portal_last_status", ""))
            raw_aliases = data.get("subject_aliases")
            if isinstance(raw_aliases, dict):
                self.subject_aliases = {
                    str(k): [str(x) for x in v] if isinstance(v, list) else []
                    for k, v in raw_aliases.items()
                }
            else:
                self.subject_aliases = dict(DEFAULT_SUBJECT_ALIASES)
            self.portal_substitutions = data.get(
                "portal_substitutions",
                {"days": [], "stand": None, "available": False},
            )
            if not isinstance(self.portal_substitutions, dict):
                self.portal_substitutions = {"days": [], "stand": None, "available": False}
            raw_appointments = data.get("portal_appointments")
            if isinstance(raw_appointments, list):
                self.portal_appointments = [dict(a) for a in raw_appointments if isinstance(a, dict)]
            else:
                self.portal_appointments = []
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
            "portal_enabled": self.portal_enabled,
            "portal_school": self.portal_school,
            "portal_username": self.portal_username,
            "portal_password": self.portal_password,
            "portal_student_id": self.portal_student_id,
            "portal_student_name": self.portal_student_name,
            "portal_sync_timetable": self.portal_sync_timetable,
            "portal_sync_substitutions": self.portal_sync_substitutions,
            "portal_sync_exams": self.portal_sync_exams,
            "portal_ignore_info_events": self.portal_ignore_info_events,
            "portal_last_sync": self.portal_last_sync,
            "portal_last_status": self.portal_last_status,
            "subject_aliases": self.subject_aliases,
            "portal_substitutions": self.portal_substitutions,
            "portal_appointments": self.portal_appointments,
        }

    def set_subject_aliases(self, aliases_dict_or_yaml: dict[str, list[str]] | str) -> None:
        """Update subject aliases dictionary from dict or YAML string."""
        if isinstance(aliases_dict_or_yaml, str):
            self.subject_aliases = parse_subject_aliases_yaml(aliases_dict_or_yaml)
        elif isinstance(aliases_dict_or_yaml, dict):
            clean: dict[str, list[str]] = {}
            for k, v in aliases_dict_or_yaml.items():
                s = str(k).strip()
                if not s:
                    continue
                if isinstance(v, list):
                    clean[s] = [str(x).strip() for x in v if str(x).strip()]
                elif isinstance(v, str):
                    clean[s] = [x.strip() for x in v.split(",") if x.strip()]
                else:
                    clean[s] = []
            self.subject_aliases = clean

    def get_subject_aliases_yaml(self) -> str:
        """Return subject aliases formatted as YAML string."""
        return dump_subject_aliases_yaml(self.subject_aliases)

    def resolve_subject(self, raw_name: str) -> str:
        """Resolve a raw subject abbreviation using child's aliases and subject list."""
        return resolve_subject_name(raw_name, self.subject_aliases, self._subjects)

    def resolve_subject_with_index(self, raw_name: str) -> tuple[str, int | None]:
        """Resolve a raw subject abbreviation and return matched index if slash-separated."""
        return resolve_subject_with_index(raw_name, self.subject_aliases, self._subjects)

    def is_substitution_relevant_for_child(
        self, entry: dict[str, Any], date_str: str | dt_date | None = None
    ) -> bool:
        """Check if a substitution entry applies to this child.

        If the substitution is for a subject that the child does not take
        (e.g., Evangelisch when child only takes Catholic Religion), it returns False.
        """
        subj_raw = str(entry.get("subject", "")).strip()
        subj_res = str(entry.get("subject_resolved", "")).strip()
        old_subj_raw = str(entry.get("old_subject", "")).strip()
        old_subj_res = str(entry.get("old_subject_resolved", "")).strip()

        if not subj_res and subj_raw:
            subj_res = self.resolve_subject(subj_raw)
        if not old_subj_res and old_subj_raw:
            old_subj_res = self.resolve_subject(old_subj_raw)

        # If no subject is mentioned at all, it's a general class event/cancellation
        if not subj_raw and not subj_res and not old_subj_raw and not old_subj_res:
            return True

        child_subjects = [s.strip().lower() for s in (self._subjects or []) if s.strip()]
        if not child_subjects:
            return True

        # Collect raw candidates and expand tokens (e.g. 'Sm Sm', 'Sm (Fb)')
        base_cands = [s for s in [subj_res, subj_raw, old_subj_res, old_subj_raw] if s]
        cands: list[str] = []
        for c in base_cands:
            if c not in cands:
                cands.append(c)
            no_dig = re.sub(r"\d+$", "", c).strip()
            if no_dig and no_dig not in cands:
                cands.append(no_dig)
            toks = [t.strip() for t in re.split(r"[\s\-_–➔>(),/]+", c) if t.strip()]
            for t in toks:
                if t not in cands:
                    cands.append(t)
                t_no_dig = re.sub(r"\d+$", "", t).strip()
                if t_no_dig and t_no_dig not in cands:
                    cands.append(t_no_dig)

        # Religion branch filter: if substitution is specifically for a religion branch
        # the child does not attend (e.g. single 'Ev' or 'Eth' for Catholic student), reject.
        # Note: Do not reject slash subjects (e.g. 'Eth/K/Ev') where the child's branch was resolved.
        if "/" not in subj_raw and "/" not in old_subj_raw:
            is_ev_subst = any(
                "evangelisch" in c.lower() or c.lower() in ("ev", "evrel", "er", "evan")
                for c in cands
            )
            is_eth_subst = any(
                "ethik" in c.lower() or c.lower() in ("eth",)
                for c in cands
            )
            is_kat_subst = any(
                "katholisch" in c.lower() or c.lower() in ("k", "rk", "kk", "katrel", "kr")
                for c in cands
            )

            child_has_ev = any("evangelisch" in cs or cs == "ev" for cs in child_subjects)
            child_has_eth = any("ethik" in cs or cs == "eth" for cs in child_subjects)
            child_has_kat = any("katholisch" in cs or "religion" in cs or cs == "k" for cs in child_subjects)

            if is_ev_subst and not child_has_ev:
                return False
            if is_eth_subst and not child_has_eth:
                return False
            if is_kat_subst and not child_has_kat:
                return False

        for c in cands:
            c_l = c.lower()
            if any(c_l == cs for cs in child_subjects):
                return True

            # Check if cand is an alias for an enrolled subject
            for s in self._subjects:
                s_aliases = list(self.subject_aliases.get(s, []))
                if not s_aliases:
                    s_aliases = DEFAULT_SUBJECT_ALIASES.get(s, [])
                if any(c_l == str(a).strip().lower() for a in s_aliases):
                    return True

        # Also check timetable: does the child have a scheduled lesson at that slot & weekday?
        if date_str:
            target_date = None
            if isinstance(date_str, dt_date):
                target_date = date_str
            else:
                try:
                    target_date = dt_date.fromisoformat(str(date_str).split("T")[0])
                except (ValueError, TypeError):
                    pass
            if target_date:
                w_num = target_date.weekday()
                day_keys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
                day_key = day_keys[w_num]
                lesson_str = str(entry.get("lesson", "")).strip()
                timetable = self.timetable or {}
                schedule = timetable.get("schedule", {})
                for sid, days_map in schedule.items():
                    slot_match = (sid == f"slot_{lesson_str}" or lesson_str in sid)
                    if slot_match:
                        scheduled_cell = days_map.get(day_key, {})
                        sched_subj = str(scheduled_cell.get("subject", "")).strip().lower()
                        if sched_subj and any(c.lower() == sched_subj for c in cands):
                            return True

        return False

    def set_portal_substitutions(self, subst_data: dict[str, Any]) -> None:
        """Store substitutions data and resolve subject names in entries."""
        if isinstance(subst_data, dict):
            resolved_days = []
            for d in subst_data.get("days", []):
                if not isinstance(d, dict):
                    continue
                resolved_entries = []
                for e in d.get("entries", []):
                    if not isinstance(e, dict):
                        continue
                    item = dict(e)
                    subj = str(item.get("subject", "")).strip()
                    old_subj = str(item.get("old_subject", "")).strip()
                    matched_idx = None
                    if subj:
                        item["subject_resolved"], matched_idx = self.resolve_subject_with_index(subj)
                    if old_subj:
                        item["old_subject_resolved"], old_idx = self.resolve_subject_with_index(old_subj)
                        if matched_idx is None:
                            matched_idx = old_idx

                    if matched_idx is not None:
                        t_val = str(item.get("teacher", "")).strip()
                        if "/" in t_val:
                            t_parts = [p.strip() for p in t_val.split("/")]
                            if 0 <= matched_idx < len(t_parts):
                                item["teacher"] = t_parts[matched_idx]
                        r_val = str(item.get("room", "")).strip()
                        if "/" in r_val:
                            r_parts = [p.strip() for p in r_val.split("/")]
                            if 0 <= matched_idx < len(r_parts):
                                item["room"] = r_parts[matched_idx]

                    # Check if substitution actually applies to this child
                    item["applies_to_child"] = self.is_substitution_relevant_for_child(item, d.get("date"))

                    resolved_entries.append(item)
                resolved_days.append({"date": d.get("date"), "entries": resolved_entries})
            self.portal_substitutions = {
                "available": bool(subst_data.get("available", True)),
                "stand": subst_data.get("stand"),
                "days": resolved_days,
            }

    def get_substitutions_for_date(
        self, target_date: dt_date | str, only_relevant: bool = True
    ) -> list[dict[str, Any]]:
        """Return substitution entries for a given date."""
        if not self.portal_substitutions or not isinstance(self.portal_substitutions, dict):
            return []
        date_iso = target_date.isoformat() if hasattr(target_date, "isoformat") else str(target_date).strip()
        if "T" in date_iso:
            date_iso = date_iso.split("T")[0]
        days = self.portal_substitutions.get("days", [])
        if not isinstance(days, list):
            return []
        for d in days:
            if isinstance(d, dict) and d.get("date") == date_iso:
                entries = list(d.get("entries", []))
                if only_relevant:
                    return [e for e in entries if e.get("applies_to_child", True)]
                return entries
        return []

    def get_substitution_for_slot(
        self,
        target_date: dt_date | str,
        slot_number_or_id: str,
        weekday_str: str | None = None,
    ) -> dict[str, Any] | None:
        """Find matching substitution entry for a lesson slot on a specific date."""
        entries = self.get_substitutions_for_date(target_date)
        if not entries:
            return None

        clean_num = str(slot_number_or_id).replace("slot_", "").strip()
        for e in entries:
            if not isinstance(e, dict):
                continue
            entry_lesson = str(e.get("lesson", "")).strip()
            if entry_lesson == clean_num:
                return e
            nums = re.findall(r"\d+", entry_lesson)
            if clean_num in nums:
                return e

        return None

    def set_portal_appointments(
        self,
        appointments: list[dict[str, Any]],
        ignore_info_events: bool | None = None,
    ) -> None:
        """Store appointments/exams data and resolve subjects in entries."""
        if not isinstance(appointments, list):
            self.portal_appointments = []
            return

        if ignore_info_events is None:
            ignore_info_events = self.portal_ignore_info_events

        resolved: list[dict[str, Any]] = []
        for apt in appointments:
            if not isinstance(apt, dict):
                continue
            item = dict(apt)

            # Filter info events if configured
            if ignore_info_events and not item.get("is_exam"):
                class_str = str(item.get("class") or item.get("class_name") or item.get("className") or "").lower()
                if "info" in class_str or class_str == "event-info":
                    continue

            # Ensure subject is resolved if missing or not canonical
            subj = str(item.get("subject", "")).strip()
            if not subj or subj not in self.subjects:
                title = str(item.get("title", "")).strip()
                short = str(item.get("title_short", "")).strip()
                from .portal import extract_exam_subject

                cand = extract_exam_subject(title, short, self.subject_aliases, self.subjects)
                if cand:
                    item["subject"] = cand

            resolved.append(item)

        resolved.sort(key=lambda x: (x.get("date", ""), x.get("start", ""), x.get("title", "")))
        self.portal_appointments = resolved

    def get_portal_appointments(
        self,
        only_upcoming: bool = False,
        only_exams: bool = False,
        ref_date: dt_date | None = None,
    ) -> list[dict[str, Any]]:
        """Return stored appointments, optionally filtered by exams and date."""
        if not self.portal_appointments:
            return []

        if ref_date is None:
            ref_date = dt_date.today()
        ref_iso = ref_date.isoformat()

        res: list[dict[str, Any]] = []
        for apt in self.portal_appointments:
            if only_exams and not apt.get("is_exam"):
                continue
            if only_upcoming:
                apt_date = apt.get("date", "")
                if apt_date and apt_date < ref_iso:
                    continue
            res.append(dict(apt))
        return res

    def get_exams_for_date(
        self, target_date: dt_date | str
    ) -> list[dict[str, Any]]:
        """Return exams on a specific target date."""
        if not self.portal_appointments:
            return []
        date_iso = target_date.isoformat() if hasattr(target_date, "isoformat") else str(target_date).strip()
        if "T" in date_iso:
            date_iso = date_iso.split("T")[0]
        return [
            dict(a) for a in self.portal_appointments
            if a.get("is_exam") and a.get("date") == date_iso
        ]

    def set_portal_settings(
        self,
        enabled: bool,
        school: str = "",
        username: str = "",
        password: str | None = None,
        student_id: str = "",
        student_name: str = "",
        sync_timetable: bool | None = None,
        sync_substitutions: bool | None = None,
        sync_exams: bool | None = None,
        ignore_info_events: bool | None = None,
    ) -> None:
        """Update Eltern-Portal configuration."""
        self.portal_enabled = bool(enabled)
        self.portal_school = school_from_input(school)
        self.portal_username = username.strip()
        if password is not None and password != "":
            self.portal_password = password
        self.portal_student_id = str(student_id).strip()
        self.portal_student_name = str(student_name).strip()
        if sync_timetable is not None:
            self.portal_sync_timetable = bool(sync_timetable)
        if sync_substitutions is not None:
            self.portal_sync_substitutions = bool(sync_substitutions)
        if sync_exams is not None:
            self.portal_sync_exams = bool(sync_exams)
        if ignore_info_events is not None:
            self.portal_ignore_info_events = bool(ignore_info_events)
            if self.portal_ignore_info_events and self.portal_appointments:
                self.set_portal_appointments(self.portal_appointments, ignore_info_events=True)

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

    def get_next_school_day_date(
        self, ref_date: dt_date | None = None, ref_dt: dt_datetime | None = None
    ) -> tuple[str, dt_date]:
        """Return (day_key, target_date) for the active preparation school day.

        If today is a school day and we are currently BEFORE school starts
        (e.g., 00:00 to 08:00), target is TODAY.
        Once school starts or finishes, target is the NEXT school day.
        """
        if ref_dt is None and ref_date is None:
            ref_dt = dt_datetime.now()
            ref_date = ref_dt.date()
        elif ref_date is not None and ref_dt is None:
            if ref_date == dt_date.today():
                ref_dt = dt_datetime.now()
            else:
                ref_dt = dt_datetime.combine(ref_date, dt_time(12, 0))
        elif ref_dt is not None and ref_date is None:
            ref_date = ref_dt.date()

        weekday = ref_date.weekday()  # Monday is 0, Sunday is 6
        day_keys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        day_key_today = day_keys[weekday]

        if weekday < 5 and ref_dt is not None:
            _, status = self.get_current_school_status(ref_dt)
            if status.get("is_school_day") and status.get("before_school"):
                return day_key_today, ref_date

        if weekday == 4:  # Friday -> Monday (+3 days)
            days_ahead = 3
            day_key = "monday"
        elif weekday == 5:  # Saturday -> Monday (+2 days)
            days_ahead = 2
            day_key = "monday"
        elif weekday == 6:  # Sunday -> Monday (+1 day)
            days_ahead = 1
            day_key = "monday"
        else:  # Monday (0) -> Tue, etc.
            days_ahead = 1
            day_key = day_keys[weekday + 1]

        target_date = ref_date + timedelta(days=days_ahead)
        return day_key, target_date

    def get_next_school_day_subjects(
        self, ref_date: dt_date | None = None, ref_dt: dt_datetime | None = None
    ) -> list[str]:
        """Return unique list of subjects on the timetable for the next school day."""
        day_key, target_date = self.get_next_school_day_date(ref_date, ref_dt)
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

        # Incorporate substitutions for the target date if available (only relevant ones)
        substs = self.get_substitutions_for_date(target_date, only_relevant=True)
        if substs:
            for e in substs:
                if not isinstance(e, dict):
                    continue
                kind = e.get("kind")
                subst_subj = e.get("subject_resolved") or self.resolve_subject(e.get("subject", ""))
                if kind == "vertretung" and subst_subj and subst_subj not in needed:
                    needed.append(subst_subj)

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

        clean_subj = str(subject or "").strip()
        if clean_subj:
            clean_subj = self.resolve_subject(clean_subj)
        clean_day = str(day or "").strip().lower()

        slot_str = str(slot_id).strip()
        possible_slot_keys = [slot_str]
        if slot_str.startswith("slot_"):
            possible_slot_keys.append(slot_str[5:])
        else:
            possible_slot_keys.append(f"slot_{slot_str}")

        if not clean_subj:
            for sk in possible_slot_keys:
                if sk in new_timetable["schedule"] and isinstance(new_timetable["schedule"][sk], dict):
                    new_timetable["schedule"][sk].pop(clean_day, None)
        else:
            target_key = next((sk for sk in possible_slot_keys if sk in new_timetable["schedule"]), slot_str)
            if target_key not in new_timetable["schedule"]:
                new_timetable["schedule"][target_key] = {}
            new_timetable["schedule"][target_key][clean_day] = {
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
                            if subj:
                                subj = self.resolve_subject(subj)
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
                            if subj:
                                subj = self.resolve_subject(subj)
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
        """Remove a subject, all its recorded grades, and any timetable cells referencing it."""
        clean_subj = subject.strip()
        removed = False

        if clean_subj in self._subjects:
            self._subjects.remove(clean_subj)
            self._grades.pop(clean_subj, None)
            removed = True

        # Also purge subject from timetable schedule
        if "schedule" in self.timetable and isinstance(self.timetable["schedule"], dict):
            for slot_id, days in list(self.timetable["schedule"].items()):
                if isinstance(days, dict):
                    for day_key, cell in list(days.items()):
                        if isinstance(cell, dict) and cell.get("subject") == clean_subj:
                            days.pop(day_key, None)
                            removed = True

        if removed:
            self.timetable_version = getattr(self, "timetable_version", 1) + 1

        return removed

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
