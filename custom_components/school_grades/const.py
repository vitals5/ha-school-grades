"""Constants for the Schulnoten (School Grades) integration."""

DOMAIN = "school_grades"

# Configuration keys
CONF_CHILD_NAME = "child_name"
CONF_SUBJECT = "subject"
CONF_SUBJECTS = "subjects"
CONF_GRADE = "grade"
CONF_WEIGHT = "weight"
CONF_NAME = "name"
CONF_DATE = "date"
CONF_GRADE_ID = "grade_id"
CONF_CALENDAR = "calendar_entity"

CONF_TIMETABLE = "timetable"
CONF_SLOT_ID = "slot_id"
CONF_DAY = "day"
CONF_ROOM = "room"
CONF_TEACHER = "teacher"

CONF_COUNTRY = "country"
CONF_SHOW_PREP = "show_prep_card"
CONF_SHOW_CALENDAR = "show_calendar_card"
CONF_SHOW_TIMETABLE = "show_timetable_card"
CONF_SHOW_OVERVIEW = "show_overview_card"
CONF_SHOW_BACK_BUTTON = "show_back_button"

# Defaults
DEFAULT_WEIGHT = 1
DEFAULT_SUBJECTS = ["Mathematik", "Deutsch", "Englisch"]
DEFAULT_COUNTRY = "DE"
DEFAULT_SECTION_VISIBILITY = {
    "show_prep_card": True,
    "show_calendar_card": True,
    "show_timetable_card": True,
    "show_overview_card": True,
    "show_back_button": False,
}

# Country grading systems specification
COUNTRY_GRADING_SYSTEMS = {
    "DE": {
        "name": "Deutschland",
        "flag": "🇩🇪",
        "scale": "1.0 - 6.0",
        "best": "1.0",
        "worst": "6.0",
        "lower_is_better": True,
        "grades": [1.0, 1.3, 1.5, 1.7, 2.0, 2.3, 2.5, 2.7, 3.0, 3.3, 3.5, 3.7, 4.0, 4.3, 4.5, 4.7, 5.0, 5.5, 6.0],
    },
    "AT": {
        "name": "Österreich",
        "flag": "🇦🇹",
        "scale": "1 - 5",
        "best": "1",
        "worst": "5",
        "lower_is_better": True,
        "grades": [1.0, 2.0, 3.0, 4.0, 5.0],
    },
    "CH": {
        "name": "Schweiz",
        "flag": "🇨🇭",
        "scale": "6.0 - 1.0",
        "best": "6.0",
        "worst": "1.0",
        "lower_is_better": False,
        "grades": [6.0, 5.5, 5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0],
    },
    "FR": {
        "name": "Frankreich",
        "flag": "🇫🇷",
        "scale": "0 - 20",
        "best": "20",
        "worst": "0",
        "lower_is_better": False,
        "grades": [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    },
    "IT": {
        "name": "Italien",
        "flag": "🇮🇹",
        "scale": "1 - 10",
        "best": "10",
        "worst": "1",
        "lower_is_better": False,
        "grades": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
    "ES": {
        "name": "Spanien",
        "flag": "🇪🇸",
        "scale": "1 - 10",
        "best": "10",
        "worst": "1",
        "lower_is_better": False,
        "grades": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
    "NL": {
        "name": "Niederlande",
        "flag": "🇳🇱",
        "scale": "1.0 - 10.0",
        "best": "10.0",
        "worst": "1.0",
        "lower_is_better": False,
        "grades": [10.0, 9.5, 9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0],
    },
    "PL": {
        "name": "Polen",
        "flag": "🇵🇱",
        "scale": "1 - 6",
        "best": "6",
        "worst": "1",
        "lower_is_better": False,
        "grades": [6.0, 5.0, 4.0, 3.0, 2.0, 1.0],
    },
    "UK": {
        "name": "Großbritannien (UK)",
        "flag": "🇬🇧",
        "scale": "1 - 9 (A* - G)",
        "best": "9 (A*)",
        "worst": "1 (U)",
        "lower_is_better": False,
        "grades": [9.0, 8.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.0],
    },
    "US": {
        "name": "USA (GPA 0.0 - 4.0)",
        "flag": "🇺🇸",
        "scale": "0.0 - 4.0 (A+ - F)",
        "best": "4.0 (A+)",
        "worst": "0.0 (F)",
        "lower_is_better": False,
        "grades": [4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0.0],
    },
    "RU": {
        "name": "Russland",
        "flag": "🇷🇺",
        "scale": "2 - 5",
        "best": "5",
        "worst": "2",
        "lower_is_better": False,
        "grades": [5.0, 4.0, 3.0, 2.0],
    },
    "CN": {
        "name": "China",
        "flag": "🇨🇳",
        "scale": "0 - 100 Punkte / A-F",
        "best": "100 (A)",
        "worst": "0 (F)",
        "lower_is_better": False,
        "grades": [100.0, 95.0, 90.0, 85.0, 80.0, 75.0, 70.0, 65.0, 60.0, 55.0, 50.0],
    },
}

# Signal template for UI updates
SIGNAL_UPDATE_GRADES = "school_grades_update_{entry_id}"

# Service names
SERVICE_ADD_SUBJECT = "add_subject"
SERVICE_REMOVE_SUBJECT = "remove_subject"
SERVICE_ADD_GRADE = "add_grade"
SERVICE_REMOVE_GRADE = "remove_grade"
SERVICE_SET_CALENDAR = "set_calendar"
SERVICE_UPDATE_TIMETABLE = "update_timetable"
SERVICE_UPDATE_TIMETABLE_CELL = "update_timetable_cell"
SERVICE_IMPORT_TIMETABLE = "import_timetable"
SERVICE_UPDATE_SETTINGS = "update_settings"
SERVICE_ADD_CALENDAR_EVENT = "add_calendar_event"
SERVICE_UPDATE_CALENDAR_EVENT = "update_calendar_event"
SERVICE_REMOVE_CALENDAR_EVENT = "remove_calendar_event"

CONF_YAML_CONTENT = "yaml_content"
CONF_SUMMARY = "summary"
CONF_START_TIME = "start_time"
CONF_DESCRIPTION = "description"

CONF_GRADE_LEVEL = "grade_level"
CONF_HOMEWORK_DONE = "homework_done"
CONF_PREPARATION_DONE = "preparation_done"
CONF_PREPARED_SUBJECTS = "prepared_subjects"

SERVICE_SET_HOMEWORK_DONE = "set_homework_done"
SERVICE_SET_PREPARATION_DONE = "set_preparation_done"
SERVICE_TOGGLE_PREPARED_SUBJECT = "toggle_prepared_subject"



