# Story 004 — Verushka como personaje jugable (NavMeshAgent + Animator)

## Contexto
Hoy la interacción es 100% por clic directo sobre hotspots; no hay un
personaje jugable visible moviéndose por el escenario. `INSTALAR.md` lo
señala como pendiente y aclara que agregarlo "no toca nada de lo que ya
está".

## Alcance
- Bake de NavMesh en las 3 escenas construidas por `ConstructorEscenas`.
- Agregar un GameObject Verushka con `NavMeshAgent`: al clickear un
  hotspot, primero caminar hacia él (o hacia un punto de interacción
  asociado) y recién al llegar disparar la interacción actual.
- `Animator` con al menos caminar/idle (no hace falta animación de
  personaje final todavía — puede ser placeholder, igual que la
  geometría de hotspots).
- Punto de decisión abierto en el PRD: "cuánto se ve a Verushka" (¿retrato
  en diálogos o solo sprite?) — esta story resuelve el movimiento en el
  mundo, no esa decisión de diálogo; si hace falta, dejarla anotada para
  decidir aparte.

## Fuera de alcance
Sprite/arte final de Verushka, decisión de retrato en diálogos.

## Criterio de aceptación
En las 3 escenas, clickear un hotspot hace que Verushka camine hasta ahí
antes de ejecutar mirar/hablar/usar, sin romper ninguna interacción del
recorrido de `INSTALAR.md`.
