/* Panel de administrador */
import { goTo } from './state.js';
import { getAllUsers, getUserSessions, getAllSessions, migrarSusAKab, loadAllScenarios, loadAllQuestions, updateScenario, updateQuestion, seedContent, syncScenarioLinks, syncConsequencias, syncOpciones, deleteParticipante } from '../firebase/db.js';
import { logoutUser } from '../firebase/auth.js';
import { TEST_QUESTIONS_A } from '../data/test-questions-a.js';
import { TEST_QUESTIONS_B } from '../data/test-questions-b.js';
import { ESCENARIOS_FULL } from '../data/escenarios-full.js';
import { TEST_QUESTIONS_FULL } from '../data/test-questions-full.js';
import { ESCENARIOS } from '../data/escenarios.js';
import { SUS_PREGUNTAS, LIKERT_LABELS } from '../data/nivel-config.js';
import { mean, stdDev, pairedTTest } from './stats.js';

let _allUsers = [];
let _sessions = [];
let _currentUid = null;

function calcTasaExito(historial) {
  if (!historial?.length) return null;
  return Math.round(historial.filter(h => h.correcto).length / historial.length * 100);
}

/* ── Lista de participantes ── */
export async function cargarPanelAdmin() {
  goTo('p-admin');
  const searchEl = document.getElementById('admin-search');
  if (searchEl) searchEl.value = '';
  const container = document.getElementById('admin-participants');
  container.innerHTML = '<p class="body-sm text-muted">Cargando participantes...</p>';

  try {
    _allUsers = await getAllUsers();
    renderParticipantes(_allUsers.filter(u => u.role !== 'admin'));
    calcularTasaGeneral();
  } catch (err) {
    container.innerHTML = `<span class="form-error">Error al cargar: ${err.message}</span>`;
  }
}

async function calcularTasaGeneral() {
  const card = document.getElementById('admin-tasa-general');
  if (!card) return;
  const participantes = _allUsers.filter(u => u.role !== 'admin');
  if (!participantes.length) { card.style.display = 'none'; return; }
  document.getElementById('admin-tasa-valor').textContent = '…';
  document.getElementById('admin-tasa-detalle').textContent = 'Calculando...';
  card.style.display = 'flex';

  try {
    const todasLasSesiones = await Promise.all(participantes.map(u => getUserSessions(u.uid)));
    let totalCorrectos = 0, totalIntentos = 0;
    todasLasSesiones.flat().forEach(s => {
      (s.juego?.historial || []).forEach(h => {
        totalIntentos++;
        if (h.correcto) totalCorrectos++;
      });
    });
    if (!totalIntentos) {
      document.getElementById('admin-tasa-valor').textContent = '—';
      document.getElementById('admin-tasa-detalle').textContent = 'Ningún participante ha completado sesiones aún.';
      return;
    }
    const tasa = Math.round(totalCorrectos / totalIntentos * 100);
    document.getElementById('admin-tasa-valor').textContent = tasa + '%';
    document.getElementById('admin-tasa-detalle').textContent =
      `${totalCorrectos} escenarios correctos de ${totalIntentos} intentos totales — ${participantes.length} participante${participantes.length !== 1 ? 's' : ''}`;
    card.style.display = 'flex';
  } catch { }
}

function renderParticipantes(participantes) {
  const container = document.getElementById('admin-participants');

  if (participantes.length === 0) {
    container.innerHTML = '<p class="body-sm text-muted text-center mt-8">No se encontraron participantes.</p>';
    return;
  }

  container.innerHTML = participantes
    .sort((a, b) => (b.sessionCount || 0) - (a.sessionCount || 0))
    .map(u => {
      const sesiones = u.sessionCount || 0;
      const genero = u.genero === 'M' ? 'Masculino' : u.genero === 'F' ? 'Femenino' : null;
      const meta = [u.edad ? u.edad + ' años' : null, genero, u.email].filter(Boolean).join(' · ');
      return `
        <div class="admin-participant-card" onclick="verDetalleParticipante('${u.uid}')">
          <div style="display:flex;gap:12px;align-items:center;flex:1;min-width:0">
            <div class="admin-avatar" style="flex-shrink:0">${(u.nombre || '?')[0].toUpperCase()}</div>
            <div style="min-width:0">
              <div class="title-sm">${u.nombre || 'Sin nombre'}</div>
              <div class="body-sm text-muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${meta}</div>
            </div>
          </div>
          <div class="badge ${sesiones > 0 ? 'badge-success' : 'badge-info'}" style="flex-shrink:0">
            ${sesiones} sesión${sesiones !== 1 ? 'es' : ''}
          </div>
        </div>`;
    }).join('');
}

