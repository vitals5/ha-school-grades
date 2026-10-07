import sys
import unittest
import json
import importlib.util
from datetime import date, datetime
from pathlib import Path

project_root = Path(__file__).parent.parent

const_spec = importlib.util.spec_from_file_location(
    "custom_components.school_grades.const",
    project_root / "custom_components" / "school_grades" / "const.py",
)
const_mod = importlib.util.module_from_spec(const_spec)
sys.modules["custom_components.school_grades.const"] = const_mod
const_spec.loader.exec_module(const_mod)

portal_spec = importlib.util.spec_from_file_location(
    "custom_components.school_grades.portal",
    project_root / "custom_components" / "school_grades" / "portal.py",
)
portal_mod = importlib.util.module_from_spec(portal_spec)
sys.modules["custom_components.school_grades.portal"] = portal_mod
portal_spec.loader.exec_module(portal_mod)

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

        data.update_timetable_cell("slot_1", "tuesday", "Informatik", "R102", "Hr. Weber")
        self.assertEqual(data.timetable["schedule"]["slot_1"]["tuesday"]["subject"], "Informatik")

        data.add_grade("Informatik", 1.0, 1.0)
        self.assertTrue(data.remove_subject("Informatik"))
        self.assertNotIn("Informatik", data.subjects)
        # Verify timetable cell was also purged
        self.assertNotIn("tuesday", data.timetable["schedule"]["slot_1"])

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

        # Test cross-key variant clearing (schedule has "slot_1", cleared with "1")
        data.update_timetable_cell("1", "wednesday", "Chemie", "R300", "Hr. Nobel")
        self.assertEqual(data.timetable["schedule"]["slot_1"]["wednesday"]["subject"], "Chemie")
        data.update_timetable_cell("1", "wednesday", "", "", "")
        self.assertNotIn("wednesday", data.timetable["schedule"]["slot_1"])

        # Test schedule with key "2", cleared with "slot_2"
        data.timetable["schedule"]["2"] = {"thursday": {"subject": "Biologie", "room": "BIO1", "teacher": "Fr. Darwin"}}
        self.assertIn("thursday", data.timetable["schedule"]["2"])
        data.update_timetable_cell("slot_2", "thursday", "", "", "")
        self.assertNotIn("thursday", data.timetable["schedule"]["2"])

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

    def test_school_time_status(self):
        """Test SchoolGradesData.get_current_school_status for active lesson, break, free period, etc."""
        from datetime import datetime

        data = SchoolGradesData("Richard")
        data.timetable = {
            "slots": [
                {"id": "slot_1", "type": "lesson", "label": "1. Stunde", "start": "08:00", "end": "08:45"},
                {"id": "slot_2", "type": "lesson", "label": "2. Stunde", "start": "08:45", "end": "09:30"},
                {"id": "break_1", "type": "break", "label": "1. Pause", "start": "09:30", "end": "09:45"},
                {"id": "slot_3", "type": "lesson", "label": "3. Stunde", "start": "09:45", "end": "10:30"},
                {"id": "slot_4", "type": "lesson", "label": "4. Stunde", "start": "10:30", "end": "11:15"},
            ],
            "schedule": {
                "slot_1": {"monday": {"subject": "Mathematik", "room": "R101", "teacher": "Fr. Müller"}},
                "slot_2": {"monday": {"subject": "Deutsch", "room": "R102", "teacher": "Hr. Weber"}},
                "slot_3": {"monday": {"subject": ""}},  # Freistunde
                "slot_4": {"monday": {"subject": "Englisch", "room": "R103", "teacher": "Fr. Bauer"}},
            }
        }

        # 2026-09-21 is a Monday
        # 1. Before school (07:45)
        is_on, attrs = data.get_current_school_status(datetime(2026, 9, 21, 7, 45))
        self.assertFalse(is_on)
        self.assertTrue(attrs["before_school"])
        self.assertEqual(attrs["next_subject"], "Mathematik")
        self.assertEqual(attrs["next_slot_start"], "08:00")
        self.assertEqual(attrs["school_day_start"], "08:00")
        self.assertEqual(attrs["school_day_end"], "11:15")

        # 2. During 1st lesson (08:15)
        is_on, attrs = data.get_current_school_status(datetime(2026, 9, 21, 8, 15))
        self.assertTrue(is_on)
        self.assertEqual(attrs["current_subject"], "Mathematik")
        self.assertEqual(attrs["current_room"], "R101")
        self.assertEqual(attrs["current_teacher"], "Fr. Müller")
        self.assertEqual(attrs["current_slot"], "1. Stunde")
        self.assertEqual(attrs["current_slot_end"], "08:45")
        self.assertEqual(attrs["next_subject"], "Deutsch")

        # 3. During break (09:35) -> must be False
        is_on, attrs = data.get_current_school_status(datetime(2026, 9, 21, 9, 35))
        self.assertFalse(is_on)
        self.assertTrue(attrs["is_break"])
        self.assertEqual(attrs["current_slot"], "1. Pause")
        self.assertEqual(attrs["next_subject"], "Englisch")
        self.assertEqual(attrs["next_slot_start"], "10:30")

        # 4. During free period (10:00) -> must be False
        is_on, attrs = data.get_current_school_status(datetime(2026, 9, 21, 10, 0))
        self.assertFalse(is_on)
        self.assertTrue(attrs["is_free_period"])
        self.assertEqual(attrs["current_slot"], "3. Stunde")
        self.assertEqual(attrs["next_subject"], "Englisch")

        # 5. During 4th lesson (10:50) -> must be True
        is_on, attrs = data.get_current_school_status(datetime(2026, 9, 21, 10, 50))
        self.assertTrue(is_on)
        self.assertEqual(attrs["current_subject"], "Englisch")

        # 6. School finished (11:30) -> must be False
        is_on, attrs = data.get_current_school_status(datetime(2026, 9, 21, 11, 30))
        self.assertFalse(is_on)
        self.assertTrue(attrs["school_finished"])

        # 7. Weekend: Saturday 2026-09-26 -> must be False
        is_on, attrs = data.get_current_school_status(datetime(2026, 9, 26, 10, 0))
        self.assertFalse(is_on)
        self.assertFalse(attrs["is_school_day"])



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


