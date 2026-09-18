# Story 003 — Migrar el HUD de IMGUI a UI Toolkit

## Contexto
`Runtime/UI/HUD.cs` está hecho con IMGUI (OnGUI). Es funcional y ya usa la
paleta constructivista definitiva (ver `docs/architecture.md` §Arte /
`verushka-arte-e-historia.md` en el proyecto RR para los hex), pero
`INSTALAR.md` lo marca explícitamente como provisorio: "se reemplaza
entero por UI Toolkit cuando haya arte. Ningún otro sistema depende de
él."

## Alcance
- Recrear la misma funcionalidad de `HUD.cs` (verbos Mirar/Hablar/Usar,
  inventario, texto de diálogo, panel de duelo dialéctico) como UXML +
  USS + un controlador en C# sobre UI Toolkit.
- Mismo contrato de entrada/salida con `Juego.cs` que el HUD actual, para
  no tocar el resto del motor.
- Conservar la paleta: rojo `#C8102E`, negro `#141210`, crema `#E8DCC0`,
  gris tierra `#3A3632` (nada de rojo saturado en superficies grandes).

## Fuera de alcance
Rediseño visual del HUD más allá de portar lo existente — si aparece arte
de UI nuevo, es una story aparte.

## Criterio de aceptación
El recorrido completo de `INSTALAR.md` (los 3 actos) funciona igual que
hoy pero con el HUD nuevo; `HUD.cs` (IMGUI) queda removido o deprecado.
