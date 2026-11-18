/**
 * geometria.js
 * Funciones sobre celdas y barcos 
 *
 * Formato de celda: { fila, columna }
 */

import { DIMENSION_TABLERO, ORIENTACION } from "../constantes/constantes.js"; // ajusta la ruta

export const claveCelda = (celda) => `${celda.fila},${celda.columna}`;

export const mismaCelda = (a, b) => a.fila === b.fila && a.columna === b.columna;


export function celdasDeBarco(fila, columna, tamaño, orientacion) {
  if (orientacion !== ORIENTACION.HORIZONTAL && orientacion !== ORIENTACION.VERTICAL) {
    throw new Error(`Orientación inválida: "${orientacion}".`);
  }
  const celdas = [];
  for (let i = 0; i < tamaño; i++) {
    celdas.push(
      orientacion === ORIENTACION.HORIZONTAL
        ? { fila, columna: columna + i }
        : { fila: fila + i, columna }
    );
  }
  return celdas;
}

export function estaDentroDelTablero(celdas, dimension = DIMENSION_TABLERO) {
  return celdas.every(
    (c) => c.fila >= 0 && c.fila < dimension && c.columna >= 0 && c.columna < dimension
  );
}

/**
 * Todas las colocaciones posibles de un barco que caben en el tablero
 * @returns {{fila:number, columna:number}[][]}  Cada elemento es el arreglo de celdas de una colocación.
 */
export function todasLasColocaciones(tamaño, dimension = DIMENSION_TABLERO) {
  const colocaciones = [];
  const limite = dimension - tamaño; // última posición inicial en que el barco aún cabe

  for (const orientacion of Object.values(ORIENTACION)) {
    const maxFila = orientacion === ORIENTACION.VERTICAL ? limite : dimension - 1;
    const maxColumna = orientacion === ORIENTACION.HORIZONTAL ? limite : dimension - 1;

    for (let fila = 0; fila <= maxFila; fila++) {
      for (let columna = 0; columna <= maxColumna; columna++) {
        colocaciones.push(celdasDeBarco(fila, columna, tamaño, orientacion));
      }
    }
  }
  return colocaciones;
}