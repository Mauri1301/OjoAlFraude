/* Motor del juego: intros, escenarios, winstreak, feedback */
import { STATE, goTo } from './state.js';
import { ESCENARIOS } from '../data/escenarios.js';       // fallback local
import { NIVEL_CONFIG } from '../data/nivel-config.js';
import { renderMensaje } from './mensaje-renderer.js';
import { buildBuho, buhoImg } from './buho.js';

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
      ${buildBuho(esc.narracion || 'Mira con calma este mensaje. Yo te acompaño en cada paso — tú decides qué hacer.')}
      <div class="escenario-layout">
        <div class="escenario-mensaje">
          <div id="msg-placeholder"></div>
        </div>
        <div class="escenario-pregunta flex-col gap-16">
          <div class="divider escenario-divider"></div>
          <p class="body-md bold">${esc.pregunta}</p>
          <div class="kh-list" id="esc-opts">
            ${esc.opciones.map((op, oi) => `
              <button type="button" class="kh-opt kh-c${oi % 4}" id="esc-opt-${oi}" onclick="responderEscenario(${n}, ${oi})">
                <span class="kh-num" aria-hidden="true">${oi + 1}</span>
                <span class="kh-text">${op}</span>
                <span class="kh-mark" aria-hidden="true"></span>
              </button>
            `).join('')}
          </div>
        </div>
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

  // Convertir spans de link en <a> reales si el escenario tiene linkUrl
  if (esc.linkUrl) {
    container.querySelectorAll('.wa-link, .sms-link, .email-link').forEach(span => {
      const a = document.createElement('a');
      a.className   = span.className;
      a.href        = esc.linkUrl;
      a.target      = '_blank';
      a.rel         = 'noopener';
      a.textContent = span.textContent;
      a.addEventListener('click', () => clicoEnlaceFraude(n));
      span.replaceWith(a);
    });
  }

  STATE.escenarioStartTime = Date.now();
  window.scrollTo(0, 0);
}

// Registra respuesta incorrecta automáticamente cuando el usuario hace clic en el link
export function clicoEnlaceFraude(n) {
  const escenarios = getEscenariosNivel(n);
  const esc = escenarios[STATE.escenarioIdx];
  // Seleccionar cualquier opción incorrecta
  const wrongIdx = esc.correcta === 0 ? 1 : 0;
  STATE.fraudeLink = true;   // marca: entró al enlace fraudulento
  responderEscenario(n, wrongIdx);
}

export function responderEscenario(n, opcion) {
  const escenarios = getEscenariosNivel(n);
  const esc = escenarios[STATE.escenarioIdx];
  const correcto = opcion === esc.correcta;
  const prevStreak = STATE.winstreak;
  const streakBonus = correcto && prevStreak >= 2;

  // Marca la opción elegida con ✓/✗ y bloquea las demás. Si respondió entrando
  // al enlace fraudulento, no eligió ninguna opción: no se marca ninguna.
  const lista = document.getElementById('esc-opts');
  if (lista) {
    lista.classList.add('kh-done');
    lista.querySelectorAll('.kh-opt').forEach(b => { b.disabled = true; });
    const elegido = STATE.fraudeLink ? null : document.getElementById(`esc-opt-${opcion}`);
    if (elegido) {
      elegido.classList.add('kh-chosen', correcto ? 'kh-ok' : 'kh-bad');
      elegido.querySelector('.kh-mark').textContent = correcto ? '✓' : '✗';
    }
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

  const tiempoSegundos = STATE.escenarioStartTime
    ? Math.round((Date.now() - STATE.escenarioStartTime) / 1000)
    : null;
  STATE.historial.push({ nivel: n, escenario: STATE.escenarioIdx, correcto, delta, streakBonus, tiempoSegundos });

  setTimeout(() => mostrarFeedback(esc, correcto, delta, streakBonus, STATE.winstreak, prevStreak, opcion), 400);
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

export function mostrarFeedback(esc, correcto, delta, streakBonus, newStreak, prevStreak, opcion) {
  // Si salió al mapa justo después de responder, no mostrar el popup encima del mapa
  if (!document.getElementById('p-nivel')?.classList.contains('active')) return;
  const esUltimo = STATE.escenarioIdx >= getEscenariosNivel(STATE.nivelActual).length - 1;
  document.getElementById('btn-feedback-next').textContent = esUltimo ? 'Terminar nivel →' : 'Siguiente →';
  const consecuenciaMal = esc.consecuencias_mal?.[opcion] ?? esc.consecuencia_mal ?? '❌ Respuesta incorrecta.';
  const fraudeLink = STATE.fraudeLink; STATE.fraudeLink = false;
  const buhoFeedback = correcto ? 'buho7' : (fraudeLink ? 'buho12' : 'buho4');
  const content = document.getElementById('feedback-content');
  const deltaColor = delta > 0 ? 'text-success' : 'text-danger';
  const deltaStr  = delta > 0 ? `+${delta}` : `${delta}`;

  // Una sola línea corta sobre la racha (competencia, SDT)
  let racha = '';
  if (streakBonus) racha = `🔥 ¡${newStreak} seguidos! +5 pts de bono`;
  else if (correcto && newStreak === 2) racha = '🔥 ¡2 seguidos! El siguiente vale +15';
  else if (!correcto && prevStreak >= 2) racha = `💔 Se acabó la racha de ${prevStreak}. ¡Sigue!`;
  const streakMsgHtml = racha ? `<div class="fb-racha">${racha}</div>` : '';

  content.innerHTML = `
    <div class="text-center">
      ${buhoImg(buhoFeedback, 96)}
      <div class="score-delta ${deltaColor} mt-8">${deltaStr} pts</div>
      <div class="title-sm mt-8">${correcto ? '¡Correcto!' : 'Incorrecto'}</div>
    </div>
    ${streakMsgHtml}
    <div class="consequence-card ${correcto ? 'consequence-correct' : 'consequence-wrong'}">
      <p class="body-md">${correcto ? esc.consecuencia_ok : consecuenciaMal}</p>
    </div>
    <details class="fb-mas">
      <summary>Ver señales y explicación</summary>
      <div class="fb-mas-cuerpo">
        <div class="flex-col gap-8">
          <div class="title-sm text-danger">🔍 Señales de alerta:</div>
          <div class="alert-markers">
            ${esc.señales.map(s => `
              <div class="alert-marker">
                <span class="alert-marker-icon">${s.icon}</span>
                <span class="alert-marker-text">${s.texto}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div>
          <div class="title-sm mb-8">💡 ¿Por qué es un fraude?</div>
          <p class="body-sm">${esc.explicacion}</p>
        </div>
      </div>
    </details>`;

  document.getElementById('overlay-feedback').classList.add('active');
}

export function siguienteEscenario() {
  document.getElementById('overlay-feedback').classList.remove('active');
  const n = STATE.nivelActual;
  const escenarios = getEscenariosNivel(n);
  STATE.escenarioIdx++;

  if (STATE.escenarioIdx >= escenarios.length) {
    document.getElementById('prog-nivel').style.width = '100%';
    // El recorrido (recorrido.js) decide qué sigue: mapa, resultados o práctica
    setTimeout(() => window.dispatchEvent(new CustomEvent('nivel-terminado', { detail: { n } })), 300);
  } else {
    renderEscenario(n);
  }
}
