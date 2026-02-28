// src/app/page.tsx
"use client";
import { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

// El motor visual que creamos en el paso anterior
import PointAndClickEngine from '@/components/scenes/PointAndClickEngine';
import { INVENTARIO_BASE } from '@/data/historia';

export default function Home() {
  const { gameState, setGameState } = useGame();
  
  // Estados para controlar el flujo
  const [fase, setFase] = useState<'menu' | 'juego'>('menu');
  const [nombreInput, setNombreInput] = useState('');
  const [generoSelected, setGeneroSelected] = useState('Camarada');
  const [misionActual, setMisionActual] = useState(1905);
  
  const gameRef = useRef<HTMLElement>(null);

  // Poner el juego en pantalla completa
  const activarFullscreen = async () => {
    if (gameRef.current && !document.fullscreenElement) {
      await gameRef.current.requestFullscreen().catch(err => console.error(err));
    }
  };

  // Botón de forjar el destino
  const iniciarRevolucion = () => {
    if (!nombreInput.trim()) return alert("¡El Partido exige un nombre para el registro!");
    
    setGameState({
      ...gameState,
      nombre: nombreInput,
      genero: generoSelected,
      inventario: INVENTARIO_BASE,
      fervor: 100
    });
    setFase('juego');
    activarFullscreen();
  };

  const avanzarMision = () => {
    // @ts-ignore
    const siguiente = require('@/data/historia').MISIONES[misionActual].siguienteMision;
    if (siguiente) {
      setMisionActual(siguiente);
    } else {
      alert("¡Llegaste a 1924! El camarada Stalin quiere verte en su oficina...");
    }
  };

  return (
    <main ref={gameRef} className="min-h-screen bg-paper-dark text-white overflow-hidden font-sans flex flex-col">
      <AnimatePresence mode="wait">
        
        {/* --- PANTALLA DE MENÚ INICIAL (RECUPERADA Y MEJORADA) --- */}
        {fase === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex-1 flex items-center justify-center p-4 bg-black"
          >
            <div className="bg-paper-light p-8 border-8 border-double border-soviet-red max-w-md w-full text-black shadow-2xl relative z-10">
              <h1 className="text-5xl font-black text-center mb-2 text-soviet-red uppercase tracking-tighter">
                REVOLUCIÓN RUSA
              </h1>
              <p className="text-center text-[10px] uppercase tracking-[0.3em] mb-8 font-bold opacity-70">
                Aventura Gráfica 1905 — 1924
              </p>
              
              <div className="space-y-4">
                <input 
                  className="w-full p-4 border-2 border-black bg-white focus:ring-2 ring-soviet-red outline-none uppercase font-bold text-sm"
                  placeholder="Nombre del Proletario..."
                  value={nombreInput}
                  onChange={(e) => setNombreInput(e.target.value)}
                />
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setGeneroSelected("Camarada")}
                    className={`flex-1 p-2 border-2 border-black font-black text-xs transition-all ${generoSelected === 'Camarada' ? 'bg-soviet-red text-white' : 'bg-white text-black'}`}
                  >
                    CAMARADA
                  </button>
                  <button 
                    onClick={() => setGeneroSelected("Compañera")}
                    className={`flex-1 p-2 border-2 border-black font-black text-xs transition-all ${generoSelected === 'Compañera' ? 'bg-soviet-red text-white' : 'bg-white text-black'}`}
                  >
                    COMPAÑERA
                  </button>
                </div>

                <button 
                  onClick={iniciarRevolucion}
                  className="w-full bg-black text-white p-5 font-black hover:bg-soviet-red transition-all shadow-[4px_4px_0px_0px_rgba(190,17,17,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 mt-4"
                >
                  INICIAR PARTIDA (FULLSCREEN)
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PANTALLA DE JUEGO (MOTOR POINT & CLICK) --- */}
        {fase === 'juego' && (
          <motion.div 
            key="juego"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col bg-black relative"
          >
            {/* HUD SUPERIOR */}
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-start p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="pointer-events-auto">
                <p className="text-[10px] uppercase font-bold text-soviet-gold tracking-widest bg-black/50 px-2 rounded">
                  {gameState.genero} {gameState.nombre} | Año: {misionActual}
                </p>
              </div>
              <div className="text-right pointer-events-auto">
                <p className="text-[10px] uppercase font-bold text-soviet-gold tracking-widest bg-black/50 px-2 rounded mb-1">Fervor</p>
                <div className="w-32 h-2 bg-black border border-soviet-gold overflow-hidden">
                  <div 
                    className="h-full bg-soviet-red transition-all duration-500"
                    style={{ width: `${gameState.fervor}%` }}
                  />
                </div>
              </div>
            </div>

            {/* CONTENEDOR DEL MOTOR POINT AND CLICK */}
            <div className="flex-1 w-full h-full flex items-center justify-center p-0 md:p-8">
               <PointAndClickEngine 
                  misionId={misionActual} 
                  onCompletar={avanzarMision} 
               />
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}