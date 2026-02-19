const $ = (selector) => document.querySelector(selector);
const API_BASE_URL = 'https://restaurante-la-terraza-production.up.railway.app';
const DEFAULT_AUTH_TOKEN = 'test';

const els = {
  seedBtn: $('#seed-btn'),
  refreshAll: $('#refresh-all'),
  authToken: $('#auth-token'),
  saveToken: $('#save-token'),
  seedStatus: $('#seed-status'),
  serverStatus: $('#server-status'),
  clock: $('#clock'),
  toast: $('#toast'),
  availabilityForm: $('#availability-form'),
  availabilityResult: $('#availability-result'),
  reservationForm: $('#reservation-form'),
  reservationResult: $('#reservation-result'),
  listForm: $('#list-form'),
  reservationsContainer: $('#reservations-container'),
  addTableForm: $('#add-table-form'),
  areaSelect: $('#area-select'),
  adminResult: $('#admin-result'),
  areasList: $('#areas-list'),
  tablesList: $('#tables-list'),
  metricAreas: $('#metric-areas'),
  metricTables: $('#metric-tables'),
  metricReservations: $('#metric-reservations'),
  metricPending: $('#metric-pending'),
};

const STATUS_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NOSHOW'],
  CANCELLED: [],
  NOSHOW: [],
  COMPLETED: [],
  EXPIRED: [],
};

const state = {
  areas: [],
  tables: [],
  reservations: [],
  lastAvailability: null,
};

