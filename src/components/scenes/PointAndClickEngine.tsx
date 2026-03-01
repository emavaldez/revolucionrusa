// src/components/scenes/PointAndClickEngine.tsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import type { Item } from '@/context/GameContext';
import { MISIONES } from '@/data/historia';
import type { Hotspot, SubEscena } from '@/data/historia';

interface Props {
  misionId: number;
  onCompletar: () => void;
}

export default function PointAndClickEngine({ misionId, onCompletar }: Props) {
  const { gameState, setGameState } = useGame();

  const [mensaje, setMensaje] = useState('');
  const [subMensaje, setSubMensaje] = useState('');
  const [itemSeleccionado, setItemSeleccionado] = useState<Item | null>(null);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [hotspotsBloqueados, setHotspotsBloqueados] = useState<Set<string>>(new Set());
  const [completando, setCompletando] = useState(false);

  // ── Sub-escenas y flags (estado interno de la misión) ───────────────────
  const [subEscenaActual, setSubEscenaActual] = useState<string | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const mision = MISIONES[misionId];

  // Reset al cambiar de misión
  useEffect(() => {
    setItemSeleccionado(null);
    setHotspotsBloqueados(new Set());
    setCompletando(false);
    setFlags({});

    if (mision.subEscenas && mision.escenaInicial) {
      setSubEscenaActual(mision.escenaInicial);
      const escena = mision.subEscenas[mision.escenaInicial];
      setMensaje(escena.descripcion);
    } else {
      setSubEscenaActual(null);
      setMensaje(mision.descripcion ?? '');
    }
    setSubMensaje('');
  }, [misionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Determinar escena activa ────────────────────────────────────────────
  const escenaActiva: SubEscena | null =
    mision.subEscenas && subEscenaActual ? mision.subEscenas[subEscenaActual] : null;

  const fondoActual = escenaActiva?.fondo ?? mision.fondo ?? '';
  const hotspotsActuales: Hotspot[] = (
    escenaActiva?.hotspots ?? mision.hotspots ?? []
  ).filter((hs) => {
    if (hs.ocultarSiFlag && flags[hs.ocultarSiFlag]) return false;
    return true;
  });

  // ── Helpers ─────────────────────────────────────────────────────────────
  const mostrarMensaje = useCallback((texto: string, sub = '') => {
    setMensaje(texto);
    setSubMensaje(sub);
  }, []);

  const activarFlag = useCallback((flag: string) => {
    setFlags((prev) => ({ ...prev, [flag]: true }));
  }, []);

  const consumirItem = useCallback(
    (itemId: string) => {
      setGameState((prev) => ({
        ...prev,
        inventario: prev.inventario.filter((i) => i.id !== itemId),
      }));
    },
    [setGameState]
  );

  const completarMision = useCallback(() => {
    setCompletando(true);
    setTimeout(() => onCompletar(), 4500);
  }, [onCompletar]);

  // ── Navegación entre sub-escenas ─────────────────────────────────────────
  const navegarA = useCallback(
    (destino: string) => {
      if (!mision.subEscenas?.[destino]) return;
      setSubEscenaActual(destino);
      setItemSeleccionado(null);
      const nuevaEscena = mision.subEscenas[destino];
      mostrarMensaje(nuevaEscena.descripcion, `📍 ${nuevaEscena.id.replace('_', ' ').toUpperCase()}`);
    },
    [mision.subEscenas, mostrarMensaje]
  );

  const volverAtras = useCallback(() => {
    const padre = escenaActiva?.escenaAnterior;
    if (padre) navegarA(padre);
  }, [escenaActiva, navegarA]);

  // ── Lógica principal de interacción ─────────────────────────────────────
  const interactuar = useCallback(
    (hs: Hotspot) => {
      if (completando) return;
      if (hotspotsBloqueados.has(hs.id)) return;

      // ── CON ITEM EN MANO ─────────────────────────────────────────────
      if (itemSeleccionado) {
        // 1. Revisar usarCon del hotspot (sin importar su tipo)
        if (hs.usarCon && hs.usarCon.length > 0) {
          const match = hs.usarCon.find((u) => {
            if (u.requiere !== itemSeleccionado.id) return false;
            if (u.requiereFlag && !flags[u.requiereFlag]) return false;
            return true;
          });

          if (match) {
            if (match.mensajeExito) {
              // ✅ ÉXITO
              mostrarMensaje(match.mensajeExito, `✅ ${hs.label}`);
              if (match.setFlag) activarFlag(match.setFlag);
              if (match.consumir !== false) consumirItem(itemSeleccionado.id);
              setItemSeleccionado(null);
              if (match.completaMision) completarMision();
            } else {
              // ❌ Caso fallido explícito
              mostrarMensaje(
                match.mensajeFallo ?? `No podés usar "${itemSeleccionado.nombre}" con "${hs.label}".`,
                '❌ No funciona'
              );
              setItemSeleccionado(null);
            }
            return;
          }
        }

        // 2. Tipo 'usar' simple
        if (hs.tipo === 'usar' && hs.requiere === itemSeleccionado.id) {
          mostrarMensaje(hs.mensajeExito ?? '¡Funciona!', `✅ ${hs.label}`);
          if (hs.setFlag) activarFlag(hs.setFlag);
          if (hs.consumir !== false) consumirItem(itemSeleccionado.id);
          setItemSeleccionado(null);
          if (hs.completaMision) completarMision();
          return;
        }

        // 3. Fallo genérico
        mostrarMensaje(
          `No podés usar "${itemSeleccionado.nombre}" con "${hs.label}". Esto no es magia burguesa.`,
          '❌ Combinación inválida'
        );
        setItemSeleccionado(null);
        return;
      }

      // ── SIN ITEM EN MANO ─────────────────────────────────────────────
      switch (hs.tipo) {
        case 'recoger': {
          const yaEnInventario = gameState.inventario.some((i) => i.id === hs.item!.id);
          if (yaEnInventario) {
            mostrarMensaje('Ya te llevaste esto. Dejá de saquear.', `🎒 ${hs.label}`);
          } else {
            setGameState((prev) => ({ ...prev, inventario: [...prev.inventario, hs.item!] }));
            setHotspotsBloqueados((prev) => new Set([...prev, hs.id]));
            mostrarMensaje(hs.mensaje ?? `Recogiste: ${hs.item!.nombre}.`, `📦 ${hs.item!.nombre}`);
          }
          break;
        }

        case 'hablar': {
          // Buscar el primer diálogo cuyas condiciones se cumplan
          if (hs.dialogos && hs.dialogos.length > 0) {
            const dialogo = hs.dialogos.find((d) => {
              if (d.requiereFlag && !flags[d.requiereFlag]) return false;
              if (d.requiereFlagFalso && flags[d.requiereFlagFalso]) return false;
              return true;
            });
            if (dialogo) {
              mostrarMensaje(`"${dialogo.texto}"`, `💬 ${hs.label}`);
              if (dialogo.setFlag) activarFlag(dialogo.setFlag);
            }
          } else {
            mostrarMensaje(`"${hs.mensaje}"`, `💬 ${hs.label}`);
          }
          break;
        }

        case 'usar': {
          mostrarMensaje(
            hs.mensajeFallo ?? `¿Para qué harías eso? Pensá en la dialéctica, camarada.`,
            `🔧 ${hs.label}`
          );
          break;
        }

        case 'navegar': {
          if (hs.destino) navegarA(hs.destino);
          break;
        }
      }
    },
    [
      completando, hotspotsBloqueados, itemSeleccionado, flags,
      gameState.inventario, mostrarMensaje, activarFlag, consumirItem,
      setGameState, completarMision, navegarA,
    ]
  );

  // ── Texto contextual del HUD ────────────────────────────────────────────
  const textoAccion = itemSeleccionado
    ? `☝️  Usar  [ ${itemSeleccionado.nombre} ]  con...`
    : completando
    ? '⏳  Avanzando al próximo año histórico...'
    : 'Hacé click en el escenario o seleccioná un objeto del inventario.';

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden">

      {/* ── IMAGEN DE FONDO con fade entre escenas ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${misionId}-${subEscenaActual ?? 'main'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${fondoActual})` }}
        />
      </AnimatePresence>

      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* ── HOTSPOTS ── */}
      {hotspotsActuales.map((hs) => {
        if (hotspotsBloqueados.has(hs.id)) return null;
        const esObjetivo =
          itemSeleccionado &&
          (hs.tipo === 'usar'
            ? hs.requiere === itemSeleccionado.id
            : hs.usarCon?.some(
                (u) =>
                  u.requiere === itemSeleccionado.id &&
                  u.mensajeExito !== undefined &&
                  (!u.requiereFlag || flags[u.requiereFlag])
              ));

        return (
          <button
            key={hs.id}
            onClick={() => interactuar(hs)}
            className={[
              'absolute z-10 rounded-full flex items-center justify-center transition-all duration-200 group',
              mostrarAyuda
                ? 'w-20 h-20 bg-yellow-400/50 border-2 border-yellow-300 animate-pulse shadow-[0_0_20px_6px_rgba(250,204,21,0.5)]'
                : esObjetivo
                ? 'w-20 h-20 bg-green-400/40 border-2 border-green-300 animate-pulse shadow-[0_0_20px_6px_rgba(74,222,128,0.5)]'
                : 'w-16 h-16 bg-white/5 hover:bg-white/20 border border-transparent hover:border-white/30',
            ].join(' ')}
            style={{ left: `${hs.x}%`, top: `${hs.y}%`, transform: 'translate(-50%, -50%)' }}
            title={hs.label}
          >
            {/* Tooltip al hover */}
            <span className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 bg-black/95 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 whitespace-nowrap border border-yellow-400/60 shadow-lg transition-opacity duration-150">
              {hs.label}
            </span>
            {/* Icono en modo ayuda */}
            {mostrarAyuda && (
              <span className="text-sm pointer-events-none">
                {hs.tipo === 'recoger' ? '📦' : hs.tipo === 'hablar' ? '💬' : hs.tipo === 'navegar' ? '🚪' : '🔧'}
              </span>
            )}
          </button>
        );
      })}

      {/* ── HUD SUPERIOR IZQUIERDA: Ayuda + Volver ── */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <button
          onMouseDown={() => setMostrarAyuda(true)}
          onMouseUp={() => setMostrarAyuda(false)}
          onMouseLeave={() => setMostrarAyuda(false)}
          onTouchStart={() => setMostrarAyuda(true)}
          onTouchEnd={() => setMostrarAyuda(false)}
          className="bg-black/80 text-yellow-400 border border-yellow-400/60 px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all select-none"
        >
          👁  Mantener: Ver Hotspots
        </button>

        {/* Botón Volver — solo en sub-escenas con escenaAnterior */}
        {escenaActiva?.escenaAnterior && (
          <button
            onClick={volverAtras}
            className="bg-black/80 text-white border border-white/30 px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            ← Volver al Exterior
          </button>
        )}
      </div>

      {/* ── HUD SUPERIOR CENTRO: Título de escena ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400 bg-black/60 px-4 py-1 border border-yellow-400/30">
          {mision.año} · {mision.titulo}
          {escenaActiva && escenaActiva.id !== mision.escenaInicial && (
            <span className="text-white/50"> › {escenaActiva.id.replace(/_/g, ' ')}</span>
          )}
        </p>
      </div>

      {/* ── HUD SUPERIOR DERECHA: Inventario ── */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400/80 bg-black/60 px-2 py-0.5">
          Inventario
        </span>
        <div className="flex gap-2 flex-wrap justify-end max-w-xs">
          {gameState.inventario.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                setItemSeleccionado((prev) => (prev?.id === item.id ? null : item))
              }
              title={`${item.nombre}: ${item.desc}`}
              className={[
                'w-14 h-14 flex items-center justify-center text-2xl border-2 transition-all duration-150 shadow-lg relative group',
                itemSeleccionado?.id === item.id
                  ? 'bg-red-700 border-white scale-110 shadow-[0_0_12px_2px_rgba(255,255,255,0.5)]'
                  : 'bg-black/80 border-yellow-400/60 hover:border-yellow-300 hover:scale-105',
              ].join(' ')}
            >
              {item.icono}
              <span className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/95 text-white text-[9px] font-black uppercase px-2 py-0.5 whitespace-nowrap border border-yellow-400/40 transition-opacity">
                {item.nombre}
              </span>
            </button>
          ))}
          {gameState.inventario.length === 0 && (
            <span className="text-[10px] text-white/40 italic py-2 px-1">vacío</span>
          )}
        </div>
      </div>

      {/* ── CAJA DE MENSAJES (fija abajo) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/95 border-t-4 border-yellow-400/80 min-h-[110px] flex flex-col justify-center px-8 py-4">
        <AnimatePresence mode="wait">
          {subMensaje && (
            <motion.p
              key={subMensaje + mensaje}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.25em] mb-1"
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
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-white font-mono text-base leading-relaxed"
          >
            {mensaje}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── OVERLAY DE MISIÓN COMPLETADA ── */}
      <AnimatePresence>
        {completando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/75 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
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
