import { GRADIENTE_MAPA } from "../utils/ColorMapa.js"; 

export default function PantallaInicio({ onIniciar }) {
  return (
    <main className="pantalla pantalla--inicio">
      <h1 className="inicio__titulo">Batalla naval probabilística</h1>
      <div className="inicio__escala" style={{ background: GRADIENTE_MAPA }} aria-hidden="true" />
      <p className="inicio__texto">
        Hunde la flota enemiga antes de que un agente enemigo hunda la tuya.
      </p>
      <button type="button" className="boton boton--grande" onClick={onIniciar}>
        Iniciar partida
      </button>
    </main>
  );
}