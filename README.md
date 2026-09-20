# 🎓 Schulnoten & Stundenplan - Home Assistant Integration (HACS)

[ 🇩🇪 **Deutsch** ](#-deutsch) | [ 🇬🇧 **English** ](#-english)

---

## 🇩🇪 Deutsch

Eine moderne, umfassende Home Assistant Custom Integration zur einfachen Verwaltung von Schulnoten, Klausuren-Kalendern und interaktiven Wochenstundenplänen für deine Kinder.

Mit dem **integrierten Sidebar-Panel** (`/schulnoten`) verwaltest du Noten, Fächer, Klausurtermine und Stundenpläne bequem an einem zentralen Ort – komplett ohne Dashboard-YAML-Cards!

### 🌟 Features

- 📱 **Zentrales Custom Sidebar-Panel (`🎓 Schulnoten`)**:
  - Erscheint automatisch in der linken Menüleiste von Home Assistant.
  - Komplette Verwaltung von Kindern, Noten, Fächern, Kalendern & Stundenplänen direkt in der Benutzeroberfläche.
- 👨‍👩‍👧‍👦 **Multi-Kind Verwaltung**: Beliebig viele Kinder-Instanzen anlegen (z. B. Richard, Max, Emma) und per Tab-Reiter umschalten.
- 📅 **Wochenstundenplan (Timetable Matrix)**:
  - Übersichtlicher Stundenplan von Montag bis Freitag inkl. Unterrichtsstunden & Pausen.
  - **Tages-Highlighting**: Heutiger Wochentag wird automatisch im Header und in den Spalten hervorgehoben (`HEUTE`).
  - **Live-Unterrichtsanzeige (`⚡ JETZT`)**: Markiert die aktuell laufende Unterrichtsstunde in Echtzeit.
  - **Visueller Cell-Editor**: Klick auf eine Zelle zum Bearbeiten von Fach, Raumnummer (📍) und Lehrkraft (👨‍🏫).
  - **YAML Import & Export**: Stundenpläne bequem im YAML-Format importieren oder exportieren.
- 📆 **Klausuren- & Termine-Kalender**:
  - Verknüpfung mit jedem beliebigen Home Assistant Kalender (z. B. Google Kalender, CalDAV, lokaler Kalender).
  - Übersicht anstehender Klausuren mit Countdown-Badges (`⚡ HEUTE`, `⚠️ Morgen`, `In X Tagen`).
- 📘 **Fächer- & Notenverwaltung**:
  - **Einklappbares Noten-Formular (`➕ Neue Note eintragen`)**: Standardmäßig ausgeblendet für ein aufgeräumtes Dashboard; lässt sich per Action-Button direkt über der Notenübersicht aufklappen und klappt nach dem Eintragen automatisch wieder zu.
  - Eintragen von Noten (1.0 bis 6.0) mit frei wählbarer Gewichtung (1-fach, 2-fach, 3-fach, 4-fach).
  - Automatische Errechnung des gewichteten Fachdurchschnitts sowie des Gesamtdurchschnitts.
  - Notenhistorie mit Datum, Bezeichnung (z. B. *1. Schulaufgabe*) und Löschoption.
- ⚙️ **Einstellungen-Modal mit Tabs (`⚙️ Allgemein` & `📘 Fächer verwalten`)**:
  - **Allgemein**: Anpassung der länderspezifischen Schulsysteme (🇩🇪, 🇦🇹, 🇨🇭, 🇫🇷, 🇮🇹, 🇪🇸, 🇳🇱, 🇵🇱, 🇬🇧, 🇺🇸, 🇷🇺, 🇨🇳) sowie individuelles Aus- und Einblenden aller 4 Dashboard-Bereiche.
  - **Fächer verwalten**: Bequemes Anlegen neuer Schulfächer sowie Löschen bestehender Fächer zentral im Einstellungen-Dialog.


- 🌐 **Mehrsprachigkeit (Multi-Language i18n)**:
  - Vollständige Unterstützung für **Deutsch 🇩🇪** und **Englisch 🇬🇧**.
  - Die Benutzeroberfläche und Servicetexte passen sich automatisch der gewählten Sprache in den Home Assistant Benutzereinstellungen an.

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
| `school_grades.set_calendar` | Kalender zuweisen | `child_name`, `calendar_entity` |
| `school_grades.update_timetable_cell` | Stundenplan-Zelle bearbeiten | `child_name`, `slot_id`, `day`, `subject`, `room`, `teacher` |
| `school_grades.import_timetable` | Stundenplan per YAML importieren | `child_name`, `yaml_content` |
| `school_grades.update_settings` | Land & Einstellungen aktualisieren | `child_name`, `country`, `calendar_entity`, `show_prep_card`, `show_calendar_card`, `show_timetable_card`, `show_overview_card` |

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
    wednesday:
      subject: "Englisch"
      room: "R102"
      teacher: "Fr. Smith"
    thursday:
      subject: "Physik"
      room: "R301"
      teacher: "Dr. Einstein"
    friday:
      subject: "Geschichte"
      room: "R104"
      teacher: "Hr. Fischer"

Regeln:
1. Nutze als Wochentags-Schlüssel exakt: monday, tuesday, wednesday, thursday, friday.
2. Wenn ein Fach keine Raum- oder Lehrerangabe hat, lasse room und teacher weg.
3. Pausen (type: break) benötigen keinen Eintrag unter schedule.
```


### 🔔 Binary Sensor für Sprachansagen & Benachrichtigungen

Die Integration erstellt für jedes Kind automatisch einen Binary Sensor: `binary_sensor.<kind_name>_anstehende_termine_morgen`.

#### 💡 Funktionsweise & Attribute
- **Zustand (`state`)**:
  - `on` (EIN): Wenn am nächsten Schultag/Tag mindestens ein Termin oder eine Klausur im verknüpften Kalender steht.
  - `off` (AUS): Wenn **keine** Termine anstehen. Der Sensor bleibt somit AUS, damit Automatisierungen nicht fälschlicherweise auslösen!
- **Verfügbare Attribute**:
  - `event_count`: Anzahl der Termine (z. B. `2`).
  - `event_names`: Liste der Terminbezeichnungen (z. B. `['Mathe Schulaufgabe', 'Physik Test']`).
  - `event_titles`: Barrierefreier Text der Termine (z. B. `"Mathe Schulaufgabe und Physik Test"`).
  - `message`: Vorgefertigter Satz für Sprachausgaben/TTS (z. B. `"Am Montag stehen 2 Termine an: Mathe Schulaufgabe und Physik Test."`).
  - `timetable_subjects`: Liste der Schulfächer des nächsten Schultags laut Stundenplan.

#### 🤖 Beispiel-Automatisierung (Sprachansage um 18:00 Uhr)

```yaml
alias: "Schulnoten - Sprachansage für morgige Klausuren"
trigger:
  - platform: time
    at: "18:00:00"
condition:
  - condition: state
    entity_id: binary_sensor.richard_anstehende_termine_morgen
    state: "on"
action:
  - service: tts.speak
    target:
      entity_id: tts.google_en_com
    data:
      media_player_entity_id: media_player.flur_speaker
      message: "{{ state_attr('binary_sensor.richard_anstehende_termine_morgen', 'message') }}"
```

---

## 🇬🇧 English

# 🎓 School Grades & Timetable - Home Assistant Integration (HACS)

A modern, feature-rich Home Assistant Custom Integration for easy management of school grades, exam calendars, and interactive weekly timetables for your children.

With the **built-in Sidebar Panel** (`/schulnoten`), you can manage grades, subjects, exam schedules, and timetables in one central UI — completely without custom dashboard YAML cards!

### 🌟 Features

- 📱 **Central Custom Sidebar Panel (`🎓 Schulnoten`)**:
  - Automatically appears in Home Assistant's left navigation sidebar.
  - Full management of children, grades, subjects, calendars & timetables directly inside the interface.
- 👨‍👩‍👧‍👦 **Multi-Child Support**: Add as many child instances as needed (e.g., Richard, Max, Emma) and switch between them via tabs.
- 📅 **Weekly Timetable Matrix**:
  - Clear timetable from Monday to Friday including lesson slots and breaks.
  - **Day Highlighting**: Automatically highlights current day in header and columns (`TODAY`).
  - **Live Class Indicator (`⚡ NOW`)**: Marks the currently running lesson slot in real time.
  - **Visual Cell Editor**: Click any cell to edit subject, room number (📍), and teacher (👨‍🏫).
  - **YAML Import & Export**: Easily import or export timetables in YAML format.
- 📆 **Exams & Events Calendar**:
  - Link any Home Assistant calendar (e.g. Google Calendar, CalDAV, Local HA Calendar).
  - Overview of upcoming exams with countdown badges (`⚡ TODAY`, `⚠️ Tomorrow`, `In X days`).
- 📘 **Subject & Grade Management**:
  - **Collapsible Grade Form (`➕ Record New Grade`)**: Hidden by default for a clean UI; can be expanded on demand via a modern action button above the overview and auto-collapses upon saving.
  - Record grades (1.0 to 6.0) with configurable weight (1x, 2x, 3x, 4x).
  - Automatic calculation of weighted subject average and overall GPA.
  - Grade history with date, label (e.g., *1st Exam*), and deletion option.
- ⚙️ **Tabbed Settings Modal (`⚙️ General` & `📘 Manage Subjects`)**:
  - **General**: Customize country-specific grading systems (🇩🇪, 🇦🇹, 🇨🇭, 🇫🇷, 🇮🇹, 🇪🇸, 🇳🇱, 🇵🇱, 🇬🇧, 🇺🇸, 🇷🇺, 🇨🇳) and toggle visibility of all 4 panel sections.
  - **Manage Subjects**: Easily add new subjects or remove existing subjects directly within the Settings dialog.


- 🌐 **Multi-Language Support (i18n)**:
  - Full native support for **German 🇩🇪** and **English 🇬🇧**.
  - The UI and service strings adapt automatically to your Home Assistant user language preferences.

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
| `school_grades.set_calendar` | Assign calendar | `child_name`, `calendar_entity` |
| `school_grades.update_timetable_cell` | Edit timetable slot | `child_name`, `slot_id`, `day`, `subject`, `room`, `teacher` |
| `school_grades.import_timetable` | Import timetable via YAML | `child_name`, `yaml_content` |
| `school_grades.update_settings` | Update country & settings | `child_name`, `country`, `calendar_entity`, `show_prep_card`, `show_calendar_card`, `show_timetable_card`, `show_overview_card` |

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


### 🔔 Binary Sensor for Voice Announcements & Notifications

The integration automatically creates a binary sensor for each child: `binary_sensor.<child_name>_anstehende_termine_morgen`.

#### 💡 Behavior & Attributes
- **State**:
  - `on`: When there is at least one exam or event in the linked calendar for the next day/school day.
  - `off`: When **no** events are scheduled. Remains `off` so automations won't trigger unnecessarily!
- **Available Attributes**:
  - `event_count`: Number of events (e.g. `2`).
  - `event_names`: List of event titles (e.g. `['Math Exam', 'Physics Quiz']`).
  - `event_titles`: Formatted titles string (e.g. `"Math Exam and Physics Quiz"`).
  - `message`: Pre-formatted voice/TTS sentence (e.g. `"Tomorrow there are 2 upcoming events: Math Exam and Physics Quiz."`).
  - `timetable_subjects`: Scheduled subjects for next school day from timetable.

#### 🤖 Example Automation (Voice Announcement at 18:00)

```yaml
alias: "School Grades - Evening Voice Reminder for Tomorrow's Exams"
trigger:
  - platform: time
    at: "18:00:00"
condition:
  - condition: state
    entity_id: binary_sensor.richard_anstehende_termine_morgen
    state: "on"
action:
  - service: tts.speak
    target:
      entity_id: tts.google_en_com
    data:
      media_player_entity_id: media_player.hallway_speaker
      message: "{{ state_attr('binary_sensor.richard_anstehende_termine_morgen', 'message') }}"
```

---

## 📄 License / Lizenz

This project is licensed under the [MIT License](LICENSE).
