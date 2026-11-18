/**
 * estadoCelda.js
 * Traduce una celda del contrato a la variante visual con la que se dibuja.
 * Solo decide el aspecto; no calcula nada del juego.
 */

export const ESTADO_VISUAL = Object.freeze({
  LIBRE: "libre",
  BARCO: "barco",
  AGUA: "agua",
  IMPACTO: "impacto",
  HUNDIDO: "hundido",
});

export const TEXTO_ESTADO = Object.freeze({
  [ESTADO_VISUAL.LIBRE]: "sin disparar",
  [ESTADO_VISUAL.BARCO]: "barco",
  [ESTADO_VISUAL.AGUA]: "agua",
  [ESTADO_VISUAL.IMPACTO]: "impacto",
  [ESTADO_VISUAL.HUNDIDO]: "barco hundido",
});

/** @param {import("../../services/contratoJuego.js").CeldaPropia} celda */
export function estadoCeldaPropia({ idBarco, atacada, hundido }) {
  if (hundido) return ESTADO_VISUAL.HUNDIDO;
  if (atacada) return idBarco ? ESTADO_VISUAL.IMPACTO : ESTADO_VISUAL.AGUA;
  return idBarco ? ESTADO_VISUAL.BARCO : ESTADO_VISUAL.LIBRE;
}

/** @param {import("../../services/contratoJuego.js").CeldaEnemiga} celda */
export function estadoCeldaEnemiga({ resultado, hundido }) {
  if (hundido) return ESTADO_VISUAL.HUNDIDO;
  if (resultado === "IMPACTO") return ESTADO_VISUAL.IMPACTO;
  if (resultado === "AGUA") return ESTADO_VISUAL.AGUA;
  return ESTADO_VISUAL.LIBRE;
}
