/* ── Punto de entrada de la aplicación ── */

import { STATE, goTo, resetJuego } from './state.js';
import { onAuthChange } from '../firebase/auth.js';
import { getUserProfile } from '../firebase/db.js';

import {
  iniciarPretest,
  renderTest,
  selectTestOption,
  finalizarPretest,
  finalizarPosttest,
  iniciarPosttest,
  selectCarouselOption,
  nextCarouselQuestion,
  prevCarouselQuestion,
  confirmCarousel,
} from './test.js';

import {
  goToIntroNivel,
  iniciarNivel,
  responderEscenario,
  siguienteEscenario,
  clicoEnlaceFraude,
} from './nivel.js';

import { finalizarSUS, selectSUS, abrirModalSUS } from './sus.js';
import { exportarResultados } from './export.js';
import { entrarAlJuego, mostrarMapa, abrirNivel, abrirEtapaFinal, salirAlMapa } from './recorrido.js';
import { mostrarAviso } from './ui.js';
import { abrirRecord } from './record.js';
import { toggleMenu, cerrarMenu } from './ui.js';
import { submitLogin, submitRegister, logoutUser, resetLoginForm } from './auth-ui.js';
import {
  cargarPanelAdmin, verDetalleParticipante,
  cargarEscenarios, cargarPreguntas,
  toggleEscenario, togglePregunta,
  editarEscenario, editarPregunta, guardarEdicion,
  importarContenido, sincronizarEnlaces, sincronizarConsequencias, sincronizarOpciones, sincronizarNarracion, filtrarParticipantes, verDetalleSesion, volverADetalle, switchTestTab, eliminarParticipante,
  cargarEstadisticas, exportarEstadisticasCSV, migrarKAB,
} from './admin-ui.js';


/* ── Observer de autenticación ── */
onAuthChange(async (user) => {
  if (user) {
    STATE.currentUser = user;

    if (!STATE.participante.uid) {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) STATE.participante = { ...profile, uid: user.uid };
        else {
          // Usuario autenticado sin perfil — ocultar contraseña y pre-llenar email
          const emailEl = document.getElementById('reg-email');
          const pwdRow  = document.getElementById('reg-pwd')?.closest('.form-group');
          const confRow = document.getElementById('reg-pwd-conf')?.closest('.form-group');
          if (emailEl) {
            emailEl.value = user.email;
            emailEl.readOnly = true;
            emailEl.style.opacity = '0.5';
            emailEl.style.cursor  = 'not-allowed';
          }
          if (pwdRow)  pwdRow.style.display  = 'none';
          if (confRow) confRow.style.display = 'none';
          goTo('p-register');
          return;
        }
      } catch { }
    }

    const active = document.querySelector('.screen.active')?.id;
    if (!active || active === 'p-login' || active === 'p-register' || active === 'p-loading') {
      if (STATE.participante.role === 'admin') {
        cargarPanelAdmin();
      } else {
        entrarAlJuego();      // estado limpio + progreso guardado → mapa de niveles
      }
    }
  } else {
    STATE.currentUser  = null;
    STATE.participante = {};
    resetJuego();
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
  abrirModalSUS,
  exportarResultados,
  // recorrido (mapa de niveles)
  abrirNivel,
  abrirEtapaFinal,
  irAlMapa: mostrarMapa,
  salirAlMapa,
  toggleMenu,
  cerrarMenu,
  abrirRecord,
  mostrarAviso,
  // carrusel test (desktop)
  selectCarouselOption,
  nextCarouselQuestion,
  prevCarouselQuestion,
  confirmCarousel,
  // admin — participantes
  cargarPanelAdmin,
  verDetalleParticipante,
  filtrarParticipantes,
  verDetalleSesion,
  volverADetalle,
  switchTestTab,
  eliminarParticipante,
  cargarEstadisticas,
  exportarEstadisticasCSV,
  migrarKAB,
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
  sincronizarConsequencias,
  sincronizarOpciones,
  sincronizarNarracion,
});

/* ── Búho en la pantalla de login (PNG ilustrado) ── */
const _loginBuho = document.getElementById('login-buho');
if (_loginBuho) _loginBuho.innerHTML =
  '<img src="/img/buho1.png" alt="OjoAlFraude" width="160" style="display:block;height:auto;filter:drop-shadow(0 6px 18px rgba(0,0,0,.4))">';

/* ── Animación de entrada ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity .5s';
    document.body.style.opacity    = '1';
  });
});
