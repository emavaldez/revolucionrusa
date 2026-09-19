# build-webgl — ConstructorBuild: build WebGL headless invocable con `--execute-method`

## Contexto

`unity build --target WebGL` no tiene build built-in por CLI: exige
`--execute-method` o un build profile de Unity 6. El proyecto no tiene ninguno
de los dos, así que hoy el comando muere en la validación previa del CLI:

```
Error: Target WebGL has no built-in command-line build. Pass --execute-method, or use a
Unity 6+ build profile with --profile. Only desktop targets (StandaloneLinux64,
StandaloneOSX, StandaloneWindows64) build without them.
```

Esta tarea agrega el punto de entrada que falta. **El único archivo del alcance
es el nuevo.** El resto del circuito del proyecto (runtime, contenido,
`ConstructorEscenas`) queda como está.

## Objetivo observable

Un archivo nuevo `Assets/RR/Editor/ConstructorBuild.cs` con un método estático
invocable desde el Unity CLI, de modo que este comando produzca un build WebGL
jugable en `Builds/WebGL`:

```sh
unity build --target WebGL \
  --execute-method RR.ConstructorBuild.BuildWebGL \
  -o Builds/WebGL \
  --editor-version 6000.3.24f1
```

(`-o` / `--output-path` se le reenvía al editor como `-buildOutput`, ver
`unity build --help`.)

## Qué tiene que hacer `BuildWebGL()`

1. **Leer la ruta de salida del argumento de línea de comandos.** Buscar
   `-buildOutput` en `System.Environment.GetCommandLineArgs()` y tomar el
   argumento siguiente. **No hardcodear la ruta de salida**: el valor que se le
   pasa a `BuildPlayerOptions.locationPathName` tiene que venir del argumento.
   Si el argumento no está presente: `Debug.LogError` con un mensaje que diga
   cómo se pasa (`-buildOutput <ruta>` o `-o <ruta>`) y salir con código != 0
   (`EditorApplication.Exit(1)`). Si la ruta es relativa, resolverla contra la
   raíz del proyecto (`Directory.GetParent(Application.dataPath)`), porque el
   cwd del editor no es una garantía. Crear el directorio si no existe.

2. **Garantizar las 3 escenas en Build Settings antes de buildear.**
   Hoy `ProjectSettings/EditorBuildSettings.asset` tiene `m_Scenes: []`. Las
   escenas son `Assets/RR/Escenas/ActoI_Smolny.unity`,
   `ActoII_Vyborg.unity` y `ActoIII_Palacio.unity` (los nombres salen de
   `RR.Juego.NombreEscena`, `Assets/RR/Runtime/Core/Juego.cs:223-230`).
   * Si **no existen todavía construidas** en disco, ejecutar primero el
   constructor existente `RR.EditorTools.ConstructorEscenas.ConstruirTodo()`
   (`Assets/RR/Editor/ConstructorEscenas.cs:20`), que genera las 3 y ya las
   deja registradas en `EditorBuildSettings.scenes` en orden
   (`ConstructorEscenas.cs:40-41`).
   * Después —se hayan regenerado o no— asegurar que
   `EditorBuildSettings.scenes` contenga **exactamente esas 3 escenas, en ese
   orden y con `enabled: true`**, y persistir con `AssetDatabase.SaveAssets()`.
   Si ya coincide, no reescribir (ver idempotencia).
   * Si después de eso sigue faltando alguna de las 3 en disco, **fallar con
   error claro** y salir != 0: en batchmode `ConstruirTodo()` puede haber
   salido temprano (por ejemplo si falta
   `Assets/StreamingAssets/contenido.json`, `ConstructorEscenas.cs:21-26`), y
   un build con 0 escenas no sirve.

3. **Buildear.** `BuildPipeline.BuildPlayer` con
   `new BuildPlayerOptions { scenes = <las 3 rutas>, locationPathName = <ruta
   del argumento>, target = BuildTarget.WebGL, options = BuildOptions.None }`.
   Inspeccionar el `BuildReport` devuelto: loguear resultado y tamaño total, y
   **salir con `EditorApplication.Exit(0)` si `summary.result ==
   BuildResult.Succeeded` y `EditorApplication.Exit(1)` si no**. Sin el exit
   explícito el CLI puede reportar éxito con un build fallado.

4. **Idempotente.** Correrlo dos veces no puede romper nada: el guard del punto
   2 evita re-ejecutar `ConstruirTodo()`, y no reescribir Build Settings si ya
   está bien evita ensuciar el repo con un diff espurio. Que el build
   sobrescriba `Builds/WebGL` es lo esperado.

5. **Sólo WebGL.** `BuildTarget.WebGL`, sin agregar ni cambiar ninguna otra
   plataforma, sin tocar `ProjectSettings/` a mano y sin crear build profiles.

## Estilo y encuadre

Seguí las convenciones del archivo vecino `ConstructorEscenas.cs`: comentarios
en español rioplatense, `[MenuItem]` no hace falta (este método es para el CLI,
no para el menú), nombres de métodos y constantes en el mismo estilo. Usá
`namespace RR` (es lo que pide la invocación `RR.ConstructorBuild.BuildWebGL`),
aunque `ConstructorEscenas` viva en `RR.EditorTools`: para llamarlo agregá
`using RR.EditorTools;`.

