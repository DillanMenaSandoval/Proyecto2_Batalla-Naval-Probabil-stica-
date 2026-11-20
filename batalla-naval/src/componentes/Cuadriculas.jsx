import { Fragment } from "react";
import { DIMENSION_TABLERO } from "../constantes/constantes.js";
import "./Cuadricula.css";

const INDICES = Array.from({ length: DIMENSION_TABLERO }, (_, i) => i);
const letra = (columna) => String.fromCharCode(65 + columna);

/** Nombre visible de una celda: columnas A–J, filas 1–10 (la lógica sigue usando índices). */
export const nombreCelda = (fila, columna) => `${letra(columna)}${fila + 1}`;

/**
 * Cuadrícula genérica.
 * devuelve:
 *   { estado, color?, recomendada?, seleccionable?, etiqueta }
 *   - estado: "mar" | "barco" | "agua" | "impacto" | "hundido"
 *   - color: color CSS de fondo para celdas "mar" (mapa de calor)
 *   - seleccionable: si es true, la celda es un botón y reacciona al cursor
 */
export default function Cuadricula({ etiqueta, describirCelda, onSeleccionar = () => {} }) {
  return (
    <div
      className="cuadricula"
      role="group"
      aria-label={etiqueta}
      style={{ "--n": DIMENSION_TABLERO }}
    >
      <span />
      {INDICES.map((c) => (
        <span key={c} className="cuadricula__eje">
          {letra(c)}
        </span>
      ))}

      {INDICES.map((f) => (
        <Fragment key={f}>
          <span className="cuadricula__eje">{f + 1}</span>
          {INDICES.map((c) => {
            const celda = describirCelda(f, c);
            const clases = `celda celda--${celda.estado}${
              celda.recomendada ? " celda--recomendada" : ""
            }`;
            const estilo = celda.color ? { "--color": celda.color } : undefined;

            return celda.seleccionable ? (
              <button
                key={c}
                type="button"
                className={clases}
                style={estilo}
                title={celda.etiqueta}
                aria-label={celda.etiqueta}
                onClick={() => onSeleccionar(f, c)}
              />
            ) : (
              <div
                key={c}
                className={clases}
                style={estilo}
                title={celda.etiqueta}
                role="img"
                aria-label={celda.etiqueta}
              />
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}