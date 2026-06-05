/* Formulario A — Pre-test (10 preguntas, orden fijo) */
export const TEST_QUESTIONS_A = [
  {
    constructo: 'Smishing (recompensa falsa)',
    texto: 'Un SMS te informa que ganaste un iPhone 15 de parte de tu operadora y debes ingresar a un enlace en 3 horas para reclamarlo. ¿Qué es lo más probable?',
    opciones: [
      'Es un premio real de tu operadora, debes ingresar rápido antes de que expire',
      'Es un intento de fraude que usa urgencia y premio falso para que hagas clic en un enlace',
      'Es publicidad de una tienda, puedes ignorarlo',
      'Es un error del sistema, puedes llamar al número que aparece',
    ],
    correcta: 1,
  },
  {
    constructo: 'Phishing WhatsApp',
    texto: 'Si recibes un mensaje de WhatsApp del "BCP" pidiéndote que ingreses tu clave en un enlace, ¿qué debes hacer?',
    opciones: [
      'Ingresar tu clave porque el BCP necesita verificar tu identidad',
      'Llamar al número que aparece en el mensaje para confirmar',
      'No ingresar ningún dato porque los bancos nunca solicitan claves por WhatsApp',
      'Reenviar el mensaje a tus contactos para advertirles',
    ],
    correcta: 2,
  },
  {
    constructo: 'Smishing (amenaza)',
    texto: 'Recibes un SMS de "Movistar" diciéndote que tu línea será cortada en 24 horas si no actualizas tus datos en un enlace. ¿Qué haces?',
    opciones: [
      'Ingresar al enlace inmediatamente para evitar que te corten la línea',
      'Llamar directamente a Movistar al número oficial para verificar si es verdad',
      'Responder el SMS pidiendo más información',
      'Ignorarlo porque los mensajes de operadoras siempre son spam',
    ],
    correcta: 1,
  },
  {
    constructo: 'Señales de alerta web',
    texto: '¿Cuál de estas opciones es una señal de que una página web podría ser falsa?',
    opciones: [
      'La página tiene muchas imágenes y colores llamativos',
      'La dirección web tiene errores ortográficos o caracteres extraños (ej: "bcpp.com" en vez de "bcp.com")',
      'La página pide que inicies sesión con tu usuario y contraseña',
      'La página carga lentamente',
    ],
    correcta: 1,
  },
  {
    constructo: 'Ingeniería social familiar',
    texto: 'Un mensaje de WhatsApp de un número desconocido dice ser tu hijo/hija, que tuvo un accidente y necesita S/. 500 urgente. Pide que no llames a su número porque se rompió el celular. ¿Qué haces?',
    opciones: [
      'Enviar el dinero de inmediato porque tu familia es lo primero',
      'Llamar a un familiar de confianza o al número habitual de tu hijo/hija para verificar',
      'Enviar solo S/. 100 para ver si es verdad',
      'Responder el mensaje pidiendo una foto como prueba',
    ],
    correcta: 1,
  },
  {
    constructo: 'Redes sociales (sorteo falso)',
    texto: 'Ves en Facebook una publicación de "BCP Oficial" que dice: "¡Felicitaciones! Fuiste seleccionado para ganar S/. 1,000. Haz clic aquí y completa tus datos bancarios para recibir tu premio." ¿Qué haces?',
    opciones: [
      'Hacer clic y completar tus datos porque el BCP es un banco conocido',
      'Compartir la publicación para que tus amigos también puedan ganar',
      'No hacer clic porque los bancos no entregan premios por Facebook solicitando datos bancarios',
      'Llamar al número que aparece en la publicación para confirmar',
    ],
    correcta: 2,
  },
  {
    constructo: 'Redes sociales (cuenta hackeada)',
    texto: 'Recibes un mensaje por Facebook de un amigo tuyo que dice: "Necesito que me hagas un favor urgente, ¿puedes prestarme S/. 200? Te devuelvo mañana. No puedo llamarte ahora." ¿Qué piensas?',
    opciones: [
      'Enviarle el dinero porque es tu amigo y parece urgente',
      'Responder el mensaje preguntando para qué necesita el dinero',
      'Llamar directamente a tu amigo a su celular para verificar si realmente es él quien escribió',
      'Ignorar el mensaje porque tu amigo debería llamarte',
    ],
    correcta: 2,
  },
  {
    constructo: 'Fraude financiero (transferencia urgente)',
    texto: 'Recibes una llamada de alguien que dice ser empleado del banco y te informa que detectaron movimientos sospechosos en tu cuenta. Te pide que transfieras tu dinero a una "cuenta segura" que él te dará para protegerlo. ¿Qué haces?',
    opciones: [
      'Transferir el dinero de inmediato para proteger tus ahorros',
      'Pedir el número de empleado y llamar de vuelta al banco por el número oficial para verificar',
      'Darle solo el número de tu tarjeta para que ellos lo protejan',
      'Transferir la mitad del dinero como medida de precaución',
    ],
    correcta: 1,
  },
  {
    constructo: 'Fraude financiero (Yape/Plin falso)',
    texto: 'Recibes un mensaje de WhatsApp con una captura de pantalla que muestra que te enviaron S/. 500 por Yape. El remitente dice que fue un error y te pide que le devuelvas el dinero por otro medio. ¿Qué haces?',
    opciones: [
      'Devolver el dinero de inmediato porque la captura muestra que te lo enviaron',
      'Verificar en tu app de Yape si realmente recibiste ese dinero antes de hacer cualquier transferencia',
      'Devolver solo S/. 400 por si acaso es un error',
      'Pedirle que te llame para explicarte mejor',
    ],
    correcta: 1,
  },
  {
    constructo: 'Phishing por correo electrónico',
    texto: 'Recibes un correo de "soporte@sunat-peru.net" que dice que tienes una deuda tributaria y debes pagar S/. 350 en 48 horas haciendo clic en un enlace, o recibirás una multa. ¿Qué haces?',
    opciones: [
      'Pagar de inmediato para evitar la multa',
      'Hacer clic en el enlace para ver cuánto debes exactamente',
      'Verificar el correo real de SUNAT e ingresar directamente a la página oficial sin hacer clic en el enlace del correo',
      'Responder el correo pidiendo más tiempo para pagar',
    ],
    correcta: 2,
  },
];
