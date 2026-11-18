/**
 * gameService.test.js
 * Pruebas del ciclo de vida de la partida (sin navegador, sin dependencias).
 * Ejecutar con: npm test
 *
 * Math.random se sustituye por un generador con semilla para poder PREDECIR la
 * flota enemiga y comprobar que no se filtra en el snapshot.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { DIMENSION_TABLERO, FLOTA, TOTAL_CELDAS_BARCOS } from "../constantes/constantes.js";
import { colocarFlotaAleatoria } from "../juego/Colocacion.js";
import Tablero from "../juego/Tablero.js";
import { ESTADO_BARCO, FASE_PARTIDA, MOTIVO_RECHAZO } from "./contratoJuego.js";
import * as svc from "./gameService.js";

const randomOriginal = Math.random;

/** Generador mulberry32 con estado recuperable. */
function crearRng(semilla) {
  let s = semilla >>> 0;
  return {
    siguiente() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    estado: () => s,
    fijar: (valor) => {
      s = valor;
    },
  };
}

const clavesOcupadas = (vista) =>
  vista.flatMap((fila, f) => fila.flatMap((celda, c) => (celda.idBarco ? [`${f},${c}`] : [])));

const instantanea = () => JSON.stringify(svc.obtenerSnapshot());

let rng;

beforeEach(() => {
  rng = crearRng(12345);
  Math.random = rng.siguiente;
  svc.reiniciarPartida(); // deja el módulo en SIN_INICIAR (si ya lo estaba, se rechaza sin efecto)
});

afterEach(() => {
  Math.random = randomOriginal;
  svc.reiniciarPartida();
});

describe("estado inicial", () => {
  it("SIN_INICIAR: solo se puede generar flota", () => {
    const s = svc.obtenerSnapshot();
    assert.equal(s.estado.fase, FASE_PARTIDA.SIN_INICIAR);
    assert.deepEqual(s.acciones, { generarFlota: true, iniciar: false, reiniciar: false, disparar: false });
    assert.equal(clavesOcupadas(s.tableroPropio).length, 0);
    assert.ok(s.flota.every((b) => b.estado === ESTADO_BARCO.SIN_INICIAR));
  });
});

