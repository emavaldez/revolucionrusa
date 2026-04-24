// src/app/page.tsx
"use client";
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { INVENTARIO_BASE, MISIONES } from '@/data/historia';
import AdventureEngine from '@/components/scenes/AdventureEngine';

type Fase = 'menu' | 'juego' | 'fin';

export default function Home() {
  const { gameState, setGameState } = useGame();

  const [fase, setFase] = useState<Fase>('menu');
  const [misionActual, setMisionActual] = useState<number>(1905);

  // ── Iniciar partida ─────────────────────────────────────────────────────
  const iniciarRevolucion = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      nombre: 'Alexandra',
      genero: 'Camarada',
      año: 1905,
      ubicacion: 'San Petersburgo',
      inventario: INVENTARIO_BASE,
      fervor: 100,
      misionesCompletadas: [],
      pistasUsadas: 0,
    }));
    setMisionActual(1905);
    setFase('juego');
  }, [setGameState]);

  // ── Avanzar misión ──────────────────────────────────────────────────────
  const avanzarMision = useCallback(() => {
    const misionData = MISIONES[misionActual];
    const siguiente = misionData?.siguienteMision;
    if (siguiente && MISIONES[siguiente]) {
      setMisionActual(siguiente);
      setGameState((prev) => ({
        ...prev,
        año: MISIONES[siguiente].año,
        ubicacion: MISIONES[siguiente].ubicacion,
        misionesCompletadas: [...prev.misionesCompletadas, misionActual],
      }));
    } else {
      setFase('fin');
    }
  }, [misionActual, setGameState]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-paper-dark text-white overflow-hidden flex flex-col select-none">
      <AnimatePresence mode="wait">

        {/* ════════════════════════════════════════════════════════════════
            PANTALLA DE MENÚ
        ════════════════════════════════════════════════════════════════ */}
        {fase === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex items-center justify-center p-4 bg-black min-h-screen"
          >
            {/* Fondo textura */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,.03) 2px,rgba(255,255,255,.03) 4px)',
              }}
            />

            <div className="relative bg-paper-light p-8 border-8 border-double border-soviet-red max-w-md w-full text-black shadow-2xl">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl">⭐</div>

              <h1 className="text-4xl md:text-5xl font-black text-center mb-1 text-soviet-red uppercase tracking-tighter leading-none">
                REVOLUCIÓN RUSA
              </h1>
              <p className="text-center text-[9px] uppercase tracking-[0.4em] mb-1 font-bold opacity-60">
                Aventura Dialéctica
              </p>
              <p className="text-center text-[10px] uppercase tracking-[0.25em] mb-8 font-bold opacity-50">
                1905 — 1924
              </p>

              <div className="text-center mb-6">
                <div className="inline-block p-4 border-2 border-black bg-white">
                  <p className="text-xs uppercase tracking-widest font-black mb-2">Protagonista</p>
                  <div className="text-4xl mb-2">👩‍🌾</div>
                  <p className="text-sm font-black uppercase">Alexandra Kollontai</p>
                  <p className="text-[9px] text-black/60 mt-1">Revolucionaria. Mujer. Inevitable.</p>
                </div>
              </div>

              <button
                onClick={iniciarRevolucion}
                className="w-full bg-black text-white p-4 font-black uppercase tracking-widest text-sm hover:bg-soviet-red transition-all shadow-[4px_4px_0px_0px_theme(colors.soviet-red)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                ¡A LA REVOLUCIÓN!
              </button>

              <p className="text-center text-[9px] opacity-40 uppercase tracking-widest mt-4">
                7 misiones · Point & Click · Música · Historia
              </p>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PANTALLA DE JUEGO
        ════════════════════════════════════════════════════════════════ */}
        {fase === 'juego' && (
          <motion.div
            key="juego"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col relative min-h-screen"
          >
            <div className="flex-1 w-full h-full">
              <AdventureEngine
                misionId={misionActual}
                onCompletar={avanzarMision}
              />
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PANTALLA FINAL
        ════════════════════════════════════════════════════════════════ */}
        {fase === 'fin' && (
          <motion.div
            key="fin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center bg-black min-h-screen"
          >
            <div className="text-center border-4 border-double border-yellow-400 bg-black/90 px-12 py-10 max-w-lg">
              <div className="text-6xl mb-4">☭</div>
              <h2 className="text-4xl font-black text-yellow-400 uppercase tracking-widest mb-3">
                1924
              </h2>
              <p className="text-white/80 text-lg mb-2">
                Alexandra caminó por la historia. De la fábrica al mausoleo. Del pan duro al piano.
              </p>
              <p className="text-white/40 text-sm mb-2 italic">
                La revolución no fue un evento. Fue un oficio.
              </p>
              <p className="text-yellow-400/60 text-xs uppercase tracking-widest mb-8">
                Misiones completadas: {gameState.misionesCompletadas.length + 1}
              </p>
              <button
                onClick={() => {
                  setFase('menu');
                }}
                className="bg-soviet-red text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all"
              >
                Volver a Empezar
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
