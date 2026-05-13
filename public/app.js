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

patientSearch.addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = readForm(patientSearch);
  const params = new URLSearchParams(raw).toString();
  try {
    const res = await request('GET', `${API}/pacientes/search?${params}`);
    renderPatients(res.data || res.items || res);
  } catch (err) {
    toast(err.message, 'error');
  }
});

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

const buildSessionPayload = (raw) => {
  const payload = {
    patientId: raw.patientId,
    sessionType: raw.sessionType,
  };
  if (raw.date) payload.date = raw.date;
  if (raw.status) payload.status = raw.status;
  if (raw.therapist) payload.therapist = raw.therapist;
  if (raw.durationMinutes) payload.durationMinutes = Number(raw.durationMinutes);
  if (raw.painLevel) payload.painLevel = Number(raw.painLevel);
  if (raw.overallScore) payload.overallScore = Number(raw.overallScore);
  if (raw.clinicalNotes) payload.clinicalNotes = raw.clinicalNotes;
  if (raw.exercises) {
    try {
      payload.exercises = JSON.parse(raw.exercises);
    } catch {
      throw new Error('Exercises field must be valid JSON');
    }
  }
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
    el.innerHTML = `
      <div class="item-main">
        <div class="item-title">${s.sessionType} — ${date}</div>
        <div class="item-meta">
          patient: <code>${s.patientId}</code> · status: ${s.status} ·
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
  fillForm(sessionForm, {
    id: s._id,
    patientId: s.patientId,
    date: toLocalDt(s.date),
    sessionType: s.sessionType,
    status: s.status,
    therapist: s.therapist || '',
    durationMinutes: s.durationMinutes ?? '',
    painLevel: s.painLevel ?? '',
    overallScore: s.overallScore ?? '',
    clinicalNotes: s.clinicalNotes || '',
    exercises: s.exercises ? JSON.stringify(s.exercises, null, 2) : '',
  });
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
  try {
    const payload = buildSessionPayload(raw);
    if (id) {
      await request('PATCH', `${API}/sesiones/${id}`, payload);
      toast('Session updated');
    } else {
      await request('POST', `${API}/sesiones`, payload);
      toast('Session created');
    }
    sessionForm.reset();
    loadSessions();
  } catch (err) {
    toast(err.message, 'error');
  }
});

document.getElementById('session-reset').addEventListener('click', () => sessionForm.reset());
document.getElementById('session-reload').addEventListener('click', loadSessions);

sessionSearch.addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = readForm(sessionSearch);
  const params = new URLSearchParams(raw).toString();
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
