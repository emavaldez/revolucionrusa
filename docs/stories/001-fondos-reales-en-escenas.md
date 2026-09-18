# Story 001 — Aplicar fondos reales a las tres escenas

## Contexto
`ConstructorEscenas.cs` genera las tres escenas con geometría placeholder
(cubos/cápsulas). Ya existen los fondos pintados en
`Assets/RR/Arte/fondo_{smolny,vyborg,palacio}.png`, generados por el
pipeline en `Assets/RR/Arte/*.py`, pero no están aplicados.

## Alcance
- Importar los 3 PNG como Sprites (2.5D: fondo detrás de la cámara lateral).
- En `ConstructorEscenas.cs`, agregar el fondo correspondiente a cada acto
  al construir la escena (un `SpriteRenderer` o `Quad` con el material del
  fondo, detrás de los hotspots, dimensionado con `Escenario.ancho`/`fondo`).
- No tocar `HotspotBehaviour` ni el modelo de datos: esto es puramente
  visual, capa detrás de la geometría existente.
- Verificar en las 3 escenas que la cámara lateral (`CamaraLateral.cs`)
  recorre el fondo sin cortes ni repeticiones raras en los bordes.

## Fuera de alcance
Reemplazar la geometría de los hotspots (story aparte) y los sprites de
personajes (story aparte).

## Criterio de aceptación
Las 3 escenas construidas por **Revolución → Construir las tres escenas**
muestran el fondo pintado correspondiente en vez de fondo vacío/color
sólido, sin romper el recorrido de playtest de `INSTALAR.md`.
