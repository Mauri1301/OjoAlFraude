/* Exportar JSON y reiniciar */
import { STATE, goTo } from './state.js';

export function exportarResultados() {
  const bonusPts = STATE.historial.filter(h => h.streakBonus).length * 5;
  const data = {
    participante: STATE.participante,
    pretest:  { respuestas: STATE.pretest,  score: STATE.pretestScore },
    juego: {
      puntaje_por_nivel:       STATE.puntaje,
      puntaje_total:           STATE.puntaje.reduce((a, b) => a + b, 0),
      puntaje_base:            STATE.puntaje.reduce((a, b) => a + b, 0) - bonusPts,
      bonus_racha_total:       bonusPts,
      escenarios_con_bono:     STATE.historial.filter(h => h.streakBonus).length,
      max_winstreak:           STATE.maxWinstreak,
      historial:               STATE.historial
    },
    posttest: { respuestas: STATE.posttest, score: STATE.posttestScore },
    sus:      { respuestas: STATE.sus },
    exportado: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `OjoAlFraude_${STATE.participante.nombre || 'participante'}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function reiniciarJuego() {
  // Mantiene currentUser y participante (Opción A: perfil persistente)
  // questionsActuales y escenariosActuales se recargan en cargarContenido (main.js)
  STATE.pretest      = {};
  STATE.posttest     = {};
  STATE.sus          = {};
  STATE.puntaje      = [0, 0, 0];
  STATE.escenarioIdx = 0;
  STATE.nivelActual  = 0;
  STATE.historial    = [];
  STATE.winstreak    = 0;
  STATE.maxWinstreak = 0;
  // Limpiar contenido — se recargará aleatoriamente en iniciarPretest()
  STATE.questionsActuales  = [];
  STATE.escenariosActuales = {};
  delete STATE.pretestScore;
  delete STATE.posttestScore;
  goTo('p-bienvenida');
}
