/**
 * CicloDeJuego.js
 * Coordina la partida entre el jugador humano y el autómata:
 *  - controla el estado y el turno,
 *  - enruta cada disparo al tablero del defensor,
 *  - pide al atacante que registre lo que descubrió,
 *  - reestima el mapa de probabilidades con el conocimiento del atacante,
 *  - comprueba la condición de victoria.
 *
 * Los Jugador solo conocen su tablero propio; 
 * El ciclo es el único que conecta atacante y tablero defensor
 *
 * Flujo de un disparo:
 *   1. el tablero defensor resuelve el disparo y responde de forma limitada
 *   2. el atacante registra el resultado
 *   3. si se hundió un barco, se comprueba si el defensor perdió
 *   4. si la partida sigue, se reestima el mapa del atacante y cambia el turno
 *
 */

import { TIPO_JUGADOR } from "../constantes/constantes.js"; 
import { colocarFlotaAleatoria } from "./Colocacion.js";

export const ESTADO_PARTIDA = Object.freeze({
  PREPARACION: "PREPARACION",
  EN_CURSO: "EN_CURSO",
  FINALIZADA: "FINALIZADA",
});

export default class CicloDeJuego {
  #humano;
  #automata;
  #calculadora;
  #simulaciones;
  #primerTurno;
  #mostrarMapaHumano;

  #estado = ESTADO_PARTIDA.PREPARACION;
  #turno = null; // Jugador al que le toca, o null si no hay partida en curso
  #ganador = null; // Jugador ganador, o null

  /**
   * @param {Jugador} jugadorHumano
   * @param {Jugador} jugadorAutomata
   * @param {CalcularProbabilidades} calculadora
   * @param {{simulaciones?: number, mostrarMapaHumano?: boolean, primerTurno?: string}} opciones
   *   - simulaciones: configuraciones por cálculo (valor por defecto provisional; es un
   *     parámetro experimental que varía en el análisis)
   *   - mostrarMapaHumano: si es true, también se calcula el mapa del humano.
   *   - primerTurno: TIPO_JUGADOR.HUMANO o TIPO_JUGADOR.AUTOMATA.
   */
  constructor(
    jugadorHumano,
    jugadorAutomata,
    calculadora,
    {
      simulaciones = 1000,
      mostrarMapaHumano = true,
      primerTurno = TIPO_JUGADOR.HUMANO,
    } = {}
  ) {
    if (jugadorHumano?.tipo !== TIPO_JUGADOR.HUMANO) {
      throw new Error("El primer jugador debe ser de tipo HUMANO.");
    }
    if (jugadorAutomata?.tipo !== TIPO_JUGADOR.AUTOMATA) {
      throw new Error("El segundo jugador debe ser de tipo AUTOMATA.");
    }
    if (!calculadora) {
      throw new Error("CicloDeJuego requiere una calculadora de probabilidades.");
    }
    if (!Object.values(TIPO_JUGADOR).includes(primerTurno)) {
      throw new Error(`Primer turno inválido: "${primerTurno}".`);
    }
    if (!jugadorAutomata.mapaProbabilidades) {
      throw new Error("El autómata necesita un MapaProbabilidades.");
    }
    if (mostrarMapaHumano && !jugadorHumano.mapaProbabilidades) {
      throw new Error("Para mostrar el mapa del humano, este necesita un MapaProbabilidades.");
    }

    this.#humano = jugadorHumano;
    this.#automata = jugadorAutomata;
    this.#calculadora = calculadora;
    this.#simulaciones = simulaciones;
    this.#primerTurno = primerTurno;
    this.#mostrarMapaHumano = mostrarMapaHumano;
  }

  // ───────────── Estado ─────────────

  get estado() {
    return this.#estado;
  }

  /** Tipo del jugador al que le toca ("HUMANO" o "AUTOMATA"), o null. */
  get turno() {
    return this.#turno ? this.#turno.tipo : null;
  }

  /** Tipo del ganador, o null si la partida no ha terminado. */
  get ganador() {
    return this.#ganador ? this.#ganador.tipo : null;
  }

  get mostrarMapaHumano() {
    return this.#mostrarMapaHumano;
  }

  // ───────────── Inicio de la partida ─────────────

