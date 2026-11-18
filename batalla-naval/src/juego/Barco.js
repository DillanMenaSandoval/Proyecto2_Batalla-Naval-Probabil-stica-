/**
 * Barco.js
 * Una embarcación colocada en un Tablero: sabe qué celdas ocupa y cuáles
 * ya recibieron un impacto. Solo la usa Tablero; nadie más debe tener
 * acceso a sus celdas, porque son la ubicación real de la flota.
 */

const clave = (celda) => `${celda.fila},${celda.columna}`;

export default class Barco {
  #id;
  #tamaño;
  #celdas;
  #impactos = new Set(); // claves "fila,columna" de las celdas impactadas

  /**
   * @param {string} id        Identificador de la flota (PA, AC, CR, SM, DE).
   * @param {number} tamaño    Cantidad de celdas.
   * @param {{fila:number, columna:number}[]} celdas  Celdas que ocupa.
   */
  constructor(id, tamaño, celdas) {
    if (celdas.length !== tamaño) {
      throw new Error(`El barco "${id}" debe ocupar ${tamaño} celdas.`);
    }
    this.#id = id;
    this.#tamaño = tamaño;
    this.#celdas = celdas.map(({ fila, columna }) => ({ fila, columna }));
  }

  get id() {
    return this.#id;
  }

  get tamaño() {
    return this.#tamaño;
  }

  /** Copia de las celdas */
  get celdas() {
    return this.#celdas.map((c) => ({ ...c }));
  }

  get impactosRecibidos() {
    return this.#impactos.size;
  }

  ocupa(celda) {
    return this.#celdas.some((c) => c.fila === celda.fila && c.columna === celda.columna);
  }

  registrarImpacto(celda) {
    if (!this.ocupa(celda)) {
      throw new Error(`La celda (${celda.fila}, ${celda.columna}) no pertenece al barco "${this.#id}".`);
    }
    this.#impactos.add(clave(celda));
  }

  estaHundido() {
    return this.#impactos.size === this.#tamaño;
  }
}