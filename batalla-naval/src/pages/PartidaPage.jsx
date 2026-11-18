/**
 * PartidaPage.jsx
 * Pestaña «Partida»: estado, turno, controles y los dos tableros.
 * Solo compone componentes; todos los datos y acciones vienen de useGame.
 */

import Board from "../components/game/Board.jsx";
import GameControls from "../components/game/GameControls.jsx";
import GameHeader from "../components/game/GameHeader.jsx";
import GameStatus from "../components/game/GameStatus.jsx";
import TurnIndicator from "../components/game/TurnIndicator.jsx";
import { useGame } from "../hooks/useGame.js";

export default function PartidaPage() {
  const { estado, acciones, tableroPropio, tableroEnemigo, iniciarPartida, reiniciarPartida, disparar } = useGame();

  return (
    <div className="partida">
      <GameHeader />

      <div className="partida__panel">
        <GameStatus estado={estado} />
        <TurnIndicator turno={estado.turno} />
        <GameControls acciones={acciones} onIniciar={iniciarPartida} onReiniciar={reiniciarPartida} />
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
          descripcion="Elige una celda para disparar."
          tipo="enemigo"
          celdas={tableroEnemigo}
          interactivo={acciones.disparar}
          onDisparar={disparar}
        />
      </div>
    </div>
  );
}
