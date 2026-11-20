/**
 * colorMapa.js
 * Convierte una probabilidad en el color del mapa de calor:
 * azul = poco probable) /  rosa = más probable
 */

const PARADAS = [
  { t: 0, rgb: [51, 105, 150] }, // #336996 mar 
  { t: 0.5, rgb: [153, 63, 148] }, // #993F94 violeta
  { t: 1, rgb: [232, 61, 155] }, // #E83D9B rosa
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