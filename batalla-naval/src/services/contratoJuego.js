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
  COLOCACION: "COLOCACION",
  EN_CURSO: "EN_CURSO",
  FINALIZADA: "FINALIZADA",
});

/** Motivos de rechazo que devuelven las acciones del servicio. */
export const MOTIVO_RECHAZO = Object.freeze({
  LOGICA_NO_CONECTADA: "LOGICA_NO_CONECTADA",
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
 * @typedef {{iniciar:boolean, reiniciar:boolean, disparar:boolean}} AccionesDisponibles
 *
 * @typedef {{
 *   estado: EstadoPartida,
 *   acciones: AccionesDisponibles,
 *   tableroPropio: CeldaPropia[][],
 *   tableroEnemigo: CeldaEnemiga[][]
 * }} SnapshotPartida
 *
 * @typedef {{ok:true}|{ok:false, motivo:string}} ResultadoAccion
 */
