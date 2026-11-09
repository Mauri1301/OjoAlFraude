/* Recorrido del participante: mapa de niveles, pre-test al empezar, post-test
   al terminar los 3 niveles y práctica libre después.

   Primer recorrido: pre-test → Nivel 1 → 2 → 3 → post-test → encuesta (KAB).
   Cada paso queda guardado en users/{uid}.progreso, así se puede continuar en
   otra sesión. Las rejugadas (ya completado el recorrido) se guardan aparte,
   en la colección `practicas`, y no entran al análisis. */
import { STATE, goTo, resetJuego } from './state.js';
import {
  leerProgreso, estadoRecorrido, nivelJugable, hidratarEstado,
  aplicarProgresoLocal, maxRacha, NIVELES,
} from './progreso.js';
import { renderMapa } from './mapa.js';
import { mostrarInfo, mostrarAviso } from './ui.js';
import { goToIntroNivel } from './nivel.js';
import { iniciarPretest, iniciarPosttest } from './test.js';
import { mostrarResultado, renderComparacion } from './results.js';
import { cargarContenido } from './content-loader.js';
import { saveProgreso, savePractica, saveSession } from '../firebase/db.js';

// Único punto de acceso a Firestore y al contenido: se puede reemplazar en pruebas.
export const almacen = {
  cargarContenido,
  guardarProgreso: saveProgreso,
  guardarPractica: savePractica,
  guardarSesion: saveSession,
};

const ahora = () => new Date().toISOString();

function estadoActual() {
  return estadoRecorrido(leerProgreso());
}

/* ── Entrada y mapa ── */

// Al iniciar sesión un participante: estado limpio, progreso reconstruido y mapa.
export function entrarAlJuego() {
  resetJuego();
  const p = leerProgreso();
  if (!p.completo) hidratarEstado(p);
  mostrarMapa();
}

export function mostrarMapa() {
  goTo('p-mapa');                       // primero visible: el mapa mide el layout para ubicar al búho
  renderMapa(estadoActual(), STATE.participante?.nombre);
}

/* ── Guardado ── */

// Refleja el cambio en memoria al instante y lo guarda; si falla, avisa sin frenar el juego.
async function guardar(ruta, valor) {
  aplicarProgresoLocal(ruta, valor);
  const uid = STATE.currentUser?.uid;
  if (!uid) return;
  try {
    await almacen.guardarProgreso(uid, ruta, valor);
  } catch (err) {
    console.error('Error al guardar el avance:', err);
    mostrarAviso('No pudimos guardar tu avance. Revisa tu conexión.');
  }
}

/* ── Acciones del mapa ── */

export async function abrirNivel(n) {
  const est = estadoActual();

  if (!nivelJugable(est, n)) {
    mostrarAviso(est.hechos[n]
      ? 'Ya completaste este nivel. Podrás rejugarlo al terminar todo el recorrido.'
      : 'Primero termina el nivel anterior.');
    return;
  }

  // Primera vez: antes del Nivel 1 va el pre-test
  if (est.modo === 'primera' && n === 1 && !est.pretestHecho) {
    mostrarInfo({
      titulo: 'Antes de empezar',
      texto: 'Primero haremos una prueba corta de 10 preguntas para conocer cuánto sabes hoy sobre estos temas. No hay respuestas malas. Al terminar pasas directo al Nivel 1.',
      ok: 'Empezar la prueba',
      cancelar: 'Volver',
      onOk: () => iniciarPretest(),
    });
    return;
  }

  await empezarNivel(n, est.modo);
}

export function abrirEtapaFinal() {
  const est = estadoActual();

  if (est.etapaFinal === 'posttest') {
    mostrarInfo({
      titulo: 'Una última prueba',
      texto: 'Para terminar, otra prueba corta de 10 preguntas para conocer cuánto sabes ahora, después de jugar. Son preguntas nuevas sobre los mismos temas.',
      ok: 'Empezar la prueba',
      cancelar: 'Más tarde',
      onOk: () => iniciarPosttest(),
    });
  } else if (est.etapaFinal === 'encuesta') {
    renderComparacion();                // retoma en la pantalla que lleva a la encuesta
    goTo('p-comparacion');
  } else if (est.etapaFinal === 'completo') {
    mostrarAviso('¡Completaste el recorrido! Practica los niveles cuando quieras.');
  } else {
    mostrarAviso('Termina los 3 niveles para llegar hasta aquí.');
  }
}

// Prepara el nivel (escenarios nuevos sorteados, contadores en cero) y muestra su intro.
async function empezarNivel(n, modo) {
  STATE.modoNivel = modo;
  await almacen.cargarContenido();
  STATE.historial = STATE.historial.filter(h => h.nivel !== n);   // salir a medias reinicia el nivel
  STATE.puntaje[n - 1] = 0;
  STATE.winstreak = 0;                                            // cada nivel arranca sin racha
  goToIntroNivel(n);
}

/* ── Reacciones a lo que ocurre en el juego ── */

async function alTerminarPretest() {
  await guardar('pretest', { respuestas: { ...STATE.pretest }, score: STATE.pretestScore, completadoEn: ahora() });
  await empezarNivel(1, 'primera');     // del pre-test pasa directo al Nivel 1
}

async function alTerminarPosttest() {
  await guardar('posttest', { respuestas: { ...STATE.posttest }, score: STATE.posttestScore, completadoEn: ahora() });
}

async function alTerminarNivel(n) {
  const entradas = STATE.historial.filter(h => h.nivel === n);
  const registro = {
    puntaje: STATE.puntaje[n - 1],
    historial: entradas,
    maxRacha: maxRacha(entradas),
    completadoEn: ahora(),
  };

  if (STATE.modoNivel === 'practica') {
    try {
      await almacen.guardarPractica(STATE.currentUser.uid, { nivel: n, ...registro });
    } catch (err) {
      console.error('Error al guardar la práctica:', err);
    }
    mostrarMapa();
    return;
  }

  await guardar(`niveles.${n}`, registro);
  STATE.maxWinstreak = Math.max(...NIVELES.map(k => leerProgreso().niveles?.[k]?.maxRacha ?? 0));
  if (n < 3) mostrarMapa();             // vuelve al mapa: se habilita el siguiente nivel
  else mostrarResultado();              // terminó los 3: puntaje y paso a la prueba final
}

window.addEventListener('pretest-terminado', alTerminarPretest);
window.addEventListener('posttest-terminado', alTerminarPosttest);
window.addEventListener('nivel-terminado', e => alTerminarNivel(e.detail.n));
window.addEventListener('ir-al-mapa', mostrarMapa);
window.addEventListener('entrar-al-juego', entrarAlJuego);
