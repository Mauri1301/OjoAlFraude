/* ── Punto de entrada de la aplicación ── */

import { STATE, goTo } from './state.js';
import { onAuthChange } from '../firebase/auth.js';
import { getUserProfile } from '../firebase/db.js';

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
} from './nivel.js';

import { finalizarSUS, selectSUS } from './sus.js';
import { exportarResultados, reiniciarJuego } from './export.js';
import { submitLogin, submitRegister, logoutUser } from './auth-ui.js';
import { cargarPanelAdmin, verDetalleParticipante, toggleSessionDetail } from './admin-ui.js';

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
    goTo('p-login');
  }
});

/* ── Exponer funciones al scope global para los onclick del HTML ── */
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
  finalizarSUS,
  selectSUS,
  exportarResultados,
  reiniciarJuego,
  // admin
  cargarPanelAdmin,
  verDetalleParticipante,
  toggleSessionDetail,
});

/* ── Animación de entrada ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity .5s';
    document.body.style.opacity    = '1';
  });
});
