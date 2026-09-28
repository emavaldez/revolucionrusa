# verushka-caminando — Verushka jugable: NavMeshAgent + Animator

## Contexto

Hoy toda la interacción es clic directo: `Juego.Update()` (`Assets/RR/Runtime/Core/Juego.cs`)
tira un `Physics.Raycast` desde la cámara, encuentra un `HotspotBehaviour` y
llama a `Interactuar(hb.datos)` en el mismo frame — no hay ningún personaje
visible moviéndose por la escena. `INSTALAR.md` señala esto como pendiente y
aclara explícitamente que agregarlo "no toca nada de lo que ya está" (story
004, `docs/stories/004-verushka-caminando.md`).

Las 3 escenas (Smolny, Výborg, Palacio) las genera
`Assets/RR/Editor/ConstructorEscenas.cs`: por cada hotspot del
`contenido.json` crea un primitivo (`GameObject.CreatePrimitive`) con
`HotspotBehaviour` + `Collider` bajo un GameObject padre `"Hotspots"`
(mirá el loop `foreach (var h in esc.hotspots)` alrededor de la línea 178).
El piso de cada escena es un `Cube` llamado "Piso" — es la superficie sobre
la que va a caminar Verushka; el NavMesh se bakea sobre esa geometría.

Puntos exactos de integración en `Juego.cs` (léelos con
`grep -n 'Update\|Interactuar\|Raycast' Assets/RR/Runtime/Core/Juego.cs`
antes de tocar nada — no cites de memoria esto, confirmalo vos mismo en el
código real):

```csharp
void Update() {
    if (hud.EnDialogo || hud.EnDuelo || hud.EnFinal) return;
    if (!Input.GetMouseButtonDown(0)) return;
    if (hud.SobreUI()) return;

    var ray = cam.ScreenPointToRay(Input.mousePosition);
    if (!Physics.Raycast(ray, out var hit, 200f)) return;
    var hb = hit.collider.GetComponentInParent<HotspotBehaviour>();
    if (hb == null) return;
    Interactuar(hb.datos);   // <-- hoy dispara inmediato; acá es donde entra caminar-primero
}
```

`HotspotBehaviour` (`Assets/RR/Runtime/Core/HotspotBehaviour.cs`) ya expone
`transform.position` y `datos` (el `Hotspot` del JSON, con `x/y/z`); no hace
falta agregarle campos para tener un punto de destino razonable — usar la
posición del propio hotspot (o un punto ligeramente offseteado hacia la
cámara/piso, ver Riesgos) alcanza para esta story.

## Objetivo observable

En las 3 escenas: clickear un hotspot con un verbo elegido hace que
Verushka (un GameObject con `NavMeshAgent` + `Animator`, visible en pantalla
aunque sea con geometría placeholder) camine hasta el punto de interacción
y **recién al llegar** se dispare `Interactuar()` (el diálogo/mirar/usar
actual, sin cambios de comportamiento una vez que arranca). Mientras camina,
`Animator` debe reflejar caminar; al llegar y quedar quieta, idle.

Recorrido de aceptación: en cada una de las 3 escenas, clickear varios
hotspots distintos con los 3 verbos — Verushka camina hasta cada uno antes
de que aparezca el diálogo/resultado, y el recorrido completo de
`INSTALAR.md` (los 3 actos, duelo dialéctico incluido, finales) sigue
funcionando exactamente igual que hoy una vez que Verushka llega.

## Qué hay que hacer

1. **Bake de NavMesh en las 3 escenas.** Usá el paquete de Navigation de
   Unity (`NavMeshSurface` de `com.unity.ai.navigation`, o el sistema
   legacy `NavMeshBuilder` si ese paquete no está — confirmá cuál está
   disponible en `Packages/manifest.json` antes de elegir). El piso
   ("Piso", un `Cube`) tiene que quedar marcado como caminable
   (`Navigation Static` o el equivalente del paquete elegido). Esto tiene
   que pasar en **generación de escena**, no a mano en el Editor: agregá
   el paso de bake donde corresponda en `ConstructorEscenas.cs` (create u
   otro método existente) para que quede reproducible — un jugador que
   clona el repo y corre "Revolución → Construir las tres escenas" tiene
   que terminar con NavMesh baketeado, no con un paso manual documentado
   aparte.
2. **GameObject "Verushka"** por escena, con `NavMeshAgent` (velocidad y
   radio razonables para el tamaño de las escenas — mirá `esc.ancho` en
   `ConstructorEscenas.cs` para tener una idea de escala) y `Animator`
   apuntando a un `AnimatorController` mínimo con al menos dos estados
   (`Idle`, `Caminar`) y un parámetro (`float` o `bool`) que controle la
   transición — no hace falta arte ni clips de animación reales, un
   placeholder (cápsula con un controlador que solo cambia de color o
   escala entre estados, o incluso sin animación visible pero con el
   parámetro correctamente seteado) alcanza; la story es sobre el
   movimiento, no sobre el arte final de Verushka (ver Fuera de alcance).
3. **Flujo clickear-caminar-interactuar** en el punto marcado arriba en
   `Juego.cs`: al clickear un hotspot válido, en vez de llamar
   `Interactuar(hb.datos)` directo, arrancá el `NavMeshAgent` hacia el
   destino y guardá qué interacción quedó pendiente; cuando el agente
   llega (`agent.remainingDistance <= agent.stoppingDistance` y
   `!agent.pathPending`, chequeado en un `Update`/coroutine), recién ahí
   llamá `Interactuar()` con los mismos datos que se iban a usar antes.
   Un segundo click mientras camina hacia un hotspot debe cancelar el
   destino anterior y re-dirigir hacia el nuevo (no encolar caminatas).
