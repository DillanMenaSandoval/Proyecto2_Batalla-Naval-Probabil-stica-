/**
 * App.jsx
 * Raíz de la interfaz: navegación entre las cuatro pestañas.
 */

import { useState } from "react";
import AppLayout from "./components/layout/AppLayout.jsx";
import EstadisticasPage from "./pages/EstadisticasPage.jsx";
import ExperimentosPage from "./pages/ExperimentosPage.jsx";
import PartidaPage from "./pages/PartidaPage.jsx";
import ProbabilidadesPage from "./pages/ProbabilidadesPage.jsx";

const PESTANAS = [
  { id: "partida", etiqueta: "Partida", Pagina: PartidaPage },
  { id: "probabilidades", etiqueta: "Probabilidades", Pagina: ProbabilidadesPage },
  { id: "estadisticas", etiqueta: "Estadísticas", Pagina: EstadisticasPage },
  { id: "experimentos", etiqueta: "Experimentos", Pagina: ExperimentosPage },
];

export default function App() {
  const [activa, setActiva] = useState(PESTANAS[0].id);
  const { Pagina } = PESTANAS.find((p) => p.id === activa);

  return (
    <AppLayout pestanas={PESTANAS} activa={activa} onCambiar={setActiva}>
      <Pagina />
    </AppLayout>
  );
}
