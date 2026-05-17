'use strict';

const API = '/api';

// ── HTTP helper ───────────────────────────────────────────────────────────────
const request = async (method, url, body) => {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const toastEl = document.getElementById('toast');
let toastTimer = null;
const toast = (msg, type = 'success') => {
  toastEl.textContent = msg;
  toastEl.className = `toast ${type}`;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3500);
};

// ── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ── Form helpers ──────────────────────────────────────────────────────────────
const readForm = (form) => {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (value !== '' && value != null) data[key] = value;
  });
  return data;
};

const fillForm = (form, values) => {
  form.reset();
  Object.entries(values).forEach(([key, value]) => {
    const input = form.elements[key];
    if (input && value != null) input.value = value;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────────────────────────────────────────

const patientForm = document.getElementById('patient-form');
const patientSearch = document.getElementById('patient-search');
const patientList = document.getElementById('patient-list');

const toIsoDate = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '');

const buildPatientPayload = (raw) => {
  const payload = {
    firstName: raw.firstName,
    lastName: raw.lastName,
    birthDate: raw.birthDate,
    gender: raw.gender,
  };
  if (raw.phone || raw.email) {
    payload.contact = {};
    if (raw.phone) payload.contact.phone = raw.phone;
    if (raw.email) payload.contact.email = raw.email;
  }
  payload.diagnosis = { type: raw.diagnosisType };
  if (raw.diagnosisDescription) payload.diagnosis.description = raw.diagnosisDescription;
  if (raw.diagnosisDate) payload.diagnosis.diagnosisDate = raw.diagnosisDate;
  if (raw.recoveryStatus) payload.recoveryStatus = raw.recoveryStatus;
  if (raw.recoveryLevel) payload.recoveryLevel = Number(raw.recoveryLevel);
  return payload;
};

const renderPatients = (items) => {
  patientList.innerHTML = '';
  if (!items || items.length === 0) {
    patientList.innerHTML = '<div class="empty">No patients found.</div>';
    return;
  }
  items.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `
      <div class="item-main">
        <div class="item-title">${p.firstName} ${p.lastName}</div>
        <div class="item-meta">
          ${p.gender} · ${p.diagnosis?.type || '—'} ·
          status: ${p.recoveryStatus} · level: ${p.recoveryLevel ?? 0}
          <br><code>${p._id}</code>
        </div>
      </div>
      <div class="item-actions">
        <button data-action="progress">Progress</button>
        <button data-action="edit">Edit</button>
        <button data-action="delete" class="danger">Delete</button>
      </div>
    `;
    el.querySelector('[data-action="edit"]').addEventListener('click', () => editPatient(p));
    el.querySelector('[data-action="delete"]').addEventListener('click', () => deletePatient(p));
    el.querySelector('[data-action="progress"]').addEventListener('click', () => showProgress(p));
    patientList.appendChild(el);
  });
};

const loadPatients = async () => {
  try {
    const res = await request('GET', `${API}/pacientes?limit=50`);
    renderPatients(res.data || res.items || res);
  } catch (e) {
    toast(`Load patients failed: ${e.message}`, 'error');
  }
};

