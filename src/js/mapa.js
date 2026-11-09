/* Mapa de niveles: camino de nodos (uno por nivel) con un banner por nivel.
   Solo dibuja; las acciones (abrirNivel, abrirEtapaFinal) viven en recorrido.js. */
import { STATE } from './state.js';
import { NIVEL_CONFIG } from '../data/nivel-config.js';
import { NIVELES, estadoNodo, estadoTrofeo } from './progreso.js';
import { buhoImg } from './buho.js';

const COLOR = [
  { c: '#0b7d86', d: '#05565c' },   // Nivel 1
  { c: '#1a6fd0', d: '#0e4c94' },   // Nivel 2
  { c: '#7b3fbf', d: '#55278a' },   // Nivel 3
];

const SVG = {
  check:  '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star:   '<svg viewBox="0 0 24 24"><path d="M12 2.8l2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.6 3.1 1.2-6.3L3 9.4l6.3-.8z" fill="currentColor"/></svg>',
  lock:   '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  trofeo: '<svg viewBox="0 0 24 24"><path d="M7 3h10v5a5 5 0 0 1-10 0V3z" fill="currentColor"/><path d="M7 5H3.5a3.5 3.5 0 0 0 3.6 4M17 5h3.5a3.5 3.5 0 0 1-3.6 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 13v4M8 21h8M9.5 17h5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
};

function subtitulo(est) {
  if (est.modo === 'practica') return 'Completaste el recorrido. Practica los niveles cuando quieras.';
  if (est.etapaFinal === 'posttest') return 'Solo falta una última prueba corta.';
  if (est.etapaFinal === 'encuesta') return 'Ya casi: falta una breve encuesta.';
  if (est.nivelActual === 1) return 'Este es tu camino. Empieza por el Nivel 1.';
  return `Sigue con el Nivel ${est.nivelActual}.`;
}

export function renderMapa(est, nombre) {
  window.__mapaEst = est;
  const cont = document.getElementById('mapa-camino');
  if (!cont) return;

  const primerNombre = (nombre || '').trim().split(/\s+/)[0];
  document.getElementById('mapa-saludo').textContent = primerNombre ? `¡Hola, ${primerNombre}!` : '¡Hola!';
  document.getElementById('mapa-sub').textContent = subtitulo(est);

  const DX = [-46, 46, -46, 46];                           // zigzag: nivel 1, 2, 3 y trofeo

  const unidades = NIVELES.map(n => {
    const cfg = NIVEL_CONFIG[n - 1], col = COLOR[n - 1];
    const estado = estadoNodo(est, n, 0);
    const dx = DX[n - 1];
    const burbuja = estado === 'actual' ? '<span class="mapa-burbuja">COMENZAR</span>' : '';
    const nodoIcono = estado === 'hecho' ? SVG.check : estado === 'actual' ? SVG.star : SVG.lock;
    return `
      <section class="mapa-fila mapa-unidad" data-dx="${dx}" style="--dx:${dx}px;--nv:${col.c};--nd:${col.d}">
        ${burbuja}
        <button class="mapa-nodo mn-${estado}" data-key="${n}-0" onclick="abrirNivel(${n})"
                aria-label="${cfg.numero} ${cfg.titulo}">${nodoIcono}</button>
        <div class="mapa-rotulo" onclick="abrirNivel(${n})">
          <span class="mapa-rotulo-n">${cfg.numero}</span>
          <span class="mapa-rotulo-t">${cfg.titulo}</span>
          <span class="mapa-rotulo-s">${cfg.subtitulo}</span>
        </div>
      </section>`;
  }).join('');

  const tEstado = estadoTrofeo(est);
  const tBurbuja = est.etapaFinal === 'posttest' ? 'ÚLTIMA PRUEBA' : est.etapaFinal === 'encuesta' ? 'TERMINAR' : '';
  const tDx = DX[3];
  const trofeo = `
    <div class="mapa-fila mapa-fila-final" data-dx="${tDx}" style="--dx:${tDx}px">
      ${tBurbuja ? `<span class="mapa-burbuja">${tBurbuja}</span>` : ''}
      <button class="mapa-nodo mapa-trofeo mn-${tEstado}" data-key="4-0" onclick="abrirEtapaFinal()"
              aria-label="Final del recorrido">${SVG.trofeo}</button>
    </div>`;

  cont.innerHTML = '<svg class="mapa-ruta" id="mapa-ruta"></svg>' + unidades + trofeo + '<div class="mapa-buho" id="mapa-buho"></div>';
  dibujarRuta(est);
  colocarBuho(est);
}

