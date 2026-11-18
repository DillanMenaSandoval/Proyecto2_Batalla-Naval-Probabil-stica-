/**
 * useGame.js
 * Conecta los componentes con gameService. No contiene reglas del juego:
 * pide un snapshot, ejecuta acciones y vuelve a pedir el snapshot.
 */

import { useCallback, useState } from "react";
import * as gameService from "../services/gameService.js";

export function useGame() {
  const [snapshot, setSnapshot] = useState(() => gameService.obtenerSnapshot());

  const ejecutar = useCallback((accion, ...args) => {
    const resultado = accion(...args);
    setSnapshot(gameService.obtenerSnapshot());
    return resultado;
  }, []);

  const iniciarPartida = useCallback(() => ejecutar(gameService.iniciarPartida), [ejecutar]);
  const reiniciarPartida = useCallback(() => ejecutar(gameService.reiniciarPartida), [ejecutar]);
  const disparar = useCallback((celda) => ejecutar(gameService.disparar, celda), [ejecutar]);

  return { ...snapshot, iniciarPartida, reiniciarPartida, disparar };
}
