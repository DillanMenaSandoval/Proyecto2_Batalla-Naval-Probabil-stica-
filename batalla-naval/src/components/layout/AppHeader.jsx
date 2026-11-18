/**
 * AppHeader.jsx
 * Barra superior con el nombre de la aplicación. Recibe la navegación como hijo
 * para que las pestañas queden unidas visualmente a la barra.
 */

export default function AppHeader({ children }) {
  return (
    <header className="app-header">
      <div className="app-header__interior">
        <p className="app-header__marca">Batalla Naval Probabilística</p>
        {children}
      </div>
    </header>
  );
}