## Fuera de alcance (no lo hagas)

- **No modifiques `Assets/RR/Editor/ConstructorEscenas.cs`** ni ningún otro
  archivo existente del repo. El diff tiene que ser un archivo nuevo y nada más.
- No corras `ConstruirTodo()` "para arreglarlo": si encontrás que no es
  idempotente, **reportalo en `implementation.md`** y seguí (ver riesgos).
- No generes ni commitees las escenas (`Assets/RR/Escenas/`) ni los materiales
  (`Assets/RR/Materiales/`) en esta tarea. Las genera el build real, que se
  corre después, desde el checkout principal.
- **No abras el proyecto en el editor ni en batchmode dentro del worktree.**
  Regeneraría una `Library/` de varios GB y no hace falta para esta tarea
  (ver riesgos).
- No cambies `ProjectSettings/EditorBuildSettings.asset` en el repo, ni
  agregues build profiles, ni toques `contenido.json` / StreamingAssets.
- No toques `audit.md`, ni los campos de aprobación de `state.json`, ni hagas
  merge.

## Alcance de archivos (`scope.allow`)

```
Assets/RR/Editor/ConstructorBuild.cs
```

(El `workflow/runs/build-webgl/*` ya está permitido por el gate.)

## Criterios de aceptación

Todos verificables con comandos, desde el worktree.

- **CA1** — `Assets/RR/Editor/ConstructorBuild.cs` existe y declara
  `namespace RR`, `public static class ConstructorBuild` y
  `public static void BuildWebGL()`.
- **CA2** — El cuerpo usa `BuildPipeline.BuildPlayer`, `BuildTarget.WebGL` y
  lee `-buildOutput` desde `Environment.GetCommandLineArgs()`. Evidencia:
  `grep -n 'BuildPipeline\|BuildTarget.WebGL\|GetCommandLineArgs\|"-buildOutput"' Assets/RR/Editor/ConstructorBuild.cs`.
- **CA3** — La ruta de salida **no está hardcodeada**: el valor que se asigna a
  `locationPathName` proviene del argumento parseado (mostralo con el snippet
  en `implementation.md`; no debe haber ninguna ruta literal de salida en esa
  asignación).
- **CA4** — El archivo llama a `ConstructorEscenas.ConstruirTodo()` (guardado
  por la existencia de las escenas) y asigna `EditorBuildSettings.scenes` con
  las 3 escenas.
- **CA5** — `git diff main...task/build-webgl --name-only` devuelve
  **exactamente** `Assets/RR/Editor/ConstructorBuild.cs`.
- **CA6** — `wf verify -i build-webgl` en verde, con `verify.json` en la tarea.
- **CA7** — (verificación funcional, la corre el supervisor post-merge, **no
  vos**) el comando del "Objetivo observable" termina con exit 0 y deja
  `Builds/WebGL/index.html` + `Build/` con `.wasm`/`.data`.

## Riesgos (leelos antes de empezar)

- **R1 — sin compilación local.** En el worktree no hay `Library/` importada ni
  el módulo WebGL todavía instalándose, así que **no vas a poder compilar ni
  correr el build acá**. No es un fallo de la tarea: la verificación funcional
  (CA7) corre post-merge en el checkout principal. No intentes compensarlo
  abriendo el editor: ver "Fuera de alcance".
- **R2 — `ConstruirTodo()` no es idempotente.** Usa
  `AssetDatabase.CreateAsset` sin chequeo previo para `M_Fondo_<id>.mat`
  (`ConstructorEscenas.cs:81`) y existe `Assets/RR/Arte/fondo_<id>.png` para los
  tres escenarios, así que la **segunda** corrida puede loguear error de asset
  existente. Por eso el guard del punto 2 es "sólo si faltan las escenas".
  No lo corrijas en esta tarea: reportalo.
- **R3 — batchmode y diálogos.** `ConstruirTodo()` usa
  `EditorUtility.DisplayDialog` si falta el contenido
  (`ConstructorEscenas.cs:22-25`); en batchmode no hay diálogo y puede salir
  temprano sin construir. El chequeo de escenas del punto 2 (fallar != 0) es la
  red.
- **R4 — código de salida.** Si el método retorna "bien" pero el build falló, el
  CLI miente. `EditorApplication.Exit(<código>)` es obligatorio en ambos casos.

## Paquete de contexto

Leé sólo esto (no hace falta explorar el repo entero):

- `Assets/RR/Editor/ConstructorEscenas.cs` — el generador existente; de acá
  salen `RUTA_ESCENAS`, `RUTA_MATS`, la firma de `ConstruirTodo()` y el
  registro de Build Settings (`:40-41`).
- `Assets/RR/Runtime/Core/Juego.cs:217-230` — `NombreEscena(id)` y el mapeo
  `smolny→ActoI_Smolny`, `vyborg→ActoII_Vyborg`, `palacio→ActoIII_Palacio`.
- `docs/architecture.md` §4 — contrato del Editor del proyecto.
- `AGENTS.md` — contrato del circuito supervisado.
