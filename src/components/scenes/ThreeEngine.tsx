// ThreeEngine — Motor de juego principal con Three.js 3D
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import type { Item } from '@/context/GameContext';
import { GameScene } from '@/lib/three/GameScene';
import type { GameSceneConfig } from '@/lib/three/GameScene';
import { MusicEngine, moodForYear } from '@/lib/audio/MusicEngine';
import { DECISIONES, calcularEpilogo } from '@/lib/game/FervorSystem';
import type { Decision } from '@/lib/game/FervorSystem';
import { checkCombinacion } from '@/lib/game/ItemCombination';
import { getCodexByFlag } from '@/lib/game/HistoricalCodex';
import { DUELOS_POR_MISION } from '@/lib/game/DueloDialecticoData';
import type { RondaDuelo } from '@/lib/game/DueloDialecticoData';

// UI Components
import DueloDialog from '@/components/ui/DueloDialog';
import CodexPanel from '@/components/ui/CodexPanel';
import PianoModal from '@/components/ui/PianoModal';

interface Props {
  misionId: number;
  onCompletar: () => void;
}

// Datos de misiones (inline para ThreeEngine — luego migrable a data)
interface MisionData {
  titulo: string;
  año: number;
  ubicacion: string;
  descripcion: string;
  anchoMundo: number;
  tresScene: GameSceneConfig;
  hotspots: HotspotData[];
  pista: string;
  siguiente: number | null;
  duelo?: RondaDuelo[];
  decisiones?: Decision[];
  itemsBase?: Item[];
}

interface HotspotData {
  id: string;
  x: number; // porcentaje 0-100 del ancho del mundo
  z: number; // profundidad -5 a 5
  label: string;
  tipo: 'recoger' | 'hablar' | 'usar' | 'examinar' | 'navegar' | 'debatir' | 'decision';
  item?: Item;
  mensaje?: string;
  requiere?: string;
  requiereFlag?: string;
  requiereFlags?: string[]; // multiple flags (AND)
  mensajeExito?: string;
  mensajeFallo?: string;
  setFlag?: string;
  completaMision?: boolean;
  consumir?: boolean;
  usarCon?: { requiere: string; mensajeExito?: string; setFlag?: string; consumir?: boolean }[];
  puzle?: 'piano';
  dialogo?: string;
  opciones?: { texto: string; setFlag: string; respuestaNPC: string }[];
  codigoAbierto?: string; // codex id que desbloquea al examinar
}

