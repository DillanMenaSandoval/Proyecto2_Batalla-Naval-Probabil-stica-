/**
 * AppLayout.jsx
 * Estructura general: cabecera con navegación y panel de contenido.
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
      <main
        className="app-layout__contenido"
        role="tabpanel"
        id={idPanel(activa)}
        aria-labelledby={idPestana(activa)}
      >
        {children}
      </main>
    </div>
  );
}
