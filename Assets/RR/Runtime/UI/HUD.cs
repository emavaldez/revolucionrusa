using System;
using System.Collections.Generic;
using UnityEngine;

namespace RR {

// HUD de prototipo, dibujado con IMGUI. Feo a propósito: es funcional,
// no tiene dependencias de assets y se reemplaza entero por UI Toolkit
// cuando haya arte. La paleta ya es la constructivista definitiva.
public class HUD : MonoBehaviour {

    static readonly Color ROJO   = new Color32(0xC8, 0x10, 0x2E, 0xFF);
    static readonly Color NEGRO  = new Color32(0x14, 0x12, 0x10, 0xFF);
    static readonly Color CREMA  = new Color32(0xE8, 0xDC, 0xC0, 0xFF);
    static readonly Color GRIS   = new Color32(0x3A, 0x36, 0x32, 0xFF);

    Texture2D texRojo, texNegro, texCrema, texGris;
    GUIStyle sTexto, sNombre, sBoton, sBotonSel, sTitulo, sSub, sChico;
    bool estilosListos;

    string quien = "", texto = "";
    Action alCerrar;
    List<string> opciones = new List<string>();
    Action<int> alElegir;

    string tituloCard, subCard;
    float tCard = -99f;

    string finTitulo, finTexto, finResumen;

    public bool EnDialogo => !string.IsNullOrEmpty(texto) && !EnDuelo && !EnFinal;
    public bool EnDuelo { get; private set; }
    public bool EnFinal => !string.IsNullOrEmpty(finTitulo);

    Rect rectPanel, rectVerbos, rectInv;

    public bool SobreUI() {
        var p = new Vector2(Input.mousePosition.x, Screen.height - Input.mousePosition.y);
        return rectPanel.Contains(p) || rectVerbos.Contains(p) || rectInv.Contains(p);
    }

    // ── API ────────────────────────────────────────────────────────
    public void Titular(string t, string s) { tituloCard = t; subCard = s; tCard = Time.time; }

    public void Decir(string q, string t, Action cb = null) {
        quien = q; texto = t; alCerrar = cb; opciones.Clear(); alElegir = null; EnDuelo = false;
    }

    public void Conversar(string q, string t, List<string> ops, Action<int> cb) {
        quien = q; texto = t; opciones = ops ?? new List<string>(); alElegir = cb; alCerrar = null; EnDuelo = false;
    }

    public void Duelo(string q, string t, List<string> ops, Action<int> cb) {
        quien = q; texto = t; opciones = ops ?? new List<string>(); alElegir = cb; alCerrar = null; EnDuelo = true;
    }

    public void Final(string t, string cuerpo, string resumen) {
        finTitulo = t; finTexto = cuerpo; finResumen = resumen;
        texto = ""; opciones.Clear(); EnDuelo = false;
    }

    public void Cerrar() {
        quien = ""; texto = ""; opciones.Clear(); alElegir = null; alCerrar = null; EnDuelo = false;
    }

    // ── dibujo ─────────────────────────────────────────────────────
    Texture2D Solido(Color c) {
        var t = new Texture2D(1, 1); t.SetPixel(0, 0, c); t.Apply(); return t;
    }

    void Estilos() {
        if (estilosListos) return;
        estilosListos = true;
        texRojo = Solido(ROJO); texNegro = Solido(NEGRO); texCrema = Solido(CREMA); texGris = Solido(GRIS);
        var fuente = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

        sTexto = new GUIStyle { font = fuente, fontSize = 17, wordWrap = true, richText = true,
                                padding = new RectOffset(18, 18, 12, 12) };
        sTexto.normal.textColor = CREMA;

        sNombre = new GUIStyle { font = fuente, fontSize = 13, fontStyle = FontStyle.Bold,
                                 padding = new RectOffset(18, 18, 8, 2) };
        sNombre.normal.textColor = ROJO;

        sBoton = new GUIStyle { font = fuente, fontSize = 15, wordWrap = true, alignment = TextAnchor.MiddleLeft,
                                padding = new RectOffset(14, 14, 8, 8) };
        sBoton.normal.background = texGris;  sBoton.normal.textColor = CREMA;
        sBoton.hover.background  = texRojo;  sBoton.hover.textColor  = CREMA;
        sBoton.active.background = texRojo;  sBoton.active.textColor = Color.white;

        sBotonSel = new GUIStyle(sBoton);
        sBotonSel.normal.background = texRojo; sBotonSel.normal.textColor = Color.white;

        sTitulo = new GUIStyle { font = fuente, fontSize = 46, fontStyle = FontStyle.Bold,
                                 alignment = TextAnchor.MiddleCenter };
        sTitulo.normal.textColor = CREMA;

        sSub = new GUIStyle { font = fuente, fontSize = 18, alignment = TextAnchor.MiddleCenter };
        sSub.normal.textColor = ROJO;

        sChico = new GUIStyle { font = fuente, fontSize = 12, alignment = TextAnchor.MiddleCenter };
        sChico.normal.textColor = new Color(0.65f, 0.62f, 0.56f);
    }

