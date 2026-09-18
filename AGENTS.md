<!-- wf:contract:start -->
# Contrato de workflow supervisado (wf)

Este repositorio usa un modelo supervisor-worker gestionado por `wf`.

## Autoridad

1. **La persona usuaria** aprueba el despacho y el merge (gates humanos).
2. **La sesión Hermes** (supervisor) planifica, escribe `assignment.md` y audita el diff. No implementa la asignación por su cuenta.
3. **El worker Hermes headless** implementa dentro del worktree de la tarea y reporta evidencia. No amplía alcance ni aprueba su propio trabajo.

## Protocolo obligatorio

Antes de asignar o auditar: leer `workflow/runs/<id>/state.json` y `assignment.md`, y los docs relevantes del repo.

Al implementar, el worker debe:
- comprobar que `dispatch.approved` sea `true`;
- permanecer en el worktree y rama `task/<id>`;
- no modificar `audit.md` ni marcar su trabajo como aprobado;
- registrar resumen, archivos, pruebas y riesgos en `implementation.md`;
- commitear en la rama de tarea y registrar con `wf record-impl -i <id>`;
- detenerse ante una decisión arquitectónica no contemplada.

Al auditar, el supervisor debe:
- revisar el diff completo contra la asignación (no confiar en el resumen del worker);
- comprobar arquitectura, compatibilidad, seguridad y pruebas;
- escribir hallazgos accionables en `audit.md`;
- registrar el dictamen con `wf record-audit` sin hacer merge.

## Límites

- Máximo de correcciones: `workflow/config.json` (`maxCorrectionCycles`).
- No se fusiona con tests fallidos, auditoría incompleta o estado inválido.
- No se guardan tokens, credenciales o datos sensibles.
<!-- wf:contract:end -->
