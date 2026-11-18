/**
 * PartidaPage.jsx
 * Pestaña «Partida»: estado, turno, controles y los dos tableros.
 * Solo compone componentes; todos los datos y acciones vienen de useGame.
 */

import Board from "../components/game/Board.jsx";
import FleetStatus from "../components/game/FleetStatus.jsx";
import GameControls from "../components/game/GameControls.jsx";
import GameHeader from "../components/game/GameHeader.jsx";
import GameStatus from "../components/game/GameStatus.jsx";
import TurnIndicator from "../components/game/TurnIndicator.jsx";
import { MENSAJE_RECHAZO } from "../components/game/etiquetas.js";
import { useGame } from "../hooks/useGame.js";

export default function PartidaPage() {
  const {
    estado,
    acciones,
    tableroPropio,
    tableroEnemigo,
    flota,
    rechazo,
    generarFlota,
    iniciarPartida,
    reiniciarPartida,
    disparar,
  } = useGame();

  return (
    <div className="partida">
      <GameHeader />

      <div className="partida__panel">
        <GameStatus estado={estado} />
        <TurnIndicator turno={estado.turno} />
        <GameControls
          acciones={acciones}
          mensajeError={rechazo ? (MENSAJE_RECHAZO[rechazo] ?? "No se pudo completar la acción.") : null}
          onGenerarFlota={generarFlota}
          onIniciar={iniciarPartida}
          onReiniciar={reiniciarPartida}
        />
      </div>

      <div className="partida__tableros">
        <Board
          titulo="Tu flota"
          descripcion="Tus barcos y los disparos que recibes."
          tipo="propio"
          celdas={tableroPropio}
        />
        <Board
          titulo="Aguas enemigas"
          descripcion="Las posiciones enemigas permanecen ocultas."
          tipo="enemigo"
          celdas={tableroEnemigo}
          interactivo={acciones.disparar}
          onDisparar={disparar}
        />
      </div>

      <FleetStatus flota={flota} />
    </div>
  );
}
