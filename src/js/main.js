/* ── Punto de entrada de la aplicación ── */

import { goTo } from './state.js';

import {
  registroSiguiente,
  selectTestOption,
  finalizarPretest,
  finalizarPosttest,
  iniciarPosttest,
} from './test.js';

import {
  goToIntroNivel,
  iniciarNivel,
  responderEscenario,
  siguienteEscenario,
} from './nivel.js';

import { finalizarSUS, selectSUS } from './sus.js';

import { exportarResultados, reiniciarJuego } from './export.js';

/* ── Exponer funciones al scope global para los onclick del HTML ──
   Los módulos ES no son globales por defecto; esto los conecta. */
Object.assign(window, {
  goTo,
  registroSiguiente,
  selectTestOption,
  finalizarPretest,
  finalizarPosttest,
  iniciarPosttest,
  goToIntroNivel,
  iniciarNivel,
  responderEscenario,
  siguienteEscenario,
  finalizarSUS,
  selectSUS,
  exportarResultados,
  reiniciarJuego,
});

/* ── Animación de entrada ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity .5s';
    document.body.style.opacity    = '1';
  });
});
