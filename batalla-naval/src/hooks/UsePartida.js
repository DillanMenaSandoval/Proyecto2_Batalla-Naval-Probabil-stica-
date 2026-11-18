/**
 * usePartida.js
 * Puente entre React y la lógica del juego. Es el ÚNICO lugar de la interfaz
 * que tiene acceso a los objetos Jugador, Tablero y CicloDeJuego. Los
 * componentes reciben solo datos (copias) y llaman a acciones.
 *
 * Devuelve:
 *   vista         estado listo para pintar (ver instantanea)
 *   ultimoEvento  resultado del último disparo, de cualquiera de los dos jugadores
 *   error         mensaje de error de la última acción, o null
 *   acciones      funciones que usan los componentes
 *
 * Uso:
 *   const { vista, ultimoEvento, error, acciones } = usePartida();
 */

import { useEffect, useState } from "react";
import Jugador from "../juego/Jugador.js"; // ajusta las rutas
import Tablero from "../juego/Tablero.js";
import CicloDeJuego, { ESTADO_PARTIDA } from "../juego/CicloDeJuego.js";
import {
  celdasCandidatas as calcularCandidatas,
  colocarFlotaAleatoria,
} from "../juego/Colocacion.js";
import MapaProbabilidades from "../algoritmos/MapaProbabilidades.js";
import Simulador from "../algoritmos/Simulador.js";
import CalcularProbabilidades from "../algoritmos/CalcularProbabilidades.js";
import { TIPO_JUGADOR } from "../constantes/constantes.js";

const SIMULACIONES = 1000; // valor provisional: es el parámetro experimental del algoritmo
const PAUSA_AUTOMATA_MS = 700; // para que se vea el disparo del humano antes de la respuesta

function crearJuego() {
  const humano = new Jugador(TIPO_JUGADOR.HUMANO, new Tablero(), new MapaProbabilidades());
  const automata = new Jugador(TIPO_JUGADOR.AUTOMATA, new Tablero(), new MapaProbabilidades());
  const calculadora = new CalcularProbabilidades(new Simulador());
  const partida = new CicloDeJuego(humano, automata, calculadora, { simulaciones: SIMULACIONES });
  return { humano, automata, partida };
}

/**
 * Copia del estado para guardar en React. Todo son datos planos: sin objetos
 * del juego, y sin nada del tablero ni del mapa del autómata.
 */
function instantanea({ humano, partida }) {
  return {
    ...partida.obtenerEstadoParaUI(), // estado, turno, ganador, miTablero, tableroEnemigo,
    //                                   mapaProbabilidades, objetivoRecomendado, metricasMapa, estadisticas
    mostrarMapa: partida.mostrarMapaHumano,
    colocados: humano.tablero.obtenerIdsColocados(), // ids de los barcos ya colocados
    flotaCompleta: humano.tablero.flotaCompleta(),
  };
}

function crearEstado() {
  const juego = crearJuego();
  return { juego, vista: instantanea(juego) };
}

export default function usePartida() {
  const [{ juego, vista }, setEstado] = useState(crearEstado);
  const [ultimoEvento, setUltimoEvento] = useState(null);
  const [error, setError] = useState(null);

  const { humano, partida } = juego;

  const refrescar = () => setEstado((e) => ({ ...e, vista: instantanea(e.juego) }));

  /** Ejecuta una acción del juego, captura errores y actualiza la vista. */
  const ejecutar = (accion) => {
    try {
      setError(null);
      accion();
      refrescar();
    } catch (e) {
      setError(e.message);
    }
  };

  // Turno del autómata: se programa cuando le toca y se cancela si cambia la partida
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
    /** Celdas que se pueden elegir a continuación (devuelve datos, no objetos). */
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

    // ── Reinicio: un CicloDeJuego no se reutiliza, se crea todo de nuevo ──
    nuevaPartida: () => {
      setEstado(crearEstado());
      setUltimoEvento(null);
      setError(null);
    },
  };

  return { vista, ultimoEvento, error, acciones };
}