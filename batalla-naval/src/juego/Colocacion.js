/**
 * colocacion.js
 * Supervisa la colocación de barcos en un Tablero PROPIO. Sirve igual para
 * la colocación manual y la aleatoria.
 * Tablero.colocarBarco, que rechaza cualquier colocación inválida.
 */

import { FLOTA } from "../constantes/constantes.js"; // ajusta la ruta
import { claveCelda, mismaCelda, todasLasColocaciones } from "../utils/Geometria.js"; // ajusta la ruta

/**
 * Todas las formas en que un barco de este tamaño cabe ahora en el tablero
 */
export function colocacionesValidas(tablero, tamaño) {
  return todasLasColocaciones(tamaño, tablero.dimension).filter((celdas) =>
    tablero.puedenOcuparse(celdas)
  );
}

/**
 * Celdas que el usuario puede seleccionar
 * Una celda es candidata si pertenece a alguna colocación válida
 *
 *  - Sin selección: todas las celdas donde el barco todavía cabe.
 *  - Tras la primera celda: las de ambas orientaciones.
 *  - Tras la segunda: la orientación queda fijada.
 *
 * @param {Tablero} tablero
 * @param {number} tamaño  Tamaño del barco que se está colocando.
 * @param {{fila:number, columna:number}[]} seleccionadas  Celdas ya elegidas.
 * @returns {{fila:number, columna:number}[]}  Celdas candidatas (sin incluir las ya elegidas).
 */
export function celdasCandidatas(tablero, tamaño, seleccionadas = []) {
  const candidatas = new Map();

  for (const celdas of colocacionesValidas(tablero, tamaño)) {
    const contieneSeleccion = seleccionadas.every((s) =>
      celdas.some((c) => mismaCelda(c, s))
    );
    if (contieneSeleccion) {
      celdas.forEach((c) => candidatas.set(claveCelda(c), c));
    }
  }

  seleccionadas.forEach((s) => candidatas.delete(claveCelda(s)));
  return [...candidatas.values()];
}

/**
 * Coloca toda la flota al azar. Reubica la flota completa
 * Elige entre las colocaciones válidas.
 *
 * @param {Tablero} tablero
 * @param {{id:string, tamaño:number}[]} flota
 * @param {number} maxIntentos
 */
export function colocarFlotaAleatoria(tablero, flota = FLOTA, maxIntentos = 100) {
  const barcos = [...flota].sort((a, b) => b.tamaño - a.tamaño);

  for (let intento = 0; intento < maxIntentos; intento++) {
    vaciarTablero(tablero);

    let completo = true;
    for (const barco of barcos) {
      const opciones = colocacionesValidas(tablero, barco.tamaño);
      if (opciones.length === 0) {
        completo = false;
        break;
      }
      const elegida = opciones[Math.floor(Math.random() * opciones.length)];
      tablero.colocarBarco(barco.id, elegida);
    }

    if (completo) return;
  }

  vaciarTablero(tablero);
  throw new Error(`No se logró colocar la flota tras ${maxIntentos} intentos.`);
}

function vaciarTablero(tablero) {
  tablero.obtenerIdsColocados().forEach((id) => tablero.quitarBarco(id));
}