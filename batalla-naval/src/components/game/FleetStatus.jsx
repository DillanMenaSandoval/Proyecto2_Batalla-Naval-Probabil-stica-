/**
 * FleetStatus.jsx
 * Panel con las embarcaciones del jugador, su tamaño y su estado.
 *
 * Datos que necesita: flota (BarcoFlota[] del contrato): id, nombre, tamaño y
 * estado ("SIN_INICIAR" | "EN_JUEGO" | "HUNDIDO"). No consulta la lógica.
 * El estado se indica con texto y con el relleno de los segmentos, no solo con color.
 *
 * @param {{flota: import("../../services/contratoJuego.js").BarcoFlota[]}} props
 */

import { useId } from "react";
import { ETIQUETA_ESTADO_BARCO } from "./etiquetas.js";

export default function FleetStatus({ flota }) {
  const idTitulo = useId();

  return (
    <section className="flota" aria-labelledby={idTitulo}>
      <h3 id={idTitulo} className="flota__titulo">
        Embarcaciones
      </h3>
      <ul className="flota__lista">
        {flota.map(({ id, nombre, tamaño, estado }) => (
          <li key={id} className={`barco barco--${estado.toLowerCase()}`}>
            <p className="barco__nombre">{nombre}</p>
            <p className="barco__tamano">{tamaño} celdas</p>
            <div className="barco__segmentos" aria-hidden="true">
              {Array.from({ length: tamaño }, (_, i) => (
                <span key={i} className="barco__segmento" />
              ))}
            </div>
            <p className="barco__estado">{ETIQUETA_ESTADO_BARCO[estado] ?? estado}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
