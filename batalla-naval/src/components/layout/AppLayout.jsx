/**
 * AppLayout.jsx
 * Estructura general: cabecera con navegación y paneles de contenido.
 *
 * Patrón WAI-ARIA «tabs»: cada pestaña controla un panel que SIEMPRE existe en
 * el DOM (así `aria-controls` nunca apunta a un id inexistente). Solo el panel
 * activo es visible y recibe el contenido; los demás quedan `hidden` y vacíos,
 * de modo que las páginas inactivas siguen desmontadas.
 */

import AppHeader from "./AppHeader.jsx";
import MainNav from "./MainNav.jsx";
import { idPanel, idPestana } from "./idsNavegacion.js";

export default function AppLayout({ pestanas, activa, onCambiar, children }) {
  return (
    <div className="app-layout">
      <AppHeader>
        <MainNav pestanas={pestanas} activa={activa} onCambiar={onCambiar} />
      </AppHeader>
      <main className="app-layout__contenido">
        {pestanas.map((pestana) => {
          const esActiva = pestana.id === activa;
          return (
            <div
              key={pestana.id}
              id={idPanel(pestana.id)}
              role="tabpanel"
              aria-labelledby={idPestana(pestana.id)}
              hidden={!esActiva}
              tabIndex={esActiva ? 0 : undefined}
            >
              {esActiva ? children : null}
            </div>
          );
        })}
      </main>
    </div>
  );
}
