/**
 * colorMapa.js
 * Convierte una probabilidad en el color del mapa de calor:
 * azul de mar (poco probable) -> ciruela -> rosa (lo más probable).
 *
 * La escala es relativa al MÁXIMO del mapa, no a 1: si casi todas las celdas
 * tienen probabilidades bajas, una escala absoluta se vería casi uniforme.
 */

const PARADAS = [
  { t: 0, rgb: [51, 105, 150] }, // #336996 mar (igual a --mar en tema.css)
  { t: 0.5, rgb: [153, 63, 148] }, // #993F94 ciruela: del violeta de la paleta hacia el rosa
  { t: 1, rgb: [232, 61, 155] }, // #E83D9B rosa de la paleta
];

const aCss = ([r, g, b]) => `rgb(${r} ${g} ${b})`;

export function colorProbabilidad(probabilidad, maximo) {
  const t = maximo > 0 ? Math.min(Math.max(probabilidad / maximo, 0), 1) : 0;
  const i = t < 0.5 ? 0 : 1;
  const a = PARADAS[i];
  const b = PARADAS[i + 1];
  const k = (t - a.t) / (b.t - a.t);
  return aCss(a.rgb.map((v, j) => Math.round(v + (b.rgb[j] - v) * k)));
}

/** Mismo degradado, para la barra de la leyenda. */
export const GRADIENTE_MAPA = `linear-gradient(90deg, ${PARADAS.map(
  (p) => `${aCss(p.rgb)} ${p.t * 100}%`
).join(", ")})`;