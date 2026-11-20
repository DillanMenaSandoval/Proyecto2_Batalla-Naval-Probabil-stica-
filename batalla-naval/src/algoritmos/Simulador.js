/**
 * Simulador.js
 * Genera configuraciones hipotéticas de la flota enemiga.
 *   1. prepararRestricciones.
 *      Para cada barco filtra sus colocaciones posibles según lo conocido.
 *
 *   2. generarConfiguracion.
 *      Coloca los barcos uno por uno, al azar, entre sus colocaciones
 *      compatibles que no choquen con los ya colocados.
 *
 * REQUISITO: todo impacto debe traer idBarco.
 */

import { DIMENSION_TABLERO, FLOTA, RESULTADO_CELDA } from "../constantes/constantes.js"; 
import { todasLasColocaciones } from "../utils/Geometria.js"; 

export default class Simulador {
  #flota;
  #dimension;

  /**
   * @param {{flota?: {id:string, tamaño:number}[], dimension?: number}} opciones
   * Una sola instancia puede compartirse entre jugadores
   */
  constructor({ flota = FLOTA, dimension = DIMENSION_TABLERO } = {}) {
    this.#flota = flota;
    this.#dimension = dimension;
  }

  /**
   * Calcula, para cada barco, las colocaciones compatibles con lo conocido.
   * @param {{celdasExploradas: object[], barcosHundidos: string[]}} conocimiento
   * @returns {{barcos: {id:string, opciones:{celdas:object[], indices:number[]}[]}[]} | null}
   *   null si el conocimiento es contradictorio (algún barco no tiene dónde ir).
   */
  prepararRestricciones(conocimiento) {
    const { agua, golpes, golpesPorBarco } = this.#interpretar(conocimiento);
    const hundidos = new Set(conocimiento.barcosHundidos);
    const barcos = [];

    for (const { id, tamaño } of this.#flota) {
      const propios = golpesPorBarco.get(id) ?? [];
      let opciones;

      if (hundidos.has(id)) {
        if (propios.length !== tamaño) return null;
        opciones = [this.#crearOpcion(propios.map((i) => this.#aCelda(i)))];
      } else {
        opciones = todasLasColocaciones(tamaño, this.#dimension)
          .map((celdas) => this.#crearOpcion(celdas))
          .filter(
            ({ indices }) =>
              // sin agua, y sin impactos que pertenezcan a otro barco
              indices.every((i) => !agua.has(i) && (!golpes.has(i) || golpes.get(i) === id)) &&
              // debe cubrir todos los impactos ya conocidos de este barco
              propios.every((i) => indices.includes(i))
          );
      }

      if (opciones.length === 0) return null;
      barcos.push({ id, opciones });
    }

    // Los barcos más restringidos primero
    barcos.sort((a, b) => a.opciones.length - b.opciones.length);
    return { barcos };
  }

  /**
   * Intenta generar una flota completa sin superposiciones.
   * @returns {{id:string, celdas:{fila:number, columna:number}[]}[] | null}
   *   null si algún barco se quedó sin colocaciones libres (muestra descartada).
   *   Las celdas devueltas se comparten entre simulaciones: no deben modificarse.
   */
  generarConfiguracion(restricciones) {
    const ocupadas = new Uint8Array(this.#dimension * this.#dimension);
    const configuracion = [];

    for (const { id, opciones } of restricciones.barcos) {
      // Elección uniforme entre las opciones libres
      let elegida = null;
      let libres = 0;
      for (const opcion of opciones) {
        if (opcion.indices.some((i) => ocupadas[i] === 1)) continue;
        libres++;
        if (Math.random() * libres < 1) elegida = opcion;
      }

      if (elegida === null) return null;

      elegida.indices.forEach((i) => {
        ocupadas[i] = 1;
      });
      configuracion.push({ id, celdas: elegida.celdas });
    }

    return configuracion;
  }

  // ───────────── Internos ─────────────

  /** Convierte las celdas exploradas en estructuras de consulta rápida. */
  #interpretar(conocimiento) {
    const agua = new Set(); // índices de celdas con agua
    const golpes = new Map(); // índice -> id del barco impactado
    const golpesPorBarco = new Map(); // id -> índices impactados

    for (const c of conocimiento.celdasExploradas) {
      const indice = c.fila * this.#dimension + c.columna;

      if (c.resultado === RESULTADO_CELDA.AGUA) {
        agua.add(indice);
        continue;
      }
      if (c.idBarco == null) {
        throw new Error(
          `Impacto en (${c.fila}, ${c.columna}) sin idBarco: el Simulador necesita saber a qué barco pertenece.`
        );
      }
      if (!this.#flota.some((b) => b.id === c.idBarco)) {
        throw new Error(`Barco desconocido en el conocimiento: "${c.idBarco}".`);
      }

      golpes.set(indice, c.idBarco);
      if (!golpesPorBarco.has(c.idBarco)) golpesPorBarco.set(c.idBarco, []);
      golpesPorBarco.get(c.idBarco).push(indice);
    }

    return { agua, golpes, golpesPorBarco };
  }

  #crearOpcion(celdas) {
    return {
      celdas,
      indices: celdas.map((c) => c.fila * this.#dimension + c.columna),
    };
  }

  #aCelda(indice) {
    return { fila: Math.floor(indice / this.#dimension), columna: indice % this.#dimension };
  }
}