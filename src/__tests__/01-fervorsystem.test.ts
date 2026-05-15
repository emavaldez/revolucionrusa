// Tests exhaustivos para sistemas del juego Revolución Rusa
// Test 1: FervorSystem — decisiones, epílogos, cálculos de fervor
import { describe, it, expect } from 'vitest';
import { DECISIONES, calcularEpilogo } from '@/lib/game/FervorSystem';

describe('FervorSystem', () => {
  // ── Verificar que todas las misiones con decisiones tengan opciones válidas ──
  describe('DECISIONES', () => {
    const misiones = Object.keys(DECISIONES).map(Number);

    it('tiene decisiones para las misiones correctas', () => {
      expect(misiones).toContain(1905);
      expect(misiones).toContain(1917);
      expect(misiones).toContain(1918);
      expect(misiones).toContain(1921);
      expect(misiones).toContain(1922);
    });

    it('cada decisión tiene al menos 2 opciones', () => {
      for (const misionId of misiones) {
        for (const decision of DECISIONES[misionId]) {
          expect(
            decision.opciones.length,
            `Mis ${misionId}: '${decision.id}' tiene menos de 2 opciones`
          ).toBeGreaterThanOrEqual(2);
        }
      }
    });

    it('cada opción tiene un id único', () => {
      const allIds = new Set<string>();
      for (const misionId of misiones) {
        for (const decision of DECISIONES[misionId]) {
          for (const opcion of decision.opciones) {
            expect(
              allIds.has(opcion.id),
              `Opcion duplicada: ${opcion.id}`
            ).toBe(false);
            allIds.add(opcion.id);
          }
        }
      }
    });

    it('cada opción tiene setFlag o pertenece a una decisión crítica', () => {
      for (const misionId of misiones) {
        for (const decision of DECISIONES[misionId]) {
          for (const opcion of decision.opciones) {
            expect(
              opcion.setFlag,
              `Mis ${misionId}, dec '${decision.id}', op '${opcion.id}': falta setFlag`
            ).toBeTruthy();
          }
        }
      }
    });

    it('los valores de fervorDelta son consistentes', () => {
      for (const misionId of misiones) {
        for (const decision of DECISIONES[misionId]) {
          const deltas = decision.opciones.map((o) => o.fervorDelta);
          // Debe haber al menos una opción positiva y una negativa (diversidad)
          const hasPositive = deltas.some((d) => d > 0);
          const hasNegative = deltas.some((d) => d < 0);
          expect(
            hasPositive || hasNegative,
            `Mis ${misionId}, dec '${decision.id}': todas las opciones tienen el mismo signo`
          ).toBe(true);
        }
      }
    });

    it('cada opción tiene descripcionResultado', () => {
      for (const misionId of misiones) {
        for (const decision of DECISIONES[misionId]) {
          for (const opcion of decision.opciones) {
            expect(
              opcion.descripcionResultado,
              `Mis ${misionId}, dec '${decision.id}', op '${opcion.id}': falta descripcion`
            ).toBeTruthy();
          }
        }
      }
    });
  });

  // ── Verificar calcularEpilogo ──
  describe('calcularEpilogo', () => {
    it('epílogo radical con fervor alto y Romanov ejecutados', () => {
      const ep = calcularEpilogo(90, {
        ro_ejecutado: true,
        bl_guerra: true,
      });
      expect(ep.titulo).toBe('LA LLAMA RADICAL');
      expect(ep.texto).toContain('Stalin');
    });

    it('epílogo disidente con Romanov salvados y Kronstadt', () => {
      const ep = calcularEpilogo(20, {
        ro_salvado: true,
        kr_apoyado: true,
      });
      expect(ep.titulo).toBe('LA DISIDENTE');
    });

    it('epílogo superviviente con alianza a Stalin', () => {
      const ep = calcularEpilogo(60, {
        sr_stalin: true,
      });
      expect(ep.titulo).toBe('LA SUPERVIVIENTE');
    });

    it('epílogo diplomática con paz firmada y fervor medio', () => {
      const ep = calcularEpilogo(55, {
        bl_firmado: true,
      });
      expect(ep.titulo).toBe('LA DIPLOMÁTICA');
    });

    it('epílogo default sin flags especiales', () => {
      const ep = calcularEpilogo(50, {});
      expect(ep.titulo).toBe('EL LEGADO DE ALEXANDRA');
    });

    it('todos los epílogos tienen texto e imagen', () => {
      const combos = [
        [{ fervor: 90, flags: { ro_ejecutado: true, bl_guerra: true } }],
        [{ fervor: 20, flags: { ro_salvado: true, kr_apoyado: true } }],
        [{ fervor: 60, flags: { sr_stalin: true } }],
        [{ fervor: 50, flags: { bl_firmado: true } }],
        [{ fervor: 70, flags: {} }],
      ];
      for (const [c] of combos) {
        const ep = calcularEpilogo(c.fervor, c.flags);
        expect(ep.titulo).toBeTruthy();
        expect(ep.texto).toBeTruthy();
        expect(ep.texto.length).toBeGreaterThan(50);
        expect(ep.imagen).toBeTruthy();
      }
    });
  });
});
