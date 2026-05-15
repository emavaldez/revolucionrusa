// src/app/page.tsx — Updated with ThreeEngine and Epilogue system
"use client";
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { INVENTARIO_BASE } from '@/data/historia';
import ThreeEngine from '@/components/scenes/ThreeEngine';
import { calcularEpilogo } from '@/lib/game/FervorSystem';

type Fase = 'menu' | 'juego' | 'epilogo' | 'fin';

// Orden de misiones
const ORDEN_MISIONES: number[] = [1905, 1905.1, 1912, 1917, 1917.1, 1918, 1918.1, 1919, 1921, 1922, 1924];

export default function Home() {
  const { gameState, setGameState, resetGame } = useGame();

  const [fase, setFase] = useState<Fase>('menu');
  const [misionIdx, setMisionIdx] = useState(0);
  const [epilogo, setEpilogo] = useState<{ titulo: string; texto: string; imagen: string } | null>(null);

  const misionActual = ORDEN_MISIONES[misionIdx];

  const iniciarRevolucion = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      nombre: 'Alexandra',
      genero: 'Camarada',
      año: 1905,
      ubicacion: 'San Petersburgo',
      inventario: [...INVENTARIO_BASE],
      fervor: 50,
      misionesCompletadas: [],
      pistasUsadas: 0,
      decisiones: [],
      codexDesbloqueados: [],
      flags: {},
    }));
    setMisionIdx(0);
    setFase('juego');
  }, [setGameState]);

  const avanzarMision = useCallback(() => {
    const nextIdx = misionIdx + 1;

    // Update game state
    setGameState((prev) => ({
      ...prev,
      misionesCompletadas: [...prev.misionesCompletadas, misionActual],
    }));

    if (nextIdx >= ORDEN_MISIONES.length) {
      // Show epilogue based on decisions
      const ep = calcularEpilogo(gameState.fervor, gameState.flags);
      setEpilogo(ep);
      setFase('epilogo');
    } else {
      setMisionIdx(nextIdx);
    }
  }, [misionIdx, misionActual, gameState.fervor, gameState.flags, setGameState]);

  return (
    <main className="min-h-screen bg-paper-dark text-white overflow-hidden flex flex-col select-none">
      <AnimatePresence mode="wait">
        {/* ══════════════════════════════════════
            MENU PRINCIPAL
        ══════════════════════════════════════ */}
        {fase === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex items-center justify-center p-4 bg-black min-h-screen relative overflow-hidden"
          >
            {/* Fondo animado de nieve con CSS */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white/20"
                  style={{
                    width: 2 + Math.random() * 4,
                    height: 2 + Math.random() * 4,
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animation: `fall ${5 + Math.random() * 10}s linear infinite`,
                    animationDelay: `${Math.random() * 10}s`,
                    opacity: 0.3 + Math.random() * 0.5,
                  }}
                />
              ))}
            </div>

            <div className="relative bg-paper-light p-8 border-8 border-double border-soviet-red max-w-md w-full text-black shadow-2xl">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl">⭐</div>

              <h1 className="text-4xl md:text-5xl font-black text-center mb-1 text-soviet-red uppercase tracking-tighter leading-none">
                REVOLUCIÓN RUSA
              </h1>
              <p className="text-center text-[9px] uppercase tracking-[0.4em] mb-1 font-bold opacity-60">
                Aventura Dialéctica — Edición 3D
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
                11 misiones · 3D · Historia real · Decisiones con consecuencias
              </p>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════
            JUEGO
        ══════════════════════════════════════ */}
        {fase === 'juego' && (
          <motion.div
            key={`juego-${misionActual}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col relative min-h-screen"
          >
            <div className="flex-1 w-full h-full">
              <ThreeEngine
                key={misionActual}
                misionId={misionActual}
                onCompletar={avanzarMision}
              />
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════
            EPÍLOGO
        ══════════════════════════════════════ */}
        {fase === 'epilogo' && epilogo && (
          <motion.div
            key="epilogo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="flex-1 flex items-center justify-center bg-black min-h-screen relative overflow-hidden"
          >
            {/* Fondo con nieve */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white/20"
                  style={{
                    width: 2 + Math.random() * 4,
                    height: 2 + Math.random() * 4,
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animation: `fall ${8 + Math.random() * 12}s linear infinite`,
                    animationDelay: `${Math.random() * 10}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative text-center border-4 border-double border-yellow-400 bg-black/90 px-12 py-10 max-w-lg">
              <div className="text-6xl mb-4">☭</div>
              <h2 className="text-3xl font-black text-yellow-400 uppercase tracking-widest mb-4">
                {epilogo.titulo}
              </h2>
              <p className="text-white/80 text-base leading-relaxed mb-4">
                {epilogo.texto}
              </p>
              <div className="border-t border-white/10 pt-4 mb-6">
                <p className="text-yellow-400/60 text-[10px] uppercase tracking-widest mb-2">
                  TU REVOLUCIÓN
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-yellow-400 font-black">{gameState.fervor}</span>
                    <span className="text-white/40 ml-1">Fervor Final</span>
                  </div>
                  <div>
                    <span className="text-yellow-400 font-black">{gameState.misionesCompletadas.length + 1}</span>
                    <span className="text-white/40 ml-1">Misiones</span>
                  </div>
                  <div>
                    <span className="text-yellow-400 font-black">{gameState.decisiones.length}</span>
                    <span className="text-white/40 ml-1">Decisiones</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  resetGame();
                  setFase('menu');
                  setEpilogo(null);
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
