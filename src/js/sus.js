/* Encuesta de usabilidad SUS */
import { STATE, goTo } from './state.js';
import { SUS_PREGUNTAS } from '../data/nivel-config.js';
import { renderFin } from './results.js';
import { saveSession } from '../firebase/db.js';

export function abrirModalSUS() {
  renderSUS();
  document.getElementById('overlay-sus').classList.add('active');
}

export function renderSUS() {
  const container = document.getElementById('sus-content');
  container.innerHTML = '';
  SUS_PREGUNTAS.forEach((p, i) => {
    container.innerHTML += `
      <div class="flex-col gap-8">
        <p class="body-md"><strong>${i + 1}.</strong> ${p}</p>
        <div class="likert-row" id="sus-row-${i}">
          ${[1,2,3,4,5].map(v => `
            <button class="likert-btn" data-q="${i}" data-v="${v}" onclick="selectSUS(${i},${v})">${v}</button>
          `).join('')}
        </div>
        <div class="likert-labels">
          <span class="likert-label">Totalmente en desacuerdo</span>
          <span class="likert-label">Totalmente de acuerdo</span>
        </div>
      </div>`;
  });
}

export function selectSUS(qi, val) {
  const row = document.getElementById(`sus-row-${qi}`);
  row.querySelectorAll('.likert-btn').forEach(b => b.classList.remove('selected'));
  row.querySelector(`[data-v="${val}"]`).classList.add('selected');
  STATE.sus[`q${qi}`] = val;
  const answered = Object.keys(STATE.sus).length;
  if (answered >= SUS_PREGUNTAS.length) document.getElementById('btn-sus').classList.remove('hidden');
}

export function calcSUSScore() {
  let total = 0;
  SUS_PREGUNTAS.forEach((_, i) => { total += (STATE.sus[`q${i}`] || 0); });
  return Math.round((total / (SUS_PREGUNTAS.length * 5)) * 100);
}

export async function finalizarSUS() {
  STATE.susScore = calcSUSScore();
  document.getElementById('overlay-sus').classList.remove('active');
  renderFin();
  goTo('p-fin');

  if (STATE.currentUser) {
    const bonusPts = STATE.historial.filter(h => h.streakBonus).length * 5;
    saveSession(STATE.currentUser.uid, {
      participante: STATE.participante,
      pretest:  { respuestas: STATE.pretest,  score: STATE.pretestScore },
      juego: {
        puntaje_por_nivel:   STATE.puntaje,
        puntaje_total:       STATE.puntaje.reduce((a, b) => a + b, 0),
        puntaje_base:        STATE.puntaje.reduce((a, b) => a + b, 0) - bonusPts,
        bonus_racha_total:   bonusPts,
        escenarios_con_bono: STATE.historial.filter(h => h.streakBonus).length,
        max_winstreak:       STATE.maxWinstreak,
        historial:           STATE.historial,
      },
      posttest: { respuestas: STATE.posttest, score: STATE.posttestScore },
      sus:      { respuestas: STATE.sus,      score: STATE.susScore },
    }).catch(err => console.error('Error al guardar sesión:', err));
  }
}
