import { useMemo } from "react";
import Cuadricula, { nombreCelda } from "./Cuadriculas.jsx";
import { colorProbabilidad, GRADIENTE_MAPA } from "../utils/ColorMapa.js"; // ajusta la ruta
import { RESULTADO_CELDA } from "../constantes/constantes.js"; // ajusta la ruta

const porcentaje = new Intl.NumberFormat("es", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Tablero donde el humano dispara. 
 * este componente nunca toca objetos del juego.
 *
 * @param {{celdasExploradas: object[], barcosHundidos: string[]}} conocimiento  estado.tableroEnemigo
 * @param {(number|null)[][]|null} mapa      estado.mapaProbabilidades (null si está oculto)
 * @param {{fila:number, columna:number}|null} objetivo  estado.objetivoRecomendado
 * @param {boolean} puedeDisparar  true solo en el turno del humano con la partida en curso
 * @param {(celda:{fila:number, columna:number}) => void} onDisparar
 */
export default function TableroEnemigo({ conocimiento, mapa, objetivo, puedeDisparar, onDisparar }) {
  const { exploradas, hundidos } = useMemo(
    () => ({
      exploradas: new Map(conocimiento.celdasExploradas.map((c) => [`${c.fila},${c.columna}`, c])),
      hundidos: new Set(conocimiento.barcosHundidos),
    }),
    [conocimiento]
  );

  // La escala de color es relativa a la probabilidad máxima del mapa
  const maximo = useMemo(
    () => (mapa ? Math.max(0, ...mapa.flat().filter((p) => p !== null)) : 0),
    [mapa]
  );

  const describirCelda = (fila, columna) => {
    const nombre = nombreCelda(fila, columna);
    const explorada = exploradas.get(`${fila},${columna}`);

    if (explorada) {
      if (explorada.resultado === RESULTADO_CELDA.AGUA) {
        return { estado: "agua", etiqueta: `${nombre}: agua` };
      }
      const hundido = hundidos.has(explorada.idBarco);
      return {
        estado: hundido ? "hundido" : "impacto",
        etiqueta: `${nombre}: ${hundido ? "barco hundido" : "impacto"}`,
      };
    }

    const p = mapa?.[fila][columna] ?? null;
    return {
      estado: "mar",
      color: p === null ? undefined : colorProbabilidad(p, maximo),
      recomendada: objetivo?.fila === fila && objetivo?.columna === columna,
      seleccionable: puedeDisparar,
      etiqueta: p === null ? nombre : `${nombre}: ${porcentaje.format(p)}`,
    };
  };

  return (
    <section className="tablero">
      <h2 className="tablero__titulo">Tablero enemigo</h2>
      <Cuadricula
        etiqueta="Tablero enemigo"
        describirCelda={describirCelda}
        onSeleccionar={(fila, columna) => onDisparar({ fila, columna })}
      />
      {mapa && (
        <div className="leyenda">
          <span>Menos probable</span>
          <div className="leyenda__barra" style={{ background: GRADIENTE_MAPA }} />
          <span>Más probable: {porcentaje.format(maximo)}</span>
        </div>
      )}
    </section>
  );
}