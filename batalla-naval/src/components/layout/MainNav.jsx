/**
 * MainNav.jsx
 * Pestañas de navegación principal (patrón WAI-ARIA «tabs»).
 * Teclado: flechas izquierda/derecha, Inicio y Fin.
 *
 * @param {{
 *   pestanas: {id:string, etiqueta:string}[],
 *   activa: string,
 *   onCambiar: (id:string) => void
 * }} props
 */

import { useRef } from "react";
import { idPanel, idPestana } from "./idsNavegacion.js";

export default function MainNav({ pestanas, activa, onCambiar }) {
  const botones = useRef({});

  const seleccionar = (indice) => {
    const destino = pestanas[(indice + pestanas.length) % pestanas.length];
    onCambiar(destino.id);
    botones.current[destino.id]?.focus();
  };

  const manejarTeclas = (evento, indice) => {
    const acciones = {
      ArrowRight: () => seleccionar(indice + 1),
      ArrowLeft: () => seleccionar(indice - 1),
      Home: () => seleccionar(0),
      End: () => seleccionar(pestanas.length - 1),
    };
    const accion = acciones[evento.key];
    if (accion) {
      evento.preventDefault();
      accion();
    }
  };

  return (
    <nav aria-label="Secciones de la aplicación">
      <div className="main-nav" role="tablist">
        {pestanas.map((pestana, indice) => {
          const esActiva = pestana.id === activa;
          return (
            <button
              key={pestana.id}
              ref={(nodo) => {
                botones.current[pestana.id] = nodo;
              }}
              id={idPestana(pestana.id)}
              type="button"
              role="tab"
              aria-selected={esActiva}
              aria-controls={idPanel(pestana.id)}
              tabIndex={esActiva ? 0 : -1}
              className={`main-nav__pestana${esActiva ? " main-nav__pestana--activa" : ""}`}
              onClick={() => onCambiar(pestana.id)}
              onKeyDown={(evento) => manejarTeclas(evento, indice)}
            >
              {pestana.etiqueta}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