const editPatient = (p) => {
  fillForm(patientForm, {
    id: p._id,
    firstName: p.firstName,
    lastName: p.lastName,
    birthDate: toIsoDate(p.birthDate),
    gender: p.gender,
    phone: p.contact?.phone || '',
    email: p.contact?.email || '',
    diagnosisType: p.diagnosis?.type || '',
    diagnosisDescription: p.diagnosis?.description || '',
    diagnosisDate: toIsoDate(p.diagnosis?.diagnosisDate),
    recoveryStatus: p.recoveryStatus || '',
    recoveryLevel: p.recoveryLevel ?? '',
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deletePatient = async (p) => {
  if (!confirm(`Delete ${p.firstName} ${p.lastName}?`)) return;
  try {
    await request('DELETE', `${API}/pacientes/${p._id}`);
    toast('Patient deleted');
    loadPatients();
  } catch (e) {
    toast(`Delete failed: ${e.message}`, 'error');
  }
};

patientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = readForm(patientForm);
  const id = raw.id;
  delete raw.id;
  try {
    const payload = buildPatientPayload(raw);
    if (id) {
      await request('PUT', `${API}/pacientes/${id}`, payload);
      toast('Patient updated');
    } else {
      await request('POST', `${API}/pacientes`, payload);
      toast('Patient created');
    }
    patientForm.reset();
    loadPatients();
  } catch (err) {
    toast(err.message, 'error');
  }
});

document.getElementById('patient-reset').addEventListener('click', () => patientForm.reset());
document.getElementById('patient-reload').addEventListener('click', loadPatients);

const doPatientSearch = async () => {
  const raw = readForm(patientSearch);
  const params = new URLSearchParams(raw).toString();
  try {
    const res = await request('GET', `${API}/pacientes/search?${params}`);
    renderPatients(res.data || res.items || res);
  } catch (err) {
    toast(err.message, 'error');
  }
};

patientSearch.addEventListener('submit', (e) => { e.preventDefault(); doPatientSearch(); });

// ── Progress ──────────────────────────────────────────────────────────────────
const progressCard = document.getElementById('progress-card');
const progressOutput = document.getElementById('progress-output');
const progressName = document.getElementById('progress-name');
const progressWeeks = document.getElementById('progress-weeks');
let currentProgressId = null;

const showProgress = async (p) => {
  currentProgressId = p._id;
  progressName.textContent = `${p.firstName} ${p.lastName}`;
  progressCard.hidden = false;
  await refreshProgress();
  progressCard.scrollIntoView({ behavior: 'smooth' });
};

const refreshProgress = async () => {
  if (!currentProgressId) return;
  try {
    const res = await request('GET', `${API}/pacientes/${currentProgressId}/progress?weeks=${progressWeeks.value}`);
    progressOutput.textContent = JSON.stringify(res.data || res, null, 2);
  } catch (err) {
    progressOutput.textContent = `Error: ${err.message}`;
  }
};

document.getElementById('progress-refresh').addEventListener('click', refreshProgress);
document.getElementById('progress-close').addEventListener('click', () => {
  progressCard.hidden = true;
  currentProgressId = null;
});

// ─────────────────────────────────────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────────────────────────────────────

const sessionForm = document.getElementById('session-form');
const sessionSearch = document.getElementById('session-search');
const sessionList = document.getElementById('session-list');

// ── Patient autocomplete factory ──────────────────────────────────────────────
const makePatientAutocomplete = ({ inputEl, dropdownEl, onSelect, onClear }) => {
  let timer = null;

  const renderDrop = (patients) => {
    dropdownEl.innerHTML = '';
    if (!patients.length) { dropdownEl.hidden = true; return; }
    patients.forEach((p) => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.innerHTML = `<span>${p.firstName} ${p.lastName}</span><span class="dropdown-sub">${p.diagnosis?.type ?? ''}</span>`;
      item.addEventListener('mousedown', (e) => { e.preventDefault(); dropdownEl.hidden = true; onSelect(p); });
      dropdownEl.appendChild(item);
    });
    dropdownEl.hidden = false;
  };

  inputEl.addEventListener('input', () => {
    if (onClear) onClear();
    clearTimeout(timer);
    const q = inputEl.value.trim();
    if (q.length < 2) { dropdownEl.hidden = true; return; }
    timer = setTimeout(async () => {
      try {
        const qNorm = q.normalize('NFD').replace(/[̀-ͯ]/g, '');
        const res = await request('GET', `${API}/pacientes/search?q=${encodeURIComponent(qNorm)}&limit=8`);
        renderDrop(res.data || res.items || res);
      } catch { dropdownEl.hidden = true; }
    }, 300);
  });

  inputEl.addEventListener('blur', () => {
    setTimeout(() => { dropdownEl.hidden = true; }, 150);
  });
};

// ── Session create — patient autocomplete ─────────────────────────────────────
let selectedPatientId = null;
const patientNameInput = document.getElementById('session-patient-name');
const patientDropdown  = document.getElementById('session-patient-dropdown');
const patientHint      = document.getElementById('session-patient-hint');

const clearPatientSelection = () => {
  selectedPatientId = null;
  patientHint.textContent = '';
  patientHint.className = 'patient-hint';
};

makePatientAutocomplete({
  inputEl: patientNameInput,
  dropdownEl: patientDropdown,
  onSelect: (p) => {
    selectedPatientId = p._id;
    patientNameInput.value = `${p.firstName} ${p.lastName}`;
    patientHint.textContent = `✓ ${p.diagnosis?.type ?? ''}`;
    patientHint.className = 'patient-hint ok';
  },
  onClear: clearPatientSelection,
});

