/* Motor del juego: intros, escenarios, winstreak, feedback */
import { STATE, goTo } from './state.js';
import { ESCENARIOS } from '../data/escenarios.js';       // fallback local
import { NIVEL_CONFIG } from '../data/nivel-config.js';
import { mostrarResultado } from './results.js';
import { renderMensaje } from './mensaje-renderer.js';

export function goToIntroNivel(n) {
  const cfg = NIVEL_CONFIG[n - 1];
  document.getElementById('intro-icon').textContent = cfg.icon;
  const badge = document.getElementById('intro-badge');
  badge.className = `badge ${cfg.badgeClass} mb-12`;
  badge.textContent = cfg.numero;
  document.getElementById('intro-titulo').textContent = cfg.titulo;
  document.getElementById('intro-subtitulo').textContent = cfg.subtitulo;
  document.getElementById('intro-descripcion').innerHTML = cfg.descripcion;
  const btn = document.getElementById('intro-btn');
  btn.textContent = `¡Empezar Nivel ${n}! 🚀`;
  btn.onclick = () => iniciarNivel(n);
  goTo('p-intro-nivel');
}

export function iniciarNivel(n) {
  STATE.nivelActual = n;
  STATE.escenarioIdx = 0;
  document.getElementById('topbar-nivel-titulo').textContent = NIVEL_CONFIG[n - 1].topbarTitulo;
  goTo('p-nivel');
  renderEscenario(n);
}

export function getEscenariosNivel(n) {
  // Usar selección aleatoria de Firestore si está disponible; fallback a local
  const dinamicos = STATE.escenariosActuales?.[n];
  if (dinamicos?.length) return dinamicos;
  return ESCENARIOS.filter(e => e.nivel === n);
}

export function renderEscenario(n) {
  const escenarios = getEscenariosNivel(n);
  const esc = escenarios[STATE.escenarioIdx];

  const pct = (STATE.escenarioIdx / escenarios.length) * 100;
  document.getElementById('prog-nivel').style.width = pct + '%';
  document.getElementById('score-nivel').textContent = STATE.puntaje[n - 1];

  const container = document.getElementById('nivel-content');
  // SDT – necesidad de competencia: el banner hace visible el progreso consecutivo del participante
  const streakBannerHtml = STATE.winstreak >= 2
    ? `<div class="streak-banner">🔥 ¡Racha activa x${STATE.winstreak}! Estás demostrando tu habilidad — este escenario vale <strong>+15 pts</strong></div>`
    : STATE.winstreak === 1
    ? `<div class="streak-hint">✨ ¡Progresando! Un acierto más seguido activa el bono de competencia (+15 pts)</div>`
    : '';

  container.innerHTML = `
    <div class="flex-col gap-16 mt-8">
      <div class="flex-center" style="justify-content:space-between">
        <div class="badge ${esc.badge}">${esc.badgeLabel}</div>
        <span class="chip">Escenario ${STATE.escenarioIdx + 1} de ${escenarios.length}</span>
      </div>
      ${streakBannerHtml}
      <div>
        <h3 class="title-md">${esc.titulo}</h3>
        <p class="body-sm text-muted mt-8">Lee el mensaje con atención antes de responder</p>
      </div>
      <div id="msg-placeholder"></div>
      <div class="divider"></div>
      <p class="body-md bold">${esc.pregunta}</p>
      <div class="option-list" id="esc-opts">
        ${esc.opciones.map((op, oi) => `
          <div class="option-item" id="esc-opt-${oi}" onclick="responderEscenario(${n}, ${oi})">
            <div class="option-letter">${['A','B','C','D'][oi]}</div>
            <span>${op}</span>
          </div>
        `).join('')}
      </div>
    </div>`;

  // Renderizar mensaje: desde datos dinámicos (Firestore) o template estático (fallback)
  const placeholder = document.getElementById('msg-placeholder');
  if (esc.mensaje) {
    const div = document.createElement('div');
    div.innerHTML = renderMensaje(esc.mensaje);
    placeholder.replaceWith(div.firstElementChild || div);
  } else if (esc.tplId) {
    const tpl = document.getElementById(esc.tplId);
    if (tpl) placeholder.replaceWith(tpl.content.cloneNode(true));
  }

  window.scrollTo(0, 0);
}

