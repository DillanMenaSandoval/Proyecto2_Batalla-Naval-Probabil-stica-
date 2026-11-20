/**
 * CicloDeJuego.js
 * Coordina la partida entre el jugador humano y el autómata:
 *  - controla el estado y el turno,
 *  - enruta cada disparo al tablero del defensor,
 *  - pide al atacante que registre lo que descubrió,
 *  - reestima el mapa de probabilidades con el conocimiento del atacante,
 *  - comprueba la condición de victoria.
 *
 * Los Jugador solo conocen su tablero propio
 * El ciclo es el único que conecta atacante y tablero defensor
 * Flujo de un disparo
 * Flujo de uso
 *   partida.iniciarPartida();
 *   partida.jugarTurnoHumano(celda);
 *   partida.jugarTurnoAutomata();
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
  #turno = null; // Jugador al que le toca
  #ganador = null; // Jugador ganador

  /**
   * @param {Jugador} jugadorHumano
   * @param {Jugador} jugadorAutomata
   * @param {CalcularProbabilidades} calculadora
   * @param {{simulaciones?: number, mostrarMapaHumano?: boolean, primerTurno?: string}} opciones
   *   - simulaciones: configuraciones por cálculo 
   *   - Tipo de turno: TIPO_JUGADOR.HUMANO o TIPO_JUGADOR.AUTOMATA.
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

  /** Tipo del jugador al que le toca */
  get turno() {
    return this.#turno ? this.#turno.tipo : null;
  }

  /** Tipo del ganador*/
  get ganador() {
    return this.#ganador ? this.#ganador.tipo : null;
  }

  get mostrarMapaHumano() {
    return this.#mostrarMapaHumano;
  }

  /** Cantidad de configuraciones hipotéticas que se generan en cada cálculo. */
  get simulaciones() {
    return this.#simulaciones;
  }

  /** Cambia la cantidad de simulaciones; se aplica desde el siguiente cálculo. */
  establecerSimulaciones(cantidad) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error("La cantidad de simulaciones debe ser un entero positivo.");
    }
    this.#simulaciones = cantidad;
  }

  // ───────────── Inicio de la partida ─────────────

  /**
   * El humano debe haber colocado ya su flota
   * El autómata se coloca al azar
   * También calcula los mapas iniciales.
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

    this.#reestimar(this.#automata);
    if (this.#mostrarMapaHumano) this.#reestimar(this.#humano);
  }

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

  /** Turno del humano */
  jugarTurnoHumano(celda) {
    this.#exigirTurno(this.#humano);
    const objetivo = this.#humano.seleccionarObjetivo(celda); // valida y evita repetidos
    return this.ejecutarDisparo(this.#humano, objetivo);
  }

  /** El autómata elige la celda recomendada */
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

    // Victoria si este disparo hundió el ultimo barco
    const finalizada = resultado.hundido && this.verificarFinPartida(defensor);

    if (finalizada) {
      this.#estado = ESTADO_PARTIDA.FINALIZADA;
      this.#ganador = atacante;
      this.#turno = null;
    } else {
      // Reestimación
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

  /** Recalcula el mapa del jugador */
  #reestimar(jugador) {
    const calculo = this.#calculadora.calcular(jugador.obtenerConocimiento(), this.#simulaciones);
    jugador.solicitarMapaProbabilidades().actualizar(calculo);
  }
}