// ── Session search — patient autocomplete ─────────────────────────────────────
let selectedSearchPatientId = null;
const searchPatientNameInput = document.getElementById('search-patient-name');
const searchPatientDropdown  = document.getElementById('search-patient-dropdown');
const searchPatientHint      = document.getElementById('search-patient-hint');

makePatientAutocomplete({
  inputEl: searchPatientNameInput,
  dropdownEl: searchPatientDropdown,
  onSelect: (p) => {
    selectedSearchPatientId = p._id;
    searchPatientNameInput.value = `${p.firstName} ${p.lastName}`;
    searchPatientHint.textContent = `✓ ${p.diagnosis?.type ?? ''}`;
    searchPatientHint.className = 'patient-hint ok';
  },
  onClear: () => {
    selectedSearchPatientId = null;
    searchPatientHint.textContent = '';
    searchPatientHint.className = 'patient-hint';
  },
});

// ── Patient search — autocomplete on q field ──────────────────────────────────
makePatientAutocomplete({
  inputEl: document.getElementById('patient-search-q'),
  dropdownEl: document.getElementById('patient-search-dropdown'),
  onSelect: (p) => {
    document.getElementById('patient-search-q').value = `${p.firstName} ${p.lastName}`;
  },
  onClear: null,
});

// ── Exercise builder ──────────────────────────────────────────────────────────
let exercisesState = [];

const renderExerciseList = () => {
  const container = document.getElementById('exercise-list');
  if (exercisesState.length === 0) {
    container.innerHTML = '<div class="empty" style="font-size:0.85rem">No exercises added yet.</div>';
    return;
  }
  container.innerHTML = exercisesState.map((ex, i) => `
    <div class="exercise-row">
      <span class="ex-name">${ex.name}</span>
      <span class="ex-detail">sets: ${ex.sets ?? '—'} · reps: ${ex.reps ?? '—'} · score: ${ex.score ?? '—'}</span>
      <button type="button" class="ex-remove danger" data-index="${i}">✕</button>
    </div>
  `).join('');
  container.querySelectorAll('.ex-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      exercisesState.splice(Number(btn.dataset.index), 1);
      renderExerciseList();
    });
  });
};

document.getElementById('add-exercise').addEventListener('click', () => {
  const name  = document.getElementById('ex-name').value.trim();
  const sets  = document.getElementById('ex-sets').value;
  const reps  = document.getElementById('ex-reps').value;
  const score = document.getElementById('ex-score').value;

  if (!name) { toast('Exercise name is required', 'error'); return; }

  const exercise = { name };
  if (sets)  exercise.sets  = Number(sets);
  if (reps)  exercise.reps  = Number(reps);
  if (score) exercise.score = Number(score);

  exercisesState.push(exercise);
  renderExerciseList();

  document.getElementById('ex-name').value  = '';
  document.getElementById('ex-sets').value  = '';
  document.getElementById('ex-reps').value  = '';
  document.getElementById('ex-score').value = '';
  document.getElementById('ex-name').focus();
});

const buildSessionPayload = (raw, patientId) => {
  const payload = {
    patientId,
    sessionType: raw.sessionType,
  };
  if (raw.date) payload.date = raw.date;
  if (raw.status) payload.status = raw.status;
  if (raw.therapist) payload.therapist = raw.therapist;
  if (raw.durationMinutes) payload.durationMinutes = Number(raw.durationMinutes);
  if (raw.painLevel) payload.painLevel = Number(raw.painLevel);
  if (raw.overallScore) payload.overallScore = Number(raw.overallScore);
  if (raw.clinicalNotes) payload.clinicalNotes = raw.clinicalNotes;
  if (exercisesState.length > 0) payload.exercises = exercisesState;
  return payload;
};

