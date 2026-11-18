/**
 * GameHeader.jsx
 * Encabezado de la pestaña Partida. Sin datos: es texto fijo de presentación.
 */

export default function GameHeader() {
  return (
    <header className="juego-encabezado">
      <h2 className="juego-encabezado__titulo">Partida</h2>
      <p className="juego-encabezado__texto">Tú contra el agente probabilístico. Hunde su flota antes de que hunda la tuya.</p>
    </header>
  );
}
