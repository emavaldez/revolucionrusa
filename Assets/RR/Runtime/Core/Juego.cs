using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace RR {

public enum Verbo { Mirar, Hablar, Usar }

// Controlador central. Vive en cada escena; el estado sobrevive entre
// escenas en un estático.
public class Juego : MonoBehaviour {

    public static Juego I;
    public static Estado estado = new Estado();
    public static Contenido contenido;

    public string idEscenario = "smolny";

    public Verbo verbo = Verbo.Mirar;
    public string itemEnMano;

    HUD hud;
    Camera cam;
    readonly List<HotspotBehaviour> hotspots = new List<HotspotBehaviour>();

    // diálogo en curso
    Hotspot conversandoCon;
    List<Opcion> opcionesActuales = new List<Opcion>();

    // duelo en curso
    Duelo duelo;
    int asaltoActual;
    int fallos;

    void Awake() {
        I = this;
        cam = Camera.main;
        CargarContenido();
        estado.escenarioActual = idEscenario;
        hotspots.Clear();
        hotspots.AddRange(FindObjectsByType<HotspotBehaviour>(FindObjectsSortMode.None));
        hud = gameObject.AddComponent<HUD>();
    }

    void Start() {
        var esc = Escenario();
        if (esc != null) hud.Titular(esc.nombre, esc.subtitulo);
        RefrescarVisibilidad();
    }

    public static void CargarContenido() {
        if (contenido != null) return;
        var ruta = Path.Combine(Application.streamingAssetsPath, "contenido.json");
        if (!File.Exists(ruta)) {
            Debug.LogError($"[RR] No encuentro el contenido en {ruta}");
            contenido = new Contenido();
            return;
        }
        contenido = JsonUtility.FromJson<Contenido>(File.ReadAllText(ruta));
        Debug.Log($"[RR] Contenido cargado: {contenido.escenarios.Count} escenarios, " +
                  $"{contenido.items.Count} items, {contenido.duelos.Count} duelos, " +
                  $"{contenido.finales.Count} finales.");
    }

    public Escenario Escenario() =>
        contenido?.escenarios.FirstOrDefault(e => e.id == idEscenario);

    public Item ItemPorId(string id) =>
        contenido?.items.FirstOrDefault(i => i.id == id);

    public Personaje PersonajePorId(string id) =>
        contenido?.personajes.FirstOrDefault(p => p.id == id);

    public string NombreDe(string idPersonaje) {
        if (string.IsNullOrEmpty(idPersonaje)) return "VERUSHKA";
        var p = PersonajePorId(idPersonaje);
        return (p != null ? p.nombre : idPersonaje).ToUpperInvariant();
    }

    // ── loop de input ──────────────────────────────────────────────
    void Update() {
        if (hud.EnDialogo || hud.EnDuelo || hud.EnFinal) return;
        if (!Input.GetMouseButtonDown(0)) return;
        if (hud.SobreUI()) return;

        var ray = cam.ScreenPointToRay(Input.mousePosition);
        if (!Physics.Raycast(ray, out var hit, 200f)) return;
        var hb = hit.collider.GetComponentInParent<HotspotBehaviour>();
        if (hb == null) return;
        Interactuar(hb.datos);
    }

    void RefrescarVisibilidad() {
        foreach (var h in hotspots)
            h.gameObject.SetActive(estado.HotspotVisible(h.datos));
    }

    // ── verbos ─────────────────────────────────────────────────────
    public void Interactuar(Hotspot h) {
        switch (verbo) {
            case Verbo.Mirar:  Mirar(h);  break;
            case Verbo.Hablar: Hablar(h); break;
            case Verbo.Usar:   Usar(h);   break;
        }
        RefrescarVisibilidad();
    }

    void Mirar(Hotspot h) {
        estado.SetFlag(h.setFlagAlMirar);
        hud.Decir("", string.IsNullOrEmpty(h.mirar)
            ? $"Es {h.nombre.ToLowerInvariant()}. No hay mucho más que decir."
            : h.mirar);
    }

    void Hablar(Hotspot h) {
        if (h.hablar == null || h.hablar.Count == 0) {
            hud.Decir("", "Eso no habla. Y si habla, no es a mí.");
            return;
        }
        var linea = estado.PrimeraLineaValida(h.hablar);
        if (linea == null) {
            hud.Decir("", "Ya nos dijimos todo lo que teníamos para decirnos.");
            return;
        }
        AplicarLinea(linea);
        conversandoCon = h;

        if (!string.IsNullOrEmpty(linea.abreDuelo)) {
            hud.Decir(NombreDe(linea.quien), linea.texto, () => AbrirDuelo(linea.abreDuelo));
            return;
        }

        opcionesActuales = estado.OpcionesValidas(linea.opciones);
        if (opcionesActuales.Count > 0)
            hud.Conversar(NombreDe(linea.quien), linea.texto, opcionesActuales.Select(o => o.texto).ToList(), Elegir);
        else
            hud.Decir(NombreDe(linea.quien), linea.texto);
    }

    void AplicarLinea(Linea l) {
        estado.SetFlag(l.setFlag);
        estado.Dar(l.daItem);
        estado.Quitar(l.consumeItem);
    }

    void Elegir(int idx) {
        if (idx < 0 || idx >= opcionesActuales.Count) { hud.Cerrar(); return; }
        var o = opcionesActuales[idx];
        estado.SetFlag(o.setFlag);
        estado.Dar(o.daItem);
        estado.Quitar(o.consumeItem);
        estado.Mover(o.ejeConviccion, o.ejeMetodo);

        if (!string.IsNullOrEmpty(o.abreDuelo)) {
            hud.Decir(NombreDe(o.quienResponde), o.respuesta, () => AbrirDuelo(o.abreDuelo));
            return;
        }

        if (o.cierra || string.IsNullOrEmpty(o.respuesta)) {
            if (!string.IsNullOrEmpty(o.respuesta)) hud.Decir(NombreDe(o.quienResponde), o.respuesta);
            else hud.Cerrar();
            RefrescarVisibilidad();
            return;
        }

        // seguir conversando: reevaluar desde el hotspot
        hud.Decir(NombreDe(o.quienResponde), o.respuesta, () => {
            RefrescarVisibilidad();
            if (conversandoCon != null) Hablar(conversandoCon);
        });
    }

    void Usar(Hotspot h) {
        // salida a otro escenario
        if (!string.IsNullOrEmpty(h.vaA)) {
            if (!string.IsNullOrEmpty(h.requiereFlagParaIr) && !estado.Flag(h.requiereFlagParaIr)) {
                hud.Decir("", string.IsNullOrEmpty(h.textoSiNoPuedeIr)
                    ? "Todavía no. Me falta algo acá."
                    : h.textoSiNoPuedeIr);
                return;
            }
            Ir(h.vaA);
            return;
        }

        if (!string.IsNullOrEmpty(itemEnMano)) {
            var uso = h.usos?.FirstOrDefault(u => u.item == itemEnMano &&
                        (string.IsNullOrEmpty(u.requiereFlag) || estado.Flag(u.requiereFlag)));
            if (uso != null) {
                estado.SetFlag(uso.setFlag);
                estado.Dar(uso.daItem);
                estado.Mover(uso.ejeConviccion, uso.ejeMetodo);
                if (uso.consume) estado.Quitar(itemEnMano);
                var texto = uso.exito;
                itemEnMano = null;
                hud.Decir("", texto);
                return;
            }
            var fallo = h.usos?.FirstOrDefault(u => !string.IsNullOrEmpty(u.fallo));
            hud.Decir("", fallo != null ? fallo.fallo
                : $"No. {ItemPorId(itemEnMano)?.nombre ?? "Eso"} no tiene nada que hacer ahí.");
            return;
        }

        if (!string.IsNullOrEmpty(h.usarSolo)) {
            estado.SetFlag(h.setFlagAlUsar);
            estado.Dar(h.daItemAlUsar);
            hud.Decir("", h.usarSolo);
            return;
        }

        hud.Decir("", "No pasa nada. Y no va a pasar por insistir.");
    }

    public void Ir(string idEsc) {
        estado.escenarioActual = idEsc;
        if (idEsc == "epilogo") { MostrarFinal(); return; }
        SceneManager.LoadScene(NombreEscena(idEsc));
    }

    public static string NombreEscena(string idEsc) {
        switch (idEsc) {
            case "smolny":  return "ActoI_Smolny";
            case "vyborg":  return "ActoII_Vyborg";
            case "palacio": return "ActoIII_Palacio";
            default:        return "ActoI_Smolny";
        }
    }

    void MostrarFinal() {
        var f = estado.Epilogo(contenido.finales);
        hud.Final(f != null ? f.titulo : "FIN",
                  f != null ? f.texto : "", estado.Resumen());
    }

    // ── duelo dialéctico ───────────────────────────────────────────
    void AbrirDuelo(string id) {
        duelo = contenido.duelos.FirstOrDefault(d => d.id == id);
        if (duelo == null) { hud.Cerrar(); return; }
        asaltoActual = 0;
        fallos = 0;
        hud.Decir(duelo.rival.ToUpperInvariant(), duelo.intro, SiguienteAsalto);
    }

    void SiguienteAsalto() {
        if (duelo == null) { hud.Cerrar(); return; }

        if (asaltoActual >= duelo.asaltos.Count) { CerrarDuelo(fallos == 0 && !duelo.sePierdeSiempre); return; }

        var asalto = duelo.asaltos[asaltoActual];
        var disponibles = contenido.argumentos.Where(a => estado.Sabe(a.id)).ToList();

        // siempre se ofrece la réplica correcta si la tenés, más ruido
        var opciones = new List<Argumento>();
        var correcta = contenido.argumentos.FirstOrDefault(a => a.id == asalto.replicaId);
        if (correcta != null && estado.Sabe(correcta.id)) opciones.Add(correcta);
        foreach (var a in disponibles) {
            if (opciones.Count >= 4) break;
            if (a.id != asalto.replicaId) opciones.Add(a);
        }
        if (opciones.Count == 0) {
            // sin libreta: sólo podés encajar el golpe
            estado.Aprender(asalto.aprendes);
            fallos++;
            asaltoActual++;
            hud.Duelo(duelo.rival.ToUpperInvariant(), asalto.ataque,
                      new List<string> { "…(no tengo respuesta)" },
                      _ => hud.Decir("", asalto.siFalla, SiguienteAsalto));
            return;
        }

        opciones = opciones.OrderBy(_ => Random.value).ToList();
        var textos = opciones.Select(o => o.texto).ToList();
        hud.Duelo(duelo.rival.ToUpperInvariant(), asalto.ataque, textos, idx => {
            bool acierta = idx >= 0 && idx < opciones.Count && opciones[idx].id == asalto.replicaId;
            if (!acierta) { fallos++; estado.Aprender(asalto.aprendes); }
            asaltoActual++;
            hud.Decir("", acierta ? "Silencio en la sala. Seguí." : asalto.siFalla, SiguienteAsalto);
        });
    }

    void CerrarDuelo(bool gana) {
        if (duelo.sePierdeSiempre) gana = false;
        if (gana) {
            estado.SetFlag(duelo.setFlagAlGanar);
            estado.Mover(duelo.ejeConviccionAlGanar, 0);
        } else {
            estado.SetFlag(duelo.setFlagAlPerder);
        }
        var texto = gana ? duelo.alGanar : duelo.alPerder;
        duelo = null;
        hud.Decir("", texto, () => { hud.Cerrar(); RefrescarVisibilidad(); });
    }
}
}
