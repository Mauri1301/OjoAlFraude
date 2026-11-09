/* Pre-test / post-test */
import { STATE, goTo } from './state.js';
import { TEST_QUESTIONS_A } from '../data/test-questions-a.js';
import { TEST_QUESTIONS_B } from '../data/test-questions-b.js';
import { renderComparacion } from './results.js';
import { cargarContenido } from './content-loader.js';

function getPreguntas(which = 'pretest') {
  if (which === 'posttest') return STATE.posttestQuestions?.length ? STATE.posttestQuestions : TEST_QUESTIONS_B;
  return STATE.questionsActuales?.length ? STATE.questionsActuales : TEST_QUESTIONS_A;
}

// Llamada desde el mapa (ventana previa al Nivel 1) — recarga el contenido
export async function iniciarPretest() {
  await cargarContenido();
  renderTest('pretest-content', STATE.pretest, 'btn-pretest');
  goTo('p-pretest');
}

// Pre/post-test: una pregunta a la vez (carrusel) en celular y desktop
export function renderTest(containerId, stateObj, btnId) {
  const which = containerId.includes('posttest') ? 'posttest' : 'pretest';
  _initCarousel(containerId, stateObj, btnId, which);
}

/* ── Carrusel ── */

let _carousel = null;

function _initCarousel(containerId, stateObj, btnId, which = 'pretest') {
  _carousel = { containerId, stateObj, btnId, which, idx: 0, answers: {} };
  document.getElementById(btnId)?.classList.add('hidden');
  _renderCarouselSlide();
}

function _renderCarouselSlide() {
  const { containerId, idx, answers, which } = _carousel;
  const preguntas = getPreguntas(which);
  const total = preguntas.length;
  const q = preguntas[idx];
  const allAnswered = Object.keys(answers).length === total;
  const currentAnswered = answers[`q${idx}`] !== undefined;
  const isLast = idx === total - 1;

  const dotsHtml = preguntas.map((_, i) => {
    let cls = 'step-dot';
    if (answers[`q${i}`] !== undefined) cls += ' done';
    else if (i === idx) cls += ' active';
    return `<div class="${cls}"></div>`;
  }).join('');

  document.getElementById(containerId).innerHTML = `
    <div class="carousel-wrap flex-col gap-16">
      <div class="carousel-header">
        <span class="body-sm text-muted">Pregunta ${idx + 1} de ${total}</span>
        <div class="step-indicator" style="margin-bottom:0">${dotsHtml}</div>
      </div>
      <div class="card flex-col gap-16" style="animation:fadeIn .25s ease">
        <p class="body-md bold">${q.texto}</p>
        <div class="option-list">
          ${q.opciones.map((op, oi) => `
            <div class="option-item ${answers[`q${idx}`] === oi ? 'selected' : ''}"
                 onclick="selectCarouselOption(${idx}, ${oi})">
              <div class="option-letter">${['A','B','C','D'][oi]}</div>
              <span>${op}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="carousel-nav">
        <button class="btn btn-secondary btn-sm carousel-nav-btn ${idx === 0 ? 'invisible' : ''}"
                onclick="prevCarouselQuestion()">← Anterior</button>
        ${isLast
          ? `<button class="btn btn-primary btn-sm carousel-nav-btn ${allAnswered ? '' : 'hidden'}"
                onclick="confirmCarousel()">Guardar y continuar →</button>`
          : `<button class="btn btn-primary btn-sm carousel-nav-btn ${!currentAnswered ? 'hidden' : ''}"
                onclick="nextCarouselQuestion()">Siguiente →</button>`}
      </div>
      ${isLast ? '' : `<button class="btn btn-primary ${allAnswered ? '' : 'hidden'}"
              onclick="confirmCarousel()">Guardar y continuar →</button>`}
    </div>`;
}

export function selectCarouselOption(qi, oi) {
  _carousel.answers[`q${qi}`] = oi;

  const container = document.getElementById(_carousel.containerId);
  const total = getPreguntas(_carousel.which).length;
  const allAnswered = Object.keys(_carousel.answers).length === total;
  const isLast = _carousel.idx === total - 1;

  // Actualizar selección de opciones
  container.querySelectorAll('.option-item').forEach((el, i) => {
    el.classList.toggle('selected', i === oi);
  });

  // Actualizar dots
  container.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.className = 'step-dot' +
      (_carousel.answers[`q${i}`] !== undefined ? ' done' : i === _carousel.idx ? ' active' : '');
  });

  // Mostrar "Siguiente" si respondió y no es la última
  const nextBtn = container.querySelector('[onclick="nextCarouselQuestion()"]');
  if (nextBtn) nextBtn.classList.toggle('hidden', isLast);

  // Mostrar "Confirmar" cuando todas estén respondidas
  const confirmBtn = container.querySelector('[onclick="confirmCarousel()"]');
  if (confirmBtn) confirmBtn.classList.toggle('hidden', !allAnswered);
}

export function nextCarouselQuestion() {
  if (_carousel.idx < getPreguntas(_carousel.which).length - 1) {
    _carousel.idx++;
    _renderCarouselSlide();
    window.scrollTo(0, 0);
  }
}

export function prevCarouselQuestion() {
  if (_carousel.idx > 0) {
    _carousel.idx--;
    _renderCarouselSlide();
    window.scrollTo(0, 0);
  }
}

export function confirmCarousel() {
  Object.assign(_carousel.stateObj, _carousel.answers);
  if (_carousel.btnId === 'btn-pretest') finalizarPretest();
  else finalizarPosttest();
}

export function selectTestOption(containerId, qi, oi, which) {
  const opts = document.querySelectorAll(`#${containerId}-opts-${qi} .option-item`);
  opts.forEach(o => o.classList.remove('selected'));
  opts[oi].classList.add('selected');
  const stateObj = which === 'pretest' ? STATE.pretest : STATE.posttest;
  stateObj[`q${qi}`] = oi;
  updateTestDots(containerId, which);
  checkTestComplete(stateObj, which === 'pretest' ? 'btn-pretest' : 'btn-posttest', which);
}

