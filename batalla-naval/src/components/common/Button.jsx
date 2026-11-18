/**
 * Button.jsx
 * Botón de acción. `variante`: "primario" | "secundario".
 */

export default function Button({
  variante = "secundario",
  type = "button",
  className = "",
  children,
  ...props
}) {
  return (
    <button type={type} className={`boton boton--${variante} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
