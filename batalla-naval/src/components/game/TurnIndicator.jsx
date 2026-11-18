/**
 * TurnIndicator.jsx
 * Muestra de quién es el turno actual.
 *
 * Datos que necesita: estado.turno ("HUMANO" | "AUTOMATA" | null).
 *
 * @param {{turno: "HUMANO"|"AUTOMATA"|null}} props
 */

import { ETIQUETA_JUGADOR } from "./etiquetas.js";

export default function TurnIndicator({ turno }) {
  return (
    <div className={`indicador indicador--turno${turno ? " indicador--turno-activo" : ""}`} role="status">
      <p className="indicador__nombre">Turno actual</p>
      <p className="indicador__valor">{turno ? ETIQUETA_JUGADOR[turno] : "Sin turno"}</p>
      <p className="indicador__detalle">
        {turno ? "Esperando el disparo." : "El turno se asigna al iniciar la partida."}
      </p>
    </div>
  );
}
