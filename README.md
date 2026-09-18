# VERUSHKA — Revolución Rusa

Aventura gráfica point-and-click sobre la Revolución Rusa, Petrogrado,
23-25 de octubre de 1917. Unity 6 LTS.

Este repo empezó como un prototipo en Next.js + Three.js (1905-1924, con
Alexandra Kollontai). Esa versión se descartó por completo y se rehizo desde
cero en Unity con un diseño nuevo y más acotado: **Verushka**, 3 actos
(Smolny, Výborg, Palacio de Invierno), duelos dialécticos en vez de combate,
y cuatro finales posibles. El código y assets del prototipo viejo quedan
disponibles en el tag `archive/nextjs-prototype`; el contenido narrativo
reutilizable del prototipo vive en `../story-export/`.

## Documentación

- `docs/prd.md` — diseño y alcance del juego
- `docs/architecture.md` — cómo está armado en Unity
- `docs/stories/` — trabajo pendiente, una story por archivo
- `INSTALAR.md` — cómo abrir el proyecto y recorrido de playtest

## Estado

Prototipo jugable de punta a punta: 3 actos, 28 hotspots, duelos dialécticos,
inventario y los 4 finales ya escritos. Geometría placeholder (cubos/cápsulas)
y HUD en IMGUI — ver `docs/stories/` para lo que falta.

## Método de trabajo

Flujo supervisor-worker con [`wf`](https://github.com/emavaldez/wf-kit):
Claude planifica y audita, Hermes implementa. Ver `workflow/config.json`
una vez inicializado.
