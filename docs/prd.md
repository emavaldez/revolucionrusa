# PRD — VERUSHKA

Estado: v1, 2026-09-18. Consolida `verushka-diseno.md` y
`verushka-arte-e-historia.md` (docs del proyecto RR) más las decisiones
tomadas desde entonces. Reemplaza como fuente de verdad al GDD viejo
(`docs/planning/gdd.md` en el repo, tag `archive/nextjs-prototype`) que
describía el prototipo Next.js descartado.

## 1. Concepto

Aventura gráfica point-and-click. Vera Nikoláievna Sokolova ("Verushka"),
24 años, obrera textil de Výborg, no afiliada a nada cuando empieza el
juego. Petrogrado, 23-25 de octubre de 1917 (calendario juliano). Referentes:
Monkey Island en estructura y mecánica, Grim Fandango en tono.

Escala: ~2 horas, 3 escenarios, 15 puzzles, un acto largo en tres
movimientos. Cuatro epílogos según lo que el jugador hizo. Ninguno es
el correcto.

## 2. Decisiones de diseño cerradas

- **Idioma**: español rioplatense.
- **Momento**: 23-25 de octubre de 1917 (no 1905-1924 del prototipo viejo).
- **Verushka no milita al empezar** — condición para que los cuatro finales
  funcionen.
- **Nadie gana nada a los tiros**: todo conflicto se resuelve hablando,
  engañando o alimentando a alguien.
- **Arte**: 2.5D, fondos pintados con personajes encima. Paleta
  constructivista de 4 colores (ver `docs/architecture.md` §Arte).
- **Acto prototipado primero**: Acto II (Výborg) — tiene los tres tipos de
  puzle del juego y no depende de nada. *(ya construido; ver estado)*
- **Cuánto se ve a Verushka**: sin definir todavía si hay retrato en
  diálogos o solo sprite/cámara en primera persona de interacción.
- **Voces**: sin voz (decisión de costo, el texto lleva el tono).

## 3. Mecánica

Tres verbos: Mirar / Hablar / Usar, más inventario. Sin grilla de 9 verbos
estilo SCUMM.

**Duelo dialéctico**: equivalente al duelo de insultos de Monkey Island y el
sistema para resolver todos los conflictos importantes. Se pierde el primer
asalto a propósito para aprender el argumento del rival; ese argumento queda
en la libreta (`Estado.argumentos`) y sirve después contra otro rival. Tres
duelos obligatorios, uno por acto.

**Dos ejes ocultos** deciden el epílogo (no se muestran en HUD durante el
juego): convicción (sigue creyendo / dejó de creer) y método (mantuvo el
método / hizo lo necesario). Se acumulan en decisiones puntuales de diálogo
y de duelo.

## 4. Estructura y contenido

### Acto I — Instituto Smolny
Objetivo: que el Comité Militar Revolucionario tome en serio a Verushka.
Homenaje a las tres pruebas de Monkey Island. Personajes: centinela,
"Konstantin Ivanov" (Lenin disfrazado — sin ninguna iconografía leninista:
ni barba, ni gorra obrera, ni pose de orador), Mártov (tuberculoso), Trotski,
Stalin (siempre sentado, nunca en el centro del cuadro).

### Acto II — Barrio de Výborg
El tranvía parado por huelga (duelo dialéctico I, contra el delegado del
sindicato), la central telefónica, el cadete del puente, el marinero del
Aurora (decisión 1: falsificar la firma de Stalin o volver sin el crucero),
la imprenta enemiga (decisión 2: romper la prensa o convencer al editor).

### Acto III — Palacio de Invierno
La puerta de servicio (se entra casi caminando — verdad histórica, no
asalto armado), la bodega del Zar (neutralizar a los últimos defensores
con vino, sin un tiro), el cadete del puente otra vez (decisión 3, "el
corazón del juego": reducirlo, convencerlo o dejarlo correr), la sala del
Gobierno Provisional (decisión 4: qué se escribe en el acta — el asalto
real tuvo 5 muertos; la imagen épica viene de Eisenstein 1927).

### Epílogo — Kronstadt, marzo de 1921
Cuatro finales según los dos ejes, ya escritos en `Contenido/contenido.json`:
**la comisaria** (cree + método duro), **la que no aflojó / purgada** (cree +
mantuvo el método), **la que se fue / exilio** (dejó de creer + método duro),
**la que volvió abajo / telar** (dejó de creer + mantuvo el método).

## 5. Reglas de veracidad histórica

(De `verushka-arte-e-historia.md` — aplican a todo contenido nuevo)

1. Nada de hoz y martillo — es de 1918 en adelante.
2. Nada de uniformes del Ejército Rojo — se funda en 1918; acá hay Guardias
   Rojos (obreros de civil con brazalete rojo y fusil).
3. Fechas en calendario juliano (25 oct = 7 nov gregoriano).
4. El asalto al Palacio no fue un asalto — 5 muertos en total, se entró
   caminando; la imagen épica es de Eisenstein.
5. Kerenski huyó la mañana del 25, antes del asalto, en auto — no se
   disfrazó de enfermera (propaganda posterior).

## 6. Fuera de alcance

Multijugador, guardado/cargado de partida, localización a otros idiomas,
mobile nativo, doblaje.

## 7. Estado actual (repone el "qué falta" de este PRD)

Ver `docs/architecture.md` §Estado de implementación y `docs/stories/`.
