import { nombreCelda } from "./Cuadriculas.jsx";
import { FLOTA, TIPO_JUGADOR } from "../constantes/constantes.js"; 
import { porcentaje } from "../utils/Formatos.js";

const nombreBarco = (id) => FLOTA.find((b) => b.id === id)?.nombre.toLowerCase() ?? "barco";

/** Mensaje del último disparo */
function describirEvento({ atacante, celda, resultado }) {
  const donde = nombreCelda(celda.fila, celda.columna);
  const esHumano = atacante === TIPO_JUGADOR.HUMANO;
  const quien = esHumano ? "Disparaste" : "El autómata disparó";

  if (!resultado.impacto) return `${quien} en ${donde}: agua.`;

  const barco = nombreBarco(resultado.idBarco);
  if (esHumano) {
    return resultado.hundido ? `${quien} en ${donde}: ¡hundiste el ${barco}!` : `${quien} en ${donde}: impacto.`;
  }
  return resultado.hundido
    ? `${quien} en ${donde} y hundió tu ${barco}.`
    : `${quien} en ${donde}: impacto en tu ${barco}.`;
}

/**
 * @param vista          estado de usePartida
 * @param ultimoEvento   resultado del último disparo, o null
 * @param onAlternarMapa muestra u oculta el mapa de probabilidades
 */
export default function PanelSugerencias({ vista, ultimoEvento, onAlternarMapa }) {
  const { objetivoRecomendado: objetivo, metricasMapa, mostrarMapa } = vista;

  return (
    <section className="panel">
      <h2 className="panel__titulo">Sugerencias</h2>

      {mostrarMapa && objetivo ? (
        <p className="sugerencia">
          <span>Celda recomendada</span>
          <strong>{nombreCelda(objetivo.fila, objetivo.columna)}</strong>
          <span>{porcentaje.format(metricasMapa.probabilidadObjetivo)} de probabilidad</span>
        </p>
      ) : (
        <p className="panel__nota">
          {mostrarMapa ? "Aún no hay recomendación." : "Muestra el mapa para ver la celda recomendada."}
        </p>
      )}

      {metricasMapa?.sinConfiguraciones && (
        <p className="aviso">
          Ninguna configuración encajó con lo descubierto, así que el mapa reparte la probabilidad por igual.
        </p>
      )}

      <button
        type="button"
        className="boton boton--secundario"
        aria-pressed={mostrarMapa}
        onClick={onAlternarMapa}
      >
        {mostrarMapa ? "Ocultar mapa de probabilidades" : "Mostrar mapa de probabilidades"}
      </button>

      {ultimoEvento && (
        <p className="evento" aria-live="polite">
          {describirEvento(ultimoEvento)}
        </p>
      )}
    </section>
  );
}
