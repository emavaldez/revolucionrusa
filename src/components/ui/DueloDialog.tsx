// DueloDialectico UI Component
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RondaDuelo, PreguntaDuelo } from '@/lib/game/DueloDialecticoData';

interface Props {
  ronda: RondaDuelo;
  onComplete: (aciertos: number, total: number) => void;
  onCerrar: () => void;
}

export default function DueloDialog({ ronda, onComplete, onCerrar }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [pregCompletadas, setPregCompletadas] = useState(0);

  const pregunta: PreguntaDuelo = ronda.preguntas[currentIdx];
  const esUltima = currentIdx >= ronda.preguntas.length - 1;

  const handleRespuesta = (idx: number) => {
    setSeleccionada(idx);
    setMostrarExplicacion(true);
    if (pregunta.respuestas[idx].correcta) {
      setAciertos((a) => a + 1);
    }
  };

  const handleSiguiente = () => {
    setPregCompletadas((p) => p + 1);
    if (esUltima) {
      const totalAciertos = aciertos + (seleccionada !== null && pregunta.respuestas[seleccionada]?.correcta ? 0 : 0);
      onComplete(aciertos, ronda.preguntas.length);
    } else {
      setCurrentIdx((i) => i + 1);
      setSeleccionada(null);
      setMostrarExplicacion(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-b from-black to-gray-900 border-2 border-soviet-red max-w-2xl w-full mx-4 shadow-2xl"
      >
        {/* Header */}
        <div className="bg-soviet-red/20 border-b border-soviet-red/30 px-6 py-3 flex items-center gap-3">
          <span className="text-2xl">{ronda.emoji}</span>
          <div>
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.3em]">DUELO DIALÉCTICO</p>
            <p className="text-white font-bold text-sm">{ronda.nombre}</p>
          </div>
          <div className="ml-auto text-[10px] text-white/40 font-mono">
            {currentIdx + 1} / {ronda.preguntas.length}
          </div>
        </div>

        <div className="p-6">
          {/* Contexto */}
          {pregunta.contexto && (
            <p className="text-white/50 text-xs italic mb-3 border-l-2 border-white/20 pl-3">
              {pregunta.contexto}
            </p>
          )}

          {/* Pregunta */}
          <p className="text-white text-lg font-bold mb-4 leading-relaxed">
            {pregunta.pregunta}
          </p>

          {/* Respuestas */}
          <div className="space-y-2">
            {pregunta.respuestas.map((r, i) => {
              const isSelected = seleccionada === i;
              const isCorrect = r.correcta;
              let bgClass = 'bg-white/5 border-white/20 hover:bg-white/10';
              if (isSelected && mostrarExplicacion) {
                bgClass = isCorrect
                  ? 'bg-green-900/40 border-green-400'
                  : 'bg-red-900/40 border-red-400';
              } else if (isSelected) {
                bgClass = 'bg-yellow-900/30 border-yellow-400';
              }

              return (
                <button
                  key={i}
                  onClick={() => !mostrarExplicacion && handleRespuesta(i)}
                  disabled={mostrarExplicacion}
                  className={`w-full text-left p-3 border transition-all text-sm ${
                    isSelected && mostrarExplicacion && isCorrect
                      ? ''
                      : 'hover:scale-[1.01]'
                  } ${bgClass} ${
                    mostrarExplicacion && isCorrect && !isSelected
                      ? 'border-green-400/30 bg-green-900/10'
                      : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isSelected && mostrarExplicacion && (
                      <span>{isCorrect ? '✅' : '❌'}</span>
                    )}
                    <span className={isSelected && mostrarExplicacion && isCorrect ? 'text-green-300' : isSelected && mostrarExplicacion ? 'text-red-300' : 'text-white'}>{r.texto}</span>
                  </span>
                  {isSelected && mostrarExplicacion && (
                    <span className="block text-[10px] mt-1 opacity-70">{r.feedback}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explicación */}
          <AnimatePresence>
            {mostrarExplicacion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 border-l-2 border-yellow-400 bg-yellow-400/5"
              >
                <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-1">📖 DATO HISTÓRICO</p>
                <p className="text-white/70 text-sm">{pregunta.explicacion}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón siguiente */}
          {mostrarExplicacion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex gap-3 justify-end"
            >
              <button
                onClick={handleSiguiente}
                className="bg-soviet-red text-white px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all"
              >
                {esUltima ? '✅ Finalizar Duelo' : 'Siguiente Pregunta →'}
              </button>
            </motion.div>
          )}
        </div>

        {/* Botón cerrar */}
        {!mostrarExplicacion && (
          <button
            onClick={onCerrar}
            className="w-full text-center py-2 text-[10px] text-white/30 uppercase tracking-widest hover:text-white/60"
          >
            [ Abandonar Duelo ]
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
