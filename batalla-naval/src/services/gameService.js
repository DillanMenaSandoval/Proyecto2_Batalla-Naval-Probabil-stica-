/**
 * gameService.js
 * Adaptador entre la interfaz React y la lógica del juego.
 *
 * Los componentes y hooks hablan SOLO con este módulo. Conectado hasta ahora:
 * ciclo de vida de la partida (generar flota, iniciar, reiniciar) con Tablero y
 * Colocacion. Disparar sigue rechazándose hasta que exista la lógica de ataques
 * (ver docs/INTEGRACION.md). Las formas de datos y las transiciones están en
 * contratoJuego.js.
 *
 * Los Tablero viven en este módulo y nunca se entregan fuera: la interfaz solo
 * recibe copias (snapshot). La fase se DEDUCE de qué tableros existen, así que
 * no puede quedar desincronizada:
 *   sin tablero propio                -> SIN_INICIAR
 *   tablero propio, sin enemigo       -> FLOTA_PREPARADA
 *   tablero propio y tablero enemigo  -> EN_CURSO
 */

import { FLOTA, TOTAL_CELDAS_BARCOS } from "../constantes/constantes.js";
import Tablero from "../juego/Tablero.js";
import { colocarFlotaAleatoria } from "../juego/Colocacion.js";
import { ESTADO_BARCO, FASE_PARTIDA, MOTIVO_RECHAZO } from "./contratoJuego.js";
import { flotaSinIniciar, tableroEnemigoVacio, tableroPropioVacio } from "./datosPresentacion.js";

/** Tablero propio con la flota ya generada; null mientras no se haya generado ninguna. */
let tableroPropio = null;

/**
 * Tablero enemigo con su flota; solo existe con la partida en curso. Sus posiciones
 * NO se incluyen jamás en el snapshot: la interfaz solo ve un tablero sin información.
 */
let tableroEnemigo = null;

const MENSAJE_FASE = Object.freeze({
  [FASE_PARTIDA.SIN_INICIAR]: "La partida aún no ha comenzado.",
  [FASE_PARTIDA.FLOTA_PREPARADA]: "Flota preparada. La partida aún no ha comenzado.",
  [FASE_PARTIDA.EN_CURSO]: "Partida iniciada. Los disparos aún no están disponibles.",
});

const ACCIONES_FASE = Object.freeze({
  [FASE_PARTIDA.SIN_INICIAR]: { generarFlota: true, iniciar: false, reiniciar: false, disparar: false },
  [FASE_PARTIDA.FLOTA_PREPARADA]: { generarFlota: true, iniciar: true, reiniciar: true, disparar: false },
  [FASE_PARTIDA.EN_CURSO]: { generarFlota: false, iniciar: false, reiniciar: true, disparar: false },
});

const rechazo = (motivo) => ({ ok: false, motivo });

function fasePartida() {
  if (!tableroPropio) return FASE_PARTIDA.SIN_INICIAR;
  return tableroEnemigo ? FASE_PARTIDA.EN_CURSO : FASE_PARTIDA.FLOTA_PREPARADA;
}

/** ¿Tiene el tablero la flota completa: 5 barcos y 17 celdas ocupadas? */
function flotaValida(tablero) {
  const ocupadas = tablero.obtenerVistaPropia().flat().filter((celda) => celda.idBarco !== null).length;
  return (
    tablero.flotaCompleta() &&
    tablero.obtenerIdsColocados().length === FLOTA.length &&
    ocupadas === TOTAL_CELDAS_BARCOS
  );
}

/** Tablero NUEVO con una flota aleatoria válida. Lanza si no se logra. */
function crearTableroConFlota() {
  const tablero = new Tablero();
  colocarFlotaAleatoria(tablero);
  if (!flotaValida(tablero)) {
    throw new Error("La flota generada está incompleta.");
  }
  return tablero;
}

/** Flota propia para la interfaz: COLOCADO antes de la partida, EN_JUEGO durante ella. */
function flotaPropia(fase) {
  if (!tableroPropio) return flotaSinIniciar();
  const colocados = tableroPropio.obtenerIdsColocados();
  const estadoColocado = fase === FASE_PARTIDA.EN_CURSO ? ESTADO_BARCO.EN_JUEGO : ESTADO_BARCO.COLOCADO;
  return FLOTA.map(({ id, nombre, tamaño }) => ({
    id,
    nombre,
    tamaño,
    estado: colocados.includes(id) ? estadoColocado : ESTADO_BARCO.SIN_INICIAR,
  }));
}

/** @returns {import("./contratoJuego.js").SnapshotPartida} */
export function obtenerSnapshot() {
  const fase = fasePartida();
  return {
    estado: { fase, turno: null, mensaje: MENSAJE_FASE[fase] },
    acciones: { ...ACCIONES_FASE[fase] },
    tableroPropio: tableroPropio ? tableroPropio.obtenerVistaPropia() : tableroPropioVacio(),
    tableroEnemigo: tableroEnemigoVacio(), // siempre sin información sobre la flota enemiga
    flota: flotaPropia(fase),
  };
}

/**
 * Genera una flota aleatoria en un Tablero NUEVO y, solo si es válida y completa,
 * reemplaza la anterior. Si falla, se conserva el último estado válido.
 * No es posible con la partida en curso.
 * @returns {import("./contratoJuego.js").ResultadoAccion}
 */
export function generarFlota() {
  if (fasePartida() === FASE_PARTIDA.EN_CURSO) {
    return rechazo(MOTIVO_RECHAZO.PARTIDA_EN_CURSO);
  }
  try {
    tableroPropio = crearTableroConFlota();
    return { ok: true };
  } catch {
    return rechazo(MOTIVO_RECHAZO.GENERACION_FALLIDA);
  }
}

/**
 * Inicia la partida: exige una flota propia completa (que no se modifica), prepara
 * en privado una flota enemiga válida y pasa a EN_CURSO. Si la flota enemiga no se
 * puede crear, no se publica nada y el estado anterior se conserva.
 * @returns {import("./contratoJuego.js").ResultadoAccion}
 */
export function iniciarPartida() {
  const fase = fasePartida();
  if (fase === FASE_PARTIDA.EN_CURSO) {
    return rechazo(MOTIVO_RECHAZO.PARTIDA_EN_CURSO);
  }
  if (fase !== FASE_PARTIDA.FLOTA_PREPARADA || !flotaValida(tableroPropio)) {
    return rechazo(MOTIVO_RECHAZO.FLOTA_NO_PREPARADA);
  }
  try {
    tableroEnemigo = crearTableroConFlota();
    return { ok: true };
  } catch {
    return rechazo(MOTIVO_RECHAZO.INICIO_FALLIDO);
  }
}

/**
 * Descarta la flota y la partida y vuelve a SIN_INICIAR. Válido desde
 * FLOTA_PREPARADA y EN_CURSO. No hay estadísticas ni contadores que restablecer
 * todavía: no existen disparos.
 * @returns {import("./contratoJuego.js").ResultadoAccion}
 */
export function reiniciarPartida() {
  if (fasePartida() === FASE_PARTIDA.SIN_INICIAR) {
    return rechazo(MOTIVO_RECHAZO.NADA_QUE_REINICIAR);
  }
  tableroPropio = null;
  tableroEnemigo = null;
  return { ok: true };
}

/**
 * Disparo del jugador humano sobre el tablero enemigo.
 * Firma prevista al integrar: disparar(celda: Celda).
 * @returns {import("./contratoJuego.js").ResultadoAccion}
 */
export function disparar() {
  return rechazo(MOTIVO_RECHAZO.LOGICA_NO_CONECTADA);
}
