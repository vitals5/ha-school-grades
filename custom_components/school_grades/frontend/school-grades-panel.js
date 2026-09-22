/**
 * Schulnoten Custom Sidebar Panel for Home Assistant
 * Multi-Language (i18n) Support: German (de) & English (en)
 */

const DAYS = [
  { key: 'monday', short: 'Mo' },
  { key: 'tuesday', short: 'Di' },
  { key: 'wednesday', short: 'Mi' },
  { key: 'thursday', short: 'Do' },
  { key: 'friday', short: 'Fr' },
];

const COUNTRY_SYSTEMS = {
  DE: {
    name: "Deutschland",
    flag: "🇩🇪",
    scale: "1.0 - 6.0",
    best: "1.0",
    worst: "6.0",
    lower_is_better: true,
    grades: [
      { val: 1.0, label: "1.0 (Sehr gut)" },
      { val: 1.3, label: "1.3" },
      { val: 1.5, label: "1.5" },
      { val: 1.7, label: "1.7" },
      { val: 2.0, label: "2.0 (Gut)" },
      { val: 2.3, label: "2.3" },
      { val: 2.5, label: "2.5" },
      { val: 2.7, label: "2.7" },
      { val: 3.0, label: "3.0 (Befriedigend)" },
      { val: 3.3, label: "3.3" },
      { val: 3.5, label: "3.5" },
      { val: 3.7, label: "3.7" },
      { val: 4.0, label: "4.0 (Ausreichend)" },
      { val: 4.3, label: "4.3" },
      { val: 4.5, label: "4.5" },
      { val: 4.7, label: "4.7" },
      { val: 5.0, label: "5.0 (Mangelhaft)" },
      { val: 5.5, label: "5.5" },
      { val: 6.0, label: "6.0 (Ungenügend)" }
    ]
  },
  AT: {
    name: "Österreich",
    flag: "🇦🇹",
    scale: "1 - 5",
    best: "1",
    worst: "5",
    lower_is_better: true,
    grades: [
      { val: 1.0, label: "1 (Sehr gut)" },
      { val: 2.0, label: "2 (Gut)" },
      { val: 3.0, label: "3 (Befriedigend)" },
      { val: 4.0, label: "4 (Genügend)" },
      { val: 5.0, label: "5 (Nicht genügend)" }
    ]
  },
  CH: {
    name: "Schweiz",
    flag: "🇨🇭",
    scale: "6.0 - 1.0",
    best: "6.0",
    worst: "1.0",
    lower_is_better: false,
    grades: [
      { val: 6.0, label: "6.0 (Sehr gut)" },
      { val: 5.5, label: "5.5" },
      { val: 5.0, label: "5.0 (Gut)" },
      { val: 4.5, label: "4.5" },
      { val: 4.0, label: "4.0 (Genügend)" },
      { val: 3.5, label: "3.5" },
      { val: 3.0, label: "3.0 (Ungenügend)" },
      { val: 2.5, label: "2.5" },
      { val: 2.0, label: "2.0 (Schlecht)" },
      { val: 1.5, label: "1.5" },
      { val: 1.0, label: "1.0 (Sehr schlecht)" }
    ]
  },
  FR: {
    name: "Frankreich",
    flag: "🇫🇷",
    scale: "0 - 20",
    best: "20",
    worst: "0",
    lower_is_better: false,
    grades: [
      { val: 20.0, label: "20 (Très bien)" },
      { val: 18.0, label: "18" },
      { val: 16.0, label: "16 (Bien)" },
      { val: 14.0, label: "14 (Assez bien)" },
      { val: 12.0, label: "12 (Moyen)" },
      { val: 10.0, label: "10 (Passable)" },
      { val: 8.0, label: "8 (Insuffisant)" },
      { val: 6.0, label: "6" },
      { val: 4.0, label: "4" },
      { val: 2.0, label: "2" },
      { val: 0.0, label: "0" }
    ]
  },
  IT: {
    name: "Italien",
    flag: "🇮🇹",
    scale: "1 - 10",
    best: "10",
    worst: "1",
    lower_is_better: false,
    grades: [
      { val: 10.0, label: "10 (Eccellente)" },
      { val: 9.0, label: "9 (Ottimo)" },
      { val: 8.0, label: "8 (Distinto)" },
      { val: 7.0, label: "7 (Buono)" },
      { val: 6.0, label: "6 (Sufficiente)" },
      { val: 5.0, label: "5 (Insufficiente)" },
      { val: 4.0, label: "4" },
      { val: 3.0, label: "3" },
      { val: 2.0, label: "2" },
      { val: 1.0, label: "1" }
    ]
  },
  ES: {
    name: "Spanien",
    flag: "🇪🇸",
    scale: "1 - 10",
    best: "10",
    worst: "1",
    lower_is_better: false,
    grades: [
      { val: 10.0, label: "10 (Sobresaliente)" },
      { val: 9.0, label: "9 (Sobresaliente)" },
      { val: 8.0, label: "8 (Notable)" },
      { val: 7.0, label: "7 (Notable)" },
      { val: 6.0, label: "6 (Bien)" },
      { val: 5.0, label: "5 (Suficiente)" },
      { val: 4.0, label: "4 (Insuficiente)" },
      { val: 3.0, label: "3" },
      { val: 2.0, label: "2" },
      { val: 1.0, label: "1" }
    ]
  },
  NL: {
    name: "Niederlande",
    flag: "🇳🇱",
    scale: "1.0 - 10.0",
    best: "10.0",
    worst: "1.0",
    lower_is_better: false,
    grades: [
      { val: 10.0, label: "10.0 (Uitmuntend)" },
      { val: 9.0, label: "9.0 (Zeer goed)" },
      { val: 8.0, label: "8.0 (Goed)" },
      { val: 7.0, label: "7.0 (Ruim voldoende)" },
      { val: 6.0, label: "6.0 (Voldoende)" },
      { val: 5.5, label: "5.5 (Pass)" },
      { val: 5.0, label: "5.0 (Onvoldoende)" },
      { val: 4.0, label: "4.0" },
      { val: 3.0, label: "3.0" },
      { val: 2.0, label: "2.0" },
      { val: 1.0, label: "1.0" }
    ]
  },
  PL: {
    name: "Polen",
    flag: "🇵🇱",
    scale: "1 - 6",
    best: "6",
    worst: "1",
    lower_is_better: false,
    grades: [
      { val: 6.0, label: "6 (Celujący)" },
      { val: 5.0, label: "5 (Bardzo dobry)" },
      { val: 4.0, label: "4 (Dobry)" },
      { val: 3.0, label: "3 (Dostateczny)" },
      { val: 2.0, label: "2 (Dopuszczający)" },
      { val: 1.0, label: "1 (Niedostateczny)" }
    ]
  },
  UK: {
    name: "Großbritannien (UK)",
    flag: "🇬🇧",
    scale: "1 - 9 (A* - G)",
    best: "9 (A*)",
    worst: "1 (U)",
    lower_is_better: false,
    grades: [
      { val: 9.0, label: "9 (Grade A*)" },
      { val: 8.0, label: "8 (Grade A*/A)" },
      { val: 7.0, label: "7 (Grade A)" },
      { val: 6.0, label: "6 (Grade B)" },
      { val: 5.0, label: "5 (Grade B/C)" },
      { val: 4.0, label: "4 (Grade C)" },
      { val: 3.0, label: "3 (Grade D)" },
      { val: 2.0, label: "2 (Grade E/F)" },
      { val: 1.0, label: "1 (Grade G/U)" }
    ]
  },
  US: {
    name: "USA (GPA 0.0 - 4.0)",
    flag: "🇺🇸",
    scale: "0.0 - 4.0 (A+ - F)",
    best: "4.0 (A+)",
    worst: "0.0 (F)",
    lower_is_better: false,
    grades: [
      { val: 4.0, label: "4.0 (A+ / A)" },
      { val: 3.7, label: "3.7 (A-)" },
      { val: 3.3, label: "3.3 (B+)" },
      { val: 3.0, label: "3.0 (B)" },
      { val: 2.7, label: "2.7 (B-)" },
      { val: 2.3, label: "2.3 (C+)" },
      { val: 2.0, label: "2.0 (C)" },
      { val: 1.7, label: "1.7 (C-)" },
      { val: 1.3, label: "1.3 (D+)" },
      { val: 1.0, label: "1.0 (D)" },
      { val: 0.0, label: "0.0 (F)" }
    ]
  },
  RU: {
    name: "Russland",
    flag: "🇷🇺",
    scale: "2 - 5",
    best: "5",
    worst: "2",
    lower_is_better: false,
    grades: [
      { val: 5.0, label: "5 (Отлично)" },
      { val: 4.0, label: "4 (Хорошо)" },
      { val: 3.0, label: "3 (Удовлетворительно)" },
      { val: 2.0, label: "2 (Неудовлетворительно)" }
    ]
  },
  CN: {
    name: "China",
    flag: "🇨🇳",
    scale: "0 - 100 Punkte / A-F",
    best: "100 (A)",
    worst: "0 (F)",
    lower_is_better: false,
    grades: [
      { val: 100.0, label: "100 (A+ / 优秀)" },
      { val: 90.0, label: "90 (A / 优秀)" },
      { val: 85.0, label: "85 (B+ / 良好)" },
      { val: 80.0, label: "80 (B / 良好)" },
      { val: 75.0, label: "75 (C+ / 中等)" },
      { val: 70.0, label: "70 (C / 中等)" },
      { val: 60.0, label: "60 (D / 及格 Pass)" },
      { val: 50.0, label: "50 (F / 不及格 Fail)" }
    ]
  }
};

const DEFAULT_TIMETABLE = {
  slots: [
    { id: 'slot_1', type: 'lesson', number: '1', label: '1. Stunde', start: '08:00', end: '08:45' },
    { id: 'slot_2', type: 'lesson', number: '2', label: '2. Stunde', start: '08:45', end: '09:30' },
    { id: 'break_1', type: 'break', label: '1. Pause', start: '09:30', end: '09:45' },
    { id: 'slot_3', type: 'lesson', number: '3', label: '3. Stunde', start: '09:45', end: '10:30' },
    { id: 'slot_4', type: 'lesson', number: '4', label: '4. Stunde', start: '10:30', end: '11:15' },
    { id: 'break_2', type: 'break', label: '2. Pause', start: '11:15', end: '11:30' },
    { id: 'slot_5', type: 'lesson', number: '5', label: '5. Stunde', start: '11:30', end: '12:15' },
    { id: 'slot_6', type: 'lesson', number: '6', label: '6. Stunde', start: '12:15', end: '13:00' },
  ],
  schedule: {},
};

