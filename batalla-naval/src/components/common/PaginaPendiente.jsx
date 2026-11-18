/**
 * PaginaPendiente.jsx
 * Contenido provisional de una pestaña cuyo desarrollo es de una etapa posterior.
 * @param {{titulo:string, descripcion:string}} props
 */

export default function PaginaPendiente({ titulo, descripcion }) {
  return (
    <section className="pagina-pendiente" aria-labelledby="titulo-pendiente">
      <h2 id="titulo-pendiente" className="pagina-pendiente__titulo">
        {titulo}
      </h2>
      <p className="pagina-pendiente__texto">{descripcion}</p>
      <p className="pagina-pendiente__nota">Esta sección se desarrollará en una etapa posterior.</p>
    </section>
  );
}
