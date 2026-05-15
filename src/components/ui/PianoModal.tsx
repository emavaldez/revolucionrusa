// PianoModal — Puzzle de piano mejorado con La Internacional completa
'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tocarInternacional, tocarNotasPuzzle, MELODIA_COMPLETA } from '@/lib/audio/LaInternacional';

interface Props {
  onSuccess: () => void;
  onCerrar: () => void;
  esFinal?: boolean; // si es el piano del epílogo (versión completa)
}

const NOTAS_PIANO = [
  { nota: 'C', freq: 261.63, label: 'Do' },
  { nota: 'D', freq: 293.66, label: 'Re' },
  { nota: 'E', freq: 329.63, label: 'Mi' },
  { nota: 'F', freq: 349.23, label: 'Fa' },
  { nota: 'G', freq: 392.00, label: 'Sol' },
  { nota: 'A', freq: 440.00, label: 'La' },
  { nota: 'B', freq: 493.88, label: 'Si' },
  { nota: 'C2', freq: 523.25, label: 'Do' },
];

const SECUENCIA_PUZZLE = ['C', 'E', 'G', 'C2'];
const COLOR_TECLAS = ['#f5f5f0', '#f0f0e8', '#f5f5f0', '#f0f0e8', '#f5f5f0', '#f0f0e8', '#f5f5f0', '#f0f0e8'];

export default function PianoModal({ onSuccess, onCerrar, esFinal }: Props) {
  const [notasTocadas, setNotasTocadas] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Tocá las primeras notas de La Internacional...');
  const [modoLibre, setModoLibre] = useState(false);
  const [tocando, setTocando] = useState(false);
  const playerRef = useRef<{ stop: () => void } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const tocarNota = (nota: string, freq: number) => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    if (modoLibre || esFinal) return;

    // Puzzle mode: check sequence
    const nuevaSecuencia = [...notasTocadas, nota];
    setNotasTocadas(nuevaSecuencia);

    const idx = nuevaSecuencia.length - 1;
    if (nuevaSecuencia[idx] !== SECUENCIA_PUZZLE[idx]) {
      setFeedback('❌ Desafinado. La Internacional empieza con Do - Mi - Sol - Do. Probá de nuevo.');
      setTimeout(() => setNotasTocadas([]), 1000);
      return;
    }

    if (nuevaSecuencia.length === SECUENCIA_PUZZLE.length) {
      setFeedback('✅ ¡La Internacional! Pero esto es solo el comienzo...');
      setModoLibre(true);
    } else {
      setFeedback(`✓ ${nuevaSecuencia.length} de 4 notas correctas...`);
    }
  };

  const tocarCancionCompleta = () => {
    setTocando(true);
    setFeedback('🎵 ¡LA INTERNACIONAL! ¡Que resuene en todo el mundo!');
    const ctx = getAudioCtx();
    playerRef.current = tocarInternacional(
      ctx,
      (nota, index, total) => {
        const progress = Math.round((index / total) * 100);
        setFeedback(`🎵 La Internacional — ${progress}% • ${nota.nombre}`);
      },
      () => {
        setFeedback('🎉 ¡La Internacional completa! El pueblo baila, la historia tiembla.');
        setTocando(false);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    );
  };

  const pararCancion = () => {
    playerRef.current?.stop();
    setTocando(false);
    setFeedback('Canción detenida. Tocá de nuevo cuando quieras.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-b from-amber-900 to-amber-950 border-4 border-double border-soviet-gold p-6 max-w-lg w-full text-white shadow-2xl"
      >
        {/* Título */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-black uppercase tracking-wider text-soviet-gold mb-1">
            🎹 La Internacional
          </h3>
          <p className="text-xs italic opacity-60">
            "Solo suena para quien conoce la canción del pueblo"
          </p>
        </div>

        {/* Feedback */}
        <div className="bg-black/50 border border-white/10 p-3 mb-4 text-center min-h-[60px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={feedback}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-sm font-bold ${
                feedback.includes('✅') || feedback.includes('🎉')
                  ? 'text-green-400'
                  : feedback.includes('❌')
                  ? 'text-red-400'
                  : feedback.includes('🎵')
                  ? 'text-yellow-400'
                  : 'text-white/70'
              }`}
            >
              {feedback}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Pistas */}
        {!modoLibre && !esFinal && (
          <div className="text-center mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400/60 mb-1">
              PISTA: La Internacional empieza con las notas
            </p>
            <p className="text-lg font-mono font-bold text-yellow-300">
              Do → Mi → Sol → Do
            </p>
          </div>
        )}

        {/* Teclado */}
        <div className="flex justify-center gap-1 mb-4">
          {NOTAS_PIANO.map((n, i) => (
            <button
              key={n.nota}
              onClick={() => tocarNota(n.nota, n.freq)}
              disabled={tocando}
              className={[
                'w-10 h-32 border-2 border-black/30 flex flex-col items-end justify-end pb-3 transition-all duration-100',
                tocando ? 'opacity-50' : 'hover:scale-105 hover:shadow-lg',
              ].join(' ')}
              style={{ backgroundColor: COLOR_TECLAS[i] }}
            >
              <span className="text-[9px] font-black text-black/40">{n.label}</span>
            </button>
          ))}
        </div>

        {/* Notas tocadas */}
        {!modoLibre && !esFinal && (
          <div className="text-center text-xs text-white/40 mb-4 font-mono">
            Últimas notas: {notasTocadas.join(' - ') || '...'}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          {modoLibre && !tocando && (
            <button
              onClick={tocarCancionCompleta}
              className="flex-1 bg-soviet-red text-white py-3 font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-all hover:scale-[1.02]"
            >
              🎵 Tocar La Internacional Completa
            </button>
          )}
          {tocando && (
            <button
              onClick={pararCancion}
              className="flex-1 bg-red-900 text-white py-3 font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-all"
            >
              ⏹ Detener
            </button>
          )}
          {modoLibre && !tocando && (
            <button
              onClick={onCerrar}
              className="px-4 py-3 text-xs uppercase tracking-widest text-white/40 hover:text-white border border-white/20 hover:border-white/40 transition-all"
            >
              Cerrar
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
