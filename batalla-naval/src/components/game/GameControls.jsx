/**
 * GameControls.jsx
 * Botones para generar la flota, iniciar y reiniciar la partida. Cada botón se
 * habilita según `acciones`, que decide gameService para la fase actual.
 *
 * Datos que necesita: acciones.generarFlota, acciones.iniciar y acciones.reiniciar
 * (disponibilidad) y, opcionalmente, un mensaje de error de la última acción.
 * Operaciones que expone: onGenerarFlota(), onIniciar(), onReiniciar().
 *
 * @param {{
 *   acciones: import("../../services/contratoJuego.js").AccionesDisponibles,
 *   mensajeError?: string|null,
 *   onGenerarFlota: () => void,
 *   onIniciar: () => void,
 *   onReiniciar: () => void
 * }} props
 */

import Button from "../common/Button.jsx";

export default function GameControls({ acciones, mensajeError = null, onGenerarFlota, onIniciar, onReiniciar }) {
  // Con la flota preparada, el paso siguiente es iniciar: Generar flota pasa a segundo plano.
  const faltaFlota = acciones.generarFlota && !acciones.iniciar;

  return (
    <div className="controles">
      <div className="controles__botones">
        <Button
          variante={acciones.iniciar ? "secundario" : "primario"}
          disabled={!acciones.generarFlota}
          onClick={onGenerarFlota}
        >
          Generar flota
        </Button>
        <Button variante="primario" disabled={!acciones.iniciar} onClick={onIniciar}>
          Iniciar partida
        </Button>
        <Button disabled={!acciones.reiniciar} onClick={onReiniciar}>
          Reiniciar
        </Button>
      </div>
      {mensajeError && (
        <p className="controles__error" role="alert">
          {mensajeError}
        </p>
      )}
      {faltaFlota && <p className="controles__ayuda">Genera una flota para poder iniciar la partida.</p>}
    </div>
  );
}
