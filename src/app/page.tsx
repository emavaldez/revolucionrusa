// src/app/page.tsx
"use client";
import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes de la UI y Escenas
import Inventory from '@/components/ui/Inventory';
import DueloDialectico from '@/components/scenes/DueloDialectico';

// Datos históricos
import { HISTORIA, ITEMS_INICIALES } from '@/data/historia';

export default function Home() {
  const { gameState, setGameState } = useGame();
  
  // Estados locales para el flujo del juego
  const [fase, setFase] = useState<'menu' | 'historia' | 'combate'>('menu');
  const [nombreInput, setNombreInput] = useState('');
  const [generoSelected, setGeneroSelected] = useState('Camarada');

  // 1. Lógica para iniciar la partida
  const iniciarRevolucion = () => {
    if (!nombreInput.trim()) return alert("¡El Partido exige un nombre para el registro!");
    
    setGameState({
      ...gameState,
      nombre: nombreInput,
      genero: generoSelected,
      inventario: ITEMS_INICIALES,
    });
    setFase('historia');
  };

  // 2. Lógica para manejar decisiones narrativas
  const manejarDecision = (opt: any) => {
    // Actualizamos el fervor (puntos de vida/energía política)
    setGameState((prev: any) => ({
      ...prev,
      fervor: Math.min(100, Math.max(0, prev.fervor + (opt.fervor || 0))),
    }));

    // Si la opción lleva a un debate, cambiamos a modo combate
    if (opt.siguiente === "debate") {
      setFase('combate');
    } else {
      alert(`Decisión registrada: ${opt.texto}. El destino de la clase obrera ha cambiado.`);
    }
  };

  return (
    <main className="min-h-screen bg-paper-dark text-white overflow-x-hidden font-sans">
      <AnimatePresence mode="wait">
        
        {/* --- PANTALLA DE MENÚ / INICIO --- */}
        {fase === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex items-center justify-center min-h-screen p-4"
          >
            <div className="bg-paper-light p-8 border-8 border-double border-soviet-red max-w-md w-full text-black shadow-2xl">
              <h1 className="text-5xl font-black text-center mb-2 text-soviet-red uppercase tracking-tighter">
                REVOLUCIÓN RUSA
              </h1>
              <p className="text-center text-[10px] uppercase tracking-[0.3em] mb-8 font-bold opacity-70">
                Aventura Dialéctica 1905 — 1924
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
                    CAMARADA (M)
                  </button>
                  <button 
                    onClick={() => setGeneroSelected("Compañera")}
                    className={`flex-1 p-2 border-2 border-black font-black text-xs transition-all ${generoSelected === 'Compañera' ? 'bg-soviet-red text-white' : 'bg-white text-black'}`}
                  >
                    COMPAÑERA (F)
                  </button>
                </div>

                <button 
                  onClick={iniciarRevolucion}
                  className="w-full bg-black text-white p-5 font-black hover:bg-soviet-red transition-all shadow-[4px_4px_0px_0px_rgba(190,17,17,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  FORJAR EL DESTINO
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PANTALLA DE HISTORIA / NARRATIVA --- */}
        {fase === 'historia' && (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-12 max-w-5xl mx-auto"
          >
            {/* HUD SUPERIOR */}
            <div className="flex justify-between items-end border-b-4 border-soviet-gold pb-4 mb-12">
              <div>
                <p className="text-[10px] uppercase font-bold text-soviet-gold tracking-widest">Identidad</p>
                <p className="text-2xl font-black italic">{gameState.genero} {gameState.nombre}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-soviet-gold tracking-widest text-right">Fervor Revolucionario</p>
                <div className="w-48 h-4 bg-black border border-soviet-gold mt-1 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${gameState.fervor}%` }}
                    className="h-full bg-soviet-red"
                  />
                </div>
              </div>
            </div>

            {/* CONTENIDO DE LA ESCENA */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-paper-light text-black p-8 border-l-[12px] border-soviet-red shadow-xl">
                <p className="text-xs font-bold mb-1 opacity-50 tracking-tighter">SAN PETERSBURGO, {gameState.año}</p>
                <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">{HISTORIA[1905].titulo}</h2>
                
                <p className="text-lg leading-relaxed mb-8 first-letter:text-5xl first-letter:font-black first-letter:mr-2 first-letter:float-left">
                  {HISTORIA[1905].descripcion}
                </p>

                <div className="bg-black/5 p-6 border-y-2 border-black/10 mb-8 italic text-lg">
                  <span className="font-bold text-soviet-red not-italic">{HISTORIA[1905].npc}: </span>
                  "{HISTORIA[1905].dialogo_inicial}"
                </div>

                <div className="space-y-3">
                  {HISTORIA[1905].opciones.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => manejarDecision(opt)}
                      className="w-full text-left p-4 border-2 border-black font-bold hover:bg-black hover:text-white transition-all group flex justify-between items-center bg-white/40"
                    >
                      <span>{i + 1}. {opt.texto}</span>
                      <span className="opacity-0 group-hover:opacity-100 font-black text-soviet-red">★</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* BARRA LATERAL (INFO HISTÓRICA) */}
              <div className="space-y-6">
                <div className="bg-soviet-red p-4 border-2 border-soviet-gold text-white shadow-lg">
                  <h4 className="font-black uppercase text-xs mb-2 tracking-widest">Dato de Archivo:</h4>
                  <p className="text-sm italic opacity-90">
                    "La huelga en la fábrica Putilov comenzó por el despido de 4 trabajadores bolcheviques. Fue la chispa que inició 1905."
                  </p>
                </div>
              </div>
            </div>

            <Inventory />
          </motion.div>
        )}

        {/* --- MODO COMBATE DIALÉCTICO --- */}
        {fase === 'combate' && (
          <motion.div 
            key="combate"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="flex items-center justify-center min-h-screen bg-black p-4"
          >
            <div className="max-w-2xl w-full">
              <DueloDialectico onWin={() => setFase('historia')} />
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}