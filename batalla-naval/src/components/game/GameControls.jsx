/**
 * GameControls.jsx
 * Botones para iniciar y reiniciar la partida.
 *
 * Datos que necesita: acciones.iniciar y acciones.reiniciar (disponibilidad).
 * Operaciones que expone: onIniciar(), onReiniciar().
 *
 * @param {{
 *   acciones: import("../../services/contratoJuego.js").AccionesDisponibles,
 *   onIniciar: () => void,
 *   onReiniciar: () => void
 * }} props
 */

import Button from "../common/Button.jsx";

export default function GameControls({ acciones, onIniciar, onReiniciar }) {
  const sinAcciones = !acciones.iniciar && !acciones.reiniciar;

  return (
    <div className="controles">
      <div className="controles__botones">
        <Button variante="primario" disabled={!acciones.iniciar} onClick={onIniciar}>
          Iniciar partida
        </Button>
        <Button disabled={!acciones.reiniciar} onClick={onReiniciar}>
          Reiniciar
        </Button>
      </div>
      {sinAcciones && (
        <p className="controles__ayuda">Los controles se activarán cuando se conecte la lógica del juego.</p>
      )}
    </div>
  );
}
