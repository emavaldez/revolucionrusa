# hud-ui-toolkit — Migrar el HUD de IMGUI a UI Toolkit

## Contexto

`Assets/RR/Runtime/UI/HUD.cs` (204 líneas) es el HUD actual, hecho con IMGUI
(`OnGUI`). Es funcional y ya usa la paleta constructivista definitiva, pero el
propio comentario del archivo lo marca como provisorio: "se reemplaza entero
por UI Toolkit cuando haya arte" (story 003 del backlog,
`docs/stories/003-hud-ui-toolkit.md`). Ese momento llegó: ya hay arte real
(`Assets/RR/Arte/`) y el juego está deployado y jugable en
https://revolucionrusa.vercel.app.

`Juego.cs` (`Assets/RR/Runtime/Core/Juego.cs`) llama a la API pública de `HUD`
así (buscá cada uso exacto con `grep -n 'hud\.' Assets/RR/Runtime/Core/Juego.cs`
antes de tocar nada):

- `hud.Titular(nombre, subtitulo)` — cartel de escena al entrar.
- `hud.Decir(quien, texto, cb?)` — línea de diálogo simple con botón CONTINUAR.
- `hud.Conversar(quien, texto, opciones, cb(idx))` — diálogo con botones de
  opción.
- `hud.Duelo(quien, texto, opciones, cb(idx))` — mismo layout que Conversar,
  pero marca `EnDuelo = true`.
- `hud.Final(titulo, cuerpo, resumen)` — pantalla de epílogo.
- `hud.Cerrar()` — limpia el diálogo actual.
- Propiedades leídas por `Juego.Update()`: `hud.EnDialogo`, `hud.EnDuelo`,
  `hud.EnFinal`, `hud.SobreUI()` (esta última decide si un click debe ir al
  raycast de hotspots o quedarse en la UI).
- `Juego.I.verbo` / `Juego.estado.inventario` / `Juego.I.itemEnMano` — el HUD
  actual los lee directo (no hay eventos: es polling en `OnGUI`, que corre
  cada frame). Podés seguir polleando en `Update()` de tu controlador de UI
  Toolkit, o suscribirte si te resulta más prolijo — lo que no podés es
  cambiar la forma en que `Juego.cs` expone ese estado.

## Objetivo observable

Reemplazar `HUD.cs` (IMGUI) por un HUD equivalente hecho con UXML + USS + un
`MonoBehaviour` en C# sobre `UIDocument` (UI Toolkit), manteniendo **el mismo
contrato público** (mismos nombres de método/propiedad, misma clase `HUD` en
`namespace RR`, mismo `GameObject.AddComponent<HUD>()` que hace `Juego.Awake()`)
para no tocar `Juego.cs` en absoluto.

Recorrido de aceptación: abrir el juego deployado (o correrlo en el Editor) y
seguir el flujo completo de un acto — cartel de escena, elegir verbo, mirar/
hablar con el centinela, entrar en el duelo dialéctico si corresponde, ver el
inventario — todo debe verse y funcionar igual que hoy, con el HUD nuevo.

## Qué tiene que llevar el HUD nuevo

Recreá exactamente estas piezas (mirá `HUD.cs` actual para el layout/reglas
exactas de cada una — alturas, condiciones de cuándo se muestra cada cosa):

1. **Barra inferior** (`altoBarra` ~92px en la versión IMGUI): tres botones de
   verbo (MIRAR / HABLAR / USAR) a la izquierda, con el seleccionado resaltado;
   inventario a la derecha (un botón por item, con su nombre; al click alterna
   `itemEnMano` y fuerza `verbo = Usar`; muestra la descripción del item
   seleccionado; si no hay items, el texto "— sin nada en los bolsillos —").
2. **Panel de diálogo**: aparece sobre la barra inferior cuando `texto` no está
   vacío. Muestra `quien` (si no es vacío) en rojo/negrita arriba, el texto del
   diálogo, y abajo: botones de opción si hay (`opciones`/`alElegir`) o un
   botón CONTINUAR si no (`alCerrar`). El ancho se adapta al contenido como en
   la versión actual (máx ~900px).
3. **Cartel de título de escena** (`Titular`): aparece arriba, centrado,
   se desvanece después de ~4.5s (fade-out desde ~3.5s) — podés lograrlo con
   USS transitions/animación por code en vez del cálculo manual de alpha de
   IMGUI.
4. **Cartel de ayuda persistente** (`DibujarAyuda` en el HUD actual): línea
   chica arriba a la izquierda, siempre visible salvo en la pantalla de final:
   "Acercá el mouse a los bordes para mirar a los costados · elegí un verbo y
   hacé clic" — este cartel se agregó hace muy poco (commit `8189024`) para
   resolver una confusión real de un jugador que no encontraba nada
   interactuable en pantalla; no lo pierdas.
5. **Pantalla de final** (`Final`/`DibujarFinal`): overlay a pantalla completa
   con título, cuerpo y el resumen de ejes/inventario/flags.