export function updateTestDots(containerId, which) {
  const w = which || (containerId === 'pretest-content' ? 'pretest' : 'posttest');
  const stateObj = w === 'pretest' ? STATE.pretest : STATE.posttest;
  getPreguntas(w).forEach((_, i) => {
    const dot = document.getElementById(`${containerId}-dot-${i}`);
    if (!dot) return;
    dot.className = 'step-dot';
    if (stateObj[`q${i}`] !== undefined) dot.classList.add('done');
  });
}

export function checkTestComplete(stateObj, btnId, which = 'pretest') {
  const answered = Object.keys(stateObj).length;
  const btn = document.getElementById(btnId);
  if (answered >= getPreguntas(which).length) btn.classList.remove('hidden');
  else btn.classList.add('hidden');
}

export function calcTestScore(stateObj) {
  const which = stateObj === STATE.pretest ? 'pretest' : 'posttest';
  let score = 0;
  getPreguntas(which).forEach((q, i) => {
    if (stateObj[`q${i}`] === q.correcta) score++;
  });
  return score;
}

// Al terminar el pre-test, recorrido.js guarda el avance y pasa al Nivel 1
export function finalizarPretest() {
  STATE.pretestScore = calcTestScore(STATE.pretest);
  window.dispatchEvent(new CustomEvent('pretest-terminado'));
}

export function finalizarPosttest() {
  STATE.posttestScore = calcTestScore(STATE.posttest);
  renderComparacion();
  goTo('p-comparacion');
  window.dispatchEvent(new CustomEvent('posttest-terminado'));
}

export function iniciarPosttest() {
  renderTest('posttest-content', STATE.posttest, 'btn-posttest');
  goTo('p-posttest');
}
