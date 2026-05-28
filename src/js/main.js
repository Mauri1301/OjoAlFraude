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

/* ── Observer de autenticación ──────────────────────────────────
   Firebase llama a este callback:
   · al cargar la página (con el usuario persistido o null)
   · tras cada login, register o logout
──────────────────────────────────────────────────────────────── */
onAuthChange(async (user) => {
  if (user) {
    STATE.currentUser = user;

    // Cargar perfil desde Firestore solo si no está ya en STATE
    // (evita sobreescribir datos recién guardados durante el registro)
    if (!STATE.participante.uid) {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) STATE.participante = { ...profile, uid: user.uid };
      } catch {
        // Sin conexión o Firestore no configurado aún; el juego sigue
      }
    }

    // Si el usuario estaba en una pantalla de auth, redirigir a bienvenida
    const active = document.querySelector('.screen.active')?.id;
    if (!active || active === 'p-login' || active === 'p-register') {
      goTo('p-bienvenida');
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
});

/* ── Animación de entrada ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity .5s';
    document.body.style.opacity    = '1';
  });
});
