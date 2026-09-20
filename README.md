# Schulnoten (School Grades) - Home Assistant Integration (HACS)

Eine elegante Home Assistant Custom Integration zur einfachen Verwaltung von Schulnoten. Sie unterstützt mehrere Instanzen (für mehrere Kinder), gewichtete Noten (1-fach, 2-fach, 3-fach, 4-fach etc.) und stellt Sensoren mit der Durchschnittsnote pro Fach sowie dem Gesamtdurchschnitt bereit.

---

## 🌟 Features

- 👨‍👩‍👧‍👦 **Mehrere Kinder (Multi-Instance)**: Jede Instanz steht für ein Kind (z. B. Max, Emma).
- 📚 **Fächerverwaltung**: Fächer können dynamisch hinzugefügt oder gelöscht werden (z. B. Mathematik, Deutsch, Englisch, Physik).
- ⚖️ **Gewichtete Noten**: Unterlaufene Noten können mit Faktoren wie 1-fach, 2-fach, 3-fach, 4-fach gewichtet werden.
- 📊 **Durchschnittssensoren**:
  - Pro Fach ein Sensor mit der gewichteten Durchschnittsnote (z.B. `sensor.max_mathematik_durchschnitt`).
  - Ein Gesamtsensor pro Kind mit dem Gesamtdurchschnitt (z.B. `sensor.max_gesamtdurchschnitt`).
- 📝 **Detaillierte Historie**: Sämtliche Noten inkl. Datum, Beschreibung (z. B. "1. Schulaufgabe", "Ex 2") und Gewichtung werden in den Sensor-Attributen gespeichert und können im Dashboard angezeigt werden.
- ⚙️ **Bequemes Eintragen**: Noten können direkt über die **HA Benutzeroberfläche (Zahnrad/Optionen)** oder über **Home Assistant Aktionen/Services** (z. B. per Dashboard-Buttons oder Automatisierung) hinzugefügt und gelöscht werden.

---

## 📦 Installation über HACS (Custom Repository)

1. Öffne **HACS** in deinem Home Assistant.
2. Klicke oben rechts auf die **drei Punkte** `⋮` und wähle **Benutzerdefinierte Repositories** (*Custom repositories*).
3. Gib die URL deines GitHub-Repositories ein: `https://github.com/vitals5/ha-school-grades`.
4. Wähle als Kategorie **Integration**.
5. Klicke auf **Hinzufügen**.
6. Suche nach **Schulnoten** in HACS, klicke auf **Herunterladen** und starte Home Assistant neu.

---

## 🛠️ Manuelle Installation

Copy code:
1. Lade den Ordner `custom_components/school_grades` herunter.
2. Kopiere den Ordner in das `custom_components` Verzeichnis deiner Home Assistant Installation (`/config/custom_components/school_grades`).
3. Starte Home Assistant neu.

---

## 🚀 Einrichtung in Home Assistant

1. Gehe zu **Einstellungen** ➔ **Geräte & Dienste** ➔ **Integration hinzufügen**.
2. Suche nach **Schulnoten**.
3. Gib den **Namen des Kindes** ein (z.B. `Max`).
4. Klicke auf **Absenden**. Die Integration erstellt automatisch die Basis-Sensoren.

---

## ⚡ Home Assistant Aktionen / Services

Die Integration stellt 4 Aktionen (Services) zur Verfügung:

| Aktion | Beschreibung | Parameter |
| :--- | :--- | :--- |
| `school_grades.add_subject` | Fach hinzufügen | `config_entry_id` / `child_name`, `subject` |
| `school_grades.remove_subject` | Fach löschen | `config_entry_id` / `child_name`, `subject` |
| `school_grades.add_grade` | Note hinzufügen | `config_entry_id` / `child_name`, `subject`, `grade`, `weight`, `name`, `date` |
| `school_grades.remove_grade` | Note löschen | `config_entry_id` / `child_name`, `subject`, `grade_id` |

### Beispiel: Note hinzufügen via Entwicklerwerkzeuge / Action Call
```yaml
action: school_grades.add_grade
data:
  child_name: "Max"
  subject: "Mathematik"
  grade: 2.0
  weight: 2
  name: "1. Schulaufgabe"
  date: "2026-09-15"
```

---

## 🎨 Lovelace Dashboard Beispiele

### 1. Markdown-Karte für eine übersichtliche Notentabelle
Zeigt alle Fächer, den Schnitt sowie die einzelnen Noten im Detail an:

```yaml
type: markdown
title: 🎓 Notenspiegel von Max
content: >
  **Gesamtdurchschnitt:** {{ states('sensor.max_gesamtdurchschnitt') }}

  ---
  {% for entity_id in integration_entities('school_grades') %}
    {% if entity_id.endswith('_gesamtdurchschnitt') == false %}
      ### 📘 {{ state_attr(entity_id, 'subject_name') }}: **{{ states(entity_id) }}**
      | Note | Gewichtung | Datum | Beschreibung |
      | :---: | :---: | :---: | :--- |
      {% for g in state_attr(entity_id, 'grades') %}
      | {{ g.grade }} | {{ g.weight }}-fach | {{ g.date }} | {{ g.name }} |
      {% else %}
      *Noch keine Noten eingetragen*
      {% endfor %}

    {% endif %}
  {% endfor %}
```

### 2. Formular-Button zum schnellen Hinzufügen einer Note
Füge eine Schaltfläche hinzu, um beispielsweise eine Mathematik-Schulaufgabe direkt aus dem Dashboard einzutragen:

```yaml
type: button
name: ➕ Schulaufgabe Mathe (Note 2, 2-fach) eintragen
icon: mdi:plus-circle
tap_action:
  action: call-service
  service: school_grades.add_grade
  target: {}
  data:
    child_name: "Max"
    subject: "Mathematik"
    grade: 2.0
    weight: 2
    name: "Schulaufgabe"
```

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).
