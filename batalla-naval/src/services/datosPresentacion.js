/**
 * datosPresentacion.js
 * Datos ESTÁTICOS solo para dibujar la interfaz mientras la lógica no está
 * conectada. No simulan una partida ni inventan estadísticas: son tableros
 * vacíos y un estado «sin iniciar». Se eliminan cuando gameService use la
 * lógica real.
 */

import { DIMENSION_TABLERO, TIPO_JUGADOR } from "../constantes/constantes.js";
import { FASE_PARTIDA } from "./contratoJuego.js";

const crearMatriz = (crearCelda, dimension = DIMENSION_TABLERO) =>
  Array.from({ length: dimension }, () => Array.from({ length: dimension }, crearCelda));

export const tableroPropioVacio = () =>
  crearMatriz(() => ({ idBarco: null, atacada: false, hundido: false }));

export const tableroEnemigoVacio = () =>
  crearMatriz(() => ({ resultado: null, hundido: false }));

export const estadoInicialPresentacion = Object.freeze({
  fase: FASE_PARTIDA.SIN_INICIAR,
  turno: null,
  mensaje: "La partida aún no ha comenzado.",
});

export const jugadoresPresentacion = Object.freeze({
  [TIPO_JUGADOR.HUMANO]: "Jugador",
  [TIPO_JUGADOR.AUTOMATA]: "Agente",
});
