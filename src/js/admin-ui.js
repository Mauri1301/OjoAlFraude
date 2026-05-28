/* Panel de administrador */
import { goTo } from './state.js';
import { getAllUsers, getUserSessions, loadAllScenarios, loadAllQuestions, updateScenario, updateQuestion, seedContent } from '../firebase/db.js';
import { logoutUser } from '../firebase/auth.js';
import { TEST_QUESTIONS } from '../data/test-questions.js';
import { ESCENARIOS_FULL } from '../data/escenarios-full.js';
import { TEST_QUESTIONS_FULL } from '../data/test-questions-full.js';
import { ESCENARIOS } from '../data/escenarios.js';
import { SUS_PREGUNTAS } from '../data/nivel-config.js';

let _allUsers = [];

/* ── Lista de participantes ── */
export async function cargarPanelAdmin() {
  goTo('p-admin');
  const container = document.getElementById('admin-participants');
  container.innerHTML = '<p class="body-sm text-muted">Cargando participantes...</p>';

  try {
    _allUsers = await getAllUsers();
    const participantes = _allUsers.filter(u => u.role !== 'admin');

    if (participantes.length === 0) {
      container.innerHTML = '<p class="body-sm text-muted text-center mt-8">Aún no hay participantes registrados.</p>';
      return;
    }

    container.innerHTML = participantes
      .sort((a, b) => (b.sessionCount || 0) - (a.sessionCount || 0))
      .map(u => `
        <div class="card flex-col gap-8" style="cursor:pointer" onclick="verDetalleParticipante('${u.uid}')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;gap:12px;align-items:center">
              <div class="admin-avatar">${(u.nombre || '?')[0].toUpperCase()}</div>
              <div>
                <div class="title-sm">${u.nombre || 'Sin nombre'}</div>
                <div class="body-sm text-muted">${u.edad ? u.edad + ' años' : ''} · ${u.email || ''}</div>
              </div>
            </div>
            <div class="badge ${(u.sessionCount || 0) > 0 ? 'badge-success' : 'badge-info'}">
              ${u.sessionCount || 0} sesión${(u.sessionCount || 0) !== 1 ? 'es' : ''}
            </div>
          </div>
        </div>
      `).join('');
  } catch (err) {
    container.innerHTML = `<span class="form-error">Error al cargar: ${err.message}</span>`;
  }
}

