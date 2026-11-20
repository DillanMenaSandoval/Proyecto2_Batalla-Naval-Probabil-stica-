import { GRADIENTE_MAPA } from "../utils/ColorMapa.js"; // ajusta la ruta

export default function PantallaInicio({ onIniciar, onSimular }) {
  return (
    <main className="pantalla pantalla--inicio">
      <h1 className="inicio__titulo">Batalla naval probabilística</h1>
      <div className="inicio__escala" style={{ background: GRADIENTE_MAPA }} aria-hidden="true" />
      <p className="inicio__texto">
        Hunde la flota enemiga antes de que un agente enemigo hunda la tuya.
      </p>
      <div className="inicio__acciones">
        <button type="button" className="boton boton--grande" onClick={onIniciar}>
          Iniciar partida
        </button>
        <button type="button" className="boton boton--grande boton--secundario" onClick={onSimular}>
          Simular
        </button>
      </div>
    </main>
  );
}