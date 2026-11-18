/**
 * etiquetas.js
 * Textos de la interfaz asociados a valores del contrato. Solo presentación.
 */

import { TIPO_JUGADOR } from "../../constantes/constantes.js";
import { ESTADO_BARCO, FASE_PARTIDA, MOTIVO_RECHAZO } from "../../services/contratoJuego.js";

export const ETIQUETA_FASE = Object.freeze({
  [FASE_PARTIDA.SIN_INICIAR]: "Sin iniciar",
  [FASE_PARTIDA.FLOTA_PREPARADA]: "Flota preparada",
  [FASE_PARTIDA.COLOCACION]: "Colocando flota",
  [FASE_PARTIDA.EN_CURSO]: "En curso",
  [FASE_PARTIDA.FINALIZADA]: "Finalizada",
});

export const ETIQUETA_ESTADO_BARCO = Object.freeze({
  [ESTADO_BARCO.SIN_INICIAR]: "Sin iniciar",
  [ESTADO_BARCO.COLOCADO]: "Colocado",
  [ESTADO_BARCO.EN_JUEGO]: "En juego",
  [ESTADO_BARCO.HUNDIDO]: "Hundido",
});

/** Mensaje para el usuario cuando una acción es rechazada. */
export const MENSAJE_RECHAZO = Object.freeze({
  [MOTIVO_RECHAZO.GENERACION_FALLIDA]: "No se pudo generar la flota. El tablero no ha cambiado; inténtalo de nuevo.",
  [MOTIVO_RECHAZO.LOGICA_NO_CONECTADA]: "Esta acción aún no está disponible.",
});

export const ETIQUETA_JUGADOR = Object.freeze({
  [TIPO_JUGADOR.HUMANO]: "Jugador",
  [TIPO_JUGADOR.AUTOMATA]: "Agente",
});

export const LETRAS_COLUMNA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Nombre legible de una celda: columna como letra, fila como número (A1…J10). */
export const nombreCelda = (fila, columna) => `${LETRAS_COLUMNA[columna]}${fila + 1}`;