describe("iniciar partida", () => {
  it("1. no es posible iniciar sin una flota propia completa", () => {
    const antes = instantanea();
    assert.deepEqual(svc.iniciarPartida(), { ok: false, motivo: MOTIVO_RECHAZO.FLOTA_NO_PREPARADA });
    assert.equal(instantanea(), antes);
    assert.equal(svc.obtenerSnapshot().estado.fase, FASE_PARTIDA.SIN_INICIAR);
  });

  it("2. tras generar la flota, Iniciar y Reiniciar se habilitan", () => {
    assert.deepEqual(svc.generarFlota(), { ok: true });
    const s = svc.obtenerSnapshot();
    assert.equal(s.estado.fase, FASE_PARTIDA.FLOTA_PREPARADA);
    assert.deepEqual(s.acciones, { generarFlota: true, iniciar: true, reiniciar: true, disparar: false });
    assert.ok(s.flota.every((b) => b.estado === ESTADO_BARCO.COLOCADO));
  });

  it("3. al iniciar se conserva intacta la flota propia", () => {
    svc.generarFlota();
    const propiaAntes = JSON.stringify(svc.obtenerSnapshot().tableroPropio);
    assert.deepEqual(svc.iniciarPartida(), { ok: true });
    assert.equal(JSON.stringify(svc.obtenerSnapshot().tableroPropio), propiaAntes);
    assert.equal(clavesOcupadas(svc.obtenerSnapshot().tableroPropio).length, TOTAL_CELDAS_BARCOS);
  });

  it("4. la flota enemiga es válida y sus posiciones no se revelan", () => {
    svc.generarFlota();

    // Predice la flota enemiga: mismo generador, mismo punto de la secuencia.
    const punto = rng.estado();
    const previsto = new Tablero();
    colocarFlotaAleatoria(previsto);
    rng.fijar(punto);

    // Es una flota válida: 5 barcos, 17 celdas, tamaños correctos.
    const vistaPrevista = previsto.obtenerVistaPropia();
    assert.equal(previsto.flotaCompleta(), true);
    assert.equal(clavesOcupadas(vistaPrevista).length, TOTAL_CELDAS_BARCOS);
    for (const { id, tamaño } of FLOTA) {
      assert.equal(vistaPrevista.flat().filter((c) => c.idBarco === id).length, tamaño);
    }

    assert.deepEqual(svc.iniciarPartida(), { ok: true });
    const s = svc.obtenerSnapshot();

    // El tablero enemigo del snapshot no contiene información: ni barcos ni disparos.
    assert.equal(s.tableroEnemigo.length, DIMENSION_TABLERO);
    for (const fila of s.tableroEnemigo) {
      assert.equal(fila.length, DIMENSION_TABLERO);
      for (const celda of fila) {
        assert.deepEqual(celda, { resultado: null, hundido: false });
      }
    }
    // Ninguna otra parte del snapshot expone la flota enemiga.
    assert.deepEqual(Object.keys(s).sort(), ["acciones", "estado", "flota", "tableroEnemigo", "tableroPropio"]);
    assert.ok(!JSON.stringify(s.tableroEnemigo).includes("idBarco"));
    assert.ok(!JSON.stringify(s.estado).match(/\d+,\d+/));
    // La flota que se lista es la propia (cinco barcos, sin coordenadas).
    assert.deepEqual(
      s.flota.map((b) => Object.keys(b).sort()),
      FLOTA.map(() => ["estado", "id", "nombre", "tamaño"]),
    );
  });

  it("5. la fase pasa a EN_CURSO con las acciones correspondientes", () => {
    svc.generarFlota();
    svc.iniciarPartida();
    const s = svc.obtenerSnapshot();
    assert.equal(s.estado.fase, FASE_PARTIDA.EN_CURSO);
    assert.equal(s.estado.turno, null);
    assert.deepEqual(s.acciones, { generarFlota: false, iniciar: false, reiniciar: true, disparar: false });
    assert.ok(s.flota.every((b) => b.estado === ESTADO_BARCO.EN_JUEGO));
  });

  it("6. no se permite iniciar dos veces ni generar una flota durante la partida", () => {
    svc.generarFlota();
    svc.iniciarPartida();
    const antes = instantanea();
    const estadoRng = rng.estado();

    assert.deepEqual(svc.iniciarPartida(), { ok: false, motivo: MOTIVO_RECHAZO.PARTIDA_EN_CURSO });
    assert.deepEqual(svc.generarFlota(), { ok: false, motivo: MOTIVO_RECHAZO.PARTIDA_EN_CURSO });

    assert.equal(instantanea(), antes);
    assert.equal(rng.estado(), estadoRng, "no se volvió a generar ninguna flota");
  });
});

describe("reiniciar partida", () => {
  it("7a. desde FLOTA_PREPARADA limpia ambos tableros y vuelve a SIN_INICIAR", () => {
    svc.generarFlota();
    assert.deepEqual(svc.reiniciarPartida(), { ok: true });
    const s = svc.obtenerSnapshot();
    assert.equal(s.estado.fase, FASE_PARTIDA.SIN_INICIAR);
    assert.equal(clavesOcupadas(s.tableroPropio).length, 0);
    assert.ok(s.tableroEnemigo.flat().every((c) => c.resultado === null && c.hundido === false));
    assert.ok(s.flota.every((b) => b.estado === ESTADO_BARCO.SIN_INICIAR));
    assert.equal(s.estado.mensaje, "La partida aún no ha comenzado.");
  });

  it("7b. desde EN_CURSO limpia ambos tableros y vuelve a SIN_INICIAR", () => {
    svc.generarFlota();
    svc.iniciarPartida();
    assert.deepEqual(svc.reiniciarPartida(), { ok: true });
    const s = svc.obtenerSnapshot();
    assert.equal(s.estado.fase, FASE_PARTIDA.SIN_INICIAR);
    assert.equal(clavesOcupadas(s.tableroPropio).length, 0);
    assert.deepEqual(s.acciones, { generarFlota: true, iniciar: false, reiniciar: false, disparar: false });
    // Tras reiniciar no se puede iniciar sin preparar otra flota.
    assert.deepEqual(svc.iniciarPartida(), { ok: false, motivo: MOTIVO_RECHAZO.FLOTA_NO_PREPARADA });
  });

  it("7c. sin flota ni partida no hay nada que reiniciar", () => {
    assert.deepEqual(svc.reiniciarPartida(), { ok: false, motivo: MOTIVO_RECHAZO.NADA_QUE_REINICIAR });
    assert.equal(svc.obtenerSnapshot().estado.fase, FASE_PARTIDA.SIN_INICIAR);
  });

  it("8. se puede preparar y jugar una flota nueva después de reiniciar", () => {
    svc.generarFlota();
    const primera = JSON.stringify(svc.obtenerSnapshot().tableroPropio);
    svc.iniciarPartida();
    svc.reiniciarPartida();

    assert.deepEqual(svc.generarFlota(), { ok: true });
    const s = svc.obtenerSnapshot();
    assert.equal(s.estado.fase, FASE_PARTIDA.FLOTA_PREPARADA);
    assert.equal(clavesOcupadas(s.tableroPropio).length, TOTAL_CELDAS_BARCOS);
    assert.notEqual(JSON.stringify(s.tableroPropio), primera, "es una flota nueva");
    assert.deepEqual(svc.iniciarPartida(), { ok: true });
    assert.equal(svc.obtenerSnapshot().estado.fase, FASE_PARTIDA.EN_CURSO);
  });
});

