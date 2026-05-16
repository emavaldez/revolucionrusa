// ItemPickupAnimation — Animación de item recogido
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { Item } from '@/context/GameContext';

interface Props {
  item: Item;
  onConfirm: () => void;
}

export default function ItemPickupAnimation({ item, onConfirm }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] bg-black/70 flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: -30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 15 }}
        className="bg-gradient-to-b from-amber-900 to-black border-2 border-yellow-400/60 max-w-sm w-full mx-4 p-6 text-center shadow-2xl"
      >
        {/* Icono grande */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-7xl mb-4"
        >
          {item.icono}
        </motion.div>

        {/* Nombre */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-yellow-400 text-xl font-black uppercase tracking-wider mb-2"
        >
          ¡Nuevo Item!
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white font-bold text-lg mb-1"
        >
          {item.nombre}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/50 text-xs italic mb-6"
        >
          {item.desc}
        </motion.p>

        {/* Botón confirmar */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
          }}
          className="bg-yellow-400 text-black font-black uppercase tracking-widest px-8 py-3 text-sm hover:bg-yellow-300 transition-all"
        >
          ✓ Tomar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
