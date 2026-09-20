# 🎓 Schulnoten & Stundenplan - Home Assistant Integration (HACS)

Eine moderne, umfassende Home Assistant Custom Integration zur einfachen Verwaltung von Schulnoten, Klausuren-Kalendern und interaktiven Wochenstundenplänen für deine Kinder.

Mit dem **integrierten Sidebar-Panel** (`/schulnoten`) verwaltest du Noten, Fächer, Klausurtermine und Stundenpläne bequem an einem zentralen Ort – komplett ohne Dashboard-YAML-Cards!

---

## 🌟 Features

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
  - Fächer dynamisch anlegen und löschen.
  - Eintragen von Noten (1.0 bis 6.0) mit frei wählbarer Gewichtung (1-fach, 2-fach, 3-fach, 4-fach).
  - Automatische Errechnung des gewichteten Fachdurchschnitts sowie des Gesamtdurchschnitts.
  - Notenhistorie mit Datum, Bezeichnung (z. B. *1. Schulaufgabe*) und Löschoption.
- 🌐 **Mehrsprachigkeit (Multi-Language i18n)**:
  - Vollständige Unterstützung für **Deutsch 🇩🇪** und **Englisch 🇬🇧**.
  - Die Benutzeroberfläche und Servicetexte passen sich automatisch der gewählten Sprache in den Home Assistant Benutzereinstellungen an.

---

## 📦 Installation über HACS (Custom Repository)

1. Öffne **HACS** in deinem Home Assistant.
2. Klicke oben rechts auf die **drei Punkte** `⋮` und wähle **Benutzerdefinierte Repositories** (*Custom repositories*).
3. Gib die URL ein: `https://github.com/vitals5/ha-school-grades`.
4. Wähle als Kategorie **Integration**.
5. Klicke auf **Hinzufügen**.
6. Suche nach **Schulnoten** in HACS, klicke auf **Herunterladen** und starte Home Assistant neu.

---

## ⚙️ Einrichtung

1. Gehe zu **Einstellungen** ➔ **Geräte & Dienste** ➔ **Integration hinzufügen**.
2. Suche nach **Schulnoten**.
3. Gib den **Namen des Kindes** ein (z. B. `Richard`).
4. Nach dem Speichern erscheint in der linken Navigationsleiste automatisch das Icon **🎓 Schulnoten**.

---

## ⚡ Home Assistant Aktionen / Services

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

---

## 🔔 Binary Sensor für Sprachansagen & Benachrichtigungen

Die Integration erstellt für jedes Kind automatisch einen Binary Sensor: `binary_sensor.<kind_name>_anstehende_termine_morgen`.

### 💡 Funktionsweise & Attribute
- **Zustand (`state`)**:
  - `on` (EIN): Wenn am nächsten Schultag/Tag mindestens ein Termin oder eine Klausur im verknüpften Kalender steht.
  - `off` (AUS): Wenn **keine** Termine anstehen. Der Sensor bleibt somit AUS, damit Automatisierungen nicht fälschlicherweise auslösen!
- **Verfügbare Attribute**:
  - `event_count`: Anzahl der Termine (z. B. `2`).
  - `event_names`: Liste der Terminbezeichnungen (z. B. `['Mathe Schulaufgabe', 'Physik Test']`).
  - `event_titles`: Barrierefreier Text der Termine (z. B. `"Mathe Schulaufgabe und Physik Test"`).
  - `message`: Vorgefertigter Satz für Sprachausgaben/TTS (z. B. `"Am Montag stehen 2 Termine an: Mathe Schulaufgabe und Physik Test."`).
  - `timetable_subjects`: Liste der Schulfächer des nächsten Schultags laut Stundenplan.

### 🤖 Beispiel-Automatisierung (Sprachansage um 18:00 Uhr)

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

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).