describe("errores sin estados inconsistentes", () => {
  const fallar = () => {
    Math.random = () => {
      throw new Error("fallo simulado");
    };
  };

  it("9a. si falla la flota enemiga no se publica una partida a medias", () => {
    svc.generarFlota();
    const antes = instantanea();

    fallar();
    assert.deepEqual(svc.iniciarPartida(), { ok: false, motivo: MOTIVO_RECHAZO.INICIO_FALLIDO });
    assert.equal(instantanea(), antes);
    assert.equal(svc.obtenerSnapshot().estado.fase, FASE_PARTIDA.FLOTA_PREPARADA);

    // Se recupera: con el generador sano se puede iniciar.
    Math.random = rng.siguiente;
    assert.deepEqual(svc.iniciarPartida(), { ok: true });
    assert.equal(svc.obtenerSnapshot().estado.fase, FASE_PARTIDA.EN_CURSO);
  });

  it("9b. si falla generar la flota se conserva la anterior (o el estado vacío)", () => {
    fallar();
    assert.deepEqual(svc.generarFlota(), { ok: false, motivo: MOTIVO_RECHAZO.GENERACION_FALLIDA });
    assert.equal(svc.obtenerSnapshot().estado.fase, FASE_PARTIDA.SIN_INICIAR);

    Math.random = rng.siguiente;
    svc.generarFlota();
    const antes = instantanea();
    fallar();
    assert.deepEqual(svc.generarFlota(), { ok: false, motivo: MOTIVO_RECHAZO.GENERACION_FALLIDA });
    assert.equal(instantanea(), antes);
  });

  it("9c. disparar sigue sin estar disponible y no cambia nada", () => {
    svc.generarFlota();
    svc.iniciarPartida();
    const antes = instantanea();
    assert.deepEqual(svc.disparar({ fila: 0, columna: 0 }), {
      ok: false,
      motivo: MOTIVO_RECHAZO.LOGICA_NO_CONECTADA,
    });
    assert.equal(instantanea(), antes);
  });
});

describe("aislamiento", () => {
  it("el snapshot es una copia: modificarlo no altera la partida", () => {
    svc.generarFlota();
    svc.iniciarPartida();
    const antes = instantanea();

    const s = svc.obtenerSnapshot();
    s.tableroPropio[0][0].idBarco = "XX";
    s.tableroEnemigo[0][0].resultado = "IMPACTO";
    s.flota[0].estado = "HUNDIDO";
    s.acciones.disparar = true;
    s.estado.fase = FASE_PARTIDA.FINALIZADA;

    assert.equal(instantanea(), antes);
  });

  it("10. el estado se conserva entre consultas (equivale a cambiar de pestaña)", () => {
    svc.generarFlota();
    svc.iniciarPartida();
    const antes = instantanea();
    // Una pestaña nueva solo llama a obtenerSnapshot(): debe recuperar la misma partida.
    for (let i = 0; i < 3; i++) assert.equal(instantanea(), antes);
  });
});
