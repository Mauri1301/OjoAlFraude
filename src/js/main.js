/* ── Punto de entrada de la aplicación ── */

import { STATE, goTo } from './state.js';
import { onAuthChange } from '../firebase/auth.js';
import { getUserProfile } from '../firebase/db.js';
import { cargarContenido } from './content-loader.js';

import {
  iniciarPretest,
  renderTest,
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
  clicoEnlaceFraude,
} from './nivel.js';

import { finalizarSUS, selectSUS } from './sus.js';
import { exportarResultados, reiniciarJuego } from './export.js';
import { submitLogin, submitRegister, logoutUser, resetLoginForm } from './auth-ui.js';
import {
  cargarPanelAdmin, verDetalleParticipante, toggleSessionDetail,
  cargarEscenarios, cargarPreguntas,
  toggleEscenario, togglePregunta,
  editarEscenario, editarPregunta, guardarEdicion,
  importarContenido, sincronizarEnlaces,
} from './admin-ui.js';


/* ── Observer de autenticación ── */
onAuthChange(async (user) => {
  if (user) {
    STATE.currentUser = user;

    if (!STATE.participante.uid) {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) STATE.participante = { ...profile, uid: user.uid };
      } catch { }
    }

    // Cargar contenido aleatorio para esta sesión
    await cargarContenido();

    const active = document.querySelector('.screen.active')?.id;
    if (!active || active === 'p-login' || active === 'p-register') {
      if (STATE.participante.role === 'admin') {
        cargarPanelAdmin();
      } else {
        goTo('p-bienvenida');
      }
    }
  } else {
    STATE.currentUser  = null;
    STATE.participante = {};
    resetLoginForm();
    goTo('p-login');
  }
});

/* ── Exponer funciones al scope global ── */
Object.assign(window, {
  goTo,
  // auth
  submitLogin,
  submitRegister,
  logoutUser,
  // juego
  iniciarPretest,
  selectTestOption,
  finalizarPretest,
  finalizarPosttest,
  iniciarPosttest,
  goToIntroNivel,
  iniciarNivel,
  responderEscenario,
  siguienteEscenario,
  clicoEnlaceFraude,
  finalizarSUS,
  selectSUS,
  exportarResultados,
  reiniciarJuego,
  // admin — participantes
  cargarPanelAdmin,
  verDetalleParticipante,
  toggleSessionDetail,
  // admin — contenido
  cargarEscenarios,
  cargarPreguntas,
  toggleEscenario,
  togglePregunta,
  editarEscenario,
  editarPregunta,
  guardarEdicion,
  importarContenido,
  sincronizarEnlaces,
});

/* ── Animación de entrada ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity .5s';
    document.body.style.opacity    = '1';
  });
});