4. Mientras Verushka está caminando, el juego no debe quedar "roto": si el
   jugador clickea la UI (verbos/inventario) mientras camina, tiene que
   seguir funcionando con normalidad (`hud.SobreUI()` sigue gobernando eso,
   no lo toques).

## Fuera de alcance

- Arte o sprite final de Verushka — placeholder alcanza (cápsula,
  cubo, o el primitivo que prefieras, con el `Animator` correctamente
  cableado aunque el clip sea trivial).
- La decisión de "cuánto se ve a Verushka" en diálogos (¿retrato o solo
  sprite en el mundo?) — es una decisión de PRD pendiente, no de esta
  story. Si en el camino te cruzás con ese punto, dejalo anotado en
  `implementation.md` para decidir aparte, no lo resuelvas vos.
- Tocar `HUD.cs`, `Estado.cs`, `ConstructorBuild.cs`, `MenuInicio.cs`,
  `CamaraLateral.cs` — si el flujo de caminar-y-recién-interactuar te
  tienta a tocar alguno de estos para "prolijizar", pará y reportalo en
  vez de hacerlo.
- Pathfinding avanzado (evitar obstáculos dinámicos, múltiples agentes,
  formaciones) — es un solo personaje jugable en escenas simples.

## Alcance de archivos (`scope.allow`)

```
Assets/RR/Editor/ConstructorEscenas.cs
Assets/RR/Runtime/Core/Juego.cs
Assets/RR/Runtime/Core/*.cs   (sólo si hace falta un componente nuevo,
                                p. ej. un ControladorVerushka.cs — documentá
                                cuál y por qué en implementation.md)
Packages/manifest.json         (sólo si hace falta agregar
                                com.unity.ai.navigation y no está ya)
```

Si te hace falta un `AnimatorController` (`.controller`) o un prefab para
Verushka, van bajo `Assets/RR/Runtime/` (elegí una carpeta razonable,
p. ej. `Assets/RR/Runtime/Personaje/`) — documentá la ruta elegida en
`implementation.md`. Cualquier otra cosa fuera de esta lista: pará y
reportalo en vez de tocarla.

## Criterios de aceptación

- **CA1** — Las 3 escenas generadas por `ConstructorEscenas.ConstruirTodo()`
  tienen NavMesh baketeado (verificable abriendo la escena en el Editor y
  mirando la ventana Navigation, o documentando en `implementation.md` el
  método de verificación si el bake ocurre en runtime).
- **CA2** — En las 3 escenas hay un GameObject Verushka con `NavMeshAgent`
  y `Animator` (con al menos 2 estados) al correr el juego.
- **CA3** — Clickear un hotspot con cualquier verbo hace que Verushka
  camine hasta el destino antes de que `Interactuar()` se ejecute — no hay
  ninguna interacción que dispare instantáneo como hoy salvo que ya esté
  parada ahí (caso trivial de distancia ~0).
- **CA4** — `git diff main...task/verushka-caminando --name-only` no toca
  ningún archivo fuera del `scope.allow` de arriba sin nota explícita en
  `implementation.md`.
- **CA5** — Recorrido completo de `INSTALAR.md` (3 actos, duelo, finales)
  sigue funcionando de punta a punta con el nuevo flujo de caminar-primero;
  documentá en `implementation.md` que lo probaste así, no sólo un hotspot
  suelto.
- **CA6** — Compilación sin errores: mismo método que usó `build-webgl`
  (compilar contra las DLLs del Editor instalado sin abrir el proyecto,
  documentado en `workflow/runs/build-webgl/implementation.md`) o, si el
  bake de NavMesh requiere abrir el Editor, documentá qué evidencia dejás
  para que el supervisor verifique sin repetir ese paso.

## Riesgos / cosas para tener en cuenta

- **Punto de destino exacto**: caminar hasta el centro exacto de un
  hotspot puede hacer que Verushka quede "adentro" de la geometría del
  hotspot (por ejemplo un personaje-cápsula). Está bien usar un punto
  ligeramente desplazado (hacia la cámara, o el borde del collider) como
  destino de caminata — priorizá que se vea razonable sobre la precisión
  matemática, y documentá qué offset usaste.
- **No hay tests automatizados** en este repo (mismo caso que
  `hud-ui-toolkit`). El criterio real es jugar el recorrido completo y
  dejar evidencia (capturas o descripción clara) en `implementation.md`.
- El polling en `Update()` es el patrón ya establecido en `Juego.cs` — no
  hace falta introducir un sistema de eventos para el chequeo de
  "¿llegó el agente?".
- Si `com.unity.ai.navigation` no está en `Packages/manifest.json` y hace
  falta agregarlo, confirmá que no rompe otras dependencias antes de
  commitear el cambio — es lo único fuera del código propio del proyecto
  que este scope permite tocar.
- Si en el camino te das cuenta de que la escala de las escenas (`esc.ancho`)
  hace que caminar se sienta lento o rarísimo, ajustá `speed`/`angularSpeed`
  del `NavMeshAgent` con criterio — no hay un valor "correcto" documentado,
  usá buen juicio y anotá el valor elegido.

## Paquete de contexto

- `Assets/RR/Runtime/Core/Juego.cs` completo (especialmente `Update()` e
  `Interactuar()`).
- `Assets/RR/Runtime/Core/HotspotBehaviour.cs` completo.
- `Assets/RR/Editor/ConstructorEscenas.cs` completo (loop de generación de
  hotspots y del piso).
- `docs/stories/004-verushka-caminando.md` — el pedido original.
- `docs/architecture.md` — contexto general de escenas/escala si existe.
- `AGENTS.md` — contrato del circuito supervisado.
