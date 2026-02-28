// src/data/historia.ts
import { Item } from '@/context/GameContext';

export interface Hotspot {
  id: string;
  x: number; // % desde la izquierda
  y: number; // % desde arriba
  label: string;
  tipo: 'recoger' | 'hablar' | 'usar';
  // Para tipo 'recoger'
  item?: Item;
  mensaje?: string;
  // Para tipo 'usar'
  requiere?: string;
  mensajeFallo?: string;
  mensajeExito?: string;
  accion?: string;
}

export interface Mision {
  id: number;
  titulo: string;
  año: number;
  ubicacion: string;
  fondo: string;
  descripcion: string;
  hotspots: Hotspot[];
  siguienteMision: number | null;
}

// ---------------------------------------------------------------------------
// INVENTARIO BASE (lo que el jugador tiene desde el inicio)
// ---------------------------------------------------------------------------
export const INVENTARIO_BASE: Item[] = [
  {
    id: 'pan_duro',
    nombre: 'Pan Duro',
    desc: 'Arma contundente o cena, según la necesidad histórica.',
    icono: '🥖',
  },
  {
    id: 'manual_justo',
    nombre: 'Manual de Juan B. Justo',
    desc: 'Socialismo con sabor a asado. Confunde profundamente a los rusos.',
    icono: '📘',
  },
];

// ---------------------------------------------------------------------------
// MISIONES
// ---------------------------------------------------------------------------
export const MISIONES: Record<number, Mision> = {
  1905: {
    id: 1905,
    titulo: 'La Huelga de Putilov',
    año: 1905,
    ubicacion: 'San Petersburgo',
    fondo: '/escenas/mision_1905.png',
    descripcion:
      'Enero de 1905. Fábrica Putilov. 12.000 obreros, un frío polar y una puerta que no abre. El destino de la revolución depende de vos.',
    hotspots: [
      {
        id: 'volante',
        x: 20,
        y: 80,
        tipo: 'recoger',
        label: 'Volante Pisoteado',
        item: {
          id: 'volante',
          nombre: 'Volante del POSDR',
          desc: 'Manchado con barro y teoría marxista. Alguien lo pisó. Típico.',
          icono: '📄',
        },
        mensaje: 'Un volante revolucionario. Alguien lo pisó. Típico.',
      },
      {
        id: 'obrero_viejo',
        x: 40,
        y: 65,
        tipo: 'hablar',
        label: 'Obrero Cansado',
        mensaje:
          'Compañero, si me vas a hablar de plusvalía, primero consígueme fuego.',
      },
      {
        id: 'puerta_fabrica',
        x: 75,
        y: 50,
        tipo: 'usar',
        label: 'Puerta Trabada',
        requiere: 'pan_duro',
        mensajeFallo:
          'Está trabada por el hielo y la burocracia zarista. Necesitás algo contundente.',
        mensajeExito:
          '¡Usaste el pan duro como palanca! La puerta cedió con un crujido histórico. ¡El pan es la base de la revolución!',
        accion: 'completar_mision',
      },
    ],
    siguienteMision: 1912,
  },

  1912: {
    id: 1912,
    titulo: 'La Imprenta de la Pravda',
    año: 1912,
    ubicacion: 'Praga',
    fondo: '/escenas/mision_1912.png',
    descripcion:
      'Praga, 1912. Un sótano húmedo. La prensa está rota, la tinta escasea y Lenin manda mensajes amenazantes desde Cracovia.',
    hotspots: [
      {
        id: 'camarada_impresor',
        x: 20,
        y: 50,
        tipo: 'hablar',
        label: 'Camarada Impresor',
        mensaje:
          'Si no imprimimos esto hoy, Lenin nos va a mandar a contar árboles a Siberia. Y son muchos árboles.',
      },
      {
        id: 'engranaje',
        x: 50,
        y: 60,
        tipo: 'usar',
        label: 'Engranaje Trabado',
        requiere: 'grasa',
        mensajeFallo:
          'La prensa no gira. Necesita lubricación. El capital no lubrica, pero la grasa sí.',
        mensajeExito:
          '¡La máquina ruge con el poder del proletariado! Las palabras de Lenin volarán por toda Europa. ¡Que tiemble el capital!',
        accion: 'completar_mision',
      },
      {
        id: 'lata_grasa',
        x: 80,
        y: 30,
        tipo: 'recoger',
        label: 'Lata de Grasa de Cerdo',
        item: {
          id: 'grasa',
          nombre: 'Grasa de Cerdo',
          desc: 'Lubricante burgués al servicio de la causa proletaria. La contradicción hecha sustancia.',
          icono: '🫙',
        },
        mensaje:
          'Recogiste la lata de grasa. El impresor asiente con gravedad revolucionaria.',
      },
    ],
    siguienteMision: 1917,
  },
};
