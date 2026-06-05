/* Lógica de pantallas de login y registro */
import { STATE, goTo } from './state.js';
import { loginWithEmail, registerWithEmail, logoutUser } from '../firebase/auth.js';
import { saveUserProfile } from '../firebase/db.js';

export function resetLoginForm() {
  const btn = document.getElementById('btn-login');
  if (btn) { btn.disabled = false; btn.textContent = 'Ingresar'; }
  const err = document.getElementById('login-err');
  if (err) err.classList.add('hidden');
  const pwd = document.getElementById('login-pwd');
  if (pwd) pwd.value = '';
}

export async function submitLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pwd').value;
  const errEl    = document.getElementById('login-err');

  errEl.classList.add('hidden');

  if (!email || !password) {
    errEl.textContent = 'Completa todos los campos';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('btn-login');
  btn.disabled    = true;
  btn.textContent = 'Ingresando...';

  try {
    await loginWithEmail(email, password);
    // onAuthChange en main.js maneja el redirect
  } catch (err) {
    btn.disabled    = false;
    btn.textContent = 'Ingresar';
    errEl.textContent = friendlyAuthError(err.code);
    errEl.classList.remove('hidden');
  }
}

export async function submitRegister() {
  const campos = [
    { id: 'reg-nombre', err: 'reg-nombre-err', check: v => v.trim().length >= 2 },
    { id: 'reg-edad',   err: 'reg-edad-err',   check: v => v >= 55 && v <= 100 },
    { id: 'reg-genero', err: 'reg-genero-err', check: v => v !== '' },
    { id: 'reg-uso',    err: 'reg-uso-err',    check: v => v !== '' },
    { id: 'reg-exp',    err: 'reg-exp-err',    check: v => v !== '' },
  ];

  let ok = true;
  const profileData = {};
  campos.forEach(c => {
    const el  = document.getElementById(c.id);
    const err = document.getElementById(c.err);
    const val = el.value;
    if (!c.check(val)) {
      err.classList.remove('hidden');
      ok = false;
    } else {
      err.classList.add('hidden');
      profileData[c.id.replace('reg-', '')] = val;
    }
  });

  const email   = document.getElementById('reg-email').value.trim();
  const pwd     = document.getElementById('reg-pwd').value;
  const pwdConf = document.getElementById('reg-pwd-conf').value;
  const errEl   = document.getElementById('reg-err');

  errEl.classList.add('hidden');

  if (!email) {
    errEl.textContent = 'Ingresa tu correo electrónico';
    errEl.classList.remove('hidden');
    return;
  }
  if (!STATE.currentUser && pwd.length < 6) {
    errEl.textContent = 'La contraseña debe tener al menos 6 caracteres';
    errEl.classList.remove('hidden');
    return;
  }
  if (!STATE.currentUser && pwd !== pwdConf) {
    errEl.textContent = 'Las contraseñas no coinciden';
    errEl.classList.remove('hidden');
    return;
  }
  if (!ok) return;

  const btn = document.getElementById('btn-register');
  btn.disabled    = true;
  btn.textContent = 'Creando cuenta...';

  try {
    let uid, userEmail;

    if (STATE.currentUser) {
      // Usuario ya autenticado — solo guardar perfil
      uid       = STATE.currentUser.uid;
      userEmail = STATE.currentUser.email;
    } else {
      const cred = await registerWithEmail(email, pwd);
      uid       = cred.user.uid;
      userEmail = email;
      STATE.currentUser = cred.user;
    }

    const profile = {
      ...profileData,
      email: userEmail,
      uid,
      creadoEn: new Date().toISOString(),
    };

    await saveUserProfile(uid, profile);

    // Restaurar campos de contraseña por si acaso
    const pwdRow  = document.getElementById('reg-pwd')?.closest('.form-group');
    const confRow = document.getElementById('reg-pwd-conf')?.closest('.form-group');
    const emailEl = document.getElementById('reg-email');
    if (pwdRow)  pwdRow.style.display  = '';
    if (confRow) confRow.style.display = '';
    if (emailEl) { emailEl.readOnly = false; emailEl.style.opacity = ''; emailEl.style.cursor = ''; }

    STATE.participante = profile;
    goTo('p-bienvenida');
  } catch (err) {
    btn.disabled    = false;
    btn.textContent = 'Crear cuenta';
    errEl.textContent = friendlyAuthError(err.code);
    errEl.classList.remove('hidden');
  }
}

export { logoutUser };

function friendlyAuthError(code) {
  const map = {
    'auth/invalid-email':          'El correo no es válido',
    'auth/user-not-found':         'No encontramos una cuenta con ese correo',
    'auth/wrong-password':         'Contraseña incorrecta',
    'auth/invalid-credential':     'Correo o contraseña incorrectos',
    'auth/email-already-in-use':   'Ya existe una cuenta con ese correo',
    'auth/too-many-requests':      'Demasiados intentos. Intenta más tarde',
    'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres',
    'auth/network-request-failed': 'Sin conexión a internet',
  };
  return map[code] || 'Ocurrió un error. Intenta de nuevo';
}