export function filtrarParticipantes(query) {
  const participantes = _allUsers.filter(u => u.role !== 'admin');
  if (!query.trim()) {
    renderParticipantes(participantes);
    return;
  }
  const q = query.toLowerCase();
  renderParticipantes(participantes.filter(u => (u.nombre || '').toLowerCase().includes(q)));
}

/* ── Detalle de un participante ── */
export async function verDetalleParticipante(uid) {
  const user = _allUsers.find(u => u.uid === uid);
  goTo('p-admin-detail');

  const btnEliminar = document.getElementById('btn-eliminar-participante');
  if (btnEliminar) {
    btnEliminar.onclick = () => eliminarParticipante(uid);
    btnEliminar.disabled = false;
    btnEliminar.textContent = '🗑️ Eliminar participante';
  }

  document.getElementById('detail-nombre').textContent = user?.nombre || 'Participante';
  document.getElementById('detail-info').textContent = [
    user?.edad ? user.edad + ' años' : null,
    user?.genero === 'M' ? 'Masculino' : user?.genero === 'F' ? 'Femenino' : null,
    user?.email,
  ].filter(Boolean).join(' · ');

  const container = document.getElementById('detail-sessions');
  container.innerHTML = '<p class="body-sm text-muted">Cargando sesiones...</p>';

  try {
    _sessions = await getUserSessions(uid);
    _currentUid = uid;

    if (_sessions.length === 0) {
      container.innerHTML = '<p class="body-sm text-muted text-center mt-8">Este participante no ha completado ninguna sesión.</p>';
      return;
    }

    const maxPuntaje = Math.max(..._sessions.map(s => s.juego?.puntaje_total ?? -Infinity));

    let totalCorrectos = 0, totalIntentos = 0;
    _sessions.forEach(s => {
      (s.juego?.historial || []).forEach(h => {
        totalIntentos++;
        if (h.correcto) totalCorrectos++;
      });
    });
    const tasaParticipante = totalIntentos ? Math.round(totalCorrectos / totalIntentos * 100) : null;
    const detalleTasa = document.getElementById('detail-tasa');
    if (tasaParticipante !== null && detalleTasa) {
      document.getElementById('detail-tasa-valor').textContent = tasaParticipante + '%';
      document.getElementById('detail-tasa-detalle').textContent =
        `${totalCorrectos} de ${totalIntentos} escenarios correctos en ${_sessions.length} sesión${_sessions.length !== 1 ? 'es' : ''}`;
      detalleTasa.style.display = 'flex';
    }

    container.innerHTML = _sessions.map(s => {
      const fecha  = s.completadoEn?.toDate
        ? s.completadoEn.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';
      const pre    = s.pretest?.score  ?? '—';
      const post   = s.posttest?.score ?? '—';
      const game   = s.juego?.puntaje_total ?? '—';
      const tasa   = calcTasaExito(s.juego?.historial);
      const mejora = (typeof pre === 'number' && typeof post === 'number') ? post - pre : null;

      const mejoraHtml = mejora === null ? '' : `
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end">
          <span class="body-sm text-muted">Pre→Post:</span>
          <span class="bold" style="color:${mejora > 0 ? 'var(--accent3)' : mejora < 0 ? 'var(--accent2)' : 'var(--text-muted)'}">
            ${mejora > 0 ? '↑' : mejora < 0 ? '↓' : '='} ${Math.abs(mejora)} ${mejora > 0 ? 'correctas más' : mejora < 0 ? 'correctas menos' : 'sin cambio'}
          </span>
        </div>`;

      const tiemposValidos = (s.juego?.historial || []).filter(h => h.tiempoSegundos != null);
      const tiempoTotal = tiemposValidos.length
        ? tiemposValidos.reduce((acc, h) => acc + h.tiempoSegundos, 0)
        : null;
      const tiempoStr = tiempoTotal === null ? null
        : tiempoTotal >= 60 ? `${Math.floor(tiempoTotal / 60)}m ${tiempoTotal % 60}s`
        : `${tiempoTotal}s`;

      const preColor  = typeof pre  === 'number' ? (pre  >= 4 ? 'var(--accent3)' : pre  >= 2 ? 'var(--accent)' : 'var(--accent2)') : 'var(--text)';
      const postColor = typeof post === 'number' ? (post >= 4 ? 'var(--accent3)' : post >= 2 ? 'var(--accent)' : 'var(--accent2)') : 'var(--text)';

      return `
        <div class="card flex-col gap-12">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;gap:8px;align-items:center">
              <div class="badge badge-warning">Sesión ${s.sessionNumber}</div>
              ${typeof game === 'number' && game === maxPuntaje ? '<div class="badge badge-success">⭐ Mejor sesión</div>' : ''}
            </div>
            <span class="body-sm text-muted">${fecha}</span>
          </div>
          <div class="admin-scores-grid" style="${tiempoStr ? 'grid-template-columns:repeat(5,1fr)' : ''}">
            <div class="admin-score-cell">
              <span class="body-sm text-muted">Pre-test</span>
              <span class="title-sm" style="color:${preColor}">${pre}/10</span>
            </div>
            <div class="admin-score-cell">
              <span class="body-sm text-muted">Post-test</span>
              <span class="title-sm" style="color:${postColor}">${post}/10</span>
            </div>
            <div class="admin-score-cell">
              <span class="body-sm text-muted">Juego</span>
              <span class="title-sm">${game} pts</span>
            </div>
            <div class="admin-score-cell">
              <span class="body-sm text-muted">Tasa éxito</span>
              <span class="title-sm">${tasa !== null ? tasa + '%' : '—'}</span>
            </div>
            ${tiempoStr ? `
            <div class="admin-score-cell">
              <span class="body-sm text-muted">Tiempo</span>
              <span class="title-sm">⏱ ${tiempoStr}</span>
            </div>` : ''}
          </div>
          ${mejoraHtml}
          <button class="btn-link" style="text-align:left;font-size:.82rem"
                  onclick="verDetalleSesion('${s.id}')">
            Ver respuestas detalladas →
          </button>
        </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<span class="form-error">Error al cargar: ${err.message}</span>`;
  }
}

/* ── Pantalla de detalle de sesión ── */
export function verDetalleSesion(sessionId) {
  const s = _sessions.find(s => s.id === sessionId);
  if (!s) return;

  const maxPuntaje = Math.max(..._sessions.map(s => s.juego?.puntaje_total ?? -Infinity));
  const esMejor = typeof s.juego?.puntaje_total === 'number' && s.juego.puntaje_total === maxPuntaje;
  const fecha = s.completadoEn?.toDate
    ? s.completadoEn.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  document.getElementById('session-badge').textContent = `Sesión ${s.sessionNumber} · ${fecha}`;
  document.getElementById('session-best-badge').classList.toggle('hidden', !esMejor);

  const pre  = s.pretest?.score  ?? '—';
  const post = s.posttest?.score ?? '—';
  const game = s.juego?.puntaje_total ?? '—';
  const tasa = calcTasaExito(s.juego?.historial);
  const preColor  = typeof pre  === 'number' ? (pre  >= 4 ? 'var(--accent3)' : pre  >= 2 ? 'var(--accent)' : 'var(--accent2)') : 'var(--text)';
  const postColor = typeof post === 'number' ? (post >= 4 ? 'var(--accent3)' : post >= 2 ? 'var(--accent)' : 'var(--accent2)') : 'var(--text)';

  const tiemposValidos = (s.juego?.historial || []).filter(h => h.tiempoSegundos != null);
  const tiempoTotal = tiemposValidos.length ? tiemposValidos.reduce((a, h) => a + h.tiempoSegundos, 0) : null;
  const tiempoStr = tiempoTotal === null ? null : tiempoTotal >= 60 ? `${Math.floor(tiempoTotal / 60)}m ${tiempoTotal % 60}s` : `${tiempoTotal}s`;

  document.getElementById('session-detail-container').innerHTML = `
    <div class="session-scores-bar">
      <div class="admin-score-cell">
        <span class="body-sm text-muted">Pre-test</span>
        <span class="title-md" style="color:${preColor}">${pre}/10</span>
      </div>
      <div class="admin-score-cell">
        <span class="body-sm text-muted">Post-test</span>
        <span class="title-md" style="color:${postColor}">${post}/10</span>
      </div>
      <div class="admin-score-cell">
        <span class="body-sm text-muted">Juego</span>
        <span class="title-md">${game} pts</span>
      </div>
      <div class="admin-score-cell">
        <span class="body-sm text-muted">Tasa éxito</span>
        <span class="title-md">${tasa !== null ? tasa + '%' : '—'}</span>
      </div>
      ${tiempoStr ? `<div class="admin-score-cell">
        <span class="body-sm text-muted">Tiempo</span>
        <span class="title-md">⏱ ${tiempoStr}</span>
      </div>` : ''}
    </div>
    ${buildTestCompare(s.pretest?.respuestas, s.posttest?.respuestas)}
    <div class="divider"></div>
    <div class="session-bottom-grid">
      ${buildGameSection(s.juego?.historial)}
      <div class="divider session-bottom-divider"></div>
      ${buildSUSSection(s.kab?.respuestas ?? s.sus?.respuestas)}
    </div>`;

  goTo('p-admin-session');
}

export function volverADetalle() {
  verDetalleParticipante(_currentUid);
}

export async function eliminarParticipante(uid) {
  const user = _allUsers.find(u => u.uid === uid);
  const nombre = user?.nombre || 'este participante';
  if (!confirm(`¿Eliminar a ${nombre} y todas sus sesiones? Esta acción no se puede deshacer.`)) return;

  const btn = document.getElementById('btn-eliminar-participante');
  if (btn) { btn.disabled = true; btn.textContent = 'Eliminando...'; }

  try {
    await deleteParticipante(uid);
    cargarPanelAdmin();
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
    if (btn) { btn.disabled = false; btn.textContent = '🗑️ Eliminar participante'; }
  }
}

/* ══════════════════════════════════════════════
   VISTA 2 — RESUMEN ESTADÍSTICO AGREGADO
══════════════════════════════════════════════ */

let _statsRows = [];   // filas para exportar CSV

// Devuelve la PRIMERA sesión de cada participante (menor timestamp)
function primeraSesionPorParticipante(participantes, sesiones) {
  const porUsuario = {};
  sesiones.forEach(s => {
    if (!porUsuario[s.userId]) porUsuario[s.userId] = [];
    porUsuario[s.userId].push(s);
  });
  const ts = s => (s.completadoEn?.toMillis ? s.completadoEn.toMillis()
    : s.completadoEn?.seconds ? s.completadoEn.seconds * 1000
    : (s.sessionNumber || 0));
  const out = [];
  participantes.forEach(u => {
    const lista = porUsuario[u.uid];
    if (!lista?.length) return;
    const primera = [...lista].sort((a, b) => ts(a) - ts(b))[0];
    out.push({ user: u, sesion: primera });
  });
  return out;
}

export async function cargarEstadisticas() {
  goTo('p-admin-stats');
  const cont = document.getElementById('admin-stats-container');
  cont.innerHTML = '<p class="body-sm text-muted">Cargando estadísticas...</p>';

  try {
    const [users, sesiones] = await Promise.all([getAllUsers(), getAllSessions()]);
    const participantes = users.filter(u => u.role !== 'admin');
    const registros = primeraSesionPorParticipante(participantes, sesiones);

    // Solo incluir registros con O₁ y O₂ numéricos
    const validos = registros.filter(r =>
      typeof r.sesion.pretest?.score === 'number' &&
      typeof r.sesion.posttest?.score === 'number');

    if (validos.length < 1) {
      cont.innerHTML = `
        <div class="flex-col gap-4 mt-8">
          <h2 class="title-lg">📊 Resumen estadístico</h2>
          <p class="body-sm text-muted">No hay participantes con pre-test y post-test completos para analizar.</p>
        </div>
        <div class="card flex-col gap-8">
          <span class="body-sm text-muted">Participantes registrados: <strong>${participantes.length}</strong></span>
        </div>`;
      _statsRows = [];
      return;
    }

    const O1 = validos.map(r => r.sesion.pretest.score);
    const O2 = validos.map(r => r.sesion.posttest.score);
    const deltas = O1.map((v, i) => O2[i] - v);
    const juego = validos
      .map(r => r.sesion.juego?.puntaje_total)
      .filter(v => typeof v === 'number');

    // Construir filas para CSV + KAB
    _statsRows = validos.map((r, i) => {
      const kab = r.sesion.kab?.respuestas ?? r.sesion.sus?.respuestas ?? {};
      const a1 = kab.q0 ?? '', a2 = kab.q1 ?? '', a3 = kab.q2 ?? '';
      const kabVals = [a1, a2, a3].filter(v => typeof v === 'number');
      const kabMedia = kabVals.length ? mean(kabVals) : '';
      const fecha = r.sesion.completadoEn?.toDate
        ? r.sesion.completadoEn.toDate().toLocaleDateString('es-PE')
        : '—';
      return {
        nombre: r.user.nombre || 'Sin nombre',
        fecha,
        o1: O1[i], o2: O2[i], delta: deltas[i],
        juego: r.sesion.juego?.puntaje_total ?? '',
        a1, a2, a3,
        kabMedia: kabMedia === '' ? '' : Number(kabMedia.toFixed(2)),
      };
    });

    // Estadística descriptiva
    const desc = {
      nRegistrados: participantes.length,
      n: validos.length,
      mediaO1: mean(O1),
      mediaO2: mean(O2),
      mediaDelta: mean(deltas),
      sdDelta: stdDev(deltas),
      minDelta: Math.min(...deltas),
      maxDelta: Math.max(...deltas),
      mejoraron: deltas.filter(d => d > 0).length,
      iguales: deltas.filter(d => d === 0).length,
      bajaron: deltas.filter(d => d < 0).length,
      mediaJuego: juego.length ? mean(juego) : null,
    };

    // Prueba t (requiere n ≥ 2)
    const tt = validos.length >= 2 ? pairedTTest(O1, O2) : null;

    // KAB: medias y distribuciones por ítem
    const kabPorItem = [0, 1, 2].map(qi => {
      const vals = validos
        .map(r => (r.sesion.kab?.respuestas ?? r.sesion.sus?.respuestas ?? {})[`q${qi}`])
        .filter(v => typeof v === 'number');
      const dist = [1, 2, 3, 4, 5].map(n => vals.filter(v => v === n).length);
      return { media: vals.length ? mean(vals) : null, dist, n: vals.length };
    });
    const kabGlobal = (() => {
      const todos = kabPorItem.flatMap((it, qi) => validos
        .map(r => (r.sesion.kab?.respuestas ?? r.sesion.sus?.respuestas ?? {})[`q${qi}`])
        .filter(v => typeof v === 'number'));
      return todos.length ? mean(todos) : null;
    })();

    cont.innerHTML = renderEstadisticas(desc, tt, kabPorItem, kabGlobal);
  } catch (err) {
    cont.innerHTML = `<span class="form-error">Error al calcular: ${err.message}</span>`;
  }
}

function renderEstadisticas(d, tt, kabPorItem, kabGlobal) {
  const fmt = (x, dec = 2) => (x === null || x === undefined || Number.isNaN(x)) ? '—' : Number(x).toFixed(dec);

  // Tarjetas descriptivas
  const descCells = [
    ['N participantes (analizados)', `${d.n}`],
    ['Media O₁ (pre-test)', `${fmt(d.mediaO1)} / 10`],
    ['Media O₂ (post-test)', `${fmt(d.mediaO2)} / 10`],
    ['Media Δ (O₂ − O₁)', fmt(d.mediaDelta)],
    ['Desviación estándar de Δ', fmt(d.sdDelta)],
    ['Δ mínimo / máximo', `${fmt(d.minDelta, 0)} / ${fmt(d.maxDelta, 0)}`],
    ['Media puntaje del juego', d.mediaJuego === null ? '—' : `${fmt(d.mediaJuego)} pts`],
  ].map(([k, v]) => `
    <div class="stats-cell">
      <span class="body-sm text-muted">${k}</span>
      <span class="title-sm">${v}</span>
    </div>`).join('');

  // Distribución de Δ
  const totalDist = d.mejoraron + d.iguales + d.bajaron || 1;
  const distBar = (label, val, color) => {
    const pct = Math.round(val / totalDist * 100);
    return `
      <div class="flex-col gap-4">
        <div style="display:flex;justify-content:space-between">
          <span class="body-sm">${label}</span>
          <span class="body-sm bold">${val} (${pct}%)</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      </div>`;
  };

  // Prueba t
  let tHtml;
  if (!tt) {
    tHtml = '<p class="body-sm text-muted">Se requieren al menos 2 participantes para la prueba t.</p>';
  } else {
    const significativo = tt.pOne < 0.05;
    const conclusion = significativo
      ? 'Se rechaza H₀. OjoAlFraude produjo una mejora significativa en la concientización.'
      : 'No se rechaza H₀. No es posible afirmar que la mejora no sea producto del azar.';
    tHtml = `
      <div class="stats-grid">
        <div class="stats-cell"><span class="body-sm text-muted">Estadístico t</span><span class="title-sm">${fmt(tt.t, 4)}</span></div>
        <div class="stats-cell"><span class="body-sm text-muted">Grados de libertad (N−1)</span><span class="title-sm">${tt.df}</span></div>
        <div class="stats-cell"><span class="body-sm text-muted">Valor p (una cola)</span><span class="title-sm">${fmt(tt.pOne, 4)}</span></div>
        <div class="stats-cell"><span class="body-sm text-muted">α</span><span class="title-sm">0.05</span></div>
      </div>
      <div class="card" style="background:${significativo ? 'rgba(107,203,119,.1)' : 'rgba(235,77,75,.08)'};border-color:${significativo ? 'var(--accent3)' : 'var(--accent2)'}">
        <div style="display:flex;gap:10px;align-items:flex-start">
          <span style="font-size:1.4rem">${significativo ? '✅' : '⚠️'}</span>
          <div class="flex-col gap-2">
            <span class="body-md bold">${conclusion}</span>
            <span class="body-sm text-muted">H₁: μO₂ &gt; μO₁ · Prueba t de Student para muestras relacionadas (una cola)</span>
          </div>
        </div>
      </div>`;
  }

  // KAB
  const kabRows = kabPorItem.map((it, i) => {
    const etiqueta = it.media === null ? '—' : LIKERT_LABELS[Math.round(it.media) - 1];
    const distTxt = it.dist.map((c, n) => `${n + 1}:${c}`).join('  ');
    return `
      <div class="flex-col gap-6" style="padding:10px 0;border-bottom:1px solid var(--surface2)">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
          <span class="body-sm" style="flex:1"><strong>A${i + 1}.</strong> ${SUS_PREGUNTAS[i]}</span>
          <div style="text-align:right;flex-shrink:0">
            <div class="title-sm">${fmt(it.media)}</div>
            <div class="body-sm text-muted" style="font-size:.72rem">${etiqueta}</div>
          </div>
        </div>
        <div class="body-sm text-muted" style="font-size:.72rem">Frecuencias (1→5): ${distTxt}</div>
      </div>`;
  }).join('');

  return `
    <div class="flex-col gap-4 mt-8">
      <h2 class="title-lg">📊 Resumen estadístico</h2>
      <p class="body-sm text-muted">Análisis sobre la primera sesión de cada participante · ${d.nRegistrados} registrado(s), ${d.n} analizado(s)</p>
    </div>

    <div class="card flex-col gap-12">
      <div class="title-sm">📈 Estadística descriptiva</div>
      <div class="stats-grid">${descCells}</div>
    </div>

    <div class="card flex-col gap-12">
      <div class="title-sm">📊 Distribución de Δ (cambio pre→post)</div>
      ${distBar('Mejoraron (Δ &gt; 0)', d.mejoraron, 'var(--accent3)')}
      ${distBar('Sin cambio (Δ = 0)', d.iguales, 'var(--text-muted)')}
      ${distBar('Bajaron (Δ &lt; 0)', d.bajaron, 'var(--accent2)')}
    </div>

    <div class="card flex-col gap-12">
      <div class="title-sm">🧪 Prueba t de Student (muestras relacionadas)</div>
      ${tHtml}
    </div>

    <div class="card flex-col gap-8">
      <div class="title-sm">🧠 Encuesta de concientización (KAB)</div>
      ${kabRows}
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px">
        <span class="body-md bold">Media global (A1–A3)</span>
        <span class="title-sm text-accent">${fmt(kabGlobal)}</span>
      </div>
    </div>`;
}

export function exportarEstadisticasCSV() {
  if (!_statsRows.length) { alert('No hay datos para exportar.'); return; }
  const headers = ['nombre', 'fecha', 'O1', 'O2', 'delta', 'puntaje_juego', 'KAB_A1', 'KAB_A2', 'KAB_A3', 'KAB_media'];
  const esc = v => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  _statsRows.forEach(r => {
    lines.push([r.nombre, r.fecha, r.o1, r.o2, r.delta, r.juego, r.a1, r.a2, r.a3, r.kabMedia].map(esc).join(','));
  });
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OjoAlFraude_estadisticas_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function migrarKAB() {
  if (!confirm('¿Migrar el campo "sus" a "kab" en las sesiones existentes? Es seguro y no borra datos.')) return;
  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = 'Migrando...'; }
  try {
    const n = await migrarSusAKab();
    alert(`✅ ${n} sesión(es) migrada(s) de "sus" a "kab".`);
  } catch (err) {
    alert('Error al migrar: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔁 Migrar SUS → KAB'; }
  }
}

export function switchTestTab(tab) {
  document.getElementById('tab-content-pre').classList.toggle('hidden', tab !== 'pre');
  document.getElementById('tab-content-post').classList.toggle('hidden', tab !== 'post');
  document.getElementById('tab-btn-pre').classList.toggle('active', tab === 'pre');
  document.getElementById('tab-btn-post').classList.toggle('active', tab === 'post');
}

/* ── Construcción del detalle de una sesión ── */
function buildSessionDetail(s) {
  return `
    <div class="session-detail-grid">
      ${buildTestSection('📝 Pre-test',  s.pretest?.respuestas)}
      <div class="divider"></div>
      ${buildGameSection(s.juego?.historial)}
      <div class="divider"></div>
      ${buildTestSection('📝 Post-test', s.posttest?.respuestas)}
    </div>
    <div class="divider mt-8"></div>
    ${buildSUSSection(s.kab?.respuestas ?? s.sus?.respuestas)}`;
}

function buildTestCompare(pre = {}, post = {}) {
  const rows = TEST_QUESTIONS_A.map((qA, i) => {
    const qB     = TEST_QUESTIONS_B[i];
    const preIdx  = pre?.[`q${i}`];
    const postIdx = post?.[`q${i}`];
    const preOk   = preIdx  === qA.correcta;
    const postOk  = postIdx === qB.correcta;

    const cellPre  = preIdx  !== undefined
      ? `<div class="flex-col gap-2"><span style="font-size:1rem">${preOk  ? '✅' : '❌'}</span><span class="body-sm text-muted" style="font-size:.72rem">${qA.opciones[preIdx].substring(0,30)}${qA.opciones[preIdx].length > 30 ? '…' : ''}</span></div>`
      : '<span class="body-sm text-muted">—</span>';
    const cellPost = postIdx !== undefined
      ? `<div class="flex-col gap-2"><span style="font-size:1rem">${postOk ? '✅' : '❌'}</span><span class="body-sm text-muted" style="font-size:.72rem">${qB.opciones[postIdx].substring(0,30)}${qB.opciones[postIdx].length > 30 ? '…' : ''}</span></div>`
      : '<span class="body-sm text-muted">—</span>';

    const arrow = (!preOk && postOk) ? '↗️' : (preOk && !postOk) ? '↘️' : (preOk && postOk) ? '✓' : '✗';
    const arrowColor = (!preOk && postOk) ? 'var(--accent3)' : (preOk && !postOk) ? 'var(--accent2)' : (preOk && postOk) ? 'var(--accent3)' : 'var(--text-muted)';

    return `
      <div class="test-compare-row">
        <span class="body-sm"><strong>${qA.constructo}</strong></span>
        ${cellPre}
        <span style="color:${arrowColor};font-size:1rem;text-align:center">${arrow}</span>
        ${cellPost}
      </div>`;
  }).join('');

  return `
    <div class="flex-col gap-12">
      <div class="title-sm">📝 Pre-test vs Post-test (por constructo)</div>
      <div class="test-compare-header">
        <span class="body-sm text-muted">Constructo</span>
        <span class="body-sm text-muted">Antes (A)</span>
        <span></span>
        <span class="body-sm text-muted">Después (B)</span>
      </div>
      ${rows}
    </div>`;
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

const NIVEL_LABELS = { 1: 'Nivel 1 — Básico', 2: 'Nivel 2 — Intermedio', 3: 'Nivel 3 — Avanzado' };

function buildGameSection(historial = []) {
  if (!historial.length) return '<div class="title-sm">🎮 Juego</div><p class="body-sm text-muted">Sin datos</p>';

  const porNivel = {};
  historial.forEach(h => {
    if (!porNivel[h.nivel]) porNivel[h.nivel] = [];
    porNivel[h.nivel].push(h);
  });

  const nivelRows = [1, 2, 3].map(n => {
    if (!porNivel[n]?.length) return '';
    const rows = porNivel[n].map(h => {
      const esc = ESCENARIOS.find(e => e.nivel === h.nivel && e.idx === h.escenario);
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:1rem">${h.correcto ? '✅' : '❌'}</span>
            <span class="body-sm">${esc?.titulo ?? `Esc. ${h.escenario + 1}`}</span>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            ${h.tiempoSegundos != null ? `<span class="body-sm text-muted">${h.tiempoSegundos}s</span>` : ''}
            ${h.streakBonus ? '<span style="font-size:.8rem">🔥</span>' : ''}
            <span class="body-sm bold" style="color:${h.delta > 0 ? 'var(--accent3)' : 'var(--accent2)'}">
              ${h.delta > 0 ? '+' : ''}${h.delta} pts
            </span>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="flex-col gap-8">
        <div style="font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;padding-bottom:4px;border-bottom:1px solid var(--border)">${NIVEL_LABELS[n]}</div>
        ${rows}
      </div>`;
  }).join('');

  return `
    <div class="flex-col gap-14">
      <div class="title-sm">🎮 Escenarios del juego</div>
      ${nivelRows}
    </div>`;
}

const LIKERT_LABELS_SHORT = ['T. desacuerdo', 'Desacuerdo', 'Neutral', 'De acuerdo', 'T. de acuerdo'];

function buildSUSSection(respuestas = {}) {
  const rows = SUS_PREGUNTAS.map((p, i) => {
    const val = respuestas?.[`q${i}`];
    const bar = val ? `<div style="display:flex;gap:4px">${[1,2,3,4,5].map(n =>
      `<div title="${LIKERT_LABELS_SHORT[n-1]}" style="width:18px;height:18px;border-radius:4px;background:${n <= val ? 'var(--accent)' : 'var(--surface2)'};border:1px solid var(--border)"></div>`
    ).join('')}</div>` : '<span class="body-sm text-muted">—</span>';

    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <span class="body-sm text-muted" style="flex:1">${i + 1}. ${p}</span>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          ${bar}
          <span class="body-sm bold" style="min-width:20px;text-align:right">${val ? LIKERT_LABELS_SHORT[val - 1] : '—'}</span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="flex-col gap-12" style="background:var(--surface2);border-radius:var(--radius-sm);padding:16px">
      <div class="title-sm">🧩 Encuesta complementaria</div>
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

export async function sincronizarOpciones() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Sincronizando...';
  try {
    const n = await syncOpciones(ESCENARIOS_FULL);
    alert(`✅ ${n} escenario(s) actualizado(s) con nuevas opciones y consecuencia_ok.`);
    btn.disabled = false;
    btn.textContent = '🔄 Sincronizar opciones y respuestas';
  } catch (err) {
    alert('Error al sincronizar: ' + err.message);
    btn.disabled = false;
    btn.textContent = '🔄 Sincronizar opciones y respuestas';
  }
}

export async function sincronizarConsequencias() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Sincronizando...';
  try {
    const n = await syncConsequencias(ESCENARIOS_FULL);
    alert(`✅ ${n} escenario(s) actualizado(s) con nuevas consecuencias.`);
    btn.disabled = false;
    btn.textContent = '📝 Sincronizar consecuencias';
  } catch (err) {
    alert('Error al sincronizar: ' + err.message);
    btn.disabled = false;
    btn.textContent = '📝 Sincronizar consecuencias';
  }
}

// Sincroniza los enlaces a páginas falsas (linkUrl) hacia los escenarios ya existentes en Firestore
export async function sincronizarEnlaces() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Sincronizando...';
  try {
    const n = await syncScenarioLinks(ESCENARIOS_FULL);
    alert(`✅ ${n} escenario(s) actualizado(s) con su enlace de página falsa.`);
    btn.disabled = false;
    btn.textContent = '🔗 Sincronizar enlaces de páginas falsas';
  } catch (err) {
    alert('Error al sincronizar: ' + err.message);
    btn.disabled = false;
    btn.textContent = '🔗 Sincronizar enlaces de páginas falsas';
  }
}
