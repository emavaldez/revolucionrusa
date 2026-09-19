using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace RR.EditorTools {

// Construye las tres escenas a partir de Contenido/contenido.json, más una
// pantalla de título. Geometría de bloqueo: sirve para jugar y para
// ubicarse, y se reemplaza por arte sin tocar el contenido. Volver a
// correrlo regenera todo.
public static class ConstructorEscenas {

    const string RUTA_ESCENAS = "Assets/RR/Escenas";
    const string RUTA_MATS    = "Assets/RR/Materiales";
    const string RUTA_ARTE    = "Assets/RR/Arte";

    [MenuItem("Revolución/Construir las tres escenas", priority = 0)]
    public static void ConstruirTodo() {
        var json = Path.Combine(Application.streamingAssetsPath, "contenido.json");
        if (!File.Exists(json)) {
            EditorUtility.DisplayDialog("Falta el contenido",
                $"No encuentro {json}.\nCopiá Contenido/contenido.json a StreamingAssets.", "Ok");
            return;
        }

        var contenido = JsonUtility.FromJson<Contenido>(File.ReadAllText(json));
        Directory.CreateDirectory(RUTA_ESCENAS);
        Directory.CreateDirectory(RUTA_MATS);
        Directory.CreateDirectory(RUTA_ARTE);

        var rutas = new List<string> { ConstruirTitulo() };
        foreach (var esc in contenido.escenarios)
            rutas.Add(Construir(esc));

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();

        EditorBuildSettings.scenes = rutas
            .Select(r => new EditorBuildSettingsScene(r, true)).ToArray();

        Debug.Log($"[RR] {rutas.Count} escenas construidas:\n  " + string.Join("\n  ", rutas));
    }

    // ── pantalla de título ────────────────────────────────────────
    // Mínima a propósito: logo (o el fondo que haya en Arte/titulo.png)
    // y un botón. Sin esto el juego arrancaba directo en Smolny sin
    // ninguna instrucción de cómo se juega.
    static string ConstruirTitulo() {
        var escena = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var raiz = new GameObject("— Título —");

        var camGO = new GameObject("Camara");
        camGO.tag = "MainCamera";
        camGO.transform.SetParent(raiz.transform);
        var cam = camGO.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = Color.black;
        camGO.AddComponent<AudioListener>();

        var menuGO = new GameObject("Menu");
        menuGO.transform.SetParent(raiz.transform);
        var menu = menuGO.AddComponent<RR.MenuInicio>();
        menu.fondo = AssetDatabase.LoadAssetAtPath<Texture2D>($"{RUTA_ARTE}/titulo.png");
        menu.logo  = AssetDatabase.LoadAssetAtPath<Texture2D>($"{RUTA_ARTE}/logo_verushka.png");

        var ruta = $"{RUTA_ESCENAS}/Titulo.unity";
        EditorSceneManager.SaveScene(escena, ruta);
        return ruta;
    }

    static string Construir(Escenario esc) {
        var escena = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        bool interior = esc.alturaTecho > 0.1f;

        // ── raíz ───────────────────────────────────────────────────
        var raiz = new GameObject($"— {esc.nombre} —");

        // ── piso ───────────────────────────────────────────────────
        var piso = GameObject.CreatePrimitive(PrimitiveType.Cube);
        piso.name = "Piso";
        piso.transform.SetParent(raiz.transform);
        piso.transform.position = new Vector3(esc.ancho * 0.5f - 12f, -0.25f, esc.fondo * 0.5f);
        piso.transform.localScale = new Vector3(esc.ancho + 8f, 0.5f, esc.fondo + 6f);
        Pintar(piso, interior ? "#4a4038" : "#2a2c30");

        // ── telón de fondo pintado ─────────────────────────────────
        // Si existe Assets/RR/Arte/fondo_<id>.png, se usa como plano de
        // fondo y se saltea la pared de bloqueo. Reemplazar el arte es
        // reemplazar ese PNG: nada más se entera.
        var rutaFondo = $"{RUTA_ARTE}/fondo_{esc.id}.png";
        var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(rutaFondo);
        bool hayFondo = tex != null;

        if (hayFondo) {
            var telon = GameObject.CreatePrimitive(PrimitiveType.Quad);
            telon.name = "Telon";
            telon.transform.SetParent(raiz.transform);
            float anchoTelon = esc.ancho + 26f;
            float altoTelon = anchoTelon / 3f;               // los PNG son 3:1
            telon.transform.position = new Vector3(esc.ancho * 0.5f - 12f, altoTelon * 0.42f, esc.fondo + 5f);
            telon.transform.localScale = new Vector3(anchoTelon, altoTelon, 1f);
            Object.DestroyImmediate(telon.GetComponent<Collider>());

            var shFondo = Shader.Find("Unlit/Texture") ?? Shader.Find("Standard");
            var matFondo = MaterialConTextura($"{RUTA_MATS}/M_Fondo_{esc.id}.mat", shFondo, tex);
            telon.GetComponent<Renderer>().sharedMaterial = matFondo;
        }

        // ── paredes ────────────────────────────────────────────────
        if (interior && !hayFondo) {
            var fondo = GameObject.CreatePrimitive(PrimitiveType.Cube);
            fondo.name = "ParedFondo";
            fondo.transform.SetParent(raiz.transform);
            fondo.transform.position = new Vector3(esc.ancho * 0.5f - 12f, esc.alturaTecho * 0.5f, esc.fondo + 3f);
            fondo.transform.localScale = new Vector3(esc.ancho + 8f, esc.alturaTecho, 0.5f);
            Pintar(fondo, esc.paleta == "interior_palacio" ? "#6b5540" : "#5a5248");

            // columnas: el Smolny y el Palacio son neoclásicos, van columnas
            int n = Mathf.Max(3, Mathf.RoundToInt(esc.ancho / 7f));
            for (int i = 0; i < n; i++) {
                var col = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                col.name = $"Columna_{i}";
                col.transform.SetParent(raiz.transform);
                float x = -10f + i * (esc.ancho / (n - 1f));
                col.transform.position = new Vector3(x, esc.alturaTecho * 0.5f, esc.fondo + 1.6f);
                col.transform.localScale = new Vector3(0.9f, esc.alturaTecho * 0.5f, 0.9f);
                Pintar(col, esc.paleta == "interior_palacio" ? "#b9a77f" : "#cfc6b4");
                Object.DestroyImmediate(col.GetComponent<Collider>());
            }
        }

        // ── luz ────────────────────────────────────────────────────
        var luz = new GameObject("Luz");
        luz.transform.SetParent(raiz.transform);
        var l = luz.AddComponent<Light>();
        l.type = LightType.Directional;
        if (esc.paleta == "exterior_noche") {
            l.color = new Color(0.62f, 0.70f, 0.88f); l.intensity = 0.55f;
            RenderSettings.ambientLight = new Color(0.16f, 0.18f, 0.24f);
        } else if (esc.paleta == "interior_palacio") {
            l.color = new Color(1.00f, 0.88f, 0.68f); l.intensity = 0.75f;
            RenderSettings.ambientLight = new Color(0.22f, 0.19f, 0.16f);
        } else {
            l.color = new Color(0.98f, 0.92f, 0.80f); l.intensity = 0.85f;
            RenderSettings.ambientLight = new Color(0.26f, 0.24f, 0.22f);
        }
        luz.transform.rotation = Quaternion.Euler(42f, -28f, 0f);

        // ── cámara: plano lateral de aventura gráfica ──────────────
        // Arranca centrada en el primer hotspot visible sin flags (así el
        // jugador ve algo con qué interactuar apenas entra al escenario,
        // en vez de un cuarto vacío que hay que descubrir moviendo el
        // mouse a ciegas).
        var primerVisible = esc.hotspots.FirstOrDefault(h => string.IsNullOrEmpty(h.mostrarSiFlag));
        float xCamaraInicial = primerVisible != null ? primerVisible.x : esc.ancho * 0.5f - 12f;

        var camGO = new GameObject("Camara");
        camGO.tag = "MainCamera";
        camGO.transform.SetParent(raiz.transform);
        var cam = camGO.AddComponent<Camera>();
        cam.fieldOfView = 34f;
        cam.backgroundColor = esc.paleta == "exterior_noche"
            ? new Color(0.06f, 0.07f, 0.10f) : new Color(0.10f, 0.09f, 0.08f);
        cam.clearFlags = CameraClearFlags.SolidColor;
        camGO.AddComponent<AudioListener>();
        camGO.transform.position = new Vector3(xCamaraInicial, 6.5f, -18f);
        camGO.transform.rotation = Quaternion.Euler(12f, 0f, 0f);
        camGO.AddComponent<CamaraLateral>().ancho = esc.ancho;

        // ── hotspots ───────────────────────────────────────────────
        var padre = new GameObject("Hotspots");
        padre.transform.SetParent(raiz.transform);

        foreach (var h in esc.hotspots) {
            var tipo = h.forma == "persona" ? PrimitiveType.Capsule
                     : h.forma == "puerta"  ? PrimitiveType.Cube
                     : PrimitiveType.Cube;
            var go = GameObject.CreatePrimitive(tipo);
            go.name = h.id;
            go.transform.SetParent(padre.transform);
            go.transform.position = new Vector3(h.x, h.y + h.alto * 0.5f, h.z);
            go.transform.localScale = tipo == PrimitiveType.Capsule
                ? new Vector3(h.ancho, h.alto * 0.5f, h.prof)
                : new Vector3(h.ancho, h.alto, h.prof);
            Pintar(go, h.color);

            var hb = go.AddComponent<HotspotBehaviour>();
            hb.datos = h;

            var col = go.GetComponent<Collider>();
            if (col != null) col.isTrigger = false;

            // Arte de personaje: si hay Arte/personajes/<id>.png se usa como
            // sprite billboard y se apaga el renderer de la cápsula de
            // bloqueo (el collider se deja intacto: el click sigue
            // resolviéndose contra ella, nada cambia en Juego.Update()).
            if (h.forma == "persona") {
                var rutaSprite = $"{RUTA_ARTE}/personajes/{h.id}.png";
                var texPersona = AssetDatabase.LoadAssetAtPath<Texture2D>(rutaSprite);
                if (texPersona != null) {
                    var rend = go.GetComponent<Renderer>();
                    if (rend != null) rend.enabled = false;

                    var sprite = GameObject.CreatePrimitive(PrimitiveType.Quad);
                    sprite.name = "Sprite";
                    Object.DestroyImmediate(sprite.GetComponent<Collider>());
                    sprite.transform.SetParent(padre.transform);
                    // Mismo centro que la cápsula; el Quad de Unity ya mira
                    // hacia -Z (lo mismo que usa el telón de fondo, sin
                    // rotar), que es hacia donde está la cámara.
                    sprite.transform.position = go.transform.position;
                    sprite.transform.localScale = new Vector3(h.ancho, h.alto, 1f);

                    var shSprite = Shader.Find("Unlit/Transparent") ?? Shader.Find("Unlit/Texture");
                    var matSprite = MaterialConTextura($"{RUTA_MATS}/M_Personaje_{h.id}.mat", shSprite, texPersona);
                    sprite.GetComponent<Renderer>().sharedMaterial = matSprite;
                }
            }
        }

        // ── controlador ────────────────────────────────────────────
        var juegoGO = new GameObject("Juego");
        juegoGO.transform.SetParent(raiz.transform);
        juegoGO.AddComponent<Juego>().idEscenario = esc.id;

        var ruta = $"{RUTA_ESCENAS}/{Juego.NombreEscena(esc.id)}.unity";
        EditorSceneManager.SaveScene(escena, ruta);
        return ruta;
    }

    // ── materiales ─────────────────────────────────────────────────
    static readonly Dictionary<string, Material> cache = new Dictionary<string, Material>();

    // Crea el material en la ruta dada la primera vez; en corridas
    // posteriores reusa el asset existente y sólo actualiza su textura, en
    // vez de llamar a AssetDatabase.CreateAsset sobre una ruta ocupada (eso
    // generaba un "M_Fondo_smolny 1.mat" duplicado y huérfano cada vez que
    // se reconstruían las escenas).
    static Material MaterialConTextura(string ruta, Shader shader, Texture2D textura) {
        var mat = AssetDatabase.LoadAssetAtPath<Material>(ruta);
        if (mat == null) {
            mat = new Material(shader);
            AssetDatabase.CreateAsset(mat, ruta);
        } else if (mat.shader != shader) {
            mat.shader = shader;
        }
        mat.mainTexture = textura;
        return mat;
    }

    static void Pintar(GameObject go, string hex) {
        if (!cache.TryGetValue(hex, out var mat)) {
            var ruta = $"{RUTA_MATS}/M_{hex.Replace("#", "")}.mat";
            mat = AssetDatabase.LoadAssetAtPath<Material>(ruta);
            if (mat == null) {
                var sh = Shader.Find("Standard") ?? Shader.Find("Universal Render Pipeline/Lit");
                mat = new Material(sh);
                if (ColorUtility.TryParseHtmlString(hex, out var c)) mat.color = c;
                mat.SetFloat("_Glossiness", 0.08f);
                AssetDatabase.CreateAsset(mat, ruta);
            }
            cache[hex] = mat;
        }
        var r = go.GetComponent<Renderer>();
        if (r != null) r.sharedMaterial = mat;
    }

    [MenuItem("Revolución/Copiar contenido a StreamingAssets", priority = 20)]
    public static void CopiarContenido() {
        var origen = "Assets/RR/Contenido/contenido.json";
        var destino = Path.Combine(Application.streamingAssetsPath, "contenido.json");
        Directory.CreateDirectory(Application.streamingAssetsPath);
        File.Copy(origen, destino, true);
        AssetDatabase.Refresh();
        Debug.Log($"[RR] Contenido copiado a {destino}");
    }
}
}
