# Integración interfaz ↔ lógica

Estado: la interfaz de la pestaña **Partida** está construida con datos de presentación. Ninguna regla del juego vive en componentes React.

## Flujo

```
Componentes (components/game, pages)
        │  props
      useGame (hooks/useGame.js)          ← sin reglas: pide snapshot, ejecuta acciones
        │
 gameService (services/gameService.js)    ← ÚNICO punto de conexión con la lógica
        │
 Lógica: Tablero, Jugador, Colocacion…    ← src/juego/ (+ CicloDeJuego, MapaProbabilidades)
```

Los tipos de datos están en `src/services/contratoJuego.js`. Para integrar, solo se reescribe el cuerpo de `gameService.js` y se elimina `datosPresentacion.js`; los componentes no cambian.

## Qué necesita cada componente

| Componente | Datos (props) | Operaciones | Origen en la lógica |
|---|---|---|---|
| `PartidaPage` | todo el snapshot de `useGame` | — | `gameService.obtenerSnapshot()` |
| `GameHeader` | ninguno (texto fijo) | — | — |
| `GameStatus` | `estado.fase`, `estado.mensaje` | — | fase y mensaje del `CicloDeJuego` |
| `TurnIndicator` | `estado.turno` (`"HUMANO"`, `"AUTOMATA"` o `null`) | — | turno del `CicloDeJuego` |
| `GameControls` | `acciones.iniciar`, `acciones.reiniciar` | `onIniciar()`, `onReiniciar()` | `CicloDeJuego` |
| `Board` (propio) | matriz `CeldaPropia[10][10]` | — | `Tablero.obtenerVistaPropia()` (mismo formato) |
| `Board` (enemigo) | matriz `CeldaEnemiga[10][10]`, `interactivo` | `onDisparar({fila, columna})` | `Jugador.obtenerConocimiento().celdasExploradas` |

## Operaciones que debe proporcionar la lógica

`gameService` expone hoy, y la lógica debe respaldar:

| Función | Devuelve | Debe hacer |
|---|---|---|
| `obtenerSnapshot()` | `SnapshotPartida` | Leer el estado actual y traducirlo al contrato. |
| `iniciarPartida()` | `{ok}` / `{ok:false, motivo}` | Crear jugadores y tableros, colocar la flota, fijar el primer turno. |
| `reiniciarPartida()` | `{ok}` / `{ok:false, motivo}` | Descartar la partida y volver a `SIN_INICIAR`. |
| `disparar(celda)` | `{ok}` / `{ok:false, motivo}` | Turno humano: `Jugador.seleccionarObjetivo(celda)` → `Tablero.recibirDisparo` del rival → `Jugador.registrarResultado`. Después el turno del agente. |

## Piezas que existen y piezas que faltan

Existen en `src/juego/`: `Tablero`, `Barco`, `Jugador`, `Colocacion` y las constantes (`constantes.js`, `Geometria.js`).

Faltan y la interfaz las necesitará:

1. **`CicloDeJuego`**: lleva el turno, detecta el fin (`Tablero.todosLosBarcosHundidos()`), expone fase y mensaje, y ejecuta los disparos de ambos jugadores. Hoy nada coordina los dos `Jugador`.
2. **`MapaProbabilidades`**: `Jugador.seleccionarObjetivo()` ya lo invoca (`obtenerMejorObjetivo()`). La pestaña Probabilidades necesitará además la matriz de probabilidades por celda.
3. **Simulador**: para la pestaña Experimentos (partidas en lote y resultados agregados).

## Decisiones que conviene confirmar al integrar

- **Colocación de la flota**: la interfaz admite la fase `COLOCACION`, pero no hay componentes de colocación manual todavía. `Colocacion.celdasCandidatas()` y `colocarFlotaAleatoria()` ya sirven para ambos casos.
- **Disparo humano**: `Jugador.seleccionarObjetivo()` lanza excepciones (celda repetida, fuera de rango). El servicio debe traducirlas a `{ok:false, motivo}` para que la UI no reciba excepciones.
- **Turno del agente**: puede resolverse al instante o con un retraso para que se vea el disparo. Es una decisión de producto; el contrato admite ambas.
- **Tablero enemigo hundido**: `CeldaEnemiga.hundido` debe marcar todas las celdas del barco hundido. `celdasExploradas` solo guarda `idBarco` y `hundido` por celda disparada, así que el servicio tendrá que propagar el estado `hundido` a las celdas impactadas del mismo `idBarco`.
- **Estadísticas**: `Jugador.obtenerEstadisticas()` ya devuelve disparos, impactos, agua y barcos hundidos para la pestaña Estadísticas.