class TestMultiLanguageSupport(unittest.TestCase):
    """Test suite for multi-language translations and language helpers."""

    EXPECTED_LANGUAGES = ["de", "en", "fr", "it", "es", "nl", "pl", "ru", "zh-Hans", "zh"]
    EXPECTED_SERVICES = [
        "add_subject",
        "remove_subject",
        "add_grade",
        "remove_grade",
        "set_calendar",
        "update_timetable_cell",
        "import_timetable",
        "update_settings",
        "add_calendar_event",
        "update_calendar_event",
        "remove_calendar_event",
        "set_homework_done",
        "set_preparation_done",
        "toggle_prepared_subject",
        "import_portal_exams",
    ]
    EXPECTED_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    def test_translation_files_integrity(self):
        """Verify all translation JSON files exist and have valid structure with all services."""
        trans_dir = project_root / "custom_components" / "school_grades" / "translations"
        for lang in self.EXPECTED_LANGUAGES:
            file_path = trans_dir / f"{lang}.json"
            self.assertTrue(file_path.exists(), f"Translation file {lang}.json missing!")
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Check config flow step user
            self.assertIn("config", data)
            self.assertIn("step", data["config"])
            self.assertIn("user", data["config"]["step"])
            user_step = data["config"]["step"]["user"]
            self.assertTrue(user_step.get("title"))
            self.assertTrue(user_step.get("description"))
            self.assertIn("data", user_step)
            self.assertIn("child_name", user_step["data"])
            self.assertIn("country", user_step["data"])

            # Check services
            self.assertIn("services", data)
            services = data["services"]
            for s in self.EXPECTED_SERVICES:
                self.assertIn(s, services, f"Service {s} missing in {lang}.json")
                self.assertTrue(services[s].get("name"))
                self.assertTrue(services[s].get("description"))

    def test_day_names_and_normalize_lang(self):
        """Test DAY_NAMES dictionary and _normalize_lang helper in binary_sensor.py."""
        import ast

        bs_path = project_root / "custom_components" / "school_grades" / "binary_sensor.py"
        with open(bs_path, "r", encoding="utf-8") as f:
            bs_code = f.read()

        # Parse AST to extract DAY_NAMES dict
        parsed = ast.parse(bs_code)
        day_names_dict = None
        for node in ast.walk(parsed):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == "DAY_NAMES":
                        day_names_dict = ast.literal_eval(node.value)
            elif isinstance(node, ast.AnnAssign):
                if isinstance(node.target, ast.Name) and node.target.id == "DAY_NAMES":
                    day_names_dict = ast.literal_eval(node.value)

        self.assertIsNotNone(day_names_dict, "DAY_NAMES dictionary not found in binary_sensor.py")
        primary_langs = ["de", "en", "fr", "it", "es", "nl", "pl", "ru", "zh"]
        for pl in primary_langs:
            self.assertIn(pl, day_names_dict, f"Language {pl} missing in DAY_NAMES")
            for day in self.EXPECTED_DAYS:
                self.assertIn(day, day_names_dict[pl], f"Day {day} missing in DAY_NAMES[{pl}]")
                self.assertTrue(day_names_dict[pl][day], f"Empty day name for {day} in {pl}")

        # Test normalize logic
        def normalize_lang(raw):
            if not raw:
                return "de"
            code = str(raw).lower().replace("_", "-")
            for prefix in ("de", "en", "fr", "it", "es", "nl", "pl", "ru", "zh"):
                if code.startswith(prefix):
                    return prefix
            return "de"

        self.assertEqual(normalize_lang("de_DE"), "de")
        self.assertEqual(normalize_lang("en-US"), "en")
        self.assertEqual(normalize_lang("fr-FR"), "fr")
        self.assertEqual(normalize_lang("it-IT"), "it")
        self.assertEqual(normalize_lang("es-ES"), "es")
        self.assertEqual(normalize_lang("nl-NL"), "nl")
        self.assertEqual(normalize_lang("pl-PL"), "pl")
        self.assertEqual(normalize_lang("ru-RU"), "ru")
        self.assertEqual(normalize_lang("zh-Hans"), "zh")
        self.assertEqual(normalize_lang("zh-CN"), "zh")
        self.assertEqual(normalize_lang("pt-BR"), "de")  # Fallback to German

    def test_panel_js_i18n_support(self):
        """Verify school-grades-panel.js includes all supported language dictionaries."""
        panel_path = project_root / "custom_components" / "school_grades" / "frontend" / "school-grades-panel.js"
        with open(panel_path, "r", encoding="utf-8") as f:
            content = f.read()

        primary_langs = ["de", "en", "fr", "it", "es", "nl", "pl", "ru", "zh"]
        for pl in primary_langs:
            self.assertIn(f"{pl}: {{", content, f"Language {pl} block missing in school-grades-panel.js I18N")

    def test_school_from_input_parsing(self):
        """Test URL and identifier parsing for Eltern-Portal."""
        sfi = portal_mod.school_from_input
        self.assertEqual(sfi("https://bspgym.eltern-portal.org"), "bspgym")
        self.assertEqual(sfi("https://bspgym.eltern-portal.org/start"), "bspgym")
        self.assertEqual(sfi("bspgym"), "bspgym")
        self.assertEqual(sfi("demo"), "demo")
        self.assertEqual(sfi("  https://my-school.eltern-portal.org/  "), "my-school")

    def test_portal_settings_storage(self):
        """Test storing, updating and serializing Eltern-Portal settings."""
        data = SchoolGradesData("Felix")
        self.assertFalse(data.portal_enabled)
        self.assertEqual(data.portal_school, "")

        data.set_portal_settings(
            enabled=True,
            school="https://bspgym.eltern-portal.org",
            username="parent@example.com",
            password="secretpassword",
            student_id="12345",
            student_name="Felix Mustermann (7a)",
            sync_timetable=True,
            sync_substitutions=False,
            sync_exams=True,
        )
        self.assertTrue(data.portal_enabled)
        self.assertEqual(data.portal_school, "bspgym")
        self.assertEqual(data.portal_username, "parent@example.com")
        self.assertEqual(data.portal_password, "secretpassword")
        self.assertEqual(data.portal_student_id, "12345")
        self.assertEqual(data.portal_student_name, "Felix Mustermann (7a)")
        self.assertTrue(data.portal_sync_timetable)
        self.assertFalse(data.portal_sync_substitutions)
        self.assertTrue(data.portal_sync_exams)

        # Update without re-entering password
        data.set_portal_settings(
            enabled=True,
            school="bspgym",
            username="newuser@example.com",
            password="",  # Preserves existing password
            student_id="12345",
            student_name="Felix Mustermann (7a)",
        )
        self.assertEqual(data.portal_password, "secretpassword")
        self.assertEqual(data.portal_username, "newuser@example.com")

        # Serialized dictionary contains portal fields
        d = data.to_dict()
        self.assertTrue(d["portal_enabled"])
        self.assertEqual(d["portal_school"], "bspgym")
        self.assertEqual(d["portal_username"], "newuser@example.com")
        self.assertEqual(d["portal_password"], "secretpassword")
        self.assertEqual(d["portal_student_id"], "12345")
        self.assertFalse(d["portal_sync_substitutions"])

    def test_subject_alias_resolution(self):
        """Test resolving abbreviations to full subject names."""
        aliases = {
            "Mathematik": ["M", "Ma", "Math"],
            "Deutsch": ["D", "De"],
            "Wirtschaft und Recht": ["WR", "WiRe"],
        }
        existing = ["Mathematik", "Deutsch", "Englisch", "Sport"]

        # Matches existing
        self.assertEqual(portal_mod.resolve_subject_name("Mathematik", aliases, existing), "Mathematik")
        # Matches alias list -> key
        self.assertEqual(portal_mod.resolve_subject_name("Ma", aliases, existing), "Mathematik")
        self.assertEqual(portal_mod.resolve_subject_name("De", aliases, existing), "Deutsch")
        self.assertEqual(portal_mod.resolve_subject_name("WR", aliases, existing), "Wirtschaft und Recht")
        # Exact alias key
        self.assertEqual(portal_mod.resolve_subject_name("wirtschaft und recht", aliases, existing), "Wirtschaft und Recht")
        # Prefix match
        self.assertEqual(portal_mod.resolve_subject_name("Engl", aliases, existing), "Englisch")
        # Unknown fallback
        self.assertEqual(portal_mod.resolve_subject_name("Astronomie", aliases, existing), "Astronomie")

        # Trailing digit stripping (e.g. L1 -> Latein, E2 -> Englisch)
        alias_with_langs = {
            "Latein": ["L", "Lat"],
            "Englisch": ["E", "Eng"],
            "Französisch": ["F", "Fra"],
        }
        langs_existing = ["Latein", "Englisch", "Französisch"]
        self.assertEqual(portal_mod.resolve_subject_name("L1", alias_with_langs, langs_existing), "Latein")
        self.assertEqual(portal_mod.resolve_subject_name("E2", alias_with_langs, langs_existing), "Englisch")
        self.assertEqual(portal_mod.resolve_subject_name("F3", alias_with_langs, langs_existing), "Französisch")

        # Slash-separated subjects
        full_aliases = {
            "Mathematik": ["M", "Ma"],
            "Deutsch": ["D", "De"],
            "Religion": ["Rel", "K", "Ev", "Kath", "Evang"],
            "Ethik": ["Eth"],
            "Musik": ["Mu", "Mus"],
            "Chor": ["Cho"],
            "Sport": ["Sp", "Spo", "Sm", "Sw", "Smd", "Swd"],
        }
        # 1. Child enrolled in Religion (Catholic): 'Eth/K/Ev' matches Religion
        self.assertEqual(
            portal_mod.resolve_subject_name("Eth/K/Ev", full_aliases, ["Mathematik", "Deutsch", "Religion"]),
            "Religion"
        )
        # 2. Child enrolled in Ethik: 'Eth/K/Ev' matches Ethik
        self.assertEqual(
            portal_mod.resolve_subject_name("Eth/K/Ev", full_aliases, ["Mathematik", "Deutsch", "Ethik"]),
            "Ethik"
        )
        # 3. Child enrolled in Musik: 'Mu/Cho' matches Musik
        self.assertEqual(
            portal_mod.resolve_subject_name("Mu/Cho", full_aliases, ["Mathematik", "Musik"]),
            "Musik"
        )
        # 4. Homogeneous slash (e.g. boys/girls gym split Smd/Swd -> both map to Sport)
        self.assertEqual(
            portal_mod.resolve_subject_name("Smd/Swd", full_aliases, ["Mathematik", "Sport"]),
            "Sport"
        )
        # 5. Direct alias override in child YAML: 'Eth/K/Ev' configured explicitly
        override_aliases = dict(full_aliases)
        override_aliases["Religion"] = ["Rel", "Eth/K/Ev"]
        self.assertEqual(
            portal_mod.resolve_subject_name("Eth/K/Ev", override_aliases, ["Mathematik"]),
            "Religion"
        )

        # 6. resolve_subject_with_index: returns matched index for slash-separated subjects
        res_subj, matched_idx = portal_mod.resolve_subject_with_index(
            "Eth/K/Ev",
            {"Religion": ["Rel", "K"]},
            ["Mathematik", "Religion"]
        )
        self.assertEqual(res_subj, "Religion")
        self.assertEqual(matched_idx, 1)

        res_subj, matched_idx = portal_mod.resolve_subject_with_index(
            "Eth/K/Ev",
            const_mod.DEFAULT_SUBJECT_ALIASES,
            ["Mathematik", "Katholische Religion"]
        )
        self.assertEqual(res_subj, "Katholische Religion")
        self.assertEqual(matched_idx, 1)

        res_subj, matched_idx = portal_mod.resolve_subject_with_index(
            "Mu/Cho",
            full_aliases,
            ["Mathematik", "Musik"]
        )
        self.assertEqual(res_subj, "Musik")
        self.assertEqual(matched_idx, 0)

        res_subj, matched_idx = portal_mod.resolve_subject_with_index(
            "Mu/Cho",
            full_aliases,
            ["Mathematik", "Chor"]
        )
        self.assertEqual(res_subj, "Chor")
        self.assertEqual(matched_idx, 1)

        res_subj, matched_idx = portal_mod.resolve_subject_with_index(
            "Mathematik",
            full_aliases,
            ["Mathematik"]
        )
        self.assertEqual(res_subj, "Mathematik")
        self.assertIsNone(matched_idx)

        # 7. Arrow syntax mapping: 'Eth/K/Ev -> K' or 'Eth/K/Ev -> 1'
        arrow_aliases = {"Religion": ["Rel", "Eth/K/Ev -> K"]}
        res_subj, matched_idx = portal_mod.resolve_subject_with_index(
            "Eth/K/Ev",
            arrow_aliases,
            []
        )
        self.assertEqual(res_subj, "Religion")
        self.assertEqual(matched_idx, 1)

        arrow_num_aliases = {"Religion": ["Rel", "Eth/K/Ev -> 1"]}
        res_subj, matched_idx = portal_mod.resolve_subject_with_index(
            "Eth/K/Ev",
            arrow_num_aliases,
            []
        )
        self.assertEqual(res_subj, "Religion")
        self.assertEqual(matched_idx, 1)

        mu_arrow_aliases = {"Musik": ["Mu", "Mu/Cho -> Mu"]}
        res_subj, matched_idx = portal_mod.resolve_subject_with_index(
            "Mu/Cho",
            mu_arrow_aliases,
            []
        )
        self.assertEqual(res_subj, "Musik")
        self.assertEqual(matched_idx, 0)

        # 8. User intentionally pruned YAML: deleted Ethik and Evangelische Religion, kept only Religion: [K]
        pruned_aliases = {"Religion": ["K"]}
        res_subj, matched_idx = portal_mod.resolve_subject_with_index(
            "Eth/K/Ev",
            pruned_aliases,
            []
        )
        self.assertEqual(res_subj, "Religion")
        self.assertEqual(matched_idx, 1)

    def test_subject_aliases_yaml_parsing_and_dumping(self):
        """Test parsing and dumping subject aliases YAML."""
        yaml_text = """
Mathematik:
  - M
  - Ma
Deutsch:
  - D
  - De
"""
        parsed = portal_mod.parse_subject_aliases_yaml(yaml_text)
        self.assertIn("Mathematik", parsed)
        self.assertEqual(parsed["Mathematik"], ["M", "Ma"])
        self.assertEqual(parsed["Deutsch"], ["D", "De"])

        dumped = portal_mod.dump_subject_aliases_yaml(parsed)
        reparsed = portal_mod.parse_subject_aliases_yaml(dumped)
        self.assertEqual(parsed, reparsed)

        # Empty input returns empty dict, never resurrects defaults
        empty_parsed = portal_mod.parse_subject_aliases_yaml("")
        self.assertEqual(empty_parsed, {})
        spaces_parsed = portal_mod.parse_subject_aliases_yaml("   \n  ")
        self.assertEqual(spaces_parsed, {})

        # Intentionally pruned YAML preserves only the specified keys
        pruned_yaml = "Religion:\n  - K\n  - Eth/K/Ev -> K\n"
        pruned_res = portal_mod.parse_subject_aliases_yaml(pruned_yaml)
        self.assertEqual(list(pruned_res.keys()), ["Religion"])
        self.assertEqual(pruned_res["Religion"], ["K", "Eth/K/Ev -> K"])

        # Invalid YAML raises ValueError
        with self.assertRaises(ValueError):
            portal_mod.parse_subject_aliases_yaml("Mathematik: [unclosed")

    def test_substitutions_storage_and_matching(self):
        """Test storing substitutions and slot/day matching in SchoolGradesData."""
        data = SchoolGradesData("Max")
        data.timetable = {
            "slots": [
                {"id": "slot_1", "type": "lesson", "number": "1", "label": "1. Stunde", "start": "08:00", "end": "08:45"},
                {"id": "slot_2", "type": "lesson", "number": "2", "label": "2. Stunde", "start": "08:45", "end": "09:30"},
            ],
            "schedule": {
                "slot_1": {"monday": {"subject": "Mathematik", "room": "R101"}},
                "slot_2": {"monday": {"subject": "Deutsch", "room": "R101"}},
            },
        }

        subst_data = {
            "available": True,
            "stand": "06.10.2026 07:30",
            "days": [
                {
                    "date": "2026-10-06",
                    "entries": [
                        {
                            "lesson": "1",
                            "teacher": "Mst",
                            "substitute": "Sch",
                            "subject": "Ma",
                            "room": "R204",
                            "info": "Vertretung",
                            "kind": "vertretung",
                        },
                        {
                            "lesson": "2",
                            "teacher": "Lrn",
                            "substitute": "---",
                            "subject": "De",
                            "room": "",
                            "info": "Entfällt",
                            "kind": "entfall",
                        },
                    ],
                }
            ],
        }

        data.set_portal_substitutions(subst_data)
        entries = data.get_substitutions_for_date("2026-10-06")
        self.assertEqual(len(entries), 2)
        self.assertEqual(entries[0]["subject_resolved"], "Mathematik")
        self.assertEqual(entries[1]["subject_resolved"], "Deutsch")
        self.assertEqual(entries[1]["kind"], "entfall")

        slot1_subst = data.get_substitution_for_slot("2026-10-06", "slot_1")
        self.assertIsNotNone(slot1_subst)
        self.assertEqual(slot1_subst["substitute"], "Sch")

        slot2_subst = data.get_substitution_for_slot("2026-10-06", "2")
        self.assertIsNotNone(slot2_subst)
        self.assertEqual(slot2_subst["kind"], "entfall")

        # Test substitution entry with slash subject/teacher/room
        subst_slash = {
            "days": [
                {
                    "date": "2026-10-07",
                    "entries": [
                        {
                            "lesson": "3",
                            "subject": "Eth/K/Ev",
                            "teacher": "Re/Li/Ma",
                            "room": "105/853/333",
                            "substitute": "Vertretung",
                            "kind": "vertretung",
                        }
                    ],
                }
            ]
        }
        child = SchoolGradesData("Lena")
        child.subject_aliases = {"Religion": ["Rel", "K"]}
        child._subjects = ["Mathematik", "Religion"]
        child.set_portal_substitutions(subst_slash)
        entries_slash = child.get_substitutions_for_date("2026-10-07")
        self.assertEqual(len(entries_slash), 1)
        self.assertEqual(entries_slash[0]["subject_resolved"], "Religion")
        self.assertEqual(entries_slash[0]["teacher"], "Li")
        self.assertEqual(entries_slash[0]["room"], "853")

    def test_substitution_subject_resolution_and_elective_filtering_and_prep_timing(self):
        """Test multi-token subject resolution, elective filtering, and prep timing."""
        # 1. Multi-token resolution ('Sm Sm', 'Sm (Fb)' -> 'Sport')
        aliases = const_mod.DEFAULT_SUBJECT_ALIASES
        enrolled = ["Mathematik", "Deutsch", "Religion", "Sport"]
        self.assertEqual(portal_mod.resolve_subject_name("Sm Sm", aliases, enrolled), "Sport")
        self.assertEqual(portal_mod.resolve_subject_name("Sm (Fb)", aliases, enrolled), "Sport")

        # 2. HTML deduplication in parse_substitutions
        html_dup = """
        <div id="asam_content">
          <div class="main_center">
            <div class="list">Mittwoch, 07.10.2026</div>
            <table class="table-striped">
              <tr>
                <td>5</td><td>LehrerA</td><td>VertretungB</td>
                <td><span>Sm</span> <span>Sm</span></td>
                <td>TH1</td><td>Vertretung</td>
              </tr>
            </table>
          </div>
        </div>
        """
        parsed_subst = portal_mod.parse_substitutions(html_dup)
        self.assertTrue(parsed_subst.get("available"))
        self.assertEqual(parsed_subst["days"][0]["entries"][0]["subject"], "Sm")

        # 3. Elective filtering in SchoolGradesData
        child = SchoolGradesData("Felix")
        child._subjects = ["Mathematik", "Deutsch", "Religion", "Sport"]
        child.subject_aliases = {"Religion": ["Rel", "K"]}

        # Catholic/Religion enrolled: 'K' is relevant, 'Ev' is NOT relevant
        self.assertTrue(child.is_substitution_relevant_for_child({"subject": "K", "lesson": "3"}))
        self.assertFalse(child.is_substitution_relevant_for_child({"subject": "Ev", "lesson": "3"}))
        self.assertFalse(child.is_substitution_relevant_for_child({"subject": "Eth", "lesson": "3"}))

        # Enrolled in Sport: 'Sm' and 'Sm Sm' are relevant
        self.assertTrue(child.is_substitution_relevant_for_child({"subject": "Sm Sm", "lesson": "5"}))
        self.assertTrue(child.is_substitution_relevant_for_child({"subject": "Sm", "lesson": "5"}))

        # Not enrolled in Französisch: 'F' is NOT relevant
        self.assertFalse(child.is_substitution_relevant_for_child({"subject": "F", "lesson": "2"}))

        # Set portal substitutions with both relevant and irrelevant entries
        subst_bundle = {
            "days": [
                {
                    "date": "2026-10-07",
                    "entries": [
                        {"lesson": "3", "subject": "Ev", "kind": "entfall"},
                        {"lesson": "5", "subject": "Sm Sm", "kind": "vertretung", "substitute": "Hr. Schmidt"},
                    ]
                }
            ]
        }
        child.set_portal_substitutions(subst_bundle)
        # only_relevant=True returns only the Sport entry
        rel_entries = child.get_substitutions_for_date("2026-10-07", only_relevant=True)
        self.assertEqual(len(rel_entries), 1)
        self.assertEqual(rel_entries[0]["subject_resolved"], "Sport")
        self.assertEqual(rel_entries[0]["substitute"], "Hr. Schmidt")

        # only_relevant=False returns all entries
        all_entries = child.get_substitutions_for_date("2026-10-07", only_relevant=False)
        self.assertEqual(len(all_entries), 2)

        # 4. Preparation timing logic (before school vs during school vs after school)
        child.timetable = {
            "slots": [
                {"id": "slot_1", "type": "lesson", "number": "1", "label": "1. Stunde", "start": "08:00", "end": "08:45"},
                {"id": "slot_2", "type": "lesson", "number": "2", "label": "2. Stunde", "start": "08:45", "end": "09:30"},
                {"id": "slot_3", "type": "lesson", "number": "3", "label": "3. Stunde", "start": "09:45", "end": "10:30"},
                {"id": "slot_4", "type": "lesson", "number": "4", "label": "4. Stunde", "start": "10:30", "end": "11:15"},
                {"id": "slot_5", "type": "lesson", "number": "5", "label": "5. Stunde", "start": "11:30", "end": "12:15"},
                {"id": "slot_6", "type": "lesson", "number": "6", "label": "6. Stunde", "start": "12:15", "end": "13:00"},
            ],
            "schedule": {
                "slot_1": {"wednesday": {"subject": "Mathematik"}},
                "slot_2": {"wednesday": {"subject": "Deutsch"}},
                "slot_3": {"wednesday": {"subject": "Religion"}},
                "slot_4": {"wednesday": {"subject": "Geschichte"}},
                "slot_5": {"wednesday": {"subject": "Sport"}},
                "slot_6": {"wednesday": {"subject": "Sport"}},
            }
        }

        # Wednesday 2026-10-07 at 07:15 AM (before school start of 1st lesson):
        # Must return TODAY (Wednesday)
        wed_morning = datetime(2026, 10, 7, 7, 15)
        day_key, target_date = child.get_next_school_day_date(ref_dt=wed_morning)
        self.assertEqual(day_key, "wednesday")
        self.assertEqual(target_date, date(2026, 10, 7))

        # Wednesday 2026-10-07 at 14:00 (after school end):
        # Must advance to tomorrow (Thursday)
        wed_afternoon = datetime(2026, 10, 7, 14, 0)
        day_key, target_date = child.get_next_school_day_date(ref_dt=wed_afternoon)
        self.assertEqual(day_key, "thursday")
        self.assertEqual(target_date, date(2026, 10, 8))

        # Friday 2026-10-09 at 14:00 (after school):
        # Must advance to Monday
        fri_afternoon = datetime(2026, 10, 9, 14, 0)
        day_key, target_date = child.get_next_school_day_date(ref_dt=fri_afternoon)
        self.assertEqual(day_key, "monday")
        self.assertEqual(target_date, date(2026, 10, 12))

    def test_convert_portal_lessons_to_timetable(self):
        """Test converting parsed portal lessons into SchoolGrades timetable structure."""
        lessons = [
            {"weekday": 1, "lesson": "1", "start": "08:00", "end": "08:45", "subject": "Ma", "room": "R101"},
            {"weekday": 1, "lesson": "2", "start": "08:45", "end": "09:30", "subject": "De", "room": "R101"},
            {
                "weekday": 2,
                "lesson": "3",
                "start": "09:45",
                "end": "10:30",
                "subject": "Eth/K/Ev",
                "teacher": "Re/Li/Ma",
                "room": "105/853/333",
            },
        ]
        tt = portal_mod.convert_portal_lessons_to_timetable(
            lessons,
            aliases={"Religion": ["Rel", "K"]},
            existing_subjects=["Mathematik", "Religion"],
        )
        self.assertIn("slots", tt)
        self.assertIn("schedule", tt)
        slot1_data = tt["schedule"]["slot_1"]["monday"]
        self.assertEqual(slot1_data["subject"], "Mathematik")
        self.assertEqual(slot1_data["raw_subject"], "Ma")
        self.assertEqual(slot1_data["room"], "R101")

        # Verify positional slash resolution: Eth/K/Ev (index 1 for K) -> Li and 853
        slot3_tuesday = tt["schedule"]["slot_3"]["tuesday"]
        self.assertEqual(slot3_tuesday["subject"], "Religion")
        self.assertEqual(slot3_tuesday["teacher"], "Li")
        self.assertEqual(slot3_tuesday["room"], "853")
        self.assertEqual(slot3_tuesday["raw_subject"], "Eth/K/Ev")
        self.assertEqual(slot3_tuesday["raw_teacher"], "Re/Li/Ma")
        self.assertEqual(slot3_tuesday["raw_room"], "105/853/333")

        # Verify slots are sorted chronologically by start time: breaks appear in correct order
        slot_ids = [s["id"] for s in tt["slots"]]
        self.assertEqual(slot_ids[:6], ["slot_1", "slot_2", "break_1", "slot_3", "slot_4", "break_2"])

    def test_portal_sync_timetable_default_is_false(self):
        """Test that portal_sync_timetable defaults to False to prevent overwriting manual timetables."""
        data = SchoolGradesData("Paul")
        self.assertFalse(data.portal_sync_timetable)
        self.assertTrue(data.portal_sync_substitutions)
        self.assertTrue(data.portal_sync_exams)

    def test_portal_error_handling_exceptions(self):
        """Test that async_fetch_child_portal_data returns user-friendly messages on portal exceptions."""
        import asyncio
        from unittest.mock import AsyncMock, MagicMock, patch

        class MockBadCredentialsException(Exception): pass
        class MockCannotConnectException(Exception): pass
        class MockResolveHostnameException(Exception): pass
        class MockStudentListException(Exception): pass

        async def run_test():
            with patch.object(portal_mod, "HAVE_PYELTERNPORTAL", True), \
                 patch.object(portal_mod, "BadCredentialsException", MockBadCredentialsException), \
                 patch.object(portal_mod, "CannotConnectException", MockCannotConnectException), \
                 patch.object(portal_mod, "ResolveHostnameException", MockResolveHostnameException), \
                 patch.object(portal_mod, "StudentListException", MockStudentListException), \
                 patch.object(portal_mod, "ElternPortalAPI") as mock_api_cls:

                mock_instance = mock_api_cls.return_value
                mock_instance.async_base_online = AsyncMock()

                # 1. BadCredentialsException (e.g. pupil-selector tag error caused by bad auth)
                mock_instance.async_login_online = AsyncMock(side_effect=MockBadCredentialsException("The tag with class 'pupil-selector' could not be found."))
                res = await portal_mod.async_fetch_child_portal_data(
                    session=None,
                    school="gy-peissenberg",
                    username="user@example.com",
                    password="wrong_password",
                    student_id="12345",
                )
                self.assertFalse(res["success"])
                self.assertEqual(res["error"], "bad_credentials")
                self.assertIn("Benutzername oder Passwort falsch", res["message"])

                # 2. CannotConnectException
                mock_instance.async_login_online = AsyncMock(side_effect=MockCannotConnectException("Timeout"))
                res = await portal_mod.async_fetch_child_portal_data(
                    session=None,
                    school="gy-peissenberg",
                    username="user@example.com",
                    password="secret",
                    student_id="12345",
                )
                self.assertFalse(res["success"])
                self.assertEqual(res["error"], "cannot_connect")

                # 3. ResolveHostnameException
                mock_instance.async_login_online = AsyncMock(side_effect=MockResolveHostnameException("Unknown host"))
                res = await portal_mod.async_fetch_child_portal_data(
                    session=None,
                    school="invalid-school-name",
                    username="user@example.com",
                    password="secret",
                    student_id="12345",
                )
                self.assertFalse(res["success"])
                self.assertEqual(res["error"], "invalid_school")

                # 4. StudentListException
                mock_instance.async_login_online = AsyncMock(side_effect=MockStudentListException("No students found"))
                res = await portal_mod.async_fetch_child_portal_data(
                    session=None,
                    school="gy-peissenberg",
                    username="user@example.com",
                    password="secret",
                    student_id="12345",
                )
                self.assertFalse(res["success"])
                self.assertEqual(res["error"], "no_students")

        asyncio.run(run_test())

    def test_copy_sibling_portal_credentials(self):
        """Test sharing and copying portal settings from sibling child."""
        child1 = SchoolGradesData("ChildA")
        child1.set_portal_settings(
            enabled=True,
            school="gymnasium-test",
            username="parent@example.com",
            password="securePassword123!",
            student_id="101",
            student_name="Child A",
        )
        self.assertEqual(child1.portal_school, "gymnasium-test")
        self.assertEqual(child1.portal_username, "parent@example.com")
        self.assertEqual(child1.portal_password, "securePassword123!")

        # Child B copies credentials from sibling Child A
        child2 = SchoolGradesData("ChildB")
        child2.set_portal_settings(
            enabled=True,
            school=child1.portal_school,
            username=child1.portal_username,
            password=child1.portal_password,
            student_id="102",
            student_name="Child B",
        )
        self.assertEqual(child2.portal_school, "gymnasium-test")
        self.assertEqual(child2.portal_username, "parent@example.com")
        self.assertEqual(child2.portal_password, "securePassword123!")
        self.assertEqual(child2.portal_student_id, "102")

    def test_parse_appointments_and_exam_detection(self):
        """Test parsing raw appointment JSON from Eltern-Portal, detecting exams and resolving subjects."""
        demo_appointments = portal_mod.DEMO_JSON_APPOINTMENT
        aliases = {"Englisch": ["E", "Eng"], "Mathematik": ["M", "Ma"], "Latein": ["L", "Lat"]}
        subjects = ["Englisch", "Mathematik", "Deutsch", "Latein"]

        parsed = portal_mod.parse_appointments(demo_appointments, aliases=aliases, existing_subjects=subjects)
        self.assertIsInstance(parsed, list)
        self.assertGreater(len(parsed), 0)

        # Check the demo appointment item (ID id_1: Schulaufgabe in Englisch)
        exam_item = next((a for a in parsed if a["id"] == "id_1"), None)
        self.assertIsNotNone(exam_item)
        self.assertEqual(exam_item["title"], "Schulaufgabe in Englisch")
        self.assertEqual(exam_item["date"], "2024-10-24")
        self.assertTrue(exam_item["is_exam"])
        self.assertEqual(exam_item["subject"], "Englisch")
        self.assertEqual(exam_item["class_name"], "event-important")

        # Test additional appointment varieties
        custom_raw = [
            {
                "id": "2",
                "title": "Wandertag der 7. Klassen",
                "start": "1729807200000",
                "end": "1729836000000",
                "className": "event-info",
            },
            {
                "id": "3",
                "title": "1. Schulaufgabe Mathematik",
                "start": "1730000000000",
                "end": "1730003600000",
                "className": "",
            },
            {
                "id": "4",
                "title": "Vokabeltest L",
                "start": "1730100000000",
                "end": "1730103600000",
                "className": "",
            },
        ]
        parsed_custom = portal_mod.parse_appointments(custom_raw, aliases=aliases, existing_subjects=subjects)
        self.assertEqual(len(parsed_custom), 3)

        wandertag = parsed_custom[0]
        self.assertFalse(wandertag["is_exam"])
        self.assertEqual(wandertag["subject"], "")

        mathe_exam = parsed_custom[1]
        self.assertTrue(mathe_exam["is_exam"])
        self.assertEqual(mathe_exam["subject"], "Mathematik")

        latein_test = parsed_custom[2]
        self.assertTrue(latein_test["is_exam"])
        self.assertEqual(latein_test["subject"], "Latein")

    def test_portal_appointments_storage_and_query(self):
        """Test storing and querying portal appointments and exams in SchoolGradesData."""
        child = SchoolGradesData("Richard")
        self.assertEqual(child.get_portal_appointments(), [])
        self.assertEqual(child.get_exams_for_date("2024-10-24"), [])

        sample_appts = [
            {
                "id": "1",
                "title": "Schulaufgabe in Englisch",
                "title_short": "",
                "class_name": "event-important",
                "start": "2024-10-24T00:00:00+02:00",
                "end": "2024-10-24T23:59:59+02:00",
                "date": "2024-10-24",
                "is_exam": True,
                "subject": "Englisch",
            },
            {
                "id": "2",
                "title": "Herbstfest",
                "title_short": "",
                "class_name": "event-info",
                "start": "2024-10-24T14:00:00+02:00",
                "end": "2024-10-24T18:00:00+02:00",
                "date": "2024-10-24",
                "is_exam": False,
                "subject": "",
            },
            {
                "id": "3",
                "title": "Klausur Deutsch",
                "title_short": "",
                "class_name": "",
                "start": "2024-10-28T08:00:00+01:00",
                "end": "2024-10-28T09:30:00+01:00",
                "date": "2024-10-28",
                "is_exam": True,
                "subject": "Deutsch",
            },
        ]
        child.set_portal_appointments(sample_appts)
        self.assertEqual(len(child.get_portal_appointments()), 3)

        # Query exams for date 2024-10-24 -> should only return the 1 exam, not the festival
        exams_24 = child.get_exams_for_date("2024-10-24")
        self.assertEqual(len(exams_24), 1)
        self.assertEqual(exams_24[0]["title"], "Schulaufgabe in Englisch")
        self.assertEqual(exams_24[0]["subject"], "Englisch")

        # Query exams for date 2024-10-28 -> should return 1 exam
        exams_28 = child.get_exams_for_date("2024-10-28")
        self.assertEqual(len(exams_28), 1)
        self.assertEqual(exams_28[0]["subject"], "Deutsch")

        # Query exams for date without exams
        exams_empty = child.get_exams_for_date("2024-10-25")
        self.assertEqual(exams_empty, [])

        # Test serialization to dict
        data_dict = child.to_dict()
        self.assertIn("portal_appointments", data_dict)
        self.assertEqual(len(data_dict["portal_appointments"]), 3)

        # Test reload from dict
        child_restored = SchoolGradesData("Richard", data=data_dict)
        self.assertEqual(len(child_restored.get_portal_appointments()), 3)
        self.assertEqual(child_restored.get_exams_for_date("2024-10-24")[0]["subject"], "Englisch")

    def test_async_fetch_child_portal_data_appointments(self):
        """Test async fetching child portal appointments with demo data."""
        import asyncio
        from unittest.mock import AsyncMock, patch

        class MockStudent:
            student_id = "demo_1"
            name = "Demo Kind"

        async def run_test():
            with patch.object(portal_mod, "HAVE_PYELTERNPORTAL", True), \
                 patch.object(portal_mod, "ElternPortalAPI") as mock_api_cls:
                mock_instance = mock_api_cls.return_value
                mock_instance.students = [MockStudent()]
                mock_instance.async_base_demo = AsyncMock()
                mock_instance.async_login_demo = AsyncMock()
                mock_instance.async_set_child_demo = AsyncMock()

                result = await portal_mod.async_fetch_child_portal_data(
                    session=None,
                    school="demo",
                    username="demo",
                    password="demo",
                    student_id="demo_1",
                    fetch_timetable=False,
                    fetch_substitutions=False,
                    fetch_appointments=True,
                )
                self.assertTrue(result["success"])
                self.assertIn("appointments", result)
                appts = result["appointments"]
                self.assertIsInstance(appts, list)
                self.assertGreater(len(appts), 0)
                self.assertTrue(any(a.get("is_exam") for a in appts))

        asyncio.run(run_test())

    def test_portal_ignore_info_events_filter(self):
        """Test filtering out 'event-info' non-exam appointments while preserving exams and warning/important events."""
        from custom_components.school_grades.portal import parse_appointments
        from custom_components.school_grades.storage import SchoolGradesData
        from datetime import date, timedelta

        raw_events = [
            {
                "id": 1,
                "title": "Schulfest der gesamten Schule",
                "class": "event-info",
                "start": (date.today() + timedelta(days=2)).isoformat(),
            },
            {
                "id": 2,
                "title": "Vokabeltest Englisch",
                "class": "event-info",
                "start": (date.today() + timedelta(days=3)).isoformat(),
            },
            {
                "id": 3,
                "title": "Wichtiger Elternabend",
                "class": "event-important",
                "start": (date.today() + timedelta(days=4)).isoformat(),
            },
            {
                "id": 4,
                "title": "Hitzefrei Warnung",
                "class": "event-warning",
                "start": (date.today() + timedelta(days=5)).isoformat(),
            },
            {
                "id": 5,
                "title": "Vergangener Termin",
                "class": "event-important",
                "start": (date.today() - timedelta(days=5)).isoformat(),
            },
        ]

        # 1. With ignore_info_events=False: all 5 are parsed
        all_parsed = parse_appointments(raw_events, ignore_info_events=False)
        self.assertEqual(len(all_parsed), 5)

        # 2. With ignore_info_events=True: ALL event-info appointments are strictly ignored!
        filtered = parse_appointments(raw_events, ignore_info_events=True)
        self.assertEqual(len(filtered), 3)
        titles = [e["title"] for e in filtered]
        self.assertNotIn("Schulfest der gesamten Schule", titles)
        self.assertNotIn("Vokabeltest Englisch", titles)
        self.assertIn("Wichtiger Elternabend", titles)
        self.assertIn("Hitzefrei Warnung", titles)
        self.assertIn("Vergangener Termin", titles)

        # 3. Test storage integration and retroactive re-filtering
        data = SchoolGradesData("Max")
        data.set_portal_settings(enabled=True, ignore_info_events=False)
        data.set_portal_appointments(all_parsed)
        self.assertEqual(len(data.portal_appointments), 5)

        # Update settings to ignore info events -> strictly re-filters all event-info appointments
        data.set_portal_settings(enabled=True, ignore_info_events=True)
        self.assertEqual(len(data.portal_appointments), 3)
        self.assertNotIn("Schulfest der gesamten Schule", [e["title"] for e in data.portal_appointments])
        self.assertNotIn("Vokabeltest Englisch", [e["title"] for e in data.portal_appointments])

        # 4. Test only_upcoming in get_portal_appointments
        upcoming = data.get_portal_appointments(only_upcoming=True)
        upcoming_titles = [e["title"] for e in upcoming]
        self.assertNotIn("Vergangener Termin", upcoming_titles)
        self.assertNotIn("Vokabeltest Englisch", upcoming_titles)
        self.assertIn("Wichtiger Elternabend", upcoming_titles)
        self.assertIn("Hitzefrei Warnung", upcoming_titles)

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
