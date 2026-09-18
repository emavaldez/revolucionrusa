# Arquitectura — VERUSHKA (Unity)

Estado: v1, 2026-09-18. Describe el proyecto tal como está en
`Assets/RR/`, no un diseño aspiracional.

## 1. Principio de diseño

Todo el contenido narrativo y de puzzles vive en un único JSON
(`Assets/RR/Contenido/contenido.json`, copiado a
`Assets/StreamingAssets/contenido.json` para que el build lo lea) y se
deserializa a las clases de `Runtime/Data/Modelo.cs`. El motor en
`Runtime/Core/` no conoce nombres de personajes ni de escenarios: todo pasa
por flags, items y IDs. Regla operativa (de `INSTALAR.md`): si se toca
`Contenido/contenido.json`, correr **Revolución → Copiar contenido a
StreamingAssets** y reconstruir.

Grafo de flags booleanas. Estado total del juego = flags + inventario +
dos ejes ocultos (`ejeConviccion`, `ejeMetodo`) + argumentos aprendidos en
duelos. Todo vive en `Estado.cs`, sin persistencia entre sesiones (no hay
save/load — está fuera de alcance del PRD).

## 2. Modelo de datos (`Runtime/Data/Modelo.cs`)

- `Contenido` — raíz: escenarios, items, personajes, argumentos, duelos,
  finales, y el escenario inicial.
- `Escenario` — id, acto, dimensiones (ancho/fondo/alto), paleta, lista de
  `Hotspot`.
- `Hotspot` — posición y forma (para pintar geometría placeholder),
  `mirar`/`hablar`/`usos` condicionados por flags e items, y `vaA` para
  navegar a otro escenario.
- `Linea` / `Opcion` — diálogo condicional evaluado en orden (gana la
  primera línea cuyas condiciones se cumplen); una opción puede mover los
  ejes, dar/consumir items, setear flags o abrir un duelo.
- `Duelo` / `Asalto` / `Argumento` — el duelo dialéctico: cada asalto tiene
  un ataque, una réplica que lo neutraliza si ya se aprendió, y qué se
  aprende si se pierde ese asalto.
- `Final` — cuatro registros, cada uno con su combinación de
  `creyendo`/`metodoDuro`; `Estado.Epilogo()` elige por los ejes acumulados.

## 3. Runtime (`Runtime/Core/`)

- **`Estado.cs`** — el modelo de estado descripto arriba, más la evaluación
  de condiciones (`Cumple`, `PrimeraLineaValida`, `OpcionesValidas`,
  `HotspotVisible`) y el cálculo de epílogo.
- **`HotspotBehaviour.cs`** — un `MonoBehaviour` por hotspot del JSON, con
  los datos cargados en el Inspector. Dibuja un gizmo (caja) en el Editor.
  Reemplazar un hotspot por arte real es cambiarle el mesh al GameObject:
  el dato vive acá, no en la forma.
- **`Juego.cs`** — el loop principal: entrada de mouse/click, resolución de
  interacciones (mirar/hablar/usar/navegar), avance de diálogo, apertura y
  resolución de duelos.
- **`CamaraLateral.cs`** — cámara 2.5D con scroll lateral cuando el mouse
  se acerca a los bordes de pantalla.
- **`Runtime/UI/HUD.cs`** — HUD dibujado con IMGUI: verbos, inventario,
  texto de diálogo/duelo. Provisorio a propósito (ver §5).

## 4. Editor (`Assets/RR/Editor/ConstructorEscenas.cs`)

Menú **Revolución → Construir las tres escenas**: lee `contenido.json` y
genera `ActoI_Smolny`, `ActoII_Vyborg`, `ActoIII_Palacio` en
`Assets/RR/Escenas/` con geometría (cubos/cápsulas en las medidas y
posiciones correctas), cámara, luces y los 28 hotspots, y las agrega a
Build Settings en orden. Menú **Revolución → Copiar contenido a
StreamingAssets** sincroniza el JSON editable con la copia que lee el
juego en runtime.

## 5. Estado de implementación

**Funciona de punta a punta** (recorrido de verificación completo en
`INSTALAR.md`): los 3 actos, 28 hotspots, 3 duelos dialécticos, inventario,
y los 4 finales ya redactados y seleccionables según los ejes.

**Provisorio, documentado como tal en el propio proyecto:**
- HUD en IMGUI — funcional, ya con la paleta constructivista definitiva,
  pero pensado para reemplazarse por UI Toolkit cuando haya arte de UI.
  Ningún otro sistema depende de él.
- Geometría de hotspots: cubos y cápsulas con medidas/posiciones correctas,
  no arte final. El dato vive en `HotspotBehaviour`, así que el reemplazo
  es de mesh, no de sistema.
- No hay personaje jugable caminando — la interacción es por clic directo
  sobre hotspots. Agregar a Verushka caminando es un `NavMeshAgent` +
  `Animator`, no toca nada de lo ya construido.
- Fondos ya generados (`Assets/RR/Arte/fondo_{smolny,vyborg,palacio}.png`,
  logo, personajes) vía pipeline propio en `Assets/RR/Arte/*.py`
  (`generador.py`, `personajes.py`, `variantes.py`) pero todavía no
  aplicados como sprites/fondos reales en las escenas construidas por
  `ConstructorEscenas`.

## 6. Tooling

- **Unity CLI + MCP**: ver `docs/setup-unity-mcp.md` (doc del proyecto RR)
  para cómo quedó conectado el Editor a sesiones de Cowork vía el MCP
  proxeado (`mcp__remote-devices__unity__*`, ~150 herramientas).
- **wf**: flujo supervisor-worker (Claude planifica/audita, Hermes
  implementa) — ver `workflow/config.json` una vez inicializado con
  `wf init --preset app-local`.
