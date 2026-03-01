// src/data/historia.ts
import { Item } from '@/context/GameContext';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export type HotspotTipo = 'recoger' | 'hablar' | 'usar' | 'navegar';

/** Diálogo condicional: se evalúa en orden, se usa el primero que matchee */
export interface DialogoCondicional {
  requiereFlag?: string;       // el flag debe ser true
  requiereFlagFalso?: string;  // el flag debe ser false
  texto: string;
  setFlag?: string;            // activa este flag al dispararse
}

/**
 * Uso de item sobre este hotspot (independiente del tipo del hotspot).
 * Si tiene mensajeExito → es caso exitoso.
 * Si solo tiene mensajeFallo → es caso fallido (sin requiereFlag: catch-all).
 */
export interface UsarCon {
  requiere: string;           // id del item
  requiereFlag?: string;      // flag adicional requerida para que aplique
  mensajeExito?: string;
  mensajeFallo?: string;
  setFlag?: string;
  completaMision?: boolean;
  consumir?: boolean;         // default: true
}

export interface Hotspot {
  id: string;
  x: number; // % desde la izquierda
  y: number; // % desde arriba
  label: string;
  tipo: HotspotTipo;

  // recoger
  item?: Item;
  mensaje?: string; // mensaje al recoger; o texto de hablar simple

  // hablar (con variantes según estado)
  dialogos?: DialogoCondicional[];

  // usar (sin item en mano — muestra mensajeFallo)
  mensajeFallo?: string;

  // usar simple (tipo='usar', un solo item)
  requiere?: string;
  mensajeExito?: string;
  setFlag?: string;
  completaMision?: boolean;
  consumir?: boolean; // default: true

  // usar complejo (funciona sobre cualquier tipo de hotspot)
  usarCon?: UsarCon[];

  // navegar
  destino?: string;

  // visibilidad
  ocultarSiFlag?: string;
}

export interface SubEscena {
  id: string;
  fondo: string;
  descripcion: string;
  hotspots: Hotspot[];
  escenaAnterior?: string;
}