/* ── Detalle de un participante ── */
export async function verDetalleParticipante(uid) {
  const user = _allUsers.find(u => u.uid === uid);
  goTo('p-admin-detail');

  document.getElementById('detail-nombre').textContent = user?.nombre || 'Participante';
  document.getElementById('detail-info').textContent = [
    user?.edad ? user.edad + ' años' : null,
    user?.genero === 'M' ? 'Masculino' : user?.genero === 'F' ? 'Femenino' : null,
    user?.email,
  ].filter(Boolean).join(' · ');

  const container = document.getElementById('detail-sessions');
  container.innerHTML = '<p class="body-sm text-muted">Cargando sesiones...</p>';

  try {
    const sessions = await getUserSessions(uid);

    if (sessions.length === 0) {
      container.innerHTML = '<p class="body-sm text-muted text-center mt-8">Este participante no ha completado ninguna sesión.</p>';
      return;
    }

    container.innerHTML = sessions.map(s => {
      const fecha  = s.completadoEn?.toDate
        ? s.completadoEn.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';
      const pre    = s.pretest?.score  ?? '—';
      const post   = s.posttest?.score ?? '—';
      const game   = s.juego?.puntaje_total ?? '—';
      const sus    = s.sus?.score      ?? '—';
      const mejora = (typeof pre === 'number' && typeof post === 'number') ? post - pre : null;

      const mejoraHtml = mejora === null ? '' : `
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end">
          <span class="body-sm text-muted">Pre→Post:</span>
          <span class="bold" style="color:${mejora > 0 ? 'var(--accent3)' : mejora < 0 ? 'var(--accent2)' : 'var(--text-muted)'}">
            ${mejora > 0 ? '↑' : mejora < 0 ? '↓' : '='} ${Math.abs(mejora)} ${mejora > 0 ? 'correctas más' : mejora < 0 ? 'correctas menos' : 'sin cambio'}
          </span>
        </div>`;

      return `
        <div class="card flex-col gap-12">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="badge badge-warning">Sesión ${s.sessionNumber}</div>
            <span class="body-sm text-muted">${fecha}</span>
          </div>
          <div class="admin-scores-grid">
            <div class="admin-score-cell">
              <span class="body-sm text-muted">Pre-test</span>
              <span class="title-sm">${pre}/5</span>
            </div>
            <div class="admin-score-cell">
              <span class="body-sm text-muted">Post-test</span>
              <span class="title-sm">${post}/5</span>
            </div>
            <div class="admin-score-cell">
              <span class="body-sm text-muted">Juego</span>
              <span class="title-sm">${game} pts</span>
            </div>
            <div class="admin-score-cell">
              <span class="body-sm text-muted">SUS</span>
              <span class="title-sm">${sus}%</span>
            </div>
          </div>
          ${mejoraHtml}
          <button class="btn-link" style="text-align:left;font-size:.82rem"
                  onclick="toggleSessionDetail('${s.id}')">
            Ver respuestas detalladas ↓
          </button>
          <div id="sd-${s.id}" class="hidden flex-col gap-20" style="border-top:1px solid var(--border);padding-top:16px">
            ${buildSessionDetail(s)}
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<span class="form-error">Error al cargar: ${err.message}</span>`;
  }
}

/* ── Toggle del panel de detalle ── */
export function toggleSessionDetail(id) {
  const panel = document.getElementById(`sd-${id}`);
  const btn   = panel.previousElementSibling;
  const open  = panel.classList.toggle('hidden');
  btn.textContent = open ? 'Ver respuestas detalladas ↓' : 'Ocultar respuestas ↑';
}

/* ── Construcción del detalle de una sesión ── */
function buildSessionDetail(s) {
  return `
    ${buildTestSection('📝 Pre-test',  s.pretest?.respuestas)}
    <div class="divider"></div>
    ${buildGameSection(s.juego?.historial)}
    <div class="divider"></div>
    ${buildTestSection('📝 Post-test', s.posttest?.respuestas)}
    <div class="divider"></div>
    ${buildSUSSection(s.sus?.respuestas)}`;
}

function buildTestSection(titulo, respuestas = {}) {
  const rows = TEST_QUESTIONS.map((q, i) => {
    const selIdx    = respuestas?.[`q${i}`];
    const correcto  = selIdx === q.correcta;
    const respuesta = selIdx !== undefined ? q.opciones[selIdx] : null;
    return `
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="font-size:1.1rem;min-width:20px">${correcto ? '✅' : selIdx !== undefined ? '❌' : '⬜'}</span>
        <div class="flex-col gap-2">
          <span class="body-sm"><strong>P${i + 1}:</strong> ${q.texto}</span>
          ${respuesta
            ? `<span class="body-sm text-muted">Respondió: "${respuesta}"</span>`
            : '<span class="body-sm text-muted">Sin respuesta</span>'}
          ${!correcto && selIdx !== undefined
            ? `<span class="body-sm" style="color:var(--accent3)">Correcta: "${q.opciones[q.correcta]}"</span>`
            : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="flex-col gap-12">
      <div class="title-sm">${titulo}</div>
      ${rows}
    </div>`;
}

function buildGameSection(historial = []) {
  if (!historial.length) return '<div class="title-sm">🎮 Juego</div><p class="body-sm text-muted">Sin datos</p>';

  const rows = historial.map(h => {
    const esc = ESCENARIOS.find(e => e.nivel === h.nivel && e.idx === h.escenario);
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div style="display:flex;gap:8px;align-items:center">
          <span style="font-size:1rem">${h.correcto ? '✅' : '❌'}</span>
          <span class="body-sm">${esc?.titulo ?? `N${h.nivel} · Esc. ${h.escenario + 1}`}</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          ${h.streakBonus ? '<span style="font-size:.8rem">🔥</span>' : ''}
          <span class="body-sm bold" style="color:${h.delta > 0 ? 'var(--accent3)' : 'var(--accent2)'}">
            ${h.delta > 0 ? '+' : ''}${h.delta} pts
          </span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="flex-col gap-10">
      <div class="title-sm">🎮 Escenarios del juego</div>
      ${rows}
    </div>`;
}

function buildSUSSection(respuestas = {}) {
  const rows = SUS_PREGUNTAS.map((p, i) => {
    const val = respuestas?.[`q${i}`];
    const bar = val ? `<div style="display:flex;gap:4px">${[1,2,3,4,5].map(n =>
      `<div style="width:18px;height:18px;border-radius:4px;background:${n <= val ? 'var(--accent)' : 'var(--surface2)'};border:1px solid var(--border)"></div>`
    ).join('')}</div>` : '<span class="body-sm text-muted">—</span>';

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <span class="body-sm text-muted" style="flex:1">${i + 1}. ${p}</span>
        <div style="display:flex;align-items:center;gap:6px">
          ${bar}
          <span class="body-sm bold" style="min-width:20px;text-align:right">${val ?? '—'}</span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="flex-col gap-10">
      <div class="title-sm">🧩 SUS (Usabilidad)</div>
      ${rows}
    </div>`;
}

export { logoutUser };

/* ══════════════════════════════════════════════
   GESTIÓN DE CONTENIDO — Escenarios
══════════════════════════════════════════════ */

const NIVEL_NOMBRE = { 1: 'Nivel 1 — WhatsApp / Email', 2: 'Nivel 2 — SMS', 3: 'Nivel 3 — Redes Sociales' };

export async function cargarEscenarios() {
  goTo('p-admin-scenarios');
  const container = document.getElementById('admin-scenarios-list');
  container.innerHTML = '<p class="body-sm text-muted">Cargando escenarios...</p>';

  try {
    const items = await loadAllScenarios();
    if (!items.length) {
      container.innerHTML = `
        <p class="body-sm text-muted text-center">No hay escenarios en Firestore aún.</p>
        <button class="btn btn-primary mt-8" onclick="importarContenido()">📥 Importar contenido base</button>`;
      return;
    }

    const porNivel = { 1: [], 2: [], 3: [] };
    items.forEach(s => porNivel[s.nivel]?.push(s));

    container.innerHTML = [1, 2, 3].map(n => `
      <div class="flex-col gap-8">
        <div class="title-sm" style="margin-top:8px">${NIVEL_NOMBRE[n]}</div>
        ${porNivel[n].sort((a, b) => a.idx - b.idx).map(s => `
          <div class="card flex-col gap-8">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
              <span class="body-sm bold">${s.titulo}</span>
              <div style="display:flex;gap:8px;align-items:center">
                <span class="badge ${s.activo ? 'badge-success' : 'badge-danger'}">${s.activo ? 'Activo' : 'Inactivo'}</span>
                <button class="topbar-btn" onclick="toggleEscenario('${s.firestoreId}', ${s.activo})">${s.activo ? 'Desactivar' : 'Activar'}</button>
                <button class="topbar-btn" onclick="editarEscenario('${s.firestoreId}')">Editar</button>
              </div>
            </div>
            <p class="body-sm text-muted">${s.pregunta || ''}</p>
          </div>
        `).join('')}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<span class="form-error">Error: ${err.message}</span>`;
  }
}

export async function toggleEscenario(id, activo) {
  try {
    await updateScenario(id, { activo: !activo });
    cargarEscenarios();
  } catch (err) {
    alert('Error al actualizar: ' + err.message);
  }
}

let _editTarget = null;
let _editType   = null;

export function editarEscenario(id) {
  _editTarget = id;
  _editType   = 'scenario';
  loadAllScenarios().then(items => {
    const s = items.find(i => i.firestoreId === id);
    if (!s) return;
    document.getElementById('edit-titulo').value    = s.titulo || '';
    document.getElementById('edit-pregunta').value  = s.pregunta || '';
    document.getElementById('edit-opcion0').value   = s.opciones?.[0] || '';
    document.getElementById('edit-opcion1').value   = s.opciones?.[1] || '';
    document.getElementById('edit-opcion2').value   = s.opciones?.[2] || '';
    document.getElementById('edit-opcion3').value   = s.opciones?.[3] || '';
    document.getElementById('edit-correcta').value  = s.correcta ?? 0;
    document.getElementById('edit-explicacion').value = s.explicacion || '';
    document.getElementById('edit-header').textContent = `Editar escenario: ${s.titulo}`;
    document.getElementById('edit-back-fn').setAttribute('data-back', 'cargarEscenarios');
    goTo('p-admin-edit');
  });
}

/* ══════════════════════════════════════════════
   GESTIÓN DE CONTENIDO — Preguntas
══════════════════════════════════════════════ */

export async function cargarPreguntas() {
  goTo('p-admin-questions');
  const container = document.getElementById('admin-questions-list');
  container.innerHTML = '<p class="body-sm text-muted">Cargando preguntas...</p>';

  try {
    const items = await loadAllQuestions();
    if (!items.length) {
      container.innerHTML = `
        <p class="body-sm text-muted text-center">No hay preguntas en Firestore aún.</p>
        <button class="btn btn-primary mt-8" onclick="importarContenido()">📥 Importar contenido base</button>`;
      return;
    }

    container.innerHTML = items.map((q, i) => `
      <div class="card flex-col gap-8">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <span class="body-sm bold">P${i + 1}: ${q.texto.substring(0, 60)}...</span>
          <div style="display:flex;gap:8px">
            <span class="badge ${q.activo ? 'badge-success' : 'badge-danger'}">${q.activo ? 'Activa' : 'Inactiva'}</span>
            <button class="topbar-btn" onclick="togglePregunta('${q.firestoreId}', ${q.activo})">${q.activo ? 'Desactivar' : 'Activar'}</button>
            <button class="topbar-btn" onclick="editarPregunta('${q.firestoreId}')">Editar</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<span class="form-error">Error: ${err.message}</span>`;
  }
}

export async function togglePregunta(id, activo) {
  try {
    await updateQuestion(id, { activo: !activo });
    cargarPreguntas();
  } catch (err) {
    alert('Error al actualizar: ' + err.message);
  }
}

export function editarPregunta(id) {
  _editTarget = id;
  _editType   = 'question';
  loadAllQuestions().then(items => {
    const q = items.find(i => i.firestoreId === id);
    if (!q) return;
    document.getElementById('edit-titulo').value    = q.texto || '';
    document.getElementById('edit-pregunta').value  = '';
    document.getElementById('edit-opcion0').value   = q.opciones?.[0] || '';
    document.getElementById('edit-opcion1').value   = q.opciones?.[1] || '';
    document.getElementById('edit-opcion2').value   = q.opciones?.[2] || '';
    document.getElementById('edit-opcion3').value   = q.opciones?.[3] || '';
    document.getElementById('edit-correcta').value  = q.correcta ?? 0;
    document.getElementById('edit-explicacion').value = '';
    document.getElementById('edit-header').textContent = 'Editar pregunta';
    document.getElementById('edit-back-fn').setAttribute('data-back', 'cargarPreguntas');
    goTo('p-admin-edit');
  });
}

export async function guardarEdicion() {
  const titulo    = document.getElementById('edit-titulo').value.trim();
  const pregunta  = document.getElementById('edit-pregunta').value.trim();
  const opciones  = [0,1,2,3].map(i => document.getElementById(`edit-opcion${i}`).value.trim());
  const correcta  = parseInt(document.getElementById('edit-correcta').value);
  const explicacion = document.getElementById('edit-explicacion').value.trim();

  if (!titulo || opciones.some(o => !o)) {
    alert('Completa al menos el título y las 4 opciones.');
    return;
  }

  const btn = document.getElementById('btn-guardar-edicion');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    if (_editType === 'scenario') {
      const updates = { titulo, pregunta, opciones, correcta };
      if (explicacion) updates.explicacion = explicacion;
      await updateScenario(_editTarget, updates);
      cargarEscenarios();
    } else {
      await updateQuestion(_editTarget, { texto: titulo, opciones, correcta });
      cargarPreguntas();
    }
  } catch (err) {
    alert('Error al guardar: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Guardar cambios';
  }
}

/* ══════════════════════════════════════════════
   IMPORTAR CONTENIDO BASE A FIRESTORE
══════════════════════════════════════════════ */

export async function importarContenido() {
  if (!confirm('¿Importar los 27 escenarios y 10 preguntas a Firestore? Esto no borra datos existentes.')) return;
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Importando...';
  try {
    await seedContent(ESCENARIOS_FULL, TEST_QUESTIONS_FULL);
    alert('✅ Contenido importado correctamente.');
    cargarEscenarios();
  } catch (err) {
    alert('Error al importar: ' + err.message);
    btn.disabled = false;
    btn.textContent = '📥 Importar contenido base';
  }
}
