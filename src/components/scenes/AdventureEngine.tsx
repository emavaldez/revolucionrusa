// src/components/scenes/AdventureEngine.tsx - REWRITE: 2D movement + direct hotspot interaction
"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import type { Item } from '@/context/GameContext';
import { MISIONES, getEscenaActual, getHotspotsActivos, PISTAS } from '@/data/historia';
import type { Hotspot, SubEscena, DialogoCondicional, DialogoOpcion } from '@/data/historia';

interface Props {
  misionId: number;
  onCompletar: () => void;
}

// ── Constantes ─────────────────────────────────────────────────────────────
const PERSONAJE_ANCHO = 48;
const PERSONAJE_ALTO = 80;
const VELOCIDAD_CAMINATA = 300; // px por segundo (más rápido)
const RADIO_INTERACCION = Infinity; // Click directo en hotspots, sin necesidad de acercarse

// Notas del puzle musical (La Internacional: C-E-G-C)
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
const SECUENCIA_INTERNACIONAL = ['C', 'E', 'G', 'C2'];

// ── Hook Typewriter ───────────────────────────────────────────────────────
function useTypewriter(text: string, speed: number = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return { displayed, done };
}

// ── Componente Typewriter Message ─────────────────────────────────────────
function TypewriterMessage({ text }: { text: string }) {
  const { displayed, done } = useTypewriter(text, 16);
  return (
    <motion.p
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="text-white font-mono text-base leading-relaxed"
    >
      {displayed}
      {!done && <span className="text-yellow-400 animate-pulse">▋</span>}
    </motion.p>
  );
}

