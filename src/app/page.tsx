// src/app/page.tsx
"use client";
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { INVENTARIO_BASE, MISIONES } from '@/data/historia';
import PointAndClickEngine from '@/components/scenes/PointAndClickEngine';

type Fase = 'menu' | 'juego' | 'fin';

export default function Home() {
  const { gameState, setGameState } = useGame();

  const [fase, setFase] = useState<Fase>('menu');
  const [nombreInput, setNombreInput] = useState('');
  const [generoSelected, setGeneroSelected] = useState<'Camarada' | 'Compañera'>('Camarada');
  const [misionActual, setMisionActual] = useState<number>(1905);

  const mainRef = useRef<HTMLElement>(null);

  // ── Fullscreen ──────────────────────────────────────────────────────────
  const activarFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      }
    } catch {
      // Fullscreen puede estar bloqueado en algunos navegadores — continuamos igual
    }
  }, []);

  // ── Iniciar partida ─────────────────────────────────────────────────────
  const iniciarRevolucion = useCallback(() => {
    if (!nombreInput.trim()) {
      alert('¡El Partido exige un nombre para el registro, camarada!');
      return;
    }
    setGameState((prev) => ({
      ...prev,
      nombre: nombreInput.trim(),
      genero: generoSelected,
      año: 1905,
      ubicacion: 'San Petersburgo',
      inventario: INVENTARIO_BASE,
      fervor: 100,
    }));
    setMisionActual(1905);
    setFase('juego');
    activarFullscreen();
  }, [nombreInput, generoSelected, setGameState, activarFullscreen]);

  // ── Avanzar misión ──────────────────────────────────────────────────────
  const avanzarMision = useCallback(() => {
    const misionData = MISIONES[misionActual];
    const siguiente = misionData?.siguienteMision;
    if (siguiente && MISIONES[siguiente]) {
      setMisionActual(siguiente);
      setGameState((prev) => ({
        ...prev,
        año: siguiente,
        ubicacion: MISIONES[siguiente].ubicacion,
      }));
    } else {
      setFase('fin');
    }
  }, [misionActual, setGameState]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-paper-dark text-white overflow-hidden flex flex-col select-none"
    >
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
              {/* Estrella decorativa */}
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

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">
                    Nombre del Proletario
                  </label>
                  <input
                    className="w-full p-3 border-2 border-black bg-white focus:ring-2 ring-soviet-red outline-none uppercase font-bold text-sm placeholder:opacity-40 placeholder:normal-case"
                    placeholder="Tu nombre en el registro del Partido..."
                    value={nombreInput}
                    onChange={(e) => setNombreInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && iniciarRevolucion()}
                    maxLength={24}
                  />
                </div>

                {/* Género */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-2">
                    Identidad Revolucionaria
                  </label>
                  <div className="flex gap-2">
                    {(['Camarada', 'Compañera'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGeneroSelected(g)}
                        className={`flex-1 p-3 border-2 font-black text-xs uppercase tracking-widest transition-all ${
                          generoSelected === g
                            ? 'bg-soviet-red border-soviet-red text-white shadow-[3px_3px_0_rgba(0,0,0,0.3)]'
                            : 'bg-white border-black text-black hover:bg-gray-100'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={iniciarRevolucion}
                  className="w-full bg-black text-white p-4 font-black uppercase tracking-widest text-sm hover:bg-soviet-red transition-all shadow-[4px_4px_0px_0px_theme(colors.soviet-red)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 mt-2"
                >
                  ¡A LA REVOLUCIÓN! (FULLSCREEN)
                </button>

                <p className="text-center text-[9px] opacity-40 uppercase tracking-widest">
                  1905 · San Petersburgo · Fábrica Putilov
                </p>
              </div>
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
            {/* HUD SUPERIOR */}
            <div className="absolute top-0 left-0 right-0 z-40 flex justify-between items-start px-4 pt-4 pointer-events-none">
              {/* Info jugador */}
              <div className="pointer-events-auto">
                <div className="bg-black/80 border border-yellow-400/40 px-3 py-1.5">
                  <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest leading-tight">
                    {gameState.genero} {gameState.nombre}
                  </p>
                  <p className="text-white/60 text-[9px] uppercase tracking-widest">
                    Año {gameState.año} · {gameState.ubicacion}
                  </p>
                </div>
              </div>

              {/* Barra de fervor */}
              <div className="pointer-events-auto text-right">
                <div className="bg-black/80 border border-yellow-400/40 px-3 py-1.5">
                  <p className="text-yellow-400 text-[9px] font-black uppercase tracking-widest mb-1">
                    Fervor Revolucionario
                  </p>
                  <div className="w-36 h-2.5 bg-black border border-yellow-400/40 overflow-hidden">
                    <motion.div
                      className="h-full bg-soviet-red"
                      initial={{ width: 0 }}
                      animate={{ width: `${gameState.fervor}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-white/40 text-[8px] uppercase tracking-widest mt-0.5 text-right">
                    {gameState.fervor}%
                  </p>
                </div>
              </div>
            </div>

            {/* MOTOR POINT & CLICK */}
            <div className="flex-1 w-full h-full">
              <PointAndClickEngine
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
                Lenin murió. La revolución sobrevivió. Vos también (por ahora).
              </p>
              <p className="text-white/40 text-sm mb-8 italic">
                El camarada Stalin quiere verte en su oficina.
              </p>
              <button
                onClick={() => {
                  setFase('menu');
                  setNombreInput('');
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
