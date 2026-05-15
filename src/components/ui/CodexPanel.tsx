// CodexPanel — Panel de entradas históricas desbloqueadas
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { CODEX_ENTRIES, getDesbloqueados } from '@/lib/game/HistoricalCodex';
import type { CodexEntry } from '@/lib/game/HistoricalCodex';
import { useState, useMemo } from 'react';

interface Props {
  flags: Record<string, boolean>;
  onCerrar: () => void;
}

const CATEGORIAS = ['personaje', 'evento', 'lugar', 'concepto'] as const;
const CAT_LABELS: Record<string, string> = {
  personaje: '👤 Personajes',
  evento: '📜 Eventos',
  lugar: '🏛️ Lugares',
  concepto: '💡 Conceptos',
};

export default function CodexPanel({ flags, onCerrar }: Props) {
  const [catSeleccionada, setCatSeleccionada] = useState<string>('personaje');
  const [entrySeleccionada, setEntrySeleccionada] = useState<CodexEntry | null>(null);

  const desbloqueados = useMemo(() => getDesbloqueados(flags), [flags]);
  const totalEntries = Object.keys(CODEX_ENTRIES).length;

  const entriesDeCategoria = desbloqueados.filter(
    (e) => e.categoria === catSeleccionada
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-b from-gray-900 to-black border-2 border-yellow-400/50 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-yellow-400/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.3em]">CODEX HISTÓRICO</p>
              <p className="text-white/50 text-xs">
                {desbloqueados.length} / {totalEntries} entradas desbloqueadas
              </p>
            </div>
            <button
              onClick={onCerrar}
              className="text-white/30 text-xs uppercase tracking-widest hover:text-white/60"
            >
              [ Cerrar ]
            </button>
          </div>

          {/* Categorías */}
          <div className="flex gap-2 mt-3">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCatSeleccionada(cat); setEntrySeleccionada(null); }}
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 transition-all ${
                  catSeleccionada === cat
                    ? 'bg-yellow-400 text-black'
                    : 'text-white/40 hover:text-white border border-white/10'
                }`}
              >
                {CAT_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Lista de entradas */}
          <div className="w-1/3 border-r border-white/10 overflow-y-auto">
            {entriesDeCategoria.length === 0 ? (
              <p className="text-white/20 text-xs p-4 italic">Nada desbloqueado aún. Explorá bien cada misión.</p>
            ) : (
              entriesDeCategoria.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setEntrySeleccionada(entry)}
                  className={`w-full text-left p-3 border-b border-white/5 transition-all hover:bg-white/5 ${
                    entrySeleccionada?.id === entry.id ? 'bg-yellow-400/10 border-l-2 border-yellow-400' : ''
                  }`}
                >
                  <p className="text-white text-xs font-bold">{entry.titulo}</p>
                  <p className="text-white/40 text-[10px]">{entry.año}</p>
                </button>
              ))
            )}
          </div>

          {/* Entrada seleccionada */}
          <div className="flex-1 p-6 overflow-y-auto">
            {entrySeleccionada ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-yellow-400/60 font-black">
                    {CAT_LABELS[entrySeleccionada.categoria]}
                  </span>
                  <span className="text-white/30 text-xs">{entrySeleccionada.año}</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{entrySeleccionada.titulo}</h3>
                <p className="text-yellow-400/70 text-sm italic mb-4">"{entrySeleccionada.resumen}"</p>
                <p className="text-white/70 text-sm leading-relaxed mb-6">{entrySeleccionada.texto}</p>
                {entrySeleccionada.cita && (
                  <div className="border-l-2 border-soviet-red pl-4 py-2 bg-soviet-red/5">
                    <p className="text-white/80 text-sm italic mb-1">"{entrySeleccionada.cita.texto}"</p>
                    <p className="text-yellow-400/60 text-[10px] font-black uppercase tracking-widest">
                      — {entrySeleccionada.cita.autor}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/20 text-xs italic">Seleccioná una entrada del panel izquierdo</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
