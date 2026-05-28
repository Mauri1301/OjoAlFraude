/* Encuesta de usabilidad SUS */
import { STATE, goTo } from './state.js';
import { SUS_PREGUNTAS } from '../data/nivel-config.js';
import { renderFin } from './results.js';

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

export function finalizarSUS() {
  STATE.susScore = calcSUSScore();
  renderFin();
  goTo('p-fin');
}
