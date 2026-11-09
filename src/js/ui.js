/* Ventana informativa y aviso breve, reutilizables (sin lógica del juego). */

// Ventana con búho, título, texto y dos botones. onOk se ejecuta al aceptar.
export function mostrarInfo({ buho = 'buho6', titulo, texto, ok = 'Entendido', cancelar = 'Ahora no', onOk }) {
  const o = document.getElementById('overlay-info');
  if (!o) return;
  o.querySelector('#info-buho').src = `/img/${buho}.png`;
  o.querySelector('#info-titulo').textContent = titulo;
  o.querySelector('#info-texto').textContent = texto;
  const btnOk = o.querySelector('#info-ok');
  const btnNo = o.querySelector('#info-cancel');
  btnOk.textContent = ok;
  btnNo.textContent = cancelar;
  const cerrar = () => o.classList.remove('active');
  btnOk.onclick = () => { cerrar(); onOk?.(); };
  btnNo.onclick = cerrar;
  o.onclick = e => { if (e.target === o) cerrar(); };
  o.classList.add('active');
}

// Aviso breve abajo de la pantalla; se oculta solo.
let _toastTimer = null;
export function mostrarAviso(mensaje) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = mensaje;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
}

// Menú hamburguesa del mapa
export function cerrarMenu() {
  document.getElementById('menu-panel')?.classList.remove('open');
  document.getElementById('menu-hamb-btn')?.setAttribute('aria-expanded', 'false');
}
export function toggleMenu(e) {
  e?.stopPropagation();
  const p = document.getElementById('menu-panel');
  if (!p) return;
  const abierto = p.classList.toggle('open');
  document.getElementById('menu-hamb-btn')?.setAttribute('aria-expanded', String(abierto));
}
document.addEventListener('click', e => { if (!e.target.closest?.('#menu-hamb')) cerrarMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });
window.addEventListener('screen-change', cerrarMenu);