export function responderEscenario(n, opcion) {
  const escenarios = getEscenariosNivel(n);
  const esc = escenarios[STATE.escenarioIdx];
  const correcto = opcion === esc.correcta;
  const prevStreak = STATE.winstreak;
  const streakBonus = correcto && prevStreak >= 2;

  for (let i = 0; i < esc.opciones.length; i++) {
    const el = document.getElementById(`esc-opt-${i}`);
    if (!el) continue;
    el.style.pointerEvents = 'none';
    if (i === esc.correcta) el.classList.add('correct');
    else if (i === opcion && !correcto) el.classList.add('wrong');
  }

  const delta = correcto ? (streakBonus ? 15 : 10) : -5;
  STATE.puntaje[n - 1] = Math.max(-15, STATE.puntaje[n - 1] + delta);
  document.getElementById('score-nivel').textContent = STATE.puntaje[n - 1];

  if (correcto) {
    STATE.winstreak++;
    STATE.maxWinstreak = Math.max(STATE.maxWinstreak, STATE.winstreak);
  } else {
    STATE.winstreak = 0;
  }
  updateStreakDisplay(n);

  STATE.historial.push({ nivel: n, escenario: STATE.escenarioIdx, correcto, delta, streakBonus });

  setTimeout(() => mostrarFeedback(esc, correcto, delta, streakBonus, STATE.winstreak, prevStreak), 400);
}

export function updateStreakDisplay(n) {
  const el = document.getElementById('streak-nivel');
  if (!el) return;
  if (STATE.winstreak >= 2) {
    el.textContent = `🔥 x${STATE.winstreak}`;
    el.classList.remove('hidden');
  } else if (STATE.winstreak === 1) {
    el.textContent = `✨ x1`;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

export function mostrarFeedback(esc, correcto, delta, streakBonus, newStreak, prevStreak) {
  const content = document.getElementById('feedback-content');
  const deltaColor = delta > 0 ? 'text-success' : 'text-danger';
  const deltaStr  = delta > 0 ? `+${delta}` : `${delta}`;

  let streakMsgHtml = '';
  if (streakBonus) {
    // SDT – competencia: confirma eficacia y refuerza la sensación de logro
    streakMsgHtml = `<div style="background:rgba(255,120,0,.12);border:1px solid rgba(255,120,0,.3);border-radius:8px;padding:8px 12px;text-align:center;margin-top:4px">
      <span style="color:#ff8c42;font-family:var(--font);font-weight:700;font-size:.9rem">🔥 ¡${newStreak} aciertos seguidos! Tu capacidad de detección sigue creciendo — +5 pts de bono</span>
    </div>`;
  } else if (correcto && newStreak === 2) {
    // SDT – competencia: hace visible el avance consecutivo (Ryan & Deci, 2020)
    streakMsgHtml = `<div style="background:rgba(255,120,0,.08);border:1px solid rgba(255,120,0,.2);border-radius:8px;padding:8px 12px;text-align:center;margin-top:4px">
      <span style="color:#ff8c42;font-family:var(--font);font-weight:600;font-size:.85rem">🔥 ¡Dos aciertos consecutivos! Estás demostrando progreso — el siguiente vale +15 pts</span>
    </div>`;
  } else if (!correcto && prevStreak >= 2) {
    // SDT – competencia: error como parte del aprendizaje, no como fracaso definitivo
    streakMsgHtml = `<div style="background:rgba(235,77,75,.08);border:1px solid rgba(235,77,75,.2);border-radius:8px;padding:8px 12px;text-align:center;margin-top:4px">
      <span style="color:var(--accent2);font-family:var(--font);font-weight:600;font-size:.85rem">💔 Racha de ${prevStreak} terminada — lo aprendido no se pierde. ¡Sigue adelante!</span>
    </div>`;
  }

  content.innerHTML = `
    <div class="text-center">
      <div style="font-size:2.5rem">${correcto ? '✅' : '❌'}</div>
      <div class="score-delta ${deltaColor} mt-8">${deltaStr} pts</div>
      <div class="title-sm mt-8">${correcto ? '¡Correcto!' : 'Incorrecto'}</div>
    </div>
    ${streakMsgHtml}
    <div class="consequence-card ${correcto ? 'consequence-correct' : 'consequence-wrong'}">
      <p class="body-md">${correcto ? esc.consecuencia_ok : esc.consecuencia_mal}</p>
    </div>
    <div class="flex-col gap-8">
      <div class="title-sm text-danger">🔍 Señales de alerta en este mensaje:</div>
      <div class="alert-markers">
        ${esc.señales.map(s => `
          <div class="alert-marker">
            <span class="alert-marker-icon">${s.icon}</span>
            <span class="alert-marker-text">${s.texto}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card">
      <div class="title-sm mb-8">💡 ¿Por qué es un fraude?</div>
      <p class="body-sm">${esc.explicacion}</p>
    </div>`;

  document.getElementById('overlay-feedback').classList.add('active');
}

export function siguienteEscenario() {
  document.getElementById('overlay-feedback').classList.remove('active');
  const n = STATE.nivelActual;
  const escenarios = getEscenariosNivel(n);
  STATE.escenarioIdx++;

  if (STATE.escenarioIdx >= escenarios.length) {
    document.getElementById('prog-nivel').style.width = '100%';
    setTimeout(() => {
      if (n < 3) goToIntroNivel(n + 1);
      else mostrarResultado();
    }, 300);
  } else {
    renderEscenario(n);
  }
}
