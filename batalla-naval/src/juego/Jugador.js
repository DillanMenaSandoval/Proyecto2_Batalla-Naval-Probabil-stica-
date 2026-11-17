/**
 * Jugador.js
 * Representa al participante humano o al agente (autómata).
 *
 * Reglas de diseño (según la propuesta de arquitectura):
 *  - Una sola clase para ambos tipos; `tipo` solo cambia cómo se elige el objetivo.
 *  - Solo conoce su tablero propio y su mapa de probabilidades propio.
 *    NUNCA recibe el tablero del oponente.
 *  - Solo acumula conocimiento parcial: lo que los disparos le han revelado.
 *
 * Formato de celda:      { fila, columna }
 * Formato de resultado (lo que devuelve Tablero.recibirDisparo):
 *                        { impacto: boolean, idBarco: string|null, hundido: boolean }
 * (Si decides otro formato, solo hay que ajustar registrarResultado.)
 */

export const TIPO_JUGADOR = Object.freeze({
  HUMANO: "HUMANO",
  AUTOMATA: "AUTOMATA",
});

export default class Jugador {
  // Campos privados: los componentes de React no pueden modificarlos directamente.
  #tipo;
  #tablero;
  #mapaProbabilidades;
  #disparos = 0;
  #impactos = 0;
  #disparosAgua = 0;
  #celdasExploradas = [];
  #barcosObjetivoDestruidos = [];

  /**
   * @param {"HUMANO"|"AUTOMATA"} tipo
   * @param {Tablero} tablero  Tablero PROPIO (nunca el del oponente).
   * @param {MapaProbabilidades|null} mapaProbabilidades  Mapa propio; puede asignarse después.
   */
  constructor(tipo, tablero, mapaProbabilidades = null) {
    if (!Object.values(TIPO_JUGADOR).includes(tipo)) {
      throw new Error(`Tipo de jugador inválido: "${tipo}". Use HUMANO o AUTOMATA.`);
    }
    if (!tablero) {
      throw new Error("Jugador requiere un tablero propio.");
    }
    this.#tipo = tipo;
    this.#tablero = tablero;
    this.#mapaProbabilidades = mapaProbabilidades;
  }

  // ───────────── Acceso a objetos propios ─────────────

  get tipo() {
    return this.#tipo;
  }

  get esAutomata() {
    return this.#tipo === TIPO_JUGADOR.AUTOMATA;
  }

  get tablero() {
    return this.#tablero;
  }

  get mapaProbabilidades() {
    return this.#mapaProbabilidades;
  }

  set mapaProbabilidades(mapa) {
    this.#mapaProbabilidades = mapa;
  }

  // ───────────── 1. Selección del objetivo ─────────────

  /**
   * Elige la celda a atacar. NO resuelve el ataque: eso lo hace CicloDeJuego.
   *  - HUMANO: devuelve la celda que eligió en la interfaz (obligatoria).
   *  - AUTOMATA: devuelve la mejor celda según su mapa de probabilidades.
   */
  seleccionarObjetivo(celdaElegida = null) {
    let celda;

    if (this.#tipo === TIPO_JUGADOR.HUMANO) {
      if (!celdaElegida) {
        throw new Error("El jugador humano debe indicar la celda a atacar.");
      }
      celda = celdaElegida;
    } else {
      if (!this.#mapaProbabilidades) {
        throw new Error("El autómata necesita un mapa de probabilidades.");
      }
      celda = this.#mapaProbabilidades.obtenerMejorObjetivo();
      if (!celda) {
        throw new Error("El mapa de probabilidades no recomendó ningún objetivo.");
      }
    }

    this.#validarCelda(celda);
    if (this.yaExploro(celda)) {
      throw new Error(`La celda (${celda.fila}, ${celda.columna}) ya fue atacada.`);
    }
    return { fila: celda.fila, columna: celda.columna };
  }

  // ───────────── 5. Registro del resultado ─────────────

  /**
   * Guarda lo que reveló un disparo propio y actualiza las métricas.
   * @param {{fila:number, columna:number}} celda
   * @param {{impacto:boolean, idBarco:string|null, hundido:boolean}} resultado
   */
  registrarResultado(celda, resultado) {
    this.#validarCelda(celda);
    if (!resultado || typeof resultado.impacto !== "boolean") {
      throw new Error("Resultado de ataque inválido.");
    }
    if (this.yaExploro(celda)) {
      throw new Error(`La celda (${celda.fila}, ${celda.columna}) ya estaba registrada.`);
    }

    const idBarco = resultado.idBarco ?? null;
    const hundido = Boolean(resultado.hundido);

    this.#celdasExploradas.push({
      fila: celda.fila,
      columna: celda.columna,
      resultado: resultado.impacto ? "IMPACTO" : "AGUA",
      idBarco,
      hundido,
    });

    this.#disparos++;
    if (resultado.impacto) {
      this.#impactos++;
    } else {
      this.#disparosAgua++;
    }

    // Un barco hundido deja de ser objetivo pendiente, pero sus celdas de
    // impacto siguen en celdasExploradas: son conocimiento válido.
    if (hundido && idBarco !== null && !this.#barcosObjetivoDestruidos.includes(idBarco)) {
      this.#barcosObjetivoDestruidos.push(idBarco);
    }
  }

  // ───────────── Consultas ─────────────

  yaExploro(celda) {
    return this.#celdasExploradas.some(
      (c) => c.fila === celda.fila && c.columna === celda.columna
    );
  }

  /**
   * Conocimiento parcial del jugador. Es lo ÚNICO que debe recibir
   * CalcularProbabilidades / Simulador. Devuelve copias, no las estructuras internas.
   */
  obtenerConocimiento() {
    return {
      celdasExploradas: this.#celdasExploradas.map((c) => ({ ...c })),
      barcosHundidos: [...this.#barcosObjetivoDestruidos],
    };
  }

  obtenerEstadisticas() {
    return {
      disparos: this.#disparos,
      impactos: this.#impactos,
      disparosAgua: this.#disparosAgua,
      barcosHundidos: this.#barcosObjetivoDestruidos.length,
    };
  }

  /** Devuelve el mapa propio para que CicloDeJuego lo actualice o la UI lo dibuje. */
  solicitarMapaProbabilidades() {
    if (!this.#mapaProbabilidades) {
      throw new Error("Este jugador aún no tiene un mapa de probabilidades.");
    }
    return this.#mapaProbabilidades;
  }

  // ───────────── Internos ─────────────

  #validarCelda(celda) {
    if (
      !celda ||
      !Number.isInteger(celda.fila) ||
      !Number.isInteger(celda.columna)
    ) {
      throw new Error("Celda inválida: se espera { fila, columna } con enteros.");
    }
  }
}