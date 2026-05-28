export const STATE = {
  participante: {},
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
