# Story 002 — Sprites de personajes en los hotspots de tipo hablar

## Contexto
Ya existen sprites generados para varios personajes en
`Assets/RR/Arte/personajes/` (antonov, centinela, cocinero, delegado,
editor, ivanov, kolia, konovalov, y otros — ver el directorio completo).
Los hotspots de tipo "hablar" hoy se dibujan como geometría placeholder
(cápsula) vía el gizmo de `HotspotBehaviour`.

## Alcance
- Confirmar cobertura: listar los `personajes` de `contenido.json` (17)
  contra los PNG existentes en `Assets/RR/Arte/personajes/`; los que
  falten, dejarlos con placeholder y anotarlos en el PR, no bloquear la
  story generándolos.
- En `ConstructorEscenas.cs`, para cada hotspot con `hablar` no vacío,
  reemplazar (o agregar sobre) la cápsula por un `SpriteRenderer` con el
  sprite del personaje si existe uno para su id.
- Mantener el gizmo de `HotspotBehaviour` como fallback visual en el
  Editor para los personajes sin sprite todavía.

## Fuera de alcance
Animación de personajes, NavMeshAgent — eso es la story de Verushka
caminando.

## Criterio de aceptación
Los personajes con sprite disponible se ven con su arte real en las 3
escenas construidas; los que no, siguen mostrando el placeholder sin
romper nada.
