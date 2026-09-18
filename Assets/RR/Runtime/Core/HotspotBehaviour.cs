using UnityEngine;

namespace RR {

// Un punto interactivo del escenario. El constructor de escenas crea uno
// de estos por hotspot del JSON, con los datos ya cargados, así se pueden
// editar en el Inspector y mover en la vista de escena.
public class HotspotBehaviour : MonoBehaviour {

    public Hotspot datos = new Hotspot();

    [Tooltip("Se rellena desde el JSON. Editar acá pisa el contenido hasta la próxima reimportación.")]
    public bool bloqueadoParaReimportar;

    void Reset() {
        if (string.IsNullOrEmpty(datos.id)) datos.id = gameObject.name;
    }

    public string Nombre => string.IsNullOrEmpty(datos.nombre) ? gameObject.name : datos.nombre;

    // Sincroniza la posición de los datos con la del transform.
    // El constructor usa el JSON; después manda la escena.
    public void VolcarPosicionADatos() {
        var p = transform.position;
        datos.x = p.x; datos.y = p.y; datos.z = p.z;
    }

    void OnDrawGizmos() {
        Gizmos.color = datos.vaA != null && datos.vaA != ""
            ? new Color(0.35f, 0.75f, 1f, 0.35f)
            : new Color(0.85f, 0.25f, 0.2f, 0.35f);
        Gizmos.DrawCube(transform.position + Vector3.up * datos.alto * 0.5f,
                        new Vector3(datos.ancho, datos.alto, datos.prof));
    }
}
}
