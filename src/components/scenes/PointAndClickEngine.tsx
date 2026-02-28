import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';

export default function PointAndClickEngine({ misionId, onCompletar }: { misionId: number, onCompletar: () => void }) {
  const { gameState, setGameState } = useGame();
  
  const [mensaje, setMensaje] = useState("");
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null);
  const [mostrarAyuda, setMostrarAyuda] = useState(false); // Para ver los hotspots

  // Cargamos los datos de la misión actual
  // @ts-ignore
  const mision = require('@/data/historia').MISIONES[misionId];

  // Efecto inicial para mostrar la descripción al entrar
  useEffect(() => {
    setMensaje(mision.descripcion);
  }, [misionId]);

  const interactuar = (hotspot: any) => {
    // Si tenemos un objeto seleccionado, intentamos USARLO
    if (itemSeleccionado) {
      if (hotspot.tipo === 'usar' && hotspot.requiere === itemSeleccionado.id) {
        setMensaje(hotspot.mensajeExito);
        setItemSeleccionado(null); // Soltamos el objeto
        
        // Logramos el objetivo, pasamos de nivel
        if (hotspot.accion === 'abrir_puerta') {
          setTimeout(() => onCompletar(), 4000); // Espera 4 segundos para que leas el mensaje
        }
      } else {
        setMensaje(`No podés usar '${itemSeleccionado.nombre}' con '${hotspot.label}'. Esto no es magia burguesa.`);
        setItemSeleccionado(null); // Soltamos el objeto por equivocarnos
      }
      return; // Cortamos acá para no ejecutar la acción por defecto del hotspot
    }

    // ACCIONES POR DEFECTO (Si no tenemos nada seleccionado en la mano)
    if (hotspot.tipo === 'recoger') {
      if (!gameState.inventario.find((i: any) => i.id === hotspot.item.id)) {
        setGameState({ ...gameState, inventario: [...gameState.inventario, hotspot.item] });
        setMensaje(`Recogiste: ${hotspot.item.nombre}. ${hotspot.mensaje}`);
      } else {
        setMensaje("Ya te llevaste esto. Dejá de saquear.");
      }
    } 
    else if (hotspot.tipo === 'hablar') {
      setMensaje(`${hotspot.label}: "${hotspot.mensaje}"`);
    } 
    else if (hotspot.tipo === 'usar') {
      setMensaje(hotspot.mensajeFallo);
    }
  };

  // Texto dinámico para saber qué estamos haciendo
  const textoAccion = itemSeleccionado 
    ? `Usar [ ${itemSeleccionado.nombre} ] con...` 
    : "Selecciona un objeto o interactúa con el entorno.";

  return (
    <div className="relative w-full h-full min-h-[70vh] bg-black border-4 border-soviet-red overflow-hidden shadow-2xl rounded-sm">
      
      {/* IMAGEN DE FONDO */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${mision.fondo})` }}
      />

      {/* RENDERIZADO DE HOTSPOTS */}
      {mision.hotspots.map((hs: any) => (
        <button
          key={hs.id}
          onClick={() => interactuar(hs)}
          // La clase cambia si activamos la ayuda para que brillen
          className={`absolute w-16 h-16 flex items-center justify-center rounded-full transition-all group z-10 
            ${mostrarAyuda ? 'bg-soviet-gold/40 border-2 border-soviet-gold animate-pulse' : 'bg-white/5 hover:bg-white/20 border border-transparent'}`}
          style={{ left: `${hs.x}%`, top: `${hs.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {/* Etiqueta que aparece al pasar el mouse */}
          <span className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-black/90 text-white font-bold text-xs p-2 whitespace-nowrap border border-soviet-red pointer-events-none transition-opacity shadow-lg">
            {hs.label}
          </span>
        </button>
      ))}

      {/* INTERFAZ DE USUARIO (HUD) */}
      
      {/* 1. Botón de Ayuda (Para ver dónde están los clicks) */}
      <button 
        onMouseDown={() => setMostrarAyuda(true)}
        onMouseUp={() => setMostrarAyuda(false)}
        onMouseLeave={() => setMostrarAyuda(false)}
        className="absolute top-4 left-4 bg-black/80 text-white border border-soviet-gold p-2 text-xs font-bold hover:bg-soviet-red transition-colors z-20"
      >
        [ MANTENER PRESIONADO PARA VER HOTSPOTS ]
      </button>

      {/* 2. Inventario (Arriba a la derecha) */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        {gameState.inventario.map((item: any) => (
          <button 
            key={item.id}
            onClick={() => setItemSeleccionado(itemSeleccionado?.id === item.id ? null : item)}
            className={`w-14 h-14 flex items-center justify-center text-3xl border-2 transition-all shadow-lg
              ${itemSeleccionado?.id === item.id ? 'bg-soviet-red border-white scale-110' : 'bg-black/80 border-soviet-gold hover:bg-black/60'}`}
            title={item.nombre}
          >
            {item.icono}
          </button>
        ))}
      </div>

      {/* 3. Caja de Mensajes y Diálogos (Abajo) */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/95 border-t-4 border-soviet-gold p-6 min-h-[120px] z-20 flex flex-col justify-center">
        <p className="text-soviet-red text-xs font-bold uppercase tracking-widest mb-2 opacity-80">
          {textoAccion}
        </p>
        <p className="text-white font-mono text-xl">
          {mensaje}
        </p>
      </div>

    </div>
  );
}