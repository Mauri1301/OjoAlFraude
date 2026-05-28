export const STATE = {
  currentUser:        null, // objeto Firebase User (auth)
  participante:       {},   // perfil del participante (cargado desde Firestore)
  // Contenido cargado desde Firestore (aleatorio por sesión)
  questionsActuales:  [],   // 5 preguntas seleccionadas al azar
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
  maxWinstreak: 0
};

export function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}