## Conservar el estado de la partida entre pestañas

### Análisis

- `App.jsx` renderiza **solo la página activa**. Al cambiar de pestaña React desmonta `PartidaPage`, y con ella `useGame`, cuyo `useState` es local al componente: ese estado se destruye y al volver se pide un snapshot nuevo.
- **Hoy no se pierde nada**, porque `gameService.obtenerSnapshot()` devuelve siempre datos vacíos y no existe una partida que conservar.
- **Se perdería** en cuanto el servicio use la lógica real, si `gameService` no guarda la partida (por ejemplo, si cada llamada crea un `CicloDeJuego` nuevo) o si la partida vive en un `useState` de la página.
- Hay un segundo requisito: Probabilidades y Estadísticas deben leer **la misma partida** que Partida. Con estado local de página no podrían.

### Opciones

| Opción | Conserva al cambiar de pestaña | Comparte con otras pestañas | Comentario |
|---|---|---|---|
| Estado local en `PartidaPage` (hoy) | No | No | Sirve solo mientras no haya partida real. |
| Hook compartido (`useGame` en `App`, datos por props) | Sí | Sí | Rápido, pero la partida queda atada al ciclo de vida de React y obliga a pasar props. |
| Context API (Provider en `App`) | Sí | Sí | Funciona, pero la instancia de lógica (clases con campos privados) no es estado de React: habría que forzar renders a mano. Añade una capa sin resolver dónde vive la partida. |
| **Instancia centralizada en `gameService` + `useSyncExternalStore`** | **Sí** | **Sí** | La partida vive fuera de React; los componentes solo se suscriben. |

Mantener montadas las páginas ocultas (`hidden`) también conserva el estado local, pero no lo comparte y renderiza todo a la vez, así que no se recomienda.

### Recomendación

Mantener **una sesión de partida centralizada dentro de `gameService`** y que `useGame` se suscriba con `useSyncExternalStore`. Motivos:

1. Es coherente con la separación actual: la lógica no depende de React y se puede probar sin navegador.
2. Las clases de `src/juego/` son objetos mutables, no estado de React; el servicio es quien sabe cuándo cambian y notifica.
3. Cualquier pestaña obtiene la misma partida con el mismo hook, sin Provider ni props.
4. `useGame` conserva su API actual, así que **ningún componente cambia**.

Context solo se justificaría si más adelante hiciera falta inyectar distintas partidas (por ejemplo, en tests de componentes).

### Forma prevista (sin implementar todavía)

```js
// gameService.js
let sesion = crearSesion();          // la partida actual
let snapshot = construirSnapshot(sesion);
const oyentes = new Set();

export const suscribir = (oyente) => { oyentes.add(oyente); return () => oyentes.delete(oyente); };
export const obtenerSnapshot = () => snapshot;   // MISMA referencia hasta que cambie la partida

function publicar() {
  snapshot = construirSnapshot(sesion);          // nueva referencia solo al cambiar
  oyentes.forEach((oyente) => oyente());
}
// iniciarPartida / reiniciarPartida / disparar: mutan `sesion`, luego publicar()

// useGame.js
const snapshot = useSyncExternalStore(gameService.suscribir, gameService.obtenerSnapshot);
```

Precauciones al implementarlo:

- `obtenerSnapshot()` debe devolver una referencia **estable** entre cambios; si construye un objeto nuevo en cada llamada, React entra en un bucle de renders. (La versión actual devuelve datos nuevos en cada llamada y es válida solo mientras no se use `useSyncExternalStore`.)
- El snapshot debe ser una copia de solo lectura; nunca exponer las clases de lógica ni sus celdas internas.
- `reiniciarPartida()` crea una sesión nueva y publica; no hay que recrear la UI.
- El simulador debe crear **sus propias sesiones** (una función `crearSesion()` independiente) y no tocar la sesión que ve la interfaz.
- Exportar una función de reinicio total para tests, porque el estado del módulo sobrevive entre pruebas.
- Persistir la partida tras recargar el navegador queda fuera de alcance.

## Pendientes ajenos a este PR

- **Error de ESLint preexistente** en `src/juego/Jugador.js:10`: el import `RESULTADO_CELDA` no se usa (`no-unused-vars`). Es código de la lógica del compañero y ya fallaba en `feature/initial-react-setup`. No se modifica aquí; debe corregirse en un cambio independiente (quitar el import o usar la constante en `registrarResultado`, donde hoy se escriben `"IMPACTO"` y `"AGUA"` como texto).
