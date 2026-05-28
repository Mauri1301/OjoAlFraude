/* Pool completo de preguntas — 10 en total, se muestran 5 aleatorias por sesión */

export const TEST_QUESTIONS_FULL = [
  {
    id: 'q0', activo: true,
    texto: 'Si recibes un mensaje de WhatsApp del "BCP" pidiéndote que ingreses tu clave en un enlace, ¿qué debes hacer?',
    opciones: ['Ingresar al enlace para verificar si es real', 'Ignorar y eliminar el mensaje sin hacer clic', 'Responder el mensaje con tu número de cuenta', 'Reenviar el mensaje a tus contactos'],
    correcta: 1,
  },
  {
    id: 'q1', activo: true,
    texto: 'Un correo dice ser de SUNAT y te ofrece una devolución de S/. 450. Para recibirla, piden tus datos bancarios. ¿Qué es esto?',
    opciones: ['Una devolución legítima de impuestos', 'Un error del sistema de SUNAT', 'Un intento de phishing o fraude', 'Una notificación oficial que debes atender'],
    correcta: 2,
  },
  {
    id: 'q2', activo: true,
    texto: '¿Cuál de estas señales indica que un mensaje puede ser un fraude?',
    opciones: ['El mensaje usa tu nombre completo y llega de un número conocido', 'El mensaje genera urgencia, tiene errores y pide datos o claves', 'El mensaje llega un domingo por la mañana', 'El mensaje tiene el logo del banco'],
    correcta: 1,
  },
  {
    id: 'q3', activo: true,
    texto: 'Tu amigo de Facebook te escribe que ganó S/. 8,400 invirtiendo en criptomonedas y quiere que tú también lo hagas. ¿Qué debes sospechar?',
    opciones: ['Que es una buena oportunidad de inversión', 'Que tu amigo quiere ayudarte económicamente', 'Que la cuenta de tu amigo puede estar hackeada y es un fraude', 'Que debes pedirle más información antes de decidir'],
    correcta: 2,
  },
  {
    id: 'q4', activo: true,
    texto: 'Recibes un SMS de "Movistar" diciéndote que tu línea será cortada en 24 horas si no actualizas tus datos en un enlace. ¿Qué haces?',
    opciones: ['Ingresas al enlace de inmediato para no perder tu línea', 'Llamas directamente a Movistar al número oficial para verificar', 'Actualizas tus datos porque el mensaje se ve oficial', 'Le muestras el mensaje a un familiar y juntos ingresan al enlace'],
    correcta: 1,
  },
  {
    id: 'q5', activo: true,
    texto: 'Recibes un WhatsApp de un número desconocido que dice ser "Interbank Seguridad" y pide tu número de tarjeta para "verificar tu identidad". ¿Qué haces?',
    opciones: ['Das el número de tarjeta porque la situación parece urgente', 'Preguntas el nombre del agente antes de dar tus datos', 'Cuelgas y llamas directamente al número oficial de Interbank', 'Pides que te manden un correo oficial antes de dar datos'],
    correcta: 2,
  },
  {
    id: 'q6', activo: true,
    texto: '¿Cuál de estas opciones es una señal de que una página web podría ser falsa?',
    opciones: ['La página tiene muchas imágenes y colores llamativos', 'La dirección web (URL) tiene palabras raras o no termina en el dominio oficial', 'La página carga lentamente', 'La página pide que inicies sesión con tu usuario y contraseña'],
    correcta: 1,
  },
  {
    id: 'q7', activo: true,
    texto: 'Recibes un correo con el logo del Ministerio de Trabajo ofreciéndote un bono de S/. 350 y pidiéndote tu clave bancaria. ¿Qué haces?',
    opciones: ['Ingresas tu clave porque tiene el logo oficial del Ministerio', 'Verificas en gob.pe si existe ese bono antes de dar cualquier dato', 'Llamas a un familiar para que te ayude a ingresar los datos', 'Ingresas solo el DNI, no la clave bancaria'],
    correcta: 1,
  },
  {
    id: 'q8', activo: true,
    texto: 'Un mensaje de WhatsApp de un número desconocido dice ser tu hijo/hija, que tuvo un accidente y necesita S/. 500 urgente. Pide que no llames a su número porque se rompió el celular. ¿Qué haces?',
    opciones: ['Transfieres los S/. 500 de inmediato porque puede ser una emergencia real', 'Llamas al número habitual de tu hijo/hija para verificar si está bien', 'Le preguntas al número desconocido más detalles del accidente', 'Transfieres la mitad del monto para no arriesgarte'],
    correcta: 1,
  },
  {
    id: 'q9', activo: true,
    texto: 'Un SMS te informa que ganaste un iPhone 15 de parte de tu operadora y debes ingresar a un enlace en 3 horas para reclamarlo. ¿Qué es lo más probable?',
    opciones: ['Es un premio real porque la operadora tiene tu número registrado', 'Es una oferta exclusiva para clientes antiguos', 'Es un fraude: las operadoras no regalan iPhones por SMS con links', 'Debes verificarlo ingresando al enlace con cuidado'],
    correcta: 2,
  },
];
