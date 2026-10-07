/**
 * Schulnoten Custom Sidebar Panel for Home Assistant
 * Multi-Language (i18n) Support: de, en, fr, it, es, nl, pl, ru, zh
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

const DEFAULT_ALIASES_MAP = {
  "Mathematik": ["m", "ma", "math", "mathe"],
  "Deutsch": ["d", "de", "deu"],
  "Englisch": ["e", "en", "eng"],
  "Latein": ["l", "lat"],
  "Französisch": ["f", "fr", "frz"],
  "Spanisch": ["sp", "spa"],
  "Italienisch": ["it", "ita"],
  "Biologie": ["b", "bio"],
  "Physik": ["ph", "phy"],
  "Chemie": ["c", "ch", "che"],
  "Geschichte": ["g", "ge", "gesch"],
  "Geographie": ["geo", "erd", "erdkunde"],
  "Sozialkunde": ["sk", "soz"],
  "Wirtschaft und Recht": ["wr", "wire", "wirtschaft"],
  "Informatik": ["inf", "it"],
  "Kunst": ["ku", "bk"],
  "Musik": ["mu"],
  "Sport": ["sp", "spo", "sm", "sw", "smd", "swd", "out"],
  "Chor": ["cho"],
  "Religion": ["rel"],
  "Ethik": ["eth"],
  "Evangelische Religion": ["ev", "evrel", "er", "evan", "evangelisch"],
  "Katholische Religion": ["kk", "rk", "katrel", "kr", "katholisch"],
  "Natur und Technik": ["nut", "ntg", "nutb", "nutp", "nut_b", "nut_nw"]
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
    prep_title_today: "🎒 Vorbereitung für den heutigen Schultag",
    prep_badge_weekday: "⏰ Morgen auf dem Stundenplan",
    prep_badge_today: "⚡ Heute auf dem Stundenplan",
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
    timetable_subtitle: "Klicke auf eine Zelle zum Bearbeiten",
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
    settings_tab_portal: "🏫 Eltern-Portal",
    portal_title: "Eltern-Portal (eltern-portal.org)",
    portal_desc: "Verknüpfe dieses Profil mit dem Eltern-Portal, um Stundenplan, Vertretungsplan, Termine und Klausuren automatisch abzugleichen.",
    portal_enable: "Eltern-Portal Synchronisierung aktivieren",
    portal_school: "Schule / Schulkürzel",
    portal_school_placeholder: "z. B. bspgym oder https://bspgym.eltern-portal.org (oder demo)",
    portal_school_help: "Kürzel der Schule (Subdomain auf eltern-portal.org), vollständige URL oder 'demo' zum Testen.",
    portal_username: "Benutzername / E-Mail",
    portal_password: "Passwort",
    portal_password_stored: "•••••••• (bereits hinterlegt)",
    portal_test_btn: "🔍 Verbindung testen & Kinder laden",
    portal_testing: "Verbindung wird geprüft...",
    portal_copy_from: "Zugangsdaten von Geschwisterkind übernehmen:",
    portal_child_select: "Verknüpftes Kind im Eltern-Portal auswählen:",
    portal_sync_options: "Synchronisierungs-Optionen:",
    portal_sync_tt: "Stundenplan bei jedem Sync automatisch überschreiben (optional)",
    portal_sync_tt_help: "Nicht empfohlen bei manuellen Stundenplan-Anpassungen. Der Stundenplan kann gezielt über den Button 'Stundenplan importieren' aktualisiert werden.",
    portal_sync_subst: "Vertretungsplan abgleichen (Ausfälle & Raumänderungen)",
    portal_sync_exams: "Klausuren & Termine abgleichen",
    portal_ignore_info_label: "Info-Termine ('event-info') ausschließen",
    portal_ignore_info_help: "Allgemeine Info-Termine ('event-info') der Schule ignorieren und nur Klausuren/wichtige Termine importieren.",
    portal_sync_now_btn: "🔄 Jetzt synchronisieren",
    portal_import_tt_btn: "📅 Stundenplan importieren",
    portal_import_exams_btn: "📝 Klausuren importieren",
    portal_sync_exams_title: "Klausuren importieren",
    portal_exam_badge: "Klausur",
    portal_exams_synced: "Klausuren & Termine erfolgreich synchronisiert!",
    portal_import_tt_confirm: "Möchtest du den aktuellen Stundenplan aus dem Eltern-Portal importieren und deinen lokalen Plan überschreiben?",
    portal_aliases_title: "🔤 Fach-Kürzel & Aliase (YAML)",
    portal_aliases_help: "Wandelt beim Import Kürzel (z. B. Ma) automatisch in Vollnamen (Mathematik) um und ordnet Vertretungen zu.",
    portal_aliases_slash_tip: "💡 Tipp für Wahlfächer & Schrägstrich-Kürzel (z. B. Eth/K/Ev, Mu/Cho, L1): Ziffern werden ignoriert. Bei Schrägstrichen wird das passende Fach automatisch anhand der belegten Fächer deines Kindes gewählt (inkl. passendem Lehrer/Raum). Du kannst auch eine Pfeil-Zuweisung wie 'Eth/K/Ev -> K' oder 'Mu/Cho -> Mu' eintragen.",
    portal_aliases_save_btn: "💾 Aliase speichern",
    portal_aliases_saved: "Aliase erfolgreich gespeichert!",
    portal_aliases_reset: "Standard wiederherstellen",
    portal_aliases_reset_confirm: "Möchtest du die Fach-Kürzel & Aliase wirklich auf die Standardwerte zurücksetzen? Eigene Anpassungen gehen dabei verloren.",
    portal_last_sync_label: "Letzter Sync:",
    portal_subst_stand: "Vertretungsplan Stand:",
    prep_subst_alert: "Vertretungsplan für nächsten Schultag",
    prep_subst_alert_today: "Vertretungsplan für heutigen Schultag",
    subst_badge_cancelled: "🚫 Entfällt",
    subst_badge_room: "📍 Raumänderung",
    subst_badge_subst: "🔄 Vertretung",
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
    
    yaml_textarea_label: "Stundenplan YAML-Konfiguration ({child})",
    copy_btn: "📋 Kopieren",
    copied_btn: "✅ Kopiert!",
    import_btn: "📥 YAML Importieren",

    days: {
      monday: "Montag",
      tuesday: "Dienstag",
      wednesday: "Mittwoch",
      thursday: "Donnerstag",
      friday: "Freitag",
      saturday: "Samstag",
      sunday: "Sonntag"
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
    prep_title_today: "🎒 Preparation for Today's School Day",
    prep_badge_weekday: "⏰ Tomorrow's Schedule",
    prep_badge_today: "⚡ Today's Schedule",
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
    timetable_subtitle: "Click a cell to edit",
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
    settings_tab_portal: "🏫 Parents Portal",
    portal_title: "Parents Portal (eltern-portal.org)",
    portal_desc: "Link this child profile with Eltern-Portal (eltern-portal.org) to sync timetable, substitutions, and exams.",
    portal_enable: "Enable Eltern-Portal sync",
    portal_school: "School identifier or URL",
    portal_school_placeholder: "e.g. bspgym or https://bspgym.eltern-portal.org (or demo)",
    portal_school_help: "School identifier (subdomain on eltern-portal.org), full URL or 'demo' for testing.",
    portal_username: "Username / E-mail",
    portal_password: "Password",
    portal_password_stored: "•••••••• (already saved)",
    portal_test_btn: "🔍 Test connection & load children",
    portal_testing: "Checking connection...",
    portal_copy_from: "Copy credentials from sibling:",
    portal_child_select: "Select linked child in Eltern-Portal:",
    portal_sync_options: "Synchronization options:",
    portal_sync_tt: "Automatically overwrite timetable on each sync (optional)",
    portal_sync_tt_help: "Not recommended if you customized your timetable. You can import on demand using the 'Import Timetable' button below.",
    portal_sync_subst: "Sync substitutions (cancellations & changes)",
    portal_sync_exams: "Sync exams & appointments",
    portal_ignore_info_label: "Exclude general info events ('event-info')",
    portal_ignore_info_help: "Ignore general school info notices ('event-info') and only import exams and important appointments.",
    portal_sync_now_btn: "🔄 Sync Now",
    portal_import_tt_btn: "📅 Import Timetable",
    portal_import_exams_btn: "📝 Import Exams",
    portal_sync_exams_title: "Import Exams",
    portal_exam_badge: "Exam",
    portal_exams_synced: "Exams & appointments successfully synchronized!",
    portal_import_tt_confirm: "Do you want to import the timetable from Eltern-Portal and overwrite your local timetable?",
    portal_aliases_title: "🔤 Subject Abbreviations & Aliases (YAML)",
    portal_aliases_help: "Converts abbreviations (e.g. Ma) to full subject names (Mathematics) during import and maps substitutions.",
    portal_aliases_slash_tip: "💡 Tip for electives & slash abbreviations (e.g. Eth/K/Ev, Mu/Cho, L1): Digits are ignored. Slashed subjects are matched against your child's active subjects automatically (matching teachers/rooms included). You can also add arrow mappings like 'Eth/K/Ev -> K' or 'Mu/Cho -> Mu'.",
    portal_aliases_save_btn: "💾 Save Aliases",
    portal_aliases_saved: "Aliases saved successfully!",
    portal_aliases_reset: "Restore Default Aliases",
    portal_aliases_reset_confirm: "Do you really want to reset subject aliases to default values? Custom changes will be lost.",
    portal_last_sync_label: "Last sync:",
    portal_subst_stand: "Substitutions update:",
    prep_subst_alert: "Substitutions for next school day",
    prep_subst_alert_today: "Substitutions for today",
    subst_badge_cancelled: "🚫 Cancelled",
    subst_badge_room: "📍 Room change",
    subst_badge_subst: "🔄 Substitution",
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
    
    yaml_textarea_label: "Timetable YAML Configuration ({child})",
    copy_btn: "📋 Copy",
    copied_btn: "✅ Copied!",
    import_btn: "📥 Import YAML",

    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    }
  },
  fr: {
    panel_title: "🎓 Notes scolaires & Emploi du temps",
    panel_subtitle: "Aperçu des notes, calendrier des examens & emploi du temps pour vos enfants",
    no_children_title: "🎓 Gestion des notes & de l'emploi du temps",
    no_children_text1: "Aucune instance d'enfant n'a encore été configurée dans Home Assistant.",
    no_children_text2: "Veuillez aller dans Paramètres ➔ Appareils et services ➔ Ajouter une intégration ➔ Schulnoten.",
    total_avg: "Moyenne générale",
    menu_toggle: "Ouvrir / fermer la barre latérale",
    back_btn_tooltip: "Retour au tableau de bord / panneau précédent",
    
    // Prep card
    prep_title: "🎒 Préparation du cartable pour demain",
    prep_badge_weekday: "⏰ Programme de demain",
    prep_badge_weekend: "📅 Préparation du week-end",
    prep_exam_alert: "Attention ! Examens prévus ce jour-là :",
    prep_empty: "Aucune matière prévue pour le {day} selon l'emploi du temps !",
    exam_badge: "⚠️ EXAMEN / CONTRÔLE",
    
    // Calendar card
    calendar_title: "📅 Examens & Événements à venir ({count})",
    calendar_select_label: "Calendrier scolaire :",
    no_calendar_assigned: "-- Aucun calendrier assigné --",
    calendar_hint: "💡 Sélectionnez un calendrier scolaire dans les paramètres (ex. Google Calendar, Local HA Calendar, CalDAV) pour afficher les examens à venir.",
    no_events: "🎉 Aucun examen ou événement enregistré dans le calendrier !",
    time_at: "à {time}",
    all_day: "(Toute la journée)",
    countdown_past: "Passé",
    countdown_today: "⚡ AUJOURD'HUI",
    countdown_tomorrow: "⚠️ Demain",
    countdown_days: "Dans {days} jours",
    add_event_btn: "➕ Ajouter un examen / événement",
    add_event_title: "📅 Créer un examen / événement dans le calendrier",
    edit_event_title: "✏️ Modifier l'examen / l'événement",
    event_summary_label: "Nom de l'examen / de l'événement",
    event_summary_placeholder: "ex. Contrôle de maths, Test de SVT",
    event_date_label: "Date",
    event_time_label: "Heure",
    event_desc_label: "Description / Salle (optionnel)",
    event_desc_placeholder: "ex. Salle 101, Réviser chap. 3",
    submit_add_event: "💾 Enregistrer dans le calendrier",
    submit_update_event: "💾 Enregistrer les modifications",
    delete_event_btn: "🗑️ Supprimer l'événement",
    delete_event_confirm: "Êtes-vous sûr de vouloir supprimer l'événement \"{summary}\" du calendrier ?",
    
    // Timetable card
    timetable_title: "📅 Emploi du temps hebdomadaire",
    timetable_subtitle: "Cliquez sur une case pour la modifier",
    legend_now: "⚡ EN CE MOMENT",
    legend_today: "Aujourd'hui",
    time_hour_col: "Heure / Créneau",
    break_label: "Pause",
    today_badge: "AUJOURD'HUI",
    now_badge: "⚡ EN COURS",
    
    // Add grade form
    add_grade_title: "➕ Ajouter une note",
    subject_label: "Matière",
    grade_label: "Note",
    weight_label: "Coefficient",
    weight_times: "coef. {weight}",
    grade_name_label: "Description (ex. 1er contrôle)",
    grade_name_placeholder: "ex. Devoir surveillé, Oral, Quiz",
    date_label: "Date",
    submit_add_grade: "➕ Enregistrer la note",
    toggle_add_grade_btn: "➕ Ajouter une note",
    close_add_grade_btn: "✖ Masquer le formulaire",
    
    // Manage subjects form
    manage_subjects_title: "📘 Gérer les matières",
    new_subject_label: "Ajouter une nouvelle matière",
    new_subject_placeholder: "ex. Physique, Arts, Musique",
    submit_add_subject: "➕ Créer la matière",
    delete_subject_label: "Supprimer une matière existante",
    delete_btn: "🗑️ Supprimer",
    delete_subject_confirm: "Êtes-vous sûr de vouloir supprimer la matière \"{subject}\" ainsi que toutes ses notes ?",
    
    // Subjects overview
    overview_title: "📘 Aperçu des matières & notes",
    avg_label: "Moy.",
    no_grades_yet: "Aucune note enregistrée pour l'instant",
    table_grade: "Note",
    table_weight: "Coefficient",
    table_date: "Date",
    table_name: "Intitulé",
    table_action: "Action",
    delete_grade_confirm: "Êtes-vous sûr de vouloir supprimer cette note ?",
    
    // Settings
    settings_btn: "Paramètres",
    settings_title: "⚙️ Paramètres ({child})",
    settings_tab_general: "⚙️ Général",
    settings_tab_subjects: "📘 Gérer les matières",
    settings_tab_timetable: "📅 Emploi du temps",
    grade_level_label: "Classe / Niveau scolaire",
    grade_level_placeholder: "ex. 6ème A, 4ème B",
    homework_card: "Devoirs",
    homework_done_badge: "✓ Terminés",
    homework_open_badge: "En attente",
    prep_card_status: "Préparation",
    prep_done_badge: "✓ Terminée",
    prep_open_badge: "En attente",
    country_label: "Pays / Système de notation",
    country_hint: "Définit l'échelle de notation et le barème pour cette instance.",
    section_visibility_title: "Afficher / masquer les sections",
    section_prep: "Préparation du cartable pour demain",
    section_calendar: "Examens et événements à venir",
    section_timetable: "Emploi du temps hebdomadaire",
    section_overview: "Aperçu des matières et notes",

    // Modals
    modal_cell_title: "✏️ Modifier la case de l'emploi du temps",
    no_subject_free: "-- Aucune matière (Heure libre) --",
    custom_subject_opt: "➕ Saisir une autre matière...",
    custom_subject_placeholder: "Saisir une matière personnalisée",
    room_label: "Salle (optionnel)",
    room_placeholder: "ex. S102",
    teacher_label: "Enseignant(e) (optionnel)",
    teacher_placeholder: "ex. M. Dupont",
    cancel_btn: "Annuler",
    save_btn: "💾 Enregistrer",
    
    yaml_textarea_label: "Configuration YAML de l'emploi du temps ({child})",
    copy_btn: "📋 Copier",
    copied_btn: "✅ Copié !",
    import_btn: "📥 Importer YAML",

    days: {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche"
    }
  },
  it: {
    panel_title: "🎓 Voti scolastici & Orario",
    panel_subtitle: "Riepilogo voti, calendario verifiche & orario settimanale dei tuoi figli",
    no_children_title: "🎓 Gestione voti & orario scolastico",
    no_children_text1: "Nessun bambino è stato ancora configurato in Home Assistant.",
    no_children_text2: "Vai su Impostazioni ➔ Dispositivi e servizi ➔ Aggiungi integrazione ➔ Schulnoten.",
    total_avg: "Media generale",
    menu_toggle: "Apri / chiudi barra laterale",
    back_btn_tooltip: "Torna alla dashboard / pannello precedente",
    
    // Prep card
    prep_title: "🎒 Preparazione cartella per domani",
    prep_badge_weekday: "⏰ Materie di domani",
    prep_badge_weekend: "📅 Preparazione del fine settimana",
    prep_exam_alert: "Attenzione! Verifiche in programma per questo giorno:",
    prep_empty: "Nessuna materia in programma per {day} secondo l'orario!",
    exam_badge: "⚠️ VERIFICA / TEST",
    
    // Calendar card
    calendar_title: "📅 Prossime verifiche & eventi ({count})",
    calendar_select_label: "Calendario scolastico:",
    no_calendar_assigned: "-- Nessun calendario assegnato --",
    calendar_hint: "💡 Seleziona un calendario nelle impostazioni (es. Google Calendar, Local HA Calendar, CalDAV) per visualizzare le verifiche.",
    no_events: "🎉 Nessuna verifica o evento in programma nel calendario!",
    time_at: "alle ore {time}",
    all_day: "(Tutto il giorno)",
    countdown_past: "Passato",
    countdown_today: "⚡ OGGI",
    countdown_tomorrow: "⚠️ Domani",
    countdown_days: "Tra {days} giorni",
    add_event_btn: "➕ Aggiungi verifica / evento",
    add_event_title: "📅 Crea verifica / evento nel calendario",
    edit_event_title: "✏️ Modifica verifica / evento",
    event_summary_label: "Titolo / Nome verifica",
    event_summary_placeholder: "es. Verifica di matematica, Test di scienze",
    event_date_label: "Data",
    event_time_label: "Ora",
    event_desc_label: "Descrizione / Aula (opzionale)",
    event_desc_placeholder: "es. Aula 101, Capitoli 3-4",
    submit_add_event: "💾 Salva nel calendario",
    submit_update_event: "💾 Salva modifiche",
    delete_event_btn: "🗑️ Elimina evento",
    delete_event_confirm: "Sei sicuro di voler eliminare l'evento \"{summary}\" dal calendario?",
    
    // Timetable card
    timetable_title: "📅 Orario settimanale",
    timetable_subtitle: "Clicca su una casella per modificarla",
    legend_now: "⚡ ORA",
    legend_today: "Oggi",
    time_hour_col: "Ora / Periodo",
    break_label: "Ricreazione",
    today_badge: "OGGI",
    now_badge: "⚡ ORA",
    
    // Add grade form
    add_grade_title: "➕ Aggiungi voto",
    subject_label: "Materia",
    grade_label: "Voto",
    weight_label: "Peso",
    weight_times: "peso {weight}x",
    grade_name_label: "Descrizione (es. 1ª verifica)",
    grade_name_placeholder: "es. Verifica scritta, Interrogazione, Test",
    date_label: "Data",
    submit_add_grade: "➕ Registra voto",
    toggle_add_grade_btn: "➕ Aggiungi voto",
    close_add_grade_btn: "✖ Nascondi modulo",
    
    // Manage subjects form
    manage_subjects_title: "📘 Gestisci materie",
    new_subject_label: "Aggiungi nuova materia",
    new_subject_placeholder: "es. Fisica, Arte, Musica",
    submit_add_subject: "➕ Crea materia",
    delete_subject_label: "Elimina materia esistente",
    delete_btn: "🗑️ Elimina",
    delete_subject_confirm: "Sei sicuro di voler eliminare la materia \"{subject}\" e tutti i voti associati?",
    
    // Subjects overview
    overview_title: "📘 Riepilogo materie & voti",
    avg_label: "Media",
    no_grades_yet: "Nessun voto registrato finora",
    table_grade: "Voto",
    table_weight: "Peso",
    table_date: "Data",
    table_name: "Descrizione",
    table_action: "Azione",
    delete_grade_confirm: "Sei sicuro di voler eliminare questo voto?",
    
    // Settings
    settings_btn: "Impostazioni",
    settings_title: "⚙️ Impostazioni ({child})",
    settings_tab_general: "⚙️ Generale",
    settings_tab_subjects: "📘 Gestisci materie",
    settings_tab_timetable: "📅 Orario",
    grade_level_label: "Classe / Anno scolastico",
    grade_level_placeholder: "es. 1ª A, 3ª B",
    homework_card: "Compiti",
    homework_done_badge: "✓ Fatti",
    homework_open_badge: "In sospeso",
    prep_card_status: "Preparazione",
    prep_done_badge: "✓ Fatta",
    prep_open_badge: "In sospeso",
    country_label: "Paese / Sistema di valutazione",
    country_hint: "Determina la scala dei voti e il metodo di valutazione.",
    section_visibility_title: "Mostra / nascondi sezioni del pannello",
    section_prep: "Preparazione cartella per domani",
    section_calendar: "Prossime verifiche ed eventi",
    section_timetable: "Orario settimanale",
    section_overview: "Riepilogo materie e voti",

    // Modals
    modal_cell_title: "✏️ Modifica casella dell'orario",
    no_subject_free: "-- Nessuna materia (Ora buca) --",
    custom_subject_opt: "➕ Inserisci altra materia...",
    custom_subject_placeholder: "Nome materia personalizzata",
    room_label: "Aula (opzionale)",
    room_placeholder: "es. Aula 102",
    teacher_label: "Insegnante (opzionale)",
    teacher_placeholder: "es. Prof. Rossi",
    cancel_btn: "Annulla",
    save_btn: "💾 Salva",
    
    yaml_textarea_label: "Configurazione YAML dell'orario ({child})",
    copy_btn: "📋 Copia",
    copied_btn: "✅ Copiato!",
    import_btn: "📥 Importa YAML",

    days: {
      monday: "Lunedì",
      tuesday: "Martedì",
      wednesday: "Mercoledì",
      thursday: "Giovedì",
      friday: "Venerdì",
      saturday: "Sabato",
      sunday: "Domenica"
    }
  },
  es: {
    panel_title: "🎓 Notas escolares & Horario",
    panel_subtitle: "Resumen de notas, calendario de exámenes y horario semanal de tus hijos",
    no_children_title: "🎓 Gestión de notas & horario escolar",
    no_children_text1: "Aún no se ha configurado ninguna instancia de hijo/a en Home Assistant.",
    no_children_text2: "Por favor, ve a Ajustes ➔ Dispositivos y servicios ➔ Añadir integración ➔ Schulnoten.",
    total_avg: "Promedio general",
    menu_toggle: "Abrir / cerrar barra lateral",
    back_btn_tooltip: "Volver al panel / cuadro de mando anterior",
    
    // Prep card
    prep_title: "🎒 Preparar la mochila para mañana",
    prep_badge_weekday: "⏰ Asignaturas de mañana",
    prep_badge_weekend: "📅 Preparación del fin de semana",
    prep_exam_alert: "¡Atención! Exámenes previstos para este día:",
    prep_empty: "¡No hay asignaturas programadas para el {day} según el horario!",
    exam_badge: "⚠️ EXAMEN / CONTROL",
    
    // Calendar card
    calendar_title: "📅 Próximos exámenes & eventos ({count})",
    calendar_select_label: "Calendario escolar:",
    no_calendar_assigned: "-- Ningún calendario asignado --",
    calendar_hint: "💡 Selecciona un calendario escolar en los ajustes (p. ej. Google Calendar, Local HA Calendar, CalDAV) para mostrar los exámenes.",
    no_events: "🎉 ¡No hay exámenes ni eventos programados en el calendario!",
    time_at: "a las {time}",
    all_day: "(Todo el día)",
    countdown_past: "Pasado",
    countdown_today: "⚡ HOY",
    countdown_tomorrow: "⚠️ Mañana",
    countdown_days: "En {days} días",
    add_event_btn: "➕ Añadir examen / evento",
    add_event_title: "📅 Crear examen / evento en el calendario",
    edit_event_title: "✏️ Editar examen / evento",
    event_summary_label: "Título / Nombre del examen",
    event_summary_placeholder: "p. ej. Examen de matemáticas, Test de biología",
    event_date_label: "Fecha",
    event_time_label: "Hora",
    event_desc_label: "Descripción / Aula (opcional)",
    event_desc_placeholder: "p. ej. Aula 101, Temas tema 3",
    submit_add_event: "💾 Guardar en el calendario",
    submit_update_event: "💾 Guardar cambios",
    delete_event_btn: "🗑️ Eliminar evento",
    delete_event_confirm: "¿Seguro que quieres eliminar el evento \"{summary}\" del calendario?",
    
    // Timetable card
    timetable_title: "📅 Horario semanal",
    timetable_subtitle: "Haz clic en una casilla para editarla",
    legend_now: "⚡ AHORA",
    legend_today: "Hoy",
    time_hour_col: "Hora / Sesión",
    break_label: "Recreo",
    today_badge: "HOY",
    now_badge: "⚡ AHORA",
    
    // Add grade form
    add_grade_title: "➕ Registrar nueva nota",
    subject_label: "Asignatura",
    grade_label: "Nota",
    weight_label: "Ponderación",
    weight_times: "{weight}x",
    grade_name_label: "Descripción (p. ej. 1er examen)",
    grade_name_placeholder: "p. ej. Examen parcial, Oral, Trabajo",
    date_label: "Fecha",
    submit_add_grade: "➕ Registrar nota",
    toggle_add_grade_btn: "➕ Registrar nueva nota",
    close_add_grade_btn: "✖ Ocultar formulario",
    
    // Manage subjects form
    manage_subjects_title: "📘 Gestionar asignaturas",
    new_subject_label: "Añadir nueva asignatura",
    new_subject_placeholder: "p. ej. Física, Arte, Música",
    submit_add_subject: "➕ Crear asignatura",
    delete_subject_label: "Eliminar asignatura existente",
    delete_btn: "🗑️ Eliminar",
    delete_subject_confirm: "¿Seguro que quieres eliminar la asignatura \"{subject}\" y todas sus notas?",
    
    // Subjects overview
    overview_title: "📘 Resumen de asignaturas y notas",
    avg_label: "Media",
    no_grades_yet: "Aún no se han registrado notas",
    table_grade: "Nota",
    table_weight: "Ponderación",
    table_date: "Fecha",
    table_name: "Descripción",
    table_action: "Acción",
    delete_grade_confirm: "¿Seguro que quieres eliminar esta nota?",
    
    // Settings
    settings_btn: "Ajustes",
    settings_title: "⚙️ Ajustes ({child})",
    settings_tab_general: "⚙️ General",
    settings_tab_subjects: "📘 Gestionar asignaturas",
    settings_tab_timetable: "📅 Horario",
    grade_level_label: "Curso / Nivel escolar",
    grade_level_placeholder: "p. ej. 5º A, 1º ESO",
    homework_card: "Deberes",
    homework_done_badge: "✓ Hechos",
    homework_open_badge: "Pendiente",
    prep_card_status: "Preparación",
    prep_done_badge: "✓ Lista",
    prep_open_badge: "Pendiente",
    country_label: "País / Sistema de calificaciones",
    country_hint: "Determina la escala de notas y el sistema de evaluación.",
    section_visibility_title: "Mostrar / ocultar secciones del panel",
    section_prep: "Preparación de la mochila para mañana",
    section_calendar: "Próximos exámenes y eventos",
    section_timetable: "Horario semanal",
    section_overview: "Resumen de asignaturas y notas",

    // Modals
    modal_cell_title: "✏️ Editar casilla del horario",
    no_subject_free: "-- Sin asignatura (Hora libre) --",
    custom_subject_opt: "➕ Escribir otra asignatura...",
    custom_subject_placeholder: "Nombre de asignatura personalizada",
    room_label: "Aula (opcional)",
    room_placeholder: "p. ej. Aula 102",
    teacher_label: "Profesor/a (opcional)",
    teacher_placeholder: "p. ej. Sra. García",
    cancel_btn: "Cancelar",
    save_btn: "💾 Guardar",
    
    yaml_textarea_label: "Configuración YAML del horario ({child})",
    copy_btn: "📋 Copiar",
    copied_btn: "✅ ¡Copiado!",
    import_btn: "📥 Importar YAML",

    days: {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    }
  },
  nl: {
    panel_title: "🎓 Schoolcijfers & Lesrooster",
    panel_subtitle: "Cijferoverzicht, toetsenkalender & lesrooster voor je kinderen",
    no_children_title: "🎓 Beheer van schoolcijfers & lesroosters",
    no_children_text1: "Er zijn nog geen kinderen geconfigureerd in Home Assistant.",
    no_children_text2: "Ga naar Instellingen ➔ Apparaten en diensten ➔ Integratie toevoegen ➔ Schulnoten.",
    total_avg: "Totale gemiddelde",
    menu_toggle: "Zijbalk openen / sluiten",
    back_btn_tooltip: "Terug naar vorig dashboard / paneel",
    
    // Prep card
    prep_title: "🎒 Schooltas klaarmaken voor morgen",
    prep_badge_weekday: "⏰ Lessen van morgen",
    prep_badge_weekend: "📅 Weekendvoorbereiding",
    prep_exam_alert: "Let op! Toetsen of proefwerken op deze dag:",
    prep_empty: "Geen vakken ingepland voor {day} volgens het lesrooster!",
    exam_badge: "⚠️ TOETS / PROEFWERK",
    
    // Calendar card
    calendar_title: "📅 Komende toetsen & afspraken ({count})",
    calendar_select_label: "Schoolagenda:",
    no_calendar_assigned: "-- Geen agenda toegewezen --",
    calendar_hint: "💡 Kies een schoolagenda in Instellingen (bijv. Google Agenda, Local HA Calendar, CalDAV) om toetsen te tonen.",
    no_events: "🎉 Geen aankomende toetsen of afspraken in de agenda!",
    time_at: "om {time} uur",
    all_day: "(Hele dag)",
    countdown_past: "Voorbij",
    countdown_today: "⚡ VANDAAG",
    countdown_tomorrow: "⚠️ Morgen",
    countdown_days: "Over {days} dagen",
    add_event_btn: "➕ Toets / afspraak toevoegen",
    add_event_title: "📅 Nieuwe toets / afspraak in agenda maken",
    edit_event_title: "✏️ Toets / afspraak bewerken",
    event_summary_label: "Titel / Naam van toets",
    event_summary_placeholder: "bijv. Wiskunde proefwerk, Biologie toets",
    event_date_label: "Datum",
    event_time_label: "Tijd",
    event_desc_label: "Beschrijving / Lokaal (optioneel)",
    event_desc_placeholder: "bijv. Lokaal 101, Hoofdstuk 3",
    submit_add_event: "💾 Opslaan in agenda",
    submit_update_event: "💾 Wijzigingen opslaan",
    delete_event_btn: "🗑️ Afspraak verwijderen",
    delete_event_confirm: "Weet je zeker dat je de afspraak \"{summary}\" uit de agenda wilt verwijderen?",
    
    // Timetable card
    timetable_title: "📅 Weekrooster",
    timetable_subtitle: "Klik op een vakje om te bewerken",
    legend_now: "⚡ NU",
    legend_today: "Vandaag",
    time_hour_col: "Tijd / Lesuur",
    break_label: "Pauze",
    today_badge: "VANDAAG",
    now_badge: "⚡ NU",
    
    // Add grade form
    add_grade_title: "➕ Nieuw cijfer invoeren",
    subject_label: "Vak",
    grade_label: "Cijfer",
    weight_label: "Weging",
    weight_times: "{weight}x weging",
    grade_name_label: "Omschrijving (bijv. 1e toets)",
    grade_name_placeholder: "bijv. Proefwerk, Overhoring, Mondeling",
    date_label: "Datum",
    submit_add_grade: "➕ Cijfer opslaan",
    toggle_add_grade_btn: "➕ Nieuw cijfer invoeren",
    close_add_grade_btn: "✖ Formulier verbergen",
    
    // Manage subjects form
    manage_subjects_title: "📘 Schoolvakken beheren",
    new_subject_label: "Nieuw vak toevoegen",
    new_subject_placeholder: "bijv. Natuurkunde, Kunst, Muziek",
    submit_add_subject: "➕ Vak aanmaken",
    delete_subject_label: "Bestaand vak verwijderen",
    delete_btn: "🗑️ Verwijderen",
    delete_subject_confirm: "Weet je zeker dat je het vak \"{subject}\" en alle bijbehorende cijfers wilt verwijderen?",
    
    // Subjects overview
    overview_title: "📘 Vakken- & cijferoverzicht",
    avg_label: "Gem.",
    no_grades_yet: "Nog geen cijfers ingevoerd",
    table_grade: "Cijfer",
    table_weight: "Weging",
    table_date: "Datum",
    table_name: "Omschrijving",
    table_action: "Actie",
    delete_grade_confirm: "Weet je zeker dat je dit cijfer wilt verwijderen?",
    
    // Settings
    settings_btn: "Instellingen",
    settings_title: "⚙️ Instellingen ({child})",
    settings_tab_general: "⚙️ Algemeen",
    settings_tab_subjects: "📘 Vakken beheren",
    settings_tab_timetable: "📅 Lesrooster",
    grade_level_label: "Klas / Leerjaar",
    grade_level_placeholder: "bijv. 2VWO, Groep 8",
    homework_card: "Huiswerk",
    homework_done_badge: "✓ Klaar",
    homework_open_badge: "Open",
    prep_card_status: "Voorbereiding",
    prep_done_badge: "✓ Klaar",
    prep_open_badge: "Open",
    country_label: "Land / Cijfersysteem",
    country_hint: "Bepaalt de cijferschaal en beoordeling voor dit kind.",
    section_visibility_title: "Onderdelen van het paneel tonen / verbergen",
    section_prep: "Schooltas klaarmaken voor morgen",
    section_calendar: "Aankomende toetsen en afspraken",
    section_timetable: "Weekrooster",
    section_overview: "Vakken en cijferoverzicht",

    // Modals
    modal_cell_title: "✏️ Lesrooster-vakje bewerken",
    no_subject_free: "-- Geen vak (Tussenur) --",
    custom_subject_opt: "➕ Ander vak invoeren...",
    custom_subject_placeholder: "Eigen vak invoeren",
    room_label: "Lokaal (optioneel)",
    room_placeholder: "bijv. L102",
    teacher_label: "Docent (optioneel)",
    teacher_placeholder: "bijv. Dhr. De Vries",
    cancel_btn: "Annuleren",
    save_btn: "💾 Opslaan",
    
    yaml_textarea_label: "Lesrooster YAML-configuratie ({child})",
    copy_btn: "📋 Kopiëren",
    copied_btn: "✅ Gekopieerd!",
    import_btn: "📥 YAML importeren",

    days: {
      monday: "Maandag",
      tuesday: "Dinsdag",
      wednesday: "Woensdag",
      thursday: "Donderdag",
      friday: "Vrijdag",
      saturday: "Zaterdag",
      sunday: "Zondag"
    }
  },
  pl: {
    panel_title: "🎓 Oceny szkolne & Plan lekcji",
    panel_subtitle: "Zestawienie ocen, kalendarz sprawdzianów i plan lekcji Twoich dzieci",
    no_children_title: "🎓 Zarządzanie ocenami i planem lekcji",
    no_children_text1: "W Home Assistant nie skonfigurowano jeszcze żadnego dziecka.",
    no_children_text2: "Przejdź do Ustawienia ➔ Urządzenia i usługi ➔ Dodaj integrację ➔ Schulnoten.",
    total_avg: "Średnia ogólna",
    menu_toggle: "Otwórz / zamknij pasek boczny",
    back_btn_tooltip: "Wróć do poprzedniego pulpitu / panelu",
    
    // Prep card
    prep_title: "🎒 Spakuj plecak na jutro",
    prep_badge_weekday: "⏰ Lekcje na jutro",
    prep_badge_weekend: "📅 Przygotowanie weekendowe",
    prep_exam_alert: "Uwaga! Sprawdziany zaplanowane na ten dzień:",
    prep_empty: "Brak lekcji w planie na dzień: {day}!",
    exam_badge: "⚠️ SPRAWDZIAN / TEST",
    
    // Calendar card
    calendar_title: "📅 Nadchodzące sprawdziany i terminy ({count})",
    calendar_select_label: "Kalendarz szkolny:",
    no_calendar_assigned: "-- Brak przypisanego kalendarza --",
    calendar_hint: "💡 Wybierz kalendarz szkolny w Ustawieniach (np. Google Calendar, Local HA Calendar, CalDAV), aby wyświetlić sprawdziany.",
    no_events: "🎉 Brak nadchodzących sprawdzianów w kalendarzu!",
    time_at: "o godz. {time}",
    all_day: "(Cały dzień)",
    countdown_past: "Minęło",
    countdown_today: "⚡ DZISIAJ",
    countdown_tomorrow: "⚠️ Jutro",
    countdown_days: "Za {days} dni",
    add_event_btn: "➕ Dodaj sprawdzian / termin",
    add_event_title: "📅 Dodaj sprawdzian / termin do kalendarza",
    edit_event_title: "✏️ Edytuj sprawdzian / termin",
    event_summary_label: "Tytuł / Nazwa sprawdzianu",
    event_summary_placeholder: "np. Sprawdzian z matematyki, Kartkówka z biologii",
    event_date_label: "Data",
    event_time_label: "Godzina",
    event_desc_label: "Opis / Sala (opcjonalnie)",
    event_desc_placeholder: "np. Sala 101, Rozdziały 3-4",
    submit_add_event: "💾 Zapisz w kalendarzu",
    submit_update_event: "💾 Zapisz zmiany",
    delete_event_btn: "🗑️ Usuń termin",
    delete_event_confirm: "Czy na pewno chcesz usunąć termin \"{summary}\" z kalendarza?",
    
    // Timetable card
    timetable_title: "📅 Tygodniowy plan lekcji",
    timetable_subtitle: "Kliknij na komórkę, aby ją edytować",
    legend_now: "⚡ TERAZ",
    legend_today: "Dzisiaj",
    time_hour_col: "Godzina / Lekcja",
    break_label: "Przerwa",
    today_badge: "DZISIAJ",
    now_badge: "⚡ TERAZ",
    
    // Add grade form
    add_grade_title: "➕ Wpisz nową ocenę",
    subject_label: "Przedmiot",
    grade_label: "Ocena",
    weight_label: "Waga",
    weight_times: "waga {weight}",
    grade_name_label: "Opis (np. 1. sprawdzian)",
    grade_name_placeholder: "np. Sprawdzian, Kartkówka, Odpowiedź",
    date_label: "Data",
    submit_add_grade: "➕ Dodaj ocenę",
    toggle_add_grade_btn: "➕ Wpisz nową ocenę",
    close_add_grade_btn: "✖ Ukryj formularz",
    
    // Manage subjects form
    manage_subjects_title: "📘 Zarządzaj przedmiotami",
    new_subject_label: "Dodaj nowy przedmiot",
    new_subject_placeholder: "np. Fizyka, Plastyka, Muzyka",
    submit_add_subject: "➕ Utwórz przedmiot",
    delete_subject_label: "Usuń istniejący przedmiot",
    delete_btn: "🗑️ Usuń",
    delete_subject_confirm: "Czy na pewno chcesz usunąć przedmiot \"{subject}\" wraz ze wszystkimi ocenami?",
    
    // Subjects overview
    overview_title: "📘 Zestawienie przedmiotów i ocen",
    avg_label: "Średnia",
    no_grades_yet: "Brak wpisanych ocen",
    table_grade: "Ocena",
    table_weight: "Waga",
    table_date: "Data",
    table_name: "Opis",
    table_action: "Akcja",
    delete_grade_confirm: "Czy na pewno chcesz usunąć tę ocenę?",
    
    // Settings
    settings_btn: "Ustawienia",
    settings_title: "⚙️ Ustawienia ({child})",
    settings_tab_general: "⚙️ Ogólne",
    settings_tab_subjects: "📘 Przedmioty",
    settings_tab_timetable: "📅 Plan lekcji",
    grade_level_label: "Klasa / Poziom nauczania",
    grade_level_placeholder: "np. 5A, 7B",
    homework_card: "Zadania domowe",
    homework_done_badge: "✓ Zrobione",
    homework_open_badge: "Do zrobienia",
    prep_card_status: "Przygotowanie",
    prep_done_badge: "✓ Spakowane",
    prep_open_badge: "Do zrobienia",
    country_label: "Kraj / System oceniania",
    country_hint: "Określa skalę ocen i sposób wyliczania średniej.",
    section_visibility_title: "Pokaż / ukryj sekcje panelu",
    section_prep: "Przygotowanie plecaka na kolejny dzień",
    section_calendar: "Nadchodzące sprawdziany i terminy",
    section_timetable: "Tygodniowy plan lekcji",
    section_overview: "Zestawienie przedmiotów i ocen",

    // Modals
    modal_cell_title: "✏️ Edytuj lekcję w planie",
    no_subject_free: "-- Brak lekcji (Okienko) --",
    custom_subject_opt: "➕ Wpisz inny przedmiot...",
    custom_subject_placeholder: "Wpisz nazwę przedmiotu",
    room_label: "Sala (opcjonalnie)",
    room_placeholder: "np. S102",
    teacher_label: "Nauczyciel (opcjonalnie)",
    teacher_placeholder: "np. mgr Kowalski",
    cancel_btn: "Anuluj",
    save_btn: "💾 Zapisz",
    
    yaml_textarea_label: "Konfiguracja YAML planu lekcji ({child})",
    copy_btn: "📋 Kopiuj",
    copied_btn: "✅ Skopiowano!",
    import_btn: "📥 Importuj YAML",

    days: {
      monday: "Poniedziałek",
      tuesday: "Wtorek",
      wednesday: "Środa",
      thursday: "Czwartek",
      friday: "Piątek",
      saturday: "Sobota",
      sunday: "Niedziela"
    }
  },
  ru: {
    panel_title: "🎓 Школьные оценки & Расписание",
    panel_subtitle: "Сводка оценок, календарь контрольных и расписание уроков ваших детей",
    no_children_title: "🎓 Управление оценками и расписанием",
    no_children_text1: "В Home Assistant ещё не настроено ни одного профиля ребёнка.",
    no_children_text2: "Перейдите в Настройки ➔ Устройства и службы ➔ Добавить интеграцию ➔ Schulnoten.",
    total_avg: "Общий средний балл",
    menu_toggle: "Открыть / закрыть боковую панель",
    back_btn_tooltip: "Вернуться на предыдущую панель",
    
    // Prep card
    prep_title: "🎒 Подготовка портфеля на завтра",
    prep_badge_weekday: "⏰ Уроки на завтра",
    prep_badge_weekend: "📅 Подготовка на выходных",
    prep_exam_alert: "Внимание! Контрольные работы в этот день:",
    prep_empty: "На {day} уроков в расписании не найдено!",
    exam_badge: "⚠️ КОНТРОЛЬНАЯ / ТЕСТ",
    
    // Calendar card
    calendar_title: "📅 Предстоящие контрольные и события ({count})",
    calendar_select_label: "Школьный календарь:",
    no_calendar_assigned: "-- Календарь не назначен --",
    calendar_hint: "💡 Выберите школьный календарь в настройках (напр., Google Календарь, Local HA Calendar, CalDAV), чтобы видеть контрольные.",
    no_events: "🎉 В календаре нет предстоящих контрольных или событий!",
    time_at: "в {time}",
    all_day: "(Весь день)",
    countdown_past: "Прошло",
    countdown_today: "⚡ СЕГОДНЯ",
    countdown_tomorrow: "⚠️ Завтра",
    countdown_days: "Через {days} дн.",
    add_event_btn: "➕ Добавить контрольную / событие",
    add_event_title: "📅 Создать контрольную / событие в календаре",
    edit_event_title: "✏️ Редактировать контрольную / событие",
    event_summary_label: "Название контрольной / события",
    event_summary_placeholder: "напр., Контрольная по математике, Тест по биологии",
    event_date_label: "Дата",
    event_time_label: "Время",
    event_desc_label: "Описание / Кабинет (необязательно)",
    event_desc_placeholder: "напр., Кабинет 101, Параграфы 3-4",
    submit_add_event: "💾 Сохранить в календаре",
    submit_update_event: "💾 Сохранить изменения",
    delete_event_btn: "🗑️ Удалить событие",
    delete_event_confirm: "Вы уверены, что хотите удалить событие \"{summary}\" из календаря?",
    
    // Timetable card
    timetable_title: "📅 Расписание уроков на неделю",
    timetable_subtitle: "Нажмите на ячейку для редактирования",
    legend_now: "⚡ СЕЙЧАС",
    legend_today: "Сегодня",
    time_hour_col: "Время / Урок",
    break_label: "Перемена",
    today_badge: "СЕГОДНЯ",
    now_badge: "⚡ СЕЙЧАС",
    
    // Add grade form
    add_grade_title: "➕ Добавить оценку",
    subject_label: "Предмет",
    grade_label: "Оценка",
    weight_label: "Вес оценки",
    weight_times: "вес {weight}x",
    grade_name_label: "Описание (напр., 1-я контрольная)",
    grade_name_placeholder: "напр., Контрольная, Самостоятельная, Ответ у доски",
    date_label: "Дата",
    submit_add_grade: "➕ Записать оценку",
    toggle_add_grade_btn: "➕ Добавить оценку",
    close_add_grade_btn: "✖ Скрыть форму",
    
    // Manage subjects form
    manage_subjects_title: "📘 Управление предметами",
    new_subject_label: "Добавить новый предмет",
    new_subject_placeholder: "напр., Физика, ИЗО, Музыка",
    submit_add_subject: "➕ Создать предмет",
    delete_subject_label: "Удалить предмет",
    delete_btn: "🗑️ Удалить",
    delete_subject_confirm: "Вы уверены, что хотите удалить предмет \"{subject}\" со всеми оценками?",
    
    // Subjects overview
    overview_title: "📘 Обзор предметов и оценок",
    avg_label: "Ср. балл",
    no_grades_yet: "Оценок пока нет",
    table_grade: "Оценка",
    table_weight: "Вес",
    table_date: "Дата",
    table_name: "Описание",
    table_action: "Действие",
    delete_grade_confirm: "Вы уверены, что хотите удалить эту оценку?",
    
    // Settings
    settings_btn: "Настройки",
    settings_title: "⚙️ Настройки ({child})",
    settings_tab_general: "⚙️ Общие",
    settings_tab_subjects: "📘 Предметы",
    settings_tab_timetable: "📅 Расписание",
    grade_level_label: "Класс",
    grade_level_placeholder: "напр., 5А, 7Б",
    homework_card: "Домашнее задание",
    homework_done_badge: "✓ Выполнено",
    homework_open_badge: "Не сделано",
    prep_card_status: "Портфель",
    prep_done_badge: "✓ Собрано",
    prep_open_badge: "Не собрано",
    country_label: "Страна / Система оценок",
    country_hint: "Определяет шкалу оценок и расчёт среднего балла.",
    section_visibility_title: "Отображение разделов панели",
    section_prep: "Подготовка портфеля на завтра",
    section_calendar: "Предстоящие контрольные и события",
    section_timetable: "Расписание уроков на неделю",
    section_overview: "Обзор предметов и оценок",

    // Modals
    modal_cell_title: "✏️ Редактировать ячейку расписания",
    no_subject_free: "-- Нет урока (Окно) --",
    custom_subject_opt: "➕ Ввести другой предмет...",
    custom_subject_placeholder: "Введите название предмета",
    room_label: "Кабинет (необязательно)",
    room_placeholder: "напр., Каб. 102",
    teacher_label: "Учитель (необязательно)",
    teacher_placeholder: "напр., Иванова М. И.",
    cancel_btn: "Отмена",
    save_btn: "💾 Сохранить",
    
    yaml_textarea_label: "Конфигурация YAML расписания ({child})",
    copy_btn: "📋 Копировать",
    copied_btn: "✅ Скопировано!",
    import_btn: "📥 Импортировать YAML",

    days: {
      monday: "Понедельник",
      tuesday: "Вторник",
      wednesday: "Среда",
      thursday: "Четверг",
      friday: "Пятница",
      saturday: "Суббота",
      sunday: "Воскресенье"
    }
  },
  zh: {
    panel_title: "🎓 学校成绩 & 课程表",
    panel_subtitle: "孩子的成绩概览、考试日历及每周课程表",
    no_children_title: "🎓 学校成绩与课程表管理",
    no_children_text1: "Home Assistant 中尚未配置任何孩子实例。",
    no_children_text2: "请前往 设置 ➔ 设备与集成 ➔ 添加集成 ➔ Schulnoten。",
    total_avg: "总平均分",
    menu_toggle: "打开 / 关闭侧边栏",
    back_btn_tooltip: "返回上一控制面板",
    
    // Prep card
    prep_title: "🎒 准备下一个上学日的书包",
    prep_badge_weekday: "⏰ 明日课程安排",
    prep_badge_weekend: "📅 周末准备",
    prep_exam_alert: "注意！当天有考试或测试安排：",
    prep_empty: "{day} 课程表中暂无课程安排！",
    exam_badge: "⚠️ 考试 / 测验",
    
    // Calendar card
    calendar_title: "📅 即将到来的考试与日程 ({count})",
    calendar_select_label: "学校日历：",
    no_calendar_assigned: "-- 未关联日历 --",
    calendar_hint: "💡 请在设置中选择一个学校日历（例如 Google 日历、本地 HA 日历、CalDAV）以显示考试日程。",
    no_events: "🎉 日历中暂无即将到来的考试或日程！",
    time_at: "{time}",
    all_day: "(全天)",
    countdown_past: "已过期",
    countdown_today: "⚡ 今天",
    countdown_tomorrow: "⚠️ 明天",
    countdown_days: "{days} 天后",
    add_event_btn: "➕ 添加考试 / 日程",
    add_event_title: "📅 在日历中创建新考试 / 日程",
    edit_event_title: "✏️ 编辑考试 / 日程",
    event_summary_label: "考试 / 日程名称",
    event_summary_placeholder: "例如：期中数学考试、生物随堂测验",
    event_date_label: "日期",
    event_time_label: "时间",
    event_desc_label: "描述 / 教室（可选）",
    event_desc_placeholder: "例如：101 教室，复习第 3 章",
    submit_add_event: "💾 保存到日历",
    submit_update_event: "💾 保存修改",
    delete_event_btn: "🗑️ 删除日程",
    delete_event_confirm: "确定要从日历中删除日程 \"{summary}\" 吗？",
    
    // Timetable card
    timetable_title: "📅 每周课程表",
    timetable_subtitle: "点击单元格即可进行编辑",
    legend_now: "⚡ 正在上课",
    legend_today: "今天",
    time_hour_col: "时间 / 节次",
    break_label: "课间休息",
    today_badge: "今天",
    now_badge: "⚡ 正在上课",
    
    // Add grade form
    add_grade_title: "➕ 录入新成绩",
    subject_label: "学科",
    grade_label: "成绩",
    weight_label: "权重",
    weight_times: "{weight} 倍权重",
    grade_name_label: "说明（例如：第一次月考）",
    grade_name_placeholder: "例如：期中考试、小测验、随堂提问",
    date_label: "日期",
    submit_add_grade: "➕ 录入成绩",
    toggle_add_grade_btn: "➕ 录入新成绩",
    close_add_grade_btn: "✖ 隐藏表单",
    
    // Manage subjects form
    manage_subjects_title: "📘 学科管理",
    new_subject_label: "添加新学科",
    new_subject_placeholder: "例如：物理、美术、音乐",
    submit_add_subject: "➕ 创建学科",
    delete_subject_label: "删除现有学科",
    delete_btn: "🗑️ 删除",
    delete_subject_confirm: "确定要删除学科 \"{subject}\" 及其所有成绩记录吗？",
    
    // Subjects overview
    overview_title: "📘 学科与成绩概览",
    avg_label: "均分",
    no_grades_yet: "暂未录入成绩",
    table_grade: "成绩",
    table_weight: "权重",
    table_date: "日期",
    table_name: "说明",
    table_action: "操作",
    delete_grade_confirm: "确定要删除此条成绩记录吗？",
    
    // Settings
    settings_btn: "设置",
    settings_title: "⚙️ 设置 ({child})",
    settings_tab_general: "⚙️ 常规",
    settings_tab_subjects: "📘 学科管理",
    settings_tab_timetable: "📅 课程表",
    grade_level_label: "班级 / 年级",
    grade_level_placeholder: "例如：初二 3 班、五年级 1 班",
    homework_card: "家庭作业",
    homework_done_badge: "✓ 已完成",
    homework_open_badge: "未完成",
    prep_card_status: "书包准备",
    prep_done_badge: "✓ 已准备",
    prep_open_badge: "未准备",
    country_label: "国家 / 评分体系",
    country_hint: "决定该实例的分数范围与成绩评定标准。",
    section_visibility_title: "显示 / 隐藏面板区域",
    section_prep: "准备下一个上学日的书包",
    section_calendar: "即将到来的考试与日程",
    section_timetable: "每周课程表",
    section_overview: "学科与成绩概览",

    // Modals
    modal_cell_title: "✏️ 编辑课程表单元格",
    no_subject_free: "-- 无课程（自习 / 没课） --",
    custom_subject_opt: "➕ 输入其他自定义学科...",
    custom_subject_placeholder: "输入自定义学科名称",
    room_label: "教室（可选）",
    room_placeholder: "例如：R102",
    teacher_label: "教师（可选）",
    teacher_placeholder: "例如：王老师",
    cancel_btn: "取消",
    save_btn: "💾 保存",
    
    yaml_textarea_label: "课程表 YAML 配置 ({child})",
    copy_btn: "📋 复制",
    copied_btn: "✅ 已复制！",
    import_btn: "📥 导入 YAML",

    days: {
      monday: "星期一",
      tuesday: "星期二",
      wednesday: "星期三",
      thursday: "星期四",
      friday: "星期五",
      saturday: "星期六",
      sunday: "星期日"
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
    this._showSettingsModal = false;
    this._settingsTab = 'general';
    this._showAddGradeCard = false;
    this._showAddEventCard = false;
    this._showAddEventModal = false;
    this._editingEvent = null;
    this._localPreparedSubjects = {}; // { [childName]: { [subject]: boolean } }
    this._localPreparationDone = {}; // { [childName]: boolean }
    this._localHomeworkDone = {}; // { [childName]: boolean }
    this._lastPreparedDate = {}; // { [childName]: string }
    this._localTimetableSchedule = {}; // { [childName]: { [slotId]: { [day]: { subject, room, teacher } } } }
    this._portalTesting = false;
    this._portalTestResult = null;
    this._portalTestError = null;
    this._portalFormSchool = undefined;
    this._portalFormUsername = undefined;
    this._portalSelectedStudentId = null;
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!oldHass || this._hasGradesDataChanged(oldHass, hass)) {
      this._fetchUpcomingCalendarEvents();
      this.render();
    }
  }

  _getLang() {
    const raw = (this._hass && (this._hass.language || (this._hass.locale && this._hass.locale.language))) || 'de';
    const l = String(raw).toLowerCase().replace('_', '-');
    for (const prefix of ['de', 'en', 'fr', 'it', 'es', 'nl', 'pl', 'ru', 'zh']) {
      if (l.startsWith(prefix)) return prefix;
    }
    return 'de';
  }

  _t(key, params = {}) {
    const langKey = this._getLang();
    const dict = I18N[langKey] || I18N.de;

    let text = dict[key] || I18N.de[key] || (I18N.en && I18N.en[key]) || key;
    if (typeof text === 'string') {
      for (const [pKey, pVal] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
      }
    }
    return text;
  }

  _getLocale() {
    const langKey = this._getLang();
    const localeMap = {
      de: 'de-DE',
      en: 'en-US',
      fr: 'fr-FR',
      it: 'it-IT',
      es: 'es-ES',
      nl: 'nl-NL',
      pl: 'pl-PL',
      ru: 'ru-RU',
      zh: 'zh-CN',
    };
    return localeMap[langKey] || 'de-DE';
  }

  _escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
          },
          portalEnabled: false,
          portalSchool: '',
          portalUsername: '',
          portalHasPassword: false,
          portalStudentId: '',
          portalStudentName: '',
          portalSyncTimetable: true,
          portalSyncSubstitutions: true,
          portalSyncExams: true,
          portalIgnoreInfoEvents: false,
          portalLastSync: '',
          portalLastStatus: '',
          subjectAliases: {},
          portalSubstitutions: { days: [], available: false },
          portalAppointments: [],
        };
      }

      if (attrs.portal_enabled !== undefined) {
        children[kindName].portalEnabled = Boolean(attrs.portal_enabled);
      }
      if (attrs.portal_school !== undefined) {
        children[kindName].portalSchool = String(attrs.portal_school || '');
      }
      if (attrs.portal_username !== undefined) {
        children[kindName].portalUsername = String(attrs.portal_username || '');
      }
      if (attrs.portal_has_password !== undefined) {
        children[kindName].portalHasPassword = Boolean(attrs.portal_has_password);
      }
      if (attrs.portal_student_id !== undefined) {
        children[kindName].portalStudentId = String(attrs.portal_student_id || '');
      }
      if (attrs.portal_student_name !== undefined) {
        children[kindName].portalStudentName = String(attrs.portal_student_name || '');
      }
      if (attrs.portal_sync_timetable !== undefined) {
        children[kindName].portalSyncTimetable = Boolean(attrs.portal_sync_timetable);
      }
      if (attrs.portal_sync_substitutions !== undefined) {
        children[kindName].portalSyncSubstitutions = Boolean(attrs.portal_sync_substitutions);
      }
      if (attrs.portal_sync_exams !== undefined) {
        children[kindName].portalSyncExams = Boolean(attrs.portal_sync_exams);
      }
      if (attrs.portal_ignore_info_events !== undefined) {
        children[kindName].portalIgnoreInfoEvents = Boolean(attrs.portal_ignore_info_events);
      }
      if (attrs.portal_last_sync !== undefined) {
        children[kindName].portalLastSync = String(attrs.portal_last_sync || '');
      }
      if (attrs.portal_last_status !== undefined) {
        children[kindName].portalLastStatus = String(attrs.portal_last_status || '');
      }
      if (attrs.subject_aliases !== undefined) {
        children[kindName].subjectAliases = attrs.subject_aliases || {};
      }
      if (attrs.portal_substitutions !== undefined) {
        children[kindName].portalSubstitutions = attrs.portal_substitutions || { days: [], available: false };
      }
      if (attrs.portal_appointments !== undefined) {
        children[kindName].portalAppointments = Array.isArray(attrs.portal_appointments) ? attrs.portal_appointments : [];
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
      let rawEvents = [];

      if (calEntity && this._hass && this._hass.states[calEntity]) {
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
      }

      // Normalize and format events
      let parsedEvents = rawEvents.map(evt => {
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
          isPortal: false,
          isExam: false,
          subject: '',
          portalId: '',
        };
      }).filter(evt => evt.start);

      // Merge Eltern-Portal appointments if available
      let portalAppts = (childData && childData.portalAppointments) || [];
      if (childData && childData.portalIgnoreInfoEvents) {
        portalAppts = portalAppts.filter(apt => {
          const c = String(apt.class || apt.className || apt.class_name || apt.classname || '').toLowerCase();
          return !c.includes('info') && c !== 'event-info';
        });
        parsedEvents = parsedEvents.filter(evt => {
          const desc = String(evt.description || '').toLowerCase();
          return !desc.includes('event-info') && !desc.includes('kategorie: event-info');
        });
      }
      for (const apt of portalAppts) {
        if (!apt || (!apt.start && !apt.date)) continue;
        const aptDateStr = (apt.date || (typeof apt.start === 'string' ? apt.start : '') || '').split('T')[0];
        const aptTitle = String(apt.title || apt.title_short || 'Termin').trim();

        // Check if matching event already exists in parsedEvents from HA calendar
        const existing = parsedEvents.find(e => {
          const eDateStr = (typeof e.start === 'string' ? e.start : '').split('T')[0];
          return eDateStr === aptDateStr && (
            e.summary.toLowerCase() === aptTitle.toLowerCase() ||
            e.summary.toLowerCase().includes(aptTitle.toLowerCase()) ||
            aptTitle.toLowerCase().includes(e.summary.toLowerCase())
          );
        });

        if (existing) {
          existing.isPortal = true;
          if (apt.is_exam) existing.isExam = true;
          if (apt.subject && !existing.subject) existing.subject = apt.subject;
          if (apt.id && !existing.portalId) existing.portalId = apt.id;
        } else {
          parsedEvents.push({
            uid: 'portal_' + (apt.id || Math.random().toString(36).substring(7)),
            summary: aptTitle,
            start: apt.start || apt.date,
            end: apt.end || apt.date,
            description: apt.class || '',
            location: '',
            isPortal: true,
            isExam: Boolean(apt.is_exam),
            subject: apt.subject || '',
            portalId: apt.id || '',
          });
        }
      }

      // Detect exam keywords on any events that aren't marked yet
      const examKwRegex = /\b(schulaufgabe|kurzarbeit|klausur|klassenarbeit|stegreifaufgabe|stehgreifaufgabe|extemporale|ex|test|abfrage|leistungskontrolle|probearbeit|kolloquium|prüfung|pruefung|sa|ka)\b/i;
      for (const evt of parsedEvents) {
        if (!evt.isExam && (examKwRegex.test(evt.summary) || (evt.description && examKwRegex.test(evt.description)))) {
          evt.isExam = true;
        }
      }

      // Filter out events in the past and sort chronologically
      const todayStartMs = now.getTime();
      const upcomingFiltered = parsedEvents.filter(evt => {
        const val = evt.end || evt.start;
        if (!val) return false;
        if (typeof val === 'string' && val.length === 10) {
          const d = new Date(val + 'T23:59:59');
          return d.getTime() >= todayStartMs;
        }
        const d = new Date(val);
        return d.getTime() >= todayStartMs;
      });

      // Deduplicate identical events (e.g. if previous syncs created duplicate calendar entries)
      const seenEventKeys = new Set();
      const deduplicatedEvents = upcomingFiltered.filter(evt => {
        const dKey = (evt.start ? String(evt.start).split('T')[0] : '');
        const key = `${(evt.summary || '').trim().toLowerCase()}_${dKey}`;
        if (seenEventKeys.has(key)) {
          return false;
        }
        seenEventKeys.add(key);
        return true;
      });

      deduplicatedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      this._calendarEvents[childName] = deduplicatedEvents;
    }

    this.render();
  }

  _getNextSchoolDayInfo(timetable, calendarEvents) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const slots = (timetable && timetable.slots) || [];
    const schedule = (timetable && timetable.schedule) || {};

    const dayMap = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };
    const todayKey = dayMap[currentDay] || '';

    let isToday = false;
    let isDuringSchool = false;
    let daysToAdd = 1;
    let targetDayKey = '';

    // Check school timing for today if it is a school weekday (Monday to Friday)
    if (todayKey) {
      let todayFirstStart = null;
      let todayLastEnd = null;

      for (const slot of slots) {
        if (slot.type === 'break') continue;
        const cell = schedule[slot.id] && schedule[slot.id][todayKey];
        if (cell && cell.subject) {
          if (slot.start) {
            const [sh, sm] = slot.start.split(':').map(Number);
            const sMins = sh * 60 + sm;
            if (todayFirstStart === null || sMins < todayFirstStart) {
              todayFirstStart = sMins;
            }
          }
          if (slot.end) {
            const [eh, em] = slot.end.split(':').map(Number);
            const eMins = eh * 60 + em;
            if (todayLastEnd === null || eMins > todayLastEnd) {
              todayLastEnd = eMins;
            }
          }
        }
      }

      // Default fallback if no scheduled lessons for today: 08:00 (480) and 13:00 (780)
      if (todayFirstStart === null) todayFirstStart = 8 * 60;
      if (todayLastEnd === null) todayLastEnd = 13 * 60;

      if (currentMins < todayFirstStart) {
        // Morning before school starts (00:00 until 1st lesson):
        // Show preparation for TODAY
        isToday = true;
        isDuringSchool = false;
        daysToAdd = 0;
        targetDayKey = todayKey;
      } else if (currentMins >= todayFirstStart && currentMins < todayLastEnd) {
        // School is currently active:
        // Completely hide preparation card
        isDuringSchool = true;
      }
    }

    if (!isToday) {
      // After school ends or on weekends: prepare for next school day
      if (currentDay === 5) { // Friday -> Monday (+3 days)
        daysToAdd = 3;
        targetDayKey = 'monday';
      } else if (currentDay === 6) { // Saturday -> Monday (+2 days)
        daysToAdd = 2;
        targetDayKey = 'monday';
      } else if (currentDay === 0) { // Sunday -> Monday (+1 day)
        daysToAdd = 1;
        targetDayKey = 'monday';
      } else { // Monday-Thursday -> next day (+1 day)
        const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        targetDayKey = dayKeys[currentDay + 1];
        daysToAdd = 1;
      }
    }

    const dayNames = this._t('days');
    const targetDayName = dayNames[targetDayKey] || (isToday ? 'Heute' : 'Morgen');

    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd);
    const dateFormatted = targetDate.toLocaleDateString(this._getLocale(), { weekday: 'long', day: '2-digit', month: '2-digit' });

    // Group lesson slots by subject so double periods form a single card
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

    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    const targetDateIso = `${y}-${m}-${d}`;

    const matchingExams = (calendarEvents || []).filter(evt => {
      if (!evt.start) return false;
      const evtDateIso = new Date(evt.start).toISOString().split('T')[0];
      return evtDateIso === targetDateIso;
    });

    return {
      dayKey: targetDayKey,
      dayName: targetDayName,
      dateFormatted: dateFormatted,
      targetDateIso: targetDateIso,
      lessons: lessons,
      exams: matchingExams,
      isWeekend: !isToday && (currentDay === 5 || currentDay === 6 || currentDay === 0),
      isToday: isToday,
      isDuringSchool: isDuringSchool,
    };
  }

  _getDateForDayKey(dayKey) {
    const dayMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    const targetDayIndex = dayMap[dayKey];
    if (!targetDayIndex) return null;
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const target = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + (targetDayIndex - 1));
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  _resolveSubjectName(rawSubj, child) {
    if (!rawSubj) return '';
    const clean = String(rawSubj).trim();
    if (!clean) return '';

    const enrolled = (child && child.subjects && Object.keys(child.subjects)) || [];
    const directMatch = enrolled.find(s => s.toLowerCase() === clean.toLowerCase());
    if (directMatch) return directMatch;

    const candidates = [clean];
    const noDigits = clean.replace(/\d+$/, '').trim();
    if (noDigits && noDigits !== clean) candidates.push(noDigits);
    const tokens = clean.split(/[\s\-_–➔>(),]+/).map(t => t.trim()).filter(Boolean);
    if (tokens.length > 0) {
      const uniqTokens = Array.from(new Set(tokens));
      for (const t of uniqTokens) {
        if (!candidates.includes(t)) candidates.push(t);
        const tNoDig = t.replace(/\d+$/, '').trim();
        if (tNoDig && !candidates.includes(tNoDig)) candidates.push(tNoDig);
      }
    }

    const childAliases = (child && child.subjectAliases) || {};
    // 1. Check child-specific aliases first against enrolled subjects
    for (const cand of candidates) {
      const candL = cand.toLowerCase();
      for (const subj of enrolled) {
        const aList = childAliases[subj] || [];
        if (aList.some(a => String(a).trim().toLowerCase() === candL)) {
          return subj;
        }
      }
    }

    // 2. Check DEFAULT_ALIASES_MAP against enrolled subjects
    for (const cand of candidates) {
      const candL = cand.toLowerCase();
      for (const subj of enrolled) {
        const defAliasList = DEFAULT_ALIASES_MAP[subj] || [];
        if (defAliasList.some(a => a.toLowerCase() === candL)) {
          return subj;
        }
      }
    }

    // 3. Check DEFAULT_ALIASES_MAP across all known default subjects
    for (const cand of candidates) {
      const candL = cand.toLowerCase();
      for (const [defSubj, defAliasList] of Object.entries(DEFAULT_ALIASES_MAP)) {
        if (defSubj.toLowerCase() === candL || defAliasList.some(a => a.toLowerCase() === candL)) {
          if (defSubj.includes('Religion') && enrolled.some(e => e.toLowerCase() === 'religion')) {
            const relEnrolled = enrolled.find(e => e.toLowerCase() === 'religion');
            if (relEnrolled) return relEnrolled;
          }
          return defSubj;
        }
      }
    }

    return clean;
  }

  _isSubstRelevantForChild(s, child, dayKey) {
    if (!s) return false;
    if (s.applies_to_child === false) return false;
    if (s.applies_to_child === true) return true;

    if (!child) return true;
    const enrolled = Object.keys(child.subjects || {});
    if (enrolled.length === 0) return true;

    const enrolledLower = enrolled.map(x => x.toLowerCase());
    const cands = [
      s.subject_resolved,
      s.subject,
      s.old_subject_resolved,
      s.old_subject,
    ].filter(Boolean);

    if (cands.length === 0) {
      return true; // General announcement / cancellation without subject
    }

    const allCands = [];
    for (const c of cands) {
      allCands.push(c);
      const noDig = c.replace(/\d+$/, '').trim();
      if (noDig && !allCands.includes(noDig)) allCands.push(noDig);
      const toks = c.split(/[\s\-_–➔>(),]+/).map(t => t.trim()).filter(Boolean);
      for (const t of toks) {
        if (!allCands.includes(t)) allCands.push(t);
        const tNoDig = t.replace(/\d+$/, '').trim();
        if (tNoDig && !allCands.includes(tNoDig)) allCands.push(tNoDig);
      }
    }

    const childAliases = (child && child.subjectAliases) || {};

    for (const cand of allCands) {
      const cL = cand.toLowerCase();

      // Check religion branches specifically to prevent Protestant/Catholic/Ethics overlap
      const isEv = cL.includes('evangelisch') || ['ev', 'evrel', 'er', 'evan'].includes(cL);
      const isKat = cL.includes('katholisch') || ['k', 'rk', 'kk', 'katrel', 'kr'].includes(cL);
      const isEth = cL.includes('ethik') || ['eth'].includes(cL);

      if (isEv) {
        if (enrolledLower.some(cs => cs.includes('evangelisch') || cs === 'ev')) return true;
        continue;
      }
      if (isKat) {
        if (enrolledLower.some(cs => cs.includes('katholisch') || cs === 'religion' || cs === 'k')) return true;
        continue;
      }
      if (isEth) {
        if (enrolledLower.some(cs => cs.includes('ethik') || cs === 'eth')) return true;
        continue;
      }

      // Direct match
      if (enrolledLower.includes(cL)) return true;

      // Check child subject aliases
      for (const subj of enrolled) {
        const sAliases = (childAliases[subj] || []).concat(DEFAULT_ALIASES_MAP[subj] || []);
        if (sAliases.some(a => String(a).trim().toLowerCase() === cL)) {
          return true;
        }
      }
    }

    // Check if slot has a scheduled lesson on timetable for that day matching candidate
    if (dayKey && child.timetable && child.timetable.schedule) {
      const lessonNum = String(s.lesson || '').trim();
      const schedule = child.timetable.schedule;
      for (const [sid, daysMap] of Object.entries(schedule)) {
        if (sid === `slot_${lessonNum}` || sid.includes(lessonNum)) {
          const scheduledCell = daysMap[dayKey];
          if (scheduledCell && scheduledCell.subject) {
            const schedSubj = scheduledCell.subject.toLowerCase();
            if (allCands.some(c => c.toLowerCase() === schedSubj)) return true;
          }
        }
      }
    }

    return false;
  }

  _isSubstMatchingSubject(s, lessonSubject, child) {
    if (!s) return false;
    if (s.applies_to_child === false) return false;

    const subjStr = String(lessonSubject || '').trim().toLowerCase();
    if (!subjStr) return false;

    const eSubj = String(s.subject || '').trim();
    const eSubjRes = String(s.subject_resolved || '').trim();
    const eOldSubj = String(s.old_subject || '').trim();
    const eOldSubjRes = String(s.old_subject_resolved || '').trim();

    // If substitution entry has no subject at all, it's a general announcement/cancellation for this lesson slot
    if (!eSubj && !eSubjRes && !eOldSubj && !eOldSubjRes) {
      return true;
    }

    const cands = [eSubjRes, eSubj, eOldSubjRes, eOldSubj].filter(Boolean);
    const allCands = [];
    for (const c of cands) {
      allCands.push(c);
      const noDig = c.replace(/\d+$/, '').trim();
      if (noDig && !allCands.includes(noDig)) allCands.push(noDig);
      const toks = c.split(/[\s\-_–➔>(),]+/).map(t => t.trim()).filter(Boolean);
      for (const t of toks) {
        if (!allCands.includes(t)) allCands.push(t);
        const tNoDig = t.replace(/\d+$/, '').trim();
        if (tNoDig && !allCands.includes(tNoDig)) allCands.push(tNoDig);
      }
    }

    const subjBase = subjStr.replace(/\d+$/, '').trim();

    // Check Religion / branch compatibility
    const isLessonKatOrRel = subjStr.includes('religion') || subjStr.includes('katholisch') || subjStr === 'k';
    const isLessonEv = subjStr.includes('evangelisch') || subjStr === 'ev';
    const isLessonEth = subjStr.includes('ethik') || subjStr === 'eth';

    for (const cand of allCands) {
      const cL = cand.toLowerCase();
      const cBase = cL.replace(/\d+$/, '').trim();

      // Check religion conflicts
      if (isLessonKatOrRel) {
        if (cL.includes('evangelisch') || ['ev', 'evrel', 'er'].includes(cL)) return false;
        if (cL.includes('ethik') || cL === 'eth') return false;
        if (cL.includes('katholisch') || ['k', 'rk', 'kk', 'katrel', 'kr', 'rel', 'religion'].includes(cL)) return true;
      } else if (isLessonEv) {
        if (cL.includes('katholisch') || ['k', 'rk', 'kk'].includes(cL)) return false;
        if (cL.includes('ethik') || cL === 'eth') return false;
        if (cL.includes('evangelisch') || ['ev', 'evrel', 'er', 'rel', 'religion'].includes(cL)) return true;
      } else if (isLessonEth) {
        if (cL.includes('katholisch') || cL.includes('evangelisch')) return false;
        if (cL.includes('ethik') || cL === 'eth') return true;
      }

      // Direct match
      if (cL === subjStr || (cBase && subjBase && cBase === subjBase)) {
        return true;
      }

      // Child aliases & default aliases for this lesson subject
      const childAliases = (child && child.subjectAliases) || {};
      const actualSubjectKey = Object.keys(childAliases).find(k => k.toLowerCase() === subjStr) ||
                               Object.keys(DEFAULT_ALIASES_MAP).find(k => k.toLowerCase() === subjStr);
      const aliasesList = (actualSubjectKey ? (childAliases[actualSubjectKey] || []) : [])
        .concat(actualSubjectKey ? (DEFAULT_ALIASES_MAP[actualSubjectKey] || []) : []);

      if (aliasesList.some(a => String(a).trim().toLowerCase() === cL || String(a).trim().toLowerCase() === cBase)) {
        return true;
      }

      // Slash-separated electives (e.g. Mu/Cho or Eth/K/Ev on timetable cell)
      if (subjStr.includes('/')) {
        const parts = subjStr.split('/').map(p => p.trim().toLowerCase()).filter(Boolean);
        for (const p of parts) {
          const pBase = p.replace(/\d+$/, '').trim();
          if (p === cL || (pBase && cBase && pBase === cBase)) return true;
          for (const [k, alist] of Object.entries(DEFAULT_ALIASES_MAP)) {
            if (alist.includes(p) && (alist.includes(cL) || k.toLowerCase() === cL)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  _getSubstitution(substitutions, dateIso, slotId, slotNum, subject, child) {
    if (!substitutions || !Array.isArray(substitutions.days) || !dateIso) return null;
    const dayObj = substitutions.days.find(d => d.date === dateIso);
    if (!dayObj || !Array.isArray(dayObj.entries)) return null;

    // A substitution only matches if the timetable cell actually has a scheduled subject
    const subjStr = String(subject || '').trim();
    if (!subjStr) return null;

    const numStr = String(slotNum || slotId || '').replace(/^slot_/, '').trim();
    for (const e of dayObj.entries) {
      if (e.applies_to_child === false) continue;

      const eLesson = String(e.lesson || '').trim();
      const digits = eLesson.match(/\d+/g) || [];
      const lessonMatches = (eLesson === numStr) || digits.includes(numStr);
      if (!lessonMatches) continue;

      if (this._isSubstMatchingSubject(e, subject, child)) {
        return e;
      }
    }
    return null;
  }

  _aliasesToYaml(aliases) {
    if (!aliases || typeof aliases !== 'object') return '';
    const lines = [];
    for (const [subj, aliasList] of Object.entries(aliases)) {
      if (Array.isArray(aliasList) && aliasList.length > 0) {
        lines.push(`${subj}:`);
        for (const a of aliasList) {
          lines.push(`  - ${a}`);
        }
      } else {
        lines.push(`${subj}: []`);
      }
    }
    return lines.join('\n');
  }

  _getDefaultAliasesYaml() {
    return `Mathematik:
  - M
  - Ma
  - Math
  - Mathe
Deutsch:
  - D
  - De
  - Deu
Englisch:
  - E
  - En
  - Eng
Latein:
  - L
  - Lat
Französisch:
  - F
  - Fr
  - Frz
Spanisch:
  - Sp
  - Spa
Italienisch:
  - It
  - Ita
Biologie:
  - B
  - Bio
Physik:
  - Ph
  - Phy
Chemie:
  - C
  - Ch
  - Che
Geschichte:
  - G
  - Ge
  - Gesch
Geographie:
  - Geo
  - Erd
  - Erdkunde
Sozialkunde:
  - Sk
  - Soz
Wirtschaft und Recht:
  - WR
  - WiRe
  - Wirtschaft
Informatik:
  - Inf
  - IT
Kunst:
  - Ku
  - BK
Musik:
  - Mu
Sport:
  - Sp
  - Spo
  - Sm
  - Sw
  - Smd
  - Swd
  - Out
Chor:
  - Cho
Religion:
  - Rel
Ethik:
  - Eth
Evangelische Religion:
  - Ev
  - EvRel
  - ER
  - Evan
  - Evangelisch
Katholische Religion:
  - Kk
  - Rk
  - KatRel
  - KR
  - K
  - Kath
  - Katholisch
Natur und Technik:
  - NuT
  - NTG
  - NuTB
  - NuTP
  - NuT_B
  - NuT_NW`;
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

  async _triggerPortalSync(childName) {
    if (!childName) childName = this._selectedChild;
    if (!childName) return;

    const now = Date.now();
    if (!this._portalSyncTimestamps) this._portalSyncTimestamps = {};
    const lastSync = this._portalSyncTimestamps[childName] || 0;
    const elapsed = Math.floor((now - lastSync) / 1000);

    if (elapsed < 60) {
      const wait = 60 - elapsed;
      alert(`⏳ Synchronisierungs-Limit: Bitte warte noch ${wait} Sekunden.\n(Schutz der Eltern-Portal Schnittstelle: maximal 1x pro Minute)`);
      return;
    }

    this._portalSyncTimestamps[childName] = now;
    this._portalHeaderSyncing = true;
    this.render();

    try {
      const res = await this._hass.callWS({
        type: 'school_grades/sync_elternportal',
        child_name: childName,
      });
      this._portalHeaderSyncing = false;
      if (res && res.success) {
        await this._fetchUpcomingCalendarEvents();
        this._portalHeaderSyncSuccess = true;
        this.render();
        setTimeout(() => {
          this._portalHeaderSyncSuccess = false;
          this.render();
        }, 3500);
      } else {
        const msg = (res && res.message) || 'Fehler beim Synchronisieren';
        alert(`❌ Synchronisierung fehlgeschlagen:\n${msg}`);
        this.render();
      }
    } catch (err) {
      this._portalHeaderSyncing = false;
      const msg = (err && (err.message || err.error)) || String(err);
      alert(`❌ Fehler beim Synchronisieren:\n${msg}`);
      this.render();
    }
  }

  render() {
    const data = this._getSchoolGradesData();
    const children = data;
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
    };
    const subjects = currentChild ? currentChild.subjects : {};
    const subjectList = Object.keys(subjects).sort();
    const upcomingEvents = this._calendarEvents[this._selectedChild] || [];
    const timetable = (currentChild && currentChild.timetable) ? currentChild.timetable : DEFAULT_TIMETABLE;
    const rawSlots = timetable.slots || DEFAULT_TIMETABLE.slots;
    const parseSlotTime = (t) => {
      if (!t || typeof t !== 'string' || !t.includes(':')) return 9999;
      const parts = t.split(':');
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      return (isNaN(h) || isNaN(m)) ? 9999 : h * 60 + m;
    };
    const slots = [...rawSlots].sort((a, b) => {
      const tA = parseSlotTime(a.start);
      const tB = parseSlotTime(b.start);
      if (tA !== tB) return tA - tB;
      const nA = parseInt(String(a.number || a.label || a.id || '').replace(/\D+/g, ''), 10) || 99;
      const nB = parseInt(String(b.number || b.label || b.id || '').replace(/\D+/g, ''), 10) || 99;
      return nA - nB;
    });
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
          <div class="child-tabs">
            ${childNames.map(name => {
              const cData = data[name];
              const gradeLevelStr = cData && cData.gradeLevel ? ` (${cData.gradeLevel})` : '';
              const isSyncing = this._portalHeaderSyncing && name === this._selectedChild;
              const portalBadge = cData && cData.portalEnabled ? `
                <span class="child-portal-sync-badge ${isSyncing ? 'syncing' : ''}" data-child="${name}" title="Eltern-Portal für ${name} synchronisieren (Klicken zum Abrufen, max. 1x/Min)" style="cursor: pointer; margin-left: 6px; padding: 2px 6px; border-radius: 6px; background: rgba(59,130,246,0.25); border: 1px solid rgba(59,130,246,0.45); font-size: 11px; display: inline-flex; align-items: center; gap: 3px;">
                  🏫${isSyncing ? '<span class="spin-icon">⏳</span>' : ''}
                </span>` : '';
              return `
                <button class="tab-btn ${name === this._selectedChild ? 'active' : ''}" data-child="${name}">
                  👤 ${name}${gradeLevelStr}${portalBadge}
                </button>
              `;
            }).join('')}
            <button class="settings-badge-btn" id="open-settings-btn" aria-label="${this._t('settings_btn')}" title="${this._t('settings_btn')}">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </header>

        <!-- Summary Banner (Avg, Homework, Preparation, Portal) -->
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
        </div>

        <!-- Preparation Card for Next School Day (Interactive Clickable Subjects) -->
        ${secVis.show_prep_card ? (() => {
          const nextDay = this._getNextSchoolDayInfo(timetable, upcomingEvents);
          if (nextDay.isDuringSchool) return '';
          return `
            <div class="card prep-card" style="margin-bottom: 24px;">
              <div class="prep-header">
                <div class="prep-title-group">
                  <h3>${nextDay.isToday ? this._t('prep_title_today') : this._t('prep_title')}</h3>
                  <span class="prep-subtitle">${nextDay.dateFormatted}</span>
                </div>
                <span class="prep-badge ${nextDay.isToday ? 'today' : (nextDay.isWeekend ? 'weekend' : 'weekday')}">
                  ${nextDay.isToday ? this._t('prep_badge_today') : (nextDay.isWeekend ? this._t('prep_badge_weekend') : this._t('prep_badge_weekday'))}
                </span>
              </div>

              ${nextDay.exams.length > 0 ? `
                <div class="prep-exam-alert">
                  <span class="exam-alert-icon">⚠️</span>
                  <div class="exam-alert-content">
                    <strong>${this._t('prep_exam_alert')}</strong>
                    <div class="exam-alert-list">
                      ${nextDay.exams.map(e => `• <b>${e.summary}</b>${e.subject ? ' <span style="color:#6ee7b7; font-size:11px; font-weight:600;">[' + e.subject + ']</span>' : ''} ${e.location ? ' (📍 ' + e.location + ')' : ''}`).join(' ')}
                    </div>
                  </div>
                </div>
              ` : ''}

              ${(() => {
                const substDays = (currentChild && currentChild.portalSubstitutions && currentChild.portalSubstitutions.days) || [];
                const nextDaySubst = substDays.find(d => d.date === nextDay.targetDateIso);
                const rawEntries = (nextDaySubst && nextDaySubst.entries) || [];
                const entries = rawEntries.filter(s => this._isSubstRelevantForChild(s, currentChild, nextDay.dayKey));
                if (entries.length === 0) return '';
                return `
                  <div class="prep-subst-alert" style="background: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.35); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="font-size: 18px;">🔄</span>
                    <div>
                      <strong style="color: #fdba74; font-size: 13px;">${nextDay.isToday ? this._t('prep_subst_alert_today') : this._t('prep_subst_alert')} (${nextDay.dateFormatted}):</strong>
                      <div style="font-size: 12px; color: #fff; margin-top: 4px; display: flex; flex-direction: column; gap: 3px;">
                        ${entries.map(s => {
                          const kindText = s.kind === 'entfall' ? this._t('subst_badge_cancelled') : (s.kind === 'raum' ? this._t('subst_badge_room') : this._t('subst_badge_subst'));
                          const infoDetail = s.info ? ` (${s.info})` : '';
                          const roomDetail = s.room ? ` in ${s.room}` : '';
                          const teacherDetail = s.substitute ? ` durch ${s.substitute}` : '';
                          const displaySubj = this._resolveSubjectName(s.subject_resolved || s.subject, currentChild) || s.subject;
                          return `<div>• <b>${s.lesson}. Std:</b> ${displaySubj} — <span style="font-weight:600;">${kindText}</span>${teacherDetail}${roomDetail}${infoDetail}</div>`;
                        }).join('')}
                      </div>
                    </div>
                  </div>
                `;
              })()}

              <div class="prep-body">
                ${nextDay.lessons.length === 0 ? `
                  <div class="empty-events">
                    ${this._t('prep_empty', { day: nextDay.dayName })}
                  </div>
                ` : `
                  <div class="prep-grid">
                    ${nextDay.lessons.map(l => {
                      const substDays = (currentChild && currentChild.portalSubstitutions && currentChild.portalSubstitutions.days) || [];
                      const nextDaySubst = substDays.find(d => d.date === nextDay.targetDateIso);
                      const nextEntries = (nextDaySubst && nextDaySubst.entries) || [];
                      const matchingSubst = nextEntries.find(s =>
                        this._isSubstRelevantForChild(s, currentChild, nextDay.dayKey) &&
                        this._isSubstMatchingSubject(s, l.subject, currentChild)
                      );
                      const isCancelled = matchingSubst && matchingSubst.kind === 'entfall';

                      const isExamSubject = nextDay.exams.some(e =>
                        (e.subject && e.subject.toLowerCase() === l.subject.toLowerCase()) ||
                        e.summary.toLowerCase().includes(l.subject.toLowerCase()) ||
                        l.subject.toLowerCase().includes(e.summary.toLowerCase())
                      );
                      const prepSubjectsMap = (currentChild && currentChild.preparedSubjects) || {};
                      const isPrepared = Boolean(prepSubjectsMap[l.subject]);
                      return `
                        <div class="prep-item prep-item-clickable ${isPrepared ? 'prepared-subject' : ''} ${isExamSubject ? 'has-exam' : ''} ${isCancelled ? 'cancelled-subject' : ''}"
                             data-subject="${l.subject}"
                             style="cursor: pointer; ${isPrepared ? 'border: 2px solid #22c55e !important; background: rgba(34, 197, 94, 0.14) !important;' : ''} ${isCancelled ? 'opacity: 0.65; border: 1px dashed rgba(239,68,68,0.5);' : ''}">
                          <div class="prep-item-top">
                            <span class="prep-slot-badge">${l.slotLabel}</span>
                            <span class="prep-slot-time">${l.slotTime}</span>
                          </div>
                          <div class="prep-subject-name" style="display: flex; align-items: center; justify-content: space-between;">
                            <span style="${isCancelled ? 'text-decoration: line-through;' : ''}">${l.subject}</span>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              ${isCancelled ? `<span style="font-size: 10px; font-weight: 700; background: rgba(239,68,68,0.25); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); border-radius: 4px; padding: 1px 5px;">${this._t('subst_badge_cancelled')}</span>` : (matchingSubst && matchingSubst.kind === 'vertretung' ? `<span style="font-size: 10px; font-weight: 700; background: rgba(59,130,246,0.25); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4); border-radius: 4px; padding: 1px 5px;">${this._t('subst_badge_subst')}</span>` : (matchingSubst && matchingSubst.kind === 'raum' ? `<span style="font-size: 10px; font-weight: 700; background: rgba(234,179,8,0.25); color: #fde047; border: 1px solid rgba(234,179,8,0.4); border-radius: 4px; padding: 1px 5px;">${this._t('subst_badge_room')}</span>` : ''))}
                              <span class="prep-check-icon" style="color: #22c55e; font-size: 16px; font-weight: bold; ${isPrepared ? 'display: inline;' : 'display: none;'}">✓</span>
                            </div>
                          </div>
                          <div class="prep-meta">
                            ${matchingSubst && matchingSubst.room ? `<span class="prep-meta-tag" style="color: #fde047;">📍 ${matchingSubst.room}</span>` : (l.room ? `<span class="prep-meta-tag">📍 ${l.room}</span>` : '')}
                            ${matchingSubst && matchingSubst.substitute ? `<span class="prep-meta-tag" style="color: #93c5fd;">👨‍🏫 ${matchingSubst.substitute}</span>` : (l.teacher ? `<span class="prep-meta-tag">👨‍🏫 ${l.teacher}</span>` : '')}
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
                    ${this._t('add_event_btn')}
                  </button>
                ` : ''}
              </div>
            </div>

            <div class="events-list">
              ${!currentChild || (!currentChild.calendarEntity && upcomingEvents.length === 0) ? `
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
                      <div class="event-item clickable-event" data-uid="${evt.uid || ''}" data-summary="${this._escapeHtml(evt.summary || '')}" data-start="${evt.start || ''}" data-desc="${this._escapeHtml(evt.description || '')}" data-subject="${this._escapeHtml(evt.subject || '')}" data-is-portal="${evt.isPortal ? '1' : '0'}" data-is-exam="${evt.isExam ? '1' : '0'}" style="cursor: pointer; ${borderStyle}" title="${this._t('edit_event_title')}">
                        <div class="event-badge-row" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                          <span class="event-countdown ${countdownText.cls}">${countdownText.text}</span>
                          <span class="event-time">${formattedDate} ${!isAllDay ? this._t('time_at', { time: formattedTime }) : this._t('all_day')}</span>
                          ${evt.isExam ? `<span style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 4px; padding: 1px 6px; font-size: 11px; font-weight: 600;">📝 ${this._t('portal_exam_badge')}</span>` : ''}
                          ${evt.isPortal ? `<span style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 4px; padding: 1px 6px; font-size: 11px; font-weight: 600;">🏫 Portal</span>` : ''}
                        </div>
                        <h4 class="event-title">${evt.summary}</h4>
                        ${evt.subject ? `<div class="event-detail" style="color: #6ee7b7; font-weight: 600; font-size: 12px; margin-top: 2px;">📚 ${this._t('subject_label')}: ${evt.subject}</div>` : ''}
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
                ${currentChild && currentChild.portalSubstitutions && currentChild.portalSubstitutions.stand ? `
                  <span style="font-size: 11px; color: #93c5fd; background: rgba(59,130,246,0.15); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(59,130,246,0.3); font-weight: 500;">
                    ${this._t('portal_subst_stand')} ${currentChild.portalSubstitutions.stand}
                  </span>
                ` : ''}
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
                          const colDateIso = this._getDateForDayKey(d.key);
                          const subst = (currentChild && currentChild.portalSubstitutions) ? this._getSubstitution(currentChild.portalSubstitutions, colDateIso, slot.id, slot.number, cellData.subject, currentChild) : null;
                          const isEntfall = subst && subst.kind === 'entfall';
                          const isRaum = subst && subst.kind === 'raum';
                          const isVertretung = subst && subst.kind === 'vertretung';
                          const displaySubject = subst ? (this._resolveSubjectName(subst.subject_resolved || subst.subject, currentChild) || cellData.subject) : cellData.subject;
                          const displayRoom = subst && subst.room ? subst.room : cellData.room;
                          const displayTeacher = subst && subst.substitute ? subst.substitute : (subst && subst.teacher ? subst.teacher : cellData.teacher);

                          return `
                            <td class="timetable-cell ${isToday ? 'today-col' : ''} ${isNow ? 'now-cell' : ''} ${hasSubject || subst ? 'has-subject' : 'empty-cell'} ${subst ? 'has-substitution' : ''}"
                                data-slot-id="${slot.id}"
                                data-day="${d.key}"
                                data-slot-label="${slot.label} (${slot.start}-${slot.end})"
                                data-day-label="${dayNames[d.key] || d.key}"
                                data-subject="${cellData.subject || ''}"
                                data-room="${cellData.room || ''}"
                                data-teacher="${cellData.teacher || ''}">
                              ${isNow ? `<div class="now-badge">${this._t('now_badge')}</div>` : ''}
                              ${isEntfall ? `
                                <div class="subst-badge subst-entfall" style="font-size: 10px; font-weight: 700; background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 4px; padding: 1px 5px; margin-bottom: 3px; display: inline-block;" title="${subst.info || ''}">${this._t('subst_badge_cancelled')}</div>
                              ` : isRaum ? `
                                <div class="subst-badge subst-raum" style="font-size: 10px; font-weight: 700; background: rgba(234, 179, 8, 0.25); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 4px; padding: 1px 5px; margin-bottom: 3px; display: inline-block;" title="${subst.info || ''}">${this._t('subst_badge_room')}</div>
                              ` : isVertretung ? `
                                <div class="subst-badge subst-vertretung" style="font-size: 10px; font-weight: 700; background: rgba(59, 130, 246, 0.25); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 4px; padding: 1px 5px; margin-bottom: 3px; display: inline-block;" title="${subst.info || ''}">${this._t('subst_badge_subst')}</div>
                              ` : ''}
                              ${hasSubject || subst ? `
                                <div class="cell-subject" style="${isEntfall ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${displaySubject}</div>
                                <div class="cell-details">
                                  ${displayRoom ? `<span class="cell-room" style="${isRaum ? 'color: #fde047; font-weight: 600;' : ''}">📍 ${displayRoom}</span>` : ''}
                                  ${displayTeacher ? `<span class="cell-teacher" style="${isVertretung ? 'color: #93c5fd; font-weight: 600;' : ''}">👨‍🏫 ${displayTeacher}</span>` : ''}
                                </div>
                                ${subst && subst.info ? `<div style="font-size: 10px; color: rgba(255,255,255,0.65); margin-top: 2px;">ℹ️ ${subst.info}</div>` : ''}
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

      <!-- Calendar Event Edit / Add Modal -->
      ${this._showAddEventModal ? `
        <div class="modal-backdrop" id="event-modal-backdrop">
          <div class="modal-card event-modal-card" style="max-width: 520px; width: 100%;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <h3 style="margin: 0; font-size: 18px;">${this._editingEvent ? this._t('edit_event_title') : this._t('add_event_title')}</h3>
                <div style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
                  ${this._editingEvent && this._editingEvent.isExam ? `<span style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;">📝 ${this._t('portal_exam_badge')}</span>` : ''}
                  ${this._editingEvent && this._editingEvent.isPortal ? `<span style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;">🏫 Portal</span>` : ''}
                  ${this._editingEvent && this._editingEvent.subject ? `<span style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;">📚 ${this._escapeHtml(this._editingEvent.subject)}</span>` : ''}
                </div>
              </div>
              <button class="icon-btn" id="close-event-modal-x" style="font-size: 20px; border: none; background: none; color: #fff; cursor: pointer; padding: 4px 8px;">✖</button>
            </div>

            <form id="add-event-form">
              <div class="form-group" style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #fff;">${this._t('event_summary_label')}</label>
                <input type="text" id="event-summary-input" required value="${this._escapeHtml(this._editingEvent ? this._editingEvent.summary : '')}" placeholder="${this._t('event_summary_placeholder')}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 13px; box-sizing: border-box;">
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
                <input type="text" id="event-desc-input" value="${this._escapeHtml(this._editingEvent ? (this._editingEvent.description || '') : '')}" placeholder="${this._t('event_desc_placeholder')}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 13px; box-sizing: border-box;">
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 20px;">
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
        </div>
      ` : ''}

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
                <button type="button" class="delete-btn" id="modal-delete-btn">${this._t('delete_btn')}</button>
                <div class="modal-actions-right">
                  <button type="button" class="submit-btn secondary" id="modal-cancel-btn">${this._t('cancel_btn')}</button>
                  <button type="submit" class="submit-btn">${this._t('save_btn')}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ` : ''}

      <!-- 3-Tab Settings Modal -->
      ${this._showSettingsModal ? `
        <div class="modal-backdrop" id="settings-modal-backdrop">
          <div class="modal-card settings-modal-card" style="max-width: 580px; width: 100%;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0;">
              <div>
                <h3 style="margin: 0; font-size: 18px;">⚙️ ${this._t('settings_title', { child: this._selectedChild })}</h3>
              </div>
              <button class="icon-btn" id="settings-close-x" style="font-size: 20px; border: none; background: none; color: #fff; cursor: pointer; padding: 4px 8px;">✖</button>
            </div>

            <!-- Settings Tabs Header -->
            <div class="settings-tabs-header" style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1)); padding-bottom: 10px; flex-wrap: wrap; flex-shrink: 0;">
              <button type="button" class="modal-tab-btn ${this._settingsTab === 'general' ? 'active' : ''}" id="settings-tab-btn-general" style="padding: 8px 14px; border-radius: 8px; border: 1px solid ${this._settingsTab === 'general' ? 'var(--primary-color, #3b82f6)' : 'rgba(255,255,255,0.1)'}; background: ${this._settingsTab === 'general' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)'}; color: #fff; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                ${this._t('settings_tab_general')}
              </button>
              <button type="button" class="modal-tab-btn ${this._settingsTab === 'subjects' ? 'active' : ''}" id="settings-tab-btn-subjects" style="padding: 8px 14px; border-radius: 8px; border: 1px solid ${this._settingsTab === 'subjects' ? 'var(--primary-color, #3b82f6)' : 'rgba(255,255,255,0.1)'}; background: ${this._settingsTab === 'subjects' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)'}; color: #fff; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                ${this._t('settings_tab_subjects')}
              </button>
              <button type="button" class="modal-tab-btn ${this._settingsTab === 'timetable' ? 'active' : ''}" id="settings-tab-btn-timetable" style="padding: 8px 14px; border-radius: 8px; border: 1px solid ${this._settingsTab === 'timetable' ? 'var(--primary-color, #3b82f6)' : 'rgba(255,255,255,0.1)'}; background: ${this._settingsTab === 'timetable' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)'}; color: #fff; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                ${this._t('settings_tab_timetable')}
              </button>
              <button type="button" class="modal-tab-btn ${this._settingsTab === 'portal' ? 'active' : ''}" id="settings-tab-btn-portal" style="padding: 8px 14px; border-radius: 8px; border: 1px solid ${this._settingsTab === 'portal' ? 'var(--primary-color, #3b82f6)' : 'rgba(255,255,255,0.1)'}; background: ${this._settingsTab === 'portal' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)'}; color: #fff; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                ${this._t('settings_tab_portal')}
              </button>
            </div>

            <div class="settings-modal-body">
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
            ` : this._settingsTab === 'portal' ? `
              <!-- Eltern-Portal Tab in Settings -->
              <div class="settings-portal-tab">
                <form id="settings-portal-form">
                  <div style="margin-bottom: 14px; color: rgba(255,255,255,0.75); font-size: 13px; line-height: 1.4;">
                    ${this._t('portal_desc')}
                  </div>

                  <div style="margin-bottom: 16px; padding: 10px 14px; border-radius: 8px; background: ${currentChild.portalEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${currentChild.portalEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}; display: flex; align-items: center; justify-content: space-between;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 600; font-size: 13px; color: #fff;">
                      <input type="checkbox" id="settings-portal-enabled" ${currentChild.portalEnabled ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer;">
                      <span>${this._t('portal_enable')}</span>
                    </label>
                    <span style="font-size: 12px; padding: 2px 8px; border-radius: 12px; background: ${currentChild.portalEnabled ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${currentChild.portalEnabled ? '#86efac' : '#94a3b8'};">
                      ${currentChild.portalEnabled ? '🟢 Aktiv' : '⚪ Deaktiviert'}
                    </span>
                  </div>

                  ${(() => {
                    const siblingPortals = Object.values(data || children || {}).filter(c => c && c.name !== this._selectedChild && c.portalSchool);
                    if (siblingPortals.length === 0) return '';
                    return `
                      <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;">
                        <div style="font-size: 12px; font-weight: 600; color: #93c5fd; margin-bottom: 6px;">👥 ${this._t('portal_copy_from')}</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                          ${siblingPortals.map(s => `
                            <button type="button" class="sibling-portal-copy-btn" data-child="${s.name}" data-school="${s.portalSchool}" data-user="${s.portalUsername}" style="font-size: 12px; padding: 4px 10px; border-radius: 6px; background: rgba(59,130,246,0.25); border: 1px solid #3b82f6; color: #fff; cursor: pointer; transition: background 0.2s;">
                              📋 ${s.name} (${s.portalSchool})
                            </button>
                          `).join('')}
                        </div>
                      </div>
                    `;
                  })()}

                  <div class="form-group" style="margin-bottom: 14px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px;">🏫 ${this._t('portal_school')}</label>
                    <input type="text" id="settings-portal-school" placeholder="${this._t('portal_school_placeholder')}" value="${this._portalFormSchool !== undefined ? this._portalFormSchool : (currentChild.portalSchool || '')}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.25); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 13px; box-sizing: border-box;">
                    <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px;">${this._t('portal_school_help')}</div>
                  </div>

                  <div class="form-group" style="margin-bottom: 14px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px;">👤 ${this._t('portal_username')}</label>
                    <input type="text" id="settings-portal-username" placeholder="name@beispiel.de" value="${this._portalFormUsername !== undefined ? this._portalFormUsername : (currentChild.portalUsername || '')}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.25); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 13px; box-sizing: border-box;">
                  </div>

                  <div class="form-group" style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px;">🔒 ${this._t('portal_password')}</label>
                    <input type="password" id="settings-portal-password" placeholder="${currentChild.portalHasPassword ? this._t('portal_password_stored') : '••••••••'}" value="${this._portalFormPassword !== undefined ? this._portalFormPassword : ''}" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.25); color: #fff; border: 1px solid rgba(255,255,255,0.15); font-size: 13px; box-sizing: border-box;">
                  </div>

                  <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                    <button type="button" id="settings-portal-test-btn" class="submit-btn secondary" style="width: auto; padding: 8px 16px; font-size: 13px;" ${this._portalTesting ? 'disabled style="opacity:0.6;cursor:wait;"' : ''}>
                      ${this._portalTesting ? '⏳ ' + this._t('portal_testing') : this._t('portal_test_btn')}
                    </button>
                  </div>

                  ${this._portalTestError ? `
                    <div style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; color: #fca5a5; font-size: 13px;">
                      ❌ ${this._portalTestError}
                    </div>
                  ` : ''}

                  ${this._portalTestResult ? `
                    <div style="background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); border-radius: 8px; padding: 12px 14px; margin-bottom: 16px;">
                      <div style="font-weight: 600; color: #86efac; font-size: 13px; margin-bottom: 10px;">
                        ✅ Verbindung erfolgreich! Schule: <strong>${this._portalTestResult.school_name || this._portalTestResult.school}</strong>
                      </div>
                      <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #fff;">
                        👤 ${this._t('portal_child_select')}
                      </label>
                      <select id="settings-portal-student-select" style="width: 100%; padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.2); font-size: 13px; cursor: pointer;">
                        ${this._portalTestResult.students.length === 0 ? `<option value="">Keine Schüler gefunden</option>` : ''}
                        ${this._portalTestResult.students.map(st => {
                          const isSel = (this._portalSelectedStudentId && this._portalSelectedStudentId === st.student_id) || (!this._portalSelectedStudentId && (currentChild.portalStudentId === st.student_id || st.fullname.toLowerCase().includes((this._selectedChild || '').toLowerCase())));
                          return `<option value="${st.student_id}" data-name="${st.fullname}" ${isSel ? 'selected' : ''}>${st.fullname} (ID: ${st.student_id})</option>`;
                        }).join('')}
                      </select>
                    </div>
                  ` : currentChild.portalStudentId ? `
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px;">
                      👤 <strong>Verknüpftes Kind im Portal:</strong> <span style="color: #60a5fa;">${currentChild.portalStudentName || currentChild.portalStudentId}</span>
                      <input type="hidden" id="settings-portal-student-id-hidden" value="${currentChild.portalStudentId}">
                      <input type="hidden" id="settings-portal-student-name-hidden" value="${currentChild.portalStudentName || ''}">
                    </div>
                  ` : ''}

                  <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px; margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 13px; color: #fff;">
                      ⚙️ ${this._t('portal_sync_options')}
                    </label>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;">
                        <input type="checkbox" id="settings-portal-sync-tt" ${currentChild.portalSyncTimetable ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer;">
                        <span>📅 ${this._t('portal_sync_tt')}</span>
                      </label>
                      <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-left: 26px; margin-top: -4px; margin-bottom: 4px; line-height: 1.3;">
                        ${this._t('portal_sync_tt_help')}
                      </div>
                      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;">
                        <input type="checkbox" id="settings-portal-sync-subst" ${currentChild.portalSyncSubstitutions ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer;">
                        <span>🔄 ${this._t('portal_sync_subst')}</span>
                      </label>
                      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;">
                        <input type="checkbox" id="settings-portal-sync-exams" ${currentChild.portalSyncExams ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer;">
                        <span>📝 ${this._t('portal_sync_exams')}</span>
                      </label>
                      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;">
                        <input type="checkbox" id="settings-portal-ignore-info" ${currentChild.portalIgnoreInfoEvents ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer;">
                        <span>🚫 ${this._t('portal_ignore_info_label')}</span>
                      </label>
                      <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-left: 26px; margin-top: -4px; margin-bottom: 4px; line-height: 1.3;">
                        ${this._t('portal_ignore_info_help')}
                      </div>
                    </div>
                  </div>

                  ${currentChild.portalEnabled && currentChild.portalStudentId ? `
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px; margin-bottom: 20px;">
                      <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px; color: #fff;">
                        🔄 Aktionen & Status
                      </label>
                      <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 10px;">
                        ${currentChild && currentChild.portalLastSync ? `
                          <div>⏱️ <b>${this._t('portal_last_sync_label')}</b> ${(() => {
                            try {
                              const d = new Date(currentChild.portalLastSync);
                              return isNaN(d.getTime()) ? currentChild.portalLastSync : d.toLocaleString(this._getLocale());
                            } catch (e) {
                              return currentChild.portalLastSync;
                            }
                          })()}</div>
                        ` : ''}
                        ${currentChild && currentChild.portalLastStatus ? `
                          <div>📊 <b>Status:</b> ${currentChild.portalLastStatus}</div>
                        ` : ''}
                      </div>
                      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button type="button" id="settings-portal-sync-now-btn" class="submit-btn secondary" style="width: auto; padding: 8px 14px; font-size: 13px;" ${this._portalSyncing ? 'disabled style="opacity:0.6;cursor:wait;"' : ''}>
                          ${this._portalSyncing ? '⏳ Synchronisiere...' : this._t('portal_sync_now_btn')}
                        </button>
                        <button type="button" id="settings-portal-import-tt-btn" class="submit-btn secondary" style="width: auto; padding: 8px 14px; font-size: 13px;" ${this._portalImportingTt ? 'disabled style="opacity:0.6;cursor:wait;"' : ''}>
                          ${this._portalImportingTt ? '⏳ Importiere...' : this._t('portal_import_tt_btn')}
                        </button>
                        <button type="button" id="settings-portal-import-exams-btn" class="submit-btn secondary" style="width: auto; padding: 8px 14px; font-size: 13px;" ${this._portalImportingExams ? 'disabled style="opacity:0.6;cursor:wait;"' : ''}>
                          ${this._portalImportingExams ? '⏳ Importiere...' : this._t('portal_import_exams_btn')}
                        </button>
                      </div>
                      ${this._portalSyncFeedback ? `
                        <div style="margin-top: 10px; font-size: 12px; padding: 6px 10px; border-radius: 6px; background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4);">
                          ${this._portalSyncFeedback}
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}

                  <!-- Editable Subject Aliases Section (YAML) -->
                  <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <label style="font-weight: 600; font-size: 13px; color: #fff;">
                        ${this._t('portal_aliases_title')}
                      </label>
                      <button type="button" id="settings-portal-aliases-reset-btn" style="background: none; border: none; color: #93c5fd; cursor: pointer; font-size: 11px; text-decoration: underline;">
                        ${this._t('portal_aliases_reset')}
                      </button>
                    </div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 8px; line-height: 1.3;">
                      ${this._t('portal_aliases_help')}
                    </div>
                    <div style="font-size: 11px; color: #93c5fd; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; line-height: 1.35;">
                      ${this._t('portal_aliases_slash_tip')}
                    </div>
                    <textarea id="settings-portal-aliases-textarea" rows="6" style="font-family: monospace; font-size: 12px; line-height: 1.4; resize: vertical; tab-size: 2; width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">${this._aliasesToYaml((currentChild && currentChild.subjectAliases) || {})}</textarea>
                    <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                      <button type="button" id="settings-portal-aliases-save-btn" class="submit-btn secondary" style="width: auto; padding: 6px 14px; font-size: 12px;">
                        ${this._t('portal_aliases_save_btn')}
                      </button>
                    </div>
                  </div>

                  <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button type="button" class="submit-btn secondary" id="settings-cancel-btn">${this._t('cancel_btn')}</button>
                    <button type="submit" class="submit-btn">${this._t('save_btn')}</button>
                  </div>
                </form>
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

    // Child Portal Sync Badge inside Tab
    root.querySelectorAll('.child-portal-sync-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const cName = badge.getAttribute('data-child') || this._selectedChild;
        this._triggerPortalSync(cName);
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
    root.querySelectorAll('#open-settings-btn, #open-settings-banner-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this._showSettingsModal = true;
        this._settingsTab = 'general';
        this._portalTesting = false;
        this._portalTestResult = null;
        this._portalTestError = null;
        this._portalFormSchool = undefined;
        this._portalFormUsername = undefined;
        this._portalFormPassword = undefined;
        this._portalCopySibling = undefined;
        this.render();
      });
    });

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
        tabBtnGeneral.addEventListener('click', (e) => {
          e.preventDefault();
          this._settingsTab = 'general';
          this.render();
        });
      }

      const tabBtnSubjects = root.querySelector('#settings-tab-btn-subjects');
      if (tabBtnSubjects) {
        tabBtnSubjects.addEventListener('click', (e) => {
          e.preventDefault();
          this._settingsTab = 'subjects';
          this.render();
        });
      }

      const tabBtnTimetable = root.querySelector('#settings-tab-btn-timetable');
      if (tabBtnTimetable) {
        tabBtnTimetable.addEventListener('click', (e) => {
          e.preventDefault();
          this._settingsTab = 'timetable';
          this.render();
        });
      }

      const tabBtnPortal = root.querySelector('#settings-tab-btn-portal');
      if (tabBtnPortal) {
        tabBtnPortal.addEventListener('click', (e) => {
          e.preventDefault();
          this._settingsTab = 'portal';
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

          if (!this._localSectionVisibility) this._localSectionVisibility = {};
          this._localSectionVisibility[this._selectedChild] = {
            show_prep_card: showPrep,
            show_calendar_card: showCal,
            show_timetable_card: showTt,
            show_overview_card: showOv,
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
            const childName = this._selectedChild;

            // Optimistically purge subject from local timetable schedule
            if (this._localTimetableSchedule && this._localTimetableSchedule[childName]) {
              for (const slotMap of Object.values(this._localTimetableSchedule[childName])) {
                if (slotMap && typeof slotMap === 'object') {
                  for (const [dayKey, cell] of Object.entries(slotMap)) {
                    if (cell && cell.subject === subject) {
                      slotMap[dayKey] = { subject: '', room: '', teacher: '' };
                    }
                  }
                }
              }
            }

            // Optimistically remove from current child data
            const currentChild = this._data && this._data[childName];
            if (currentChild) {
              if (currentChild.subjects) {
                delete currentChild.subjects[subject];
              }
              if (currentChild.timetable && currentChild.timetable.schedule) {
                for (const slotMap of Object.values(currentChild.timetable.schedule)) {
                  if (slotMap && typeof slotMap === 'object') {
                    for (const [dayKey, cell] of Object.entries(slotMap)) {
                      if (cell && cell.subject === subject) {
                        delete slotMap[dayKey];
                      }
                    }
                  }
                }
              }
            }

            this.render();

            await this._hass.callService('school_grades', 'remove_subject', {
              child_name: childName,
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

      // Sibling Portal Copy Buttons
      root.querySelectorAll('.sibling-portal-copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const sibChild = btn.getAttribute('data-child') || '';
          const sch = btn.getAttribute('data-school') || '';
          const usr = btn.getAttribute('data-user') || '';
          this._portalFormSchool = sch;
          this._portalFormUsername = usr;
          this._portalCopySibling = sibChild;

          let pwd = '';
          if (sibChild) {
            try {
              const res = await this._hass.callWS({
                type: 'school_grades/get_sibling_portal_credentials',
                sibling_name: sibChild,
              });
              if (res && res.success && res.password) {
                pwd = res.password;
              }
            } catch (err) {
              console.warn('Could not fetch sibling password:', err);
            }
          }
          this._portalFormPassword = pwd;
          const sInput = root.querySelector('#settings-portal-school');
          const uInput = root.querySelector('#settings-portal-username');
          const pInput = root.querySelector('#settings-portal-password');
          if (sInput) sInput.value = sch;
          if (uInput) uInput.value = usr;
          if (pInput) pInput.value = pwd;
        });
      });

      // Inputs change tracking for portal
      const sInputTrack = root.querySelector('#settings-portal-school');
      if (sInputTrack) {
        sInputTrack.addEventListener('input', () => {
          this._portalFormSchool = sInputTrack.value;
        });
      }
      const uInputTrack = root.querySelector('#settings-portal-username');
      if (uInputTrack) {
        uInputTrack.addEventListener('input', () => {
          this._portalFormUsername = uInputTrack.value;
        });
      }
      const pInputTrack = root.querySelector('#settings-portal-password');
      if (pInputTrack) {
        pInputTrack.addEventListener('input', () => {
          this._portalFormPassword = pInputTrack.value;
        });
      }

      // Eltern-Portal Test Connection Button
      const portalTestBtn = root.querySelector('#settings-portal-test-btn');
      if (portalTestBtn) {
        portalTestBtn.addEventListener('click', async () => {
          const sInput = root.querySelector('#settings-portal-school');
          const uInput = root.querySelector('#settings-portal-username');
          const pInput = root.querySelector('#settings-portal-password');
          const schoolVal = sInput ? sInput.value.trim() : (this._portalFormSchool || '');
          const userVal = uInput ? uInput.value.trim() : (this._portalFormUsername || '');
          const passVal = pInput && pInput.value ? pInput.value : (this._portalFormPassword || '');

          this._portalFormSchool = schoolVal;
          this._portalFormUsername = userVal;
          this._portalFormPassword = passVal;
          this._portalTesting = true;
          this._portalTestError = null;
          this.render();

          try {
            const reqData = {
              type: 'school_grades/test_elternportal',
              school: schoolVal,
              username: userVal,
              password: passVal,
              child_name: this._selectedChild,
            };
            if (this._portalCopySibling) {
              reqData.copy_sibling_name = this._portalCopySibling;
            }
            const res = await this._hass.callWS(reqData);
            this._portalTesting = false;
            if (res && res.success) {
              this._portalTestResult = res;
              this._portalTestError = null;
              if (Array.isArray(res.students) && res.students.length > 0) {
                const match = res.students.find(st =>
                  st.fullname.toLowerCase().includes((this._selectedChild || '').toLowerCase()) ||
                  (this._selectedChild || '').toLowerCase().includes((st.firstname || '').toLowerCase())
                );
                this._portalSelectedStudentId = match ? match.student_id : res.students[0].student_id;
              }
            } else {
              this._portalTestResult = null;
              this._portalTestError = res && res.message ? res.message : 'Verbindung fehlgeschlagen';
            }
          } catch (err) {
            this._portalTesting = false;
            this._portalTestResult = null;
            this._portalTestError = (err && (err.message || err.error)) || String(err);
          }
          this.render();
        });
      }

      // Student Select Change Listener
      const studentSelect = root.querySelector('#settings-portal-student-select');
      if (studentSelect) {
        studentSelect.addEventListener('change', () => {
          this._portalSelectedStudentId = studentSelect.value;
        });
      }

      // Eltern-Portal Settings Form Submit
      const portalForm = root.querySelector('#settings-portal-form');
      if (portalForm) {
        portalForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const enabled = root.querySelector('#settings-portal-enabled')?.checked || false;
          const school = root.querySelector('#settings-portal-school')?.value.trim() || this._portalFormSchool || '';
          const username = root.querySelector('#settings-portal-username')?.value.trim() || this._portalFormUsername || '';
          const password = root.querySelector('#settings-portal-password')?.value || this._portalFormPassword || '';
          const sel = root.querySelector('#settings-portal-student-select');
          let studentId = '';
          let studentName = '';
          if (sel && sel.value) {
            studentId = sel.value;
            const opt = sel.options[sel.selectedIndex];
            studentName = opt ? (opt.getAttribute('data-name') || opt.text) : '';
          } else {
            studentId = root.querySelector('#settings-portal-student-id-hidden')?.value || '';
            studentName = root.querySelector('#settings-portal-student-name-hidden')?.value || '';
          }

          const syncTt = root.querySelector('#settings-portal-sync-tt')?.checked ?? true;
          const syncSubst = root.querySelector('#settings-portal-sync-subst')?.checked ?? true;
          const syncExams = root.querySelector('#settings-portal-sync-exams')?.checked ?? true;
          const ignoreInfo = root.querySelector('#settings-portal-ignore-info')?.checked ?? false;
          const copySib = this._portalCopySibling;

          // Also save subject aliases textarea if present before closing modal
          const aliasesTa = root.querySelector('#settings-portal-aliases-textarea');
          if (aliasesTa && this._selectedChild) {
            try {
              const aliasRes = await this._hass.callWS({
                type: 'school_grades/update_subject_aliases',
                child_name: this._selectedChild,
                aliases_yaml: aliasesTa.value,
              });
              if (aliasRes && aliasRes.aliases) {
                const curChild = this._data?.children?.[this._selectedChild];
                if (curChild) curChild.subjectAliases = aliasRes.aliases;
              }
            } catch (err) {
              console.warn("Failed to auto-save subject aliases on portal form submit:", err);
            }
          }

          this._showSettingsModal = false;
          this._portalTesting = false;
          this._portalTestResult = null;
          this._portalTestError = null;
          this._portalFormSchool = undefined;
          this._portalFormUsername = undefined;
          this._portalFormPassword = undefined;
          this._portalCopySibling = undefined;
          this.render();

          try {
            const payload = {
              child_name: this._selectedChild,
              portal_enabled: enabled,
              portal_school: school,
              portal_username: username,
              portal_password: password,
              portal_student_id: studentId,
              portal_student_name: studentName,
              portal_sync_timetable: syncTt,
              portal_sync_substitutions: syncSubst,
              portal_sync_exams: syncExams,
              portal_ignore_info_events: ignoreInfo,
            };
            if (copySib) {
              payload.copy_sibling_name = copySib;
            }
            await this._hass.callService('school_grades', 'update_portal_settings', payload);
          } catch (err) {
            console.error("Failed to update portal settings:", err);
          }
        });
      }

      // Eltern-Portal Sync Now button
      const syncNowBtn = root.querySelector('#settings-portal-sync-now-btn');
      if (syncNowBtn) {
        syncNowBtn.addEventListener('click', async () => {
          const now = Date.now();
          if (!this._portalSyncTimestamps) this._portalSyncTimestamps = {};
          const lastSync = this._portalSyncTimestamps[this._selectedChild] || 0;
          const elapsed = Math.floor((now - lastSync) / 1000);
          if (elapsed < 60) {
            const wait = 60 - elapsed;
            this._portalSyncFeedback = `⏳ Synchronisierungs-Limit: Bitte noch ${wait}s warten (max. 1x/Min).`;
            this.render();
            return;
          }
          this._portalSyncTimestamps[this._selectedChild] = now;
          this._portalSyncing = true;
          this._portalSyncFeedback = null;
          this.render();
          try {
            const res = await this._hass.callWS({
              type: 'school_grades/sync_elternportal',
              child_name: this._selectedChild,
            });
            this._portalSyncing = false;
            if (res && res.success) {
              await this._fetchUpcomingCalendarEvents();
              let syncFeedback = '✅ Synchronisierung erfolgreich!';
              if (res.deleted_info_count > 0) {
                syncFeedback += ` (${res.deleted_info_count} Info-Termine aus Kalender entfernt)`;
              }
              this._portalSyncFeedback = syncFeedback;
            } else {
              this._portalSyncFeedback = '❌ ' + ((res && res.message) || 'Fehler beim Synchronisieren');
            }
          } catch (err) {
            this._portalSyncing = false;
            this._portalSyncFeedback = '❌ ' + ((err && (err.message || err.error)) || String(err));
          }
          this.render();
        });
      }

      // Eltern-Portal Import Timetable button
      const importTtBtn = root.querySelector('#settings-portal-import-tt-btn');
      if (importTtBtn) {
        importTtBtn.addEventListener('click', async () => {
          if (!confirm(this._t('portal_import_tt_confirm'))) {
            return;
          }
          // Auto-save any edited aliases before importing timetable
          const aliasesTa = root.querySelector('#settings-portal-aliases-textarea');
          if (aliasesTa && this._selectedChild) {
            try {
              const aliasRes = await this._hass.callWS({
                type: 'school_grades/update_subject_aliases',
                child_name: this._selectedChild,
                aliases_yaml: aliasesTa.value,
              });
              if (aliasRes && aliasRes.aliases) {
                const curChild = this._data?.children?.[this._selectedChild];
                if (curChild) curChild.subjectAliases = aliasRes.aliases;
              }
            } catch (err) {
              console.warn("Failed to auto-save subject aliases before timetable import:", err);
            }
          }
          this._portalImportingTt = true;
          this._portalSyncFeedback = null;
          this.render();
          try {
            const res = await this._hass.callWS({
              type: 'school_grades/import_portal_timetable',
              child_name: this._selectedChild,
            });
            this._portalImportingTt = false;
            if (res && res.success) {
              this._portalSyncFeedback = '✅ Stundenplan erfolgreich importiert!';
            } else {
              this._portalSyncFeedback = '❌ ' + ((res && res.message) || 'Fehler beim Importieren');
            }
          } catch (err) {
            this._portalImportingTt = false;
            this._portalSyncFeedback = '❌ ' + ((err && (err.message || err.error)) || String(err));
          }
          this.render();
        });
      }

      // Eltern-Portal Import Exams button
      const importExamsBtn = root.querySelector('#settings-portal-import-exams-btn');
      if (importExamsBtn) {
        importExamsBtn.addEventListener('click', async () => {
          this._portalImportingExams = true;
          this._portalSyncFeedback = null;
          this.render();
          try {
            const res = await this._hass.callWS({
              type: 'school_grades/import_portal_exams',
              child_name: this._selectedChild,
            });
            this._portalImportingExams = false;
            if (res && res.success) {
              await this._fetchUpcomingCalendarEvents();
              let calText = '';
              if (res.deleted_info_count > 0) {
                calText = ` (${res.deleted_info_count} Info-Termine aus Kalender entfernt)`;
              } else if (res.synced_to_calendar) {
                calText = ' (in Kalender eingetragen)';
              }
              this._portalSyncFeedback = `✅ ${this._t('portal_exams_synced')}${calText}`;
            } else {
              this._portalSyncFeedback = '❌ ' + ((res && res.message) || 'Fehler beim Importieren der Klausuren');
            }
          } catch (err) {
            this._portalImportingExams = false;
            this._portalSyncFeedback = '❌ ' + ((err && (err.message || err.error)) || String(err));
          }
          this.render();
        });
      }

      // Save Aliases YAML button
      const saveAliasesBtn = root.querySelector('#settings-portal-aliases-save-btn');
      if (saveAliasesBtn) {
        saveAliasesBtn.addEventListener('click', async () => {
          const ta = root.querySelector('#settings-portal-aliases-textarea');
          if (!ta) return;
          const yamlText = ta.value;
          try {
            const res = await this._hass.callWS({
              type: 'school_grades/update_subject_aliases',
              child_name: this._selectedChild,
              aliases_yaml: yamlText,
            });
            if (res && res.aliases) {
              const currentChild = this._data?.children?.[this._selectedChild];
              if (currentChild) {
                currentChild.subjectAliases = res.aliases;
              }
            }
            alert(this._t('portal_aliases_saved'));
          } catch (err) {
            console.error('Failed to update subject aliases:', err);
            alert('Fehler: ' + ((err && (err.message || err.error)) || err));
          }
        });
      }

      // Reset Aliases to Default button
      const resetAliasesBtn = root.querySelector('#settings-portal-aliases-reset-btn');
      if (resetAliasesBtn) {
        resetAliasesBtn.addEventListener('click', () => {
          if (!confirm(this._t('portal_aliases_reset_confirm'))) {
            return;
          }
          const ta = root.querySelector('#settings-portal-aliases-textarea');
          if (ta) {
            ta.value = this._getDefaultAliasesYaml();
          }
        });
      }
    }

    // Open Add Calendar Event Modal
    const toggleAddEventBtn = root.querySelector('#toggle-add-event-btn');
    if (toggleAddEventBtn) {
      toggleAddEventBtn.addEventListener('click', () => {
        this._editingEvent = null;
        this._showAddEventModal = true;
        this.render();
      });
    }

    const closeEventModalX = root.querySelector('#close-event-modal-x') || root.querySelector('#close-add-event-x');
    if (closeEventModalX) {
      closeEventModalX.addEventListener('click', () => {
        this._showAddEventModal = false;
        this._editingEvent = null;
        this.render();
      });
    }

    const cancelAddEventBtn = root.querySelector('#cancel-add-event-btn');
    if (cancelAddEventBtn) {
      cancelAddEventBtn.addEventListener('click', () => {
        this._showAddEventModal = false;
        this._editingEvent = null;
        this.render();
      });
    }

    const eventBackdrop = root.querySelector('#event-modal-backdrop');
    if (eventBackdrop) {
      eventBackdrop.addEventListener('click', (e) => {
        if (e.target === eventBackdrop) {
          this._showAddEventModal = false;
          this._editingEvent = null;
          this.render();
        }
      });
    }

    // Click Event Item in Grid to Edit
    root.querySelectorAll('.clickable-event').forEach(item => {
      item.addEventListener('click', (e) => {
        const uid = e.currentTarget.dataset.uid || '';
        const summary = e.currentTarget.dataset.summary || '';
        const startIso = e.currentTarget.dataset.start || '';
        const description = e.currentTarget.dataset.desc || '';
        const subject = e.currentTarget.dataset.subject || '';
        const isPortal = e.currentTarget.dataset.isPortal === '1';
        const isExam = e.currentTarget.dataset.isExam === '1';

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
          subject: subject,
          isPortal: isPortal,
          isExam: isExam,
        };
        this._showAddEventModal = true;
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
          this._showAddEventModal = false;
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
          this._showAddEventModal = false;
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

          // Also remove directly from current child schedule immediately
          const currentChild = this._data && this._data[childName];
          if (currentChild && currentChild.timetable && currentChild.timetable.schedule) {
            const possibleSlots = [slotId, slotId.startsWith('slot_') ? slotId.replace('slot_', '') : `slot_${slotId}`];
            for (const ps of possibleSlots) {
              if (currentChild.timetable.schedule[ps]) {
                delete currentChild.timetable.schedule[ps][day];
              }
            }
          }

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
          const roomVal = subjectVal ? (root.querySelector('#modal-room').value || '').trim() : '';
          const teacherVal = subjectVal ? (root.querySelector('#modal-teacher').value || '').trim() : '';

          // Optimistically update local timetable schedule
          if (!this._localTimetableSchedule) this._localTimetableSchedule = {};
          if (!this._localTimetableSchedule[childName]) this._localTimetableSchedule[childName] = {};
          if (!this._localTimetableSchedule[childName][slotId]) this._localTimetableSchedule[childName][slotId] = {};
          this._localTimetableSchedule[childName][slotId][day] = {
            subject: subjectVal,
            room: roomVal,
            teacher: teacherVal,
          };

          const currentChild = this._data && this._data[childName];
          if (!subjectVal && currentChild && currentChild.timetable && currentChild.timetable.schedule) {
            const possibleSlots = [slotId, slotId.startsWith('slot_') ? slotId.replace('slot_', '') : `slot_${slotId}`];
            for (const ps of possibleSlots) {
              if (currentChild.timetable.schedule[ps]) {
                delete currentChild.timetable.schedule[ps][day];
              }
            }
          }

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
        align-items: center;
        flex-wrap: wrap;
      }

      .tab-btn {
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

      .tab-btn:hover {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
      }

      .tab-btn.active {
        background: linear-gradient(135deg, #2563eb, #7c3aed);
        color: #ffffff;
        border-color: transparent;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }

      .settings-badge-btn {
        background: var(--card-background-color, #1f2937);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: var(--secondary-text-color, #9ca3af);
        width: 40px;
        height: 40px;
        min-width: 40px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .settings-badge-btn:hover {
        border-color: var(--primary-color, #3b82f6);
        background: rgba(59, 130, 246, 0.15);
        color: var(--primary-color, #60a5fa);
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
      }

      .settings-badge-btn:active {
        transform: translateY(0);
        background: rgba(59, 130, 246, 0.25);
      }

      .settings-badge-btn svg {
        display: block;
        pointer-events: none;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .spin-icon {
        display: inline-block;
        animation: spin 1s linear infinite;
      }

      .child-portal-sync-badge:hover {
        background: rgba(59, 130, 246, 0.45) !important;
        transform: scale(1.05);
      }

      .portal-sync-trigger:hover {
        border-color: rgba(59, 130, 246, 0.8) !important;
        background: rgba(59, 130, 246, 0.2) !important;
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

      .prep-badge.today {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
        border: 1px solid rgba(16, 185, 129, 0.35);
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
        padding: 20px 12px;
        box-sizing: border-box;
        overflow-y: auto;
      }

      .modal-card {
        background: var(--card-background-color, #1f2937);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 24px;
        width: 90%;
        max-width: 460px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        max-height: calc(100vh - 40px);
        max-height: calc(100dvh - 40px);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        margin: auto;
        overflow-y: auto;
      }

      .settings-modal-card {
        max-height: calc(100vh - 40px);
        max-height: calc(100dvh - 40px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .settings-modal-body {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding-right: 6px;
        overscroll-behavior: contain;
      }

      .settings-modal-body::-webkit-scrollbar {
        width: 6px;
      }
      .settings-modal-body::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 4px;
      }
      .settings-modal-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.25);
        border-radius: 4px;
      }
      .settings-modal-body::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
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
