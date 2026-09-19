using System;
using System.IO;
using System.Linq;
using RR.EditorTools;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace RR {

// Punto de entrada del build WebGL para el CLI de Unity:
//
//   unity build --target WebGL --execute-method RR.ConstructorBuild.BuildWebGL \
//     -o Builds/WebGL
//
// El CLI no tiene build built-in para WebGL: sin --execute-method (o un build
// profile de Unity 6) el comando muere en la validación previa. Esto hace lo
// mínimo: resolver la salida, dejar las tres escenas listas y buildear, con
// código de salida de verdad.
public static class ConstructorBuild {

    const string RUTA_ESCENAS = "Assets/RR/Escenas";
    const string ARG_SALIDA   = "-buildOutput";

    // Los tres actos, en orden. El nombre de archivo sale de Juego.NombreEscena,
    // que es lo mismo que usa ConstructorEscenas para guardarlos.
    static readonly string[] IDS_ACTOS = { "smolny", "vyborg", "palacio" };

    public static void BuildWebGL() {
        var salida = RutaSalida();
        if (salida == null) {
            Debug.LogError(
                $"[RR] Falta la ruta de salida: pasá {ARG_SALIDA} <ruta> " +
                "(el CLI la reenvía desde -o / --output-path).");
            EditorApplication.Exit(1);
            return;
        }
        Directory.CreateDirectory(salida);

        if (!PrepararEscenas()) {
            EditorApplication.Exit(1);
            return;
        }

        var opciones = new BuildPlayerOptions {
            scenes            = RutasEscenas(),
            locationPathName  = salida,        // del argumento; no se hardcodea
            target            = BuildTarget.WebGL,
            options           = BuildOptions.None,
        };

        BuildReport reporte;
        try {
            reporte = BuildPipeline.BuildPlayer(opciones);
        } catch (Exception e) {
            Debug.LogError($"[RR] El build WebGL se cayó: {e.Message}");
            EditorApplication.Exit(1);
            return;
        }

        if (reporte == null) {
            Debug.LogError("[RR] BuildPipeline.BuildPlayer no devolvió reporte: no hay build.");
            EditorApplication.Exit(1);
            return;
        }

        var resumen = reporte.summary;
        Debug.Log($"[RR] Build WebGL {resumen.result}: " +
                  $"{resumen.totalSize / (1024f * 1024f):F1} MB en {resumen.outputPath}");

        if (resumen.result != BuildResult.Succeeded) {
            foreach (var paso in reporte.steps)
                foreach (var m in paso.messages)
                    if (m.type == LogType.Error || m.type == LogType.Exception)
                        Debug.LogError($"[RR] {paso.name}: {m.content}");
        }

        // Sin este exit el CLI puede cantar éxito con un build fallado.
        EditorApplication.Exit(resumen.result == BuildResult.Succeeded ? 0 : 1);
    }

    // ── salida ─────────────────────────────────────────────────────

    // -buildOutput <ruta> lo inyecta el CLI a partir de -o / --output-path. Si
    // la ruta es relativa se resuelve contra la raíz del proyecto: el cwd del
    // editor no es una garantía.
    static string RutaSalida() {
        var args = Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length - 1; i++) {
            if (args[i] != ARG_SALIDA) continue;
            var ruta = args[i + 1];
            if (Path.IsPathRooted(ruta)) return ruta;
            var raiz = Directory.GetParent(Application.dataPath).FullName;
            return Path.GetFullPath(Path.Combine(raiz, ruta));
        }
        return null;
    }

    // ── escenas ────────────────────────────────────────────────────

    // Deja las tres escenas en disco y registradas en Build Settings, en orden.
    static bool PrepararEscenas() {
        var rutas = RutasEscenas();

        // Sólo si faltan: ConstruirTodo() no es idempotente (usa
        // AssetDatabase.CreateAsset sin chequeo previo para M_Fondo_<id>.mat),
        // así que no regeneramos de gusto lo que ya está en disco.
        var faltan = rutas.Where(r => !File.Exists(r)).ToArray();
        if (faltan.Length > 0) {
            Debug.Log($"[RR] Faltan en disco: {string.Join(", ", faltan)}. " +
                      "Las construyo con ConstructorEscenas.ConstruirTodo().");
            ConstructorEscenas.ConstruirTodo();
            AssetDatabase.SaveAssets();
        }

        // Red de seguridad: en batchmode ConstruirTodo() puede salir temprano
        // sin construir (si falta el contenido, por ejemplo), y un build con 0
        // escenas no sirve para nada.
        var ausentes = rutas.Where(r => !File.Exists(r)).ToArray();
        if (ausentes.Length > 0) {
            Debug.LogError(
                "[RR] No puedo buildear: siguen faltando en disco " +
                string.Join(", ", ausentes) +
                ". Revisá que exista Assets/StreamingAssets/contenido.json y corré " +
                "Revolución → Construir las tres escenas.");
            return false;
        }

        if (CoincidenBuildSettings(rutas)) {
            Debug.Log("[RR] Build Settings ya tiene las 3 escenas en orden: no lo toco.");
            return true;
        }

        EditorBuildSettings.scenes = rutas
            .Select(r => new EditorBuildSettingsScene(r, true)).ToArray();
        AssetDatabase.SaveAssets();
        Debug.Log("[RR] Build Settings: " + string.Join(", ", rutas));
        return true;
    }

    static string[] RutasEscenas() =>
        IDS_ACTOS.Select(id => $"{RUTA_ESCENAS}/{Juego.NombreEscena(id)}.unity").ToArray();

    static bool CoincidenBuildSettings(string[] rutas) {
        var actuales = EditorBuildSettings.scenes;
        if (actuales.Length != rutas.Length) return false;
        for (int i = 0; i < rutas.Length; i++)
            if (actuales[i].path != rutas[i] || !actuales[i].enabled) return false;
        return true;
    }
}
}
