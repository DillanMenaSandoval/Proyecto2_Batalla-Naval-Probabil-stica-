import { porcentaje } from "../utils/Formatos.js"; 

const precision = ({ impactos, disparos }) => (disparos ? porcentaje.format(impactos / disparos) : "–");

/**
 * Dos grupos separados: estadísticas de juego y métricas del algoritmo.
 * @param estadisticas  vista.estadisticas  ({ humano, automata })
 * @param metricas      vista.metricasMapa   (null si el mapa está oculto)
 */
export default function PanelEstadisticas({ estadisticas, metricas }) {
  const { humano, automata } = estadisticas;
  const filas = [
    ["Disparos", humano.disparos, automata.disparos],
    ["Impactos", humano.impactos, automata.impactos],
    ["Agua", humano.disparosAgua, automata.disparosAgua],
    ["Barcos hundidos", humano.barcosHundidos, automata.barcosHundidos],
    ["Precisión", precision(humano), precision(automata)],
  ];

  return (
    <section className="panel">
      <h2 className="panel__titulo">Estadísticas</h2>
      <table className="tabla">
        <thead>
          <tr>
            <th scope="col">
              <span className="solo-lectores">Dato</span>
            </th>
            <th scope="col">Tú</th>
            <th scope="col">Autómata</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(([nombre, tuyo, suyo]) => (
            <tr key={nombre}>
              <th scope="row">{nombre}</th>
              <td>{tuyo}</td>
              <td>{suyo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {metricas && (
        <>
          <h3 className="panel__subtitulo">Algoritmo</h3>
          <dl className="datos">
            <dt>Simulaciones</dt>
            <dd>{metricas.simulaciones ?? "–"}</dd>
            <dt>Configuraciones válidas</dt>
            <dd>{metricas.configuracionesValidas ?? "–"}</dd>
            <dt>Tiempo de cálculo</dt>
            <dd>{metricas.tiempoMs === null ? "–" : `${Math.round(metricas.tiempoMs)} ms`}</dd>
          </dl>
        </>
      )}
    </section>
  );
}
