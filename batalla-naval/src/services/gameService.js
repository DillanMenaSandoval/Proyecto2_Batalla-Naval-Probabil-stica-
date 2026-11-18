/**
 * gameService.js
 * Adaptador entre la interfaz React y la lógica del juego.
 *
 * Los componentes y hooks hablan SOLO con este módulo. Hoy devuelve datos de
 * presentación y rechaza las acciones, porque la lógica de partida aún no está
 * conectada. Para integrar: reemplazar el cuerpo de cada función por llamadas a
 * las clases reales (ver docs/INTEGRACION.md), manteniendo las formas de
 * contratoJuego.js.
 */

import { MOTIVO_RECHAZO } from "./contratoJuego.js";
import {
  estadoInicialPresentacion,
  tableroEnemigoVacio,
  tableroPropioVacio,
} from "./datosPresentacion.js";

/** @returns {import("./contratoJuego.js").SnapshotPartida} */
export function obtenerSnapshot() {
  return {
    estado: { ...estadoInicialPresentacion },
    acciones: { iniciar: false, reiniciar: false, disparar: false },
    tableroPropio: tableroPropioVacio(),
    tableroEnemigo: tableroEnemigoVacio(),
  };
}

/** @returns {import("./contratoJuego.js").ResultadoAccion} */
export function iniciarPartida() {
  return { ok: false, motivo: MOTIVO_RECHAZO.LOGICA_NO_CONECTADA };
}

/** @returns {import("./contratoJuego.js").ResultadoAccion} */
export function reiniciarPartida() {
  return { ok: false, motivo: MOTIVO_RECHAZO.LOGICA_NO_CONECTADA };
}

/**
 * Disparo del jugador humano sobre el tablero enemigo.
 * Firma prevista al integrar: disparar(celda: Celda).
 * @returns {import("./contratoJuego.js").ResultadoAccion}
 */
export function disparar() {
  return { ok: false, motivo: MOTIVO_RECHAZO.LOGICA_NO_CONECTADA };
}