const I18N = {
  de: {
    panel_title: "🎓 Schulnoten & Stundenplan",
    panel_subtitle: "Notenübersicht, Klausurenkalender & Stundenplan für deine Kinder",
    no_children_title: "🎓 Schulnoten & Stundenplan Verwaltung",
    no_children_text1: "Es wurden noch keine Kinder-Instanzen in Home Assistant konfiguriert.",
    no_children_text2: "Bitte gehe zu Einstellungen ➔ Geräte & Dienste ➔ Integration hinzufügen ➔ Schulnoten.",
    total_avg: "Gesamtdurchschnitt",
    menu_toggle: "Seitenleiste öffnen / schließen",
    back_btn_tooltip: "Zurück zum vorherigen Dashboard / Panel",
    
    // Prep card
    prep_title: "🎒 Vorbereitung für den nächsten Schultag",
    prep_badge_weekday: "⏰ Morgen auf dem Stundenplan",
    prep_badge_weekend: "📅 Wochenend-Vorbereitung",
    prep_exam_alert: "Achtung! Prüfungen / Klausuren an diesem Tag:",
    prep_empty: "Am {day} stehen laut Stundenplan keine Unterrichtsfächer an!",
    exam_badge: "⚠️ KLAUSUR / TEST",
    
    // Calendar card
    calendar_title: "📅 Anstehende Klausuren & Termine ({count})",
    calendar_select_label: "Schul-Kalender:",
    no_calendar_assigned: "-- Kein Kalender zugewiesen --",
    calendar_hint: "💡 Wähle in den Einstellungen einen Schul-Kalender (z. B. Google Kalender, Local HA Calendar, CalDAV), um anstehende Klausuren einzublenden.",
    no_events: "🎉 Keine anstehenden Klausuren oder Termine im Kalender eingetragen!",
    time_at: "um {time} Uhr",
    all_day: "(Ganztägig)",
    countdown_past: "Vergangen",
    countdown_today: "⚡ HEUTE",
    countdown_tomorrow: "⚠️ Morgen",
    countdown_days: "In {days} Tagen",
    add_event_btn: "➕ Termin / Klausur eintragen",
    add_event_title: "📅 Neuen Termin / Klausur im Kalender erstellen",
    edit_event_title: "✏️ Termin / Klausur bearbeiten",
    event_summary_label: "Terminname / Klausur",
    event_summary_placeholder: "z. B. Mathe Schulaufgabe, Bio Test",
    event_date_label: "Datum",
    event_time_label: "Uhrzeit",
    event_desc_label: "Beschreibung / Raum (optional)",
    event_desc_placeholder: "z. B. Raum 101, Themen Kap. 3",
    submit_add_event: "💾 Termin im Kalender speichern",
    submit_update_event: "💾 Änderungen speichern",
    delete_event_btn: "🗑️ Termin löschen",
    delete_event_confirm: "Möchtest du den Termin \"{summary}\" wirklich aus dem Kalender löschen?",
    
    // Timetable card
    timetable_title: "📅 Wochenstundenplan",
    timetable_subtitle: "Klicke auf eine Zelle zum Bearbeiten oder nutze den YAML Import/Export",
    yaml_button: "📋 YAML Import / Export",
    legend_now: "⚡ JETZT",
    legend_today: "Heute",
    time_hour_col: "Zeit / Stunde",
    break_label: "Pause",
    today_badge: "HEUTE",
    now_badge: "⚡ JETZT",
    
    // Add grade form
    add_grade_title: "➕ Neue Note eintragen",
    subject_label: "Schulfach",
    grade_label: "Note (1.0 bis 6.0)",
    weight_label: "Gewichtung",
    weight_times: "{weight}-fach",
    grade_name_label: "Bezeichnung (z. B. 1. Schulaufgabe)",
    grade_name_placeholder: "z. B. Schulaufgabe, Ex, Mündlich",
    date_label: "Datum",
    submit_add_grade: "➕ Note eintragen",
    toggle_add_grade_btn: "➕ Neue Note eintragen",
    close_add_grade_btn: "✖ Formular ausblenden",
    
    // Manage subjects form
    manage_subjects_title: "📘 Schulfächer verwalten",
    new_subject_label: "Neues Schulfach hinzufügen",
    new_subject_placeholder: "z. B. Physik, Kunst, Musik",
    submit_add_subject: "➕ Fach anlegen",
    delete_subject_label: "Bestehendes Fach löschen",
    delete_btn: "🗑️ Löschen",
    delete_subject_confirm: "Möchtest du das Fach \"{subject}\" wirklich inklusive aller Noten löschen?",
    
    // Subjects overview
    overview_title: "📘 Fächer & Notenübersicht",
    avg_label: "Schnitt",
    no_grades_yet: "Noch keine Noten eingetragen",
    table_grade: "Note",
    table_weight: "Gewichtung",
    table_date: "Datum",
    table_name: "Bezeichnung",
    table_action: "Aktion",
    delete_grade_confirm: "Möchtest du diese Note wirklich löschen?",
    
    // Settings
    settings_btn: "Einstellungen",
    settings_title: "⚙️ Einstellungen ({child})",
    settings_tab_general: "⚙️ Allgemein",
    settings_tab_subjects: "📘 Fächer verwalten",
    settings_tab_timetable: "📅 Stundenplan",
    grade_level_label: "Klasse / Jahrgangsstufe",
    grade_level_placeholder: "z. B. 5a, 7b",
    homework_card: "Hausaufgaben",
    homework_done_badge: "✓ Erledigt",
    homework_open_badge: "Offen",
    prep_card_status: "Vorbereitung",
    prep_done_badge: "✓ Erledigt",
    prep_open_badge: "Offen",
    country_label: "Land / Schulsystem",
    country_hint: "Bestimmt die Notenskala und Bewertung für diese Instanz.",
    section_visibility_title: "Bereiche des Panels aus/einblenden",
    section_prep: "Vorbereitung für den nächsten Schultag",
    section_calendar: "Anstehende Klausuren Termine",
    section_timetable: "Wochenstundenplan",
    section_overview: "Fächer Notenübersicht",
    section_back_btn: "Zurück-Button in der Kopfzeile anzeigen",

    // Modals
    modal_cell_title: "✏️ Stundenplan bearbeiten",
    no_subject_free: "-- Kein Fach (Freistunde) --",
    custom_subject_opt: "➕ Neues / Anderes Fach eingeben...",
    custom_subject_placeholder: "Eigenes Fach eingeben",
    room_label: "Raum (optional)",
    room_placeholder: "z. B. R102",
    teacher_label: "Lehrkraft (optional)",
    teacher_placeholder: "z. B. Fr. Schmidt",
    cancel_btn: "Abbrechen",
    save_btn: "💾 Speichern",
    
    yaml_modal_title: "📋 Stundenplan YAML Import / Export",
    yaml_modal_subtitle: "Füge hier deinen Stundenplan im YAML-Format ein oder kopiere die aktuelle Konfiguration",
    yaml_textarea_label: "Stundenplan YAML-Konfiguration ({child})",
    copy_btn: "📋 Kopieren",
    copied_btn: "✅ Kopiert!",
    import_btn: "📥 YAML Importieren",

    days: {
      monday: "Montag",
      tuesday: "Dienstag",
      wednesday: "Mittwoch",
      thursday: "Donnerstag",
      friday: "Freitag"
    }
  },
  en: {
    panel_title: "🎓 School Grades & Timetable",
    panel_subtitle: "Grade overview, exam calendar & timetable for your children",
    no_children_title: "🎓 School Grades & Timetable Management",
    no_children_text1: "No child instances have been configured in Home Assistant yet.",
    no_children_text2: "Please go to Settings ➔ Devices & Services ➔ Add Integration ➔ Schulnoten.",
    total_avg: "Overall Average",
    menu_toggle: "Open / close sidebar",
    back_btn_tooltip: "Back to previous dashboard / panel",
    
    // Prep card
    prep_title: "🎒 Preparation for the Next School Day",
    prep_badge_weekday: "⏰ Tomorrow's Schedule",
    prep_badge_weekend: "📅 Weekend Preparation",
    prep_exam_alert: "Warning! Upcoming exams on this day:",
    prep_empty: "No subjects scheduled for {day} according to the timetable!",
    exam_badge: "⚠️ EXAM / TEST",
    
    // Calendar card
    calendar_title: "📅 Upcoming Exams & Events ({count})",
    calendar_select_label: "School Calendar:",
    no_calendar_assigned: "-- No calendar assigned --",
    calendar_hint: "💡 Select a school calendar in Settings (e.g., Google Calendar, Local HA Calendar, CalDAV) to display upcoming exams.",
    no_events: "🎉 No upcoming exams or events recorded in the calendar!",
    time_at: "at {time}",
    all_day: "(All day)",
    countdown_past: "Past",
    countdown_today: "⚡ TODAY",
    countdown_tomorrow: "⚠️ Tomorrow",
    countdown_days: "In {days} days",
    add_event_btn: "➕ Add Exam / Event",
    add_event_title: "📅 Create New Exam / Event in Calendar",
    edit_event_title: "✏️ Edit Exam / Event",
    event_summary_label: "Title / Exam Name",
    event_summary_placeholder: "e.g., Math Exam, Biology Quiz",
    event_date_label: "Date",
    event_time_label: "Time",
    event_desc_label: "Description / Room (optional)",
    event_desc_placeholder: "e.g., Room 101, Topics Ch. 3",
    submit_add_event: "💾 Save Event to Calendar",
    submit_update_event: "💾 Save Changes",
    delete_event_btn: "🗑️ Delete Event",
    delete_event_confirm: "Are you sure you want to delete the event \"{summary}\" from the calendar?",
    
    // Timetable card
    timetable_title: "📅 Weekly Timetable",
    timetable_subtitle: "Click a cell to edit or use YAML Import/Export",
    yaml_button: "📋 YAML Import / Export",
    legend_now: "⚡ NOW",
    legend_today: "Today",
    time_hour_col: "Time / Slot",
    break_label: "Break",
    today_badge: "TODAY",
    now_badge: "⚡ NOW",
    
    // Add grade form
    add_grade_title: "➕ Record New Grade",
    subject_label: "Subject",
    grade_label: "Grade (1.0 to 6.0)",
    weight_label: "Weight",
    weight_times: "{weight}x",
    grade_name_label: "Label (e.g. 1st Exam)",
    grade_name_placeholder: "e.g. Exam, Quiz, Oral",
    date_label: "Date",
    submit_add_grade: "➕ Record Grade",
    toggle_add_grade_btn: "➕ Record New Grade",
    close_add_grade_btn: "✖ Hide Form",
    
    // Manage subjects form
    manage_subjects_title: "📘 Manage Subjects",
    new_subject_label: "Add New Subject",
    new_subject_placeholder: "e.g. Physics, Art, Music",
    submit_add_subject: "➕ Create Subject",
    delete_subject_label: "Delete Existing Subject",
    delete_btn: "🗑️ Delete",
    delete_subject_confirm: "Are you sure you want to delete the subject \"{subject}\" and all associated grades?",
    
    // Subjects overview
    overview_title: "📘 Subjects & Grades Overview",
    avg_label: "Avg",
    no_grades_yet: "No grades recorded yet",
    table_grade: "Grade",
    table_weight: "Weight",
    table_date: "Date",
    table_name: "Description",
    table_action: "Action",
    delete_grade_confirm: "Are you sure you want to delete this grade?",
    
    // Settings
    settings_btn: "Settings",
    settings_title: "⚙️ Settings ({child})",
    settings_tab_general: "⚙️ General",
    settings_tab_subjects: "📘 Manage Subjects",
    settings_tab_timetable: "📅 Timetable",
    grade_level_label: "Class / Grade Level",
    grade_level_placeholder: "e.g. 5a, 7b",
    homework_card: "Homework",
    homework_done_badge: "✓ Done",
    homework_open_badge: "Pending",
    prep_card_status: "Preparation",
    prep_done_badge: "✓ Done",
    prep_open_badge: "Pending",
    country_label: "Country / Grading System",
    country_hint: "Determines the grading scale and evaluation system for this child.",
    section_visibility_title: "Show/hide panel sections",
    section_prep: "Preparation for next school day",
    section_calendar: "Upcoming exams & events",
    section_timetable: "Weekly timetable",
    section_overview: "Subjects & grades overview",
    section_back_btn: "Show Back button in header",

    // Modals
    modal_cell_title: "✏️ Edit Timetable Cell",
    no_subject_free: "-- No subject (Free period) --",
    custom_subject_opt: "➕ Enter custom subject...",
    custom_subject_placeholder: "Enter custom subject",
    room_label: "Room (optional)",
    room_placeholder: "e.g. R102",
    teacher_label: "Teacher (optional)",
    teacher_placeholder: "e.g. Mrs. Smith",
    cancel_btn: "Cancel",
    save_btn: "💾 Save",
    
    yaml_modal_title: "📋 Timetable YAML Import / Export",
    yaml_modal_subtitle: "Paste your timetable in YAML format here or copy the current configuration",
    yaml_textarea_label: "Timetable YAML Configuration ({child})",
    copy_btn: "📋 Copy",
    copied_btn: "✅ Copied!",
    import_btn: "📥 Import YAML",

    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday"
    }
  }
};

class SchoolGradesPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedChild = null;
    this._selectedGrade = 2.0;
    this._selectedWeight = 1.0;
    this._calendarEvents = {}; // { childName: [events] }
    this._editingCell = null; // { slotId, day, slotLabel, dayLabel, subject, room, teacher }
    this._showYamlModal = false;
    this._showSettingsModal = false;
    this._settingsTab = 'general';
    this._showAddGradeCard = false;
    this._showAddEventCard = false;
    this._editingEvent = null;
    this._localPreparedSubjects = {}; // { [childName]: { [subject]: boolean } }
    this._localPreparationDone = {}; // { [childName]: boolean }
    this._localHomeworkDone = {}; // { [childName]: boolean }
    this._lastPreparedDate = {}; // { [childName]: string }
    this._localTimetableSchedule = {}; // { [childName]: { [slotId]: { [day]: { subject, room, teacher } } } }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!oldHass || this._hasGradesDataChanged(oldHass, hass)) {
      this._fetchUpcomingCalendarEvents();
      this.render();
    }
  }

  _t(key, params = {}) {
    const lang = (this._hass && (this._hass.language || (this._hass.locale && this._hass.locale.language))) || 'de';
    const dict = String(lang).toLowerCase().startsWith('en') ? I18N.en : I18N.de;

    let text = dict[key] || I18N.de[key] || key;
    if (typeof text === 'string') {
      for (const [pKey, pVal] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
      }
    }
    return text;
  }

  _getLocale() {
    const lang = (this._hass && (this._hass.language || (this._hass.locale && this._hass.locale.language))) || 'de';
    return String(lang).toLowerCase().startsWith('en') ? 'en-US' : 'de-DE';
  }

  _hasGradesDataChanged(oldHass, newHass) {
    if (!oldHass || !newHass) return true;
    if (oldHass.states !== newHass.states) {
      for (const key in newHass.states) {
        const oldState = oldHass.states[key];
        const newState = newHass.states[key];
        if (!oldState || oldState !== newState) {
          if (newState.attributes && newState.attributes.kind_name) {
            return true;
          }
          if (key.startsWith('calendar.')) {
            return true;
          }
        }
      }
    }
    return false;
  }

  _getSchoolGradesData() {
    if (!this._hass) return {};
    const children = {};

    for (const [entityId, stateObj] of Object.entries(this._hass.states)) {
      const attrs = stateObj.attributes || {};
      const kindName = attrs.kind_name;

      if (!kindName) continue;

      if (!children[kindName]) {
        children[kindName] = {
          name: kindName,
          totalAverage: null,
          country: 'DE',
          gradeLevel: '',
          homeworkDone: false,
          preparationDone: false,
          preparedSubjects: {},
          preparedSubjectsDate: '',
          calendarEntity: null,
          timetable: null,
          subjects: {},
          sectionVisibility: {
            show_prep_card: true,
            show_calendar_card: true,
            show_timetable_card: true,
            show_overview_card: true,
            show_back_button: false,
          },
        };
      }

      if (attrs.country) {
        children[kindName].country = String(attrs.country).toUpperCase();
      }
      if (attrs.grade_level !== undefined) {
        children[kindName].gradeLevel = String(attrs.grade_level || '');
      }
      if (entityId.includes('vorbereitung') && (stateObj.state === 'on' || stateObj.state === 'off')) {
        children[kindName].preparationDone = (stateObj.state === 'on');
      }
      if (entityId.includes('hausaufgaben') && (stateObj.state === 'on' || stateObj.state === 'off')) {
        children[kindName].homeworkDone = (stateObj.state === 'on');
      }
      if (attrs.homework_done !== undefined) {
        children[kindName].homeworkDone = Boolean(attrs.homework_done);
      }
      if (attrs.preparation_done !== undefined) {
        children[kindName].preparationDone = Boolean(attrs.preparation_done);
      }

      const isBinaryPrepEntity = entityId.startsWith('binary_sensor.') && entityId.includes('vorbereitung');
      if (attrs.prepared_subjects && typeof attrs.prepared_subjects === 'object') {
        if (isBinaryPrepEntity || !children[kindName]._prepFromBinarySensor) {
          children[kindName].preparedSubjects = { ...attrs.prepared_subjects };
          if (isBinaryPrepEntity) {
            children[kindName]._prepFromBinarySensor = true;
          }
        }
      }
      if (attrs.prepared_subjects_date) {
        const dateStr = String(attrs.prepared_subjects_date);
        if (isBinaryPrepEntity || !children[kindName]._prepFromBinarySensor) {
          if (this._lastPreparedDate && this._lastPreparedDate[kindName] && this._lastPreparedDate[kindName] !== dateStr) {
            if (this._localPreparedSubjects && this._localPreparedSubjects[kindName]) {
              this._localPreparedSubjects[kindName] = {};
            }
            if (this._localPreparationDone && this._localPreparationDone[kindName] !== undefined) {
              delete this._localPreparationDone[kindName];
            }
          }
          if (!this._lastPreparedDate) this._lastPreparedDate = {};
          this._lastPreparedDate[kindName] = dateStr;
          children[kindName].preparedSubjectsDate = dateStr;
        }
      }
      if (attrs.calendar_entity !== undefined) {
        children[kindName].calendarEntity = attrs.calendar_entity;
      }
      if (attrs.timetable) {
        children[kindName].timetable = JSON.parse(JSON.stringify(attrs.timetable));
      }
      if (attrs.timetable_version !== undefined) {
        children[kindName].timetableVersion = attrs.timetable_version;
      }
      if (attrs.upcoming_events) {
        children[kindName].upcomingEvents = attrs.upcoming_events;
      }
      if (attrs.section_visibility && typeof attrs.section_visibility === 'object') {
        children[kindName].sectionVisibility = {
          show_prep_card: attrs.section_visibility.show_prep_card ?? true,
          show_calendar_card: attrs.section_visibility.show_calendar_card ?? true,
          show_timetable_card: attrs.section_visibility.show_timetable_card ?? true,
          show_overview_card: attrs.section_visibility.show_overview_card ?? true,
          show_back_button: attrs.section_visibility.show_back_button ?? false,
        };
      }

      if (attrs.subject_name) {
        children[kindName].subjects[attrs.subject_name] = {
          entityId: entityId,
          name: attrs.subject_name,
          average: stateObj.state,
          grades: attrs.grades || [],
          count: attrs.grade_count || 0,
        };
      } else if (attrs.subjects_summary !== undefined) {
        children[kindName].totalAverage = stateObj.state;
      }

      if (attrs.subjects_summary && typeof attrs.subjects_summary === 'object') {
        for (const subj of Object.keys(attrs.subjects_summary)) {
          if (!children[kindName].subjects[subj]) {
            children[kindName].subjects[subj] = {
              entityId: null,
              name: subj,
              average: attrs.subjects_summary[subj] != null ? attrs.subjects_summary[subj] : '-',
              grades: [],
              count: 0,
            };
          }
        }
      }

      if (this._localSectionVisibility && this._localSectionVisibility[kindName]) {
        children[kindName].sectionVisibility = {
          ...children[kindName].sectionVisibility,
          ...this._localSectionVisibility[kindName],
        };
      }
    }

    // Apply local optimistic overrides and auto-recalculate preparationDone
    for (const [kindName, child] of Object.entries(children)) {
      // Ensure all subjects from timetable schedule are also in child.subjects
      if (child.timetable && child.timetable.schedule) {
        for (const slotCells of Object.values(child.timetable.schedule)) {
          if (slotCells && typeof slotCells === 'object') {
            for (const cell of Object.values(slotCells)) {
              if (cell && cell.subject) {
                const sName = String(cell.subject).trim();
                if (sName && !child.subjects[sName]) {
                  child.subjects[sName] = {
                    entityId: null,
                    name: sName,
                    average: '-',
                    grades: [],
                    count: 0,
                  };
                }
              }
            }
          }
        }
      }

      // Apply optimistic timetable overrides
      if (this._localTimetableSchedule && this._localTimetableSchedule[kindName]) {
        if (!child.timetable) {
          child.timetable = { slots: [], schedule: {} };
        }
        if (!child.timetable.schedule) {
          child.timetable.schedule = {};
        }
        for (const [slotId, dayMap] of Object.entries(this._localTimetableSchedule[kindName])) {
          for (const [day, cell] of Object.entries(dayMap)) {
            const currentCell = child.timetable.schedule[slotId] && child.timetable.schedule[slotId][day];
            const currentSubj = currentCell ? String(currentCell.subject || '').trim() : '';
            const currentRoom = currentCell ? String(currentCell.room || '').trim() : '';
            const currentTeacher = currentCell ? String(currentCell.teacher || '').trim() : '';

            const expectedSubj = cell ? String(cell.subject || '').trim() : '';
            const expectedRoom = cell ? String(cell.room || '').trim() : '';
            const expectedTeacher = cell ? String(cell.teacher || '').trim() : '';

            if (currentSubj === expectedSubj && currentRoom === expectedRoom && currentTeacher === expectedTeacher) {
              delete this._localTimetableSchedule[kindName][slotId][day];
            } else {
              if (!child.timetable.schedule[slotId]) {
                child.timetable.schedule[slotId] = {};
              }
              if (!expectedSubj) {
                delete child.timetable.schedule[slotId][day];
              } else {
                child.timetable.schedule[slotId][day] = {
                  subject: expectedSubj,
                  room: expectedRoom,
                  teacher: expectedTeacher,
                };
                if (!child.subjects[expectedSubj]) {
                  child.subjects[expectedSubj] = {
                    entityId: null,
                    name: expectedSubj,
                    average: '-',
                    grades: [],
                    count: 0,
                  };
                }
              }
            }
          }
        }
      }

      if (this._localHomeworkDone && this._localHomeworkDone[kindName] !== undefined) {
        if (child.homeworkDone === this._localHomeworkDone[kindName]) {
          delete this._localHomeworkDone[kindName];
        } else {
          child.homeworkDone = this._localHomeworkDone[kindName];
        }
      }
      if (this._localPreparedSubjects && this._localPreparedSubjects[kindName]) {
        for (const [subj, val] of Object.entries(this._localPreparedSubjects[kindName])) {
          if (child.preparedSubjects && child.preparedSubjects[subj] === val) {
            delete this._localPreparedSubjects[kindName][subj];
          } else {
            if (!child.preparedSubjects) child.preparedSubjects = {};
            child.preparedSubjects[subj] = val;
          }
        }
      }
      if (this._localPreparationDone && this._localPreparationDone[kindName] !== undefined) {
        if (child.preparationDone === this._localPreparationDone[kindName]) {
          delete this._localPreparationDone[kindName];
        } else {
          child.preparationDone = this._localPreparationDone[kindName];
        }
      }

      // Check if all needed subjects for next school day are prepared
      const timetable = child.timetable;
      if (timetable) {
        const nextDayInfo = this._getNextSchoolDayInfo(timetable, []);
        if (nextDayInfo && nextDayInfo.lessons && nextDayInfo.lessons.length > 0) {
          const allPrepared = nextDayInfo.lessons.every(l => Boolean(child.preparedSubjects && child.preparedSubjects[l.subject]));
          child.preparationDone = allPrepared;
        }
      }
    }

    return children;
  }

  _getAvailableCalendars() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter(id => id.startsWith('calendar.'))
      .map(id => ({
        entityId: id,
        name: this._hass.states[id].attributes.friendly_name || id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async _fetchUpcomingCalendarEvents() {
    const data = this._getSchoolGradesData();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const startIso = now.toISOString();
    const in1Year = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const endIso = in1Year.toISOString();

    for (const [childName, childData] of Object.entries(data)) {
      const calEntity = childData.calendarEntity;
      if (!calEntity || !this._hass || !this._hass.states[calEntity]) {
        this._calendarEvents[childName] = [];
        continue;
      }

      let rawEvents = [];

      // 1. Try WebSocket API (with start_date_time)
      try {
        const wsRes = await this._hass.callWS({
          type: 'calendar/event/list',
          entity_id: calEntity,
          start_date_time: startIso,
          end_date_time: endIso,
        });
        if (wsRes && Array.isArray(wsRes.events)) {
          rawEvents = wsRes.events;
        } else if (Array.isArray(wsRes)) {
          rawEvents = wsRes;
        }
      } catch (err1) {
        // 2. Try REST API
        try {
          const apiRes = await this._hass.callApi(
            'GET',
            `calendars/${calEntity}?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`
          );
          if (Array.isArray(apiRes)) {
            rawEvents = apiRes;
          }
        } catch (err2) {
          console.warn('SchoolGrades: Could not fetch calendar events via WS or REST', err2);
        }
      }

      // 3. Fallback: Use backend total sensor upcoming_events attribute if available
      if (rawEvents.length === 0 && childData.upcomingEvents && Array.isArray(childData.upcomingEvents)) {
        rawEvents = childData.upcomingEvents;
      }

      // Fallback: If no events array obtained, use state attributes as last resort
      if (rawEvents.length === 0) {
        const stateObj = this._hass.states[calEntity];
        if (stateObj && stateObj.attributes && stateObj.attributes.start_time) {
          rawEvents = [{
            summary: stateObj.attributes.message || stateObj.state,
            start: stateObj.attributes.start_time,
            end: stateObj.attributes.end_time,
            description: stateObj.attributes.description || '',
            location: stateObj.attributes.location || '',
          }];
        }
      }

      // Normalize and format events
      const parsedEvents = rawEvents.map(evt => {
        let startVal = evt.start;
        if (startVal && typeof startVal === 'object') {
          startVal = startVal.dateTime || startVal.date;
        }
        if (!startVal) startVal = evt.dtstart;

        let endVal = evt.end;
        if (endVal && typeof endVal === 'object') {
          endVal = endVal.dateTime || endVal.date;
        }
        if (!endVal) endVal = evt.dtend;

        const uidVal = evt.uid || evt.id || evt.event_id || '';

        return {
          uid: String(uidVal),
          summary: evt.summary || evt.title || evt.message || 'Termin',
          start: startVal,
          end: endVal,
          description: evt.description || '',
          location: evt.location || '',
        };
      }).filter(evt => evt.start);

      // Filter out events in the past and sort chronologically
      parsedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      this._calendarEvents[childName] = parsedEvents;
    }

    this.render();
  }

  _getNextSchoolDayInfo(timetable, calendarEvents) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    let daysToAdd = 1;
    let targetDayKey = '';

    if (currentDay === 5) { // Friday -> prepare for Monday
      daysToAdd = 3;
      targetDayKey = 'monday';
    } else if (currentDay === 6) { // Saturday -> prepare for Monday
      daysToAdd = 2;
      targetDayKey = 'monday';
    } else if (currentDay === 0) { // Sunday -> prepare for Monday
      daysToAdd = 1;
      targetDayKey = 'monday';
    } else {
      const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      targetDayKey = dayKeys[currentDay + 1];
      daysToAdd = 1;
    }

    const dayNames = this._t('days');
    const targetDayName = dayNames[targetDayKey] || 'Morgen';

    const targetDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const dateFormatted = targetDate.toLocaleDateString(this._getLocale(), { weekday: 'long', day: '2-digit', month: '2-digit' });

    const slots = (timetable && timetable.slots) || [];
    const schedule = (timetable && timetable.schedule) || {};

    // Group lesson slots by subject so double periods or multiple periods of the
    // same subject on the same day form a single consolidated subject preparation card.
    const subjectMap = new Map();
    for (const slot of slots) {
      if (slot.type === 'break') continue;
      const cell = schedule[slot.id] && schedule[slot.id][targetDayKey];
      if (cell && cell.subject) {
        const cleanSubj = String(cell.subject).trim();
        if (!cleanSubj) continue;

        if (!subjectMap.has(cleanSubj)) {
          subjectMap.set(cleanSubj, {
            subject: cleanSubj,
            slots: [],
            rooms: [],
            teachers: [],
          });
        }
        const entry = subjectMap.get(cleanSubj);
        entry.slots.push(slot);
        if (cell.room) {
          const r = String(cell.room).trim();
          if (r && !entry.rooms.includes(r)) entry.rooms.push(r);
        }
        if (cell.teacher) {
          const t = String(cell.teacher).trim();
          if (t && !entry.teachers.includes(t)) entry.teachers.push(t);
        }
      }
    }

    const getSlotNum = (s) => {
      if (s.number && !isNaN(parseInt(s.number, 10))) return parseInt(s.number, 10);
      const match = String(s.label || '').match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    const lessons = [];
    for (const [subj, entry] of subjectMap.entries()) {
      const entrySlots = entry.slots;
      let slotLabel = '';
      let slotTime = '';

      if (entrySlots.length === 1) {
        slotLabel = entrySlots[0].label || `${entrySlots[0].number || 1}. Stunde`;
        slotTime = `${entrySlots[0].start} - ${entrySlots[0].end}`;
      } else {
        const numbers = entrySlots.map(getSlotNum);
        const allHaveNumbers = numbers.every(n => n !== null);

        if (allHaveNumbers) {
          const sortedNumbers = [...numbers].sort((a, b) => a - b);
          const isConsecutive = sortedNumbers.every((n, idx) => idx === 0 || n === sortedNumbers[idx - 1] + 1);
          if (isConsecutive) {
            if (sortedNumbers.length === 2) {
              slotLabel = `${sortedNumbers[0]}. & ${sortedNumbers[1]}. Stunde`;
            } else {
              slotLabel = `${sortedNumbers[0]}. - ${sortedNumbers[sortedNumbers.length - 1]}. Stunde`;
            }
            const firstStart = entrySlots[0].start;
            const lastEnd = entrySlots[entrySlots.length - 1].end;
            slotTime = (firstStart && lastEnd) ? `${firstStart} - ${lastEnd}` : entrySlots.map(s => `${s.start} - ${s.end}`).join(', ');
          } else {
            slotLabel = `${sortedNumbers.join('., ')}. Stunde`;
            slotTime = entrySlots.map(s => `${s.start} - ${s.end}`).join(' / ');
          }
        } else {
          slotLabel = entrySlots.map(s => s.label || s.number || '').filter(Boolean).join(' & ');
          slotTime = entrySlots.map(s => `${s.start} - ${s.end}`).join(' / ');
        }
      }

      lessons.push({
        subject: subj,
        slotLabel: slotLabel,
        slotTime: slotTime,
        room: entry.rooms.join(', '),
        teacher: entry.teachers.join(', '),
      });
    }

    const targetDateIso = targetDate.toISOString().split('T')[0];
    const matchingExams = (calendarEvents || []).filter(evt => {
      if (!evt.start) return false;
      const evtDateIso = new Date(evt.start).toISOString().split('T')[0];
      return evtDateIso === targetDateIso;
    });

    return {
      dayKey: targetDayKey,
      dayName: targetDayName,
      dateFormatted: dateFormatted,
      lessons: lessons,
      exams: matchingExams,
      isWeekend: currentDay === 5 || currentDay === 6 || currentDay === 0,
    };
  }

  _isNowInSlot(slotStart, slotEnd, dayKey) {
    if (!slotStart || !slotEnd) return false;
    const now = new Date();
    const dayMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };
    if (dayMap[now.getDay()] !== dayKey) return false;

    const [startH, startM] = slotStart.split(':').map(Number);
    const [endH, endM] = slotEnd.split(':').map(Number);

    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    return currentMins >= startMins && currentMins < endMins;
  }

  _isToday(dayKey) {
    const now = new Date();
    const dayMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };
    return dayMap[now.getDay()] === dayKey;
  }

  _timetableToYaml(timetable) {
    const slots = timetable.slots || [];
    const schedule = timetable.schedule || {};

    let yaml = "slots:\n";
    for (const s of slots) {
      yaml += `  - id: ${s.id}\n`;
      if (s.type) yaml += `    type: ${s.type}\n`;
      yaml += `    label: "${s.label || ''}"\n`;
      yaml += `    start: "${s.start || ''}"\n`;
      yaml += `    end: "${s.end || ''}"\n`;
    }

    yaml += "\nschedule:\n";
    for (const [slotId, days] of Object.entries(schedule)) {
      if (days && typeof days === 'object' && Object.keys(days).length > 0) {
        yaml += `  ${slotId}:\n`;
        for (const [day, info] of Object.entries(days)) {
          if (info && info.subject) {
            yaml += `    ${day}:\n`;
            yaml += `      subject: "${info.subject}"\n`;
            if (info.room) yaml += `      room: "${info.room}"\n`;
            if (info.teacher) yaml += `      teacher: "${info.teacher}"\n`;
          }
        }
      }
    }
    return yaml;
  }

  render() {
    const data = this._getSchoolGradesData();
    const childNames = Object.keys(data);
    const availableCalendars = this._getAvailableCalendars();

    if (childNames.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>${this._getStyles()}</style>
        <div class="container">
          <header class="header">
            <div class="header-left">
              <button class="menu-btn" id="menu-toggle-btn" aria-label="${this._t('menu_toggle')}" title="${this._t('menu_toggle')}">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <button class="menu-btn back-btn" id="header-back-btn" aria-label="${this._t('back_btn_tooltip')}" title="${this._t('back_btn_tooltip')}">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <div class="title-section">
                <h1>${this._t('panel_title')}</h1>
              </div>
            </div>
          </header>
          <div class="card empty-card">
            <h2>${this._t('no_children_title')}</h2>
            <p>${this._t('no_children_text1')}</p>
            <p>${this._t('no_children_text2')}</p>
          </div>
        </div>
      `;
      this._attachEventListeners();
      return;
    }

    if (!this._selectedChild || !data[this._selectedChild]) {
      this._selectedChild = childNames[0];
    }

    const currentChild = data[this._selectedChild];
    const childCountry = (currentChild && currentChild.country) || 'DE';
    const countrySys = COUNTRY_SYSTEMS[childCountry] || COUNTRY_SYSTEMS.DE;
    const secVis = (currentChild && currentChild.sectionVisibility) || {
      show_prep_card: true,
      show_calendar_card: true,
      show_timetable_card: true,
      show_overview_card: true,
      show_back_button: false,
    };
    const subjects = currentChild ? currentChild.subjects : {};
    const subjectList = Object.keys(subjects).sort();
    const upcomingEvents = this._calendarEvents[this._selectedChild] || [];
    const timetable = (currentChild && currentChild.timetable) ? currentChild.timetable : DEFAULT_TIMETABLE;
    const slots = timetable.slots || DEFAULT_TIMETABLE.slots;
    const schedule = timetable.schedule || {};
    const dayNames = this._t('days');

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="container">
        <!-- Header & Child Selector (Without Subtitle, Without Flag, With Grade Level) -->
        <header class="header">
          <div class="header-left">
            <button class="menu-btn" id="menu-toggle-btn" aria-label="${this._t('menu_toggle')}" title="${this._t('menu_toggle')}">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            ${secVis.show_back_button ? `
              <button class="menu-btn back-btn" id="header-back-btn" aria-label="${this._t('back_btn_tooltip')}" title="${this._t('back_btn_tooltip')}">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
            ` : ''}
            <div class="title-section">
              <h1>${this._t('panel_title')}</h1>
            </div>
          </div>
          <div class="child-tabs">
            ${childNames.map(name => {
              const cData = data[name];
              const gradeLevelStr = cData && cData.gradeLevel ? ` (${cData.gradeLevel})` : '';
              return `
                <button class="tab-btn ${name === this._selectedChild ? 'active' : ''}" data-child="${name}">
                  👤 ${name}${gradeLevelStr}
                </button>
              `;
            }).join('')}
          </div>
        </header>

        <!-- Summary Banner (Avg, Homework, Preparation, Settings Button) -->
        <div class="summary-banner">
          <div class="stat-card primary">
            <span class="stat-label">${this._t('total_avg')}</span>
            <span class="stat-value">${currentChild && currentChild.totalAverage && !isNaN(currentChild.totalAverage) ? currentChild.totalAverage : '–'}</span>
          </div>
          <div class="stat-card ${currentChild && currentChild.homeworkDone ? 'done-card' : ''}" id="toggle-homework-btn" style="cursor: pointer; ${currentChild && currentChild.homeworkDone ? 'border: 2px solid #22c55e; background: rgba(34, 197, 94, 0.12);' : ''}">
            <span class="stat-label">${this._t('homework_card')}</span>
            <span class="stat-value" style="font-size: 20px; font-weight: 700; ${currentChild && currentChild.homeworkDone ? 'color: #22c55e;' : 'color: #9ca3af;'}">
              ${currentChild && currentChild.homeworkDone ? this._t('homework_done_badge') : this._t('homework_open_badge')}
            </span>
          </div>
          <div class="stat-card ${currentChild && currentChild.preparationDone ? 'done-card' : ''}" id="toggle-prep-btn" style="cursor: pointer; ${currentChild && currentChild.preparationDone ? 'border: 2px solid #22c55e; background: rgba(34, 197, 94, 0.12);' : ''}">
            <span class="stat-label">${this._t('prep_card_status')}</span>
            <span class="stat-value" style="font-size: 20px; font-weight: 700; ${currentChild && currentChild.preparationDone ? 'color: #22c55e;' : 'color: #9ca3af;'}">
              ${currentChild && currentChild.preparationDone ? this._t('prep_done_badge') : this._t('prep_open_badge')}
            </span>
          </div>
          <div class="stat-card action-stat-card" id="open-settings-banner-btn" style="cursor: pointer; justify-content: center;" title="${this._t('settings_btn')}">
            <span class="stat-value" style="font-size: 18px; font-weight: 700;">⚙️ ${this._t('settings_btn')}</span>
          </div>
        </div>

        <!-- Preparation Card for Next School Day (Interactive Clickable Subjects) -->
        ${secVis.show_prep_card ? (() => {
          const nextDay = this._getNextSchoolDayInfo(timetable, upcomingEvents);
          return `
            <div class="card prep-card" style="margin-bottom: 24px;">
              <div class="prep-header">
                <div class="prep-title-group">
                  <h3>${this._t('prep_title')}</h3>
                  <span class="prep-subtitle">${nextDay.dateFormatted}</span>
                </div>
                <span class="prep-badge ${nextDay.isWeekend ? 'weekend' : 'weekday'}">
                  ${nextDay.isWeekend ? this._t('prep_badge_weekend') : this._t('prep_badge_weekday')}
                </span>
              </div>

              ${nextDay.exams.length > 0 ? `
                <div class="prep-exam-alert">
                  <span class="exam-alert-icon">⚠️</span>
                  <div class="exam-alert-content">
                    <strong>${this._t('prep_exam_alert')}</strong>
                    <div class="exam-alert-list">
                      ${nextDay.exams.map(e => `• <b>${e.summary}</b> ${e.location ? ' (📍 ' + e.location + ')' : ''}`).join(' ')}
                    </div>
                  </div>
                </div>
              ` : ''}

              <div class="prep-body">
                ${nextDay.lessons.length === 0 ? `
                  <div class="empty-events">
                    ${this._t('prep_empty', { day: nextDay.dayName })}
                  </div>
                ` : `
                  <div class="prep-grid">
                    ${nextDay.lessons.map(l => {
                      const isExamSubject = nextDay.exams.some(e =>
                        e.summary.toLowerCase().includes(l.subject.toLowerCase()) ||
                        l.subject.toLowerCase().includes(e.summary.toLowerCase())
                      );
                      const prepSubjectsMap = (currentChild && currentChild.preparedSubjects) || {};
                      const isPrepared = Boolean(prepSubjectsMap[l.subject]);
                      return `
                        <div class="prep-item prep-item-clickable ${isPrepared ? 'prepared-subject' : ''} ${isExamSubject ? 'has-exam' : ''}"
                             data-subject="${l.subject}"
                             style="cursor: pointer; ${isPrepared ? 'border: 2px solid #22c55e !important; background: rgba(34, 197, 94, 0.14) !important;' : ''}">
                          <div class="prep-item-top">
                            <span class="prep-slot-badge">${l.slotLabel}</span>
                            <span class="prep-slot-time">${l.slotTime}</span>
                          </div>
                          <div class="prep-subject-name" style="display: flex; align-items: center; justify-content: space-between;">
                            <span>${l.subject}</span>
                            <span class="prep-check-icon" style="color: #22c55e; font-size: 16px; font-weight: bold; ${isPrepared ? 'display: inline;' : 'display: none;'}">✓</span>
                          </div>
                          <div class="prep-meta">
                            ${l.room ? `<span class="prep-meta-tag">📍 ${l.room}</span>` : ''}
                            ${l.teacher ? `<span class="prep-meta-tag">👨‍🏫 ${l.teacher}</span>` : ''}
                          </div>
                          ${isExamSubject ? `<div class="prep-exam-badge">${this._t('exam_badge')}</div>` : ''}
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            </div>
          `;
        })() : ''}

        <!-- Upcoming Calendar Events Card (With Urgency Color Borders) -->
        ${secVis.show_calendar_card ? `
          <div class="card calendar-card" style="margin-bottom: 24px;">
            <div class="calendar-header">
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <h3 style="margin: 0;">${this._t('calendar_title', { count: upcomingEvents.length })}</h3>
                ${currentChild && currentChild.calendarEntity ? `
                  <button class="pill-btn add-event-toggle-btn" id="toggle-add-event-btn" style="padding: 6px 14px; font-size: 13px; font-weight: 600; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35); transition: all 0.2s ease;">
                    ${this._showAddEventCard ? this._t('close_add_grade_btn') : this._t('add_event_btn')}
                  </button>
                ` : ''}
              </div>
            </div>

            ${this._showAddEventCard ? `
              <div class="add-event-form-container" style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--divider-color, rgba(255,255,255,0.15)); border-radius: 12px; padding: 16px; margin: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                  <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: #fff;">
                    ${this._editingEvent ? this._t('edit_event_title') : this._t('add_event_title')}
                  </h4>
                  <button type="button" id="close-add-event-x" style="background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 16px; padding: 4px;">✖</button>
                </div>
                <form id="add-event-form">
                  <div class="form-group" style="margin-bottom: 12px;">
                    <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #fff;">${this._t('event_summary_label')}</label>
                    <input type="text" id="event-summary-input" required value="${this._editingEvent ? this._editingEvent.summary : ''}" placeholder="${this._t('event_summary_placeholder')}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 13px; box-sizing: border-box;">
                  </div>
                  <div class="form-row" style="display: flex; gap: 12px; margin-bottom: 12px;">
                    <div class="form-group half" style="flex: 1;">
                      <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #fff;">${this._t('event_date_label')}</label>
                      <input type="date" id="event-date-input" required value="${this._editingEvent ? this._editingEvent.date : new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 13px; box-sizing: border-box;">
                    </div>
                    <div class="form-group half" style="flex: 1;">
                      <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #fff;">${this._t('event_time_label')}</label>
                      <input type="time" id="event-time-input" required value="${this._editingEvent ? this._editingEvent.time : '08:00'}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 13px; box-sizing: border-box;">
                    </div>
                  </div>
                  <div class="form-group" style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #fff;">${this._t('event_desc_label')}</label>
                    <input type="text" id="event-desc-input" value="${this._editingEvent ? (this._editingEvent.description || '') : ''}" placeholder="${this._t('event_desc_placeholder')}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 13px; box-sizing: border-box;">
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    ${this._editingEvent ? `
                      <button type="button" class="delete-btn" id="delete-event-btn" style="padding: 8px 16px; font-size: 13px;">${this._t('delete_event_btn')}</button>
                    ` : `<div></div>`}
                    <div style="display: flex; gap: 10px;">
                      <button type="button" class="submit-btn secondary" id="cancel-add-event-btn" style="width: auto; padding: 8px 16px; font-size: 13px;">${this._t('cancel_btn')}</button>
                      <button type="submit" class="submit-btn" style="width: auto; padding: 8px 18px; font-size: 13px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 8px; cursor: pointer;">
                        ${this._editingEvent ? this._t('submit_update_event') : this._t('submit_add_event')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ` : ''}

            <div class="events-list">
              ${!currentChild || !currentChild.calendarEntity ? `
                <div class="empty-events">
                  ${this._t('calendar_hint')}
                </div>
              ` : upcomingEvents.length === 0 ? `
                <div class="empty-events">
                  ${this._t('no_events')}
                </div>
              ` : `
                <div class="events-grid">
                  ${upcomingEvents.map(evt => {
                    const startDate = new Date(evt.start);
                    const formattedDate = startDate.toLocaleDateString(this._getLocale(), { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
                    const formattedTime = startDate.toLocaleTimeString(this._getLocale(), { hour: '2-digit', minute: '2-digit' });
                    const isAllDay = (typeof evt.start === 'string' && evt.start.length === 10) || formattedTime === '00:00';
                    const countdownText = this._getCountdownBadge(startDate);
                    
                    const now = new Date();
                    now.setHours(0,0,0,0);
                    const target = new Date(startDate);
                    target.setHours(0,0,0,0);
                    const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));

                    let borderStyle = '';
                    if (diffDays <= 1) {
                      borderStyle = 'border-left: 5px solid #ef4444; border-top: 1px solid rgba(239, 68, 68, 0.3); border-right: 1px solid rgba(239, 68, 68, 0.3); border-bottom: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08);';
                    } else if (diffDays >= 2 && diffDays <= 3) {
                      borderStyle = 'border-left: 5px solid #f97316; border-top: 1px solid rgba(249, 115, 22, 0.3); border-right: 1px solid rgba(249, 115, 22, 0.3); border-bottom: 1px solid rgba(249, 115, 22, 0.3); background: rgba(249, 115, 22, 0.08);';
                    } else if (diffDays >= 4 && diffDays <= 7) {
                      borderStyle = 'border-left: 5px solid #eab308; border-top: 1px solid rgba(234, 179, 8, 0.3); border-right: 1px solid rgba(234, 179, 8, 0.3); border-bottom: 1px solid rgba(234, 179, 8, 0.3); background: rgba(234, 179, 8, 0.08);';
                    }

                    return `
                      <div class="event-item clickable-event" data-uid="${evt.uid || ''}" data-summary="${evt.summary || ''}" data-start="${evt.start || ''}" data-desc="${evt.description || ''}" style="cursor: pointer; ${borderStyle}" title="${this._t('edit_event_title')}">
                        <div class="event-badge-row">
                          <span class="event-countdown ${countdownText.cls}">${countdownText.text}</span>
                          <span class="event-time">${formattedDate} ${!isAllDay ? this._t('time_at', { time: formattedTime }) : this._t('all_day')}</span>
                        </div>
                        <h4 class="event-title">${evt.summary}</h4>
                        ${evt.location ? `<div class="event-detail">📍 ${evt.location}</div>` : ''}
                        ${evt.description ? `<div class="event-detail desc">📝 ${evt.description}</div>` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>
          </div>
        ` : ''}

        <!-- Timetable Card -->
        ${secVis.show_timetable_card ? `
          <div class="card timetable-card" style="margin-bottom: 24px;">
            <div class="timetable-header">
              <div class="title-with-badge">
                <h3>${this._t('timetable_title')}</h3>
                <span class="timetable-subtitle">${this._t('timetable_subtitle')}</span>
              </div>
              <div class="timetable-header-actions">
                <button class="pill-btn yaml-btn" id="open-yaml-modal-btn">${this._t('yaml_button')}</button>
                <div class="timetable-legend">
                  <span class="legend-item"><span class="legend-dot now-dot"></span>${this._t('legend_now')}</span>
                  <span class="legend-item"><span class="legend-dot today-dot"></span>${this._t('legend_today')}</span>
                </div>
              </div>
            </div>

            <div class="timetable-table-container">
              <table class="timetable-table">
                <thead>
                  <tr>
                    <th class="time-col">${this._t('time_hour_col')}</th>
                    ${DAYS.map(d => `
                      <th class="day-col ${this._isToday(d.key) ? 'today-header' : ''}">
                        ${dayNames[d.key] || d.key}
                        ${this._isToday(d.key) ? `<span class="today-badge">${this._t('today_badge')}</span>` : ''}
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${slots.map(slot => {
                    if (slot.type === 'break') {
                      return `
                        <tr class="break-row">
                          <td class="time-cell break-cell-title">
                            <span class="break-icon">☕</span> ${slot.label} <span class="slot-time">(${slot.start} - ${slot.end})</span>
                          </td>
                          <td colspan="5" class="break-cell-content">
                            ${this._t('break_label')}
                          </td>
                        </tr>
                      `;
                    }

                    return `
                      <tr>
                        <td class="time-cell">
                          <div class="slot-num">${slot.label}</div>
                          <div class="slot-time">${slot.start} - ${slot.end}</div>
                        </td>
                        ${DAYS.map(d => {
                          const cellData = (schedule[slot.id] && schedule[slot.id][d.key]) || {};
                          const isNow = this._isNowInSlot(slot.start, slot.end, d.key);
                          const isToday = this._isToday(d.key);
                          const hasSubject = !!cellData.subject;

                          return `
                            <td class="timetable-cell ${isToday ? 'today-col' : ''} ${isNow ? 'now-cell' : ''} ${hasSubject ? 'has-subject' : 'empty-cell'}"
                                data-slot-id="${slot.id}"
                                data-day="${d.key}"
                                data-slot-label="${slot.label} (${slot.start}-${slot.end})"
                                data-day-label="${dayNames[d.key] || d.key}"
                                data-subject="${cellData.subject || ''}"
                                data-room="${cellData.room || ''}"
                                data-teacher="${cellData.teacher || ''}">
                              ${isNow ? `<div class="now-badge">${this._t('now_badge')}</div>` : ''}
                              ${hasSubject ? `
                                <div class="cell-subject">${cellData.subject}</div>
                                <div class="cell-details">
                                  ${cellData.room ? `<span class="cell-room">📍 ${cellData.room}</span>` : ''}
                                  ${cellData.teacher ? `<span class="cell-teacher">👨‍🏫 ${cellData.teacher}</span>` : ''}
                                </div>
                              ` : `
                                <div class="cell-empty-trigger">
                                  <span class="add-icon">+</span>
                                </div>
                              `}
                            </td>
                          `;
                        }).join('')}
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Action / Toggle Button Row for Add Grade Form -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          ${secVis.show_overview_card ? `
            <h2 class="section-title" style="margin: 0;">${this._t('overview_title')}</h2>
          ` : `<div></div>`}
          <button class="pill-btn add-grade-toggle-btn" id="toggle-add-grade-btn" style="padding: 10px 20px; font-size: 14px; font-weight: 600; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); transition: all 0.2s ease;">
            ${this._showAddGradeCard ? this._t('close_add_grade_btn') : this._t('toggle_add_grade_btn')}
          </button>
        </div>

        <!-- Add Grade Card (Collapsible) -->
        ${this._showAddGradeCard ? `
          <div class="forms-grid" style="grid-template-columns: 1fr; margin-bottom: 24px;">
            <div class="card form-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0;">${this._t('add_grade_title')}</h3>
                <button type="button" id="close-add-grade-x" style="background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 18px; padding: 4px;">✖</button>
              </div>
              <form id="add-grade-form">
                <div class="form-group">
                  <label>${this._t('subject_label')}</label>
                  <select id="grade-subject" required>
                    ${subjectList.map(s => `<option value="${s}">${s}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label>${this._t('grade_label')} (${countrySys.flag} ${countrySys.scale})</label>
                  <div class="quick-pills" id="grade-pills">
                    ${countrySys.grades.map(g => `
                      <button type="button" class="pill-btn ${g.val === this._selectedGrade ? 'active' : ''}" data-val="${g.val}">
                        ${g.label}
                      </button>
                    `).join('')}
                  </div>
                  <input type="number" id="grade-input" step="0.1" value="${this._selectedGrade}" required style="margin-top: 8px;" placeholder="${countrySys.scale}">
                </div>

                <div class="form-group">
                  <label>${this._t('weight_label')}</label>
                  <div class="quick-pills" id="weight-pills">
                    ${[1.0, 2.0, 3.0, 4.0].map(w => `
                      <button type="button" class="pill-btn ${w === this._selectedWeight ? 'active' : ''}" data-weight="${w}">
                        ${this._t('weight_times', { weight: w })}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group half">
                    <label>${this._t('grade_name_label')}</label>
                    <input type="text" id="grade-name" placeholder="${this._t('grade_name_placeholder')}">
                  </div>
                  <div class="form-group half">
                    <label>${this._t('date_label')}</label>
                    <input type="date" id="grade-date" value="${new Date().toISOString().split('T')[0]}">
                  </div>
                </div>

                <button type="submit" class="submit-btn">${this._t('submit_add_grade')}</button>
              </form>
            </div>
          </div>
        ` : ''}

        <!-- Subjects Grid -->
        ${secVis.show_overview_card ? `
          <div class="subjects-grid">
            ${subjectList.map(subjName => {
              const subj = subjects[subjName];
              const avg = subj.average && !isNaN(subj.average) ? subj.average : '–';
              return `
                <div class="card subject-card">
                  <div class="subject-header">
                    <div class="subject-title">
                      <h3>${subjName}</h3>
                    </div>
                    <span class="badge avg-badge ${this._getGradeColorClass(avg, childCountry)}">${this._t('avg_label')}: ${avg}</span>
                  </div>

                  <div class="grades-list">
                    ${subj.grades.length === 0 ? `
                      <div class="empty-grades">${this._t('no_grades_yet')}</div>
                    ` : `
                      <table class="grades-table">
                        <thead>
                          <tr>
                            <th>${this._t('table_grade')}</th>
                            <th>${this._t('table_weight')}</th>
                            <th>${this._t('table_date')}</th>
                            <th>${this._t('table_name')}</th>
                            <th>${this._t('table_action')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${subj.grades.map(g => `
                            <tr>
                              <td>
                                <span class="grade-pill ${this._getGradeColorClass(g.grade, childCountry)}">
                                  ${parseFloat(g.grade).toFixed(1)}
                                </span>
                              </td>
                              <td><span class="weight-badge">${this._t('weight_times', { weight: g.weight })}</span></td>
                              <td class="date-cell">${g.date}</td>
                              <td class="name-cell">${g.name || '–'}</td>
                              <td>
                                <button class="icon-btn delete-grade-btn" data-subject="${subjName}" data-id="${g.id}" title="${this._t('delete_btn')}">
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Timetable Edit Modal -->
      ${this._editingCell ? `
        <div class="modal-backdrop" id="timetable-modal-backdrop">
          <div class="modal-card">
            <div class="modal-header">
              <h3>${this._t('modal_cell_title')}</h3>
              <span class="modal-subtitle">${this._editingCell.slotLabel} • ${this._editingCell.dayLabel}</span>
            </div>

            <form id="timetable-edit-form">
              <div class="form-group">
                <label>${this._t('subject_label')}</label>
                <select id="modal-subject-select">
                  <option value="">${this._t('no_subject_free')}</option>
                  ${subjectList.map(s => `
                    <option value="${s}" ${this._editingCell.subject === s ? 'selected' : ''}>${s}</option>
                  `).join('')}
                  ${this._editingCell.subject && !subjectList.includes(this._editingCell.subject) ? `
                    <option value="${this._editingCell.subject}" selected>${this._editingCell.subject}</option>
                  ` : ''}
                  <option value="__custom__">${this._t('custom_subject_opt')}</option>
                </select>
                <input type="text" id="modal-custom-subject" placeholder="${this._t('custom_subject_placeholder')}" style="display: none; margin-top: 8px;" value="">
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label>${this._t('room_label')}</label>
                  <input type="text" id="modal-room" placeholder="${this._t('room_placeholder')}" value="${this._editingCell.room || ''}">
                </div>
                <div class="form-group half">
                  <label>${this._t('teacher_label')}</label>
                  <input type="text" id="modal-teacher" placeholder="${this._t('teacher_placeholder')}" value="${this._editingCell.teacher || ''}">
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="delete-btn" id="modal-delete-btn" ${!this._editingCell.subject ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>${this._t('delete_btn')}</button>
                <div class="modal-actions-right">
                  <button type="button" class="submit-btn secondary" id="modal-cancel-btn">${this._t('cancel_btn')}</button>
                  <button type="submit" class="submit-btn">${this._t('save_btn')}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ` : ''}

      <!-- YAML Import / Export Modal -->
      ${this._showYamlModal ? `
        <div class="modal-backdrop" id="yaml-modal-backdrop">
          <div class="modal-card yaml-modal-card">
            <div class="modal-header">
              <h3>${this._t('yaml_modal_title')}</h3>
              <span class="modal-subtitle">${this._t('yaml_modal_subtitle')}</span>
            </div>

            <form id="yaml-import-form">
              <div class="form-group">
                <label>${this._t('yaml_textarea_label', { child: this._selectedChild })}</label>
                <textarea id="yaml-textarea" rows="14" style="font-family: monospace; font-size: 13px; line-height: 1.4; resize: vertical; tab-size: 2;">${this._timetableToYaml(timetable)}</textarea>
              </div>

              <div class="modal-actions">
                <button type="button" class="submit-btn secondary" id="yaml-copy-btn" style="width: auto; padding: 10px 18px;">${this._t('copy_btn')}</button>
                <div class="modal-actions-right">
                  <button type="button" class="submit-btn secondary" id="yaml-cancel-btn">${this._t('cancel_btn')}</button>
                  <button type="submit" class="submit-btn">${this._t('import_btn')}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ` : ''}

      <!-- 3-Tab Settings Modal -->
      ${this._showSettingsModal ? `
        <div class="modal-backdrop" id="settings-modal-backdrop">
          <div class="modal-card" style="max-width: 560px; width: 100%;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <h3 style="margin: 0; font-size: 18px;">⚙️ ${this._t('settings_title', { child: this._selectedChild })}</h3>
              </div>
              <button class="icon-btn" id="settings-close-x" style="font-size: 20px; border: none; background: none; color: #fff; cursor: pointer; padding: 4px 8px;">✖</button>
            </div>

            <!-- Settings Tabs Header -->
            <div class="settings-tabs-header" style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1)); padding-bottom: 10px;">
              <button class="modal-tab-btn ${this._settingsTab === 'general' ? 'active' : ''}" id="settings-tab-btn-general" style="padding: 8px 14px; border-radius: 8px; border: 1px solid ${this._settingsTab === 'general' ? 'var(--primary-color, #3b82f6)' : 'rgba(255,255,255,0.1)'}; background: ${this._settingsTab === 'general' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)'}; color: #fff; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                ${this._t('settings_tab_general')}
              </button>
              <button class="modal-tab-btn ${this._settingsTab === 'subjects' ? 'active' : ''}" id="settings-tab-btn-subjects" style="padding: 8px 14px; border-radius: 8px; border: 1px solid ${this._settingsTab === 'subjects' ? 'var(--primary-color, #3b82f6)' : 'rgba(255,255,255,0.1)'}; background: ${this._settingsTab === 'subjects' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)'}; color: #fff; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                ${this._t('settings_tab_subjects')}
              </button>
              <button class="modal-tab-btn ${this._settingsTab === 'timetable' ? 'active' : ''}" id="settings-tab-btn-timetable" style="padding: 8px 14px; border-radius: 8px; border: 1px solid ${this._settingsTab === 'timetable' ? 'var(--primary-color, #3b82f6)' : 'rgba(255,255,255,0.1)'}; background: ${this._settingsTab === 'timetable' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)'}; color: #fff; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                ${this._t('settings_tab_timetable')}
              </button>
            </div>

            ${this._settingsTab === 'general' ? `
              <!-- General Settings Tab -->
              <form id="settings-form">
                <div class="form-group" style="margin-bottom: 16px;">
                  <label style="display: block; margin-bottom: 6px; font-weight: 500;">🌍 ${this._t('country_label')}</label>
                  <select id="settings-country-select" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: var(--card-background-color, rgba(0,0,0,0.25)); color: var(--primary-text-color, #fff); border: 1px solid var(--divider-color, rgba(255,255,255,0.15)); font-size: 13px; cursor: pointer;">
                    ${Object.entries(COUNTRY_SYSTEMS).map(([code, sys]) => `
                      <option value="${code}" ${code === childCountry ? 'selected' : ''}>
                        ${sys.flag} ${sys.name} (${sys.scale})
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                  <label style="display: block; margin-bottom: 6px; font-weight: 500;">🎒 ${this._t('grade_level_label')}</label>
                  <input type="text" id="settings-grade-level-input" placeholder="${this._t('grade_level_placeholder')}" value="${currentChild.gradeLevel || ''}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.25); color: #fff; border: 1px solid var(--divider-color, rgba(255,255,255,0.15)); font-size: 13px; box-sizing: border-box;">
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                  <label style="display: block; margin-bottom: 6px; font-weight: 500;">📅 ${this._t('calendar_select_label', { child: this._selectedChild })}</label>
                  <select id="settings-calendar-select" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.25); color: #fff; border: 1px solid var(--divider-color, rgba(255,255,255,0.15)); font-size: 13px; cursor: pointer;">
                    <option value="">${this._t('no_calendar_assigned')}</option>
                    ${availableCalendars.map(c => `
                      <option value="${c.entityId}" ${currentChild && currentChild.calendarEntity === c.entityId ? 'selected' : ''}>
                        📅 ${c.name} (${c.entityId})
                      </option>
                    `).join('')}
                  </select>
                </div>

                <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--divider-color, rgba(255,255,255,0.1));">

                <div class="form-group" style="margin-bottom: 20px;">
                  <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 13px; color: var(--primary-text-color, #fff);">
                    👁️ ${this._t('section_visibility_title')}
                  </label>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;">
                      <input type="checkbox" id="settings-show-prep" ${secVis.show_prep_card ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary-color, #4ea8de);">
                      <span>${this._t('section_prep')}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;">
                      <input type="checkbox" id="settings-show-calendar" ${secVis.show_calendar_card ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary-color, #4ea8de);">
                      <span>${this._t('section_calendar')}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;">
                      <input type="checkbox" id="settings-show-timetable" ${secVis.show_timetable_card ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary-color, #4ea8de);">
                      <span>${this._t('section_timetable')}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;">
                      <input type="checkbox" id="settings-show-overview" ${secVis.show_overview_card ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary-color, #4ea8de);">
                      <span>${this._t('section_overview')}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;">
                      <input type="checkbox" id="settings-show-back" ${secVis.show_back_button ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary-color, #4ea8de);">
                      <span>${this._t('section_back_btn')}</span>
                    </label>
                  </div>
                </div>

                <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 12px;">
                  <button type="button" class="submit-btn secondary" id="settings-cancel-btn">${this._t('cancel_btn')}</button>
                  <button type="submit" class="submit-btn">${this._t('save_btn')}</button>
                </div>
              </form>
            ` : this._settingsTab === 'subjects' ? `
              <!-- Manage Subjects Tab -->
              <div class="settings-subjects-tab">
                <form id="settings-add-subject-form" style="margin-bottom: 24px;">
                  <div class="form-group" style="margin-bottom: 12px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">
                      ➕ ${this._t('new_subject_label')}
                    </label>
                    <input type="text" id="settings-new-subject-name" placeholder="${this._t('new_subject_placeholder')}" required style="width: 100%; padding: 12px 14px; border-radius: 8px; background: rgba(0,0,0,0.25); color: #fff; border: 1px solid var(--divider-color, rgba(255,255,255,0.15)); font-size: 14px; box-sizing: border-box;">
                  </div>
                  <button type="submit" class="submit-btn secondary" style="width: 100%;">${this._t('submit_add_subject')}</button>
                </form>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--divider-color, rgba(255,255,255,0.1));">

                <div class="form-group" style="margin-bottom: 20px;">
                  <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">
                    🗑️ ${this._t('delete_subject_label')}
                  </label>
                  <div style="display: flex; gap: 10px; align-items: center;">
                    <select id="settings-delete-subject-select" style="flex: 1; padding: 12px 14px; border-radius: 8px; background: rgba(0,0,0,0.25); color: #fff; border: 1px solid var(--divider-color, rgba(255,255,255,0.15)); font-size: 14px; cursor: pointer;">
                      ${subjectList.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                    <button type="button" id="settings-delete-subject-btn" class="delete-btn" style="padding: 12px 18px; white-space: nowrap;" ${subjectList.length === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
                      ${this._t('delete_btn')}
                    </button>
                  </div>
                </div>

                <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                  <button type="button" class="submit-btn secondary" id="settings-cancel-btn">${this._t('cancel_btn')}</button>
                </div>
              </div>
            ` : `
              <!-- Timetable Tab in Settings -->
              <div class="settings-timetable-tab">
                <form id="settings-yaml-import-form">
                  <div class="form-group" style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #fff;">${this._t('yaml_textarea_label', { child: this._selectedChild })}</label>
                    <textarea id="settings-yaml-textarea" rows="10" style="font-family: monospace; font-size: 12px; line-height: 1.4; resize: vertical; tab-size: 2; width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">${this._timetableToYaml(timetable)}</textarea>
                  </div>

                  <div class="modal-actions" style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <button type="button" class="submit-btn secondary" id="settings-yaml-copy-btn" style="width: auto; padding: 8px 16px; font-size: 13px;">${this._t('copy_btn')}</button>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" class="submit-btn secondary" id="settings-cancel-btn" style="width: auto; padding: 8px 16px; font-size: 13px;">${this._t('cancel_btn')}</button>
                      <button type="submit" class="submit-btn" style="width: auto; padding: 8px 18px; font-size: 13px;">${this._t('import_btn')}</button>
                    </div>
                  </div>
                </form>
              </div>
            `}
          </div>
        </div>
      ` : ''}
    `;

    this._attachEventListeners();
  }

  _getCountdownBadge(targetDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: this._t('countdown_past'), cls: 'past' };
    if (diffDays === 0) return { text: this._t('countdown_today'), cls: 'today' };
    if (diffDays === 1) return { text: this._t('countdown_tomorrow'), cls: 'tomorrow' };
    if (diffDays <= 7) return { text: this._t('countdown_days', { days: diffDays }), cls: 'soon' };
    return { text: this._t('countdown_days', { days: diffDays }), cls: 'later' };
  }

  _getGradeColorClass(gradeVal, countryCode = 'DE') {
    const num = parseFloat(gradeVal);
    if (isNaN(num)) return 'grade-neutral';

    const sys = COUNTRY_SYSTEMS[countryCode] || COUNTRY_SYSTEMS.DE;

    if (sys.lower_is_better) {
      if (num <= 1.5) return 'grade-excellent';
      if (num <= 2.5) return 'grade-good';
      if (num <= 3.5) return 'grade-satisfactory';
      if (num <= 4.5) return 'grade-adequate';
      return 'grade-poor';
    } else {
      if (countryCode === 'CH') {
        if (num >= 5.5) return 'grade-excellent';
        if (num >= 4.5) return 'grade-good';
        if (num >= 4.0) return 'grade-satisfactory';
        if (num >= 3.0) return 'grade-adequate';
        return 'grade-poor';
      } else if (countryCode === 'FR') {
        if (num >= 16) return 'grade-excellent';
        if (num >= 14) return 'grade-good';
        if (num >= 12) return 'grade-satisfactory';
        if (num >= 10) return 'grade-adequate';
        return 'grade-poor';
      } else if (['IT', 'ES', 'NL'].includes(countryCode)) {
        if (num >= 8.5) return 'grade-excellent';
        if (num >= 7.0) return 'grade-good';
        if (num >= 6.0) return 'grade-satisfactory';
        if (num >= 5.0) return 'grade-adequate';
        return 'grade-poor';
      } else if (countryCode === 'US') {
        if (num >= 3.5) return 'grade-excellent';
        if (num >= 3.0) return 'grade-good';
        if (num >= 2.0) return 'grade-satisfactory';
        if (num >= 1.0) return 'grade-adequate';
        return 'grade-poor';
      } else if (countryCode === 'RU') {
        if (num >= 5.0) return 'grade-excellent';
        if (num >= 4.0) return 'grade-good';
        if (num >= 3.0) return 'grade-satisfactory';
        return 'grade-poor';
      } else if (countryCode === 'CN') {
        if (num >= 85) return 'grade-excellent';
        if (num >= 75) return 'grade-good';
        if (num >= 60) return 'grade-satisfactory';
        return 'grade-poor';
      } else {
        if (num >= 5.0) return 'grade-excellent';
        if (num >= 4.0) return 'grade-good';
        if (num >= 3.0) return 'grade-satisfactory';
        if (num >= 2.0) return 'grade-adequate';
        return 'grade-poor';
      }
    }
  }

  _attachEventListeners() {
    const root = this.shadowRoot;

    // Hamburger Menu Toggle (opens/closes Home Assistant sidebar)
    const menuToggleBtn = root.querySelector('#menu-toggle-btn');
    if (menuToggleBtn) {
      menuToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const event = new CustomEvent('hass-toggle-menu', {
          bubbles: true,
          composed: true,
          detail: { open: true },
        });
        this.dispatchEvent(event);
        window.dispatchEvent(event);
        try {
          const ha = document.querySelector('home-assistant');
          const main = ha && ha.shadowRoot && ha.shadowRoot.querySelector('home-assistant-main');
          if (main) {
            main.dispatchEvent(new CustomEvent('hass-toggle-menu', { bubbles: true, composed: true, detail: { open: true } }));
          }
        } catch (err) {}
        if (window.parent && window.parent !== window) {
          try {
            window.parent.dispatchEvent(new CustomEvent('hass-toggle-menu', { bubbles: true, composed: true, detail: { open: true } }));
          } catch (err) {}
        }
      });
    }

    // Back Button (navigates back to previous panel or dashboard)
    const backBtn = root.querySelector('#header-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/lovelace';
        }
      });
    }

    // Child Tabs
    root.querySelectorAll('.child-tabs .tab-btn[data-child]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const childName = e.currentTarget.dataset.child;
        if (childName) {
          this._selectedChild = childName;
          this._fetchUpcomingCalendarEvents();
          this.render();
        }
      });
    });

    // Summary Banner Interactive Toggles
    const toggleHomeworkBtn = root.querySelector('#toggle-homework-btn');
    if (toggleHomeworkBtn) {
      toggleHomeworkBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const currentChild = this._getSchoolGradesData()[this._selectedChild];
        const newStatus = !(currentChild && currentChild.homeworkDone);

        if (!this._localHomeworkDone) this._localHomeworkDone = {};
        this._localHomeworkDone[this._selectedChild] = newStatus;

        if (currentChild) {
          currentChild.homeworkDone = newStatus;
        }

        // Instant visual feedback on button
        if (newStatus) {
          toggleHomeworkBtn.classList.add('done-card');
          toggleHomeworkBtn.style.setProperty('border', '2px solid #22c55e', 'important');
          toggleHomeworkBtn.style.setProperty('background', 'rgba(34, 197, 94, 0.12)', 'important');
          const statVal = toggleHomeworkBtn.querySelector('.stat-value');
          if (statVal) {
            statVal.style.color = '#22c55e';
            statVal.textContent = this._t('homework_done_badge');
          }
        } else {
          toggleHomeworkBtn.classList.remove('done-card');
          toggleHomeworkBtn.style.removeProperty('border');
          toggleHomeworkBtn.style.removeProperty('background');
          const statVal = toggleHomeworkBtn.querySelector('.stat-value');
          if (statVal) {
            statVal.style.color = '#9ca3af';
            statVal.textContent = this._t('homework_open_badge');
          }
        }

        try {
          await this._hass.callService('school_grades', 'set_homework_done', {
            child_name: this._selectedChild,
            homework_done: newStatus,
          });
        } catch (err) {
          console.error("Failed to set homework done:", err);
        }
      });
    }

    const togglePrepBtn = root.querySelector('#toggle-prep-btn');
    if (togglePrepBtn) {
      togglePrepBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const currentChild = this._getSchoolGradesData()[this._selectedChild];
        const newStatus = !(currentChild && currentChild.preparationDone);

        // Instant local state update
        if (!this._localPreparationDone) this._localPreparationDone = {};
        this._localPreparationDone[this._selectedChild] = newStatus;

        if (!this._localPreparedSubjects) this._localPreparedSubjects = {};
        if (!this._localPreparedSubjects[this._selectedChild]) this._localPreparedSubjects[this._selectedChild] = {};

        // Update all prep subject cards on screen immediately
        root.querySelectorAll('.prep-item-clickable').forEach(item => {
          const subj = item.dataset.subject;
          if (subj) {
            this._localPreparedSubjects[this._selectedChild][subj] = newStatus;
          }
          if (newStatus) {
            item.classList.add('prepared-subject');
            item.style.setProperty('border', '2px solid #22c55e', 'important');
            item.style.setProperty('background', 'rgba(34, 197, 94, 0.14)', 'important');
            const checkIcon = item.querySelector('.prep-check-icon');
            if (checkIcon) checkIcon.style.display = 'inline';
          } else {
            item.classList.remove('prepared-subject');
            item.style.removeProperty('border');
            item.style.removeProperty('background');
            const checkIcon = item.querySelector('.prep-check-icon');
            if (checkIcon) checkIcon.style.display = 'none';
          }
        });

        // Instant visual feedback on banner button
        if (newStatus) {
          togglePrepBtn.classList.add('done-card');
          togglePrepBtn.style.setProperty('border', '2px solid #22c55e', 'important');
          togglePrepBtn.style.setProperty('background', 'rgba(34, 197, 94, 0.12)', 'important');
          const statVal = togglePrepBtn.querySelector('.stat-value');
          if (statVal) {
            statVal.style.color = '#22c55e';
            statVal.textContent = this._t('prep_done_badge');
          }
        } else {
          togglePrepBtn.classList.remove('done-card');
          togglePrepBtn.style.removeProperty('border');
          togglePrepBtn.style.removeProperty('background');
          const statVal = togglePrepBtn.querySelector('.stat-value');
          if (statVal) {
            statVal.style.color = '#9ca3af';
            statVal.textContent = this._t('prep_open_badge');
          }
        }

        try {
          await this._hass.callService('school_grades', 'set_preparation_done', {
            child_name: this._selectedChild,
            preparation_done: newStatus,
          });
        } catch (err) {
          console.error("Failed to set preparation done:", err);
        }
      });
    }

    // Next-day prep clickable subjects
    root.querySelectorAll('.prep-item-clickable').forEach(item => {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const subject = item.dataset.subject;
        if (!subject) return;

        const currentChild = this._getSchoolGradesData()[this._selectedChild];
        const prepMap = (currentChild && currentChild.preparedSubjects) || {};
        const isCurrentlyPrepared = Boolean(prepMap[subject]);
        const newPrepared = !isCurrentlyPrepared;

        // 1. Instant local state update
        if (!this._localPreparedSubjects) this._localPreparedSubjects = {};
        if (!this._localPreparedSubjects[this._selectedChild]) this._localPreparedSubjects[this._selectedChild] = {};
        this._localPreparedSubjects[this._selectedChild][subject] = newPrepared;

        if (currentChild) {
          if (!currentChild.preparedSubjects) currentChild.preparedSubjects = {};
          currentChild.preparedSubjects[subject] = newPrepared;
        }

        // 2. Instant DOM visual feedback (immediate border and checkmark)
        if (newPrepared) {
          item.classList.add('prepared-subject');
          item.style.setProperty('border', '2px solid #22c55e', 'important');
          item.style.setProperty('background', 'rgba(34, 197, 94, 0.14)', 'important');
          const checkIcon = item.querySelector('.prep-check-icon');
          if (checkIcon) checkIcon.style.display = 'inline';
        } else {
          item.classList.remove('prepared-subject');
          item.style.removeProperty('border');
          item.style.removeProperty('background');
          const checkIcon = item.querySelector('.prep-check-icon');
          if (checkIcon) checkIcon.style.display = 'none';
        }

        // 3. Instant banner card update
        const allItems = Array.from(root.querySelectorAll('.prep-item-clickable'));
        const allDone = allItems.length > 0 && allItems.every(el => el.classList.contains('prepared-subject'));
        const prepBtn = root.querySelector('#toggle-prep-btn');
        if (prepBtn) {
          if (allDone) {
            prepBtn.classList.add('done-card');
            prepBtn.style.setProperty('border', '2px solid #22c55e', 'important');
            prepBtn.style.setProperty('background', 'rgba(34, 197, 94, 0.12)', 'important');
            const statVal = prepBtn.querySelector('.stat-value');
            if (statVal) {
              statVal.style.color = '#22c55e';
              statVal.textContent = this._t('prep_done_badge');
            }
          } else {
            prepBtn.classList.remove('done-card');
            prepBtn.style.removeProperty('border');
            prepBtn.style.removeProperty('background');
            const statVal = prepBtn.querySelector('.stat-value');
            if (statVal) {
              statVal.style.color = '#9ca3af';
              statVal.textContent = this._t('prep_open_badge');
            }
          }
        }

        // 4. Asynchronously send service call
        try {
          await this._hass.callService('school_grades', 'toggle_prepared_subject', {
            child_name: this._selectedChild,
            subject: subject,
            state: newPrepared,
          });
        } catch (err) {
          console.error("Failed to toggle prepared subject:", err);
        }
      });
    });

    // Open Settings Modal
    const openSettingsBtn = root.querySelector('#open-settings-banner-btn');
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', () => {
        this._showSettingsModal = true;
        this._settingsTab = 'general';
        this.render();
      });
    }

    // Settings Modal Backdrop & Forms
    const settingsBackdrop = root.querySelector('#settings-modal-backdrop');
    if (settingsBackdrop) {
      settingsBackdrop.addEventListener('click', (e) => {
        if (e.target === settingsBackdrop) {
          this._showSettingsModal = false;
          this.render();
        }
      });

      const closeX = root.querySelector('#settings-close-x');
      if (closeX) {
        closeX.addEventListener('click', () => {
          this._showSettingsModal = false;
          this.render();
        });
      }

      root.querySelectorAll('#settings-cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._showSettingsModal = false;
          this.render();
        });
      });

      // Settings Tab Switchers
      const tabBtnGeneral = root.querySelector('#settings-tab-btn-general');
      if (tabBtnGeneral) {
        tabBtnGeneral.addEventListener('click', () => {
          this._settingsTab = 'general';
          this.render();
        });
      }

      const tabBtnSubjects = root.querySelector('#settings-tab-btn-subjects');
      if (tabBtnSubjects) {
        tabBtnSubjects.addEventListener('click', () => {
          this._settingsTab = 'subjects';
          this.render();
        });
      }

      const tabBtnTimetable = root.querySelector('#settings-tab-btn-timetable');
      if (tabBtnTimetable) {
        tabBtnTimetable.addEventListener('click', () => {
          this._settingsTab = 'timetable';
          this.render();
        });
      }

      const settingsForm = root.querySelector('#settings-form');
      if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const selectedCountry = root.querySelector('#settings-country-select').value;
          const gradeLevelVal = root.querySelector('#settings-grade-level-input').value.trim();
          const calEntity = root.querySelector('#settings-calendar-select').value;
          const showPrep = root.querySelector('#settings-show-prep').checked;
          const showCal = root.querySelector('#settings-show-calendar').checked;
          const showTt = root.querySelector('#settings-show-timetable').checked;
          const showOv = root.querySelector('#settings-show-overview').checked;
          const showBack = root.querySelector('#settings-show-back') ? root.querySelector('#settings-show-back').checked : false;

          if (!this._localSectionVisibility) this._localSectionVisibility = {};
          this._localSectionVisibility[this._selectedChild] = {
            show_prep_card: showPrep,
            show_calendar_card: showCal,
            show_timetable_card: showTt,
            show_overview_card: showOv,
            show_back_button: showBack,
          };

          await this._hass.callService('school_grades', 'update_settings', {
            child_name: this._selectedChild,
            country: selectedCountry,
            grade_level: gradeLevelVal,
            calendar_entity: calEntity,
            show_prep_card: showPrep,
            show_calendar_card: showCal,
            show_timetable_card: showTt,
            show_overview_card: showOv,
            show_back_button: showBack,
          });
          this._showSettingsModal = false;
          this.render();
          this._fetchUpcomingCalendarEvents();
          setTimeout(() => this.render(), 300);
          setTimeout(() => this.render(), 700);
        });
      }

      // Add Subject Form Submit (Inside Settings Modal)
      const settingsAddSubjectForm = root.querySelector('#settings-add-subject-form');
      if (settingsAddSubjectForm) {
        settingsAddSubjectForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const inputElem = root.querySelector('#settings-new-subject-name');
          const newSubject = inputElem ? inputElem.value.trim() : '';
          if (newSubject) {
            await this._hass.callService('school_grades', 'add_subject', {
              child_name: this._selectedChild,
              subject: newSubject,
            });
            if (inputElem) inputElem.value = '';
            setTimeout(() => this.render(), 200);
            setTimeout(() => this.render(), 600);
          }
        });
      }

      // Delete Subject Button (Inside Settings Modal)
      const settingsDeleteSubjectBtn = root.querySelector('#settings-delete-subject-btn');
      if (settingsDeleteSubjectBtn) {
        settingsDeleteSubjectBtn.addEventListener('click', async () => {
          const selectElem = root.querySelector('#settings-delete-subject-select');
          const subject = selectElem ? selectElem.value : '';
          if (subject && confirm(this._t('delete_subject_confirm', { subject: subject }))) {
            await this._hass.callService('school_grades', 'remove_subject', {
              child_name: this._selectedChild,
              subject: subject,
            });
            setTimeout(() => this.render(), 200);
            setTimeout(() => this.render(), 600);
          }
        });
      }

      // Timetable Tab Copy & Import inside Settings
      const settingsYamlCopyBtn = root.querySelector('#settings-yaml-copy-btn');
      if (settingsYamlCopyBtn) {
        settingsYamlCopyBtn.addEventListener('click', async () => {
          const textarea = root.querySelector('#settings-yaml-textarea');
          if (textarea) {
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textarea.value);
              } else {
                throw new Error('Clipboard API unavailable');
              }
            } catch (err) {
              textarea.select();
              document.execCommand('copy');
            }
            settingsYamlCopyBtn.textContent = this._t('copied_btn');
            setTimeout(() => { settingsYamlCopyBtn.textContent = this._t('copy_btn'); }, 2000);
          }
        });
      }

      const settingsYamlForm = root.querySelector('#settings-yaml-import-form');
      if (settingsYamlForm) {
        settingsYamlForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const childName = this._selectedChild;
          const yamlText = root.querySelector('#settings-yaml-textarea').value;
          if (this._localTimetableSchedule && this._localTimetableSchedule[childName]) {
            delete this._localTimetableSchedule[childName];
          }
          this._showSettingsModal = false;
          this.render();
          try {
            await this._hass.callService('school_grades', 'import_timetable', {
              child_name: childName,
              yaml_content: yamlText,
            });
          } catch (err) {
            console.error('Failed to import timetable YAML:', err);
          }
        });
      }
    }

    // Toggle Add Calendar Event Form
    const toggleAddEventBtn = root.querySelector('#toggle-add-event-btn');
    if (toggleAddEventBtn) {
      toggleAddEventBtn.addEventListener('click', () => {
        if (this._showAddEventCard) {
          this._showAddEventCard = false;
          this._editingEvent = null;
        } else {
          this._editingEvent = null;
          this._showAddEventCard = true;
        }
        this.render();
      });
    }

    const closeAddEventX = root.querySelector('#close-add-event-x');
    if (closeAddEventX) {
      closeAddEventX.addEventListener('click', () => {
        this._showAddEventCard = false;
        this._editingEvent = null;
        this.render();
      });
    }

    const cancelAddEventBtn = root.querySelector('#cancel-add-event-btn');
    if (cancelAddEventBtn) {
      cancelAddEventBtn.addEventListener('click', () => {
        this._showAddEventCard = false;
        this._editingEvent = null;
        this.render();
      });
    }

    // Click Event Item in Grid to Edit
    root.querySelectorAll('.clickable-event').forEach(item => {
      item.addEventListener('click', (e) => {
        const uid = e.currentTarget.dataset.uid || '';
        const summary = e.currentTarget.dataset.summary || '';
        const startIso = e.currentTarget.dataset.start || '';
        const description = e.currentTarget.dataset.desc || '';

        let dateStr = new Date().toISOString().split('T')[0];
        let timeStr = '08:00';

        if (startIso) {
          if (startIso.includes('T')) {
            const parts = startIso.split('T');
            dateStr = parts[0];
            if (parts[1] && parts[1].length >= 5) {
              timeStr = parts[1].substring(0, 5);
            }
          } else {
            dateStr = startIso.substring(0, 10);
          }
        }

        this._editingEvent = {
          uid: uid,
          summary: summary,
          date: dateStr,
          time: timeStr,
          description: description,
        };
        this._showAddEventCard = true;
        this.render();
      });
    });

    // Delete Calendar Event Button
    const deleteEventBtn = root.querySelector('#delete-event-btn');
    if (deleteEventBtn && this._editingEvent) {
      deleteEventBtn.addEventListener('click', async () => {
        const summary = this._editingEvent.summary;
        const uid = this._editingEvent.uid;
        if (confirm(this._t('delete_event_confirm', { summary: summary }))) {
          const currentChildData = this._getSchoolGradesData()[this._selectedChild];
          const calEntity = currentChildData ? currentChildData.calendarEntity : null;
          await this._hass.callService('school_grades', 'remove_calendar_event', {
            child_name: this._selectedChild,
            calendar_entity: calEntity,
            uid: uid,
            summary: summary,
            original_summary: summary,
            date: this._editingEvent ? this._editingEvent.date : '',
            original_date: this._editingEvent ? this._editingEvent.date : '',
          });
          this._showAddEventCard = false;
          this._editingEvent = null;
          this.render();
          this._fetchUpcomingCalendarEvents();
          setTimeout(() => {
            this._fetchUpcomingCalendarEvents();
            this.render();
          }, 500);
          setTimeout(() => {
            this._fetchUpcomingCalendarEvents();
            this.render();
          }, 1200);
        }
      });
    }

    // Add / Update Calendar Event Form Submit
    const addEventForm = root.querySelector('#add-event-form');
    if (addEventForm) {
      addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const summaryElem = root.querySelector('#event-summary-input');
        const dateElem = root.querySelector('#event-date-input');
        const timeElem = root.querySelector('#event-time-input');
        const descElem = root.querySelector('#event-desc-input');

        const summary = summaryElem ? summaryElem.value.trim() : '';
        const dateVal = dateElem ? dateElem.value : '';
        const timeVal = timeElem ? timeElem.value : '08:00';
        const descVal = descElem ? descElem.value.trim() : '';

        const currentChildData = this._getSchoolGradesData()[this._selectedChild];
        const calEntity = currentChildData ? currentChildData.calendarEntity : null;

        if (summary && dateVal && calEntity) {
          const serviceName = this._editingEvent ? 'update_calendar_event' : 'add_calendar_event';
          const payload = {
            child_name: this._selectedChild,
            calendar_entity: calEntity,
            summary: summary,
            date: dateVal,
            start_time: timeVal || '08:00',
            description: descVal,
          };
          if (this._editingEvent) {
            if (this._editingEvent.uid) payload.uid = this._editingEvent.uid;
            if (this._editingEvent.summary) payload.original_summary = this._editingEvent.summary;
            if (this._editingEvent.date) payload.original_date = this._editingEvent.date;
          }

          await this._hass.callService('school_grades', serviceName, payload);
          this._showAddEventCard = false;
          this._editingEvent = null;
          this.render();
          this._fetchUpcomingCalendarEvents();
          setTimeout(() => {
            this._fetchUpcomingCalendarEvents();
            this.render();
          }, 500);
          setTimeout(() => {
            this._fetchUpcomingCalendarEvents();
            this.render();
          }, 1200);
        }
      });
    }

    // Open YAML Modal
    const openYamlBtn = root.querySelector('#open-yaml-modal-btn');
    if (openYamlBtn) {
      openYamlBtn.addEventListener('click', () => {
        this._showYamlModal = true;
        this.render();
      });
    }

    // YAML Modal Backdrop & Form
    const yamlBackdrop = root.querySelector('#yaml-modal-backdrop');
    if (yamlBackdrop) {
      yamlBackdrop.addEventListener('click', (e) => {
        if (e.target === yamlBackdrop) {
          this._showYamlModal = false;
          this.render();
        }
      });

      const cancelYamlBtn = root.querySelector('#yaml-cancel-btn');
      if (cancelYamlBtn) {
        cancelYamlBtn.addEventListener('click', () => {
          this._showYamlModal = false;
          this.render();
        });
      }

      const copyYamlBtn = root.querySelector('#yaml-copy-btn');
      if (copyYamlBtn) {
        copyYamlBtn.addEventListener('click', async () => {
          const textarea = root.querySelector('#yaml-textarea');
          if (textarea) {
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textarea.value);
              } else {
                throw new Error('Clipboard API unavailable');
              }
            } catch (err) {
              textarea.select();
              document.execCommand('copy');
            }
            copyYamlBtn.textContent = this._t('copied_btn');
            setTimeout(() => { copyYamlBtn.textContent = this._t('copy_btn'); }, 2000);
          }
        });
      }

      const yamlForm = root.querySelector('#yaml-import-form');
      if (yamlForm) {
        yamlForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const childName = this._selectedChild;
          const yamlText = root.querySelector('#yaml-textarea').value;
          if (this._localTimetableSchedule && this._localTimetableSchedule[childName]) {
            delete this._localTimetableSchedule[childName];
          }
          this._showYamlModal = false;
          this.render();
          try {
            await this._hass.callService('school_grades', 'import_timetable', {
              child_name: childName,
              yaml_content: yamlText,
            });
          } catch (err) {
            console.error('Failed to import timetable YAML:', err);
          }
        });
      }
    }

    // Timetable Cell Clicks
    root.querySelectorAll('.timetable-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const targetCell = e.currentTarget;
        this._editingCell = {
          slotId: targetCell.dataset.slotId,
          day: targetCell.dataset.day,
          slotLabel: targetCell.dataset.slotLabel,
          dayLabel: targetCell.dataset.dayLabel,
          subject: targetCell.dataset.subject,
          room: targetCell.dataset.room,
          teacher: targetCell.dataset.teacher,
        };
        this.render();
      });
    });

    // Timetable Cell Edit Modal Backdrop & Form Handling
    const modalBackdrop = root.querySelector('#timetable-modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          this._editingCell = null;
          this.render();
        }
      });

      const subjectSelect = root.querySelector('#modal-subject-select');
      const customSubjectInput = root.querySelector('#modal-custom-subject');
      if (subjectSelect && customSubjectInput) {
        subjectSelect.addEventListener('change', (e) => {
          if (e.target.value === '__custom__') {
            customSubjectInput.style.display = 'block';
            customSubjectInput.value = '';
            customSubjectInput.focus();
          } else {
            customSubjectInput.style.display = 'none';
          }
        });
      }

      const cancelBtn = root.querySelector('#modal-cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this._editingCell = null;
          this.render();
        });
      }

      const deleteBtn = root.querySelector('#modal-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          if (!this._editingCell) return;
          const childName = this._selectedChild;
          const slotId = this._editingCell.slotId;
          const day = this._editingCell.day;

          // Optimistically update local timetable schedule
          if (!this._localTimetableSchedule) this._localTimetableSchedule = {};
          if (!this._localTimetableSchedule[childName]) this._localTimetableSchedule[childName] = {};
          if (!this._localTimetableSchedule[childName][slotId]) this._localTimetableSchedule[childName][slotId] = {};
          this._localTimetableSchedule[childName][slotId][day] = {
            subject: '',
            room: '',
            teacher: '',
          };

          this._editingCell = null;
          this.render();

          try {
            await this._hass.callService('school_grades', 'update_timetable_cell', {
              child_name: childName,
              slot_id: slotId,
              day: day,
              subject: '',
              room: '',
              teacher: '',
            });
          } catch (err) {
            console.error('Failed to clear timetable cell:', err);
          }
        });
      }

      const editForm = root.querySelector('#timetable-edit-form');
      if (editForm) {
        editForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!this._editingCell) return;
          const childName = this._selectedChild;
          const slotId = this._editingCell.slotId;
          const day = this._editingCell.day;

          let subjectVal = root.querySelector('#modal-subject-select').value;
          if (subjectVal === '__custom__') {
            subjectVal = (root.querySelector('#modal-custom-subject').value || '').trim();
          }
          const roomVal = (root.querySelector('#modal-room').value || '').trim();
          const teacherVal = (root.querySelector('#modal-teacher').value || '').trim();

          // Optimistically update local timetable schedule
          if (!this._localTimetableSchedule) this._localTimetableSchedule = {};
          if (!this._localTimetableSchedule[childName]) this._localTimetableSchedule[childName] = {};
          if (!this._localTimetableSchedule[childName][slotId]) this._localTimetableSchedule[childName][slotId] = {};
          this._localTimetableSchedule[childName][slotId][day] = {
            subject: subjectVal,
            room: roomVal,
            teacher: teacherVal,
          };

          this._editingCell = null;
          this.render();

          try {
            await this._hass.callService('school_grades', 'update_timetable_cell', {
              child_name: childName,
              slot_id: slotId,
              day: day,
              subject: subjectVal,
              room: roomVal,
              teacher: teacherVal,
            });
          } catch (err) {
            console.error('Failed to update timetable cell:', err);
          }
        });
      }
    }

    // Toggle Add Grade Form Button
    const toggleAddGradeBtn = root.querySelector('#toggle-add-grade-btn');
    if (toggleAddGradeBtn) {
      toggleAddGradeBtn.addEventListener('click', () => {
        this._showAddGradeCard = !this._showAddGradeCard;
        this.render();
      });
    }

    const closeAddGradeX = root.querySelector('#close-add-grade-x');
    if (closeAddGradeX) {
      closeAddGradeX.addEventListener('click', () => {
        this._showAddGradeCard = false;
        this.render();
      });
    }

    // Grade Pills
    root.querySelectorAll('#grade-pills .pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._selectedGrade = parseFloat(e.currentTarget.dataset.val);
        root.querySelector('#grade-input').value = this._selectedGrade;
        root.querySelectorAll('#grade-pills .pill-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Weight Pills
    root.querySelectorAll('#weight-pills .pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._selectedWeight = parseFloat(e.currentTarget.dataset.weight);
        root.querySelectorAll('#weight-pills .pill-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Add Grade Form Submit
    const addGradeForm = root.querySelector('#add-grade-form');
    if (addGradeForm) {
      addGradeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subject = root.querySelector('#grade-subject').value;
        const grade = parseFloat(root.querySelector('#grade-input').value);
        const weight = this._selectedWeight;
        const name = root.querySelector('#grade-name').value;
        const date = root.querySelector('#grade-date').value;

        await this._hass.callService('school_grades', 'add_grade', {
          child_name: this._selectedChild,
          subject: subject,
          grade: grade,
          weight: weight,
          name: name,
          date: date,
        });

        root.querySelector('#grade-name').value = '';
        this._showAddGradeCard = false;
        setTimeout(() => this.render(), 200);
        setTimeout(() => this.render(), 600);
      });
    }

    // Delete Grade Buttons
    root.querySelectorAll('.delete-grade-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const subject = e.currentTarget.dataset.subject;
        const gradeId = e.currentTarget.dataset.id;
        if (confirm(this._t('delete_grade_confirm'))) {
          await this._hass.callService('school_grades', 'remove_grade', {
            child_name: this._selectedChild,
            subject: subject,
            grade_id: gradeId,
          });
          setTimeout(() => this.render(), 200);
          setTimeout(() => this.render(), 600);
        }
      });
    });
  }

  _getStyles() {
    return `
      :host {
        display: block;
        background-color: var(--primary-background-color, #111827);
        color: var(--primary-text-color, #f3f4f6);
        font-family: var(--paper-font-body1_-_font-family, system-ui, -apple-system, sans-serif);
        min-height: 100vh;
        padding: 24px;
        box-sizing: border-box;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .menu-btn {
        background: var(--card-background-color, #1f2937);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--primary-text-color, #f3f4f6);
        width: 44px;
        height: 44px;
        min-width: 44px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .menu-btn:hover {
        background: rgba(59, 130, 246, 0.15);
        border-color: var(--primary-color, #3b82f6);
        color: var(--primary-color, #60a5fa);
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
      }

      .menu-btn:active {
        transform: translateY(0);
        background: rgba(59, 130, 246, 0.25);
      }

      .menu-btn svg {
        display: block;
        pointer-events: none;
      }

      .title-section h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        margin: 4px 0 0 0;
        color: var(--secondary-text-color, #9ca3af);
        font-size: 14px;
      }

      .child-tabs {
        display: flex;
        gap: 8px;
      }

      .tab-btn, .settings-tab-btn {
        background: var(--card-background-color, #1f2937);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--primary-text-color, #e5e7eb);
        padding: 10px 20px;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tab-btn:hover, .settings-tab-btn:hover {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
      }

      .tab-btn.active {
        background: linear-gradient(135deg, #2563eb, #7c3aed);
        color: #ffffff;
        border-color: transparent;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }

      .summary-banner {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        background: var(--card-background-color, #1f2937);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }

      .stat-card.primary {
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(124, 58, 237, 0.15));
        border-color: rgba(99, 102, 241, 0.3);
      }

      .stat-label {
        font-size: 13px;
        color: var(--secondary-text-color, #9ca3af);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }

      .stat-value {
        font-size: 36px;
        font-weight: 800;
        margin-top: 4px;
        color: var(--primary-text-color, #ffffff);
      }

      /* Preparation Card Styles */
      .prep-card {
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08));
        border: 1px solid rgba(99, 102, 241, 0.25);
      }

      .prep-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 16px;
      }

      .prep-title-group h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        background: linear-gradient(135deg, #60a5fa, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .prep-subtitle {
        font-size: 13px;
        color: var(--secondary-text-color, #9ca3af);
        display: block;
        margin-top: 2px;
      }

      .prep-badge {
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 8px;
        text-transform: uppercase;
      }

      .prep-badge.weekday {
        background: rgba(59, 130, 246, 0.2);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.3);
      }

      .prep-badge.weekend {
        background: rgba(139, 92, 246, 0.2);
        color: #c084fc;
        border: 1px solid rgba(139, 92, 246, 0.3);
      }

      .prep-exam-alert {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .exam-alert-icon {
        font-size: 22px;
      }

      .exam-alert-content {
        font-size: 13px;
        color: #fca5a5;
      }

      .exam-alert-list {
        margin-top: 4px;
        font-size: 14px;
        color: #ffffff;
      }

      .prep-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
      }

      .prep-item {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 12px;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .prep-item:hover {
        transform: translateY(-2px);
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
      }

      .prep-item.has-exam {
        background: rgba(239, 68, 68, 0.12) !important;
        border-color: rgba(239, 68, 68, 0.4) !important;
      }

      .prep-item.prepared-subject {
        border: 2px solid #22c55e !important;
        background: rgba(34, 197, 94, 0.14) !important;
      }

      .prep-item.prepared-subject.has-exam {
        border: 2px solid #22c55e !important;
        background: rgba(34, 197, 94, 0.14) !important;
        box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.6);
      }

      .prep-item-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .prep-slot-badge {
        font-size: 11px;
        font-weight: 700;
        color: #60a5fa;
      }

      .prep-slot-time {
        font-size: 10px;
        color: var(--secondary-text-color, #9ca3af);
      }

      .prep-subject-name {
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 6px;
      }

      .prep-meta {
        display: flex;
        gap: 8px;
        font-size: 11px;
        color: var(--secondary-text-color, #9ca3af);
        flex-wrap: wrap;
      }

      .prep-meta-tag {
        background: rgba(255, 255, 255, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
      }

      .prep-exam-badge {
        margin-top: 8px;
        background: #ef4444;
        color: white;
        font-size: 9px;
        font-weight: 800;
        padding: 3px 6px;
        border-radius: 4px;
        text-align: center;
      }

      /* Calendar Section */
      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 16px;
      }

      .calendar-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      .calendar-select-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .calendar-select-group label {
        font-size: 13px;
        color: var(--secondary-text-color, #9ca3af);
      }

      .calendar-select-group select {
        width: auto;
        min-width: 220px;
      }

      .empty-events {
        padding: 20px;
        text-align: center;
        color: var(--secondary-text-color, #9ca3af);
        font-size: 14px;
        line-height: 1.5;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
      }

      .events-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 14px;
      }

      .event-item {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 14px;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      }

      .event-item.clickable-event:hover {
        transform: translateY(-2px);
        border-color: var(--primary-color, #4ea8de);
        box-shadow: 0 4px 14px rgba(78, 168, 222, 0.25);
      }

      .event-badge-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .event-countdown {
        font-size: 11px;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
      }

      .event-countdown.today { background: rgba(239, 68, 68, 0.25); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); }
      .event-countdown.tomorrow { background: rgba(245, 158, 11, 0.25); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); }
      .event-countdown.soon { background: rgba(59, 130, 246, 0.25); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.4); }
      .event-countdown.later { background: rgba(156, 163, 175, 0.2); color: #9ca3af; }
      .event-countdown.past { background: rgba(107, 114, 128, 0.2); color: #6b7280; }

      .event-time {
        font-size: 12px;
        color: var(--secondary-text-color, #9ca3af);
      }

      .event-title {
        margin: 4px 0;
        font-size: 15px;
        font-weight: 700;
      }

      .event-detail {
        font-size: 13px;
        color: var(--secondary-text-color, #9ca3af);
        margin-top: 4px;
      }

      /* Timetable Styles */
      .timetable-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
      }

      .title-with-badge h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      .timetable-subtitle {
        font-size: 12px;
        color: var(--secondary-text-color, #9ca3af);
        display: block;
        margin-top: 2px;
      }

      .timetable-header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      .yaml-btn {
        background: rgba(59, 130, 246, 0.15) !important;
        border-color: rgba(59, 130, 246, 0.4) !important;
        color: #60a5fa !important;
      }

      .yaml-btn:hover {
        background: #2563eb !important;
        color: #ffffff !important;
      }

      .timetable-legend {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--secondary-text-color, #9ca3af);
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .now-dot {
        background: #ef4444;
        box-shadow: 0 0 6px #ef4444;
      }

      .today-dot {
        background: #3b82f6;
      }

      .timetable-table-container {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .timetable-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 700px;
        font-size: 13px;
      }

      .timetable-table th {
        background: rgba(255, 255, 255, 0.03);
        padding: 12px 10px;
        text-align: center;
        font-weight: 700;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
      }

      .timetable-table th.time-col {
        text-align: left;
        width: 130px;
        padding-left: 14px;
      }

      .timetable-table th.today-header {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
      }

      .today-badge {
        display: inline-block;
        background: #2563eb;
        color: white;
        font-size: 9px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 6px;
        vertical-align: middle;
      }

      .timetable-table td {
        padding: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        vertical-align: top;
        position: relative;
      }

      .timetable-table td:last-child {
        border-right: none;
      }

      .time-cell {
        background: rgba(255, 255, 255, 0.02);
        padding-left: 14px !important;
      }

      .slot-num {
        font-weight: 700;
        color: var(--primary-text-color, #ffffff);
      }

      .slot-time {
        font-size: 11px;
        color: var(--secondary-text-color, #9ca3af);
        margin-top: 2px;
      }

      .break-row {
        background: rgba(245, 158, 11, 0.06);
      }

      .break-cell-title {
        font-weight: 600;
        color: #f59e0b;
      }

      .break-cell-content {
        text-align: center;
        color: #f59e0b;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      .timetable-cell {
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 55px;
      }

      .timetable-cell:hover {
        background: rgba(59, 130, 246, 0.12) !important;
      }

      .timetable-cell.today-col {
        background: rgba(59, 130, 246, 0.03);
      }

      .timetable-cell.now-cell {
        background: rgba(239, 68, 68, 0.12) !important;
        border: 1px solid rgba(239, 68, 68, 0.5) !important;
      }

      .now-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: #ef4444;
        color: white;
        font-size: 9px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
      }

      .cell-subject {
        font-weight: 700;
        font-size: 14px;
        color: #ffffff;
        margin-bottom: 4px;
      }

      .cell-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 11px;
        color: var(--secondary-text-color, #9ca3af);
      }

      .cell-empty-trigger {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.2;
        transition: opacity 0.2s;
        min-height: 36px;
      }

      .timetable-cell:hover .cell-empty-trigger {
        opacity: 0.8;
      }

      .add-icon {
        font-size: 18px;
        font-weight: 300;
      }

      /* Modal Styles */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .modal-card {
        background: var(--card-background-color, #1f2937);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 24px;
        width: 90%;
        max-width: 460px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      }

      .yaml-modal-card {
        max-width: 620px !important;
      }

      .modal-header {
        margin-bottom: 20px;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
      }

      .modal-subtitle {
        font-size: 13px;
        color: var(--secondary-text-color, #9ca3af);
        margin-top: 4px;
        display: block;
      }

      .modal-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;
        gap: 12px;
      }

      .modal-actions-right {
        display: flex;
        gap: 8px;
      }

      .forms-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        margin-bottom: 32px;
      }

      @media (max-width: 900px) {
        .forms-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        :host {
          padding: 12px 12px 24px 12px;
        }
        .header {
          gap: 12px;
          margin-bottom: 16px;
        }
        .title-section h1 {
          font-size: 20px;
        }
        .header-left {
          gap: 10px;
        }
        .menu-btn {
          width: 40px;
          height: 40px;
          min-width: 40px;
        }
      }

      .card {
        background: var(--card-background-color, #1f2937);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .form-card h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--secondary-text-color, #9ca3af);
      }

      input[type="text"],
      input[type="number"],
      input[type="date"],
      textarea,
      select {
        width: 100%;
        padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: var(--primary-background-color, #111827);
        color: var(--primary-text-color, #ffffff);
        font-size: 14px;
        box-sizing: border-box;
      }

      input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }

      .form-row {
        display: flex;
        gap: 12px;
      }

      .form-group.half {
        flex: 1;
      }

      .quick-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .pill-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--primary-text-color, #d1d5db);
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .pill-btn:hover {
        background: rgba(59, 130, 246, 0.15);
        border-color: #3b82f6;
      }

      .pill-btn.active {
        background: #2563eb;
        color: #ffffff;
        border-color: #3b82f6;
      }

      .submit-btn {
        width: 100%;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        border: none;
        padding: 12px;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
        margin-top: 8px;
      }

      .submit-btn:hover {
        opacity: 0.9;
      }

      .submit-btn.secondary {
        background: linear-gradient(135deg, #4b5563, #374151);
      }

      .delete-subject-row {
        display: flex;
        gap: 8px;
      }

      .delete-btn {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
        padding: 8px 16px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .delete-btn:hover {
        background: #ef4444;
        color: #ffffff;
      }

      .section-title {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 16px;
      }

      .subjects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 20px;
      }

      .subject-card {
        display: flex;
        flex-direction: column;
      }

      .subject-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 14px;
      }

      .subject-title h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      .avg-badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
      }

      .empty-grades {
        padding: 24px 0;
        text-align: center;
        color: var(--secondary-text-color, #9ca3af);
        font-size: 14px;
        font-style: italic;
      }

      .grades-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }

      .grades-table th {
        text-align: left;
        padding: 8px 6px;
        color: var(--secondary-text-color, #9ca3af);
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
      }

      .grades-table td {
        padding: 10px 6px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .grade-pill {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 8px;
        font-weight: 800;
        font-size: 14px;
      }

      .grade-excellent { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
      .grade-good { background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
      .grade-satisfactory { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
      .grade-adequate { background: rgba(249, 115, 22, 0.2); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); }
      .grade-poor { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
      .grade-neutral { background: rgba(156, 163, 175, 0.2); color: #9ca3af; }

      .weight-badge {
        background: rgba(255, 255, 255, 0.06);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
      }

      .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        padding: 4px;
        border-radius: 6px;
        transition: background 0.2s;
      }

      .icon-btn:hover {
        background: rgba(239, 68, 68, 0.2);
      }
    `;
  }
}

customElements.define('school-grades-panel', SchoolGradesPanel);