function showToast(message, type = 'ok') {
  els.toast.textContent = message;
  els.toast.className = `toast show ${type}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.className = 'toast';
  }, 2400);
}

function setChip(el, text, ok) {
  el.textContent = text;
  el.className = ok ? 'chip chip-ok' : 'chip chip-err';
}

function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

function getAuthToken() {
  return localStorage.getItem('lt_auth_token') || DEFAULT_AUTH_TOKEN;
}

async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const token = getAuthToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.message || `Error ${response.status}`);
  }

  return payload;
}

function defaultDate() {
  return new Date().toISOString().slice(0, 10);
}

function syncClock() {
  const now = new Date();
  els.clock.textContent = now.toLocaleTimeString('es-DO', { hour12: false });
}

function setDefaults() {
  const d = defaultDate();
  for (const form of [els.availabilityForm, els.reservationForm, els.listForm]) {
    const dateInput = form.querySelector('input[name="date"]');
    if (dateInput && !dateInput.value) dateInput.value = d;
  }

  const availabilityTime = els.availabilityForm.querySelector('input[name="startTime"]');
  const reservationTime = els.reservationForm.querySelector('input[name="startTime"]');
  if (!availabilityTime.value) availabilityTime.value = '20:00';
  if (!reservationTime.value) reservationTime.value = '20:00';
}

function renderMetrics() {
  els.metricAreas.textContent = String(state.areas.length);
  els.metricTables.textContent = String(state.tables.length);
  els.metricReservations.textContent = String(state.reservations.length);
  els.metricPending.textContent = String(state.reservations.filter((r) => r.status === 'PENDING').length);
}

function renderAreasAndTables() {
  els.areasList.innerHTML = state.areas.length
    ? state.areas.map((a) => `<li><strong>${a.code}</strong> - ${a.name}<br>${a.id} | max ${a.maxTables}</li>`).join('')
    : '<li>Sin areas.</li>';

  els.tablesList.innerHTML = state.tables.length
    ? state.tables.map((t) => `<li><strong>${t.code}</strong> cap ${t.capacity}<br>${t.id} | ${t.tableType}</li>`).join('')
    : '<li>Sin mesas.</li>';

  els.areaSelect.innerHTML = state.areas.length
    ? state.areas.map((a) => `<option value="${a.id}">${a.code} (${a.name})</option>`).join('')
    : '<option value="">Sin areas</option>';
}

function toCandidateButton(query, areaCode, candidate) {
  const tableId = candidate.tableIds?.[0] || '';
  return `<button class="mini" data-action="send-to-reservation" data-date="${query.date}" data-time="${query.startTime}" data-party="${query.partySize}" data-duration="${query.durationMin}" data-area="${areaCode}" data-table="${tableId}">Enviar a reserva (${candidate.capacity}p)</button>`;
}

function renderAvailability(data) {
  state.lastAvailability = data;
  const rows = data.options.map((opt) => {
    const headTag = opt.feasible
      ? '<span class="tag tag-ok">Disponible</span>'
      : '<span class="tag tag-no">No disponible</span>';

    const candidates = opt.candidates && opt.candidates.length
      ? `<div class="avail-actions">${opt.candidates.map((c) => toCandidateButton(data, opt.area, c)).join('')}</div>`
      : '<small>Sin candidatos para este horario.</small>';

    return `
      <article class="avail-row">
        <div class="avail-head">
          <strong>${opt.area}</strong>
          ${headTag}
        </div>
        ${candidates}
      </article>
    `;
  }).join('');

  els.availabilityResult.innerHTML = rows || 'No hay opciones.';
}

function fillReservationFromSuggestion(dataset) {
  const form = els.reservationForm;
  form.querySelector('input[name="date"]').value = dataset.date;
  form.querySelector('input[name="startTime"]').value = dataset.time;
  form.querySelector('input[name="partySize"]').value = dataset.party;
  form.querySelector('select[name="durationMin"]').value = dataset.duration;
  form.querySelector('select[name="areaPreference"]').value = dataset.area;
  form.querySelector('input[name="assignedTableId"]').value = dataset.table || '';
  showToast('Reserva autocompletada desde disponibilidad.', 'ok');
}

function reservationCard(reservation) {
  const options = STATUS_FLOW[reservation.status] || [];
  const selector = `
    <select data-role="status" data-id="${reservation.id}">
      <option value="">Cambiar estado...</option>
      ${options.map((status) => `<option value="${status}">${status}</option>`).join('')}
    </select>
    <button class="mini" data-role="apply-status" data-id="${reservation.id}" ${options.length ? '' : 'disabled'}>Aplicar</button>
  `;

  return `
    <article class="rsv">
      <div class="rsv-line">
        <strong>${reservation.customerName} (${reservation.partySize}p)</strong>
        <span class="badge ${reservation.status}">${reservation.status}</span>
      </div>
      <div>${reservation.date} ${reservation.startTime} | Area ${reservation.areaAssigned} | Mesa ${reservation.tableAssignedIds.join(', ')}</div>
      <div class="rsv-id">${reservation.id} | ${reservation.source}</div>
      <div class="rsv-actions">${selector}</div>
    </article>
  `;
}

function renderReservations() {
  if (!state.reservations.length) {
    els.reservationsContainer.innerHTML = '<div>No hay reservas para este filtro.</div>';
    return;
  }

  els.reservationsContainer.innerHTML = state.reservations
    .map((r) => reservationCard(r))
    .join('');
}

async function refreshMetadata() {
  try {
    const [health, areas, tables] = await Promise.all([
      api('/health'),
      api('/areas'),
      api('/tables'),
    ]);

    setChip(els.serverStatus, `API: ${health.status} (${new Date(health.time).toLocaleTimeString('es-DO', { hour12: false })})`, true);
    setChip(els.seedStatus, `Seed: cargado (${areas.length} areas, ${tables.length} mesas)`, true);

    state.areas = areas;
    state.tables = tables;
    renderAreasAndTables();
    renderMetrics();
    return true;
  } catch (error) {
    setChip(els.seedStatus, `Seed: pendiente (${error.message})`, false);
    state.areas = [];
    state.tables = [];
    renderAreasAndTables();
    renderMetrics();
    return false;
  }
}

async function refreshReservations(event) {
  if (event) event.preventDefault();

  const fd = new FormData(els.listForm);
  const params = new URLSearchParams({ date: fd.get('date') });
  const areaId = String(fd.get('areaId') || '').trim();
  if (areaId) params.set('areaId', areaId);

  els.reservationsContainer.textContent = 'Cargando reservas...';

  try {
    state.reservations = await api(`/reservations?${params.toString()}`);
    renderReservations();
    renderMetrics();
  } catch (error) {
    state.reservations = [];
    els.reservationsContainer.textContent = `No disponible: ${error.message}`;
    renderMetrics();
  }
}

async function handleSeed() {
  els.seedBtn.disabled = true;
  try {
    await api('/seed', { method: 'POST' });
    showToast('Seed cargado correctamente.', 'ok');
  } catch (error) {
    if (error.message.includes('Already seeded')) {
      showToast('El seed ya estaba cargado.', 'ok');
    } else {
      showToast(`Error de seed: ${error.message}`, 'err');
    }
  } finally {
    els.seedBtn.disabled = false;
  }

  await refreshMetadata();
  await refreshReservations();
}

async function handleAvailabilitySubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.availabilityForm);
  const params = new URLSearchParams({
    date: formData.get('date'),
    startTime: formData.get('startTime'),
    partySize: formData.get('partySize'),
    durationMin: formData.get('durationMin'),
    areaPreference: formData.get('areaPreference'),
  });

  els.availabilityResult.textContent = 'Consultando...';

  try {
    const data = await api(`/availability?${params.toString()}`);
    renderAvailability(data);
  } catch (error) {
    els.availabilityResult.textContent = `Error: ${error.message}`;
    showToast(`No se pudo consultar disponibilidad: ${error.message}`, 'err');
  }
}

function buildReservationPayload() {
  const fd = new FormData(els.reservationForm);
  const payload = {
    date: fd.get('date'),
    startTime: fd.get('startTime'),
    partySize: Number(fd.get('partySize')),
    durationMin: Number(fd.get('durationMin')),
    areaPreference: fd.get('areaPreference'),
    vipRequested: fd.get('vipRequested') === 'true',
    customerName: fd.get('customerName'),
    phone: fd.get('phone'),
    source: fd.get('source'),
  };

  const optional = ['email', 'notes', 'occasion', 'assignedTableId'];
  for (const key of optional) {
    const value = String(fd.get(key) || '').trim();
    if (value) payload[key] = value;
  }

  return payload;
}

async function handleReservationSubmit(event) {
  event.preventDefault();

  try {
    const payload = buildReservationPayload();
    const reservation = await api('/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    els.reservationResult.textContent = pretty(reservation);
    showToast('Reserva creada correctamente.', 'ok');

    const listDate = els.listForm.querySelector('input[name="date"]').value;
    if (reservation.date === listDate) {
      await refreshReservations();
    }
  } catch (error) {
    els.reservationResult.textContent = `Error: ${error.message}`;
    showToast(`No se pudo crear la reserva: ${error.message}`, 'err');
  }
}

async function handleAddTable(event) {
  event.preventDefault();
  const fd = new FormData(els.addTableForm);
  const areaId = fd.get('areaId');
  const payload = {
    capacity: Number(fd.get('capacity')),
    tableType: fd.get('tableType'),
  };

  const code = String(fd.get('code') || '').trim();
  if (code) payload.code = code;

  try {
    const table = await api(`/areas/${areaId}/tables`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    els.adminResult.textContent = pretty(table);
    showToast('Mesa agregada.', 'ok');
    await refreshMetadata();
  } catch (error) {
    els.adminResult.textContent = `Error: ${error.message}`;
    showToast(`No se pudo agregar la mesa: ${error.message}`, 'err');
  }
}

async function handleReservationActionsClick(event) {
  const sendButton = event.target.closest('button[data-action="send-to-reservation"]');
  if (sendButton) {
    fillReservationFromSuggestion(sendButton.dataset);
    return;
  }

  const applyButton = event.target.closest('button[data-role="apply-status"]');
  if (!applyButton) return;

  const id = applyButton.dataset.id;
  const select = els.reservationsContainer.querySelector(`select[data-role="status"][data-id="${id}"]`);
  const status = select ? select.value : '';
  if (!status) return;

  applyButton.disabled = true;
  try {
    await api(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    showToast(`Estado actualizado a ${status}.`, 'ok');
    await refreshReservations();
  } catch (error) {
    showToast(`No se pudo actualizar estado: ${error.message}`, 'err');
  } finally {
    applyButton.disabled = false;
  }
}

function bindEvents() {
  els.saveToken.addEventListener('click', () => {
    const value = String(els.authToken.value || '').trim();
    if (!value) {
      localStorage.removeItem('lt_auth_token');
      showToast('Token eliminado. Se usara token por defecto.', 'ok');
      return;
    }
    localStorage.setItem('lt_auth_token', value);
    showToast('Token guardado.', 'ok');
  });
  els.seedBtn.addEventListener('click', handleSeed);
  els.refreshAll.addEventListener('click', async () => {
    await refreshMetadata();
    await refreshReservations();
  });
  els.availabilityForm.addEventListener('submit', handleAvailabilitySubmit);
  els.reservationForm.addEventListener('submit', handleReservationSubmit);
  els.listForm.addEventListener('submit', refreshReservations);
  els.addTableForm.addEventListener('submit', handleAddTable);

  els.availabilityResult.addEventListener('click', handleReservationActionsClick);
  els.reservationsContainer.addEventListener('click', handleReservationActionsClick);
}

async function init() {
  els.authToken.value = localStorage.getItem('lt_auth_token') || '';
  syncClock();
  setInterval(syncClock, 1000);
  setDefaults();
  bindEvents();

  const seeded = await refreshMetadata();
  if (seeded) {
    await refreshReservations();
  } else {
    setChip(els.serverStatus, 'API: disponible, falta seed', false);
    els.reservationsContainer.textContent = 'Cargar seed para operar.';
  }
}

init();
