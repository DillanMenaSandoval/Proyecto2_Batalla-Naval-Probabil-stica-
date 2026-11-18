import TableroPropio from "../componentes/TableroPropio.jsx"; // ajusta las rutas
import TableroEnemigo from "../componentes/TableroEnemigo.jsx";
import PanelSugerencias from "../componentes/PanelSugerencias.jsx";
import PanelEstadisticas from "../componentes/PanelEstadisticas.jsx";
import { ESTADO_PARTIDA } from "../juego/CicloDeJuego.js";
import { TIPO_JUGADOR } from "../constantes/constantes.js";

/** Pantalla de juego */
export default function PantallaPartida({ vista, ultimoEvento, error, acciones }) {
  const finalizada = vista.estado === ESTADO_PARTIDA.FINALIZADA;
  const turnoHumano = vista.estado === ESTADO_PARTIDA.EN_CURSO && vista.turno === TIPO_JUGADOR.HUMANO;

  let mensaje;
  if (finalizada) {
    mensaje =
      vista.ganador === TIPO_JUGADOR.HUMANO
        ? "Ganaste: hundiste toda la flota enemiga."
        : "Perdiste: el autómata hundió toda tu flota.";
  } else {
    mensaje = turnoHumano
      ? "Tu turno: elige una celda del tablero enemigo."
      : "El autómata está calculando su disparo…";
  }

  return (
    <main className="pantalla">
      <header className="barra">
        <h1 className="barra__titulo">Batalla naval probabilística</h1>
        <p className={`barra__estado${finalizada ? " barra__estado--final" : ""}`} aria-live="polite">
          {mensaje}
        </p>
        {finalizada && (
          <button type="button" className="boton" onClick={acciones.nuevaPartida}>
            Jugar de nuevo
          </button>
        )}
      </header>

      {error && (
        <p className="aviso" role="alert">
          {error}
        </p>
      )}

      <div className="partida">
        <TableroPropio vista={vista.miTablero} />
        <TableroEnemigo
          conocimiento={vista.tableroEnemigo}
          mapa={vista.mapaProbabilidades}
          objetivo={vista.objetivoRecomendado}
          puedeDisparar={turnoHumano}
          onDisparar={acciones.disparar}
        />
        <aside className="lateral">
          <PanelSugerencias vista={vista} ultimoEvento={ultimoEvento} onAlternarMapa={acciones.alternarMapa} />
          <PanelEstadisticas estadisticas={vista.estadisticas} metricas={vista.metricasMapa} />
        </aside>
      </div>
    </main>
  );
}