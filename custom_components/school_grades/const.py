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

# Defaults
DEFAULT_WEIGHT = 1
DEFAULT_SUBJECTS = ["Mathematik", "Deutsch", "Englisch"]

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