export interface Mision {
  id: number;
  titulo: string;
  año: number;
  ubicacion: string;
  fondo?: string;
  descripcion?: string;
  hotspots?: Hotspot[];
  subEscenas?: Record<string, SubEscena>;
  escenaInicial?: string;
  siguienteMision: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTARIO BASE
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// MISIONES
// ─────────────────────────────────────────────────────────────────────────────

export const MISIONES: Record<number, Mision> = {

  // ══════════════════════════════════════════════════════════════
  // MISIÓN 1905 — Fábrica Putilov
  // ══════════════════════════════════════════════════════════════
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
        x: 20, y: 80,
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
        x: 40, y: 65,
        tipo: 'hablar',
        label: 'Obrero Cansado',
        mensaje: 'Compañero, si me vas a hablar de plusvalía, primero consígueme fuego.',
      },
      {
        id: 'puerta_fabrica',
        x: 75, y: 50,
        tipo: 'usar',
        label: 'Puerta Trabada',
        requiere: 'pan_duro',
        mensajeFallo: 'Está trabada por el hielo y la burocracia zarista. Necesitás algo contundente.',
        mensajeExito:
          '¡Usaste el pan duro como palanca! La puerta cedió con un crujido histórico. ¡El pan es la base de la revolución!',
        completaMision: true,
      },
    ],
    siguienteMision: 1912,
  },

  // ══════════════════════════════════════════════════════════════
  // MISIÓN 1912 — Imprenta de la Pravda
  // ══════════════════════════════════════════════════════════════
  1912: {
    id: 1912,
    titulo: 'La Imprenta de la Pravda',
    año: 1912,
    ubicacion: 'Praga',
    fondo: '/escenas/mision_1912.png',
    descripcion:
      'Praga, 1912. Un sótano húmedo. La prensa está rota y Lenin manda mensajes amenazantes desde Cracovia.',
    hotspots: [
      {
        id: 'camarada_impresor',
        x: 20, y: 50,
        tipo: 'hablar',
        label: 'Camarada Impresor',
        mensaje:
          'Si no imprimimos esto hoy, Lenin nos va a mandar a contar árboles a Siberia. Y son muchos árboles.',
      },
      {
        id: 'engranaje',
        x: 50, y: 60,
        tipo: 'usar',
        label: 'Engranaje Trabado',
        requiere: 'grasa',
        mensajeFallo:
          'La prensa no gira. Necesita lubricación. El capital no lubrica, pero la grasa sí.',
        mensajeExito:
          '¡La máquina ruge con el poder del proletariado! Las palabras de Lenin volarán por toda Europa. ¡Que tiemble el capital!',
        completaMision: true,
      },
      {
        id: 'lata_grasa',
        x: 80, y: 30,
        tipo: 'recoger',
        label: 'Lata de Grasa de Cerdo',
        item: {
          id: 'grasa',
          nombre: 'Grasa de Cerdo',
          desc: 'Lubricante burgués al servicio de la causa proletaria.',
          icono: '🫙',
        },
        mensaje: 'Recogiste la lata. El impresor asiente con gravedad revolucionaria.',
      },
    ],
    siguienteMision: 1917,
  },

  // ══════════════════════════════════════════════════════════════
  // MISIÓN 1917 — El Expreso de la Revolución
  // ══════════════════════════════════════════════════════════════
  1917: {
    id: 1917,
    titulo: 'El Expreso de la Revolución',
    año: 1917,
    ubicacion: 'Gottmadingen → Petrogrado',
    escenaInicial: 'exterior',
    subEscenas: {

      // ── EXTERIOR ──────────────────────────────────────────────
      exterior: {
        id: 'exterior',
        fondo: '/escenas/mision_3_afuera.png',
        descripcion:
          'Estación Gottmadingen. El "Zug der Provokation" aguarda en la vía. Lenin tiene urgencias fisiológicas. El oficial alemán tiene aburrimiento crónico. El maquinista, sueño. ¿Por dónde empezás?',
        hotspots: [
          {
            id: 'nav_locomotora',
            x: 26.1, y: 62.7,
            tipo: 'navegar',
            label: 'Locomotora',
            destino: 'locomotora',
          },
          {
            id: 'nav_vagon_aleman',
            x: 59.6, y: 63.7,
            tipo: 'navegar',
            label: 'Vagón Verde (Alemán)',
            destino: 'vagon_aleman',
          },
          {
            id: 'nav_vagon_suizo',
            x: 86.3, y: 69.1,
            tipo: 'navegar',
            label: 'Vagón Marrón (Ruso)',
            destino: 'vagon_suizo',
          },
        ],
      },

      // ── LOCOMOTORA ────────────────────────────────────────────
      locomotora: {
        id: 'locomotora',
        fondo: '/escenas/mision_3_locomotora.png',
        descripcion:
          'La cabina de la locomotora. Vapor, hierro y un maquinista que ha delegado sus responsabilidades al subconsciente. Las agujas del reloj se mueven; él, no.',
        escenaAnterior: 'exterior',
        hotspots: [
          {
            id: 'maquinista',
            x: 75.8, y: 70.9,
            tipo: 'hablar',
            label: 'Maquinista',
            dialogos: [
              {
                requiereFlag: 'maquinista_despierto',
                texto:
                  'Gracias por el Schnapps, compañero. El reloj marca las 04:00 exactas, pero llevamos 10 minutos de retraso. Típico del sistema ferroviario del Kaiser. La puntualidad prusiana es un mito.',
              },
              {
                texto:
                  'Zzzzz... Neun... Zzzzz... Cerveza... Zzzzz. No hay manera de despertarlo con palabras. Necesita motivación líquida de alta graduación.',
              },
            ],
            usarCon: [
              {
                requiere: 'schnapps',
                mensajeExito:
                  '¡AAAACH! ¡DAS BRENNT! ¡Eso quema más que el carbón de la caldera! Gracias, camarada ruso. Si buscas la hora exacta, el reloj de bronce marca las 04:00, pero vamos con 10 minutos de retraso.',
                setFlag: 'maquinista_despierto',
                consumir: true,
              },
            ],
          },
          {
            id: 'reloj_bronce',
            x: 60.5, y: 23.8,
            tipo: 'hablar',
            label: 'Reloj de Bronce KPEV',
            dialogos: [
              {
                requiereFlag: 'maquinista_despierto',
                texto:
                  'Son exactamente las 04:10. Un reloj de precisión prusiana. Irónico que sirva para coordinar una revolución rusa.',
                setFlag: 'hora_conocida',
              },
              {
                texto:
                  'El reloj está ahí, impasible. Pero el vapor cubre las agujas y el maquinista dormido no ayuda. Necesitás que alguien funcione en esta cabina.',
              },
            ],
          },
          {
            id: 'caldera_fuego',
            x: 32.5, y: 69.1,
            tipo: 'hablar',
            label: 'Caldera',
            mensaje:
              'El corazón de hierro del tren. Las brasas arden con la intensidad de un mitin obrero. Un paso en falso y serás ceniza revolucionaria. Mejor dejarlo como está.',
          },
        ],
      },

      // ── VAGÓN ALEMÁN ──────────────────────────────────────────
      vagon_aleman: {
        id: 'vagon_aleman',
        fondo: '/escenas/mision_3_vagon_aleman.png',
        descripcion:
          'El vagón del Oberst Kraneblstrang. Terciopelo verde, madera oscura y un oficial cuyo aburrimiento es técnicamente un arma de guerra. Todo está sobre la mesa.',
        escenaAnterior: 'exterior',
        hotspots: [
          {
            id: 'oficial_aleman',
            x: 58.4, y: 49.1,
            tipo: 'hablar',
            label: 'Oficial Alemán',
            mensaje:
              'Ustedes los rusos se quedan de su lado de la tiza. Mi trabajo es que no toquen suelo alemán, no ser su guía turístico. Y no, no quiero escuchar sobre plusvalía.',
            usarCon: [
              {
                requiere: 'raciones',
                mensajeFallo:
                  'Guárdese eso. Nuestra logística es superior a sus latas oxidadas. Danke, aber nein.',
              },
              {
                requiere: 'manual_justo',
                mensajeFallo:
                  '"Socialismo argentino"... Interessant. El Imperio no acepta panfletos sudamericanos como argumento diplomático.',
              },
              {
                requiere: 'volante',
                mensajeFallo:
                  'Un volante pisoteado del POSDR. Eso es exactamente el tipo de cosa que me ordenaron ignorar. Auf Wiedersehen.',
              },
            ],
          },
          {
            id: 'botella_schnapps',
            x: 70.3, y: 46.3,
            tipo: 'recoger',
            label: 'Botella de Schnapps',
            item: {
              id: 'schnapps',
              nombre: 'Schnapps Alemán',
              desc: 'Líquido transparente con un olor que podría derretir acero o despertar muertos.',
              icono: '🍾',
            },
            mensaje:
              'El oficial mira por la ventana con nostalgia prusiana. Tomaste la botella con la discreción de un bolchevique de alto rango.',
          },
          {
            id: 'raciones_guerra',
            x: 76.4, y: 52.3,
            tipo: 'recoger',
            label: 'Raciones de Guerra',
            item: {
              id: 'raciones',
              nombre: 'Raciones de Guerra',
              desc: 'Dice "Calidad Superior". La etiqueta miente con descaro imperial.',
              icono: '🥫',
            },
            mensaje:
              'Una lata pesada con olor a hierro y resignación. El ejército alemán conserva sus dudas en sal.',
          },
          {
            id: 'sello_alto_mando',
            x: 64.5, y: 55.3,
            tipo: 'recoger',
            label: 'Sello del Alto Mando',
            item: {
              id: 'sello',
              nombre: 'Sello Imperial Alemán',
              desc: 'Bronce macizo. Águila bicéfala. Pesa como la conciencia de un Kaiser. Autoridad absoluta en cualquier papel.',
              icono: '🦅',
            },
            mensaje:
              'El Oberst sigue mirando el paisaje con melancolía burocrática. El sello ahora es parte de la revolución.',
          },
          {
            id: 'tiza_gastada',
            x: 31.0, y: 90.2,
            tipo: 'recoger',
            label: 'Tiza Gastada',
            item: {
              id: 'tiza',
              nombre: 'Tiza Blanca',
              desc: 'Media usada. Todavía sirve para dibujar mapas, fronteras o tratados internacionales improvisados.',
              icono: '🪨',
            },
            mensaje:
              'Un pequeño trozo de tiza. El arma más poderosa para redefinir fronteras en un tren de 1917.',
          },
        ],
      },

      // ── VAGÓN SUIZO (RUSO) ────────────────────────────────────
      vagon_suizo: {
        id: 'vagon_suizo',
        fondo: '/escenas/mision_3_vagon_suizo.png',
        descripcion:
          'El vagón "ruso". Una línea de tiza divide el suelo en dos soberanías. Por la puerta del baño sale un humo que podría cubrir Petrogrado. Lenin está al límite de su paciencia marxista.',
        escenaAnterior: 'exterior',
        hotspots: [
          {
            id: 'lenin',
            x: 67.5, y: 64.5,
            tipo: 'hablar',
            label: 'Lenin',
            dialogos: [
              {
                requiereFlag: 'mision_1917_completa',
                texto:
                  '¡Victoria! Los fumadores han capitulado ante la autoridad del sello imperial. Paradójico, pero eficiente. Ahora, a Petrogrado. La revolución no espera, pero el baño ya está libre.',
              },
              {
                requiereFlag: 'orden_escrita',
                requiereFlagFalso: 'mision_1917_completa',
                texto:
                  'El Decreto Provisional del Turno de Baño está escrito con caligrafía furiosa. Solo falta un sello oficial para que esos burócratas del tabaco obedezcan. ¡Traeme un sello, camarada!',
              },
              {
                requiereFlag: 'hora_conocida',
                requiereFlagFalso: 'orden_escrita',
                texto:
                  '¡Las 04:10! ¡Perfecto! Con ese dato científico redactaré ahora mismo el Decreto Provisional del Turno de Baño. Horario estricto, disciplina proletaria. El derecho al aseo es sagrado.',
                setFlag: 'orden_escrita',
              },
              {
                texto:
                  '¡Inaudito! ¡El derecho al aseo es un derecho fundamental del proletariado! Esos fumadores han convertido el baño en un club privado de nicotina. ¡Necesito la hora exacta para un horario oficial! ¿Hay alguien despierto en esta locomotora?',
              },
            ],
            usarCon: [
              {
                requiere: 'sello',
                requiereFlag: 'orden_escrita',
                mensajeExito:
                  '¡PUM! El sello del Águila Imperial prusiana queda estampado en el decreto de Lenin. Una paradoja histórica bellísima. Los fumadores abren la puerta, tosiendo y derrotados. ¡La higiene proletaria ha triunfado sobre el tabaco burgués! ¡Próxima parada: Petrogrado!',
                setFlag: 'mision_1917_completa',
                completaMision: true,
                consumir: false,
              },
              {
                requiere: 'sello',
                mensajeFallo:
                  'Lenin necesita algo que sellar primero. Primer el decreto, después el trámite burocrático. ¿Averiguaste la hora exacta?',
              },
            ],
          },
          {
            id: 'krupskaya',
            x: 79.9, y: 49.1,
            tipo: 'hablar',
            label: 'Krúpskaya',
            dialogos: [
              {
                requiereFlag: 'orden_escrita',
                texto:
                  'Vladímir terminó el decreto en tiempo récord. En Ginebra tenía un horario de ducha más rígido que el Manifiesto. Ya sé que eso no lo dice la historiografía oficial, pero yo lo viví.',
              },
              {
                texto:
                  'Si esto sigue así, Vladimir va a fundar un partido político dedicado exclusivamente a la reforma sanitaria de los ferrocarriles imperiales. Y ganaría.',
              },
            ],
          },
          {
            id: 'puerta_bano',
            x: 50.1, y: 41.6,
            tipo: 'hablar',
            label: 'Puerta del Baño',
            dialogos: [
              {
                requiereFlag: 'mision_1917_completa',
                texto:
                  'El baño está libre. La revolución huele a tabaco disipado y un leve aroma a jabón de alquitrán. El progreso histórico tiene su olor característico.',
              },
              {
                requiereFlag: 'orden_escrita',
                texto:
                  'Todavía humeando. Pero con el decreto listo y un sello oficial, eso cambia. Los burócratas del tabaco no resisten la autoridad en papel.',
              },
              {
                texto:
                  'Sale tanto humo por debajo que parece que están quemando el Capital ahí dentro. O quizás es tabaco barato. La diferencia ontológica es mínima.',
              },
            ],
          },
          {
            id: 'linea_tiza',
            x: 48.8, y: 92.0,
            tipo: 'usar',
            label: 'Línea de Tiza',
            requiere: 'tiza',
            mensajeFallo:
              'La vieja línea divide el tren en dos mundos. Para redibujarla necesitás... bueno, tiza. La geopolítica es así de simple.',
            mensajeExito:
              'Borrás la línea vieja y dibujás una nueva, diez centímetros más adelante. La soberanía rusa se expande. La puerta del baño es ahora, técnicamente, territorio ruso.',
            setFlag: 'frontera_expandida',
            consumir: true,
          },
        ],
      },
    },

    siguienteMision: null,
  },
};
