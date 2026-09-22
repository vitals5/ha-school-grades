# 🎓 Schulnoten & Stundenplan - Home Assistant Integration (HACS)

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
  - Vollständige Unterstützung für **Deutsch 🇩🇪** und **Englisch 🇬🇧**.

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

---

### 🤖 Beispiel-Automatisierungen

#### 1. Internet-Sperre aktivieren, bis die Schultaschen-Vorbereitung erledigt ist

Sperrt um 17:00 Uhr das WLAN/Internet der Spielekonsole oder des Kinder-Handys, bis der Binary Sensor `binary_sensor.richard_vorbereitung_erledigt` auf `on` steht:

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
      message: "Dein Internet wurde gesperrt. Bitte packe deine Schultasche für morgen und hake die Fächer ab!"
```

Automatisches Freischalten, sobald alle Fächer abgehakt wurden:

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

#### 2. Benachrichtigungs-Erinnerung für Hausaufgaben & Klausuren

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

---

## 🇬🇧 English

A modern, feature-rich Home Assistant Custom Integration for easy management of school grades, exam calendars, next-day preparations, and interactive weekly timetables for your children.

### ⚡ Home Assistant Actions / Services

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

---

## 📄 License / Lizenz

This project is licensed under the [MIT License](LICENSE).
