/**
 * Tablero.js
 * Campo PROPIO de un jugador. Guarda la ubicación real de sus barcos y
 * resuelve los disparos que recibe.
 *
 * Se crea VACÍO y se llena con colocarBarco(). La partida solo puede
 * empezar cuando flotaCompleta() es true.
 *
 * Estructuras internas (solo se modifican desde colocarBarco, quitarBarco
 * y recibirDisparo, para que nunca se desincronicen):
 *  - #celdas: matriz dimensión × dimensión de { idBarco, atacada }.
 *             Consulta inmediata por coordenada.
 *  - #barcos: Map id -> Barco. Sabe qué celdas ocupa cada barco y si se hundió.
 *
 * Formato de celda:      { fila, columna }
 * Respuesta a un disparo: { impacto: boolean, idBarco: string|null, hundido: boolean }
 * (nunca revela otras coordenadas del barco)
 */

import { DIMENSION_TABLERO, FLOTA } from "../constantes/constantes.js"; // ajusta la ruta
import Barco from "./Barco.js";

export default class Tablero {
  #dimension;
  #celdas;
  #barcos = new Map();
  #disparosRecibidos = 0;

  constructor(dimension = DIMENSION_TABLERO) {
    this.#dimension = dimension;
    this.#celdas = Array.from({ length: dimension }, () =>
      Array.from({ length: dimension }, () => ({ idBarco: null, atacada: false }))
    );
  }

  get dimension() {
    return this.#dimension;
  }

  // ───────────── Consultas sobre la colocación ─────────────

  /**
   * ¿Se pueden ocupar todas estas celdas? (dentro del tablero y libres).
   * Es la pregunta que usan colocacion.js y la interfaz.
   */
  puedenOcuparse(celdas) {
    if (!Array.isArray(celdas) || celdas.length === 0) return false;
    return celdas.every(
      (c) => this.#estaDentro(c) && this.#celdas[c.fila][c.columna].idBarco === null
    );
  }

  /** ¿Ya están colocados los barcos de toda la flota? */
  flotaCompleta() {
    return this.#barcos.size === FLOTA.length;
  }

  /** Ids de los barcos ya colocados (para que la interfaz sepa cuáles faltan). */
  obtenerIdsColocados() {
    return [...this.#barcos.keys()];
  }

  // ───────────── Colocación ─────────────

  /**
   * Coloca un barco. Es la ÚNICA forma de agregar barcos y valida todo,
   * aunque la interfaz ya haya consultado puedenOcuparse.
   * @param {string} id  Id de FLOTA (PA, AC, CR, SM, DE).
   * @param {{fila:number, columna:number}[]} celdas
   */
  colocarBarco(id, celdas) {
    if (this.#disparosRecibidos > 0) {
      throw new Error("No se pueden colocar barcos una vez iniciados los disparos.");
    }
    const definicion = FLOTA.find((b) => b.id === id);
    if (!definicion) {
      throw new Error(`Barco desconocido: "${id}".`);
    }
    if (this.#barcos.has(id)) {
      throw new Error(`El barco "${id}" ya está colocado.`);
    }
    if (!Array.isArray(celdas) || celdas.length !== definicion.tamaño) {
      throw new Error(`El barco "${id}" ocupa exactamente ${definicion.tamaño} celdas.`);
    }
    if (!this.puedenOcuparse(celdas)) {
      throw new Error(`Las celdas de "${id}" están fuera del tablero o sobre otro barco.`);
    }
    if (!this.#formanLineaRecta(celdas)) {
      throw new Error(`Las celdas de "${id}" deben formar una línea recta contigua.`);
    }

    const copia = celdas.map(({ fila, columna }) => ({ fila, columna }));
    copia.forEach(({ fila, columna }) => {
      this.#celdas[fila][columna].idBarco = id;
    });
    this.#barcos.set(id, new Barco(id, definicion.tamaño, copia));
  }

  /** Retira un barco ya colocado (para recolocarlo). Solo antes de la partida. */
  quitarBarco(id) {
    if (this.#disparosRecibidos > 0) {
      throw new Error("No se pueden quitar barcos una vez iniciados los disparos.");
    }
    const barco = this.#barcos.get(id);
    if (!barco) return false;
    barco.celdas.forEach(({ fila, columna }) => {
      this.#celdas[fila][columna].idBarco = null;
    });
    this.#barcos.delete(id);
    return true;
  }

  // ───────────── Disparos recibidos ─────────────

  /** Resuelve un disparo del oponente y devuelve solo la respuesta limitada. */
  recibirDisparo(celda) {
    if (!this.flotaCompleta()) {
      throw new Error("No se puede disparar: la flota aún no está completa.");
    }
    if (!this.#estaDentro(celda)) {
      throw new Error("Disparo fuera del tablero.");
    }
    const casilla = this.#celdas[celda.fila][celda.columna];
    if (casilla.atacada) {
      throw new Error(`La celda (${celda.fila}, ${celda.columna}) ya fue atacada.`);
    }

    casilla.atacada = true;
    this.#disparosRecibidos++;

    if (casilla.idBarco === null) {
      return { impacto: false, idBarco: null, hundido: false };
    }

    const barco = this.#barcos.get(casilla.idBarco);
    barco.registrarImpacto(celda);
    return { impacto: true, idBarco: barco.id, hundido: barco.estaHundido() };
  }

  /** Condición de derrota: toda la flota colocada y hundida. */
  todosLosBarcosHundidos() {
    // flotaCompleta() evita que un tablero vacío cuente como "derrotado"
    return this.flotaCompleta() && [...this.#barcos.values()].every((b) => b.estaHundido());
  }

  // ───────────── Vista para la interfaz ─────────────

  /**
   * Copia del tablero PROPIO para dibujarlo en React.
   * Matriz de { idBarco, atacada }. Nunca se usa para dibujar el tablero enemigo.
   */
  obtenerVistaPropia() {
    return this.#celdas.map((fila) => fila.map((c) => ({ ...c })));
  }

  // ───────────── Internos ─────────────

  #estaDentro(celda) {
    return (
      Boolean(celda) &&
      Number.isInteger(celda.fila) &&
      Number.isInteger(celda.columna) &&
      celda.fila >= 0 &&
      celda.fila < this.#dimension &&
      celda.columna >= 0 &&
      celda.columna < this.#dimension
    );
  }

  /** ¿Las celdas están en una misma fila o columna y son consecutivas? */
  #formanLineaRecta(celdas) {
    const mismaFila = celdas.every((c) => c.fila === celdas[0].fila);
    const mismaColumna = celdas.every((c) => c.columna === celdas[0].columna);
    if (!mismaFila && !mismaColumna) return false;

    const posiciones = celdas
      .map((c) => (mismaFila ? c.columna : c.fila))
      .sort((a, b) => a - b);
    return posiciones.every((p, i) => i === 0 || p === posiciones[i - 1] + 1);
  }
}