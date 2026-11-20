/**
 * usePartida.js
 * Puente entre React y la lógica del juego
 * Devuelve:
 *   vista         estado listo para pintar 
 *   ultimoEvento  resultado del último disparo
 *   error         mensaje de error de la última acción, o null
 *   acciones      funciones que usan los componentes
 *
 *  Constructor:
 *   const { vista, ultimoEvento, error, acciones } = usePartida();
 */

import { useEffect, useState } from "react";
import Jugador from "../juego/Jugador.js"; 
import Tablero from "../juego/Tablero.js";
import CicloDeJuego, { ESTADO_PARTIDA } from "../juego/CicloDeJuego.js";
import {
  celdasCandidatas as calcularCandidatas,
  colocarFlotaAleatoria,
} from "../juego/Colocacion.js";
import MapaProbabilidades from "../algoritmos/MapaProbabilidades.js";
import Simulador from "../algoritmos/Simulador.js";
import CalcularProbabilidades from "../algoritmos/CalcularProbabilidades.js";
import { SIMULACIONES_POR_DEFECTO, TIPO_JUGADOR } from "../constantes/constantes.js";

const PAUSA_AUTOMATA_MS = 700;

function crearJuego(simulaciones) {
  const humano = new Jugador(TIPO_JUGADOR.HUMANO, new Tablero(), new MapaProbabilidades());
  const automata = new Jugador(TIPO_JUGADOR.AUTOMATA, new Tablero(), new MapaProbabilidades());
  const calculadora = new CalcularProbabilidades(new Simulador());
  const partida = new CicloDeJuego(humano, automata, calculadora, { simulaciones });
  return { humano, automata, partida };
}

/**
 * Copia del estado para guardar en React
 */
function instantanea({ humano, partida }) {
  return {
    ...partida.obtenerEstadoParaUI(), 
    mostrarMapa: partida.mostrarMapaHumano,
    simulaciones: partida.simulaciones, // configuraciones hipotéticas por cálculo
    colocados: humano.tablero.obtenerIdsColocados(), // ids de los barcos ya colocados
    flotaCompleta: humano.tablero.flotaCompleta(),
  };
}

function crearEstado(simulaciones) {
  const juego = crearJuego(simulaciones);
  return { juego, vista: instantanea(juego) };
}

export default function usePartida() {
  const [simulaciones, setSimulaciones] = useState(SIMULACIONES_POR_DEFECTO);
  const [{ juego, vista }, setEstado] = useState(() => crearEstado(simulaciones));
  const [ultimoEvento, setUltimoEvento] = useState(null);
  const [error, setError] = useState(null);

  const { humano, partida } = juego;

  const refrescar = () => setEstado((e) => ({ ...e, vista: instantanea(e.juego) }));

  /** Ejecuta una acción del juego y actualiza la vista. */
  const ejecutar = (accion) => {
    try {
      setError(null);
      accion();
      refrescar();
    } catch (e) {
      setError(e.message);
    }
  };

  // Turno del autómata
  useEffect(() => {
    if (vista.estado !== ESTADO_PARTIDA.EN_CURSO || vista.turno !== TIPO_JUGADOR.AUTOMATA) return;

    const temporizador = setTimeout(() => {
      try {
        setUltimoEvento(partida.jugarTurnoAutomata());
        refrescar();
      } catch (e) {
        setError(e.message);
      }
    }, PAUSA_AUTOMATA_MS);

    return () => clearTimeout(temporizador);
  }, [vista.estado, vista.turno, partida]);

  const acciones = {
    // ── Colocación de la flota del humano ──
    /** Celdas que se pueden elegir */
    celdasCandidatas: (tamaño, seleccionadas) =>
      calcularCandidatas(humano.tablero, tamaño, seleccionadas),
    colocarBarco: (id, celdas) => ejecutar(() => humano.tablero.colocarBarco(id, celdas)),
    quitarBarco: (id) => ejecutar(() => humano.tablero.quitarBarco(id)),
    colocarAlAzar: () => ejecutar(() => colocarFlotaAleatoria(humano.tablero)),

    // ── Partida ──
    iniciar: () => ejecutar(() => partida.iniciarPartida()),
    disparar: (celda) => ejecutar(() => setUltimoEvento(partida.jugarTurnoHumano(celda))),
    alternarMapa: () =>
      ejecutar(() => partida.establecerMostrarMapaHumano(!partida.mostrarMapaHumano)),

    // ── Configuraciones para el cálculo ──
    establecerSimulaciones: (cantidad) =>
      ejecutar(() => {
        partida.establecerSimulaciones(cantidad);
        setSimulaciones(cantidad);
      }),

    // ── Reinicio: se crea todo de nuevo ──
    nuevaPartida: () => {
      setEstado(crearEstado(simulaciones));
      setUltimoEvento(null);
      setError(null);
    },
  };

  return { vista, ultimoEvento, error, acciones };
}