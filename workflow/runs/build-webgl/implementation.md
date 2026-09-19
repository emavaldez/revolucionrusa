# implementation.md — build-webgl

Objetivo: `unity build --target WebGL --execute-method RR.ConstructorBuild.BuildWebGL
-o Builds/WebGL` funcional. Un archivo nuevo y nada más.

## Archivos

- **Nuevo**: `Assets/RR/Editor/ConstructorBuild.cs` (152 líneas). `namespace RR`,
  `public static class ConstructorBuild`, `public static void BuildWebGL()`.
- Sin cambios en ningún archivo existente. `Assets/RR/Editor/ConstructorEscenas.cs`
  no se tocó (se lo llama, no se lo modifica).

## Cómo quedó

1. `RutaSalida()` busca `-buildOutput` en `Environment.GetCommandLineArgs()` y toma
   el argumento siguiente. Si es relativo lo resuelve contra
   `Directory.GetParent(Application.dataPath).FullName`; crea el directorio.
   Si el argumento no está, `Debug.LogError` con cómo pasarlo + `EditorApplication.Exit(1)`.
2. `PrepararEscenas()`: si falta alguna de las 3 escenas en disco llama a
   `ConstructorEscenas.ConstruirTodo()` (guard: sólo si faltan); si después siguen
   faltando, error claro + `Exit(1)`; si `EditorBuildSettings.scenes` ya tiene las 3
   en orden y `enabled`, no la reescribe; si no, la asigna y `AssetDatabase.SaveAssets()`.
3. `BuildPipeline.BuildPlayer` con `scenes` = las 3 rutas (`Juego.NombreEscena(acto)`),
   `locationPathName` = valor del argumento, `target` = `BuildTarget.WebGL`,
   `options` = `BuildOptions.None`. Loguea `summary.result` y `totalSize` en MB, y
   `EditorApplication.Exit(0)` si `Succeeded`, `EditorApplication.Exit(1)` si no.
4. Idempotente: el guard de escenas evita re-correr `ConstruirTodo()` y Build Settings
   no se reescribe si ya coincide.

Sólo WebGL: no se toca `ProjectSettings/`, no se crean build profiles, no se cambia
ninguna otra plataforma.

### Cosas que agregué además de la letra de la asignación (para la auditoría)

- `try/catch` alrededor de `BuildPlayer` y guard de `reporte == null`, ambos con
  `Exit(1)`: refuerzan R4 (que el CLI no cante éxito) si `BuildPlayer` tira excepción
  en vez de devolver un reporte fallado.
- `CoincidenBuildSettings()` compara `path` **y** `enabled` de cada entrada, para que
  una escena deshabilitada también cuente como "no coincide".
- Lista de actos como `IDS_ACTOS = { "smolny", "vyborg", "palacio" }` mapeada por
  `Juego.NombreEscena`. Es el mismo orden que `escenarios` en
  `Contenido/contenido.json` (verificado: smolny, vyborg, palacio), así que el orden
  de Build Settings coincide con el que produce `ConstruirTodo()`.

## Evidencia

### Compilación real (no pedida por la asignación: R1 decía que no se podía)

La `Library/` del worktree no existe, pero Unity trae Roslyn y las reference
assemblies, así que compilé todo `Assets/RR/**/*.cs` contra las DLLs del editor
instalado (`6000.3.24f1`), sin abrir el proyecto y sin escribir nada dentro del
worktree (salida a `/tmp`):

```sh
S=/Applications/Unity/Hub/Editor/6000.3.24f1/Unity.app/Contents/Resources/Scripting
REFS=""
for d in "$S/NetStandard/compat/2.1.0/shims/netfx"/*.dll \
         "$S/NetStandard/compat/2.1.0/shims/netstandard"/*.dll; do REFS="$REFS -r:$d"; done
REFS="$REFS -r:$S/NetStandard/ref/2.1.0/netstandard.dll \
      -r:$S/Managed/UnityEngine.dll -r:$S/Managed/UnityEditor.dll"
for d in "$S/Managed/UnityEngine"/*.dll; do REFS="$REFS -r:$d"; done
"$S/NetCoreRuntime/dotnet" exec "$S/DotNetSdkRoslyn/csc.dll" -nologo -nostdlib+ -noconfig \
  -langversion:latest -target:library -out:/tmp/RR.dll \
  -define:UNITY_EDITOR -define:UNITY_STANDALONE -define:UNITY_64 \
  $REFS $(find Assets/RR -name '*.cs' | sort)
```

Salida: **vacía (0 errores, 0 warnings)**, `RR.dll` de 35840 bytes. Compiló junto con
`ConstructorEscenas.cs`, `Juego.cs`, `Estado.cs`, `Modelo.cs`, `HUD.cs`,
`CamaraLateral.cs` y `HotspotBehaviour.cs`.

Esto no es un sustituto de CA7 (el build real corre post-merge, con el módulo WebGL),
pero descarta que el archivo nuevo rompa la compilación del assembly de Editor.

