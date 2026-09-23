# 🎓 Schulnoten & Stundenplan - Home Assistant Integration (HACS)

<p align="center">
  <img src="custom_components/school_grades/brand/logo.png" alt="Schulnoten Logo" width="450">
</p>

[ 🇩🇪 **Deutsch** ](#-deutsch) | [ 🇬🇧 **English** ](#-english)

---

## 🇩🇪 Deutsch

Eine moderne, umfassende Home Assistant Custom Integration zur einfachen Verwaltung von Schulnoten, Klausuren-Kalendern, Vorbereitung für den nächsten Schultag und interaktiven Wochenstundenplänen für deine Kinder.

Mit dem **integrierten Sidebar-Panel** (`/schulnoten`) verwaltest du Noten, Fächer, Klausurtermine, Hausaufgaben-Status, Vorbereitung und Stundenpläne bequem an einem zentralen Ort – komplett ohne Dashboard-YAML-Cards!

### 🌟 Features

- 📱 **Zentrales Custom Sidebar-Panel (`🎓 Schulnoten`)**:
  - Erscheint automatisch in der linken Menüleiste von Home Assistant.
  - Komplette Verwaltung von Kindern, Noten, Fächern, Kalendern & Stundenplänen direkt in der Benutzeroberfläche.
- 👨‍👩‍👧‍👦 **Multi-Kind Verwaltung**: Beliebig viele Kinder-Instanzen anlegen (z. B. Richard, Max, Emma) und per Tab-Reiter umschalten (inkl. Klassenanzeige z. B. `👤 Richard (5a)`).
- 🎒 **Vorbereitung auf den nächsten Schultag & interaktiver Abhaken-Modus**:
  - Unterrichtsfächer für den morgigen Schultag werden übersichtlich aufgelistet.
  - Durch Klick auf ein Fach wird dieses grün umrandet und als vorbereitet markiert.
  - **Gesamt-Status binary_sensor (`binary_sensor.<kind>_vorbereitung_erledigt`)**: Wechselt automatisch auf `on`, wenn alle Schulfächer für morgen als vorbereitet abgehakt wurden.
- 📝 **Hausaufgaben-Status (`binary_sensor.<kind>_hausaufgaben_erledigt`)**:
  - Interaktiver Status-Button im Banner mit grüner Umrandung bei Erledigung.
  - Setzt sich an jedem Schultag morgens automatisch auf `off` zurück.
- 📅 **Wochenstundenplan (Timetable Matrix)**:
  - Übersichtlicher Stundenplan von Montag bis Freitag inkl. Unterrichtsstunden & Pausen.
  - **Tages-Highlighting**: Heutiger Wochentag wird automatisch im Header und in den Spalten hervorgehoben (`HEUTE`).
  - **Live-Unterrichtsanzeige (`⚡ JETZT`)**: Markiert die aktuell laufende Unterrichtsstunde in Echtzeit.
  - **Visueller Cell-Editor**: Klick auf eine Zelle zum Bearbeiten von Fach, Raumnummer (📍) und Lehrkraft (👨‍🏫). Eigene Fächer können direkt im Dialog erstellt werden.
  - **YAML Import & Export**: Stundenpläne bequem im YAML-Format importieren oder exportieren.
- 📆 **Klausuren- & Termine-Kalender**:
  - Verknüpfung mit jedem beliebigen Home Assistant Kalender (z. B. Google Kalender, CalDAV, lokaler Kalender).
  - Übersicht anstehender Klausuren mit Countdown-Badges (`⚡ HEUTE`, `⚠️ Morgen`, `In X Tagen`) und **Farbkodierung nach Dringlichkeit** (Rot ≤ 1 Tag, Orange 2-3 Tage, Gelb 4-7 Tage).
- 📘 **Fächer- & Notenverwaltung**:
  - **Einklappbares Noten-Formular (`➕ Neue Note eintragen`)**: Standardmäßig ausgeblendet für ein aufgeräumtes Dashboard; lässt sich per Action-Button aufklappen.
  - Eintragen von Noten (1.0 bis 6.0) mit frei wählbarer Gewichtung (1-fach, 2-fach, 3-fach, 4-fach).
  - Automatische Errechnung des gewichteten Fachdurchschnitts sowie des Gesamtdurchschnitts.
  - Notenhistorie mit Datum, Bezeichnung (z. B. *1. Schulaufgabe*) und Löschoption.
- ⚙️ **3-Tab Einstellungen-Modal (`⚙️ Allgemein`, `📘 Fächer verwalten` & `📅 Stundenplan`)**:
  - **Allgemein**: Notenskala (🇩🇪, 🇦🇹, 🇨🇭, 🇫🇷, 🇮🇹, 🇪🇸, 🇳🇱, 🇵🇱, 🇬🇧, 🇺🇸, 🇷🇺, 🇨🇳), Eingabe der Klasse (z. B. `5a`), Kalender-Auswahl sowie Bereichs-Sichtbarkeiten.
  - **Fächer verwalten**: Bequemes Anlegen neuer Schulfächer sowie Löschen bestehender Fächer.
  - **Stundenplan**: Direkter YAML-Import/Export.
- 🌐 **Mehrsprachigkeit (Multi-Language i18n)**:
  - Vollständige Lokalisierung für alle unterstützten Ländernormen: **Deutsch 🇩🇪**, **Englisch 🇬🇧/🇺🇸**, **Französisch 🇫🇷**, **Italienisch 🇮🇹**, **Spanisch 🇪🇸**, **Niederländisch 🇳🇱**, **Polnisch 🇵🇱**, **Russisch 🇷🇺** und **Chinesisch 🇨🇳**.
  - Passt sich automatisch der eingestellten Home Assistant Sprache des Benutzers an (inkl. UI-Panel, Sensoren-Statusansagen und Dienste-Beschreibungen).

### 📦 Installation über HACS (Custom Repository)

1. Öffne **HACS** in deinem Home Assistant.
2. Klicke oben rechts auf die **drei Punkte** `⋮` und wähle **Benutzerdefinierte Repositories** (*Custom repositories*).
3. Gib die URL ein: `https://github.com/vitals5/ha-school-grades`.
4. Wähle als Kategorie **Integration**.
5. Klicke auf **Hinzufügen**.
6. Suche nach **Schulnoten** in HACS, klicke auf **Herunterladen** und starte Home Assistant neu.

### ⚙️ Einrichtung

1. Gehe zu **Einstellungen** ➔ **Geräte & Dienste** ➔ **Integration hinzufügen**.
2. Suche nach **Schulnoten**.
3. Gib den **Namen des Kindes** ein (z. B. `Richard`).
4. Nach dem Speichern erscheint in der linken Navigationsleiste automatisch das Icon **🎓 Schulnoten**.

### ⚡ Home Assistant Aktionen / Services

Die Integration stellt folgende Aktionen (Services) für Automatisierungen oder Skripte zur Verfügung:

| Aktion | Beschreibung | Parameter |
| :--- | :--- | :--- |
| `school_grades.add_grade` | Note hinzufügen | `child_name`, `subject`, `grade`, `weight`, `name`, `date` |
| `school_grades.remove_grade` | Note löschen | `child_name`, `subject`, `grade_id` |
| `school_grades.add_subject` | Schulfach anlegen | `child_name`, `subject` |
| `school_grades.remove_subject` | Schulfach löschen | `child_name`, `subject` |
| `school_grades.set_homework_done` | Hausaufgaben-Status setzen | `child_name`, `homework_done` (boolean) |
| `school_grades.set_preparation_done` | Vorbereitungs-Status setzen | `child_name`, `preparation_done` (boolean) |
| `school_grades.toggle_prepared_subject` | Schulfach-Vorbereitung umschalten | `child_name`, `subject` |
| `school_grades.set_calendar` | Kalender zuweisen | `child_name`, `calendar_entity` |
| `school_grades.update_timetable_cell` | Stundenplan-Zelle bearbeiten | `child_name`, `slot_id`, `day`, `subject`, `room`, `teacher` |
| `school_grades.import_timetable` | Stundenplan per YAML importieren | `child_name`, `yaml_content` |
| `school_grades.update_settings` | Land, Klasse & Einstellungen aktualisieren | `child_name`, `country`, `grade_level`, `calendar_entity`, `show_prep_card`, ... |

### 🤖 Automatischer Stundenplan-Import per KI (Prompt-Vorlage)

Hast du den Stundenplan deines Kindes als **PDF, Bild oder Foto** vorliegen? Du kannst ihn mit einer KI (z. B. **ChatGPT**, **Claude** oder **Gemini**) in wenigen Sekunden automatisch in das passende YAML-Format umwandeln lassen!

#### 💡 Workflow:
1. Kopiere die untenstehende **KI Prompt-Vorlage**.
2. Lade dein Stundenplan-Foto oder ein PDF zusammen mit dem Prompt in ChatGPT, Claude oder Gemini hoch.
3. Kopiere den von der KI generierten YAML-Code.
4. Klicke im Schulnoten-Panel im Bereich Stundenplan auf **`📋 YAML Import / Export`** und füge den Code ein. Fertig!

> 📄 **Beispiel-Vorlage im Repository**: [example_timetable.yaml](file:///example_timetable.yaml)

#### 📋 KI Prompt-Vorlage (zum Kopieren):

```text
Du bist ein Assistent zur Datenstrukturierung. Analysiere das angehängte Bild / PDF meines Schulstundenplans und erstelle eine valide YAML-Datei für meine Home Assistant Schulnoten-Integration im exakt folgenden Format.

Gib AUSSCHLIESSLICH den fertigen YAML-Codeblock aus, keine Einleitungen oder Erklärungen.

YAML-Format-Vorlage:
slots:
  - id: slot_1
    type: lesson
    label: "1. Stunde"
    start: "08:00"
    end: "08:45"
  - id: slot_2
    type: lesson
    label: "2. Stunde"
    start: "08:45"
    end: "09:30"
  - id: break_1
    type: break
    label: "1. Pause"
    start: "09:30"
    end: "09:45"

schedule:
  slot_1:
    monday:
      subject: "Mathematik"
      room: "R101"
      teacher: "Fr. Müller"
    tuesday:
      subject: "Deutsch"
      room: "R205"
      teacher: "Hr. Weber"

Regeln:
1. Nutze als Wochentags-Schlüssel exakt: monday, tuesday, wednesday, thursday, friday.
2. Wenn ein Fach keine Raum- oder Lehrerangabe hat, lasse room und teacher weg.
3. Pausen (type: break) benötigen keinen Eintrag unter schedule.
```

### 🔔 Binary Sensoren für Sprachansagen & Benachrichtigungen

Die Integration erstellt für jedes Kind automatisch folgende Binary Sensoren:
- `binary_sensor.<kind_name>_anstehende_termine_morgen`
- `binary_sensor.<kind_name>_hausaufgaben_erledigt`
- `binary_sensor.<kind_name>_vorbereitung_erledigt`: Schaltet automatisch auf `on`, sobald alle Schulfächer für den nächsten Schultag als vorbereitet angeklickt wurden (oder programmatisch per Service). Stellt nützliche Attribute wie `missing_subjects`, `needed_subjects` und `target_school_day` für Automationen bereit.
- `binary_sensor.<kind_name>_schulzeit`: Steht auf `on` (`true`), solange sich das Kind aktuell in einer regulären Unterrichtsstunde befindet. Wechselt auf `off` (`false`) bei Pausen, Freistunden, vor der Schule, nach Schulende sowie am Wochenende. Bietet viele Attribute wie `current_subject`, `current_room`, `current_teacher`, `current_slot`, `current_slot_start`, `current_slot_end`, `is_break`, `is_free_period`, `school_finished`, `next_subject`, `next_slot_start` u.v.m.

#### 🤖 Beispiel-Automatisierungen

##### 1. Internet-Sperre & Benachrichtigung bei unerledigter Schultaschen-Vorbereitung

Sperrt um 17:00 Uhr das WLAN/Internet der Spielekonsole oder des Kinder-Handys und sendet eine Erinnerung mit den noch fehlenden Fächern, bis der Binary Sensor `binary_sensor.richard_vorbereitung_erledigt` auf `on` steht:

```yaml
alias: "Schulnoten - Internet-Sperre bei unerledigter Schultaschen-Vorbereitung"
trigger:
  - platform: time
    at: "17:00:00"
condition:
  - condition: state
    entity_id: binary_sensor.richard_vorbereitung_erledigt
    state: "off"
action:
  - service: switch.turn_off
    target:
      entity_id: switch.kinder_internet_zugang
  - service: notify.mobile_app_richard
    data:
      title: "🎒 Schultasche vorbereiten!"
      message: >-
        Dein Internet wurde gesperrt. Bitte packe deine Schultasche für morgen und hake die Fächer ab!
        {% set missing = state_attr('binary_sensor.richard_vorbereitung_erledigt', 'missing_subjects') %}
        {% if missing %}
        Noch fehlend: {{ missing | join(', ') }}
        {% endif %}
```

Automatisches Freischalten & Lob, sobald alle Fächer im Panel abgehakt wurden:

```yaml
alias: "Schulnoten - Internet wieder freigeben"
trigger:
  - platform: state
    entity_id: binary_sensor.richard_vorbereitung_erledigt
    to: "on"
action:
  - service: switch.turn_on
    target:
      entity_id: switch.kinder_internet_zugang
  - service: notify.mobile_app_richard
    data:
      title: "✅ Super gemacht!"
      message: "Alle Fächer sind vorbereitet. Das Internet wurde wieder freigeschaltet."
```

Programmatisches Setzen per Home Assistant Service (z. B. für Sprachassistenten oder Schalter):

```yaml
service: school_grades.set_preparation_done
data:
  child_name: "Richard"
  preparation_done: true
```

##### 2. Benachrichtigungs-Erinnerung für Hausaufgaben & Klausuren

```yaml
alias: "Schulnoten - Abendliche Erinnerung an unerledigte Hausaufgaben"
trigger:
  - platform: time
    at: "18:30:00"
condition:
  - condition: state
    entity_id: binary_sensor.richard_hausaufgaben_erledigt
    state: "off"
action:
  - service: notify.mobile_app_richard
    data:
      title: "📝 Hausaufgaben-Erinnerung"
      message: "Du hast deine Hausaufgaben für heute noch nicht als erledigt markiert!"
```

##### 3. Smartphone-Einschränkung während der Schulzeit (z. B. mit Google Family Link)

Sperrt während des Unterrichts das Smartphone (oder aktiviert den Schulmodus) und gibt es in Pausen oder nach Schulschluss automatisch wieder frei:

```yaml
alias: "Schulnoten - Smartphone während der Unterrichtszeit sperren"
trigger:
  - platform: state
    entity_id: binary_sensor.richard_schulzeit
action:
  - choose:
      - conditions:
          - condition: state
            entity_id: binary_sensor.richard_schulzeit
            state: "on"
        sequence:
          # Beispiel Google Family Link Sperre / Fokusmodus
          - service: switch.turn_on
            target:
              entity_id: switch.richard_handy_schulmodus_oder_family_link_sperre
          - service: notify.mobile_app_richard
            data:
              title: "🏫 Unterrichtszeit"
              message: "Unterricht ({{ state_attr('binary_sensor.richard_schulzeit', 'current_subject') }}) läuft. Das Handy ist stummgeschaltet."
      - conditions:
          - condition: state
            entity_id: binary_sensor.richard_schulzeit
            state: "off"
        sequence:
          # Freigabe in Pause oder nach Schulende
          - service: switch.turn_off
            target:
              entity_id: switch.richard_handy_schulmodus_oder_family_link_sperre
```

---

## 🇬🇧 English

A modern, comprehensive Home Assistant Custom Integration for easily managing school grades, exam calendars, next-day preparations, and interactive weekly timetables for your children.

With the **built-in Sidebar Panel** (`/schulnoten`), you can manage grades, subjects, exam dates, homework status, preparations, and timetables conveniently in one central location — completely without dashboard YAML cards!

### 🌟 Features

- 📱 **Central Custom Sidebar Panel (`🎓 Schulnoten`)**:
  - Automatically appears in Home Assistant's left navigation sidebar.
  - Complete management of children, grades, subjects, calendars & timetables directly inside the interface.
- 👨‍👩‍👧‍👦 **Multi-Child Management**: Create as many child instances as needed (e.g. Richard, Max, Emma) and switch between them via tab buttons (including class/grade display e.g. `👤 Richard (5a)`).
- 🎒 **Preparation for Next School Day & Interactive Check-off Mode**:
  - Clear overview of subjects scheduled for the next school day.
  - Click any subject card to highlight it with a green border and mark it as prepared.
  - **Overall Status Binary Sensor (`binary_sensor.<child>_preparation_done`)**: Automatically turns `on` when all subjects for tomorrow are checked off as prepared.
- 📝 **Homework Status (`binary_sensor.<child>_homework_done`)**:
  - Interactive status button in the banner with a green border when completed.
  - Automatically resets to `off` at the start of each school day morning.
- 📅 **Weekly Timetable Matrix**:
  - Clear timetable from Monday to Friday including lesson periods & breaks.
  - **Day Highlighting**: Automatically highlights current day in header and columns (`TODAY`).
  - **Live Class Indicator (`⚡ NOW`)**: Marks the currently active lesson period in real time.
  - **Visual Cell Editor**: Click any cell to edit subject, room number (📍), and teacher (👨‍🏫). Custom subjects can be created directly within the dialog.
  - **YAML Import & Export**: Import or export timetables conveniently in YAML format.
- 📆 **Exams & Events Calendar**:
  - Link any Home Assistant calendar (e.g. Google Calendar, CalDAV, Local HA Calendar).
  - Overview of upcoming exams with countdown badges (`⚡ TODAY`, `⚠️ Tomorrow`, `In X days`) and **urgency color-coding** (Red ≤ 1 day, Orange 2-3 days, Yellow 4-7 days).
- 📘 **Subject & Grade Management**:
  - **Collapsible Grade Form (`➕ Record New Grade`)**: Hidden by default for a clean UI; can be expanded on demand via an action button.
  - Record grades (1.0 to 6.0) with configurable weights (1x, 2x, 3x, 4x).
  - Automatic calculation of weighted subject average and overall GPA.
  - Grade history with date, label (e.g., *1st Exam*), and deletion option.
- ⚙️ **3-Tab Settings Modal (`⚙️ General`, `📘 Manage Subjects` & `📅 Timetable`)**:
  - **General**: Customize country-specific grading systems (🇩🇪, 🇦🇹, 🇨🇭, 🇫🇷, 🇮🇹, 🇪🇸, 🇳🇱, 🇵🇱, 🇬🇧, 🇺🇸, 🇷🇺, 🇨🇳), class level (e.g. `5a`), calendar selection, and section visibilities.
  - **Manage Subjects**: Easily add new subjects or delete existing ones.
  - **Timetable**: Direct YAML import/export.
- 🌐 **Multi-Language Support (i18n)**:
  - Complete native localization for all supported country standards: **German 🇩🇪**, **English 🇬🇧/🇺🇸**, **French 🇫🇷**, **Italian 🇮🇹**, **Spanish 🇪🇸**, **Dutch 🇳🇱**, **Polish 🇵🇱**, **Russian 🇷🇺**, and **Chinese 🇨🇳**.
  - Automatically adapts to the active Home Assistant user language (including UI panel, sensor TTS announcements, and service descriptions).

### 📦 Installation via HACS (Custom Repository)

1. Open **HACS** in Home Assistant.
2. Click the **three dots** `⋮` in the top right corner and select **Custom repositories**.
3. Enter repository URL: `https://github.com/vitals5/ha-school-grades`.
4. Select category **Integration**.
5. Click **Add**.
6. Search for **Schulnoten** in HACS, click **Download**, and restart Home Assistant.

### ⚙️ Setup

1. Navigate to **Settings** ➔ **Devices & Services** ➔ **Add Integration**.
2. Search for **Schulnoten**.
3. Enter the **child's name** (e.g., `Richard`).
4. After saving, the icon **🎓 Schulnoten** will automatically appear in your left sidebar.

### ⚡ Home Assistant Actions / Services

The integration provides the following actions (services) for automations and scripts:

| Action | Description | Parameters |
| :--- | :--- | :--- |
| `school_grades.add_grade` | Add grade | `child_name`, `subject`, `grade`, `weight`, `name`, `date` |
| `school_grades.remove_grade` | Delete grade | `child_name`, `subject`, `grade_id` |
| `school_grades.add_subject` | Add school subject | `child_name`, `subject` |
| `school_grades.remove_subject` | Delete subject | `child_name`, `subject` |
| `school_grades.set_homework_done` | Set homework status | `child_name`, `homework_done` (boolean) |
| `school_grades.set_preparation_done` | Set preparation status | `child_name`, `preparation_done` (boolean) |
| `school_grades.toggle_prepared_subject` | Toggle subject preparation | `child_name`, `subject` |
| `school_grades.set_calendar` | Assign calendar | `child_name`, `calendar_entity` |
| `school_grades.update_timetable_cell` | Edit timetable slot | `child_name`, `slot_id`, `day`, `subject`, `room`, `teacher` |
| `school_grades.import_timetable` | Import timetable via YAML | `child_name`, `yaml_content` |
| `school_grades.update_settings` | Update settings & grade level | `child_name`, `country`, `grade_level`, `calendar_entity`, ... |

### 🤖 Automatic Timetable Import via AI (Prompt Template)

Do you have your child's timetable as a **PDF, photo, or image**? You can use an AI (e.g., **ChatGPT**, **Claude**, or **Gemini**) to convert it into the required YAML format within seconds!

#### 💡 Workflow:
1. Copy the **AI Prompt Template** below.
2. Upload a picture or PDF of the timetable together with the prompt into ChatGPT, Claude, or Gemini.
3. Copy the resulting YAML code snippet.
4. In the Schulnoten sidebar panel, click **`📋 YAML Import / Export`** on the timetable card, paste the YAML, and click Import. Done!

> 📄 **Example template file in repository**: [example_timetable.yaml](file:///example_timetable.yaml)

#### 📋 AI Prompt Template (Ready to Copy):

```text
You are a data structuring assistant. Analyze the attached image / PDF of my school timetable and generate a valid YAML configuration for my Home Assistant School Grades integration in the exact format shown below.

Output ONLY the final YAML code block without any surrounding text or explanations.

YAML Format Template:
slots:
  - id: slot_1
    type: lesson
    label: "1st Period"
    start: "08:00"
    end: "08:45"
  - id: break_1
    type: break
    label: "Break"
    start: "09:30"
    end: "09:45"

schedule:
  slot_1:
    monday:
      subject: "Mathematics"
      room: "R101"
      teacher: "Mrs. Smith"
    tuesday:
      subject: "English"
      room: "R205"
      teacher: "Mr. Jones"

Rules:
1. Use exact weekday keys: monday, tuesday, wednesday, thursday, friday.
2. Omit room or teacher keys if not specified in the source document.
3. Break slots (type: break) do not require an entry under schedule.
```

### 🔔 Binary Sensors for Voice Announcements & Notifications

The integration automatically creates binary sensors for each child:
- `binary_sensor.<child_name>_upcoming_events_tomorrow` / `binary_sensor.<kind_name>_anstehende_termine_morgen`
- `binary_sensor.<child_name>_homework_done` / `binary_sensor.<kind_name>_hausaufgaben_erledigt`
- `binary_sensor.<kind_name>_vorbereitung_erledigt`: Automatically switches to `on` once all subjects scheduled for the next school day have been checked off in the panel (or programmatically via service). Provides useful attributes like `missing_subjects`, `needed_subjects`, and `target_school_day` for automations.
- `binary_sensor.<kind_name>_schulzeit`: Stays `on` (`true`) as long as the child is currently in an active school lesson period. Switches to `off` (`false`) during breaks, free periods, before school, after school ends, and on weekends. Exposes rich attributes like `current_subject`, `current_room`, `current_teacher`, `current_slot`, `current_slot_start`, `current_slot_end`, `is_break`, `is_free_period`, `school_finished`, `next_subject`, `next_slot_start`, and more.

#### 🤖 Example Automations

##### 1. Activate Internet Block & Notification Until School Bag Preparation Is Completed

Blocks internet access at 17:00 and sends a reminder with the still missing subjects until `binary_sensor.richard_vorbereitung_erledigt` is `on`:

```yaml
alias: "School Grades - Internet Block on Unprepared School Bag"
trigger:
  - platform: time
    at: "17:00:00"
condition:
  - condition: state
    entity_id: binary_sensor.richard_vorbereitung_erledigt
    state: "off"
action:
  - service: switch.turn_off
    target:
      entity_id: switch.kids_internet_access
  - service: notify.mobile_app_richard
    data:
      title: "🎒 Prepare School Bag!"
      message: >-
        Your internet access has been paused. Please pack your school bag for tomorrow and check off your subjects!
        {% set missing = state_attr('binary_sensor.richard_vorbereitung_erledigt', 'missing_subjects') %}
        {% if missing %}
        Still missing: {{ missing | join(', ') }}
        {% endif %}
```

Unblocks internet automatically and praises the child as soon as all subjects are checked off:

```yaml
alias: "School Grades - Unblock Internet Access"
trigger:
  - platform: state
    entity_id: binary_sensor.richard_vorbereitung_erledigt
    to: "on"
action:
  - service: switch.turn_on
    target:
      entity_id: switch.kids_internet_access
  - service: notify.mobile_app_richard
    data:
      title: "✅ Great Job!"
      message: "All subjects are prepared. Internet access has been restored."
```

Programmatic update via Home Assistant Service (e.g. for voice assistants or smart buttons):

```yaml
service: school_grades.set_preparation_done
data:
  child_name: "Richard"
  preparation_done: true
```

##### 2. Notification Reminder for Unfinished Homework

```yaml
alias: "School Grades - Evening Homework Reminder"
trigger:
  - platform: time
    at: "18:30:00"
condition:
  - condition: state
    entity_id: binary_sensor.richard_homework_done
    state: "off"
action:
  - service: notify.mobile_app_richard
    data:
      title: "📝 Homework Reminder"
      message: "You haven't marked your homework as completed today yet!"
```

##### 3. Restrict Smartphone Usage During School Lessons (e.g. Google Family Link / Focus Mode)

Locks the child's smartphone during active lessons and automatically restores access during breaks or after school:

```yaml
alias: "School Grades - Lock Phone During School Lessons"
trigger:
  - platform: state
    entity_id: binary_sensor.richard_schulzeit
action:
  - choose:
      - conditions:
          - condition: state
            entity_id: binary_sensor.richard_schulzeit
            state: "on"
        sequence:
          # Enable Google Family Link lock / School Focus mode
          - service: switch.turn_on
            target:
              entity_id: switch.richard_phone_school_mode_or_family_link_lock
          - service: notify.mobile_app_richard
            data:
              title: "🏫 School Time"
              message: "Class ({{ state_attr('binary_sensor.richard_schulzeit', 'current_subject') }}) is in session. Phone is muted."
      - conditions:
          - condition: state
            entity_id: binary_sensor.richard_schulzeit
            state: "off"
        sequence:
          # Restore access during recess/breaks or after school ends
          - service: switch.turn_off
            target:
              entity_id: switch.richard_phone_school_mode_or_family_link_lock
```

---

## 📄 License / Lizenz

This project is licensed under the [MIT License](LICENSE).
