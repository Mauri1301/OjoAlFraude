/* Pantallas de resultado y comparación pre/post */
import { STATE, goTo } from './state.js';
import { TEST_QUESTIONS } from '../data/test-questions.js';

export function mostrarResultado() {
  const total    = STATE.puntaje.reduce((a, b) => a + b, 0);
  const bonusPts = STATE.historial.filter(h => h.streakBonus).length * 5;

  let emoji, title, subtitle;
  if      (total >= 72) { emoji = '🏆'; title = '¡Experto en seguridad!';    subtitle = 'Tienes un gran ojo para detectar fraudes. ¡Comparte lo aprendido con tu familia!'; }
  else if (total >= 54) { emoji = '🛡️'; title = '¡Muy bien hecho!';          subtitle = 'Identificaste la mayoría de los fraudes. Sigue practicando para mejorar aún más.'; }
  else if (total >= 36) { emoji = '📚'; title = '¡Buen intento!';             subtitle = 'Aprendiste varias cosas importantes. Te recomendamos repasar los escenarios que fallaste.'; }
  else                  { emoji = '🌱'; title = '¡Gracias por participar!';   subtitle = 'Este juego te mostró los riesgos. Ahora ya conoces las señales de alerta. ¡Sigue aprendiendo!'; }

  document.getElementById('result-emoji').textContent    = emoji;
  document.getElementById('result-title').textContent    = title;
  document.getElementById('result-subtitle').textContent = subtitle;
  document.getElementById('result-pts').textContent      = total;

  const breakdown = document.getElementById('result-breakdown');
  const niveles   = ['Básico (N1)', 'Intermedio (N2)', 'Avanzado (N3)'];
  breakdown.innerHTML = '<div class="title-sm mb-8">Puntaje por nivel</div>';

  STATE.puntaje.forEach((p, i) => {
    const maxN = 30;
    const pctN = Math.max(0, Math.round((p / maxN) * 100));
    breakdown.innerHTML += `
      <div class="flex-col gap-4">
        <div class="compare-bar-label">
          <span>${niveles[i]}</span>
          <span class="text-accent">${p} pts</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill bar-fill-post" style="width:${Math.min(pctN, 100)}%">
            ${pctN > 15 ? `<span class="bar-pct">${Math.min(pctN, 100)}%</span>` : ''}
          </div>
        </div>
      </div>`;
  });

  if (bonusPts > 0) {
    breakdown.innerHTML += `
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="body-sm" style="color:#ff8c42">🔥 Bonos de racha ganados</span>
        <span class="bold" style="color:#ff8c42">+${bonusPts} pts</span>
      </div>`;
  }
  if (STATE.maxWinstreak >= 2) {
    // SDT – competencia: nombrar el aprendizaje progresivo demostrado
    breakdown.innerHTML += `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="body-sm text-muted">Mejor racha de aciertos</span>
        <span class="bold">🔥 ${STATE.maxWinstreak} seguidos</span>
      </div>
      <div style="background:rgba(107,203,119,.08);border-radius:6px;padding:8px 10px">
        <span class="body-sm" style="color:var(--accent3)">✅ Demostraste aprendizaje progresivo: ${STATE.maxWinstreak} escenarios resueltos consecutivamente</span>
      </div>`;
  }

  goTo('p-resultado');
}

