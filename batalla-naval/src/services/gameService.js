/**
 * gameService.js
 * Adaptador entre la interfaz React y la lógica del juego.
 *
 * Los componentes y hooks hablan SOLO con este módulo. Conectado hasta ahora:
 * la generación aleatoria de la flota propia (Tablero + Colocacion). Iniciar,
 * reiniciar y disparar siguen rechazándose hasta que exista la lógica de
 * partida (ver docs/INTEGRACION.md). Las formas de datos están en contratoJuego.js.
 *
 * El Tablero vive en este módulo y nunca se entrega fuera: la interfaz solo
 * recibe copias (snapshot).
 */

import { FLOTA, TOTAL_CELDAS_BARCOS } from "../constantes/constantes.js";
import Tablero from "../juego/Tablero.js";
import { colocarFlotaAleatoria } from "../juego/Colocacion.js";
import { ESTADO_BARCO, FASE_PARTIDA, MOTIVO_RECHAZO } from "./contratoJuego.js";
import {
  estadoInicialPresentacion,
  flotaSinIniciar,
  tableroEnemigoVacio,
  tableroPropioVacio,
} from "./datosPresentacion.js";

/** Tablero propio con la flota ya generada; null mientras no se haya generado ninguna. */
let tableroPropio = null;

/** Estado de la flota propia a partir de los ids de barcos ya colocados. */
function flotaColocada(idsColocados) {
  return FLOTA.map(({ id, nombre, tamaño }) => ({
    id,
    nombre,
    tamaño,
    estado: idsColocados.includes(id) ? ESTADO_BARCO.COLOCADO : ESTADO_BARCO.SIN_INICIAR,
  }));
}

/** @returns {import("./contratoJuego.js").SnapshotPartida} */
export function obtenerSnapshot() {
  if (!tableroPropio) {
    return {
      estado: { ...estadoInicialPresentacion },
      acciones: { generarFlota: true, iniciar: false, reiniciar: false, disparar: false },
      tableroPropio: tableroPropioVacio(),
      tableroEnemigo: tableroEnemigoVacio(),
      flota: flotaSinIniciar(),
    };
  }

  return {
    estado: {
      fase: FASE_PARTIDA.FLOTA_PREPARADA,
      turno: null,
      mensaje: "Flota preparada. La partida aún no ha comenzado.",
    },
    acciones: { generarFlota: true, iniciar: false, reiniciar: false, disparar: false },
    tableroPropio: tableroPropio.obtenerVistaPropia(),
    tableroEnemigo: tableroEnemigoVacio(),
    flota: flotaColocada(tableroPropio.obtenerIdsColocados()),
  };
}

/**
 * Genera una flota aleatoria en un Tablero NUEVO y, solo si es válida y completa,
 * reemplaza la anterior. Si falla, se conserva el último estado válido.
 * @returns {import("./contratoJuego.js").ResultadoAccion}
 */
export function generarFlota() {
  try {
    const nuevo = new Tablero();
    colocarFlotaAleatoria(nuevo);

    const ocupadas = nuevo.obtenerVistaPropia().flat().filter((celda) => celda.idBarco !== null).length;
    if (!nuevo.flotaCompleta() || ocupadas !== TOTAL_CELDAS_BARCOS) {
      return { ok: false, motivo: MOTIVO_RECHAZO.GENERACION_FALLIDA };
    }

    tableroPropio = nuevo;
    return { ok: true };
  } catch {
    return { ok: false, motivo: MOTIVO_RECHAZO.GENERACION_FALLIDA };
  }
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
