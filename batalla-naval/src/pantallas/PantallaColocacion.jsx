import { useMemo, useState } from "react";
import Cuadricula, { nombreCelda } from "../componentes/Cuadriculas.jsx"; // ajusta las rutas
import { FLOTA } from "../constantes/constantes.js";

const clave = (c) => `${c.fila},${c.columna}`;

/**
 * Colocación manual de la flota del humano. 
 * Elige un barco y marca sus celdas en el tablero
 * Se coloca solo al marcar la última celda.
 */
export default function PantallaColocacion({ vista, error, acciones }) {
  const [activo, setActivo] = useState(FLOTA[0].id);
  const [seleccionadas, setSeleccionadas] = useState([]);

  const colocados = vista.colocados;
  const barcoActivo = FLOTA.find((b) => b.id === activo && !colocados.includes(b.id)) ?? null;

  const candidatas = useMemo(
    () => (barcoActivo ? acciones.celdasCandidatas(barcoActivo.tamaño, seleccionadas) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [barcoActivo?.id, seleccionadas, colocados.join()]
  );
  const esCandidata = new Set(candidatas.map(clave));
  const esSeleccionada = new Set(seleccionadas.map(clave));

  const describirCelda = (fila, columna) => {
    const k = `${fila},${columna}`;
    const nombre = nombreCelda(fila, columna);
    if (esSeleccionada.has(k)) return { estado: "seleccionada", etiqueta: `${nombre}: seleccionada` };
    if (vista.miTablero[fila][columna].idBarco) return { estado: "barco", etiqueta: `${nombre}: tu barco` };
    if (esCandidata.has(k)) {
      return { estado: "candidata", seleccionable: true, etiqueta: `${nombre}: puedes colocar aquí` };
    }
    return { estado: "mar", etiqueta: nombre };
  };

  const elegirCelda = (fila, columna) => {
    const nuevas = [...seleccionadas, { fila, columna }];
    if (nuevas.length < barcoActivo.tamaño) {
      setSeleccionadas(nuevas);
      return;
    }
    acciones.colocarBarco(barcoActivo.id, nuevas);
    setSeleccionadas([]);
    // pasa solo al siguiente barco que falte
    setActivo(FLOTA.find((b) => b.id !== barcoActivo.id && !colocados.includes(b.id))?.id ?? null);
  };

  const ayuda = barcoActivo
    ? `Marca las ${barcoActivo.tamaño} celdas del ${barcoActivo.nombre.toLowerCase()} (${seleccionadas.length} de ${barcoActivo.tamaño}).`
    : vista.flotaCompleta
      ? "Tu flota está lista."
      : "Elige un barco de la lista.";

  return (
    <main className="pantalla">
      <h1 className="barra__titulo">Coloca tu flota</h1>
      <div className="colocacion">
        <section className="tablero">
          <h2 className="tablero__titulo">Tu tablero</h2>
          <Cuadricula etiqueta="Tu tablero" describirCelda={describirCelda} onSeleccionar={elegirCelda} />
        </section>

        <div className="colocacion__lateral">
          <p className="colocacion__ayuda" aria-live="polite">
            {ayuda}
          </p>
          {error && (
            <p className="aviso" role="alert">
              {error}
            </p>
          )}

          <ul className="flota">
            {FLOTA.map((b) => {
              const colocado = colocados.includes(b.id);
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    className="barco"
                    aria-pressed={b.id === barcoActivo?.id}
                    disabled={colocado}
                    onClick={() => {
                      setActivo(b.id);
                      setSeleccionadas([]);
                    }}
                  >
                    {b.nombre}
                    <small>{colocado ? "colocado" : `${b.tamaño} celdas`}</small>
                  </button>
                  {colocado && (
                    <button
                      type="button"
                      className="boton boton--texto"
                      onClick={() => {
                        acciones.quitarBarco(b.id);
                        setActivo(b.id);
                      }}
                    >
                      Quitar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="acciones">
            <button
              type="button"
              className="boton boton--secundario"
              onClick={() => {
                acciones.colocarAlAzar();
                setSeleccionadas([]);
                setActivo(null);
              }}
            >
              Colocar al azar
            </button>
            {seleccionadas.length > 0 && (
              <button type="button" className="boton boton--secundario" onClick={() => setSeleccionadas([])}>
                Borrar selección
              </button>
            )}
            <button type="button" className="boton" disabled={!vista.flotaCompleta} onClick={acciones.iniciar}>
              Comenzar partida
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}