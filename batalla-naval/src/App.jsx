import { useState } from "react";
import usePartida from "./hooks/UsePartida.js"; // ajusta las rutas
import { ESTADO_PARTIDA } from "./juego/CicloDeJuego.js";
import PantallaInicio from "./pantallas/PantallaInicio.jsx";
import PantallaSimulacion from "./pantallas/PantallaSimulacion.jsx";
import PantallaColocacion from "./pantallas/PantallaColocacion.jsx";
import PantallaPartida from "./pantallas/PantallaPartida.jsx";
import "./styles/Pantalla.css";

export default function App() {
  const [pantalla, setPantalla] = useState("INICIO"); // "INICIO" | "SIMULACION" | "JUEGO"
  const { vista, ultimoEvento, error, acciones } = usePartida();

  if (pantalla === "INICIO") {
    return (
      <PantallaInicio
        onIniciar={() => setPantalla("JUEGO")}
        onSimular={() => setPantalla("SIMULACION")}
      />
    );
  }
  if (pantalla === "SIMULACION") {
    return (
      <PantallaSimulacion
        simulaciones={vista.simulaciones}
        onElegir={acciones.establecerSimulaciones}
        onVolver={() => setPantalla("INICIO")}
      />
    );
  }
  if (vista.estado === ESTADO_PARTIDA.PREPARACION) {
    return <PantallaColocacion vista={vista} error={error} acciones={acciones} />;
  }
  // En curso y finalizada comparten pantalla: al terminar se siguen viendo los tableros
  return (
    <PantallaPartida vista={vista} ultimoEvento={ultimoEvento} error={error} acciones={acciones} />
  );
}