using System;
using UnityEngine;
using UnityEngine.AI;

namespace RR {

// Verushka jugable (story 004). Dos responsabilidades:
//
// 1) Hornear el NavMesh de la escena. Usa el sistema legacy
//    (UnityEngine.AI.NavMeshBuilder + NavMesh.AddNavMeshData), no
//    NavMeshSurface: com.unity.ai.navigation no esta en
//    Packages/manifest.json y la asignacion solo lo permitia si hacia
//    falta - no hace falta. El bake ocurre aca, en Awake, sobre la
//    geometria del Piso (referencia cableada por ConstructorEscenas), asi
//    "Revolucion -> Construir las tres escenas" queda reproducible de punta
//    a punta sin paso manual en el Editor y sin artefactos de NavMesh en
//    git. El NavMeshData es por escena (los Pisos miden distinto), por eso
//    se hornea en cada carga y se saca del mundo al desactivarse; el
//    horneado toma decenas de ms en estas escenas simples (el piso es un
//    cubo: un quad por cara).
//
// 2) Caminar hacia un punto y recien ahi invocar la accion pendiente.
//    Juego llama CaminarHacia(destino, Interactuar) al clickear un hotspot;
//    si el jugador clickea otro hotspot mientras camina, el destino anterior
//    se cancela y se redirige (no se encolan caminatas). Mientras camino, el
//    Animator recibe el bool "caminando" para las transiciones Idle/Caminar
//    (controlador generado por ConstructorEscenas en
//    Assets/RR/Runtime/Personaje/AC_Verushka.controller; si el controlador
//    no esta o no tiene el parametro, el movimiento igual funciona).
//
// Sin NavMesh disponible (escena vieja sin el cableado), CaminarHacia
// degrada a la conducta anterior: dispara la accion en el sitio en vez de
// romper el juego.
public class ControladorVerushka : MonoBehaviour {

    public GameObject piso;             // el "Piso" de la escena (serializado por el constructor)
    public Transform puntoAparicion;    // donde arranca Verushka, sobre el piso

    const string PARAM_CAMINANDO = "caminando";
    const float RADIO_BUSA = 3f;        // tolerancia para pegar un destino al NavMesh
    readonly Vector3[] puntosControl = new Vector3[4];

    NavMeshAgent agente;
    Animator animador;
    NavMeshDataInstance capaNavMesh = default;
    NavMeshData datosNavMesh;           // lo horneamos nosotros; es de esta escena

    Action alLlegar;                    // interaccion pendiente
    bool camino;

    public bool Caminando => camino;
    public bool NavMeshListo => capaNavMesh.valid;

    void Awake() {
        agente = GetComponent<NavMeshAgent>();
        animador = GetComponent<Animator>();

        // En la escena generada el NavMeshAgent viene desactivado: sin
        // NavMesh todavia, activarlo loguearia errores de pathfinding.
        // Primero se hornea, despues se warpea al piso navmeado.
        if (agente != null) agente.enabled = false;

        datosNavMesh = Hornear(out var superficie);
        if (datosNavMesh != null) {
            capaNavMesh = NavMesh.AddNavMeshData(datosNavMesh);
            VerificarConectividad(superficie);

            if (agente != null) {
                agente.enabled = true;
                var spawn = puntoAparicion != null ? puntoAparicion.position
                            : transform.position;
                NavMeshHit golpe;
                if (NavMesh.SamplePosition(spawn, out golpe, RADIO_BUSA, NavMesh.AllAreas))
                    agente.Warp(golpe.position);
            }
        }
    }

    void OnDisable() {
        // Soltar la accion pendiente y nuestra capa del mundo global de
        // NavMesh (se re-agrega al re-activarse, sobre los mismos datos).
        Cancelar();
        if (capaNavMesh.valid) capaNavMesh.Remove();
        capaNavMesh = default;
    }

    void OnDestroy() {
        if (capaNavMesh.valid) capaNavMesh.Remove();
        capaNavMesh = default;
        if (datosNavMesh != null) {
            Destroy(datosNavMesh);
            datosNavMesh = null;
        }
    }

    // Hornea el Piso y devuelve los datos (null si fallo). Compartida entre
    // Awake (runtime) y VerificarHorneadoEnEditor (verificacion headless del
    // menu Revolucion, que en edit mode Awake no corre).
    NavMeshData Hornear(out Bounds bounds) {
        bounds = default;
        if (piso == null) {
            Debug.LogWarning("[RR] ControladorVerushka: sin referencia al Piso; "
                + "Verushka no camina (las interacciones disparan en el sitio). "
                + "Regenera las escenas con Revolucion -> Construir las tres escenas.");
            return null;
        }

        var fuentes = new System.Collections.Generic.List<NavMeshBuildSource>();
        NavMeshBuilder.CollectSources(piso.transform, ~0,
            NavMeshCollectGeometry.RenderMeshes, 0,
            new System.Collections.Generic.List<NavMeshBuildMarkup>(), fuentes);
        if (fuentes.Count == 0) {
            Debug.LogError("[RR] ControladorVerushka: el Piso no aporto geometria al bake.");
            return null;
        }

        var rend = piso.GetComponent<Renderer>();
        var centro = rend != null ? rend.bounds.center : piso.transform.position;
        var tamano = rend != null ? rend.bounds.size * 1.5f : new Vector3(64f, 2f, 32f);
        bounds = new Bounds(centro, tamano);

        // Ajustes del agente humano por defecto, pisando radio/altura con los
        // del NavMeshAgent de la escena. voxelSize fijo y chico: el piso es un
        // cubo (un quad por cara); un voxel relativo a los bounds lo dejaria
        // en un solo voxel y no hornearia nada.
        var ajustes = NavMesh.GetSettingsByID(0);
        if (agente != null) {
            ajustes.agentRadius = agente.radius;
            ajustes.agentHeight = agente.height;
        }
        ajustes.overrideVoxelSize = true;
        ajustes.voxelSize = 0.15f;
        ajustes.overrideTileSize = true;
        ajustes.tileSize = 64;

        var datos = NavMeshBuilder.BuildNavMeshData(ajustes, fuentes, bounds,
            Vector3.zero, Quaternion.identity);
        if (datos == null)
            Debug.LogError("[RR] ControladorVerushka: el bake de NavMesh no produjo datos.");
        return datos;
    }

