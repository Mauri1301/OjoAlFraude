export const ESCENARIOS = [
  /* ── NIVEL 1 — BÁSICO ── */
  {
    nivel: 1, idx: 0,
    titulo: 'El mensaje del banco',
    canal: 'WhatsApp', badge: 'badge-success', badgeLabel: 'WhatsApp',
    tplId: 'tpl-esc-0', linkUrl: '/fake/bcp.html',
    pregunta: '¿Qué haces con este mensaje?',
    opciones: [
      'Entras al enlace de inmediato para desbloquear tu cuenta',
      'Llamas al BCP al número oficial (01) 311-9898 para verificar',
      'Le reenvías el mensaje a un familiar para que te ayude',
      'Respondes el mensaje pidiendo más información'
    ],
    correcta: 1,
    consecuencia_ok: '✅ ¡Excelente decisión! Llamaste directamente al banco. El agente te confirmó que ese mensaje es un fraude. Nunca enviaron ese WhatsApp. Tu cuenta está segura.',
    consecuencia_mal: '❌ Ingresaste al enlace. Era una página falsa que copió toda la información de tu tarjeta y clave. Al día siguiente, tu cuenta aparece con S/. 2,800 de movimientos no reconocidos.',
    señales: [
      { icon: '🔗', texto: 'El enlace NO es el sitio real del BCP. "bcp-seguridad-peru.verificacion.com" es un dominio falso. El real es viabcp.com.' },
      { icon: '⏰', texto: 'La urgencia extrema ("2 horas") es una táctica para que actúes sin pensar.' },
      { icon: '📱', texto: 'El BCP nunca bloquea cuentas por WhatsApp ni te pide ingresar a enlaces por este medio.' }
    ],
    explicacion: 'Este fraude se llama <strong>phishing</strong>. Los estafadores crean páginas web falsas que imitan a los bancos para robar tus datos. Siempre verifica llamando al número oficial del banco, que está en tu tarjeta.'
  },
  {
    nivel: 1, idx: 1,
    titulo: 'El correo de SUNAT',
    canal: 'Correo', badge: 'badge-info', badgeLabel: 'Email',
    tplId: 'tpl-esc-1', linkUrl: '/fake/sunat.html',
    pregunta: '¿Este correo de SUNAT es real?',
    opciones: [
      'Sí, ingreso al enlace para reclamar mi devolución',
      'No lo sé, pero el monto es tentador. Entro con cuidado',
      'Es un fraude. No hago clic y lo reporto como spam',
      'Llamo a SUNAT para confirmar si me deben ese dinero'
    ],
    correcta: 2,
    consecuencia_ok: '✅ Correcto. Marcaste el correo como spam y lo eliminaste. SUNAT confirmó que ellos nunca envían correos solicitando datos bancarios por enlace. Tu información está protegida.',
    consecuencia_mal: '❌ Ingresaste al enlace y colocaste tus datos. La "devolución" nunca llegó, pero sí llegaron cargos no reconocidos a tu cuenta. Tus datos fueron robados.',
    señales: [
      { icon: '📧', texto: 'El correo es "sunat-devolucion.net" — el correo oficial de SUNAT es @sunat.gob.pe. El ".net" es una señal de alerta.' },
      { icon: '💰', texto: 'SUNAT nunca solicita datos bancarios por correo electrónico para hacer devoluciones.' },
      { icon: '⏰', texto: 'La presión de "48 horas para reclamar" busca que actúes rápido sin verificar.' }
    ],
    explicacion: 'Las devoluciones de SUNAT se procesan automáticamente y NUNCA se notifican pidiendo datos por correo. Si tienes dudas sobre devoluciones, ingresa directamente a <strong>sunat.gob.pe</strong> con tu Clave SOL.'
  },
  {
    nivel: 1, idx: 2,
    titulo: 'El código de Yape',
    canal: 'WhatsApp', badge: 'badge-success', badgeLabel: 'WhatsApp',
    tplId: 'tpl-esc-2',
    pregunta: '¿Qué haces cuando te piden el código SMS?',
    opciones: [
      'Compartes el código porque quieres proteger tu cuenta',
      'Preguntas cuánto tiempo tienes para decidir',
      'Nunca compartes ese código. Cuelgas y llamas al soporte real de Yape',
      'Le pides que te envíe primero una foto de su identificación'
    ],
    correcta: 2,
    consecuencia_ok: '✅ ¡Muy bien! No compartiste el código. Llamaste al soporte de Yape y confirmaron que nadie de su equipo te contactó. El código SMS es la llave de tu cuenta.',
    consecuencia_mal: '❌ Compartiste el código. En segundos, el estafador ingresó a tu Yape y transfirió todo tu saldo. Los códigos SMS son como la llave de tu billetera digital.',
    señales: [
      { icon: '🔑', texto: 'Ningún banco, aplicación ni empresa JAMÁS te pedirá el código SMS que te llega. Ese código es solo para ti.' },
      { icon: '📞', texto: 'El soporte real de Yape nunca te contacta por WhatsApp para pedirte códigos.' },
      { icon: '⚠️', texto: 'La urgencia extrema ("puede ser vaciado en minutos") es la principal señal de alerta.' }
    ],
    explicacion: 'Los códigos SMS de verificación son como la llave maestra de tu cuenta. Los estafadores los piden urgentemente para tomar el control de tu Yape o banca móvil. <strong>Nadie legítimo te pedirá ese código jamás.</strong>'
  },

  /* ── NIVEL 2 — INTERMEDIO (SMS) ── */
  {
    nivel: 2, idx: 0,
    titulo: 'El SMS de Movistar',
    canal: 'SMS', badge: 'badge-purple', badgeLabel: 'SMS',
    tplId: 'tpl-esc-3', linkUrl: '/fake/movistar.html',
    pregunta: '¿Qué haces con este SMS de Movistar?',
    opciones: [
      'Ingresas al enlace porque no quieres perder tu línea',
      'Llamas a Movistar al *104 para verificar si es verdad',
      'Actualizas tus datos porque el mensaje parece oficial',
      'Ignoras el mensaje pero no haces nada más'
    ],
    correcta: 1,
    consecuencia_ok: '✅ Llamaste al *104 de Movistar. El operador confirmó que tu línea está activa y que nunca envían SMS con enlaces para actualizar datos. El mensaje era un fraude.',
    consecuencia_mal: '❌ Ingresaste al enlace y pusiste tu DNI y contraseña. Esa información fue capturada. Semanas después, descubriste que te habían sacado un crédito a tu nombre.',
    señales: [
      { icon: '🌐', texto: 'El dominio "movistar-pe.actualiza.datos.com" no es el sitio oficial. El real es movistar.com.pe.' },
      { icon: '🔐', texto: 'Movistar nunca pide tu contraseña del portal cliente por SMS.' },
      { icon: '📊', texto: 'El código de referencia (#MVS-20481) parece oficial pero es una trampa para generar confianza.' }
    ],
    explicacion: 'Las operadoras telefónicas nunca suspenden líneas por falta de "actualización de datos" vía SMS. Si tienes deudas, te notifican por medios oficiales. Siempre llama al número oficial de atención al cliente.'
  },
  {
    nivel: 2, idx: 1,
    titulo: 'La compra sospechosa',
    canal: 'SMS', badge: 'badge-purple', badgeLabel: 'SMS',
    tplId: 'tpl-esc-4', linkUrl: '/fake/bcp.html',
    pregunta: '¿Cómo reaccionas ante este SMS del BCP?',
    opciones: [
      'Ingresas al enlace urgentemente para bloquear el cargo',
      'Llamas al BCP al (01) 311-9898 o al número del reverso de tu tarjeta',
      'Le pides a un familiar que te ayude a ingresar al enlace',
      'Esperas los 30 minutos para ver qué pasa'
    ],
    correcta: 1,
    consecuencia_ok: '✅ Llamaste al BCP. El asesor revisó tu cuenta y confirmó que no hubo ningún cargo de ese tipo. El SMS era un fraude. Bloquearon ese número en su sistema.',
    consecuencia_mal: '❌ Entraste al enlace e ingresaste tus datos de tarjeta. En lugar de "bloquear" el cargo falso, los estafadores ahora tienen todos tus datos y sí hacen cargos reales.',
    señales: [
      { icon: '🔗', texto: '"bcp.alerta-fraude.com" no es un dominio del BCP. El sitio real es viabcp.com.' },
      { icon: '⏱️', texto: '"30 minutos" — Los fraudes siempre crean urgencia para que no tengas tiempo de verificar.' },
      { icon: '💳', texto: 'El BCP nunca pide que ingreses a un enlace de SMS para bloquear transacciones. Llama directamente.' }
    ],
    explicacion: 'Los bancos reales nunca te envían un enlace por SMS para "bloquear" transacciones. Si recibes una alerta de cargo, llama SIEMPRE al número que está en el reverso de tu tarjeta bancaria.'
  },
  {
    nivel: 2, idx: 2,
    titulo: 'El pago del delivery',
    canal: 'SMS', badge: 'badge-purple', badgeLabel: 'SMS',
    tplId: 'tpl-esc-5', linkUrl: '/fake/olva.html',
    pregunta: '¿Pagas los S/. 8.50 para liberar tu paquete?',
    opciones: [
      'Sí, son solo S/. 8.50, no es mucho dinero y quiero mi paquete',
      'Ingresas al enlace para ver de qué se trata antes de pagar',
      'Verificas en la web oficial de Olva Courier o los llamas directamente',
      'Le envías el enlace a tu hijo para que él pague'
    ],
    correcta: 2,
    consecuencia_ok: '✅ Buscaste el número oficial de Olva Courier y los llamaste. No hay ningún paquete a tu nombre. El SMS era un fraude. El enlace pedía datos de tarjeta, no solo S/. 8.50.',
    consecuencia_mal: '❌ El problema no fue pagar S/. 8.50. Al ingresar tu tarjeta, los estafadores guardaron todos tus datos y después hicieron compras mucho más grandes. El monto pequeño era solo el anzuelo.',
    señales: [
      { icon: '📦', texto: 'Si no estás esperando ningún paquete, cualquier SMS de delivery es sospechoso.' },
      { icon: '💸', texto: 'El monto pequeño (S/. 8.50) es una trampa para que no te preocupes y pongas tus datos de tarjeta.' },
      { icon: '🌐', texto: '"olva-pago.com" no es el sitio oficial. El real es olvacourier.com.pe.' }
    ],
    explicacion: 'Esta estafa se llama "smishing de delivery". Los estafadores saben que mucha gente espera paquetes. Usan montos pequeños para que la víctima no sospeche. Siempre busca el número oficial de la empresa y llama directamente.'
  },

  /* ── NIVEL 3 — AVANZADO (Redes Sociales) ── */
  {
    nivel: 3, idx: 0,
    titulo: 'El sorteo del BCP',
    canal: 'Facebook', badge: 'badge-info', badgeLabel: 'Facebook',
    tplId: 'tpl-esc-6',
    pregunta: '¿Participas en este sorteo del BCP?',
    opciones: [
      'Sí, compartes y escribes con tu DNI y número de cuenta',
      'Solo le das me gusta, pero no envías tus datos',
      'No participas. Buscas la página oficial del BCP para verificar',
      'Llamas al BCP para preguntar si el sorteo es real'
    ],
    correcta: 2,
    consecuencia_ok: '✅ Buscaste la página oficial verificada del BCP en Facebook. No hay ningún sorteo activo. La página del fraude tiene un nombre muy similar pero no es la oficial. Reportaste la página falsa.',
    consecuencia_mal: '❌ Enviaste tu DNI y número de cuenta. Días después, alguien intentó hacer un préstamo rápido online usando tu identidad. Los datos que compartiste permitieron el intento de fraude.',
    señales: [
      { icon: '✅', texto: 'Verifica la insignia de verificación azul (✓) real. Las páginas falsas imitan el nombre pero no tienen la verificación oficial de Facebook.' },
      { icon: '🏦', texto: 'Ningún banco serio pide DNI y número de cuenta por mensaje privado de Facebook para un sorteo.' },
      { icon: '👥', texto: 'Muchos "likes" y comentarios pueden ser bots. El número alto no garantiza que sea real.' }
    ],
    explicacion: 'Las páginas falsas de bancos en Facebook son muy comunes en Perú. Los estafadores crean páginas casi idénticas a las oficiales para robar datos. Siempre verifica que la página tenga el sello azul de verificación de Facebook y busca el link desde el sitio oficial del banco.'
  },
  {
    nivel: 3, idx: 1,
    titulo: 'El amigo hackeado',
    canal: 'Facebook', badge: 'badge-info', badgeLabel: 'Facebook',
    tplId: 'tpl-esc-7', linkUrl: '/fake/cripto.html',
    pregunta: '¿Qué haces cuando tu amigo Carlos te ofrece esto?',
    opciones: [
      'Te registras. Si Carlos ganó, tú también puedes',
      'Preguntas más detalles antes de invertir',
      'Llamas a Carlos por teléfono para verificar si realmente te escribió él',
      'Pides que te transfiera primero algo de sus ganancias para confiar'
    ],
    correcta: 2,
    consecuencia_ok: '✅ Llamaste a Carlos. "¿Qué link? ¡Yo no te mandé nada! Me hackearon la cuenta". Su cuenta de Facebook fue comprometida y usada para estafar a sus contactos. Carlos te agradeció el aviso.',
    consecuencia_mal: '❌ Te registraste y enviaste S/. 500. Al principio "las ganancias" aparecían en la plataforma, pero cuando quisiste retirar, te pidieron pagar una "comisión de retiro". Nunca recuperaste el dinero.',
    señales: [
      { icon: '🤖', texto: 'Si un amigo te escribe de forma inusual sobre inversiones, su cuenta puede estar hackeada.' },
      { icon: '💰', texto: '"Ganancias garantizadas" no existe en ninguna inversión legítima. Es una señal clásica de fraude.' },
      { icon: '📞', texto: 'Siempre verifica por llamada telefónica si realmente es tu amigo quien te está escribiendo.' }
    ],
    explicacion: 'Esta estafa se llama "fraude del amigo hackeado". Los delincuentes toman control de cuentas de Facebook y Whatsapp y contactan a todos los amigos para promover inversiones falsas o pedir dinero. Siempre llama por teléfono antes de hacer cualquier transferencia.'
  },
  {
    nivel: 3, idx: 2,
    titulo: 'La oferta de trabajo',
    canal: 'Facebook', badge: 'badge-info', badgeLabel: 'Facebook',
    tplId: 'tpl-esc-8',
    pregunta: '¿Postulas a este trabajo pagando los S/. 80?',
    opciones: [
      'Sí, S/. 80 es poco comparado al sueldo que ofrecen',
      'Preguntas si pueden descontarlo del sueldo directamente sin pagar antes',
      'No. Ningún empleo serio cobra por postular. Es un fraude',
      'Investigas la empresa en Google antes de decidir'
    ],
    correcta: 2,
    consecuencia_ok: '✅ Correcto. Ninguna empresa legítima cobra por darte trabajo. Este es uno de los fraudes más comunes en grupos de empleo de Facebook. Reportaste la publicación y avisaste en el grupo.',
    consecuencia_mal: '❌ Pagaste los S/. 80. Después te pidieron S/. 150 más para "uniforme virtual". Luego dejaron de responder. No hubo trabajo, no hubo devolución. El "kit" nunca llegó.',
    señales: [
      { icon: '💼', texto: 'NINGUNA empresa legítima cobra dinero para darte trabajo. El "pago de inscripción" es siempre una estafa.' },
      { icon: '🎯', texto: '"Sin experiencia", "mayores de 50 bienvenidos", "plazas limitadas" son señuelos para captar víctimas vulnerables.' },
      { icon: '🏠', texto: 'Las ofertas de trabajo desde casa con sueldos altos y sin requisitos son una señal de alerta importante.' }
    ],
    explicacion: 'Las estafas de empleo con "pago de inscripción" son muy comunes en grupos de Facebook. Una vez que pagas, los estafadores desaparecen o piden más dinero. <strong>Recuerda: si alguien te pide pagar para trabajar, es fraude.</strong>'
  }
];
