/* Lógica pura del recorrido: qué hizo ya el participante y qué puede hacer
   ahora. No usa Firebase ni toca el DOM, así se puede probar aparte.

   El avance se guarda en users/{uid}.progreso:
     { pretest, niveles: {1,2,3}, posttest, kab, completo }
   - Primer recorrido: pre-test → Nivel 1 → 2 → 3 → post-test → encuesta.
   - Con `completo: true` ya no hay pre ni post y se puede rejugar cada nivel. */
import { STATE } from './state.js';

export const NIVELES = [1, 2, 3];

// Los usuarios que completaron una sesión antes de existir este flujo
// (sessionCount > 0 y sin campo `progreso`) cuentan como recorrido completo.
export function leerProgreso(participante = STATE.participante) {
  const raw = participante?.progreso;
  if (!raw && (participante?.sessionCount || 0) > 0) {
    return { pretest: null, niveles: {}, posttest: null, kab: null, completo: true, heredado: true };
  }
  const p = raw || {};
  return {
    pretest: p.pretest || null,
    niveles: p.niveles || {},
    posttest: p.posttest || null,
    kab: p.kab || null,
    completo: !!p.completo,
  };
}

export function estadoRecorrido(p) {
  const hechos = {};
  NIVELES.forEach(n => { hechos[n] = !!p.niveles?.[n]; });
  const todos = NIVELES.every(n => hechos[n]);
  const completo = !!p.completo;
  return {
    modo: completo ? 'practica' : 'primera',
    pretestHecho: !!p.pretest,
    hechos,
    todos,
    // Primer recorrido: el primer nivel que falta. En práctica no hay "actual".
    nivelActual: completo ? null : (NIVELES.find(n => !hechos[n]) ?? null),
    // Qué hay detrás del Nivel 3: nada aún, el post-test, la encuesta, o terminado.
    etapaFinal: completo ? 'completo' : (todos ? (p.posttest ? 'encuesta' : 'posttest') : 'bloqueada'),
  };
}

// ¿Se puede jugar el nivel n ahora mismo?
export function nivelJugable(est, n) {
  return est.modo === 'practica' || est.nivelActual === n;
}

// Estado visual del nodo i (0..2) del nivel n: hecho | actual | pendiente | bloqueado
export function estadoNodo(est, n, i) {
  if (est.modo === 'practica' || est.hechos[n]) return 'hecho';
  if (est.nivelActual === n) return i === 0 ? 'actual' : 'pendiente';
  return 'bloqueado';
}

// Estado visual del trofeo final: hecho | actual | bloqueado
export function estadoTrofeo(est) {
  if (est.etapaFinal === 'completo') return 'hecho';
  if (est.etapaFinal === 'posttest' || est.etapaFinal === 'encuesta') return 'actual';
  return 'bloqueado';
}

// Mejor racha de aciertos seguidos dentro de una lista de respuestas
export function maxRacha(historial = []) {
  let run = 0, max = 0;
  for (const h of historial) {
    run = h.correcto ? run + 1 : 0;
    if (run > max) max = run;
  }
  return max;
}

// Reconstruye STATE (pretest, puntajes, historial…) desde el progreso guardado,
// para que el resto de pantallas (resultados, comparación) funcionen igual.
export function hidratarEstado(p) {
  STATE.pretest = { ...(p.pretest?.respuestas || {}) };
  STATE.posttest = { ...(p.posttest?.respuestas || {}) };
  if (p.pretest) STATE.pretestScore = p.pretest.score;
  if (p.posttest) STATE.posttestScore = p.posttest.score;
  STATE.puntaje = NIVELES.map(n => p.niveles?.[n]?.puntaje ?? 0);
  STATE.historial = NIVELES.flatMap(n => p.niveles?.[n]?.historial ?? []);
  STATE.maxWinstreak = Math.max(0, ...NIVELES.map(n => p.niveles?.[n]?.maxRacha ?? 0));
}

// Refleja en memoria un cambio de progreso ('pretest', 'niveles.2', 'completo'…)
// para no tener que volver a leer el perfil.
export function aplicarProgresoLocal(ruta, valor) {
  const part = STATE.participante;
  if (!part) return;
  part.progreso = part.progreso || {};
  const claves = ruta.split('.');
  let o = part.progreso;
  claves.slice(0, -1).forEach(k => { o[k] = o[k] || {}; o = o[k]; });
  o[claves[claves.length - 1]] = valor;
}
