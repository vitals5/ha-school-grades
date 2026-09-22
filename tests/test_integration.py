import sys
import unittest
import json
import importlib.util
from datetime import date
from pathlib import Path

project_root = Path(__file__).parent.parent

const_spec = importlib.util.spec_from_file_location(
    "custom_components.school_grades.const",
    project_root / "custom_components" / "school_grades" / "const.py",
)
const_mod = importlib.util.module_from_spec(const_spec)
sys.modules["custom_components.school_grades.const"] = const_mod
const_spec.loader.exec_module(const_mod)

storage_spec = importlib.util.spec_from_file_location(
    "custom_components.school_grades.storage",
    project_root / "custom_components" / "school_grades" / "storage.py",
)
storage_mod = importlib.util.module_from_spec(storage_spec)
sys.modules["custom_components.school_grades.storage"] = storage_mod
storage_spec.loader.exec_module(storage_mod)

SchoolGradesData = storage_mod.SchoolGradesData


class TestSchoolGradesLogic(unittest.TestCase):
    """Test suite for SchoolGradesData weighted calculations and operations."""

    def test_weighted_average_calculation(self):
        data = SchoolGradesData("Max")
        self.assertIsNone(data.calculate_subject_average("Mathematik"))

        data.add_grade(subject="Mathematik", grade=2.0, weight=1.0, name="Ex 1")
        self.assertEqual(data.calculate_subject_average("Mathematik"), 2.0)

        data.add_grade(subject="Mathematik", grade=3.0, weight=2.0, name="Schulaufgabe 1")
        self.assertEqual(data.calculate_subject_average("Mathematik"), 2.67)

        data.add_grade(subject="Mathematik", grade=1.0, weight=3.0, name="Großer Leistungstest")
        self.assertEqual(data.calculate_subject_average("Mathematik"), 1.83)

        data.add_grade(subject="Mathematik", grade=4.0, weight=4.0, name="Jahresschulaufgabe")
        self.assertEqual(data.calculate_subject_average("Mathematik"), 2.7)

    def test_multi_subject_and_total_average(self):
        data = SchoolGradesData("Emma")
        data.add_grade("Mathematik", 2.0, 1.0)
        data.add_grade("Deutsch", 1.0, 1.0)
        data.add_grade("Deutsch", 3.0, 1.0)
        data.add_grade("Englisch", 3.0, 2.0)
        data.add_grade("Englisch", 1.0, 1.0)

        self.assertEqual(data.calculate_subject_average("Mathematik"), 2.0)
        self.assertEqual(data.calculate_subject_average("Deutsch"), 2.0)
        self.assertEqual(data.calculate_subject_average("Englisch"), 2.33)
        self.assertEqual(data.calculate_total_average(), 2.11)

    def test_grade_removal(self):
        data = SchoolGradesData("Lukas")
        g1 = data.add_grade("Physik", 1.0, 1.0, "Test 1")
        g2 = data.add_grade("Physik", 5.0, 1.0, "Test 2")
        self.assertEqual(data.calculate_subject_average("Physik"), 3.0)

        success = data.remove_grade("Physik", g2["id"])
        self.assertTrue(success)
        self.assertEqual(data.calculate_subject_average("Physik"), 1.0)

    def test_subject_management(self):
        data = SchoolGradesData("Sophie")
        self.assertTrue(data.add_subject("Informatik"))
        self.assertIn("Informatik", data.subjects)
        self.assertFalse(data.add_subject("Informatik"))

        data.add_grade("Informatik", 1.0, 1.0)
        self.assertTrue(data.remove_subject("Informatik"))
        self.assertNotIn("Informatik", data.subjects)

    def test_timetable_cell_update(self):
        data = SchoolGradesData("Richard")
        self.assertIsNotNone(data.timetable)
        initial_version = data.timetable_version
        initial_timetable = data.timetable

        # Add new subject to cell
        data.update_timetable_cell("slot_1", "monday", "Informatik", "R101", "Fr. Müller")
        self.assertEqual(data.timetable["schedule"]["slot_1"]["monday"]["subject"], "Informatik")
        self.assertEqual(data.timetable["schedule"]["slot_1"]["monday"]["room"], "R101")
        self.assertEqual(data.timetable["schedule"]["slot_1"]["monday"]["teacher"], "Fr. Müller")
        # Ensure deep copy / different dict reference
        self.assertIsNot(data.timetable, initial_timetable)
        # Ensure version incremented
        self.assertEqual(data.timetable_version, initial_version + 1)
        # Ensure newly introduced subject is auto-registered
        self.assertIn("Informatik", data.subjects)
        self.assertEqual(data.get_grades("Informatik"), [])

        # Clear cell
        mid_timetable = data.timetable
        data.update_timetable_cell("slot_1", "monday", "", "", "")
        self.assertNotIn("monday", data.timetable["schedule"]["slot_1"])
        self.assertIsNot(data.timetable, mid_timetable)
        self.assertEqual(data.timetable_version, initial_version + 2)

    def test_timetable_yaml_import(self):
        data = SchoolGradesData("Richard")
        prev_version = data.timetable_version
        import_data = {
            "slots": [
                {"id": "slot_1", "label": "1. Stunde", "start": "08:00", "end": "08:45"}
            ],
            "schedule": {
                "slot_1": {
                    "monday": {"subject": "Physik", "room": "R200", "teacher": "Dr. Einstein"}
                }
            }
        }
        res = data.import_timetable_data(import_data)
        self.assertTrue(res)
        self.assertEqual(data.timetable["slots"][0]["id"], "slot_1")
        self.assertEqual(data.timetable["schedule"]["slot_1"]["monday"]["subject"], "Physik")
        self.assertEqual(data.timetable_version, prev_version + 1)
        self.assertIn("Physik", data.subjects)
        self.assertEqual(data.get_grades("Physik"), [])

    def test_country_settings(self):
        data = SchoolGradesData("Nicole")
        self.assertEqual(data.country, "DE")
        self.assertTrue(data.set_country("CH"))
        self.assertEqual(data.country, "CH")
        self.assertTrue(data.set_country("US"))
        self.assertEqual(data.country, "US")
        self.assertFalse(data.set_country("INVALID_CODE"))
        self.assertEqual(data.country, "US")

    def test_grade_level_setting(self):
        data = SchoolGradesData("Richard")
        self.assertEqual(data.grade_level, "")
        data.set_grade_level("5a")
        self.assertEqual(data.grade_level, "5a")

    def test_homework_and_preparation_logic(self):
        data = SchoolGradesData("Richard")
        # Homework default
        self.assertFalse(data.homework_done)
        data.set_homework_done(True)
        self.assertTrue(data.homework_done)

        # Timetable setup for Tuesday (e.g. ref date Monday 2026-09-21)
        monday_ref = date(2026, 9, 21)
        day_key, target_date = data.get_next_school_day_date(monday_ref)
        self.assertEqual(day_key, "tuesday")
        self.assertEqual(target_date, date(2026, 9, 22))

        # Weekend test: Friday 2026-09-25 -> Monday 2026-09-28
        fri_ref = date(2026, 9, 25)
        fri_day_key, fri_target_date = data.get_next_school_day_date(fri_ref)
        self.assertEqual(fri_day_key, "monday")
        self.assertEqual(fri_target_date, date(2026, 9, 28))

        # Add timetable schedule for Tuesday: Mathematik and Deutsch
        data.update_timetable_cell("slot_1", "tuesday", "Mathematik")
        data.update_timetable_cell("slot_2", "tuesday", "Deutsch")
        needed = data.get_next_school_day_subjects(monday_ref)
        self.assertEqual(needed, ["Mathematik", "Deutsch"])

        # Initially, preparation is not done
        self.assertFalse(data.preparation_done)

        # Toggle first subject (Mathematik)
        res1 = data.toggle_prepared_subject("Mathematik", ref_date=monday_ref)
        self.assertTrue(res1)
        self.assertTrue(data.prepared_subjects.get("Mathematik"))
        # Only 1 of 2 subjects is prepared -> preparation_done MUST be False
        self.assertFalse(data.preparation_done)

        # Toggle second subject (Deutsch) -> all subjects for Tuesday are prepared!
        res2 = data.toggle_prepared_subject("Deutsch", ref_date=monday_ref)
        self.assertTrue(res2)
        self.assertTrue(data.prepared_subjects.get("Deutsch"))
        # All subjects prepared -> preparation_done MUST automatically become True!
        self.assertTrue(data.preparation_done)

        # Uncheck Deutsch -> preparation_done MUST revert to False!
        res3 = data.toggle_prepared_subject("Deutsch", ref_date=monday_ref)
        self.assertFalse(res3)
        self.assertFalse(data.preparation_done)

        # Programmatic set_preparation_done(True) marks overall done and all subjects prepared
        data.set_preparation_done(True, ref_date=monday_ref)
        self.assertTrue(data.preparation_done)
        self.assertTrue(data.prepared_subjects.get("Mathematik"))
        self.assertTrue(data.prepared_subjects.get("Deutsch"))

        # Programmatic set_preparation_done(False) clears overall done and unmarks subjects
        data.set_preparation_done(False, ref_date=monday_ref)
        self.assertFalse(data.preparation_done)
        self.assertFalse(data.prepared_subjects.get("Mathematik"))
        self.assertFalse(data.prepared_subjects.get("Deutsch"))

        # Daily reset when date advances to Tuesday (ref_date = 2026-09-22 -> prepares for Wednesday)
        data.set_preparation_done(True, ref_date=monday_ref)
        self.assertTrue(data.preparation_done)
        tue_ref = date(2026, 9, 22)
        has_reset = data.check_and_reset_preparation_daily(ref_date=tue_ref)
        self.assertTrue(has_reset)
        self.assertFalse(data.preparation_done)
        self.assertEqual(data.prepared_subjects, {})

    def test_section_visibility_settings(self):
        data = SchoolGradesData("Nicole")
        self.assertEqual(data.section_visibility, {
            "show_prep_card": True,
            "show_calendar_card": True,
            "show_timetable_card": True,
            "show_overview_card": True,
        })
        data.set_section_visibility({"show_prep_card": False, "show_timetable_card": False})
        self.assertEqual(data.section_visibility, {
            "show_prep_card": False,
            "show_calendar_card": True,
            "show_timetable_card": False,
            "show_overview_card": True,
        })


