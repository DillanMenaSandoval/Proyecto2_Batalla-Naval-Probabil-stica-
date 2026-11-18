/**
 * GameStatus.jsx
 * Indicador del estado de la partida.
 *
 * Datos que necesita: estado.fase y estado.mensaje (EstadoPartida del contrato).
 *
 * @param {{estado: import("../../services/contratoJuego.js").EstadoPartida}} props
 */

import { ETIQUETA_FASE } from "./etiquetas.js";

export default function GameStatus({ estado }) {
  return (
    <div className="indicador" role="status">
      <p className="indicador__nombre">Estado de la partida</p>
      <p className={`indicador__valor indicador__valor--fase-${estado.fase.toLowerCase()}`}>
        {ETIQUETA_FASE[estado.fase] ?? estado.fase}
      </p>
      <p className="indicador__detalle">{estado.mensaje}</p>
    </div>
  );
}
