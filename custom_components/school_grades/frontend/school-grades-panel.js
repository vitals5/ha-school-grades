/**
 * Schulnoten Custom Sidebar Panel for Home Assistant
 */
class SchoolGradesPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedChild = null;
    this._selectedGrade = 2.0;
    this._selectedWeight = 1.0;
    this._calendarEvents = {}; // { childName: [events] }
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
    const startIso = now.toISOString();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const endIso = in30Days.toISOString();

    for (const [childName, childData] of Object.entries(data)) {
      const calEntity = childData.calendarEntity;
      if (!calEntity || !this._hass.states[calEntity]) {
        this._calendarEvents[childName] = [];
        continue;
      }

      try {
        const events = await this._hass.callWS({
          type: 'calendar/event/list',
          entity_id: calEntity,
          start_time: startIso,
          end_time: endIso,
        });

        this._calendarEvents[childName] = events || [];
        this.render();
      } catch (err) {
        // Fallback to single state attribute if WS call unsupported
        const stateObj = this._hass.states[calEntity];
        if (stateObj && stateObj.attributes.start_time) {
          this._calendarEvents[childName] = [{
            summary: stateObj.attributes.message || stateObj.state,
            start: stateObj.attributes.start_time,
            end: stateObj.attributes.end_time,
            description: stateObj.attributes.description || '',
            location: stateObj.attributes.location || '',
          }];
        } else {
          this._calendarEvents[childName] = [];
        }
      }
    }
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
            <h2>🎓 Schulnoten Verwaltung</h2>
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

    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="container">
        <!-- Header & Child Selector -->
        <header class="header">
          <div class="title-section">
            <h1>🎓 Schulnoten Übersicht</h1>
            <p class="subtitle">Verwaltung, Notenspiegel & Klausurenkalender für deine Kinder</p>
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
          <div class="stat-card">
            <span class="stat-label">Anstehende Klausuren</span>
            <span class="stat-value">${upcomingEvents.length}</span>
          </div>
        </div>

        <!-- Upcoming Calendar Events Card -->
        <div class="card calendar-card" style="margin-bottom: 24px;">
          <div class="calendar-header">
            <h3>📅 Anstehende Klausuren & Termine</h3>
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
                💡 Wähle oben einen Schul-Kalender (z. B. Google Kalender, Local HA Calendar, CalDAV), um anstehende Klausuren und Termine anzuzeigen.
              </div>
            ` : upcomingEvents.length === 0 ? `
              <div class="empty-events">
                🎉 Keine anstehenden Klausuren in den nächsten 30 Tagen eingetragen!
              </div>
            ` : `
              <div class="events-grid">
                ${upcomingEvents.map(evt => {
                  const startDate = new Date(evt.start || evt.dtstart);
                  const formattedDate = startDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
                  const formattedTime = startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                  const countdownText = this._getCountdownBadge(startDate);
                  return `
                    <div class="event-item">
                      <div class="event-badge-row">
                        <span class="event-countdown ${countdownText.cls}">${countdownText.text}</span>
                        <span class="event-time">${formattedDate} ${formattedTime !== '00:00' ? 'um ' + formattedTime + ' Uhr' : ''}</span>
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
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

      input:focus, select:focus {
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
