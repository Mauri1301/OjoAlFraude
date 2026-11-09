/* Pantalla "Mi récord": mejor puntaje por nivel e historial de intentos.
   Intentos = partida del primer recorrido + prácticas (colección `practicas`). */
import { STATE, goTo } from './state.js';
import { NIVEL_CONFIG } from '../data/nivel-config.js';
import { leerProgreso, NIVELES } from './progreso.js';
import { getMisPracticas, getUserSessions } from '../firebase/db.js';

const COLOR = ['#0b7d86', '#1a6fd0', '#7b3fbf'];

function aMs(t) {
  if (!t) return 0;
  if (t.toDate) return t.toDate().getTime();
  const v = new Date(t).getTime();
  return Number.isNaN(v) ? 0 : v;
}
function fmt(ms) {
  return ms ? new Date(ms).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
}

// Une primer recorrido + prácticas en { [nivel]: [{puntaje, ms, practica}] }
export function armarIntentos(progreso, practicas = [], sesionPrevia = null) {
  const por = { 1: [], 2: [], 3: [] };
  NIVELES.forEach(n => {
    const r = progreso.niveles?.[n];
    if (r) por[n].push({ puntaje: r.puntaje, ms: aMs(r.completadoEn), practica: false });
    else if (sesionPrevia) {
      const pts = sesionPrevia.juego?.puntaje_por_nivel?.[n - 1];
      if (pts != null) por[n].push({ puntaje: pts, ms: aMs(sesionPrevia.completadoEn), practica: false });
    }
  });
  practicas.forEach(p => { if (por[p.nivel]) por[p.nivel].push({ puntaje: p.puntaje, ms: aMs(p.completadoEn), practica: true }); });
  NIVELES.forEach(n => por[n].sort((a, b) => b.ms - a.ms));
  return por;
}

export async function abrirRecord() {
  goTo('p-record');
  const lista = document.getElementById('record-lista');
  document.getElementById('record-sub').textContent = '';
  lista.innerHTML = '<p class="body-md text-muted text-center">Cargando…</p>';

  const uid = STATE.currentUser?.uid;
  const prog = leerProgreso();
  let practicas = [], previa = null;
  try {
    if (uid) {
      practicas = await getMisPracticas(uid);
      if (prog.heredado) previa = (await getUserSessions(uid)).slice(-1)[0] || null;   // la más antigua
    }
  } catch (err) {
    console.error('Error al cargar el récord:', err);
  }

  const por = armarIntentos(prog, practicas, previa);
  const total = NIVELES.reduce((a, n) => a + por[n].length, 0);
  document.getElementById('record-sub').textContent = total
    ? 'Tu mejor puntaje en cada nivel y tus intentos.'
    : 'Aún no tienes intentos. ¡Juega el Nivel 1!';

  lista.innerHTML = NIVELES.map(n => {
    const cfg = NIVEL_CONFIG[n - 1], it = por[n];
    const mejor = it.length ? Math.max(...it.map(i => i.puntaje)) : null;
    const filas = it.map(i => `
      <li class="record-fila"><span>${fmt(i.ms)} · ${i.practica ? 'Práctica' : 'Primer recorrido'}</span><strong>${i.puntaje} pts</strong></li>`).join('');
    return `
      <section class="record-nivel" style="--nv:${COLOR[n - 1]}">
        <div class="record-cab">
          <div><span class="record-n">${cfg.numero}</span><span class="record-t">${cfg.titulo}</span></div>
          <div class="record-mejor"><small>MEJOR</small><b>${mejor ?? '—'}</b></div>
        </div>
        <p class="record-int">${it.length ? `${it.length} intento${it.length > 1 ? 's' : ''}` : 'Sin intentos todavía'}</p>
        ${filas ? `<ul class="record-filas">${filas}</ul>` : ''}
      </section>`;
  }).join('');
}
