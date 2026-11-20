/**
 * MapaProbabilidades.js
 * Almacena y consulta la estimación de probabilidades de UN jugador.
 * NO calcula nada: el cálculo lo hace CalcularProbabilidades
 * solo recibe el resultado con actualizar().
 *
 * Guarda :
 *  - la matriz de probabilidades 
 *  - el objetivo recomendado 
 *  - las métricas del cálculo 
 *
 * Todo lo que sale hacia afuera son copias, para que la interfaz de React no
 * pueda modificar el estado interno.
 */

import { DIMENSION_TABLERO } from "../constantes/constantes.js"; // ajusta la ruta

/** Qué hacer cuando varias celdas empatan con la probabilidad máxima. */
export const DESEMPATE = Object.freeze({
  ALEATORIO: "ALEATORIO", // una al azar entre las empatadas
  PRIMERO: "PRIMERO", // la primera en orden de fila y columna
});

const EPSILON = 1e-12; // probabilidades decimales

export default class MapaProbabilidades {
  #dimension;
  #desempate;
  #matriz = null;
  #objetivoRecomendado = null;
  #metricas = null;

  constructor({ dimension = DIMENSION_TABLERO, desempate = DESEMPATE.ALEATORIO } = {}) {
    if (!Object.values(DESEMPATE).includes(desempate)) {
      throw new Error(`Política de desempate inválida: "${desempate}".`);
    }
    this.#dimension = dimension;
    this.#desempate = desempate;
  }

  get tieneDatos() {
    return this.#matriz !== null;
  }

  /**
   * Reemplaza el mapa con un nuevo resultado
   * @param {{matriz:(number|null)[][], simulaciones?:number, configuracionesValidas?:number,
   *          tiempoMs?:number, sinConfiguraciones?:boolean}} calculo
   */
  actualizar(calculo) {
    const matriz = calculo?.matriz;
    this.#validarMatriz(matriz);

    this.#matriz = matriz.map((fila) => [...fila]);
    // celda que muestra la interfaz 
    // desempate aleatorio.
    this.#objetivoRecomendado = this.#elegirObjetivo();

    this.#metricas = {
      simulaciones: calculo.simulaciones ?? null,
      configuracionesValidas: calculo.configuracionesValidas ?? null,
      tiempoMs: calculo.tiempoMs ?? null,
      sinConfiguraciones: calculo.sinConfiguraciones ?? false,
      probabilidadObjetivo: this.#objetivoRecomendado
        ? this.#matriz[this.#objetivoRecomendado.fila][this.#objetivoRecomendado.columna]
        : null,
    };
  }

  /** Probabilidad de una celda, o null si está explorada o aún no hay mapa. */
  obtenerProbabilidad(celda) {
    if (!this.#matriz) return null;
    if (
      !celda ||
      !Number.isInteger(celda.fila) ||
      !Number.isInteger(celda.columna) ||
      celda.fila < 0 ||
      celda.fila >= this.#dimension ||
      celda.columna < 0 ||
      celda.columna >= this.#dimension
    ) {
      throw new Error("Celda fuera del mapa.");
    }
    return this.#matriz[celda.fila][celda.columna];
  }

  /** Copia de la matriz para la interfaz */
  obtenerMatriz() {
    return this.#matriz ? this.#matriz.map((fila) => [...fila]) : null;
  }

  /** Celda recomendada { fila, columna }, o null si no hay mapa o no quedan celdas por explorar. */
  obtenerMejorObjetivo() {
    return this.#objetivoRecomendado ? { ...this.#objetivoRecomendado } : null;
  }

  /** Métricas del último cálculo */
  obtenerMetricas() {
    return this.#metricas ? { ...this.#metricas } : null;
  }

  // ───────────── Internos ─────────────

  #elegirObjetivo() {
    let maxima = -Infinity;
    let candidatas = [];

    for (let fila = 0; fila < this.#dimension; fila++) {
      for (let columna = 0; columna < this.#dimension; columna++) {
        const p = this.#matriz[fila][columna];
        if (p === null) continue; // celda ya explorada

        if (p > maxima + EPSILON) {
          maxima = p;
          candidatas = [{ fila, columna }];
        } else if (Math.abs(p - maxima) <= EPSILON) {
          candidatas.push({ fila, columna });
        }
      }
    }

    if (candidatas.length === 0) return null;
    if (this.#desempate === DESEMPATE.PRIMERO) return candidatas[0];
    return candidatas[Math.floor(Math.random() * candidatas.length)];
  }

  #validarMatriz(matriz) {
    const d = this.#dimension;
    const formaValida =
      Array.isArray(matriz) &&
      matriz.length === d &&
      matriz.every(
        (fila) =>
          Array.isArray(fila) &&
          fila.length === d &&
          fila.every((p) => p === null || (Number.isFinite(p) && p >= 0 && p <= 1))
      );

    if (!formaValida) {
      throw new Error(
        `La matriz debe ser ${d}×${d} con valores entre 0 y 1, o null en celdas exploradas.`
      );
    }
  }
}