    void OnGUI() {
        Estilos();
        float W = Screen.width, H = Screen.height;

        if (EnFinal) { DibujarFinal(W, H); return; }

        DibujarTitular(W, H);

        // ── barra inferior: verbos + inventario ────────────────────
        float altoBarra = 92f;
        rectVerbos = new Rect(0, H - altoBarra, 200, altoBarra);
        rectInv = new Rect(200, H - altoBarra, W - 200, altoBarra);

        GUI.DrawTexture(new Rect(0, H - altoBarra, W, altoBarra), texNegro);
        GUI.DrawTexture(new Rect(0, H - altoBarra, W, 3), texRojo);

        var j = Juego.I;
        string[] verbos = { "MIRAR", "HABLAR", "USAR" };
        for (int i = 0; i < 3; i++) {
            var r = new Rect(12, H - altoBarra + 10 + i * 25, 120, 22);
            bool sel = (int)j.verbo == i;
            if (GUI.Button(r, verbos[i], sel ? sBotonSel : sBoton)) j.verbo = (Verbo)i;
        }

        // inventario
        float x = 214;
        foreach (var id in Juego.estado.inventario) {
            var item = j.ItemPorId(id);
            var r = new Rect(x, H - altoBarra + 14, 150, 30);
            bool sel = j.itemEnMano == id;
            if (GUI.Button(r, item != null ? item.nombre : id, sel ? sBotonSel : sBoton)) {
                j.itemEnMano = sel ? null : id;
                j.verbo = Verbo.Usar;
            }
            if (sel && item != null) GUI.Label(new Rect(x, H - altoBarra + 48, 400, 20), item.desc, sChico);
            x += 158;
            if (x > W - 160) break;
        }
        if (Juego.estado.inventario.Count == 0)
            GUI.Label(new Rect(214, H - altoBarra + 20, 400, 20), "— sin nada en los bolsillos —", sChico);

        // ── panel de diálogo ───────────────────────────────────────
        if (string.IsNullOrEmpty(texto)) { rectPanel = new Rect(0, 0, 0, 0); return; }

        float pw = Mathf.Min(900, W - 80);
        float alturaTexto = sTexto.CalcHeight(new GUIContent(texto), pw);
        float ph = alturaTexto + 40 + opciones.Count * 42;
        rectPanel = new Rect((W - pw) / 2, H - altoBarra - ph - 24, pw, ph);

        GUI.DrawTexture(rectPanel, texNegro);
        GUI.DrawTexture(new Rect(rectPanel.x, rectPanel.y, 5, rectPanel.height), texRojo);

        if (!string.IsNullOrEmpty(quien))
            GUI.Label(new Rect(rectPanel.x, rectPanel.y, pw, 20), quien, sNombre);

        GUI.Label(new Rect(rectPanel.x, rectPanel.y + (string.IsNullOrEmpty(quien) ? 4 : 20), pw, alturaTexto),
                  texto, sTexto);

        if (opciones.Count > 0) {
            float oy = rectPanel.y + alturaTexto + 26;
            for (int i = 0; i < opciones.Count; i++) {
                if (GUI.Button(new Rect(rectPanel.x + 18, oy + i * 42, pw - 36, 36), opciones[i], sBoton)) {
                    var cb = alElegir; var idx = i;
                    Cerrar();
                    cb?.Invoke(idx);
                }
            }
        } else {
            if (GUI.Button(new Rect(rectPanel.x + pw - 130, rectPanel.y + rectPanel.height - 34, 112, 26),
                           "CONTINUAR", sBoton)) {
                var cb = alCerrar;
                Cerrar();
                cb?.Invoke();
            }
        }
    }

    void DibujarTitular(float W, float H) {
        float t = Time.time - tCard;
        if (t < 0 || t > 4.5f) return;
        float a = t < 3.5f ? 1f : 1f - (t - 3.5f);
        var prev = GUI.color;
        GUI.color = new Color(1, 1, 1, a);
        GUI.DrawTexture(new Rect(0, H * 0.30f, W, 140), texNegro);
        GUI.DrawTexture(new Rect(0, H * 0.30f, W, 4), texRojo);
        GUI.Label(new Rect(0, H * 0.30f + 20, W, 60), tituloCard ?? "", sTitulo);
        GUI.Label(new Rect(0, H * 0.30f + 88, W, 30), subCard ?? "", sSub);
        GUI.color = prev;
    }

    void DibujarFinal(float W, float H) {
        GUI.DrawTexture(new Rect(0, 0, W, H), texNegro);
        GUI.Label(new Rect(0, H * 0.14f, W, 60), finTitulo, sTitulo);
        GUI.DrawTexture(new Rect(W * 0.3f, H * 0.14f + 74, W * 0.4f, 3), texRojo);
        float pw = Mathf.Min(760, W - 120);
        GUI.Label(new Rect((W - pw) / 2, H * 0.28f, pw, H * 0.5f), finTexto, sTexto);
        GUI.Label(new Rect(0, H - 60, W, 20), finResumen, sChico);
    }
}
}