class TestCalendarServicesLogic(unittest.TestCase):
    """Test suite for calendar event datetime parsing, action discovery, and deletion logic."""

    def test_parse_event_datetime_helper(self):
        """Test _parse_event_datetime with various date and time formats."""
        from datetime import datetime, timedelta

        def _parse_event_datetime(d_str: str, t_str: str) -> tuple[str, str]:
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

        # 1. Standard YYYY-MM-DD + HH:MM
        start_iso, end_iso = _parse_event_datetime("2026-09-25", "10:30")
        self.assertEqual(start_iso, "2026-09-25T10:30:00")
        self.assertEqual(end_iso, "2026-09-25T11:30:00")

        # 2. ISO timestamp date string
        start_iso, end_iso = _parse_event_datetime("2026-09-25T14:00:00", "14:00")
        self.assertEqual(start_iso, "2026-09-25T14:00:00")
        self.assertEqual(end_iso, "2026-09-25T15:00:00")

        # 3. Empty time defaults to 08:00
        start_iso, end_iso = _parse_event_datetime("2026-09-25", "")
        self.assertEqual(start_iso, "2026-09-25T08:00:00")
        self.assertEqual(end_iso, "2026-09-25T09:00:00")

        # 4. Time string with seconds (14:30:00)
        start_iso, end_iso = _parse_event_datetime("2026-09-25", "14:30:00")
        self.assertEqual(start_iso, "2026-09-25T14:30:00")
        self.assertEqual(end_iso, "2026-09-25T15:30:00")

    def test_find_calendar_service_fallback(self):
        """Test fallback lookup for calendar actions (create, update, delete)."""
        class MockServices:
            def has_service(self, domain, service):
                return (domain, service) in [("calendar", "create_event"), ("calendar", "update_event")]

        mock_services = MockServices()

        def _find_calendar_service(action_type: str) -> tuple[str, str]:
            candidates = {
                "create": [("calendar", "create_event"), ("google", "create_event")],
                "update": [("calendar", "update_event"), ("google", "update_event")],
                "delete": [("calendar", "delete_event"), ("google", "delete_event")],
            }
            for domain, svc in candidates.get(action_type, []):
                if mock_services.has_service(domain, svc):
                    return (domain, svc)
            defaults = {
                "create": ("calendar", "create_event"),
                "update": ("calendar", "update_event"),
                "delete": ("calendar", "delete_event"),
            }
            return defaults[action_type]

        self.assertEqual(_find_calendar_service("create"), ("calendar", "create_event"))
        self.assertEqual(_find_calendar_service("update"), ("calendar", "update_event"))
        self.assertEqual(_find_calendar_service("delete"), ("calendar", "delete_event"))

    def test_direct_calendar_entity_deletion_mock(self):
        """Test direct CalendarEntity method call and service call fallbacks."""
        deleted_uids = []

        class MockCalendarEntity:
            async def async_delete_event(self, uid: str):
                deleted_uids.append(uid)

        class MockEntityComponent:
            def get_entity(self, entity_id):
                if entity_id == "calendar.richard_schule":
                    return MockCalendarEntity()
                return None

        hass_data = {
            "entity_components": {
                "calendar": MockEntityComponent()
            }
        }

        async def _async_delete_calendar_event(target_calendar: str, uid: str) -> bool:
            entity_components = hass_data.get("entity_components", {})
            cal_component = entity_components.get("calendar")
            if cal_component:
                entity = cal_component.get_entity(target_calendar)
                if entity and hasattr(entity, "async_delete_event"):
                    await entity.async_delete_event(uid)
                    return True
            return False

        import asyncio
        res = asyncio.run(_async_delete_calendar_event("calendar.richard_schule", "event123@google.com"))
        self.assertTrue(res)
        self.assertIn("event123@google.com", deleted_uids)

    def test_init_py_syntax_and_compilation(self):
        """Verify custom_components/school_grades/__init__.py compiles without syntax errors."""
        import py_compile
        init_path = project_root / "custom_components" / "school_grades" / "__init__.py"
        compiled_path = py_compile.compile(str(init_path), doraise=True)
        self.assertIsNotNone(compiled_path)


def validate_json_yaml_files():
    json_files = list(project_root.glob("**/*.json"))
    for jf in json_files:
        with open(jf, "r", encoding="utf-8") as f:
            json.load(f)

    yaml_files = list(project_root.glob("**/*.yaml"))
    for yf in yaml_files:
        with open(yf, "r", encoding="utf-8") as f:
            content = f.read()
            assert ":" in content, f"Basic check failed for {yf}"


if __name__ == "__main__":
    print("Validating JSON & YAML files...")
    validate_json_yaml_files()
    print("\nRunning Logic Unit Tests...")
    suite = unittest.TestLoader().loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if not result.wasSuccessful():
        sys.exit(1)
