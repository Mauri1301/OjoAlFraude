/* Carga y selección aleatoria de escenarios y preguntas */
import { STATE } from './state.js';
import { loadScenarios, loadQuestions } from '../firebase/db.js';
import { ESCENARIOS_FULL } from '../data/escenarios-full.js';
import { TEST_QUESTIONS_FULL } from '../data/test-questions-full.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function cargarContenido() {
  try {
    const [scenariosDB, questionsDB] = await Promise.all([
      loadScenarios(),
      loadQuestions(),
    ]);

    const pool  = scenariosDB.length ? scenariosDB : ESCENARIOS_FULL;
    const qpool = questionsDB.length ? questionsDB : TEST_QUESTIONS_FULL;

    STATE.escenariosActuales = {};
    [1, 2, 3].forEach(n => {
      STATE.escenariosActuales[n] = shuffle(pool.filter(e => e.nivel === n)).slice(0, 3);
    });
    STATE.questionsActuales = shuffle(qpool).slice(0, 5);
  } catch {
    // Fallback 100% local
    STATE.escenariosActuales = {};
    [1, 2, 3].forEach(n => {
      STATE.escenariosActuales[n] = shuffle(ESCENARIOS_FULL.filter(e => e.nivel === n)).slice(0, 3);
    });
    STATE.questionsActuales = shuffle(TEST_QUESTIONS_FULL).slice(0, 5);
  }
}