    // Chequeo de sanidad post-bake: si el punto de aparicion y puntos
    // representativos del piso no muestrean NavMesh, algo se horneo mal y
    // queda logueado como error (verificable headless via batchmode).
    void VerificarConectividad(Bounds bounds) {
        NavMeshHit golpe;
        var spawn = puntoAparicion != null ? puntoAparicion.position : transform.position;
        if (!NavMesh.SamplePosition(spawn, out golpe, RADIO_BUSA, NavMesh.AllAreas)) {
            Debug.LogError($"[RR] Verushka: sin NavMesh en el punto de aparicion {spawn}.");
            return;
        }
        puntosControl[0] = bounds.center;
        puntosControl[1] = new Vector3(bounds.min.x + 2f, bounds.min.y, bounds.min.z + 2f);
        puntosControl[2] = new Vector3(bounds.max.x - 2f, bounds.min.y, bounds.min.z + 2f);
        puntosControl[3] = new Vector3(bounds.max.x - 2f, bounds.min.y, bounds.max.z - 2f);
        for (int i = 0; i < puntosControl.Length; i++) {
            if (!NavMesh.SamplePosition(puntosControl[i], out golpe, RADIO_BUSA, NavMesh.AllAreas)) {
                Debug.LogError($"[RR] Verushka: sin NavMesh cerca de {puntosControl[i]} "
                    + "(verificacion post-bake).");
                return;
            }
        }
        var tam = piso.GetComponent<Renderer>() != null
            ? piso.GetComponent<Renderer>().bounds.size.ToString() : "?";
        Debug.Log($"[RR] NavMesh horneado sobre el Piso: conectividad OK (piso {tam}).");
    }

    // Version edit-mode de la verificacion: hornear, preguntar por el mundo
    // de NavMesh, y limpiar (capa y datos) sin dejar nada colgado. Usada por
    // Revolucion -> Verificar NavMesh horneable / batchmode -executeMethod.
    public bool VerificarHorneadoEnEditor() {
        var datos = Hornear(out var bounds);
        if (datos == null) return false;

        var capa = NavMesh.AddNavMeshData(datos);
        NavMeshHit golpe;
        var spawn = puntoAparicion != null ? puntoAparicion.position : transform.position;
        bool ok = capa.valid && NavMesh.SamplePosition(spawn, out golpe, RADIO_BUSA, NavMesh.AllAreas);
        if (ok) ok = NavMesh.SamplePosition(bounds.center, out golpe, RADIO_BUSA, NavMesh.AllAreas);
        capa.Remove();
        Destroy(datos);
        return ok;
    }

    void Update() {
        if (!camino) return;

        if (agente == null || !agente.enabled || !capaNavMesh.valid) {
            var accion = alLlegar;
            Cancelar();
            accion?.Invoke();
            return;
        }

        if (YaLlegue()) Llegar();
    }

    bool YaLlegue() {
        // Llega cuando el path se resolvio y no queda camino (o el destino era
        // inalcanzable y el camino termino antes: se da por llegada igual, el
        // juego no se traba).
        if (agente.pathPending) return false;
        return !agente.hasPath ||
               agente.remainingDistance <= agente.stoppingDistance + 0.05f;
    }

    public void CaminarHacia(Vector3 destino, Action accion) {
        if (agente == null || !agente.enabled || !capaNavMesh.valid) {
            DetenerCaminata();
            alLlegar = null;
            accion?.Invoke();     // degradacion: sin NavMesh, interactua en el sitio
            return;
        }

        NavMeshHit golpe;
        if (NavMesh.SamplePosition(destino, out golpe, RADIO_BUSA, NavMesh.AllAreas))
            destino = golpe.position;

        alLlegar = accion;         // un segundo clic reemplaza el pendiente: no se encola
        camino = true;
        if (animador != null && animador.enabled && AnimadorTieneParametro())
            animador.SetBool(PARAM_CAMINANDO, true);

        // No se comprueba la llegada en este mismo frame: recien SetDestination,
        // pathPending puede dar false y hasPath false (el agente calcula el
        // path en su propio update) y eso se leeria como "ya llego",
        // disparando la interaccion instantanea - justo lo que esta story viene
        // a eliminar. Update() decide la llegada desde el frame siguiente.
        agente.SetDestination(destino);
    }

    public void Cancelar() {
        alLlegar = null;
        DetenerCaminata();
    }

    void Llegar() {
        var accion = alLlegar;
        Cancelar();
        accion?.Invoke();
    }

    void DetenerCaminata() {
        camino = false;
        if (agente != null && agente.enabled) agente.ResetPath();
        if (animador != null && animador.enabled && AnimadorTieneParametro())
            animador.SetBool(PARAM_CAMINANDO, false);
    }

    bool AnimadorTieneParametro() {
        var p = animador.parameters;
        if (p == null) return false;
        for (int i = 0; i < p.Length; i++)
            if (p[i].name == PARAM_CAMINANDO) return true;
        return false;
    }
}
}