export function renderComparacion() {
  const pre   = STATE.pretestScore;
  const post  = STATE.posttestScore;
  const maxQ  = TEST_QUESTIONS.length;
  const mejora = post - pre;

  const bars = document.getElementById('compare-bars');
  bars.innerHTML = '';

  TEST_QUESTIONS.forEach((q, i) => {
    const preOk  = STATE.pretest[`q${i}`]  === q.correcta;
    const postOk = STATE.posttest[`q${i}`] === q.correcta;
    bars.innerHTML += `
      <div class="compare-bar-wrap">
        <div class="compare-bar-label">
          <span class="body-sm">P${i+1}: ${q.texto.substring(0, 40)}...</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="font-size:.75rem;color:var(--text-muted);width:50px">Antes</span>
          <div class="bar-track" style="flex:1">
            <div class="bar-fill bar-fill-pre" style="width:${preOk ? '100%' : '0%'}">
              ${preOk ? '<span class="bar-pct" style="color:#fff">✓</span>' : ''}
            </div>
          </div>
          <span style="font-size:.75rem;color:var(--text-muted);width:30px">${preOk ? '✅' : '❌'}</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <span style="font-size:.75rem;color:var(--accent);width:50px">Después</span>
          <div class="bar-track" style="flex:1">
            <div class="bar-fill bar-fill-post" style="width:${postOk ? '100%' : '0%'}">
              ${postOk ? '<span class="bar-pct">✓</span>' : ''}
            </div>
          </div>
          <span style="font-size:.75rem;color:var(--text-muted);width:30px">${postOk ? '✅' : '❌'}</span>
        </div>
      </div>`;
  });

  let mejoraEmoji, mejoraTexto;
  if      (mejora > 0) { mejoraEmoji = '📈'; mejoraTexto = `Mejoraste ${mejora} pregunta${mejora > 1 ? 's' : ''} correctas. ¡El juego funcionó!`; }
  else if (mejora === 0) { mejoraEmoji = '↔️'; mejoraTexto = `Mantuviste el mismo puntaje. Puede que ya tenías buen conocimiento previo.`; }
  else                   { mejoraEmoji = '🔄'; mejoraTexto = `El post-test fue diferente. Sigue repasando los escenarios.`; }

  document.getElementById('mejora-card').innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <span style="font-size:2rem">${mejoraEmoji}</span>
      <div>
        <div class="title-sm">Pre-test: ${pre}/${maxQ} correctas → Post-test: ${post}/${maxQ} correctas</div>
        <p class="body-sm text-muted mt-4">${mejoraTexto}</p>
      </div>
    </div>`;
}

export function renderFin() {
  const totalJuego = STATE.puntaje.reduce((a, b) => a + b, 0);
  const aciertos   = STATE.historial.filter(h => h.correcto).length;
  const summary    = document.getElementById('fin-summary');

  summary.innerHTML = `
    <div class="title-sm mb-8">📋 Resumen de tu experiencia</div>
    <div class="flex-col gap-10">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="body-md text-muted">Puntaje en el juego</span>
        <span class="bold text-accent">${totalJuego} / 90 pts base</span>
      </div>
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="body-md text-muted">Escenarios superados</span>
        <span class="bold">${aciertos} / 9</span>
      </div>
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="body-md text-muted">Pre-test</span>
        <span class="bold">${STATE.pretestScore} / 5 correctas</span>
      </div>
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="body-md text-muted">Post-test</span>
        <span class="bold">${STATE.posttestScore} / 5 correctas</span>
      </div>
      ${STATE.maxWinstreak >= 2 ? `
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="body-md text-muted">Mejor racha</span>
        <span class="bold" style="color:#ff7c2a">🔥 ${STATE.maxWinstreak} seguidos</span>
      </div>` : ''}
    </div>`;

  // SDT – cierre del ciclo de competencia (Ryan & Deci, 2020):
  // hacer visible la eficacia percibida al final refuerza la motivación intrínseca.
  const compEl    = document.getElementById('fin-competencia');
  const nivelComp = aciertos >= 7 ? 'alta' : aciertos >= 4 ? 'media' : 'en desarrollo';
  const compIcon  = aciertos >= 7 ? '🏅' : aciertos >= 4 ? '📈' : '🌱';
  const compDesc  = aciertos >= 7
    ? 'Tu capacidad para identificar fraudes digitales es sólida. Estás en condición de protegerte y de enseñarle a otros.'
    : aciertos >= 4
    ? 'Tu capacidad de detección es buena y seguirá creciendo con la práctica.'
    : 'Este juego fue tu primer paso. Ahora conoces las señales de alerta — sigue aprendiendo.';
  compEl.innerHTML = `
    <div class="title-sm mb-4">🧠 Tu competencia en seguridad digital</div>
    <div style="background:rgba(107,203,119,.08);border:1px solid rgba(107,203,119,.25);border-radius:8px;padding:12px 14px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="font-size:2rem;line-height:1">${compIcon}</span>
        <div>
          <div class="title-sm">Nivel ${nivelComp}</div>
          <p class="body-sm text-muted mt-4">${aciertos} de 9 escenarios superados. ${compDesc}</p>
        </div>
      </div>
    </div>
    ${STATE.maxWinstreak >= 2
      ? `<p class="body-sm text-muted mt-4">🔥 Alcanzaste una racha de <strong>${STATE.maxWinstreak} aciertos consecutivos</strong>, lo que refleja aprendizaje progresivo durante el juego.</p>`
      : ''}`;
}
