/**
 * Schulnoten Custom Sidebar Panel for Home Assistant
 */

const DAYS = [
  { key: 'monday', label: 'Montag', short: 'Mo' },
  { key: 'tuesday', label: 'Dienstag', short: 'Di' },
  { key: 'wednesday', label: 'Mittwoch', short: 'Mi' },
  { key: 'thursday', label: 'Donnerstag', short: 'Do' },
  { key: 'friday', label: 'Freitag', short: 'Fr' },
];

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
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!oldHass || this._hasGradesDataChanged(oldHass, hass)) {
      this._fetchUpcomingCalendarEvents();
      this.render();
    }
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
          calendarEntity: null,
          timetable: null,
          subjects: {},
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
      } else if (attrs.subjects_summary) {
        children[kindName].totalAverage = stateObj.state;
        if (attrs.calendar_entity) {
          children[kindName].calendarEntity = attrs.calendar_entity;
        }
        if (attrs.timetable) {
          children[kindName].timetable = attrs.timetable;
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
      try {
        // Try HA REST API for calendars first (fetches all upcoming events in date range)
        rawEvents = await this._hass.callApi(
          'GET',
          `calendars/${calEntity}?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`
        );
      } catch (err1) {
        try {
          // WS fallback 1
          const res = await this._hass.callWS({
            type: 'calendar/event/list',
            entity_id: calEntity,
            start_date_time: startIso,
            end_date_time: endIso,
          });
          rawEvents = res ? (res.events || res) : [];
        } catch (err2) {
          try {
            // WS fallback 2
            const res = await this._hass.callWS({
              type: 'calendar/event/list',
              entity_id: calEntity,
              start_time: startIso,
              end_time: endIso,
            });
            rawEvents = res ? (res.events || res) : [];
          } catch (err3) {
            console.warn('SchoolGrades: Could not fetch calendar events via API or WS', err3);
            rawEvents = [];
          }
        }
      }

      if (!Array.isArray(rawEvents)) {
        if (rawEvents && Array.isArray(rawEvents.events)) {
          rawEvents = rawEvents.events;
        } else {
          rawEvents = [];
        }
      }

      // Format & normalize all events
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

        return {
          summary: evt.summary || evt.title || evt.message || 'Termin',
          start: startVal,
          end: endVal,
          description: evt.description || '',
          location: evt.location || '',
        };
      }).filter(evt => evt.start);

      // Sort chronologically by start date
      parsedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      this._calendarEvents[childName] = parsedEvents;
    }

    this.render();
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
          <div class="card empty-card">
            <h2>🎓 Schulnoten & Stundenplan Verwaltung</h2>
            <p>Es wurden noch keine Kinder-Instanzen in Home Assistant konfiguriert.</p>
            <p>Bitte gehe zu <b>Einstellungen ➔ Geräte & Dienste ➔ Integration hinzufügen ➔ Schulnoten</b>.</p>
          </div>
        </div>
      `;
      return;
    }

    if (!this._selectedChild || !data[this._selectedChild]) {
      this._selectedChild = childNames[0];
    }

    const currentChild = data[this._selectedChild];
    const subjects = currentChild ? currentChild.subjects : {};
    const subjectList = Object.keys(subjects).sort();
    const upcomingEvents = this._calendarEvents[this._selectedChild] || [];
    const timetable = (currentChild && currentChild.timetable) ? currentChild.timetable : DEFAULT_TIMETABLE;
    const slots = timetable.slots || DEFAULT_TIMETABLE.slots;
    const schedule = timetable.schedule || {};

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="container">
        <!-- Header & Child Selector -->
        <header class="header">
          <div class="title-section">
            <h1>🎓 Schulnoten & Stundenplan</h1>
            <p class="subtitle">Notenübersicht, Klausurenkalender & Stundenplan für deine Kinder</p>
          </div>
          <div class="child-tabs">
            ${childNames.map(name => `
              <button class="tab-btn ${name === this._selectedChild ? 'active' : ''}" data-child="${name}">
                👤 ${name}
              </button>
            `).join('')}
          </div>
        </header>

        <!-- Summary Banner -->
        <div class="summary-banner">
          <div class="stat-card primary">
            <span class="stat-label">Gesamtdurchschnitt</span>
            <span class="stat-value">${currentChild && currentChild.totalAverage && !isNaN(currentChild.totalAverage) ? currentChild.totalAverage : '–'}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Fächer</span>
            <span class="stat-value">${subjectList.length}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Gesamte Noten</span>
            <span class="stat-value">${Object.values(subjects).reduce((acc, s) => acc + s.grades.length, 0)}</span>
          </div>
        </div>

        <!-- Upcoming Calendar Events Card -->
        <div class="card calendar-card" style="margin-bottom: 24px;">
          <div class="calendar-header">
            <h3>📅 Anstehende Klausuren & Termine (${upcomingEvents.length})</h3>
            <div class="calendar-select-group">
              <label>Kalender für ${this._selectedChild}:</label>
              <select id="calendar-select">
                <option value="">-- Kein Kalender zugewiesen --</option>
                ${availableCalendars.map(c => `
                  <option value="${c.entityId}" ${currentChild && currentChild.calendarEntity === c.entityId ? 'selected' : ''}>
                    📅 ${c.name} (${c.entityId})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="events-list">
            ${!currentChild || !currentChild.calendarEntity ? `
              <div class="empty-events">
                💡 Wähle oben einen Schul-Kalender (z. B. Google Kalender, Local HA Calendar, CalDAV), um anstehende Klausuren und Termine einzublenden.
              </div>
            ` : upcomingEvents.length === 0 ? `
              <div class="empty-events">
                🎉 Keine anstehenden Klausuren oder Termine im Kalender eingetragen!
              </div>
            ` : `
              <div class="events-grid">
                ${upcomingEvents.map(evt => {
                  const startDate = new Date(evt.start);
                  const formattedDate = startDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
                  const formattedTime = startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                  const isAllDay = (typeof evt.start === 'string' && evt.start.length === 10) || formattedTime === '00:00';
                  const countdownText = this._getCountdownBadge(startDate);
                  return `
                    <div class="event-item">
                      <div class="event-badge-row">
                        <span class="event-countdown ${countdownText.cls}">${countdownText.text}</span>
                        <span class="event-time">${formattedDate} ${!isAllDay ? 'um ' + formattedTime + ' Uhr' : '(Ganztägig)'}</span>
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

        <!-- Timetable Card -->
        <div class="card timetable-card" style="margin-bottom: 24px;">
          <div class="timetable-header">
            <div class="title-with-badge">
              <h3>📅 Wochenstundenplan</h3>
              <span class="timetable-subtitle">Klicke auf eine Zelle zum Bearbeiten oder nutze den YAML Import/Export</span>
            </div>
            <div class="timetable-header-actions">
              <button class="pill-btn yaml-btn" id="open-yaml-modal-btn">📋 YAML Import / Export</button>
              <div class="timetable-legend">
                <span class="legend-item"><span class="legend-dot now-dot"></span>⚡ JETZT</span>
                <span class="legend-item"><span class="legend-dot today-dot"></span>Heute</span>
              </div>
            </div>
          </div>

          <div class="timetable-table-container">
            <table class="timetable-table">
              <thead>
                <tr>
                  <th class="time-col">Zeit / Stunde</th>
                  ${DAYS.map(d => `
                    <th class="day-col ${this._isToday(d.key) ? 'today-header' : ''}">
                      ${d.label}
                      ${this._isToday(d.key) ? '<span class="today-badge">HEUTE</span>' : ''}
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
                          Pause
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
                              data-day-label="${d.label}"
                              data-subject="${cellData.subject || ''}"
                              data-room="${cellData.room || ''}"
                              data-teacher="${cellData.teacher || ''}">
                            ${isNow ? '<div class="now-badge">⚡ JETZT</div>' : ''}
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

        <!-- Action Cards Grid -->
        <div class="forms-grid">
          <!-- Add Grade Card -->
          <div class="card form-card">
            <h3>➕ Neue Note eintragen</h3>
            <form id="add-grade-form">
              <div class="form-group">
                <label>Schulfach</label>
                <select id="grade-subject" required>
                  ${subjectList.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Note (1.0 bis 6.0)</label>
                <div class="quick-pills" id="grade-pills">
                  ${[1.0, 1.3, 1.5, 2.0, 2.3, 2.5, 3.0, 3.3, 3.5, 4.0, 5.0, 6.0].map(val => `
                    <button type="button" class="pill-btn ${val === this._selectedGrade ? 'active' : ''}" data-val="${val}">
                      ${val.toFixed(1)}
                    </button>
                  `).join('')}
                </div>
                <input type="number" id="grade-input" step="0.1" min="1" max="6" value="${this._selectedGrade}" required style="margin-top: 8px;">
              </div>

              <div class="form-group">
                <label>Gewichtung</label>
                <div class="quick-pills" id="weight-pills">
                  ${[1.0, 2.0, 3.0, 4.0].map(w => `
                    <button type="button" class="pill-btn ${w === this._selectedWeight ? 'active' : ''}" data-weight="${w}">
                      ${w}-fach
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label>Bezeichnung (z. B. 1. Schulaufgabe)</label>
                  <input type="text" id="grade-name" placeholder="z. B. Schulaufgabe, Ex, Mündlich">
                </div>
                <div class="form-group half">
                  <label>Datum</label>
                  <input type="date" id="grade-date" value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>

              <button type="submit" class="submit-btn">➕ Note eintragen</button>
            </form>
          </div>

          <!-- Manage Subjects Card -->
          <div class="card form-card">
            <h3>📘 Schulfächer verwalten</h3>
            <form id="add-subject-form">
              <div class="form-group">
                <label>Neues Schulfach hinzufügen</label>
                <input type="text" id="new-subject-name" placeholder="z. B. Physik, Kunst, Musik" required>
              </div>
              <button type="submit" class="submit-btn secondary">➕ Fach anlegen</button>
            </form>

            <hr style="margin: 24px 0; border: none; border-top: 1px solid var(--divider-color, rgba(255,255,255,0.1));">

            <div class="form-group">
              <label>Bestehendes Fach löschen</label>
              <div class="delete-subject-row">
                <select id="delete-subject-select">
                  ${subjectList.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
                <button type="button" id="delete-subject-btn" class="delete-btn">🗑️ Löschen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Subjects Grid -->
        <h2 class="section-title">📘 Fächer & Notenübersicht</h2>
        <div class="subjects-grid">
          ${subjectList.map(subjName => {
            const subj = subjects[subjName];
            const avg = subj.average && !isNaN(subj.average) ? subj.average : '–';
            return `
              <div class="card subject-card">
                <div class="subject-header">
                  <div class="subject-title">
                    <h3>${subjName}</h3>
                    <span class="badge avg-badge ${this._getGradeColorClass(avg)}">Schnitt: ${avg}</span>
                  </div>
                  <span class="count-tag">${subj.grades.length} Noten</span>
                </div>

                <div class="grades-list">
                  ${subj.grades.length === 0 ? `
                    <div class="empty-grades">Noch keine Noten eingetragen</div>
                  ` : `
                    <table class="grades-table">
                      <thead>
                        <tr>
                          <th>Note</th>
                          <th>Gewichtung</th>
                          <th>Datum</th>
                          <th>Bezeichnung</th>
                          <th>Aktion</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${subj.grades.map(g => `
                          <tr>
                            <td>
                              <span class="grade-pill ${this._getGradeColorClass(g.grade)}">
                                ${parseFloat(g.grade).toFixed(1)}
                              </span>
                            </td>
                            <td><span class="weight-badge">${g.weight}-fach</span></td>
                            <td class="date-cell">${g.date}</td>
                            <td class="name-cell">${g.name || '–'}</td>
                            <td>
                              <button class="icon-btn delete-grade-btn" data-subject="${subjName}" data-id="${g.id}" title="Note löschen">
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
      </div>

      <!-- Timetable Edit Modal -->
      ${this._editingCell ? `
        <div class="modal-backdrop" id="timetable-modal-backdrop">
          <div class="modal-card">
            <div class="modal-header">
              <h3>✏️ Stundenplan bearbeiten</h3>
              <span class="modal-subtitle">${this._editingCell.slotLabel} • ${this._editingCell.dayLabel}</span>
            </div>

            <form id="timetable-edit-form">
              <div class="form-group">
                <label>Schulfach</label>
                <select id="modal-subject-select">
                  <option value="">-- Kein Fach (Freistunde) --</option>
                  ${subjectList.map(s => `
                    <option value="${s}" ${this._editingCell.subject === s ? 'selected' : ''}>${s}</option>
                  `).join('')}
                  ${this._editingCell.subject && !subjectList.includes(this._editingCell.subject) ? `
                    <option value="${this._editingCell.subject}" selected>${this._editingCell.subject}</option>
                  ` : ''}
                  <option value="__custom__">➕ Neues / Anderes Fach eingeben...</option>
                </select>
                <input type="text" id="modal-custom-subject" placeholder="Eigenes Fach eingeben" style="display: none; margin-top: 8px;" value="${this._editingCell.subject || ''}">
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label>Raum (optional)</label>
                  <input type="text" id="modal-room" placeholder="z. B. R102" value="${this._editingCell.room || ''}">
                </div>
                <div class="form-group half">
                  <label>Lehrkraft (optional)</label>
                  <input type="text" id="modal-teacher" placeholder="z. B. Fr. Schmidt" value="${this._editingCell.teacher || ''}">
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="delete-btn" id="modal-delete-btn" ${!this._editingCell.subject ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>🗑️ Löschen</button>
                <div class="modal-actions-right">
                  <button type="button" class="submit-btn secondary" id="modal-cancel-btn">Abbrechen</button>
                  <button type="submit" class="submit-btn">💾 Speichern</button>
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
              <h3>📋 Stundenplan YAML Import / Export</h3>
              <span class="modal-subtitle">Füge hier deinen Stundenplan im YAML-Format ein oder kopiere die aktuelle Konfiguration</span>
            </div>

            <form id="yaml-import-form">
              <div class="form-group">
                <label>Stundenplan YAML-Konfiguration (${this._selectedChild})</label>
                <textarea id="yaml-textarea" rows="14" style="font-family: monospace; font-size: 13px; line-height: 1.4; resize: vertical; tab-size: 2;">${this._timetableToYaml(timetable)}</textarea>
              </div>

              <div class="modal-actions">
                <button type="button" class="submit-btn secondary" id="yaml-copy-btn" style="width: auto; padding: 10px 18px;">📋 Kopieren</button>
                <div class="modal-actions-right">
                  <button type="button" class="submit-btn secondary" id="yaml-cancel-btn">Abbrechen</button>
                  <button type="submit" class="submit-btn">📥 YAML Importieren</button>
                </div>
              </div>
            </form>
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

    if (diffDays < 0) return { text: 'Vergangen', cls: 'past' };
    if (diffDays === 0) return { text: '⚡ HEUTE', cls: 'today' };
    if (diffDays === 1) return { text: '⚠️ Morgen', cls: 'tomorrow' };
    if (diffDays <= 7) return { text: `In ${diffDays} Tagen`, cls: 'soon' };
    return { text: `In ${diffDays} Tagen`, cls: 'later' };
  }

  _getGradeColorClass(gradeVal) {
    const num = parseFloat(gradeVal);
    if (isNaN(num)) return 'grade-neutral';
    if (num <= 1.5) return 'grade-excellent';
    if (num <= 2.5) return 'grade-good';
    if (num <= 3.5) return 'grade-satisfactory';
    if (num <= 4.5) return 'grade-adequate';
    return 'grade-poor';
  }

  _attachEventListeners() {
    const root = this.shadowRoot;

    // Child Tabs
    root.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._selectedChild = e.currentTarget.dataset.child;
        this._fetchUpcomingCalendarEvents();
        this.render();
      });
    });

    // Calendar Select
    const calSelect = root.querySelector('#calendar-select');
    if (calSelect) {
      calSelect.addEventListener('change', async (e) => {
        const calEntity = e.target.value;
        await this._hass.callService('school_grades', 'set_calendar', {
          child_name: this._selectedChild,
          calendar_entity: calEntity,
        });
        setTimeout(() => this._fetchUpcomingCalendarEvents(), 300);
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
        copyYamlBtn.addEventListener('click', () => {
          const textarea = root.querySelector('#yaml-textarea');
          if (textarea) {
            navigator.clipboard.writeText(textarea.value);
            copyYamlBtn.textContent = '✅ Kopiert!';
            setTimeout(() => { copyYamlBtn.textContent = '📋 Kopieren'; }, 2000);
          }
        });
      }

      const yamlForm = root.querySelector('#yaml-import-form');
      if (yamlForm) {
        yamlForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const yamlText = root.querySelector('#yaml-textarea').value;
          await this._hass.callService('school_grades', 'import_timetable', {
            child_name: this._selectedChild,
            yaml_content: yamlText,
          });
          this._showYamlModal = false;
          setTimeout(() => this.render(), 300);
          setTimeout(() => this.render(), 700);
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
          await this._hass.callService('school_grades', 'update_timetable_cell', {
            child_name: this._selectedChild,
            slot_id: this._editingCell.slotId,
            day: this._editingCell.day,
            subject: '',
            room: '',
            teacher: '',
          });
          this._editingCell = null;
          setTimeout(() => this.render(), 200);
          setTimeout(() => this.render(), 600);
        });
      }

      const editForm = root.querySelector('#timetable-edit-form');
      if (editForm) {
        editForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          let subjectVal = root.querySelector('#modal-subject-select').value;
          if (subjectVal === '__custom__') {
            subjectVal = root.querySelector('#modal-custom-subject').value.trim();
          }
          const roomVal = root.querySelector('#modal-room').value.trim();
          const teacherVal = root.querySelector('#modal-teacher').value.trim();

          await this._hass.callService('school_grades', 'update_timetable_cell', {
            child_name: this._selectedChild,
            slot_id: this._editingCell.slotId,
            day: this._editingCell.day,
            subject: subjectVal,
            room: roomVal,
            teacher: teacherVal,
          });

          this._editingCell = null;
          setTimeout(() => this.render(), 200);
          setTimeout(() => this.render(), 600);
        });
      }
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
        setTimeout(() => this.render(), 200);
        setTimeout(() => this.render(), 600);
      });
    }

    // Add Subject Form Submit
    const addSubjectForm = root.querySelector('#add-subject-form');
    if (addSubjectForm) {
      addSubjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newSubject = root.querySelector('#new-subject-name').value.trim();
        if (newSubject) {
          await this._hass.callService('school_grades', 'add_subject', {
            child_name: this._selectedChild,
            subject: newSubject,
          });
          root.querySelector('#new-subject-name').value = '';
          setTimeout(() => this.render(), 200);
          setTimeout(() => this.render(), 600);
        }
      });
    }

    // Delete Subject Button
    const deleteSubjectBtn = root.querySelector('#delete-subject-btn');
    if (deleteSubjectBtn) {
      deleteSubjectBtn.addEventListener('click', async () => {
        const subject = root.querySelector('#delete-subject-select').value;
        if (subject && confirm(`Möchtest du das Fach "${subject}" wirklich inklusive aller Noten löschen?`)) {
          await this._hass.callService('school_grades', 'remove_subject', {
            child_name: this._selectedChild,
            subject: subject,
          });
          setTimeout(() => this.render(), 200);
          setTimeout(() => this.render(), 600);
        }
      });
    }

    // Delete Grade Buttons
    root.querySelectorAll('.delete-grade-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const subject = e.currentTarget.dataset.subject;
        const gradeId = e.currentTarget.dataset.id;
        if (confirm(`Möchtest du diese Note wirklich löschen?`)) {
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
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 700;
      }

      .avg-badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
      }

      .count-tag {
        font-size: 12px;
        color: var(--secondary-text-color, #9ca3af);
        background: rgba(255, 255, 255, 0.05);
        padding: 4px 8px;
        border-radius: 6px;
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