6. **`SobreUI()`**: tiene que seguir devolviendo `true` cuando el mouse está
   sobre cualquiera de estas zonas (barra de verbos, barra de inventario,
   panel de diálogo), para que `Juego.Update()` no dispare un click de
   hotspot por debajo de la UI. Con UI Toolkit esto probablemente se resuelve
   mejor con eventos de puntero (`RegisterCallback<PointerDownEvent>` con
   `evt.StopPropagation()` en los paneles de UI) en vez de un chequeo de
   `Rect.Contains` manual — elegís vos el mecanismo, pero el resultado
   observable (un click sobre un botón del HUD nunca dispara `Interactuar` en
   un hotspot detrás) tiene que preservarse.

Paleta (no negociable, ya es la definitiva — están en `HUD.cs` como
`Color32`, portalos a USS como variables):
- rojo `#C8102E`, negro `#141210`, crema `#E8DCC0`, gris tierra `#3A3632`.

## Fuera de alcance

- Rediseño visual más allá de portar el layout/comportamiento existente —
  no es una pasada de diseño, es un cambio de tecnología de UI.
- Tocar `Juego.cs`, `Estado.cs`, `HotspotBehaviour.cs`, `Modelo.cs`,
  `CamaraLateral.cs`, `ConstructorEscenas.cs`, `ConstructorBuild.cs`,
  `MenuInicio.cs` (la pantalla de título es un `OnGUI` aparte, no forma parte
  de esta story — dejala como está).
- Agregar dependencias/paquetes nuevos: UI Toolkit (`com.unity.modules.uielements`
  y `com.unity.modules.ui`) ya está en `Packages/manifest.json` (confirmalo,
  no lo agregues si ya está).
- Sonidos, animaciones de transición elaboradas, accesibilidad — lo mínimo
  para igualar el comportamiento actual alcanza.

## Alcance de archivos (`scope.allow`)

```
Assets/RR/Runtime/UI/HUD.cs
Assets/RR/Runtime/UI/HUD.uxml
Assets/RR/Runtime/UI/HUD.uss
```

Si por convención de UI Toolkit necesitás algún archivo más en
`Assets/RR/Runtime/UI/` (por ejemplo un `.asset` de `PanelSettings` o un
`ThemeStyleSheet`), agregalo ahí mismo y documentalo en `implementation.md`
con la justificación — no hace falta pedir permiso para eso puntualmente,
pero si necesitás tocar algo **fuera** de `Assets/RR/Runtime/UI/`, parate y
reportalo en vez de hacerlo.

## Criterios de aceptación

- **CA1** — `Assets/RR/Runtime/UI/HUD.cs` sigue declarando
  `namespace RR { public class HUD : MonoBehaviour { ... } }` con exactamente
  los mismos métodos públicos y propiedades públicas que la versión actual
  (verificalo vos mismo con un diff de firmas antes de entregar:
  `grep -n 'public ' Assets/RR/Runtime/UI/HUD.cs` contra la misma búsqueda en
  `git show main:Assets/RR/Runtime/UI/HUD.cs`).
- **CA2** — `Juego.cs` no aparece en el diff (`git diff main...task/hud-ui-toolkit --name-only`
  no debe incluirlo).
- **CA3** — Existe `Assets/RR/Runtime/UI/HUD.uxml` y `HUD.uss` (o los nombres
  que corresponda si Unity los versiona con otra extensión), referenciados
  desde `HUD.cs` vía `UIDocument`.
- **CA4** — Los 4 colores de paleta aparecen como valores en el USS (no
  hardcodeados de otra forma) y coinciden con los hex de arriba.
- **CA5** — Compilación sin errores: mismo método de verificación que usó la
  tarea `build-webgl` (compilar `Assets/RR/**/*.cs` con `csc` contra las DLLs
  del Editor instalado, sin abrir el proyecto — documentado en
  `workflow/runs/build-webgl/implementation.md` si necesitás el comando
  exacto). Si en tu caso hace falta abrir el Editor para que UI Toolkit
  compile/serialice bien el `.uxml`/`.uss`, hacelo pero documentá en
  `implementation.md` qué evidencia dejás para que el supervisor pueda
  verificar sin repetir ese paso.

## Riesgos / cosas para tener en cuenta

- **No hay tests automatizados de UI en este repo.** El criterio real es
  visual: el supervisor va a correr el build y comparar contra el HUD actual.
  Dejá capturas o una descripción clara en `implementation.md` de cómo se ve
  cada estado (barra de verbos, diálogo con opciones, duelo, final).
- El polling de `Juego.I` / `Juego.estado` en cada frame es el patrón actual
  y es aceptable que lo mantengas — no es necesario introducir un sistema de
  eventos si complica el scope.
- Si en el camino encontrás que preservar 1:1 algún detalle de `SobreUI()` no
  es directo con UI Toolkit, priorizá el comportamiento observable (que un
  click en la UI nunca llegue a un hotspot) sobre la implementación exacta, y
  documentá la diferencia.

## Paquete de contexto

- `Assets/RR/Runtime/UI/HUD.cs` completo (la referencia a portar).
- `Assets/RR/Runtime/Core/Juego.cs` — sólo para ver los usos de `hud.*`
  (buscalos con grep, no hace falta leer el archivo entero).
- `docs/stories/003-hud-ui-toolkit.md` — el pedido original.
- `docs/architecture.md` §Arte — paleta y contexto visual.
- `AGENTS.md` — contrato del circuito supervisado.
