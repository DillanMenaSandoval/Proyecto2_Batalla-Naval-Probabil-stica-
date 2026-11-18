/**
 * datosPresentacion.js
 * Datos ESTÁTICOS para dibujar la interfaz cuando no hay partida: tableros
 * vacíos (el enemigo siempre lo es para la interfaz) y la flota «sin iniciar».
 * No simulan una partida ni inventan estadísticas.
 */

import { DIMENSION_TABLERO, FLOTA } from "../constantes/constantes.js";
import { ESTADO_BARCO } from "./contratoJuego.js";

const crearMatriz = (crearCelda, dimension = DIMENSION_TABLERO) =>
  Array.from({ length: dimension }, () => Array.from({ length: dimension }, crearCelda));

export const tableroPropioVacio = () =>
  crearMatriz(() => ({ idBarco: null, atacada: false, hundido: false }));

export const tableroEnemigoVacio = () =>
  crearMatriz(() => ({ resultado: null, hundido: false }));

/** Flota del jugador con todos los barcos «sin iniciar» (no hay partida). */
export const flotaSinIniciar = () =>
  FLOTA.map(({ id, nombre, tamaño }) => ({ id, nombre, tamaño, estado: ESTADO_BARCO.SIN_INICIAR }));
