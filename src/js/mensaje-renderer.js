/* Genera el HTML visual del mensaje de cada escenario a partir de datos */

export function renderMensaje(mensaje) {
  if (!mensaje) return '<p class="body-sm text-muted">Sin mensaje</p>';
  switch (mensaje.tipo) {
    case 'whatsapp':  return renderWA(mensaje);
    case 'email':     return renderEmail(mensaje);
    case 'sms':       return renderSMS(mensaje);
    case 'facebook':  return renderFB(mensaje);
    case 'messenger': return renderMessenger(mensaje);
    default:          return '<p class="body-sm text-muted">Tipo no reconocido</p>';
  }
}

function renderWA(m) {
  return `
    <div class="wa-bubble-wrap">
      <div class="wa-header">
        <div class="wa-avatar" style="${m.avatarColor ? 'background:' + m.avatarColor : ''}">${m.avatarLetra || '?'}</div>
        <div>
          <div class="wa-sender">${m.remitente}</div>
          <div class="wa-number">${m.numero || ''}</div>
        </div>
      </div>
      <div class="wa-bubble">
        ${m.contenido}
        <div class="wa-time">${m.hora || ''} ${m.ticks || ''}</div>
      </div>
    </div>`;
}

function renderEmail(m) {
  return `
    <div class="email-wrap">
      <div class="email-header">
        <div class="email-from">De: <span>${m.de}</span></div>
        <div class="email-from">Para: <span>${m.para || 'usted@gmail.com'}</span></div>
        <div class="email-subject">${m.asunto}</div>
      </div>
      <div class="email-body">
        ${m.logo ? `<div class="email-logo">${m.logo}</div>` : ''}
        ${m.cuerpo}
      </div>
    </div>`;
}

function renderSMS(m) {
  return `
    <div class="sms-wrap">
      <div class="sms-header">
        <div class="sms-icon" style="${m.iconColor ? 'background:' + m.iconColor : ''}">${m.iconLetra || '📱'}</div>
        <div>
          <div class="sms-sender">${m.remitente}</div>
          <div class="wa-number" style="font-size:.75rem;color:#8696a0">SMS</div>
        </div>
      </div>
      <div class="sms-bubble">${m.contenido}</div>
    </div>`;
}

function renderFB(m) {
  return `
    <div class="fb-wrap">
      <div class="fb-topbar">
        <span class="fb-logo">f</span>
        <span style="font-size:.85rem;color:#b0b3b8">${m.subheader || 'Facebook'}</span>
      </div>
      <div class="fb-post">
        <div class="fb-author">
          <div class="fb-avatar" style="${m.avatarColor ? 'background:' + m.avatarColor : ''}">${m.avatarLetra || '?'}</div>
          <div>
            <div class="fb-author-name">${m.autorNombre}</div>
            <div class="fb-author-sub">${m.autorSub || ''}</div>
          </div>
        </div>
        <div class="fb-text">${m.contenido}</div>
        ${m.img ? `<div class="fb-img">${m.img}</div>` : ''}
        ${m.likes ? `
          <div class="fb-reactions">
            <span class="fb-reaction">👍 ${m.likes}</span>
            ${m.comentarios ? `<span class="fb-reaction">💬 ${m.comentarios}</span>` : ''}
            ${m.compartidos ? `<span class="fb-reaction">↗ ${m.compartidos}</span>` : ''}
          </div>` : ''}
      </div>
    </div>`;
}

function renderMessenger(m) {
  return `
    <div class="fb-wrap">
      <div class="fb-topbar">
        <span class="fb-logo">f</span>
        <span style="font-size:.85rem;color:#b0b3b8">${m.subheader || 'Messenger'}</span>
      </div>
      <div class="fb-post">
        <div class="fb-author">
          <div class="fb-avatar" style="${m.avatarColor ? 'background:' + m.avatarColor : ''}">${m.avatarLetra || '?'}</div>
          <div>
            <div class="fb-author-name">${m.autorNombre}</div>
            <div class="fb-author-sub">${m.autorSub || ''}</div>
          </div>
        </div>
        <div class="fb-text">${m.contenido}</div>
      </div>
    </div>`;
}