const renderSessions = (items) => {
  sessionList.innerHTML = '';
  if (!items || items.length === 0) {
    sessionList.innerHTML = '<div class="empty">No sessions found. (Note: session endpoints may not be implemented yet.)</div>';
    return;
  }
  items.forEach((s) => {
    const el = document.createElement('div');
    el.className = 'item';
    const date = s.date ? new Date(s.date).toLocaleString() : '—';
    const patient = s.patientId?.firstName
      ? `${s.patientId.firstName} ${s.patientId.lastName}`
      : String(s.patientId);
    el.innerHTML = `
      <div class="item-main">
        <div class="item-title">${s.sessionType} — ${date}</div>
        <div class="item-meta">
          <strong>${patient}</strong> · ${s.status} ·
          score: ${s.overallScore ?? '—'} · pain: ${s.painLevel ?? '—'}
          <br><code>${s._id}</code>
        </div>
      </div>
      <div class="item-actions">
        <button data-action="edit">Edit</button>
        <button data-action="delete" class="danger">Delete</button>
      </div>
    `;
    el.querySelector('[data-action="edit"]').addEventListener('click', () => editSession(s));
    el.querySelector('[data-action="delete"]').addEventListener('click', () => deleteSession(s));
    sessionList.appendChild(el);
  });
};

const loadSessions = async () => {
  try {
    const res = await request('GET', `${API}/sesiones?limit=50`);
    renderSessions((res && (res.data || res.items)) || res || []);
  } catch (e) {
    sessionList.innerHTML = `<div class="empty">Load sessions failed: ${e.message}</div>`;
  }
};

const toLocalDt = (v) => {
  if (!v) return '';
  const d = new Date(v);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const editSession = (s) => {
  if (s.patientId?.firstName) {
    selectedPatientId = s.patientId._id;
    patientNameInput.value = `${s.patientId.firstName} ${s.patientId.lastName}`;
    patientHint.textContent = `✓ ${s.patientId.diagnosis?.type ?? ''}`;
    patientHint.className = 'patient-hint ok';
  } else {
    clearPatientSelection();
  }

  fillForm(sessionForm, {
    id: s._id,
    date: toLocalDt(s.date),
    sessionType: s.sessionType,
    status: s.status,
    therapist: s.therapist || '',
    durationMinutes: s.durationMinutes ?? '',
    painLevel: s.painLevel ?? '',
    overallScore: s.overallScore ?? '',
    clinicalNotes: s.clinicalNotes || '',
  });
  exercisesState = (s.exercises || []).map((ex) => ({
    name: ex.name,
    ...(ex.sets  != null && { sets:  ex.sets  }),
    ...(ex.reps  != null && { reps:  ex.reps  }),
    ...(ex.score != null && { score: ex.score }),
  }));
  renderExerciseList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deleteSession = async (s) => {
  if (!confirm('Delete this session?')) return;
  try {
    await request('DELETE', `${API}/sesiones/${s._id}`);
    toast('Session deleted');
    loadSessions();
  } catch (e) {
    toast(`Delete failed: ${e.message}`, 'error');
  }
};

sessionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = readForm(sessionForm);
  const id = raw.id;
  delete raw.id;

  if (!selectedPatientId) {
    toast('Selecciona un paciente de la lista desplegable', 'error');
    patientNameInput.focus();
    return;
  }

  try {
    const payload = buildSessionPayload(raw, selectedPatientId);
    if (id) {
      await request('PATCH', `${API}/sesiones/${id}`, payload);
      toast('Session updated');
    } else {
      await request('POST', `${API}/sesiones`, payload);
      toast('Session created');
    }
    sessionForm.reset();
    patientNameInput.value = '';
    clearPatientSelection();
    exercisesState = [];
    renderExerciseList();
    loadSessions();
  } catch (err) {
    toast(err.message, 'error');
  }
});

document.getElementById('session-reset').addEventListener('click', () => {
  sessionForm.reset();
  patientNameInput.value = '';
  clearPatientSelection();
  exercisesState = [];
  renderExerciseList();
});
document.getElementById('session-reload').addEventListener('click', loadSessions);

sessionSearch.addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = readForm(sessionSearch);

  const params = new URLSearchParams();
  params.set('limit', '50');
  if (selectedSearchPatientId) params.set('patientId',   selectedSearchPatientId);
  if (raw.sessionType)         params.set('sessionType', raw.sessionType);
  if (raw.status)              params.set('status',      raw.status);
  if (raw.startDate)           params.set('startDate',   raw.startDate);
  if (raw.endDate)             params.set('endDate',     raw.endDate);

  try {
    const res = await request('GET', `${API}/sesiones/search?${params}`);
    renderSessions((res && (res.data || res.items)) || res || []);
  } catch (err) {
    toast(err.message, 'error');
  }
});

// ── Initial load ──────────────────────────────────────────────────────────────
loadPatients();
loadSessions();
