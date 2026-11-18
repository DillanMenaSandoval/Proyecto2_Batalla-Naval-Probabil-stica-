/**
 * useGame.js
 * Conecta los componentes con gameService. No contiene reglas del juego:
 * pide un snapshot, ejecuta acciones y vuelve a pedir el snapshot.
 * Si una acción es rechazada, guarda el motivo en `rechazo` (null si todo fue bien).
 */

import { useCallback, useState } from "react";
import * as gameService from "../services/gameService.js";

export function useGame() {
  const [snapshot, setSnapshot] = useState(() => gameService.obtenerSnapshot());
  const [rechazo, setRechazo] = useState(null);

  const ejecutar = useCallback((accion, ...args) => {
    const resultado = accion(...args);
    setSnapshot(gameService.obtenerSnapshot());
    setRechazo(resultado.ok ? null : resultado.motivo);
    return resultado;
  }, []);

  const generarFlota = useCallback(() => ejecutar(gameService.generarFlota), [ejecutar]);
  const iniciarPartida = useCallback(() => ejecutar(gameService.iniciarPartida), [ejecutar]);
  const reiniciarPartida = useCallback(() => ejecutar(gameService.reiniciarPartida), [ejecutar]);
  const disparar = useCallback((celda) => ejecutar(gameService.disparar, celda), [ejecutar]);

  return { ...snapshot, rechazo, generarFlota, iniciarPartida, reiniciarPartida, disparar };
}
