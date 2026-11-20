import { useState } from "react";
import { OPCIONES_SIMULACIONES } from "../constantes/constantes.js"; // ajusta la ruta

/**
 * Elegir cuántas configuraciones hipotéticas de la flota genera el algoritmo en cada cálculo de probabilidades.
 * @param {number} simulaciones  valor actual (vista.simulaciones)
 * @param {(cantidad:number) => void} Elegir
 * @param {() => void} Volver
 */
export default function PantallaSimulacion({ simulaciones, onElegir, onVolver }) {
  const [mensaje, setMensaje] = useState(null);

  const elegir = (cantidad) => {
    onElegir(cantidad);
    setMensaje(`Las probabilidades han cambiado a ×${cantidad}.`);
  };

  return (
    <main className="pantalla pantalla--inicio">
      <h1 className="simulacion__titulo">Simulaciones</h1>

      <div className="opciones" role="group" aria-label="Cantidad de simulaciones">
        {OPCIONES_SIMULACIONES.map((cantidad) => (
          <button
            key={cantidad}
            type="button"
            className="opcion"
            aria-pressed={cantidad === simulaciones}
            onClick={() => elegir(cantidad)}
          >
            ×{cantidad}
          </button>
        ))}
      </div>

      {mensaje && (
        <p className="confirmacion" role="status">
          {mensaje}
        </p>
      )}

      <button type="button" className="boton boton--secundario" onClick={onVolver}>
        Regresar
      </button>
    </main>
  );
}