### Criterios de aceptación

- **CA1** — `grep -n 'namespace RR\|public static class ConstructorBuild\|public static void BuildWebGL' Assets/RR/Editor/ConstructorBuild.cs`
  ```
  9:namespace RR {
  20:public static class ConstructorBuild {
  29:    public static void BuildWebGL() {
  ```
- **CA2** — `grep -n 'BuildPipeline\|BuildTarget.WebGL\|GetCommandLineArgs\|"-buildOutput"' ...`
  ```
  23:    const string ARG_SALIDA   = "-buildOutput";
  48:            target            = BuildTarget.WebGL,
  54:            reporte = BuildPipeline.BuildPlayer(opciones);
  62:            Debug.LogError("[RR] BuildPipeline.BuildPlayer no devolvió reporte: no hay build.");
  88:        var args = Environment.GetCommandLineArgs();
  ```
- **CA3** — ruta de salida no hardcodeada. Snippet exacto (líneas 45-50):
  ```csharp
  var opciones = new BuildPlayerOptions {
      scenes            = RutasEscenas(),
      locationPathName  = salida,        // del argumento; no se hardcodea
      target            = BuildTarget.WebGL,
      options           = BuildOptions.None,
  };
  ```
  `salida` es el valor devuelto por `RutaSalida()`, que sale de
  `args[i + 1]` cuando `args[i] == "-buildOutput"`. No hay ninguna ruta literal de
  salida en esa asignación (`grep -n 'locationPathName' …` → una sola línea, la 47).
  Confirmado además contra el CLI real: `unity build --help` dice que
  `-o, --output-path <path>` se reenvía al editor como `-buildOutput` con
  `--execute-method`.
- **CA4** — `grep -n 'ConstruirTodo()\|EditorBuildSettings.scenes' …`
  ```
  112:            ConstructorEscenas.ConstruirTodo();
  134:        EditorBuildSettings.scenes = rutas
  145:        var actuales = EditorBuildSettings.scenes;
  ```
- **CA5** — `git diff main...task/build-webgl --name-only` →
  ```
  Assets/RR/Editor/ConstructorBuild.cs
  ```
  (1 file changed, 152 insertions)
- **CA6** — `wf verify -i build-webgl` (corrido con cwd = worktree, sobre el HEAD de
  la rama `task/build-webgl`):
  ```
  OK    alcance         0.0s  @alcance
  —     lint            0.0s
  —     tests           0.0s
  —     simulacion      0.0s

  VERIFICACIÓN EN VERDE
  ```
  `alcance` OK (archivos tocados: `Assets/RR/Editor/ConstructorBuild.cs` y
  `workflow/runs/build-webgl/state.json`); `lint`/`tests`/`simulacion` quedan en
  `skipped` porque `workflow/config.json` no les define comando.
- **CA7** — no la corrí: es post-merge, con el módulo WebGL instalado, por el
  supervisor. No abrí el editor en el worktree (fuera de alcance).

## Riesgos y hallazgos (no corregidos, según la asignación)

- **R1 confirmado**: no hay `Library/` en el worktree ni módulo WebGL, así que no hay
  build funcional acá. Suplido parcialmente con la compilación de arriba.
- **R2 confirmado (reportado, no corregido)**: `ConstructorEscenas.Pintar()` usa
  `AssetDatabase.CreateAsset` para `M_Fondo_<id>.mat` sin chequear si ya existe
  (`ConstructorEscenas.cs:185`), así que una segunda corrida de `ConstruirTodo()`
  puede loguear error de asset existente. Por eso el guard de este método es
  "sólo si faltan las escenas en disco". No lo toqué: está fuera de alcance.
- **R3**: en batchmode `EditorUtility.DisplayDialog` (`ConstructorEscenas.cs:22-25`)
  no bloquea ni avisa; si falta `Assets/StreamingAssets/contenido.json`,
  `ConstruirTodo()` sale sin construir. Cubierto por el chequeo posterior: si sigue
  faltando alguna escena, el método loguea error y sale con 1. En el worktree el
  contenido existe (`Assets/StreamingAssets/contenido.json` presente).
- **Fuera de esta tarea**: `wf validate` reporta 4 ERRORes preexistentes por archivos
  que `wf init` no dejó (`workflow/task-state.schema.json`,
  `workflow/templates/{assignment,implementation,audit}.md`). No lo toqué.
- No hay tests automatizados ni linter configurados para C# en el repo: los gates
  `lint`/`tests`/`simulacion` del preset `app-local` están sin comando.

## Lo que NO hice

- No modifiqué `Assets/RR/Editor/ConstructorEscenas.cs` ni ningún otro archivo existente.
- No generé ni commiteé `Assets/RR/Escenas/` ni `Assets/RR/Materiales/`.
- No abrí el editor (ni batchmode) en el worktree: no hay `Library/` ni artefactos.
- No toqué `ProjectSettings/`, `contenido.json`, StreamingAssets, `audit.md`,
  los campos de aprobación de `state.json`, ni hice merge.
