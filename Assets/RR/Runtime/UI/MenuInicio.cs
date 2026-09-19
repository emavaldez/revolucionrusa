using UnityEngine;
using UnityEngine.SceneManagement;

namespace RR {

// Pantalla de título mínima: fondo (o logo) + botón JUGAR + una línea de
// instrucciones. Sin esto el juego arrancaba directo en el primer acto,
// sin decir que la cámara se mueve acercando el mouse a los bordes ni que
// hay que elegir un verbo antes de hacer clic.
public class MenuInicio : MonoBehaviour {

    public Texture2D fondo;
    public Texture2D logo;

    static readonly Color NEGRO = new Color32(0x14, 0x12, 0x10, 0xFF);
    static readonly Color ROJO  = new Color32(0xC8, 0x10, 0x2E, 0xFF);
    static readonly Color ROJO_HOVER = new Color32(0xE0, 0x24, 0x3E, 0xFF);
    static readonly Color CREMA = new Color32(0xE8, 0xDC, 0xC0, 0xFF);

    GUIStyle sBoton, sChico, sTitulo;
    Texture2D texNegro, texRojo, texRojoHover;
    bool listo;

    Texture2D Solido(Color c) { var t = new Texture2D(1, 1); t.SetPixel(0, 0, c); t.Apply(); return t; }

    void Estilos() {
        if (listo) return;
        listo = true;
        texNegro = Solido(NEGRO);
        texRojo = Solido(ROJO);
        texRojoHover = Solido(ROJO_HOVER);
        var fuente = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

        sBoton = new GUIStyle { font = fuente, fontSize = 22, fontStyle = FontStyle.Bold,
                                alignment = TextAnchor.MiddleCenter };
        sBoton.normal.textColor = Color.white;
        sBoton.normal.background = texRojo;
        sBoton.hover.background = texRojoHover;
        sBoton.hover.textColor = Color.white;

        sChico = new GUIStyle { font = fuente, fontSize = 14, alignment = TextAnchor.MiddleCenter };
        sChico.normal.textColor = CREMA;

        sTitulo = new GUIStyle { font = fuente, fontSize = 40, fontStyle = FontStyle.Bold,
                                 alignment = TextAnchor.MiddleCenter };
        sTitulo.normal.textColor = CREMA;
    }

    void OnGUI() {
        Estilos();
        float W = Screen.width, H = Screen.height;

        GUI.DrawTexture(new Rect(0, 0, W, H), texNegro);
        if (fondo != null)
            GUI.DrawTexture(new Rect(0, 0, W, H), fondo, ScaleMode.ScaleAndCrop);

        // franja oscura abajo para que el botón y el texto se lean sobre
        // cualquier fondo
        var prevColor = GUI.color;
        GUI.color = new Color(1f, 1f, 1f, 0.72f);
        GUI.DrawTexture(new Rect(0, H * 0.6f, W, H * 0.4f), texNegro);
        GUI.color = prevColor;

        if (logo != null) {
            float lw = Mathf.Min(560, W * 0.7f);
            float lh = lw * (logo.height / (float)logo.width);
            GUI.DrawTexture(new Rect((W - lw) / 2f, H * 0.16f, lw, lh), logo, ScaleMode.ScaleToFit);
        } else {
            GUI.Label(new Rect(0, H * 0.22f, W, 60), "VERUSHKA", sTitulo);
        }

        GUI.Label(new Rect(0, H * 0.68f, W, 24),
                  "Una aventura sobre la Revolución Rusa", sChico);

        if (GUI.Button(new Rect(W / 2f - 120, H * 0.76f, 240, 56), "JUGAR", sBoton))
            SceneManager.LoadScene("ActoI_Smolny");

        GUI.Label(new Rect(0, H - 40, W, 24),
                  "Acercá el mouse a los bordes de la pantalla para mirar a los costados  ·  " +
                  "elegí un verbo abajo y hacé clic en algo",
                  sChico);
    }
}
}
