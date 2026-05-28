/* Registro y pantallas de pre-test / post-test */
import { STATE, goTo } from './state.js';
import { TEST_QUESTIONS } from '../data/test-questions.js';
import { goToIntroNivel } from './nivel.js';
import { renderComparacion } from './results.js';
import { renderSUS } from './sus.js';

export function registroSiguiente() {
  const campos = [
    { id: 'r-nombre', err: 'r-nombre-err', check: v => v.trim().length >= 2 },
    { id: 'r-edad',   err: 'r-edad-err',   check: v => v >= 55 && v <= 100 },
    { id: 'r-genero', err: 'r-genero-err', check: v => v !== '' },
    { id: 'r-uso',    err: 'r-uso-err',    check: v => v !== '' },
    { id: 'r-exp',    err: 'r-exp-err',    check: v => v !== '' },
  ];
  let ok = true;
  campos.forEach(c => {
    const el  = document.getElementById(c.id);
    const err = document.getElementById(c.err);
    if (!c.check(el.value)) {
      err.classList.remove('hidden');
      ok = false;
    } else {
      err.classList.add('hidden');
      STATE.participante[c.id.replace('r-', '')] = el.value;
    }
  });
  if (ok) {
    STATE.participante.timestamp = new Date().toISOString();
    renderTest('pretest-content', STATE.pretest, 'btn-pretest');
    goTo('p-pretest');
  }
}

export function renderTest(containerId, stateObj, btnId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  let dots = '<div class="step-indicator">';
  TEST_QUESTIONS.forEach((_, i) => dots += `<div class="step-dot" id="${containerId}-dot-${i}"></div>`);
  dots += '</div>';
  container.innerHTML += dots;

  TEST_QUESTIONS.forEach((q, qi) => {
    const div = document.createElement('div');
    div.className = 'flex-col gap-12';
    div.id = `${containerId}-q${qi}`;
    div.innerHTML = `
      <div class="card flex-col gap-12">
        <div class="badge badge-warning">Pregunta ${qi + 1} de 5</div>
        <p class="body-md bold">${q.texto}</p>
        <div class="option-list" id="${containerId}-opts-${qi}">
          ${q.opciones.map((op, oi) => `
            <div class="option-item" onclick="selectTestOption('${containerId}', ${qi}, ${oi}, '${stateObj === STATE.pretest ? 'pretest' : 'posttest'}')">
              <div class="option-letter">${['A','B','C','D'][oi]}</div>
              <span>${op}</span>
              <input type="radio" name="${containerId}-q${qi}" value="${oi}">
            </div>
          `).join('')}
        </div>
      </div>`;
    container.appendChild(div);
  });

  updateTestDots(containerId);
  checkTestComplete(stateObj, btnId);
}

export function selectTestOption(containerId, qi, oi, which) {
  const opts = document.querySelectorAll(`#${containerId}-opts-${qi} .option-item`);
  opts.forEach(o => o.classList.remove('selected'));
  opts[oi].classList.add('selected');
  const stateObj = which === 'pretest' ? STATE.pretest : STATE.posttest;
  stateObj[`q${qi}`] = oi;
  updateTestDots(containerId);
  checkTestComplete(stateObj, which === 'pretest' ? 'btn-pretest' : 'btn-posttest');
}

export function updateTestDots(containerId) {
  const stateObj = containerId === 'pretest-content' ? STATE.pretest : STATE.posttest;
  TEST_QUESTIONS.forEach((_, i) => {
    const dot = document.getElementById(`${containerId}-dot-${i}`);
    if (!dot) return;
    dot.className = 'step-dot';
    if (stateObj[`q${i}`] !== undefined) dot.classList.add('done');
  });
}

export function checkTestComplete(stateObj, btnId) {
  const answered = Object.keys(stateObj).length;
  const btn = document.getElementById(btnId);
  if (answered >= TEST_QUESTIONS.length) btn.classList.remove('hidden');
  else btn.classList.add('hidden');
}

export function calcTestScore(stateObj) {
  let score = 0;
  TEST_QUESTIONS.forEach((q, i) => {
    if (stateObj[`q${i}`] === q.correcta) score++;
  });
  return score;
}

export function finalizarPretest() {
  STATE.pretestScore = calcTestScore(STATE.pretest);
  goToIntroNivel(1);
}

export function finalizarPosttest() {
  STATE.posttestScore = calcTestScore(STATE.posttest);
  renderComparacion();
  renderSUS();
  goTo('p-comparacion');
}

// Bugfix: el botón de resultado llamaba goTo('p-posttest') sin renderizar el contenido
export function iniciarPosttest() {
  renderTest('posttest-content', STATE.posttest, 'btn-posttest');
  goTo('p-posttest');
}