  /**
   * Arranca la partida. El humano debe haber colocado ya su flota.
   * El autómata coloca al azar.
   * También calcula los mapas iniciales (con conocimiento vacío).
   */
  iniciarPartida() {
    if (this.#estado !== ESTADO_PARTIDA.PREPARACION) {
      throw new Error("La partida ya fue iniciada.");
    }
    if (!this.#humano.tablero.flotaCompleta()) {
      throw new Error("El jugador humano aún no colocó toda su flota.");
    }
    if (!this.#automata.tablero.flotaCompleta()) {
      colocarFlotaAleatoria(this.#automata.tablero);
    }

    this.#estado = ESTADO_PARTIDA.EN_CURSO;
    this.#turno = this.#primerTurno === TIPO_JUGADOR.HUMANO ? this.#humano : this.#automata;

    // Sin mapa inicial, el autómata no tendría objetivo en su primer turno.
    this.#reestimar(this.#automata);
    if (this.#mostrarMapaHumano) this.#reestimar(this.#humano);
  }

  /**
   * Activa o desactiva el mapa del humano.
   * Solo se recalcula en los turnos del humano mientras esté activo.
   */
  establecerMostrarMapaHumano(mostrar) {
    if (mostrar && !this.#humano.mapaProbabilidades) {
      throw new Error("El jugador humano no tiene un MapaProbabilidades.");
    }
    this.#mostrarMapaHumano = Boolean(mostrar);
    if (this.#mostrarMapaHumano && this.#estado === ESTADO_PARTIDA.EN_CURSO) {
      this.#reestimar(this.#humano); // se muestra con el conocimiento actual
    }
  }

  // ───────────── Turnos ─────────────

  /** Turno del humano: la interfaz entrega la celda elegida. */
  jugarTurnoHumano(celda) {
    this.#exigirTurno(this.#humano);
    const objetivo = this.#humano.seleccionarObjetivo(celda); // valida y evita repetidos
    return this.ejecutarDisparo(this.#humano, objetivo);
  }

  /** Turno del autómata: elige la celda recomendada por su mapa. */
  jugarTurnoAutomata() {
    this.#exigirTurno(this.#automata);
    const objetivo = this.#automata.seleccionarObjetivo();
    return this.ejecutarDisparo(this.#automata, objetivo);
  }

  /**
   * Resuelve un disparo.
   * @returns {{atacante:string, celda:{fila:number, columna:number},
   *            resultado:{impacto:boolean, idBarco:string|null, hundido:boolean},
   *            finalizada:boolean, ganador:string|null}}
   */
  ejecutarDisparo(atacante, celda) {
    this.#exigirTurno(atacante);
    const defensor = atacante === this.#humano ? this.#automata : this.#humano;
    const resultado = defensor.tablero.recibirDisparo(celda);
    atacante.registrarResultado(celda, resultado);
    const finalizada = resultado.hundido && this.verificarFinPartida(defensor);

    if (finalizada) {
      this.#estado = ESTADO_PARTIDA.FINALIZADA;
      this.#ganador = atacante;
      this.#turno = null;
    } else {
      // Reestimación con el conocimiento del atacante y cambio de turno
      if (atacante === this.#automata || this.#mostrarMapaHumano) {
        this.#reestimar(atacante);
      }
      this.#turno = defensor;
    }

    return {
      atacante: atacante.tipo,
      celda: { fila: celda.fila, columna: celda.columna },
      resultado,
      finalizada,
      ganador: finalizada ? atacante.tipo : null,
    };
  }
  verificarFinPartida(defensor) {
    return defensor.tablero.todosLosBarcosHundidos();
  }

  // ───────────── Datos para la interfaz ─────────────

  /**
   * Copia del estado lista para guardar en el estado de React.
   * Solo contiene datos del humano.
   * nunca incluye el tablero del autómata ni su mapa de probabilidades.
   */
  obtenerEstadoParaUI() {
    const mapa = this.#mostrarMapaHumano ? this.#humano.mapaProbabilidades : null;

    return {
      estado: this.#estado,
      turno: this.turno,
      ganador: this.ganador,
      miTablero: this.#humano.tablero.obtenerVistaPropia(), // disparos recibidos
      tableroEnemigo: this.#humano.obtenerConocimiento(), // disparos propios
      mapaProbabilidades: mapa?.obtenerMatriz() ?? null,
      objetivoRecomendado: mapa?.obtenerMejorObjetivo() ?? null,
      metricasMapa: mapa?.obtenerMetricas() ?? null,
      estadisticas: {
        humano: this.#humano.obtenerEstadisticas(),
        automata: this.#automata.obtenerEstadisticas(),
      },
    };
  }

  // ───────────── Internos ─────────────

  #exigirTurno(jugador) {
    if (this.#estado !== ESTADO_PARTIDA.EN_CURSO) {
      throw new Error("La partida no está en curso.");
    }
    if (jugador !== this.#turno) {
      throw new Error("No es el turno de este jugador.");
    }
  }

  /** Recalcula el mapa del jugador*/
  #reestimar(jugador) {
    const calculo = this.#calculadora.calcular(jugador.obtenerConocimiento(), this.#simulaciones);
    jugador.solicitarMapaProbabilidades().actualizar(calculo);
  }
}