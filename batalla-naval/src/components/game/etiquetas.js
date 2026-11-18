/**
 * etiquetas.js
 * Textos de la interfaz asociados a valores del contrato. Solo presentación.
 */

import { TIPO_JUGADOR } from "../../constantes/constantes.js";
import { FASE_PARTIDA } from "../../services/contratoJuego.js";

export const ETIQUETA_FASE = Object.freeze({
  [FASE_PARTIDA.SIN_INICIAR]: "Sin iniciar",
  [FASE_PARTIDA.COLOCACION]: "Colocando flota",
  [FASE_PARTIDA.EN_CURSO]: "En curso",
  [FASE_PARTIDA.FINALIZADA]: "Finalizada",
});

export const ETIQUETA_JUGADOR = Object.freeze({
  [TIPO_JUGADOR.HUMANO]: "Jugador",
  [TIPO_JUGADOR.AUTOMATA]: "Agente",
});

export const LETRAS_COLUMNA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Nombre legible de una celda: columna como letra, fila como número (A1…J10). */
export const nombreCelda = (fila, columna) => `${LETRAS_COLUMNA[columna]}${fila + 1}`;
