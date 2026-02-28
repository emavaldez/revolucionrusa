// src/components/scenes/PointAndClickEngine.tsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import type { Item } from '@/context/GameContext';
import { MISIONES } from '@/data/historia';
import type { Hotspot } from '@/data/historia';

interface Props {
  misionId: number;
  onCompletar: () => void;
}

export default function PointAndClickEngine({ misionId, onCompletar }: Props) {
  const { gameState, setGameState } = useGame();

  const [mensaje, setMensaje] = useState('');
  const [subMensaje, setSubMensaje] = useState(''); // speaker / acción label
  const [itemSeleccionado, setItemSeleccionado] = useState<Item | null>(null);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [hotspotsBloqueados, setHotspotsBloqueados] = useState<Set<string>>(new Set());
  const [completando, setCompletando] = useState(false);

  const mision = MISIONES[misionId];

  // Mostrar descripción inicial al entrar a la misión
  useEffect(() => {
    setMensaje(mision.descripcion);
    setSubMensaje('');
    setItemSeleccionado(null);
    setHotspotsBloqueados(new Set());
    setCompletando(false);
  }, [misionId, mision.descripcion]);

  // Auto-limpiar mensajes después de 6 segundos
  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => {
      if (!completando) {
        setMensaje(mision.descripcion);
        setSubMensaje('');
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [mensaje, completando, mision.descripcion]);

  const mostrarMensaje = useCallback((texto: string, sub = '') => {
    setMensaje(texto);
    setSubMensaje(sub);
  }, []);

  const interactuar = useCallback(
    (hs: Hotspot) => {
      if (completando) return;
      if (hotspotsBloqueados.has(hs.id)) return;

      // --- CON OBJETO EN MANO ---
      if (itemSeleccionado) {
        if (hs.tipo === 'usar' && hs.requiere === itemSeleccionado.id) {
          // ¡Combinación correcta!
          mostrarMensaje(hs.mensajeExito ?? '¡Funciona!', '✅ Acción exitosa');
          setItemSeleccionado(null);

          if (hs.accion === 'completar_mision') {
            setCompletando(true);
            // Consumir el ítem del inventario
            setGameState((prev) => ({
              ...prev,
              inventario: prev.inventario.filter((i) => i.id !== itemSeleccionado.id),
            }));
            setTimeout(() => onCompletar(), 4500);
          }
        } else {
          mostrarMensaje(
            `No podés usar "${itemSeleccionado.nombre}" con "${hs.label}". Esto no es magia burguesa.`,
            '❌ Combinación inválida'
          );
          setItemSeleccionado(null);
        }
        return;
      }

      // --- SIN OBJETO EN MANO ---
      switch (hs.tipo) {
        case 'recoger': {
          const yaEnInventario = gameState.inventario.some((i) => i.id === hs.item!.id);
          if (yaEnInventario) {
            mostrarMensaje('Ya te llevaste esto. Dejá de saquear.', `🎒 ${hs.label}`);
          } else {
            setGameState((prev) => ({
              ...prev,
              inventario: [...prev.inventario, hs.item!],
            }));
            // Marcar hotspot como recogido para que no aparezca más
            setHotspotsBloqueados((prev) => new Set([...prev, hs.id]));
            mostrarMensaje(`${hs.mensaje}`, `📦 Recogiste: ${hs.item!.nombre}`);
          }
          break;
        }
        case 'hablar':
          mostrarMensaje(`"${hs.mensaje}"`, `💬 ${hs.label}`);
          break;
        case 'usar':
          mostrarMensaje(
            hs.mensajeFallo ?? 'No podés hacer eso así nomás.',
            `🔧 ${hs.label}`
          );
          break;
      }
    },
    [completando, hotspotsBloqueados, itemSeleccionado, gameState.inventario, mostrarMensaje, setGameState, onCompletar]
  );

  const toggleItem = useCallback(
    (item: Item) => {
      setItemSeleccionado((prev) => (prev?.id === item.id ? null : item));
    },
    []
  );

  const textoAccion = itemSeleccionado
    ? `☝️ Usar [ ${itemSeleccionado.nombre} ] con...`
    : completando
    ? '⏳ Avanzando al próximo año histórico...'
    : 'Hacé click en el escenario o seleccioná un objeto del inventario.';

  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden">
      
      {/* ── IMAGEN DE FONDO ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={misionId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mision.fondo})` }}
        />
      </AnimatePresence>

      {/* Overlay oscuro suave para legibilidad */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* ── HOTSPOTS ── */}
      {mision.hotspots.map((hs) => {
        if (hotspotsBloqueados.has(hs.id)) return null;
        const activo = itemSeleccionado && hs.tipo === 'usar' && hs.requiere === itemSeleccionado.id;
        return (
          <button
            key={hs.id}
            onClick={() => interactuar(hs)}
            className={`
              absolute z-10 rounded-full flex items-center justify-center
              transition-all duration-200 group
              ${mostrarAyuda
                ? 'w-20 h-20 bg-yellow-400/50 border-2 border-yellow-300 animate-pulse shadow-[0_0_20px_4px_rgba(250,204,21,0.6)]'
                : activo
                  ? 'w-20 h-20 bg-green-400/40 border-2 border-green-300 animate-pulse shadow-[0_0_20px_4px_rgba(74,222,128,0.6)]'
                  : 'w-16 h-16 bg-white/5 border border-transparent hover:bg-white/20 hover:border-white/40'
              }
            `}
            style={{
              left: `${hs.x}%`,
              top: `${hs.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            title={hs.label}
          >
            {/* Tooltip al hover */}
            <span className="
              opacity-0 group-hover:opacity-100 pointer-events-none
              absolute -top-9 left-1/2 -translate-x-1/2
              bg-black/95 text-white text-[10px] font-bold uppercase tracking-wider
              px-3 py-1 whitespace-nowrap border border-yellow-400/60
              shadow-lg transition-opacity duration-150
            ">
              {hs.label}
            </span>

            {/* Icono visible solo en modo ayuda */}
            {mostrarAyuda && (
              <span className="text-xs font-black text-yellow-200 drop-shadow">
                {hs.tipo === 'recoger' ? '📦' : hs.tipo === 'hablar' ? '💬' : '🔧'}
              </span>
            )}
          </button>
        );
      })}

      {/* ── HUD: BOTÓN AYUDA ── */}
      <button
        onMouseDown={() => setMostrarAyuda(true)}
        onMouseUp={() => setMostrarAyuda(false)}
        onMouseLeave={() => setMostrarAyuda(false)}
        onTouchStart={() => setMostrarAyuda(true)}
        onTouchEnd={() => setMostrarAyuda(false)}
        className="
          absolute top-4 left-4 z-30
          bg-black/80 text-yellow-400 border border-yellow-400/60
          px-3 py-2 text-[10px] font-black uppercase tracking-widest
          hover:bg-yellow-400 hover:text-black transition-all select-none
        "
      >
        👁 Mantener: Ver Hotspots
      </button>

      {/* ── HUD: INVENTARIO ── */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 items-end">
        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400/80 bg-black/60 px-2 py-0.5">
          Inventario
        </span>
        <div className="flex gap-2">
          {gameState.inventario.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item)}
              title={`${item.nombre}: ${item.desc}`}
              className={`
                w-14 h-14 flex items-center justify-center text-2xl
                border-2 transition-all duration-150 shadow-lg relative group
                ${itemSeleccionado?.id === item.id
                  ? 'bg-red-700 border-white scale-110 shadow-[0_0_12px_2px_rgba(255,255,255,0.5)]'
                  : 'bg-black/80 border-yellow-400/60 hover:border-yellow-300 hover:scale-105'
                }
              `}
            >
              {item.icono}
              {/* Tooltip nombre */}
              <span className="
                opacity-0 group-hover:opacity-100 pointer-events-none
                absolute -bottom-7 left-1/2 -translate-x-1/2
                bg-black/95 text-white text-[9px] font-bold uppercase
                px-2 py-0.5 whitespace-nowrap border border-yellow-400/40
                transition-opacity duration-150
              ">
                {item.nombre}
              </span>
            </button>
          ))}
          {gameState.inventario.length === 0 && (
            <span className="text-[10px] text-white/40 italic py-1">vacío</span>
          )}
        </div>
      </div>

      {/* ── HUD: TÍTULO DE MISIÓN ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400 bg-black/60 px-4 py-1 border border-yellow-400/30">
          {mision.año} · {mision.titulo}
        </p>
      </div>

      {/* ── CAJA DE MENSAJES (fija abajo) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/95 border-t-4 border-yellow-400/80 min-h-[120px] flex flex-col justify-center px-8 py-5">
        <AnimatePresence mode="wait">
          {subMensaje && (
            <motion.p
              key={subMensaje}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.25em] mb-2"
            >
              {subMensaje}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-[10px] font-black uppercase tracking-widest text-red-400/70 mb-1">
          {textoAccion}
        </p>

        <AnimatePresence mode="wait">
          <motion.p
            key={mensaje}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white font-mono text-lg leading-relaxed"
          >
            {mensaje}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── OVERLAY DE COMPLETADO ── */}
      <AnimatePresence>
        {completando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center border-4 border-double border-yellow-400 bg-black px-12 py-8"
            >
              <p className="text-yellow-400 text-4xl font-black uppercase tracking-widest mb-2">
                ¡Misión Cumplida!
              </p>
              <p className="text-white/70 text-sm uppercase tracking-[0.3em]">
                La historia continúa...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
