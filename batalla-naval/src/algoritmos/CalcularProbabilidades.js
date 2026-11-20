/**
 * CalcularProbabilidades.js
 * Estima, para cada celda, la probabilidad de que contenga parte de un barco
 * enemigo, usando simulación Monte Carlo:
 *
 *   1. Se generan N configuraciones hipotéticas de la flota compatibles con
 *      lo que el jugador ya sabe.
 *   2. Por cada configuración válida, cada celda que ocupa suma 1.
 *   3. probabilidad(celda) = conteo(celda) / configuraciones válidas
 *
 * Solo trabaja con CONOCIMIENTO PARCIAL
 *
 * Resultado de calcular():
 *   {
 *     matriz,                  // dimensión × dimensión; null en celdas ya exploradas
 *     simulaciones,            // intentos solicitados
 *     configuracionesValidas,  // intentos que produjeron una flota válida
 *     tiempoMs,                // tiempo de cálculo medido
 *     sinConfiguraciones,      // true si no hubo ninguna configuración válida
 *   }
 */

import { DIMENSION_TABLERO } from "../constantes/constantes.js"; // ajusta la ruta
import { claveCelda } from "../utils/Geometria.js"; // ajusta la ruta

export default class CalcularProbabilidades {
  #simulador;

  /** @param {Simulador} simulador  Una sola instancia puede compartirse entre jugadores. */
  constructor(simulador) {
    if (!simulador) {
      throw new Error("CalcularProbabilidades requiere un simulador.");
    }
    this.#simulador = simulador;
  }

  /**
   * @param {{celdasExploradas: object[], barcosHundidos: string[]}} conocimiento
   * @param {number} simulaciones  Cantidad de configuraciones a intentar.
   */
  calcular(conocimiento, simulaciones) {
    if (!Number.isInteger(simulaciones) || simulaciones <= 0) {
      throw new Error("La cantidad de simulaciones debe ser un entero positivo.");
    }

    const inicio = performance.now();
    const conteo = Array.from({ length: DIMENSION_TABLERO }, () =>
      new Array(DIMENSION_TABLERO).fill(0)
    );
    let configuracionesValidas = 0;

    // Las colocaciones compatibles de cada barco se calculan UNA vez por
    // cálculo, no una vez por simulación.
    const restricciones = this.#simulador.prepararRestricciones(conocimiento);

    if (restricciones) {
      for (let i = 0; i < simulaciones; i++) {
        const configuracion = this.#simulador.generarConfiguracion(restricciones);
        if (!configuracion) continue;

        configuracionesValidas++;
        for (const barco of configuracion) {
          for (const { fila, columna } of barco.celdas) {
            conteo[fila][columna]++;
          }
        }
      }
    }

    const tiempoMs = performance.now() - inicio;

    return {
      matriz: this.#construirMatriz(conteo, configuracionesValidas, conocimiento),
      simulaciones,
      configuracionesValidas,
      tiempoMs,
      sinConfiguraciones: configuracionesValidas === 0,
    };
  }

  /**
   * Convierte conteos en probabilidades.
   *  - Celdas ya exploradas -> null 
   *  - Sin configuraciones válidas -> probabilidad uniforme entre las no exploradas
   */
  #construirMatriz(conteo, configuracionesValidas, conocimiento) {
    const exploradas = new Set(conocimiento.celdasExploradas.map(claveCelda));
    const noExploradas = DIMENSION_TABLERO * DIMENSION_TABLERO - exploradas.size;

    return conteo.map((fila, f) =>
      fila.map((cuenta, c) => {
        if (exploradas.has(claveCelda({ fila: f, columna: c }))) return null;
        if (configuracionesValidas === 0) return noExploradas > 0 ? 1 / noExploradas : 0;
        return cuenta / configuracionesValidas;
      })
    );
  }
}