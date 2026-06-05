/* ── Punto de entrada de la aplicación ── */

import { STATE, goTo } from './state.js';
import { onAuthChange } from '../firebase/auth.js';
import { getUserProfile, getUserSessions } from '../firebase/db.js';
import { cargarContenido } from './content-loader.js';

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
import { exportarResultados, reiniciarJuego } from './export.js';
import { submitLogin, submitRegister, logoutUser, resetLoginForm } from './auth-ui.js';
import {
  cargarPanelAdmin, verDetalleParticipante,
  cargarEscenarios, cargarPreguntas,
  toggleEscenario, togglePregunta,
  editarEscenario, editarPregunta, guardarEdicion,
  importarContenido, sincronizarEnlaces, sincronizarConsequencias, sincronizarOpciones, filtrarParticipantes, verDetalleSesion, volverADetalle, switchTestTab, eliminarParticipante,
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

    // Cargar contenido aleatorio para esta sesión
    await cargarContenido();

    const active = document.querySelector('.screen.active')?.id;
    if (!active || active === 'p-login' || active === 'p-register' || active === 'p-loading') {
      if (STATE.participante.role === 'admin') {
        cargarPanelAdmin();
      } else {
        goTo('p-bienvenida');
        cargarHistorialBienvenida(user.uid);
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
  abrirModalSUS,
  exportarResultados,
  reiniciarJuego,
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
  cargarHistorialBienvenida,
});

/* ── Historial de sesiones en bienvenida ── */
export async function cargarHistorialBienvenida(uid) {
  const el = document.getElementById('bienvenida-historial');
  if (!el) return;
  try {
    const sessions = await getUserSessions(uid);
    if (!sessions.length) {
      el.innerHTML = '<p class="body-sm text-muted">Aún no has completado ninguna sesión.</p>';
      return;
    }
    el.innerHTML = sessions.map(s => {
      const fecha    = s.completadoEn?.toDate
        ? s.completadoEn.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';
      const pts      = s.juego?.puntaje_total ?? null;
      const streak   = s.juego?.max_winstreak ?? 0;
      const ptsColor = pts === null ? 'var(--text-muted)' : pts >= 60 ? 'var(--accent3)' : pts >= 36 ? 'var(--accent)' : 'var(--accent2)';

      return `
        <div class="bienvenida-session-item">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="body-sm bold">Sesión ${s.sessionNumber}</span>
            <span class="body-sm text-muted">${fecha}</span>
          </div>
          <div class="bienvenida-scores">
            <div class="bienvenida-stat">
              <span class="body-sm text-muted">Puntaje</span>
              <span class="title-sm" style="color:${ptsColor}">${pts !== null ? pts + ' pts' : '—'}</span>
            </div>
            ${streak >= 2 ? `
            <div class="bienvenida-stat">
              <span class="body-sm text-muted">Mejor racha</span>
              <span class="title-sm" style="color:#ff8c42">🔥 x${streak}</span>
            </div>` : ''}
          </div>
        </div>`;
    }).join('');
  } catch {
    el.innerHTML = '<p class="body-sm text-muted">No se pudo cargar el historial.</p>';
  }
}

/* ── Cargar historial al entrar a bienvenida ── */
window.addEventListener('screen-change', ({ detail }) => {
  if (detail.screen === 'p-bienvenida' && STATE.currentUser?.uid) {
    cargarHistorialBienvenida(STATE.currentUser.uid);
  }
});

/* ── Animación de entrada ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity .5s';
    document.body.style.opacity    = '1';
  });
});
