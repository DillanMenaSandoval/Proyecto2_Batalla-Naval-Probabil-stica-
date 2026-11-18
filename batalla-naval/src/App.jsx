import { useState } from "react";
import usePartida from "./hooks/UsePartida.js"; 
import { ESTADO_PARTIDA } from "./juego/CicloDeJuego.js";
import PantallaInicio from "./pantallas/PantallaInicio.jsx";
import PantallaColocacion from "./pantallas/PantallaColocacion.jsx";
import PantallaPartida from "./pantallas/PantallaPartida.jsx";
import "./estilos/pantallas.css";

export default function App() {
  const [enInicio, setEnInicio] = useState(true);
  const { vista, ultimoEvento, error, acciones } = usePartida();

  if (enInicio) {
    return <PantallaInicio onIniciar={() => setEnInicio(false)} />;
  }
  if (vista.estado === ESTADO_PARTIDA.PREPARACION) {
    return <PantallaColocacion vista={vista} error={error} acciones={acciones} />;
  }
  return (
    <PantallaPartida vista={vista} ultimoEvento={ultimoEvento} error={error} acciones={acciones} />
  );
}