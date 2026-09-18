using UnityEngine;

namespace RR {

// Cámara de aventura gráfica: plano lateral fijo que acompaña el mouse
// a lo largo del escenario, como el scroll de Monkey Island.
public class CamaraLateral : MonoBehaviour {

    public float ancho = 24f;
    public float suavidad = 3.5f;
    public float margen = 0.18f;   // fracción de pantalla en cada borde

    float xInicial, xMin, xMax, objetivo;

    void Start() {
        xInicial = transform.position.x;
        xMin = -10f;
        xMax = Mathf.Max(xMin, ancho - 14f);
        objetivo = Mathf.Clamp(xInicial, xMin, xMax);
    }

    void LateUpdate() {
        float f = Mathf.Clamp01(Input.mousePosition.x / Mathf.Max(1f, Screen.width));
        if (f < margen)        objetivo -= (margen - f) * 40f * Time.deltaTime;
        else if (f > 1 - margen) objetivo += (f - (1 - margen)) * 40f * Time.deltaTime;
        objetivo = Mathf.Clamp(objetivo, xMin, xMax);

        var p = transform.position;
        p.x = Mathf.Lerp(p.x, objetivo, Time.deltaTime * suavidad);
        transform.position = p;
    }
}
}
