# Instalar VERUSHKA en el proyecto Unity

Descomprimir de modo que quede así dentro de `~/GameDev/RR/unity-rr/`:

```
Assets/
  RR/
    Runtime/Data/Modelo.cs
    Runtime/Core/Estado.cs
    Runtime/Core/HotspotBehaviour.cs
    Runtime/Core/Juego.cs
    Runtime/Core/CamaraLateral.cs
    Runtime/UI/HUD.cs
    Editor/ConstructorEscenas.cs
    Contenido/contenido.json
  StreamingAssets/
    contenido.json          ← la misma copia; es la que lee el juego
```

Después, en el Editor:

1. Esperar a que compile. La consola tiene que quedar limpia.
2. Menú **Revolución → Construir las tres escenas**.
   Genera `ActoI_Smolny`, `ActoII_Vyborg` y `ActoIII_Palacio` en
   `Assets/RR/Escenas/`, con geometría, cámara, luces y los 28 hotspots
   colocados, y las agrega al Build Settings en orden.
3. Abrir `ActoI_Smolny` y darle Play.

Si tocás `Assets/RR/Contenido/contenido.json`, corré
**Revolución → Copiar contenido a StreamingAssets** y volvé a construir.

## Cómo se juega

Tres verbos abajo a la izquierda: **MIRAR / HABLAR / USAR**. El inventario está
al lado. Clic en un item lo pone en la mano y cambia a USAR; clic en un hotspot
aplica el verbo. Para cambiar de escenario, USAR sobre la salida.

El mouse cerca de los bordes mueve la cámara a lo largo del escenario.

## Recorrido mínimo para verificar que funciona

**Acto I** — Hablar con el centinela y preguntarle qué tiene que decir el papel →
usar el guardarropa (sale el delantal) → hablar con el centinela y mostrarle la
etiqueta → usar los muebles (pata de silla) → usar la pata en el samovar → mirar
a los tres calvos hasta encontrar al de la mejilla vendada → hablar con él →
hablar con Mártov e interrumpirlo (se pierde el duelo a propósito: ahí se
aprenden los argumentos) → hablar con Trotski → hablar con Stalin → agarrar el
lápiz rojo → salir.

**Acto II** — Hablar con la cola del pan y repartir los Pravda (sale el pan) →
hablar con el tranvía y ganar el duelo → central telefónica → mesa del comité
(redactar la orden) → Aurora (marcarla con el lápiz, o no) → imprenta (duelo o
barra de hierro) → dar el pan al cadete del puente → cruzar.

**Acto III** — Hablar con el cocinero → usar la puerta del Hermitage → usar los
salones → usar la bodega (botella) → usar la botella en los defensores → hablar
con el cadete → hablar con el Gobierno Provisional y escribir el acta → salir
al amanecer.

## Qué es provisorio

- **El HUD** está dibujado con IMGUI. Es funcional y usa ya la paleta
  constructivista definitiva, pero se reemplaza entero por UI Toolkit cuando
  haya arte. Ningún otro sistema depende de él.
- **La geometría** son cubos y cápsulas con las medidas y posiciones correctas.
  Reemplazar un hotspot por un modelo real es cambiarle el mesh al GameObject:
  los datos viven en el componente `HotspotBehaviour`, no en la forma.
- **No hay personaje jugable caminando.** La interacción es por clic directo.
  Agregar a Verushka caminando es un `NavMeshAgent` y un `Animator`, y no toca
  nada de lo que ya está.