// MISIONES en formato Three.js
const MISIONES_DATA: Record<number, MisionData> = {
  1905: {
    titulo: 'La Huelga de Putilov',
    año: 1905,
    ubicacion: 'San Petersburgo',
    descripcion: 'Enero de 1905. Fábrica Putilov. 12.000 obreros en huelga. El hambre y el frío son los únicos compañeros.',
    anchoMundo: 30,
    tresScene: { anchoMundo: 30, nieve: true, multitud: false, hora: 'noche', colorFondo: 0x1a2a3a, colorSuelo: 0x445566 },
    pista: 'Hablá con el capataz. Si no cede, usá el pan como argumento dialéctico.',
    siguiente: 1905.1,
    duelo: DUELOS_POR_MISION[1905],
    decisiones: DECISIONES[1905],
    itemsBase: [
      { id: 'pan_duro', nombre: 'Pan Duro', desc: 'Arma contundente o cena, según la necesidad.', icono: '🥖' },
      { id: 'pañuelo_rojo', nombre: 'Pañuelo de la Internacional', desc: 'Rojo como la revolución.', icono: '🟥' },
    ],
    hotspots: [
      { id: 'capataz', x: 20, z: 1, label: 'Capataz', tipo: 'hablar', dialogo: 'No hay trabajo. No hay pan. Andate antes de que llame a la policía.' },
      { id: 'pan_dar', x: 20, z: 1, label: 'Capataz', tipo: 'usar', requiere: 'pan_duro', mensajeExito: 'Le das el pan duro. El capataz lo mira y suspira: "Tomá, llevale esto a los de la fundición. Y que se apuren."', consumir: true, setFlag: 'pan_dado' },
      { id: 'volante_suelo', x: 35, z: 0, label: 'Volante Pisoteado', tipo: 'recoger', item: { id: 'volante', nombre: 'Volante del POSDR', desc: 'Manchado de barro y teoría marxista.', icono: '📄' }, mensaje: 'Un volante en el piso. Alguien lo pisó. Típico.' },
      { id: 'obrero_fundicion', x: 55, z: -1, label: 'Obrero de Fundición', tipo: 'hablar', dialogo: 'Compañera, ¿traés algo para comer? Huelga es linda en los panfletos, fea en el estómago.' },
      { id: 'caldera', x: 70, z: 2, label: 'Caldera', tipo: 'examinar', mensaje: 'Una caldera gigante. Hierve con el resentimiento de mil obreros.', codigoAbierto: 'kollontai' },
      { id: 'puerta_fabrica', x: 85, z: 0, label: 'Puerta de la Fábrica', tipo: 'usar', requiere: 'pan_dado', mensajeExito: '¡La puerta se abre! Los obreros te miran. La huelga está viva.', setFlag: 'puerta_abierta', completaMision: true, mensajeFallo: 'Está trabada. Necesitás un motivo para abrirla.' },
    ],
  },

  1905.1: {
    titulo: 'Domingo Sangriento',
    año: 1905,
    ubicacion: 'Plaza del Palacio, San Petersburgo',
    descripcion: '9 de enero. Miles de obreros marchan hacia el Palacio de Invierno. Creen que el Zar los escuchará.',
    anchoMundo: 35,
    tresScene: { anchoMundo: 35, nieve: true, multitud: true, hora: 'dia', colorFondo: 0x444455, colorSuelo: 0x556677 },
    pista: 'Decidí qué hacer cuando los soldados apunten. Cada camino tiene consecuencias.',
    siguiente: 1912,
    decisiones: DECISIONES[1905],
    hotspots: [
      { id: 'marchar', x: 40, z: 0, label: 'Marchar con los obreros', tipo: 'decision', mensaje: '¿TE UNÍS A LA MARCHA? Los soldados están formados. El silencio es ensordecedor.' },
      { id: 'gapón', x: 30, z: -1, label: 'Padre Gapón', tipo: 'debatir', mensaje: 'El sacerdote te mira: "Compañera, ¿sabés por qué estamos aquí?"' },
      { id: 'palacio_lejos', x: 70, z: 1, label: 'Palacio de Invierno', tipo: 'examinar', mensaje: 'El Palacio. 1500 ventanas. Un Zar. Y 200.000 personas que quieren hablar con él.' },
    ],
  },

  1912: {
    titulo: 'La Imprenta de la Pravda',
    año: 1912,
    ubicacion: 'Praga',
    descripcion: 'Un sótano húmedo. La prensa está rota. Lenin manda mensajes desde Cracovia.',
    anchoMundo: 25,
    tresScene: { anchoMundo: 25, nieve: false, multitud: false, hora: 'noche', colorFondo: 0x0a0a05, colorSuelo: 0x332211 },
    pista: 'La prensa necesita lubricación. Buscá algo grasoso.',
    siguiente: 1917,
    hotspots: [
      { id: 'impresor', x: 25, z: 1, label: 'Camarada Impresor', tipo: 'hablar', dialogo: 'Si no imprimimos hoy, Lenin nos va a mandar a contar árboles a Siberia.' },
      { id: 'lata_grasa', x: 80, z: 0, label: 'Lata de Grasa', tipo: 'recoger', item: { id: 'grasa', nombre: 'Grasa de Cerdo', desc: 'Lubricante burgués al servicio de la causa proletaria.', icono: '🫙' }, mensaje: 'Grasa de cerdo. El impresor asiente con gravedad revolucionaria.' },
      { id: 'engranaje', x: 55, z: 0, label: 'Engranaje Trabado', tipo: 'usar', requiere: 'grasa', mensajeExito: '¡La prensa ruge! Las palabras de Lenin vuelan.', setFlag: 'prensa_funciona', completaMision: true, mensajeFallo: 'La prensa no gira. Necesita lubricación.' },
      { id: 'carta_lenin', x: 40, z: -1, label: 'Carta de Lenin', tipo: 'examinar', mensaje: '"Si la prensa no funciona para el viernes, no habrá revolución. Ni vodka. — V.I."', codigoAbierto: 'lenin_exilio' },
    ],
  },

  1917: {
    titulo: 'El Expreso de la Revolución',
    año: 1917,
    ubicacion: 'Gottmadingen → Petrogrado',
    descripcion: 'Abril 1917. El tren sellado alemán espera. Lenin quiere volver a casa.',
    anchoMundo: 40,
    tresScene: { anchoMundo: 40, nieve: false, multitud: false, hora: 'atardecer', colorFondo: 0x554433, colorSuelo: 0x443322 },
    pista: 'El maquinista duerme. El oficial alemán está aburrido. Lenin necesita... el baño.',
    siguiente: 1917.1,
    duelo: DUELOS_POR_MISION[1917],
    decisiones: DECISIONES[1917],
    hotspots: [
      { id: 'maquinista', x: 20, z: 1, label: 'Maquinista', tipo: 'hablar', dialogo: 'Zzzz... Neun... Zzz... Cerveza... Zzzz.' },
      { id: 'schnapps', x: 70, z: 1, label: 'Schnapps Alemán', tipo: 'recoger', item: { id: 'schnapps', nombre: 'Schnapps Alemán', desc: 'Líquido que podría derretir acero.', icono: '🍾' }, mensaje: 'Tomaste la botella con discreción bolchevique.' },
      { id: 'despertar_maquinista', x: 20, z: 1, label: 'Maquinista', tipo: 'usar', requiere: 'schnapps', mensajeExito: '¡AAAACH! ¡DAS BRENNT! El maquinista despierta. "El reloj marca las 04:00."', consumir: true, setFlag: 'maquinista_despierto' },
      { id: 'reloj', x: 25, z: 0, label: 'Reloj de Bronce', tipo: 'examinar', requiereFlag: 'maquinista_despierto', mensaje: 'Son las 04:10. Un reloj de precisión prusiana.', setFlag: 'hora_conocida' },
      { id: 'banio_humo', x: 50, z: -1, label: 'Puerta del Baño', tipo: 'examinar', mensaje: 'Sale humo por debajo. Parece que queman El Capital ahí dentro.' },
      { id: 'tiza_suelo', x: 80, z: 0, label: 'Tiza en el Suelo', tipo: 'recoger', item: { id: 'tiza', nombre: 'Tiza Blanca', desc: 'Para dibujar mapas, fronteras... o líneas en el piso.', icono: '🪨' }, mensaje: 'Un trozo de tiza. Arma poderosa para redefinir fronteras.' },
      { id: 'lenin', x: 55, z: 1, label: 'Lenin', tipo: 'hablar', requiereFlag: 'hora_conocida', dialogo: '¡Las 04:10! Con ese dato, redacto el Decreto Provisional del Turno de Baño.', setFlag: 'pidio_orden' },
      { id: 'sello', x: 40, z: 0, label: 'Sello Imperial', tipo: 'recoger', item: { id: 'sello', nombre: 'Sello Imperial Alemán', desc: 'Bronce. Águila bicéfala. Pesa como un imperio.', icono: '🦅' }, mensaje: 'El sello del águila. Ahora es parte de la revolución.' },
      { id: 'firmar_decreto', x: 55, z: 1, label: 'Lenin', tipo: 'usar', requiere: 'sello', requiereFlag: 'pidio_orden', mensajeExito: '¡El decreto está sellado! Los fumadores abren la puerta. ¡La higiene proletaria triunfa!', consumir: false, setFlag: 'mision_1917_completa', completaMision: true },
    ],
  },

  1917.1: {
    titulo: 'Asalto al Palacio de Invierno',
    año: 1917,
    ubicacion: 'Petrogrado',
    descripcion: '25 de octubre. La ciudad duerme. Hay que apagar las luces del Palacio antes del asalto.',
    anchoMundo: 35,
    tresScene: { anchoMundo: 35, nieve: true, multitud: false, hora: 'noche', colorFondo: 0x1a2a3a, colorSuelo: 0x445566 },
    pista: 'Apagá los tres faroles del Palacio usando el pañuelo rojo.',
    siguiente: 1918,
    hotspots: [
      { id: 'guardia', x: 15, z: 1, label: 'Guardia Zarista', tipo: 'hablar', dialogo: 'Zzz... ¿Quién va? No soy un guardia, soy un mueble... Zzz.' },
      { id: 'farol_1', x: 25, z: 0, label: 'Farol del Patio', tipo: 'usar', requiere: 'pañuelo_rojo', mensajeExito: 'Cubrís el farol. La luz se tiñe de rojo.', setFlag: 'farol_1_apagado', consumir: false, mensajeFallo: 'Está muy alto.' },
      { id: 'farol_2', x: 50, z: 0, label: 'Farol de la Entrada', tipo: 'usar', requiere: 'pañuelo_rojo', mensajeExito: 'Segundo farol apagado. El Palacio se oscurece.', setFlag: 'farol_2_apagado', consumir: false, mensajeFallo: 'Demasiado visible.' },
      { id: 'farol_3', x: 75, z: 0, label: 'Farol del Jardín', tipo: 'usar', requiere: 'pañuelo_rojo', mensajeExito: 'Tres faroles apagados. El Palacio es una cueva ornamentada.', setFlag: 'farol_3_apagado', consumir: false, completaMision: true, mensajeFallo: 'Un perro ladra.' },
      { id: 'palacio_interior', x: 60, z: -2, label: 'Palacio de Invierno', tipo: 'examinar', mensaje: 'El Palacio duerme. Adentro, los ministros del Gobierno Provisional esperan su destino.', codigoAbierto: 'winter_palace' },
      { id: 'caja_herramientas', x: 85, z: 1, label: 'Caja de Herramientas', tipo: 'recoger', item: { id: 'llave_inglesa', nombre: 'Llave Inglesa', desc: 'Para apretar tuercas o certezas.', icono: '🔧' }, mensaje: 'Una llave inglesa. Útil para todo.' },
    ],
  },

  1918: {
    titulo: 'Brest-Litovsk',
    año: 1918,
    ubicacion: 'Petrogrado → Brest',
    descripcion: 'Marzo 1918. Alemania avanza. Lenin quiere firmar la paz. Bujarin quiere guerra. Vos tenés que decidir.',
    anchoMundo: 30,
    tresScene: { anchoMundo: 30, nieve: true, multitud: false, hora: 'noche', colorFondo: 0x1a2a3a, colorSuelo: 0x445566 },
    pista: 'Escuchá los argumentos de cada facción antes de decidir.',
    siguiente: 1918.1,
    decisiones: DECISIONES[1918],
    hotspots: [
      { id: 'decidir_paz', x: 50, z: 0, label: 'Firmar la Paz', tipo: 'decision', mensaje: 'LENIN VS BUJARIN VS TROTSKY. ¿Qué camino apoyás?' },
      { id: 'mapa_frente', x: 30, z: -1, label: 'Mapa del Frente', tipo: 'examinar', mensaje: 'Los alemanes avanzan. No hay ejército que los pare.', codigoAbierto: 'brest_litovsk' },
    ],
  },

  1918.1: {
    titulo: 'Los Romanov',
    año: 1918,
    ubicacion: 'Ekaterimburgo',
    descripcion: 'Julio 1918. Los Romanov esperan su destino en el sótano de la Casa Ipatiev.',
    anchoMundo: 25,
    tresScene: { anchoMundo: 25, nieve: false, multitud: false, hora: 'noche', colorFondo: 0x1a1a2a, colorSuelo: 0x445566 },
    pista: 'El destino de la familia real está en tus manos.',
    siguiente: 1919,
    decisiones: DECISIONES[1918],
    hotspots: [
      { id: 'decidir_romanov', x: 50, z: 0, label: 'Los Romanov', tipo: 'decision', mensaje: 'Las blancas se acercan. ¿QUÉ HACÉS CON LA FAMILIA IMPERIAL?' },
      { id: 'diario_nicolas', x: 30, z: 1, label: 'Diario de Nicolás II', tipo: 'examinar', mensaje: '"Hoy hace sol en Ekaterimburgo. Los niños jugaron en el jardín. No sabemos qué pasará mañana."', codigoAbierto: 'bloody_sunday' },
    ],
  },

  1919: {
    titulo: 'El Tren Blindado de Trotsky',
    año: 1919,
    ubicacion: 'Frente Oriental',
    descripcion: 'Trotsky viaja en su tren blindado. Hay que convencerlo de que el arte es arma de guerra.',
    anchoMundo: 35,
    tresScene: { anchoMundo: 35, nieve: false, multitud: true, hora: 'atardecer', colorFondo: 0x443322, colorSuelo: 0x554433 },
    pista: 'Trotsky no cede ante palabras. Necesitás tocar La Internacional en el piano: Do-Mi-Sol-Do.',
    siguiente: 1921,
    duelo: DUELOS_POR_MISION[1919],
    hotspots: [
      { id: 'trotsky_habla', x: 65, z: 1, label: 'Trotsky', tipo: 'hablar', dialogo: 'Camarada, no tengo tiempo para poesía. Tengo un ejército que organizar.' },
      { id: 'partitura', x: 15, z: 0, label: 'Partitura Rota', tipo: 'recoger', item: { id: 'partitura_rota', nombre: 'Partitura de La Internacional', desc: 'Solo se ven las primeras notas: Do-Mi-Sol-Do.', icono: '🎼' }, mensaje: 'La partitura. Manchas de carbón. Pero las notas se leen.' },
      { id: 'piano_tren', x: 25, z: 0, label: 'Piano de Cola', tipo: 'usar', requiere: 'partitura_rota', puzle: 'piano', mensajeExito: '¡La Internacional! Trotsky se acerca, sorprendido. "Qué ironía más deliciosa."', setFlag: 'piano_tocado', mensajeFallo: 'El piano está cerrado. Dice: "Solo suena para quien conoce la canción del pueblo."' },
      { id: 'carbon_cajon', x: 45, z: 1, label: 'Carbón', tipo: 'recoger', item: { id: 'carbon', nombre: 'Trozo de Carbón', desc: 'Combustible proletario.', icono: '⬛' }, mensaje: 'Carbón del bueno.' },
      { id: 'trotsky_convencer', x: 65, z: 1, label: 'Trotsky', tipo: 'usar', requiereFlag: 'piano_tocado', mensajeExito: 'Trotsky asiente: "El arte es arma de clase. Tomá estos documentos."', setFlag: 'trotsky_convencido', completaMision: true },
      { id: 'tren_interior', x: 50, z: -2, label: 'Interior del Tren', tipo: 'examinar', mensaje: 'Un tren que es ciudad, fábrica, cuartel y hogar. Trotsky vive aquí.', codigoAbierto: 'trotsky_train' },
      { id: 'biblioteca', x: 75, z: -1, label: 'Biblioteca Móvil', tipo: 'usar', requiere: 'carbon', mensajeExito: 'Escribís en la pared del tren: "EL ARTE TAMBIÉN ES UN ARMA" con carbón.', consumir: false, codigoAbierto: 'nep' },
    ],
  },

  1921: {
    titulo: 'Kronstadt',
    año: 1921,
    ubicacion: 'Base Naval de Kronstadt',
    descripcion: 'Marzo de 1921. Los marineros héroes de Octubre se revelan. El partido ordena aplastarlos.',
    anchoMundo: 30,
    tresScene: { anchoMundo: 30, nieve: true, multitud: true, hora: 'noche', colorFondo: 0x1a2a3a, colorSuelo: 0x445566 },
    pista: 'Cada bando tiene razón. Elegí con cuidado.',
    siguiente: 1922,
    decisiones: DECISIONES[1921],
    hotspots: [
      { id: 'decidir_kron', x: 50, z: 0, label: 'Kronstadt', tipo: 'decision', mensaje: 'LOS MARINEROS EXIGEN LIBERTAD. TROTSKY ORDENA ATACAR. ¿QUÉ HACÉS?' },
      { id: 'hielo_golfo', x: 30, z: -1, label: 'Golfo de Finlandia', tipo: 'examinar', mensaje: 'El hielo cruje bajo los pies. Por aquí atacará el Ejército Rojo.', codigoAbierto: 'kronstadt' },
    ],
  },

  1922: {
    titulo: 'Fundación de la URSS',
    año: 1922,
    ubicacion: 'Moscú, Gran Teatro',
    descripcion: 'Diciembre de 1922. Tres delegados, tres problemas, una sola Unión.',
    anchoMundo: 30,
    tresScene: { anchoMundo: 30, nieve: false, multitud: false, hora: 'dia', colorFondo: 0x2a2a2a, colorSuelo: 0x443333 },
    pista: 'Convencé a los tres delegados con argumentos. Después firmá la mesa central.',
    siguiente: 1924,
    duelo: DUELOS_POR_MISION[1922],
    decisiones: DECISIONES[1922],
    hotspots: [
      { id: 'delegado_ucrania', x: 20, z: 1, label: 'Delegado de Ucrania', tipo: 'hablar', dialogo: 'Ucrania aporta el trigo. ¿Dónde están nuestras garantías?' },
      { id: 'delegado_bielo', x: 50, z: 1, label: 'Delegado de Bielorrusia', tipo: 'hablar', dialogo: 'Nuestras fábricas están rotas. ¿Quién las repara?' },
      { id: 'delegado_caucaso', x: 80, z: 1, label: 'Delegado del Cáucaso', tipo: 'hablar', dialogo: 'Aportamos vino, petróleo y recuerdos dolorosos.' },
      { id: 'mesa_firma', x: 50, z: -1, label: 'Mesa de Firma', tipo: 'usar', requiereFlags: ['ucrania_ok', 'bielo_ok', 'caucaso_ok'], mensajeExito: '¡La URSS nace! 30 de diciembre de 1922.', setFlag: 'urss_firmada', completaMision: true, mensajeFallo: 'Falta convencer a todos.' },
      { id: 'tintero', x: 65, z: -1, label: 'Tintero', tipo: 'recoger', item: { id: 'tinta', nombre: 'Tinta de la Revolución', desc: 'Roja. Permanente.', icono: '🖋️' }, mensaje: 'Tinta roja. Para escribir historia.' },
      { id: 'sala_kremlin', x: 40, z: -2, label: 'Sala del Kremlin', tipo: 'examinar', mensaje: 'Las arañas de luz iluminan a los que están a punto de cambiar el mundo.', codigoAbierto: 'stalin_rise' },
    ],
  },

  1924: {
    titulo: 'El Legado',
    año: 1924,
    ubicacion: 'Moscú, Plaza Roja',
    descripcion: 'Enero 1924. Lenin ha muerto. El Mausoleo está en construcción. Alexandra camina entre los obreros.',
    anchoMundo: 35,
    tresScene: { anchoMundo: 35, nieve: true, multitud: true, hora: 'atardecer', colorFondo: 0x222233, colorSuelo: 0x334455 },
    pista: 'Reflexioná sobre todo lo que pasó. Y después, tocá La Internacional una última vez.',
    siguiente: null,
    hotspots: [
      { id: 'monumento_lenin', x: 50, z: 0, label: 'Mausoleo de Lenin', tipo: 'examinar', mensaje: '"Lenin vivió. Lenin vive. Lenin vivirá." El mármol no dice nada sobre el baño del tren.', codigoAbierto: 'tren_sellado' },
      { id: 'obreros_mausoleo', x: 35, z: 1, label: 'Obreros', tipo: 'hablar', dialogo: 'Camarada, ¿usted estuvo en el Expreso? ¡Cuéntenos!' },
      { id: 'bandera_urss', x: 20, z: 0, label: 'Bandera de la URSS', tipo: 'examinar', mensaje: 'La hoz y el martillo. Herramientas de trabajo. La revolución fue un oficio.', codigoAbierto: 'aurora' },
      { id: 'piano_final', x: 75, z: 0, label: 'Piano Abandonado', tipo: 'usar', puzle: 'piano', mensajeExito: 'Tocás La Internacional. Las notas se desvanecen en el frío. Alguien las sigue cantando.', setFlag: 'fin_historia', completaMision: true, mensajeFallo: 'Un piano viejo, desafinado. Todavía recuerda las notas.' },
      { id: 'nieve_fresca', x: 60, z: -1, label: 'Nieve Fresca', tipo: 'examinar', mensaje: 'Las huellas de hoy serán historia mañana. Las de ayer, leyenda.' },
    ],
  },
};

