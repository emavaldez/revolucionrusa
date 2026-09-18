using System.Collections.Generic;
using System.Linq;

namespace RR {

// Todo el estado del juego. Flags booleanas, inventario, los dos ejes
// que deciden el epílogo, y la libreta de argumentos del duelo dialéctico.
public class Estado {

    public readonly HashSet<string> flags = new HashSet<string>();
    public readonly List<string> inventario = new List<string>();
    public readonly HashSet<string> argumentos = new HashSet<string>();

    public int ejeConviccion;   // + sigue creyendo, - dejó de creer
    public int ejeMetodo;       // + hizo lo necesario, - mantuvo el método

    public string escenarioActual;

    // ── flags ──────────────────────────────────────────────────────
    public bool Flag(string f) => !string.IsNullOrEmpty(f) && flags.Contains(f);

    public void SetFlag(string f) {
        if (!string.IsNullOrEmpty(f)) flags.Add(f);
    }

    // ── inventario ─────────────────────────────────────────────────
    public bool Tiene(string item) => !string.IsNullOrEmpty(item) && inventario.Contains(item);

    public void Dar(string item) {
        if (!string.IsNullOrEmpty(item) && !inventario.Contains(item)) inventario.Add(item);
    }

    public void Quitar(string item) {
        if (!string.IsNullOrEmpty(item)) inventario.Remove(item);
    }

    // ── argumentos del duelo ───────────────────────────────────────
    public bool Sabe(string arg) => !string.IsNullOrEmpty(arg) && argumentos.Contains(arg);

    public void Aprender(string arg) {
        if (!string.IsNullOrEmpty(arg)) argumentos.Add(arg);
    }

    // ── ejes ───────────────────────────────────────────────────────
    public void Mover(int conviccion, int metodo) {
        ejeConviccion += conviccion;
        ejeMetodo += metodo;
    }

    // ── evaluación de condiciones ──────────────────────────────────
    public bool Cumple(string reqFlag, string reqNoFlag, string reqItem) {
        if (!string.IsNullOrEmpty(reqFlag) && !Flag(reqFlag)) return false;
        if (!string.IsNullOrEmpty(reqNoFlag) && Flag(reqNoFlag)) return false;
        if (!string.IsNullOrEmpty(reqItem) && !Tiene(reqItem)) return false;
        return true;
    }

    public Linea PrimeraLineaValida(List<Linea> lineas) {
        if (lineas == null) return null;
        return lineas.FirstOrDefault(l => Cumple(l.requiereFlag, l.requiereNoFlag, l.requiereItem));
    }

    public List<Opcion> OpcionesValidas(List<Opcion> opciones) {
        if (opciones == null) return new List<Opcion>();
        return opciones.Where(o => Cumple(o.requiereFlag, o.requiereNoFlag, o.requiereItem)).ToList();
    }

    public bool HotspotVisible(Hotspot h) {
        if (!string.IsNullOrEmpty(h.ocultarSiFlag) && Flag(h.ocultarSiFlag)) return false;
        if (!string.IsNullOrEmpty(h.mostrarSiFlag) && !Flag(h.mostrarSiFlag)) return false;
        return true;
    }

    // ── final ──────────────────────────────────────────────────────
    public Final Epilogo(List<Final> finales) {
        bool cree = ejeConviccion > 0;
        bool duro = ejeMetodo > 0;
        return finales.FirstOrDefault(f => f.creyendo == cree && f.metodoDuro == duro)
               ?? finales.FirstOrDefault();
    }

    public string Resumen() =>
        $"convicción {ejeConviccion:+#;-#;0} · método {ejeMetodo:+#;-#;0} · " +
        $"{inventario.Count} items · {flags.Count} flags · {argumentos.Count} argumentos";
}
}