/* ── Ruta punteada que une los círculos (se dibuja tras medir el layout) ── */

function dibujarRuta(est) {
  const cont = document.getElementById('mapa-camino');
  const svg = document.getElementById('mapa-ruta');
  if (!cont || !svg) return;
  const c = cont.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${c.width} ${c.height}`);
  svg.setAttribute('width', c.width);
  svg.setAttribute('height', c.height);
  const pts = ['1-0', '2-0', '3-0', '4-0'].map(k => {
    const n = cont.querySelector(`[data-key="${k}"]`);
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 };
  });
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (!a || !b) continue;
    const my = (a.y + b.y) / 2;
    const hecho = i < 3 && (est.modo === 'practica' || est.hechos[i + 1]);
    d += `<path d="M${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}" class="${hecho ? 'ruta-hecha' : ''}"/>`;
  }
  svg.innerHTML = d;
}

/* ── Búho: se para junto al nodo actual (y camina hasta él si avanzó) ── */

function claveBuho(est) {
  if (est.modo === 'practica' || est.etapaFinal === 'posttest' || est.etapaFinal === 'encuesta') return '4-0';
  return `${est.nivelActual}-0`;
}

function posicionNodo(cont, key) {
  const nodo = cont.querySelector(`[data-key="${key}"]`);
  if (!nodo) return null;
  const c = cont.getBoundingClientRect(), r = nodo.getBoundingClientRect();
  const dx = Number(nodo.closest('.mapa-fila')?.dataset.dx || 0);
  const lado = dx > 0 ? -1 : 1;                            // va del lado con más espacio
  return {
    x: (r.left - c.left) + r.width / 2 + lado * (r.width / 2 + 54),
    y: (r.top - c.top) + r.height / 2,
    lado,
    nodo,
  };
}

function ponerBuho(buho, p) {
  buho.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
  buho.classList.toggle('voltear', p.lado === 1);          // mira hacia el nodo
}

let _clave = null;
function colocarBuho(est) {
  const cont = document.getElementById('mapa-camino');
  const buho = document.getElementById('mapa-buho');
  if (!cont || !buho) return;
  const key = claveBuho(est);
  const destino = posicionNodo(cont, key);
  if (!destino) return;
  _clave = key;

  buho.innerHTML = buhoImg(est.modo === 'practica' ? 'buho5' : 'buho3', 84, '');

  // Si avanzó desde otro nodo, parte de allí y camina hasta el nuevo
  const previo = STATE.mapaPosPrev && STATE.mapaPosPrev !== key ? posicionNodo(cont, STATE.mapaPosPrev) : null;
  if (previo) {
    buho.style.transition = 'none';
    ponerBuho(buho, previo);
    void buho.offsetWidth;                                  // fuerza el layout antes de animar
    buho.style.transition = '';
    requestAnimationFrame(() => ponerBuho(buho, destino));
  } else {
    buho.style.transition = 'none';
    ponerBuho(buho, destino);
    void buho.offsetWidth;
    buho.style.transition = '';
  }
  STATE.mapaPosPrev = key;
  setTimeout(() => destino.nodo.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150);
}

// Al girar o redimensionar la pantalla, vuelve a ubicar al búho sin animar
window.addEventListener('resize', () => {
  const cont = document.getElementById('mapa-camino');
  const buho = document.getElementById('mapa-buho');
  if (!cont || !buho || !_clave || !document.getElementById('p-mapa')?.classList.contains('active')) return;
  dibujarRuta(window.__mapaEst || { modo: 'primera', hechos: {} });
  const p = posicionNodo(cont, _clave);
  if (!p) return;
  buho.style.transition = 'none';
  ponerBuho(buho, p);
  void buho.offsetWidth;
  buho.style.transition = '';
});
