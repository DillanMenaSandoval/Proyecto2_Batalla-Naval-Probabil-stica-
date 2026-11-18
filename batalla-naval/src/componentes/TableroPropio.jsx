import Cuadricula, { nombreCelda } from "./Cuadricula.jsx";

/**
 * Tu tablero: flota y disparos recibidos. No es interactivo.
 * @param {{idBarco:string|null, atacada:boolean, hundido:boolean}[][]} vista  estado.miTablero
 */
export default function TableroPropio({ vista }) {
  const describirCelda = (fila, columna) => {
    const nombre = nombreCelda(fila, columna);
    const { idBarco, atacada, hundido } = vista[fila][columna];

    if (atacada && idBarco === null) {
      return { estado: "agua", etiqueta: `${nombre}: disparo al agua` };
    }
    if (atacada) {
      return {
        estado: hundido ? "hundido" : "impacto",
        etiqueta: `${nombre}: ${hundido ? "barco hundido" : "tu barco fue impactado"}`,
      };
    }
    return idBarco
      ? { estado: "barco", etiqueta: `${nombre}: tu barco` }
      : { estado: "mar", etiqueta: nombre };
  };

  return (
    <section className="tablero">
      <h2 className="tablero__titulo">Tu tablero</h2>
      <Cuadricula etiqueta="Tu tablero" describirCelda={describirCelda} />
    </section>
  );
}