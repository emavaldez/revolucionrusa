using System;
using System.Collections.Generic;

namespace RR {

[Serializable] public class Item {
    public string id;
    public string nombre;
    public string desc;
}

// Una línea de diálogo condicionada por flags/items.
// Se evalúa en orden: gana la primera cuyas condiciones se cumplen.
[Serializable] public class Linea {
    public string quien;               // id de personaje; "" = Verushka
    public string texto;
    public string requiereFlag;
    public string requiereNoFlag;
    public string requiereItem;
    public string setFlag;
    public string daItem;
    public string consumeItem;
    public string abreDuelo;
    public List<Opcion> opciones = new List<Opcion>();
}

[Serializable] public class Opcion {
    public string texto;               // lo que dice Verushka
    public string respuesta;           // lo que le contestan
    public string quienResponde;
    public string requiereFlag;
    public string requiereNoFlag;
    public string requiereItem;
    public string setFlag;
    public string daItem;
    public string consumeItem;
    public string abreDuelo;
    public int ejeConviccion;          // -2..+2
    public int ejeMetodo;              // -2..+2 (+ = hace lo necesario)
    public bool cierra;
}

[Serializable] public class Uso {
    public string item;                // id del item que se usa encima
    public string requiereFlag;
    public string exito;
    public string fallo;
    public string setFlag;
    public string daItem;
    public bool consume;
    public int ejeConviccion;
    public int ejeMetodo;
}

[Serializable] public class Hotspot {
    public string id;
    public string nombre;
    public float x, y, z;              // metros, dentro del escenario
    public float ancho = 1f, alto = 2f, prof = 1f;
    public string forma = "caja";      // caja | persona | puerta | piso
    public string color = "#8a8073";

    public string mirar;
    public string setFlagAlMirar;
    public string usarSolo;            // Usar sin item en mano
    public string setFlagAlUsar;

    public List<Linea> hablar = new List<Linea>();
    public List<Uso> usos = new List<Uso>();

    public string daItemAlUsar;
    public string ocultarSiFlag;
    public string mostrarSiFlag;

    public string vaA;                 // id de escenario destino
    public string requiereFlagParaIr;
    public string textoSiNoPuedeIr;
}

[Serializable] public class Escenario {
    public string id;
    public string nombre;
    public string subtitulo;
    public int acto;
    public float ancho = 24f;
    public float fondo = 12f;
    public float alturaTecho = 6f;
    public string paleta = "interior";
    public string notaHistorica;
    public List<Hotspot> hotspots = new List<Hotspot>();
}

// ── Duelo dialéctico ───────────────────────────────────────────────
// Perdés para aprender: cada argumento que te ganan queda en la
// libreta y lo podés usar después contra otro rival.

[Serializable] public class Asalto {
    public string ataque;              // lo que te dice el rival
    public string replicaId;           // id del argumento que lo contesta
    public string siFalla;             // qué pasa si no la tenés
    public string aprendes;            // id de argumento que sumás al perder
}

[Serializable] public class Argumento {
    public string id;
    public string texto;
}

[Serializable] public class Duelo {
    public string id;
    public string rival;
    public string intro;
    public bool sePierdeSiempre;
    public string alGanar;
    public string alPerder;
    public string setFlagAlGanar;
    public string setFlagAlPerder;
    public int ejeConviccionAlGanar;
    public List<Asalto> asaltos = new List<Asalto>();
}

[Serializable] public class Personaje {
    public string id;
    public string nombre;
    public string descripcion;
    public string color = "#d9c9a3";
    public string notaHistorica;
}

[Serializable] public class Final {
    public string id;
    public string titulo;
    public bool creyendo;
    public bool metodoDuro;
    public string texto;
}

[Serializable] public class Contenido {
    public string escenarioInicial;
    public List<Escenario> escenarios = new List<Escenario>();
    public List<Item> items = new List<Item>();
    public List<Personaje> personajes = new List<Personaje>();
    public List<Argumento> argumentos = new List<Argumento>();
    public List<Duelo> duelos = new List<Duelo>();
    public List<Final> finales = new List<Final>();
}
}
