/**
 * constantes.js
 * Valores compartidos por Jugador, Tablero, CicloDeJuego, Simulador, etc.
 * Se centralizan aquí para no repetirlos ni dejar que se desincronicen.
 */

// ───────────── Tablero ─────────────

export const DIMENSION_TABLERO = 10; // tablero de 10 × 10

// ───────────── Barcos ─────────────

export const ORIENTACION = Object.freeze({
  HORIZONTAL: "HORIZONTAL",
  VERTICAL: "VERTICAL",
});

/**
 * Flota de cada jugador (5 embarcaciones).
 */
export const FLOTA = Object.freeze([
  Object.freeze({ id: "PA", nombre: "Portaaviones", tamaño: 5 }),
  Object.freeze({ id: "AC", nombre: "Acorazado", tamaño: 4 }),
  Object.freeze({ id: "CR", nombre: "Crucero", tamaño: 3 }),
  Object.freeze({ id: "SM", nombre: "Submarino", tamaño: 3 }),
  Object.freeze({ id: "DE", nombre: "Destructor", tamaño: 2 }),
]);

export const CANTIDAD_BARCOS = FLOTA.length;
export const TOTAL_CELDAS_BARCOS = FLOTA.reduce((suma, barco) => suma + barco.tamaño, 0);

// ───────────── Jugadores ─────────────

export const TIPO_JUGADOR = Object.freeze({
  HUMANO: "HUMANO",
  AUTOMATA: "AUTOMATA",
});

// ───────────── Disparos ─────────────

// Resultado de una celda ya atacada 
export const RESULTADO_CELDA = Object.freeze({
  AGUA: "AGUA",
  IMPACTO: "IMPACTO",
});