/* Formulario B — Post-test (10 preguntas, orden fijo) */
export const TEST_QUESTIONS_B = [
  {
    constructo: 'Smishing (recompensa falsa)',
    texto: 'Un SMS de "Claro" te dice que ganaste un vale de S/. 500 en supermercados y debes registrarte en un enlace antes de que el premio expire en 2 horas. ¿Qué es lo más probable?',
    opciones: [
      'Es un premio real de Claro, debes registrarte rápido',
      'Es un intento de fraude que usa un premio falso y urgencia para obtener tus datos',
      'Es publicidad de un supermercado, puedes ignorarlo si no te interesa',
      'Es un error del sistema, es mejor no hacer nada',
    ],
    correcta: 1,
  },
  {
    constructo: 'Phishing WhatsApp',
    texto: 'Recibes un WhatsApp de "Yape Soporte" diciendo que tu cuenta fue suspendida y debes verificar tu identidad ingresando tu DNI y clave en un enlace. ¿Qué debes hacer?',
    opciones: [
      'Ingresar tus datos porque Yape necesita verificarte para reactivar tu cuenta',
      'Enviar solo tu DNI porque es información pública',
      'No ingresar ningún dato porque Yape nunca solicita claves por WhatsApp',
      'Desinstalar Yape de tu celular para protegerte',
    ],
    correcta: 2,
  },
  {
    constructo: 'Smishing (amenaza)',
    texto: 'Recibes un SMS de "SUNAT" indicando que tienes una deuda pendiente y tu cuenta bancaria será bloqueada en 24 horas si no ingresas a un enlace para regularizar tu situación. ¿Qué haces?',
    opciones: [
      'Ingresar al enlace de inmediato para regularizar tu deuda',
      'Ingresar directamente a la web oficial de SUNAT o llamar a sus líneas oficiales para verificar',
      'Responder el SMS con tus datos para que no te bloqueen',
      'Ignorarlo porque SUNAT no manda mensajes',
    ],
    correcta: 1,
  },
  {
    constructo: 'Señales de alerta web',
    texto: 'Estás a punto de ingresar tu clave en una página que dice ser de tu banco. ¿Cuál de estas señales indica que podría ser una página falsa?',
    opciones: [
      'La página tiene el logo del banco',
      'La página carga muy rápido',
      'La dirección web dice "http://" en lugar de "https://" y el nombre del banco está mal escrito',
      'La página te pide usuario y contraseña',
    ],
    correcta: 2,
  },
  {
    constructo: 'Ingeniería social familiar',
    texto: 'Tu hermano/a te escribe por WhatsApp desde un número que no reconoces diciendo que perdió su celular, está en el hospital y necesita S/. 300 urgente. Te pide no contarle a nadie todavía. ¿Qué haces?',
    opciones: [
      'Enviar el dinero inmediatamente porque es una emergencia familiar',
      'Comunicarte con otro familiar o llamar al número habitual de tu hermano/a para confirmar',
      'Enviar S/. 150 como adelanto mientras confirmas',
      'Escribirle de vuelta pidiendo que te mande una foto',
    ],
    correcta: 1,
  },
  {
    constructo: 'Redes sociales (sorteo falso)',
    texto: 'En Instagram ves una publicación de "Interbank Oficial" que anuncia: "¡Ganaste S/. 2,000! Sigue nuestra cuenta, comparte esta publicación y envíanos tu número de cuenta para depositar tu premio." ¿Qué haces?',
    opciones: [
      'Seguir los pasos porque Interbank es un banco confiable',
      'Compartir la publicación para no perder el premio',
      'No participar porque los bancos no entregan premios por redes sociales solicitando datos de cuenta',
      'Enviar solo el número de cuenta porque no incluye tu clave',
    ],
    correcta: 2,
  },
  {
    constructo: 'Redes sociales (cuenta hackeada)',
    texto: 'Un conocido tuyo te contacta por Instagram diciendo: "Necesito tu ayuda urgente, recarga S/. 50 a este número y te lo devuelvo hoy, estoy en un apuro." ¿Qué piensas?',
    opciones: [
      'Hacer la recarga porque tu conocido siempre ha sido de confianza',
      'Escribirle de vuelta preguntando para qué necesita la recarga',
      'Llamar directamente a tu conocido por teléfono para verificar que realmente es él',
      'Ignorar el mensaje porque no es tu problema',
    ],
    correcta: 2,
  },
  {
    constructo: 'Fraude financiero (transferencia urgente)',
    texto: 'Recibes una llamada de alguien que dice ser de la División Anticorrupción de la PNP. Te dice que tu cuenta está siendo usada para actividades ilegales y que debes retirar tu dinero y entregárselo a un agente que irá a tu casa para "resguardarlo". ¿Qué haces?',
    opciones: [
      'Retirar el dinero y esperar al agente porque es la Policía',
      'Colgar y llamar directamente a la PNP o a un familiar de confianza para verificar',
      'Pedir el número de placa del agente antes de entregar el dinero',
      'Entregar solo la mitad del dinero por precaución',
    ],
    correcta: 1,
  },
  {
    constructo: 'Fraude financiero (Yape/Plin falso)',
    texto: 'Un desconocido te contacta y dice que te transfirió S/. 300 por Plin por error. Te envía una captura de la transferencia y te pide que le devuelvas el dinero por depósito bancario. ¿Qué haces?',
    opciones: [
      'Devolver el dinero porque la captura demuestra que te lo enviaron',
      'Verificar en tu app de Plin si efectivamente recibiste esos S/. 300 antes de hacer cualquier movimiento',
      'Devolver S/. 200 y quedarte con el resto como compensación',
      'Pedirle que vaya a un banco a solucionarlo',
    ],
    correcta: 1,
  },
  {
    constructo: 'Phishing por correo electrónico',
    texto: 'Recibes un correo de "alertas@bcp-seguridad.com" que dice que tu tarjeta fue bloqueada por actividad sospechosa y debes hacer clic en un enlace para desbloquearla en las próximas 24 horas. ¿Qué haces?',
    opciones: [
      'Hacer clic en el enlace para desbloquear tu tarjeta de inmediato',
      'Responder el correo con tus datos para que verifiquen tu identidad',
      'Llamar al BCP al número oficial de tu tarjeta o ingresar directamente a la web oficial sin usar el enlace del correo',
      'Esperar a que el banco te contacte por teléfono',
    ],
    correcta: 2,
  },
];
