using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.AI;
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
    const string RUTA_PERSONAJE = "Assets/RR/Runtime/Personaje";

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
        AsegurarCarpeta(RUTA_PERSONAJE);

        var controladorVerushka = CrearControladorVerushka();

        var rutas = new List<string> { ConstruirTitulo() };
        foreach (var esc in contenido.escenarios)
            rutas.Add(Construir(esc, controladorVerushka));

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

    static string Construir(Escenario esc, AnimatorController controladorPersonaje) {
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
        // Caminable para el bake de NavMesh: el flag deja el Piso como
        // "Walkable" en la ventana Navigation del Editor (lo pide la
        // asignación); el runtime no depende de él porque
        // ControladorVerushka pasa el Piso directo a CollectSources.
#pragma warning disable CS0618 // NavigationStatic deprecado en favor de
        // NavMeshBuildMarkup: es justo el equivalente legacy que la story pide.
        GameObjectUtility.SetStaticEditorFlags(piso, StaticEditorFlags.NavigationStatic);
#pragma warning restore CS0618

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
                    // Cuelga del hotspot, no del contenedor: Juego aplica la
                    // visibilidad por flag con SetActive sobre el hotspot, y
                    // como hermano el sprite quedaba visible con el hotspot
                    // apagado (personajes a la vista antes de cumplir la flag,
                    // y sin collider porque el collider vive en la cápsula).
                    sprite.transform.SetParent(go.transform, false);
                    sprite.transform.localPosition = Vector3.zero;
                    // Compensa la escala del padre (la cápsula usa alto*0.5)
                    // para que el quad mida ancho x alto en el mundo. El Quad
                    // ya mira hacia -Z, igual que el telón de fondo (sin rotar).
                    var escalaPadre = go.transform.localScale;
                    sprite.transform.localScale = new Vector3(
                        h.ancho / escalaPadre.x, h.alto / escalaPadre.y, 1f / escalaPadre.z);

                    var shSprite = Shader.Find("Unlit/Transparent") ?? Shader.Find("Unlit/Texture");
                    var matSprite = MaterialConTextura($"{RUTA_MATS}/M_Personaje_{h.id}.mat", shSprite, texPersona);
                    sprite.GetComponent<Renderer>().sharedMaterial = matSprite;
                }
            }
        }

        // ── Verushka (story 004: personaje jugable) ──────────────────
        ConstruirVerushka(esc, raiz, piso, controladorPersonaje);

        // ── controlador ────────────────────────────────────────────
        var juegoGO = new GameObject("Juego");
        juegoGO.transform.SetParent(raiz.transform);
        juegoGO.AddComponent<Juego>().idEscenario = esc.id;

        var ruta = $"{RUTA_ESCENAS}/{Juego.NombreEscena(esc.id)}.unity";
        EditorSceneManager.SaveScene(escena, ruta);
        return ruta;
    }

    // ── Verushka: personaje jugable (story 004) ───────────────────
    // Cápsula de bloqueo con el rojo constructivista del HUD (M_c8102e),
    // como placeholder adentro de la estética, igual que los hotspots son
    // cubos/cápsulas. El bake de NavMesh NO se hace acá: lo hace
    // ControladorVerushka en Awake sobre el Piso (justificación completa en
    // implementation.md); la verificación headless sin abrir el Editor a
    // mano es Revolución → Verificar NavMesh horneable.
    static void ConstruirVerushka(Escenario esc, GameObject raiz, GameObject piso,
                                  AnimatorController controlador) {
        // Aparece en la banda frontal del escenario (la que ve la cámara),
        // dentro de los límites de scroll de CamaraLateral (x de -10 a
        // ancho-14), en el tercio izquierdo: clickear un hotspot de la
        // derecha se ve caminar, y el spawn queda sobre el NavMesh del Piso.
        float x = Mathf.Clamp(-10f + esc.ancho * 0.25f, -9f, esc.ancho - 15f);
        float z = Mathf.Min(esc.fondo * 0.25f, 4.5f);

        var go = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        go.name = "Verushka";
        go.transform.SetParent(raiz.transform);
        go.transform.localScale = new Vector3(0.5f, 0.9f, 0.5f);   // cápsula base de 2m -> 1.8m de alto
        go.transform.position = new Vector3(x, 0.9f, z);
        Pintar(go, "#c8102e");
        // Sin collider propio: el Physics.Raycast de Juego golpearía la
        // cápsula de Verushka antes que al hotspot que está detrás (capa
        // default, sin filtrar). El NavMeshAgent no necesita collider.
        Object.DestroyImmediate(go.GetComponent<Collider>());

        var agente = go.AddComponent<NavMeshAgent>();
        // Escala de las escenas (ancho 34-44 m, banda jugable z<=10): con
        // speed 2.6 un cruce completo tarda ~13 s y el paseo típico hotspot a
        // hotspot 1-3 s (el default 3.5 no deja VER caminar; riesgo de la
        // asignación: no hay valor documentado, va anotado en
        // implementation.md). baseOffset = mitad de la altura del primitivo:
        // el pivote de la cápsula es su centro, si fuera 0 el agente clavara
        // el centro en el piso y Verushka caminara enterrada hasta la cintura.
        agente.speed = 2.6f;
        agente.angularSpeed = 360f;
        agente.acceleration = 8f;
        agente.radius = 0.25f;
        agente.height = 1.8f;
        agente.baseOffset = 0.9f;
        agente.stoppingDistance = 0.35f;
        agente.autoBraking = true;
        agente.enabled = false;     // ControladorVerushka lo activa tras hornear el NavMesh

        var anim = go.AddComponent<Animator>();
        anim.runtimeAnimatorController = controlador;

        var ctrl = go.AddComponent<RR.ControladorVerushka>();
        ctrl.piso = piso;
        ctrl.puntoAparicion = go.transform;
    }

    // ── animación placeholder: Idle / Caminar ─────────────────────
    // Dos estados cableados con el bool "caminando" (transiciones sin exit
    // time, para que el cambio se vea inmediato). No hay clips de arte: el
    // paso rebota el alto de la cápsula entre 0.87 y 0.93 (ciclo 0.5 s) y el
    // idle respira entre 0.89 y 0.91 (ciclo 1 s).
    // Ojo: las curvas son ABSOLUTAS y sólo tocan m_LocalScale.y — a
    // propósito. El NavMeshAgent escribe posición y rotación del transform en
    // cada update; un clip que animara euler o posición pelearía con el
    // agente (Verushka no giraría al caminar). Con sólo el alto animado el
    // paso/idle se ven sin pisar el movimiento, y la asignación lo permite
    // explícitamente ("escala entre estados... alcanza").
    static AnimatorController CrearControladorVerushka() {
        const string rutaCtrl = RUTA_PERSONAJE + "/AC_Verushka.controller";
        const string rutaIdle = RUTA_PERSONAJE + "/Clip_IdleVerushka.anim";
        const string rutaPaso = RUTA_PERSONAJE + "/Clip_PasoVerushka.anim";

        var controlador = AssetDatabase.LoadAssetAtPath<AnimatorController>(rutaCtrl);
        var idle = AssetDatabase.LoadAssetAtPath<AnimationClip>(rutaIdle);
        var paso = AssetDatabase.LoadAssetAtPath<AnimationClip>(rutaPaso);

        if (controlador == null || idle == null || paso == null) {
            if (controlador == null) {
                controlador = AnimatorController.CreateAnimatorControllerAtPath(rutaCtrl);
                controlador.AddParameter("caminando", AnimatorControllerParameterType.Bool);

                var maquina = controlador.layers[0].stateMachine;
                idle = new AnimationClip { name = "Idle" };
                AssetDatabase.CreateAsset(idle, rutaIdle);
                paso = new AnimationClip { name = "Caminar" };
                AssetDatabase.CreateAsset(paso, rutaPaso);

                var eIdle = maquina.AddState("Idle", new Vector2(300f, 0f));
                var ePaso = maquina.AddState("Caminar", new Vector2(300f, 150f));
                eIdle.motion = idle;
                ePaso.motion = paso;
                maquina.defaultState = eIdle;

                var ida = eIdle.AddTransition(ePaso);
                ida.hasExitTime = false;
                ida.duration = 0.1f;
                ida.AddCondition(AnimatorConditionMode.If, 0f, "caminando");

                var vuelta = ePaso.AddTransition(eIdle);
                vuelta.hasExitTime = false;
                vuelta.duration = 0.1f;
                vuelta.AddCondition(AnimatorConditionMode.IfNot, 0f, "caminando");

                EditorUtility.SetDirty(controlador);
            } else {
                Debug.LogWarning("[RR] AC_Verushka.controller existe pero faltan los clips: "
                    + "borrá la carpeta Assets/RR/Runtime/Personaje y reconstruí las escenas.");
                return controlador;
            }
        }

        RellenarClips(idle, paso);
        return controlador;
    }

    static void RellenarClips(AnimationClip idle, AnimationClip paso) {
        // Idle: respiración ±0.01 en el alto de la cápsula (loop 1 s).
        idle.SetCurve("", typeof(Transform), "m_LocalScale.y",
                      CurvaLoop(new Keyframe(0f, 0.89f), new Keyframe(0.5f, 0.91f),
                                new Keyframe(1f, 0.89f)));
        idle.frameRate = 30f;
        // (length se deriva de las curvas: llegan hasta 1 s)
        Loop(idle);

        // Caminar: rebote de paso, ciclo 0.5 s, alto entre 0.87 y 0.93.
        paso.SetCurve("", typeof(Transform), "m_LocalScale.y",
                      CurvaLoop(new Keyframe(0f, 0.87f), new Keyframe(0.125f, 0.93f),
                                new Keyframe(0.25f, 0.87f), new Keyframe(0.375f, 0.93f),
                                new Keyframe(0.5f, 0.87f)));
        paso.frameRate = 30f;
        // (length se deriva de las curvas: llegan hasta 0.5 s)
        Loop(paso);
    }

    // Crea la carpeta de assets si falta (AssetDatabase, no Directory, para
    // que Unity le genere el .meta y no quede huérfana en la próxima refresh).
    static void AsegurarCarpeta(string ruta) {
        if (!AssetDatabase.IsValidFolder(ruta)) {
            var padre = ruta.Substring(0, ruta.LastIndexOf('/'));
            var nombre = ruta.Substring(ruta.LastIndexOf('/') + 1);
            AssetDatabase.CreateFolder(padre, nombre);
        }
    }

    static AnimationCurve CurvaLoop(params Keyframe[] keys) {
        var c = new AnimationCurve(keys);
        c.preWrapMode = WrapMode.Loop;
        c.postWrapMode = WrapMode.Loop;
        return c;
    }

    static void Loop(AnimationClip clip) {
        var ajustes = AnimationUtility.GetAnimationClipSettings(clip);
        ajustes.loopTime = true;
        AnimationUtility.SetAnimationClipSettings(clip, ajustes);
        EditorUtility.SetDirty(clip);
    }

    // Verificación headless del bake (CA1/CA6): el horneado vive en
    // ControladorVerushka.Awake, que en edit mode NO corre; por eso esta
    // entrada abre cada escena, le pide al propio componente que hornee
    // (HorrearModoEdicion) y le pregunta si el NavMesh quedó listo, sin
    // dejar capas ni datos colgados en el mundo del Editor. Se puede correr
    // sin interfaz:
    //   Unity -batchmode -nographics -quit -projectPath . -executeMethod \
    //     RR.EditorTools.ConstructorEscenas.VerificarNavMeshHorneable
    // (o a través del CLI: unity build --execute-method …; el CLI reenvía
    //  --execute-method al editor como -executeMethod).
    [MenuItem("Revolución/Verificar NavMesh horneable", priority = 10)]
    public static void VerificarNavMeshHorneable() {
        int ok = 0;
        foreach (var ruta in new[] {
            $"{RUTA_ESCENAS}/ActoI_Smolny.unity",
            $"{RUTA_ESCENAS}/ActoII_Vyborg.unity",
            $"{RUTA_ESCENAS}/ActoIII_Palacio.unity" }) {

            var escena = EditorSceneManager.OpenScene(ruta, OpenSceneMode.Single);
            var verushka = UnityEngine.Object.FindFirstObjectByType<RR.ControladorVerushka>();
            bool hornedo = verushka != null && verushka.VerificarHorneadoEnEditor();
            if (hornedo) ok++;
            Debug.Log($"[RR] NavMesh {ruta}: {(hornedo ? "OK" : "FALLA")}");
            EditorSceneManager.CloseScene(escena, true);
        }
        Debug.Log($"[RR] Verificación NavMesh: {ok}/3 escenas hornearon.");
    }

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