export default function ThreeEngine({ misionId, onCompletar }: Props) {
  const { gameState, setGameState } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GameScene | null>(null);
  const musicRef = useRef<MusicEngine | null>(null);

  // Estado de juego
  const [mensaje, setMensaje] = useState('');
  const [subMensaje, setSubMensaje] = useState('');
  const [itemSeleccionado, setItemSeleccionado] = useState<Item | null>(null);
  const [hotspotsBloqueados, setHotspotsBloqueados] = useState<Set<string>>(new Set());
  const [completando, setCompletando] = useState(false);

  const [mostrarPista, setMostrarPista] = useState(false);
  const [mostrarCodex, setMostrarCodex] = useState(false);
  const [mostrarDuelo, setMostrarDuelo] = useState<boolean>(false);
  const [mostrarPiano, setMostrarPiano] = useState(false);
  const [mostrarDecision, setMostrarDecision] = useState<Decision | null>(null);
  const [dialogo, setDialogo] = useState<{ npc: string; texto: string; respuestas?: { texto: string; setFlag: string }[] } | null>(null);

  // Nueva entrada de codex
  const [nuevoCodex, setNuevoCodex] = useState<string | null>(null);

  const mision = MISIONES_DATA[misionId];

  // Inicializar escena Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new GameScene(containerRef.current, mision.tresScene);
    sceneRef.current = scene;
    scene.character.setPosition(0, 0);

    // Mostrar hotspots en 3D
    const hs3d = mision.hotspots
      .filter((hs) => !hotspotsBloqueados.has(hs.id))
      .map((hs) => ({
        x: (hs.x / 100) * mision.anchoMundo,
        y: 50 + hs.z * 10,
        tipo: hs.tipo,
        id: hs.id,
      }));
    scene.setHotspots(hs3d);

    // Música
    const music = new MusicEngine();
    musicRef.current = music;
    music.playMood(moodForYear(misionId));

    // Mensaje inicial
    setMensaje(mision.descripcion);

    return () => {
      scene.destroy();
      music.stop();
    };
  }, [misionId]);

  // Actualizar hotspots cuando cambian
  useEffect(() => {
    if (!sceneRef.current) return;
    const hs3d = mision.hotspots
      .filter((hs) => !hotspotsBloqueados.has(hs.id))
      .map((hs) => ({
        x: (hs.x / 100) * mision.anchoMundo,
        y: 50 + hs.z * 10,
        tipo: hs.tipo,
        id: hs.id,
      }));
    sceneRef.current.setHotspots(hs3d);
  }, [hotspotsBloqueados, misionId, itemSeleccionado]);

  // Click handler en el canvas 3D
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!sceneRef.current || completando) return;

      // Check if hit a hotspot
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const raycaster = sceneRef.current.screenToRay(mouseX, mouseY);
      const hotspotHit = sceneRef.current.getClickedHotspot(raycaster);

      if (hotspotHit) {
        const hs = mision.hotspots.find((h) => h.id === hotspotHit.id);
        if (hs) handleHotspot(hs);
      } else {
        // Walk to position
        const groundHit = sceneRef.current.getGroundIntersection(mouseX, mouseY);
        if (groundHit) {
          sceneRef.current.character.setPosition(groundHit.x, groundHit.z);
          sceneRef.current.setCameraTarget(groundHit.x);
          sceneRef.current.character.setMoving(true);
        }
      }
    },
    [mision, completando, itemSeleccionado, hotspotsBloqueados]
  );

  const handleHotspot = (hs: HotspotData) => {
    if (completando || hotspotsBloqueados.has(hs.id)) return;

    // Verificar requisitos
    if (hs.requiere && !gameState.inventario.some((i) => i.id === hs.requiere)) {
      setMensaje(hs.mensajeFallo ?? `Necesitás algo más para esto.`);
      return;
    }
    if (hs.requiereFlag && !gameState.flags[hs.requiereFlag]) {
      setMensaje(hs.mensajeFallo ?? 'Todavía no es momento.');
      return;
    }
    if (hs.requiereFlags && hs.requiereFlags.some((f) => !gameState.flags[f])) {
      setMensaje(hs.mensajeFallo ?? 'Falta cumplir requisitos.');
      return;
    }

    // CON ITEM SELECCIONADO - check combination
    if (itemSeleccionado && hs.tipo === 'usar') {
      const match = COMBINACIONES_RAPIDAS[itemSeleccionado.id]?.[hs.id];
      if (match) {
        setMensaje(match.mensaje);
        if (match.setFlag) setGameState((s) => ({ ...s, flags: { ...s.flags, [match.setFlag!]: true } }));
        if (match.consumir) {
          setGameState((s) => ({ ...s, inventario: s.inventario.filter((i) => i.id !== itemSeleccionado.id) }));
        }
        setItemSeleccionado(null);
        if (match.completaMision) completarMision();
        return;
      }
    }

    switch (hs.tipo) {
      case 'recoger': {
        if (!hs.item) return;
        setGameState((s) => {
          if (s.inventario.some((i) => i.id === hs.item!.id)) return s;
          return { ...s, inventario: [...s.inventario, hs.item!] };
        });
        setHotspotsBloqueados((p) => new Set([...p, hs.id]));
        setMensaje(hs.mensaje ?? `Recogiste: ${hs.item?.nombre}.`);
        setItemSeleccionado(null);
        break;
      }

      case 'hablar': {
        if (hs.dialogo) {
          setDialogo({ npc: hs.label, texto: hs.dialogo });
        }
        if (hs.setFlag && hs.setFlag !== 'pidio_orden') {
          setGameState((s) => ({ ...s, flags: { ...s.flags, [hs.setFlag!]: true } }));
        }
        setItemSeleccionado(null);
        break;
      }

      case 'usar': {
        if (hs.puzle === 'piano') {
          setMostrarPiano(true);
          return;
        }

        // Check usarCon
        if (itemSeleccionado && hs.usarCon) {
          const match = hs.usarCon.find((u) => u.requiere === itemSeleccionado.id);
          if (match) {
            setMensaje(match.mensajeExito ?? '¡Funciona!');
            if (match.setFlag) setGameState((s) => ({ ...s, flags: { ...s.flags, [match.setFlag!]: true } }));
            if (match.consumir !== false) {
              setGameState((s) => ({ ...s, inventario: s.inventario.filter((i) => i.id !== itemSeleccionado.id) }));
            }
            setItemSeleccionado(null);
            if (hs.completaMision) completarMision();
            return;
          }
        }

        setMensaje(hs.mensajeExito ?? 'Usaste el item correctamente.');
        if (hs.setFlag) setGameState((s) => ({ ...s, flags: { ...s.flags, [hs.setFlag!]: true } }));
        if (hs.consumir && itemSeleccionado) {
          setGameState((s) => ({ ...s, inventario: s.inventario.filter((i) => i.id !== itemSeleccionado.id) }));
        }
        setItemSeleccionado(null);
        if (hs.completaMision) completarMision();
        break;
      }

      case 'examinar': {
        setMensaje(hs.mensaje ?? 'No ves nada especial.');
        // Desbloquear codex
        if (hs.codigoAbierto && !gameState.codexDesbloqueados.includes(hs.codigoAbierto)) {
          setGameState((s) => ({
            ...s,
            codexDesbloqueados: [...s.codexDesbloqueados, hs.codigoAbierto!],
          }));
          setNuevoCodex(hs.codigoAbierto);
        }
        setItemSeleccionado(null);
        break;
      }

      case 'debatir': {
        const duelos = mision.duelo;
        if (duelos && duelos.length > 0) {
          setMostrarDuelo(true);
        } else {
          setMensaje(hs.mensaje ?? 'No hay con quién debatir ahora.');
        }
        setItemSeleccionado(null);
        break;
      }

      case 'decision': {
        const decisions = mision.decisiones;
        if (decisions && decisions.length > 0) {
          setMostrarDecision(decisions[0]);
        } else {
          setMensaje(hs.mensaje ?? 'No hay decisiones que tomar ahora.');
        }
        setItemSeleccionado(null);
        break;
      }

      default:
        setMensaje(`Interactuaste con ${hs.label}`);
        setItemSeleccionado(null);
    }
  };

  const completarMision = useCallback(() => {
    setCompletando(true);
    setTimeout(() => onCompletar(), 4500);
  }, [onCompletar]);

  const handleDueloComplete = useCallback(
    (aciertos: number, total: number) => {
      setMostrarDuelo(false);
      const delta = Math.round((aciertos / total) * 10);
      setGameState((s) => ({
        ...s,
        fervor: Math.max(0, Math.min(100, s.fervor + delta)),
      }));
      setMensaje(`¡Duelo completado! ${aciertos}/${total} aciertos. Fervor +${delta}.`);
    },
    []
  );

  const handlePianoSuccess = useCallback(() => {
    setMostrarPiano(false);
    // Character dances!
    if (sceneRef.current) {
      sceneRef.current.character.startDance();
    }
    setMensaje('🎵 ¡La Internacional completa! Alexandra baila en la nieve de la historia.');
    setGameState((s) => ({ ...s, flags: { ...s.flags, piano_tocado: true } }));

    setTimeout(() => {
      if (sceneRef.current) {
        sceneRef.current.character.stopDance();
      }
    }, 8000);
  }, []);

  // Efecto de dancing cuando se completa el piano
  useEffect(() => {
    if (gameState.flags['piano_tocado'] && sceneRef.current) {
      sceneRef.current.character.startDance();
      setTimeout(() => {
        sceneRef.current?.character.stopDance();
      }, 8000);
    }
  }, [gameState.flags['piano_tocado']]);

  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden">
      {/* Canvas 3D */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        onClick={handleCanvasClick}
        style={{ cursor: itemSeleccionado ? 'crosshair' : 'default' }}
      />

      {/* HUD info */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400 bg-black/60 px-4 py-1 border border-yellow-400/30">
          {mision.año} · {mision.titulo}
        </p>
      </div>

      {/* Fervor bar */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <div className="bg-black/70 border border-yellow-400/40 px-2 py-1">
          <div className="text-[8px] font-black uppercase tracking-widest text-yellow-400/60 mb-0.5">FERVOR</div>
          <div className="w-24 h-2 bg-gray-800 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-red-600 transition-all duration-500"
              style={{ width: `${gameState.fervor}%` }}
            />
          </div>
          <div className="text-[8px] font-mono text-white/40 mt-0.5">{gameState.fervor}/100</div>
        </div>
        {nuevoCodex && (
          <button
            onClick={() => { setNuevoCodex(null); setMostrarCodex(true); }}
            className="bg-yellow-400/20 border border-yellow-400/40 px-2 py-1 animate-pulse text-[10px] text-yellow-300"
          >
            📖 ¡Nuevo Codex!
          </button>
        )}
      </div>

      {/* Botón Codex */}
      <button
        onClick={() => setMostrarCodex(true)}
        className="absolute top-4 right-4 z-30 bg-black/70 border border-white/20 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-yellow-400/60 transition-all"
      >
        📖 Codex
      </button>

      {/* Inventory (lateral derecho) */}
      <div className="absolute right-4 top-16 z-30 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
        {gameState.inventario.map((item) => (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              setItemSeleccionado(itemSeleccionado?.id === item.id ? null : item);
            }}
            className={[
              'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all hover:scale-105',
              itemSeleccionado?.id === item.id
                ? 'bg-yellow-400/30 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                : 'bg-black/60 border-white/30 hover:border-yellow-400/60',
            ].join(' ')}
            title={item.nombre}
          >
            {item.icono}
          </button>
        ))}
        {gameState.inventario.length === 0 && (
          <span className="text-[10px] text-white/30 italic bg-black/40 px-2 py-2">vacío</span>
        )}
      </div>

      {/* Item selected indicator */}
      {itemSeleccionado && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="bg-yellow-400/20 border-2 border-yellow-400 px-4 py-2 text-center animate-pulse">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">USANDO</p>
            <p className="text-white text-sm font-bold">{itemSeleccionado.icono} {itemSeleccionado.nombre}</p>
            <p className="text-white/50 text-[9px] italic">{itemSeleccionado.desc}</p>
          </div>
        </div>
      )}

      {/* Message box */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/95 to-transparent pt-16 pb-4 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-yellow-400/60 text-[10px] font-black uppercase tracking-widest">
              {mision.ubicacion}
            </span>
            <button
              onClick={() => setMostrarPista((p) => !p)}
              className="text-yellow-400/40 text-[10px] uppercase tracking-widest hover:text-yellow-400"
            >
              {mostrarPista ? '[Ocultar]' : '[¿Pista?]'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={mensaje}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-white font-mono text-base leading-relaxed"
            >
              {mensaje}
            </motion.p>
          </AnimatePresence>

          {mostrarPista && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-yellow-300/60 text-xs italic border-l-2 border-yellow-400/40 pl-3 mt-1"
            >
              💡 {mision.pista}
            </motion.p>
          )}
        </div>
      </div>

      {/* Modal: Diálogo */}
      <AnimatePresence>
        {dialogo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/50 flex items-end justify-center pb-32"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black border-2 border-yellow-400/60 max-w-xl w-full mx-4 p-5">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-2">💬 {dialogo.npc}</p>
              <p className="text-white text-base italic mb-4">"{dialogo.texto}"</p>
              <button
                onClick={() => setDialogo(null)}
                className="text-white/40 text-xs uppercase tracking-widest hover:text-white"
              >
                [ Cerrar ]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Duelo Dialéctico */}
      <AnimatePresence>
        {mostrarDuelo && mision.duelo && mision.duelo.length > 0 && (
          <DueloDialog
            ronda={mision.duelo[0]}
            onComplete={handleDueloComplete}
            onCerrar={() => setMostrarDuelo(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal: Piano */}
      <AnimatePresence>
        {mostrarPiano && (
          <PianoModal
            onSuccess={handlePianoSuccess}
            onCerrar={() => setMostrarPiano(false)}
            esFinal={misionId === 1924}
          />
        )}
      </AnimatePresence>

      {/* Modal: Decisión */}
      <AnimatePresence>
        {mostrarDecision && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-b from-black to-gray-900 border-2 border-red-600 max-w-xl w-full mx-4 p-6">
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">⚠️ DECISIÓN CRÍTICA</p>
              <p className="text-white/50 text-xs italic mb-3">{mostrarDecision.contexto}</p>
              <p className="text-white text-lg font-bold mb-4">{mostrarDecision.texto}</p>
              <div className="space-y-2">
                {mostrarDecision.opciones.map((op, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const delta = op.fervorDelta;
                      setGameState((s) => ({
                        ...s,
                        fervor: Math.max(0, Math.min(100, s.fervor + delta)),
                        flags: { ...s.flags, [op.setFlag || '']: true },
                      }));
                      setMensaje(op.descripcionResultado);
                      setMostrarDecision(null);
                    }}
                    className="w-full text-left p-3 border border-white/20 hover:bg-red-900/30 hover:border-red-500 transition-all"
                  >
                    <span className="block text-white text-sm font-bold">{op.texto}</span>
                    <span className="block text-[10px] text-white/40 mt-1">
                      Fervor {op.fervorDelta > 0 ? `+${op.fervorDelta}` : op.fervorDelta}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Codex */}
      <AnimatePresence>
        {mostrarCodex && (
          <CodexPanel flags={gameState.flags} onCerrar={() => setMostrarCodex(false)} />
        )}
      </AnimatePresence>

      {/* Overlay misión completada */}
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
              <p className="text-white/70 text-sm uppercase tracking-[0.3em] mb-2">
                {mision.año} — {mision.titulo}
              </p>
              <p className="text-white/40 text-[10px]">Fervor: {gameState.fervor}/100</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Combinaciones rápidas inline para ThreeEngine
const COMBINACIONES_RAPIDAS: Record<string, Record<string, { mensaje: string; setFlag?: string; consumir?: boolean; completaMision?: boolean }>> = {
  schnapps: {
    'maquinista': { mensaje: '¡El maquinista despierta! El reloj marca las 04:00.', setFlag: 'maquinista_despierto', consumir: true },
    'guardia': { mensaje: 'El guardia zarista agarra la botella y se duerme más profundo.', consumir: true },
  },
  sello: {
    'lenin': { mensaje: '¡El decreto está sellado! Los fumadores abren la puerta.', setFlag: 'mision_1917_completa', consumir: false, completaMision: true },
  },
  carbon: {
    'biblioteca': { mensaje: 'Escribís en la pared: "EL ARTE TAMBIÉN ES UN ARMA"', setFlag: 'carbon_escrito' },
  },
  tiza: {
    'linea_suelo': { mensaje: 'Redibujás la línea de tiza. La soberanía rusa se expande 10cm.', setFlag: 'frontera_expandida', consumir: true },
  },
};
