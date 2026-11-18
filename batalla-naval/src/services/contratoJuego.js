/**
 * contratoJuego.js
 * Contrato entre la interfaz y la lógica del juego.
 *
 * La interfaz SOLO conoce estas formas de datos. Cuando se integre la lógica
 * real (Tablero, Jugador, CicloDeJuego, MapaProbabilidades…), el adaptador
 * `gameService.js` traduce sus resultados a estas formas y los componentes
 * no cambian.
 */

/** Fases de la partida que la interfaz sabe mostrar. */
export const FASE_PARTIDA = Object.freeze({
  SIN_INICIAR: "SIN_INICIAR",
  FLOTA_PREPARADA: "FLOTA_PREPARADA", // flota generada; la partida aún no ha comenzado
  COLOCACION: "COLOCACION", // colocación manual (aún no implementada)
  EN_CURSO: "EN_CURSO",
  FINALIZADA: "FINALIZADA",
});

/** Estado de un barco de la flota del jugador. */
export const ESTADO_BARCO = Object.freeze({
  SIN_INICIAR: "SIN_INICIAR",
  COLOCADO: "COLOCADO", // colocado en el tablero, sin partida en curso
  EN_JUEGO: "EN_JUEGO", // partida en curso (aún no implementada)
  HUNDIDO: "HUNDIDO",
});

/** Motivos de rechazo que devuelven las acciones del servicio. */
export const MOTIVO_RECHAZO = Object.freeze({
  LOGICA_NO_CONECTADA: "LOGICA_NO_CONECTADA",
  GENERACION_FALLIDA: "GENERACION_FALLIDA", // no se pudo generar una flota válida
});

/**
 * @typedef {{fila:number, columna:number}} Celda
 *
 * Celda del tablero PROPIO. Mismo formato que Tablero.obtenerVistaPropia().
 * @typedef {{idBarco:string|null, atacada:boolean, hundido:boolean}} CeldaPropia
 *
 * Celda del tablero ENEMIGO tal como la conoce el jugador (sin revelar barcos).
 * `resultado` es null mientras la celda no se ha atacado. Se deriva de
 * Jugador.obtenerConocimiento().celdasExploradas.
 * @typedef {{resultado:"AGUA"|"IMPACTO"|null, hundido:boolean}} CeldaEnemiga
 *
 * @typedef {{
 *   fase: string,
 *   turno: "HUMANO"|"AUTOMATA"|null,
 *   mensaje: string
 * }} EstadoPartida
 *
 * Qué acciones puede ofrecer la interfaz en este momento.
 * @typedef {{generarFlota:boolean, iniciar:boolean, reiniciar:boolean, disparar:boolean}} AccionesDisponibles
 *
 * Un barco de la flota del jugador. `id`, `nombre` y `tamaño` vienen de FLOTA;
 * `estado` es uno de ESTADO_BARCO (se derivará de Barco.estaHundido() y de sus
 * impactos, sin exponer las celdas del barco).
 * @typedef {{id:string, nombre:string, tamaño:number, estado:string}} BarcoFlota
 *
 * @typedef {{
 *   estado: EstadoPartida,
 *   acciones: AccionesDisponibles,
 *   tableroPropio: CeldaPropia[][],
 *   tableroEnemigo: CeldaEnemiga[][],
 *   flota: BarcoFlota[]
 * }} SnapshotPartida
 *
 * @typedef {{ok:true}|{ok:false, motivo:string}} ResultadoAccion
 */
