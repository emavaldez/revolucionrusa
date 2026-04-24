# Revolución Rusa: Aventura Dialéctica

Juego point-and-click de aventura histórica sobre la Revolución Rusa (1905–1924).

## Características

- 7 misiones históricas con puzles, diálogos y exploración
- Personaje femenino fijo: Alexandra Kollontai
- Motor point-and-click con personaje caminando, cámara scroll, cursores contextuales
- Puzle musical: tocar "La Internacional" en un piano
- Sistema de pistas integrado
- Inventario persistente entre misiones
- Diálogos con opciones múltiples
- Estética constructivista/soviética con humor

## Tech Stack

- Next.js 16 + React + TypeScript
- Tailwind CSS
- Framer Motion
- Web Audio API (efectos de sonido)

## Deploy en GitHub Pages

1. Crear repo en GitHub y subir el código
2. Ir a Settings → Pages → Source: GitHub Actions
3. Usar el workflow de Next.js oficial, o simplemente subir la carpeta `dist/` a la rama `gh-pages`

### Opción rápida (manual)

```bash
npm run build
# Subir el contenido de /dist a la rama gh-pages
git subtree push --prefix dist origin gh-pages
```

## Desarrollo

```bash
npm install
npm run dev
```

## Estructura

- `src/app/page.tsx` — Flujo principal (menú → juego → fin)
- `src/components/scenes/AdventureEngine.tsx` — Motor del juego
- `src/data/historia.ts` — Misiones, items, diálogos, puzles
- `src/context/GameContext.tsx` — Estado global
- `public/escenas/` — Imágenes de fondo

## Créditos

Hecho con <3 y un poco de vodka digital.