export default function AdventureEngine({ misionId, onCompletar }: Props) {
  const { gameState, setGameState } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Estado del personaje (2D) ───────────────────────────────────────────
  const [personajeX, setPersonajeX] = useState(150);
  const [personajeY, setPersonajeY] = useState(400); // Y en px desde arriba
  const [direccion, setDireccion] = useState<'izq' | 'der'>('der');
  const [caminando, setCaminando] = useState(false);
  const [objetivoX, setObjetivoX] = useState<number | null>(null);
  const [objetivoY, setObjetivoY] = useState<number | null>(null);
  const [objetivoHotspot, setObjetivoHotspot] = useState<Hotspot | null>(null);

  // ── Estado del mundo ────────────────────────────────────────────────────
  const [cameraX, setCameraX] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [subMensaje, setSubMensaje] = useState('');
  const [itemSeleccionado, setItemSeleccionado] = useState<Item | null>(null);
  const [hotspotsBloqueados, setHotspotsBloqueados] = useState<Set<string>>(new Set());
  const [completando, setCompletando] = useState(false);
  const [subEscenaActual, setSubEscenaActual] = useState<string | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [cursor, setCursor] = useState('default');
  const [mostrarPista, setMostrarPista] = useState(false);

  // ── Diálogos ────────────────────────────────────────────────────────────
  const [dialogoActivo, setDialogoActivo] = useState<{
    npc: string;
    texto: string;
    opciones?: DialogoOpcion[];
    color?: string;
  } | null>(null);

  // ── Puzle Piano ─────────────────────────────────────────────────────────
  const [mostrarPiano, setMostrarPiano] = useState(false);
  const [notasTocadas, setNotasTocadas] = useState<string[]>([]);
  const [pianoFeedback, setPianoFeedback] = useState('');
  const [puzzleHotspot, setPuzzleHotspot] = useState<Hotspot | null>(null);

  const mision = MISIONES[misionId];
  const escenaActiva: SubEscena | null = getEscenaActual(mision, subEscenaActual);
  const anchoMundo = escenaActiva?.anchoMundo ?? mision.anchoMundo ?? 2000;

  // ── Reset al cambiar de misión ──────────────────────────────────────────
  useEffect(() => {
    setItemSeleccionado(null);
    setHotspotsBloqueados(new Set());
    setCompletando(false);
    setFlags({});
    setDialogoActivo(null);
    setMostrarPiano(false);
    setNotasTocadas([]);

    if (mision.subEscenas && mision.escenaInicial) {
      setSubEscenaActual(mision.escenaInicial);
      const escena = mision.subEscenas[mision.escenaInicial];
      setMensaje(escena.descripcion);
    } else {
      setSubEscenaActual(null);
      setMensaje(mision.descripcion ?? '');
    }
    // Posición inicial: izquierda, centro vertical del viewport
    if (containerRef.current) {
      setPersonajeX(150);
      setPersonajeY(containerRef.current.clientHeight / 2 - PERSONAJE_ALTO / 2);
    } else {
      setPersonajeX(150);
      setPersonajeY(400);
    }
    setSubMensaje('');
    setObjetivoX(null);
    setObjetivoY(null);
    setCaminando(false);
  }, [misionId]);

  // ── Determinar hotspots activos ─────────────────────────────────────────
  const hotspotsActuales = getHotspotsActivos(mision, subEscenaActual, flags);

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

  const navegarA = useCallback(
    (destino: string, spawnX?: number) => {
      if (!mision.subEscenas?.[destino]) return;
      setSubEscenaActual(destino);
      setItemSeleccionado(null);
      setObjetivoX(null);
      setObjetivoY(null);
      setCaminando(false);
      setDialogoActivo(null);
      const nuevaEscena = mision.subEscenas[destino];
      mostrarMensaje(nuevaEscena.descripcion, `📍 ${nuevaEscena.id.replace('_', ' ').toUpperCase()}`);
      setPersonajeX(spawnX ?? 150);
    },
    [mision.subEscenas, mostrarMensaje]
  );

  const volverAtras = useCallback(() => {
    const padre = escenaActiva?.escenaAnterior;
    if (padre) navegarA(padre);
  }, [escenaActiva, navegarA]);

  // ── Loop de caminata 2D ────────────────────────────────────────────────
  useEffect(() => {
    if (objetivoX === null || objetivoY === null) return;
    setCaminando(true);
    const startTime = performance.now();
    const startX = personajeX;
    const startY = personajeY;
    const distX = objetivoX - startX;
    const distY = objetivoY - startY;
    const distanciaTotal = Math.sqrt(distX ** 2 + distY ** 2);
    const duracion = distanciaTotal / VELOCIDAD_CAMINATA * 1000;

    if (distX > 5) setDireccion('der');
    else if (distX < -5) setDireccion('izq');

    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duracion, 1);
      const newX = startX + distX * progress;
      const newY = startY + distY * progress;
      setPersonajeX(newX);
      setPersonajeY(newY);

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setCaminando(false);
        setObjetivoX(null);
        setObjetivoY(null);
        if (objetivoHotspot) {
          ejecutarInteraccion(objetivoHotspot);
          setObjetivoHotspot(null);
        }
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [objetivoX, objetivoY]);

  // ── Cámara sigue al personaje (2D) ─────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const viewportW = containerRef.current.clientWidth;
    let targetCam = personajeX - viewportW / 2 + PERSONAJE_ANCHO / 2;
    targetCam = Math.max(0, Math.min(targetCam, anchoMundo - viewportW));
    setCameraX(targetCam);
  }, [personajeX, anchoMundo]);

  // ── Click en el escenario (2D) ─────────────────────────────────────────
  const handleSceneClick = (e: React.MouseEvent) => {
    if (completando || dialogoActivo || mostrarPiano) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + cameraX;
    const clickY = e.clientY - rect.top;

    // Clamp positions
    const worldX = Math.max(50, Math.min(clickX, anchoMundo - 50));
    const worldY = Math.max(50, Math.min(clickY, rect.height - PERSONAJE_ALTO - 20));

    // Buscar si clickó cerca de un hotspot (radio más grande para facilitar)
    const hsCercano = hotspotsActuales.find((hs) => {
      if (hotspotsBloqueados.has(hs.id)) return false;
      const hsX = (hs.x / 100) * anchoMundo;
      const hsY = (hs.y / 100) * rect.height;
      const dist = Math.sqrt((clickX - hsX) ** 2 + (clickY - hsY) ** 2);
      return dist < 80 && !hotspotsBloqueados.has(hs.id);
    });

    if (hsCercano) {
      // Click directo en hotspot: interactuar inmediatamente sin caminar
      ejecutarInteraccion(hsCercano);
    } else {
      // Click en el suelo: caminar hasta ahí (2D)
      setObjetivoX(worldX);
      setObjetivoY(worldY);
      setObjetivoHotspot(null);
    }
  };

  // ── Ejecutar interacción (sin verificar distancia - click directo) ─────
  const ejecutarInteraccion = (hs: Hotspot) => {
    if (completando || hotspotsBloqueados.has(hs.id)) return;

    // ── CON ITEM EN MANO ────────────────────────────────────────────
    if (itemSeleccionado) {
      if (hs.usarCon && hs.usarCon.length > 0) {
        const match = hs.usarCon.find((u) => {
          if (u.requiere !== itemSeleccionado.id) return false;
          if (u.requiereFlag && !flags[u.requiereFlag]) return false;
          return true;
        });

        if (match) {
          if (match.mensajeExito) {
            mostrarMensaje(match.mensajeExito, `✅ ${hs.label}`);
            if (match.setFlag) activarFlag(match.setFlag);
            if (match.consumir !== false) consumirItem(itemSeleccionado.id);
            setItemSeleccionado(null);
            if (match.completaMision) completarMision();
          } else {
            mostrarMensaje(match.mensajeFallo ?? `No funciona.`, '❌ No funciona');
            setItemSeleccionado(null);
          }
          return;
        }
      }

      if (hs.tipo === 'usar' && hs.requiere === itemSeleccionado.id) {
        if (hs.puzle === 'piano') {
          setPuzzleHotspot(hs);
          setMostrarPiano(true);
          setNotasTocadas([]);
          setPianoFeedback('Tocá las notas del inicio de La Internacional...');
          setItemSeleccionado(null);
          return;
        }
        mostrarMensaje(hs.mensajeExito ?? '¡Funciona!', `✅ ${hs.label}`);
        if (hs.setFlag) activarFlag(hs.setFlag);
        if (hs.consumir !== false) consumirItem(itemSeleccionado.id);
        setItemSeleccionado(null);
        if (hs.completaMision) completarMision();
        return;
      }

      mostrarMensaje(
        `No podés usar "${itemSeleccionado.nombre}" con "${hs.label}". Esto no es magia burguesa.`,
        '❌ Combinación inválida'
      );
      setItemSeleccionado(null);
      return;
    }

    // ── SIN ITEM EN MANO ────────────────────────────────────────────
    switch (hs.tipo) {
      case 'recoger': {
        if (!hs.item) return;
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
        if (hs.dialogos && hs.dialogos.length > 0) {
          const dialogo = hs.dialogos.find((d) => {
            if (d.requiereFlag && !flags[d.requiereFlag]) return false;
            if (d.requiereFlagFalso && flags[d.requiereFlagFalso]) return false;
            if (d.requiereItem && !gameState.inventario.some(i => i.id === d.requiereItem)) return false;
            return true;
          });
          if (dialogo) {
            if (dialogo.opciones && dialogo.opciones.length > 0) {
              setDialogoActivo({
                npc: hs.label,
                texto: dialogo.texto,
                opciones: dialogo.opciones,
              });
            } else {
              setDialogoActivo({ npc: hs.label, texto: dialogo.texto });
              if (dialogo.setFlag) activarFlag(dialogo.setFlag);
            }
          }
        } else {
          setDialogoActivo({ npc: hs.label, texto: hs.mensaje ?? '...' });
        }
        break;
      }

      case 'usar': {
        if (hs.puzle === 'piano') {
          setPuzzleHotspot(hs);
          setMostrarPiano(true);
          setNotasTocadas([]);
          setPianoFeedback(hs.mensajeFallo ?? 'Tocá las notas...');
          return;
        }
        const flagOk = (!hs.requiereFlag || flags[hs.requiereFlag]) && (!hs.requiereFlagFalso || !flags[hs.requiereFlagFalso]);
        if (hs.mensajeExito && flagOk) {
          mostrarMensaje(hs.mensajeExito, `✅ ${hs.label}`);
          if (hs.setFlag) activarFlag(hs.setFlag);
          if (hs.completaMision) completarMision();
        } else {
          mostrarMensaje(
            hs.mensajeFallo ?? `¿Para qué harías eso? Pensá en la dialéctica, camarada.`,
            `🔧 ${hs.label}`
          );
        }
        break;
      }

      case 'examinar': {
        mostrarMensaje(hs.mensaje ?? 'No ves nada especial.', `👁 ${hs.label}`);
        break;
      }

      case 'navegar': {
        if (hs.destino) navegarA(hs.destino, hs.destinoSpawnX);
        break;
      }
    }
  };

  // ── Resolver opción de diálogo ──────────────────────────────────────────
  const resolverOpcionDialogo = (opcion: DialogoOpcion) => {
    if (opcion.respuestaNPC) {
      setDialogoActivo({ npc: dialogoActivo?.npc ?? '', texto: opcion.respuestaNPC });
    } else {
      setDialogoActivo(null);
    }
    if (opcion.setFlag) activarFlag(opcion.setFlag);
    if (opcion.consumeItem && opcion.requiereItem) consumirItem(opcion.requiereItem);
  };

  // ── Puzle Piano ─────────────────────────────────────────────────────────
  const tocarNota = (nota: string, freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {}

    const nuevaSecuencia = [...notasTocadas, nota];
    setNotasTocadas(nuevaSecuencia);

    const idx = nuevaSecuencia.length - 1;
    if (nuevaSecuencia[idx] !== SECUENCIA_INTERNACIONAL[idx]) {
      setPianoFeedback('Desafinado. Probá de nuevo. Do - Mi - Sol - Do');
      setTimeout(() => setNotasTocadas([]), 800);
      return;
    }

    if (nuevaSecuencia.length === SECUENCIA_INTERNACIONAL.length) {
      setPianoFeedback('¡La Internacional! El compartimiento se abre con un clic mecánico.');
      setTimeout(() => {
        setMostrarPiano(false);
        setNotasTocadas([]);
        if (puzzleHotspot) {
          mostrarMensaje(
            puzzleHotspot.mensajeExito ?? '¡Tocaste La Internacional! El mecanismo cede.',
            '🎵 ¡Correcto!'
          );
          if (puzzleHotspot.setFlag) activarFlag(puzzleHotspot.setFlag);
          if (puzzleHotspot.completaMision) completarMision();
        }
      }, 1200);
    } else {
      setPianoFeedback(`Bien... ${nuevaSecuencia.length} de 4 notas.`);
    }
  };

  // ── Cursor contextual ───────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || completando) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left + cameraX;
    const my = e.clientY - rect.top;

    const hsBajoMouse = hotspotsActuales.find((hs) => {
      if (hotspotsBloqueados.has(hs.id)) return false;
      const hsX = (hs.x / 100) * anchoMundo;
      const hsY = (hs.y / 100) * rect.height;
      return Math.abs(mx - hsX) < 50 && Math.abs(my - hsY) < 50;
    });

    if (hsBajoMouse) {
      if (itemSeleccionado) setCursor('crosshair');
      else if (hsBajoMouse.tipo === 'hablar') setCursor('help');
      else if (hsBajoMouse.tipo === 'recoger') setCursor('grab');
      else setCursor('pointer');
    } else {
      setCursor(itemSeleccionado ? 'crosshair' : 'default');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  const fondoActual = escenaActiva?.fondo ?? mision.fondo ?? '';
  const textoAccion = itemSeleccionado
    ? `☝️ Usar [ ${itemSeleccionado.nombre} ] con...`
    : completando
    ? '⏳ Avanzando al próximo año histórico...'
    : caminando
    ? 'Caminando...'
    : 'Click en el suelo para caminar. Click directo en los iconos para interactuar.';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-screen bg-black overflow-hidden"
      style={{ cursor }}
      onClick={handleSceneClick}
      onMouseMove={handleMouseMove}
    >
      {/* ── MUNDO DEL JUEGO (con cámara scroll) ── */}
      <div
        className="absolute top-0 h-full"
        style={{
          width: anchoMundo,
          transform: `translateX(-${cameraX}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        {/* Fondo */}
        <div
          className="absolute inset-0 bg-cover bg-bottom"
          style={{ backgroundImage: `url(${fondoActual})` }}
        />
        <div className="absolute inset-0 bg-black/20" />

        {/* Hotspots visuales - SIEMPRE visibles y clickeables */}
        {hotspotsActuales.map((hs) => {
          if (hotspotsBloqueados.has(hs.id)) return null;

          return (
            <div
              key={hs.id}
              className="absolute z-10"
              style={{
                left: `${hs.x}%`,
                top: `${hs.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Indicador de interacción - siempre visible */}
              <div className="rounded-full flex items-center justify-center transition-all duration-300 w-14 h-14 bg-yellow-400/40 border-2 border-yellow-300/60 animate-pulse shadow-[0_0_15px_4px_rgba(250,204,21,0.4)]">
                <span className="text-lg">
                  {hs.tipo === 'recoger' ? '📦' : hs.tipo === 'hablar' ? '💬' : hs.tipo === 'navegar' ? '🚪' : hs.tipo === 'examinar' ? '👁' : '🔧'}
                </span>
              </div>
              {/* Label flotante - siempre visible */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-yellow-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 whitespace-nowrap border border-yellow-400/60"
              >
                {hs.label}
              </motion.div>
            </div>
          );
        })}

        {/* ── PERSONAJE (2D) ── */}
        <div
          className="absolute z-20"
          style={{
            left: personajeX,
            top: personajeY,
            width: PERSONAJE_ANCHO,
            height: PERSONAJE_ALTO,
            transform: `scaleX(${direccion === 'izq' ? -1 : 1})`,
            transition: 'transform 0.15s',
          }}
        >
          <svg viewBox="0 0 48 80" className="w-full h-full drop-shadow-lg">
            {/* Cuerpo */}
            <ellipse cx="24" cy="28" rx="14" ry="16" fill="#8B4513" />
            {/* Cabeza */}
            <circle cx="24" cy="12" r="10" fill="#FDBCB4" />
            {/* Cabello */}
            <path d="M14 8 Q24 -2 34 8 Q36 14 32 18 Q24 22 16 18 Q12 14 14 8" fill="#3E2723" />
            {/* Pañuelo rojo */}
            <path d="M14 20 L24 28 L34 20 L30 16 L24 22 L18 16 Z" fill="#be1111" />
            {/* Ojos */}
            <circle cx="20" cy="11" r="1.5" fill="#1a1a1a" />
            <circle cx="28" cy="11" r="1.5" fill="#1a1a1a" />
            {/* Piernas animadas */}
            {caminando ? (
              <>
                <line x1="20" y1="42" x2="16" y2="65" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round">
                  <animate attributeName="x2" values="16;22;16" dur="0.3s" repeatCount="indefinite" />
                </line>
                <line x1="28" y1="42" x2="32" y2="65" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round">
                  <animate attributeName="x2" values="32;26;32" dur="0.3s" repeatCount="indefinite" />
                </line>
              </>
            ) : (
              <>
                <line x1="20" y1="42" x2="18" y2="65" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
                <line x1="28" y1="42" x2="30" y2="65" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* ── BARRA INFERIOR DE MENSAJES ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/95 to-transparent pt-16 pb-4 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Año y ubicación */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">
              {mision.año} · {escenaActiva?.id ? escenaActiva.id.replace('_', ' ').toUpperCase() : mision.ubicacion}
            </span>
            {subEscenaActual && (
              <button
                onClick={(e) => { e.stopPropagation(); volverAtras(); }}
                className="text-yellow-400/60 text-[10px] font-black uppercase tracking-widest hover:text-yellow-400 transition-colors"
              >
                [ ← Volver ]
              </button>
            )}
          </div>

          {/* Sub-mensaje */}
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

          {/* Texto de acción */}
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400/70 mb-1">
            {textoAccion}
          </p>

          {/* Mensaje principal + botón de pista */}
          <div className="flex items-center justify-between mb-2">
            <AnimatePresence mode="wait">
              <TypewriterMessage key={mensaje} text={mensaje} />
            </AnimatePresence>
            <button
              onClick={(e) => { e.stopPropagation(); setMostrarPista((p) => !p); }}
              className="ml-4 text-[10px] font-black uppercase tracking-widest text-yellow-400/60 hover:text-yellow-400 transition-colors shrink-0"
            >
              {mostrarPista ? '[ Ocultar Pista ]' : '[ ¿Pista? ]'}
            </button>
          </div>

          {/* Pista */}
          <AnimatePresence>
            {mostrarPista && PISTAS[misionId] && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-yellow-300/80 text-xs italic border-l-2 border-yellow-400/40 pl-3 mt-1"
              >
                💡 {PISTAS[misionId]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── INVENTARIO (barra lateral) ── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
        {gameState.inventario.map((item) => (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              setItemSeleccionado(itemSeleccionado?.id === item.id ? null : item);
            }}
            className={[
              'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all',
              itemSeleccionado?.id === item.id
                ? 'bg-yellow-400/30 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                : 'bg-black/60 border-white/30 hover:border-yellow-400/60',
            ].join(' ')}
            title={item.nombre}
          >
            {item.icono}
          </button>
        ))}
      </div>

      {/* ── DIÁLOGO CON OPCIONES ── */}
      <AnimatePresence>
        {dialogoActivo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 flex items-end justify-center pb-32 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-black border-2 border-yellow-400 max-w-2xl w-full mx-4 p-6 pointer-events-auto shadow-2xl"
            >
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-2">
                💬 {dialogoActivo.npc}
              </p>
              <p className="text-white text-lg leading-relaxed mb-4 italic">
                "{dialogoActivo.texto}"
              </p>
              {dialogoActivo.opciones ? (
                <div className="space-y-2">
                  {dialogoActivo.opciones.map((opt, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        resolverOpcionDialogo(opt);
                      }}
                      className="w-full text-left p-3 border border-white/30 hover:bg-soviet-red hover:text-white hover:border-soviet-red transition-all text-sm"
                    >
                      {opt.texto}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setDialogoActivo(null); }}
                  className="text-yellow-400 text-xs uppercase tracking-widest hover:text-white transition-colors"
                >
                  [ Cerrar ]
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PUZZLE PIANO ── */}
      <AnimatePresence>
        {mostrarPiano && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-paper-light border-4 border-double border-soviet-red p-8 max-w-lg w-full text-black"
            >
              <h3 className="text-xl font-black mb-2 uppercase text-soviet-red text-center">
                🎹 La Internacional
              </h3>
              <p className="text-center text-sm mb-1 italic opacity-70">
                "Solo suena para quien conoce la canción del pueblo"
              </p>
              <p className="text-center text-xs mb-4 text-soviet-red font-bold">
                {pianoFeedback}
              </p>

              <div className="flex justify-center gap-1 mb-4">
                {NOTAS_PIANO.map((n) => (
                  <button
                    key={n.nota}
                    onClick={() => tocarNota(n.nota, n.freq)}
                    className={[
                      'w-10 h-32 border-2 border-black flex flex-col items-end justify-end pb-2 transition-all hover:bg-yellow-100',
                      notasTocadas.includes(n.nota)
                        ? 'bg-yellow-200 scale-95'
                        : 'bg-white',
                    ].join(' ')}
                  >
                    <span className="text-[10px] font-black text-black/40">{n.label}</span>
                  </button>
                ))}
              </div>

              <div className="text-center text-xs text-black/60 mb-4">
                Notas tocadas: {notasTocadas.join(' - ') || '...'}
              </div>

              <button
                onClick={() => { setMostrarPiano(false); setNotasTocadas([]); }}
                className="w-full text-center text-xs uppercase tracking-widest text-soviet-red hover:text-black transition-colors"
              >
                [ Cerrar Piano ]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── OVERLAY MISIÓN COMPLETADA ── */}
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
