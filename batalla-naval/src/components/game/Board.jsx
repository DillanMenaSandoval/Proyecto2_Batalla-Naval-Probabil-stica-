/**
 * Board.jsx
 * Tablero de N × N celdas con regla de coordenadas (A–J arriba, 1–10 a la izquierda).
 *
 * Datos que necesita:
 *  - celdas: matriz del contrato (CeldaPropia[][] o CeldaEnemiga[][]).
 *  - tipo: "propio" | "enemigo" (decide cómo se interpreta cada celda).
 * Operación que expone: onDisparar({fila, columna}), solo en el tablero enemigo.
 *
 * @param {{
 *   titulo: string,
 *   descripcion: string,
 *   tipo: "propio"|"enemigo",
 *   celdas: object[][],
 *   interactivo?: boolean,
 *   onDisparar?: (celda: {fila:number, columna:number}) => void
 * }} props
 */

import { useId } from "react";
import { estadoCeldaEnemiga, estadoCeldaPropia, TEXTO_ESTADO } from "./estadoCelda.js";
import { LETRAS_COLUMNA, nombreCelda } from "./etiquetas.js";

export default function Board({ titulo, descripcion, tipo, celdas, interactivo = false, onDisparar }) {
  const idTitulo = useId();
  const dimension = celdas.length;
  const estadoDe = tipo === "propio" ? estadoCeldaPropia : estadoCeldaEnemiga;

  return (
    <section className={`tablero tablero--${tipo}`} aria-labelledby={idTitulo}>
      <header className="tablero__encabezado">
        <h3 id={idTitulo} className="tablero__titulo">
          {titulo}
        </h3>
        <p className="tablero__descripcion">{descripcion}</p>
      </header>

      <div
        className="tablero__rejilla"
        style={{ "--dimension": dimension }}
        role="group"
        aria-label={`${titulo}, ${dimension} por ${dimension} celdas`}
      >
        <span className="tablero__esquina" aria-hidden="true" />
        {Array.from({ length: dimension }, (_, columna) => (
          <span key={`c${columna}`} className="tablero__regla" aria-hidden="true">
            {LETRAS_COLUMNA[columna]}
          </span>
        ))}

        {celdas.map((fila, indiceFila) => [
          <span key={`f${indiceFila}`} className="tablero__regla" aria-hidden="true">
            {indiceFila + 1}
          </span>,
          ...fila.map((celda, indiceColumna) => {
            const estado = estadoDe(celda);
            const etiqueta = `${nombreCelda(indiceFila, indiceColumna)}, ${TEXTO_ESTADO[estado]}`;
            const clase = `celda celda--${estado}`;

            if (tipo === "propio") {
              return <div key={`${indiceFila}-${indiceColumna}`} className={clase} role="img" aria-label={etiqueta} />;
            }
            return (
              <button
                key={`${indiceFila}-${indiceColumna}`}
                type="button"
                className={clase}
                aria-label={etiqueta}
                disabled={!interactivo || estado !== "libre"}
                onClick={() => onDisparar?.({ fila: indiceFila, columna: indiceColumna })}
              />
            );
          }),
        ])}
      </div>
    </section>
  );
}
