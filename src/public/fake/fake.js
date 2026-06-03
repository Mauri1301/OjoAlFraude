/* Comportamiento compartido de las páginas falsas — OjoAlFraude */

// Tooltips: hover en desktop, tap en móvil
document.querySelectorAll('.tip-wrap').forEach(w => {
  w.addEventListener('click', e => {
    e.stopPropagation();
    const open = w.classList.contains('open');
    document.querySelectorAll('.tip-wrap.open').forEach(o => o.classList.remove('open'));
    if (!open) w.classList.add('open');
  });
});
document.addEventListener('click', () =>
  document.querySelectorAll('.tip-wrap.open').forEach(o => o.classList.remove('open')));

// Permite que un escenario sobrescriba el dominio mostrado: ?u=dominio-falso.com
const _u = new URLSearchParams(location.search).get('u');
if (_u) {
  const el = document.getElementById('sim-url-text');
  if (el) el.textContent = _u;
}

// Cerrar pestaña y volver al juego
function cerrar() {
  window.close();
  setTimeout(() => {
    const t = document.querySelector('.close-txt');
    if (t) t.textContent = 'Cierra esta pestaña manualmente para volver al juego.';
  }, 500);
}
