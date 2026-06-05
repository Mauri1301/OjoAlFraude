/* Pantallas de resultado y comparación pre/post */
import { STATE, goTo } from './state.js';
import { TEST_QUESTIONS_A } from '../data/test-questions-a.js';
import { TEST_QUESTIONS_B } from '../data/test-questions-b.js';

export function mostrarResultado() {
  const total    = STATE.puntaje.reduce((a, b) => a + b, 0);
  const bonusPts = STATE.historial.filter(h => h.streakBonus).length * 5;

  let emoji, title, subtitle;
  if      (total >= 72) { emoji = '🏆'; title = '¡Experto en seguridad!';    subtitle = 'Tienes un gran ojo para detectar fraudes.'; }
  else if (total >= 54) { emoji = '🛡️'; title = '¡Muy bien hecho!';          subtitle = 'Identificaste la mayoría de los fraudes. Sigue practicando para mejorar aún más.'; }
  else if (total >= 36) { emoji = '📚'; title = '¡Buen intento!';             subtitle = 'Te enteraste de varias cosas importantes. Te recomendamos repasar los escenarios que fallaste.'; }
  else                  { emoji = '🌱'; title = '¡Gracias por participar!';   subtitle = 'Este juego te mostró los riesgos que te puedes encontrar el tu dia a dia.'; }

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
        <span class="body-sm" style="color:var(--accent3)">✅ Demostraste mejora progresiva: ${STATE.maxWinstreak} escenarios resueltos consecutivamente</span>
      </div>`;
  }

  goTo('p-resultado');
}

export function renderComparacion() {
  const pre    = STATE.pretestScore;
  const post   = STATE.posttestScore;
  const pregA  = STATE.questionsActuales?.length  ? STATE.questionsActuales  : TEST_QUESTIONS_A;
  const maxQ   = pregA.length;
  const mejora = post - pre;
  const pregB  = STATE.posttestQuestions?.length  ? STATE.posttestQuestions  : TEST_QUESTIONS_B;

  const bars = document.getElementById('compare-bars');
  bars.innerHTML = '';

  pregA.forEach((qA, i) => {
    const qB    = pregB[i];
    const preOk  = STATE.pretest[`q${i}`]  === qA.correcta;
    const postOk = STATE.posttest[`q${i}`] === qB.correcta;
    const arrow  = (!preOk && postOk) ? '↗️' : (preOk && !postOk) ? '↘️' : (preOk && postOk) ? '✓' : '✗';
    const arrowColor = (!preOk && postOk) ? 'var(--accent3)' : (preOk && !postOk) ? 'var(--accent2)' : (preOk && postOk) ? 'var(--accent3)' : 'var(--text-muted)';

    bars.innerHTML += `
      <div class="compare-construct-row">
        <span class="body-sm" style="flex:1">${qA.constructo}</span>
        <span style="font-size:1.1rem">${preOk ? '✅' : '❌'}</span>
        <span style="color:${arrowColor};font-size:.9rem;padding:0 4px">→</span>
        <span style="font-size:1.1rem">${postOk ? '✅' : '❌'}</span>
      </div>`;
  });

  let mejoraEmoji, mejoraTexto;
  if      (mejora > 0)  { mejoraEmoji = '📈'; mejoraTexto = `Mejoraste ${mejora} constructo${mejora > 1 ? 's' : ''}. ¡El juego funcionó!`; }
  else if (mejora === 0) { mejoraEmoji = '↔️'; mejoraTexto = `Mantuviste el mismo puntaje. Puede que ya tenías buen conocimiento previo.`; }
  else                   { mejoraEmoji = '🔄'; mejoraTexto = `Algunos conceptos necesitan más práctica. ¡Sigue adelante!`; }

  document.getElementById('mejora-card').innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <span style="font-size:2rem">${mejoraEmoji}</span>
      <div>
        <div class="title-sm">Pre-test: ${pre}/${maxQ} → Post-test: ${post}/${maxQ} correctas</div>
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
        <span class="bold">${STATE.pretestScore} / 10 correctas</span>
      </div>
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="body-md text-muted">Post-test</span>
        <span class="bold">${STATE.posttestScore} / 10 correctas</span>
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
    ? 'Tu capacidad para identificar fraudes digitales es sólida. Estás en buena posición para protegerte y cuidar también a quienes te rodean.'
    : aciertos >= 4
    ? 'Tu capacidad de detección es buena y seguirá creciendo con la práctica.'
    : 'Este juego fue tu primer paso. Ahora conoces las señales de alerta — sigue practicando.';
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
      ? `<p class="body-sm text-muted mt-4">🔥 Alcanzaste una racha de <strong>${STATE.maxWinstreak} aciertos consecutivos</strong>, lo que refleja tu mejora progresiva durante el juego.</p>`
      : ''}`;
}
