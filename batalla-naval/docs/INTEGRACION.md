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
