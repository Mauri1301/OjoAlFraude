export const STATE = {
  currentUser:        null, // objeto Firebase User (auth)
  participante:       {},   // perfil del participante (cargado desde Firestore)
  // Contenido cargado desde Firestore (aleatorio por sesión)
  questionsActuales:  [],   // Form A (pre-test)
  posttestQuestions:  [],   // Form B (post-test)
  escenariosActuales: {},   // { 1: [...3], 2: [...3], 3: [...3] }
  // Estado del juego
  pretest: {},
  posttest: {},
  sus: {},
  puntaje: [0, 0, 0],
  escenarioIdx: 0,
  nivelActual: 0,
  historial: [],
  winstreak: 0,
  maxWinstreak: 0,
  escenarioStartTime: null,
  fraudeLink: false,   // true si el usuario respondió entrando al enlace falso
  modoNivel: 'primera', // 'primera' (primer recorrido) | 'practica' (rejugada)
  mapaPosPrev: null,    // clave del último nodo donde se dibujó el búho en el mapa
};

// Deja el estado del juego en blanco (al iniciar o cerrar sesión). No toca el
// usuario ni su perfil.
export function resetJuego() {
  STATE.questionsActuales  = [];
  STATE.posttestQuestions  = [];
  STATE.escenariosActuales = {};
  STATE.pretest = {};
  STATE.posttest = {};
  STATE.sus = {};
  STATE.puntaje = [0, 0, 0];
  STATE.escenarioIdx = 0;
  STATE.nivelActual = 0;
  STATE.historial = [];
  STATE.winstreak = 0;
  STATE.maxWinstreak = 0;
  STATE.escenarioStartTime = null;
  STATE.fraudeLink = false;
  STATE.modoNivel = 'primera';
  STATE.mapaPosPrev = null;
  delete STATE.pretestScore;
  delete STATE.posttestScore;
  delete STATE.susScore;
}

export function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  window.dispatchEvent(new CustomEvent('screen-change', { detail: { screen: id } }));
}
