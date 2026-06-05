/* Pre-test / post-test */
import { STATE, goTo } from './state.js';
import { TEST_QUESTIONS } from '../data/test-questions.js'; // fallback local
import { goToIntroNivel } from './nivel.js';
import { renderComparacion } from './results.js';
import { renderSUS } from './sus.js';
import { cargarContenido } from './content-loader.js';

// Devuelve las preguntas activas para esta sesión (Firestore o fallback local)
function getPreguntas() {
  return STATE.questionsActuales?.length ? STATE.questionsActuales : TEST_QUESTIONS;
}

function isDesktop() {
  return window.matchMedia('(min-width: 768px)').matches;
}

// Llamada desde el botón "Empezar" en p-bienvenida — recarga contenido aleatorio
export async function iniciarPretest() {
  await cargarContenido();
  renderTest('pretest-content', STATE.pretest, 'btn-pretest');
  goTo('p-pretest');
}

export function renderTest(containerId, stateObj, btnId) {
  if (isDesktop()) {
    _initCarousel(containerId, stateObj, btnId);
    return;
  }

  const container = document.getElementById(containerId);
  container.innerHTML = '';

  let dots = '<div class="step-indicator">';
  getPreguntas().forEach((_, i) => dots += `<div class="step-dot" id="${containerId}-dot-${i}"></div>`);
  dots += '</div>';
  container.innerHTML += dots;

  getPreguntas().forEach((q, qi) => {
    const div = document.createElement('div');
    div.className = 'flex-col gap-12';
    div.id = `${containerId}-q${qi}`;
    div.innerHTML = `
      <div class="card flex-col gap-12">
        <div class="badge badge-warning">Pregunta ${qi + 1} de ${getPreguntas().length}</div>
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

/* ── Carrusel (desktop ≥768px) ── */

let _carousel = null;

function _initCarousel(containerId, stateObj, btnId) {
  _carousel = { containerId, stateObj, btnId, idx: 0, answers: {} };
  document.getElementById(btnId)?.classList.add('hidden');
  _renderCarouselSlide();
}

function _renderCarouselSlide() {
  const { containerId, idx, answers } = _carousel;
  const preguntas = getPreguntas();
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
        <button class="btn btn-primary btn-sm carousel-nav-btn ${!currentAnswered || isLast ? 'hidden' : ''}"
                onclick="nextCarouselQuestion()">Siguiente →</button>
      </div>
      <button class="btn btn-primary ${allAnswered ? '' : 'hidden'}"
              onclick="confirmCarousel()">Guardar y continuar →</button>
    </div>`;
}

export function selectCarouselOption(qi, oi) {
  _carousel.answers[`q${qi}`] = oi;

  const container = document.getElementById(_carousel.containerId);
  const total = getPreguntas().length;
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
  if (_carousel.idx < getPreguntas().length - 1) {
    _carousel.idx++;
    _renderCarouselSlide();
  }
}

export function prevCarouselQuestion() {
  if (_carousel.idx > 0) {
    _carousel.idx--;
    _renderCarouselSlide();
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
  updateTestDots(containerId);
  checkTestComplete(stateObj, which === 'pretest' ? 'btn-pretest' : 'btn-posttest');
}

export function updateTestDots(containerId) {
  const stateObj = containerId === 'pretest-content' ? STATE.pretest : STATE.posttest;
  getPreguntas().forEach((_, i) => {
    const dot = document.getElementById(`${containerId}-dot-${i}`);
    if (!dot) return;
    dot.className = 'step-dot';
    if (stateObj[`q${i}`] !== undefined) dot.classList.add('done');
  });
}

export function checkTestComplete(stateObj, btnId) {
  const answered = Object.keys(stateObj).length;
  const btn = document.getElementById(btnId);
  if (answered >= getPreguntas().length) btn.classList.remove('hidden');
  else btn.classList.add('hidden');
}

export function calcTestScore(stateObj) {
  let score = 0;
  getPreguntas().forEach((q, i) => {
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

export function iniciarPosttest() {
  renderTest('posttest-content', STATE.posttest, 'btn-posttest');
  goTo('p-posttest');
}
