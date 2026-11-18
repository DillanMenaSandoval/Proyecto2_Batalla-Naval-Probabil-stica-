/** Formatos de números compartidos por los paneles. */
export const porcentaje = new Intl.NumberFormat("es", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});