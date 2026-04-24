// src/data/historia.ts
import { Item } from '@/context/GameContext';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export type HotspotTipo = 'recoger' | 'hablar' | 'usar' | 'navegar' | 'examinar';

export interface DialogoOpcion {
  texto: string;
  setFlag?: string;
  requiereFlag?: string;
  requiereItem?: string;
  consumeItem?: boolean;
  respuestaNPC?: string;
  siguiente?: number; // índice del siguiente diálogo en el array del NPC
}

export interface DialogoCondicional {
  requiereFlag?: string;
  requiereFlagFalso?: string;
  requiereItem?: string;
  texto: string;
  setFlag?: string;
  respuestaNPC?: string;
  consumeItem?: boolean;
  opciones?: DialogoOpcion[];
}

export interface UsarCon {
  requiere: string;
  requiereFlag?: string;
  mensajeExito?: string;
  mensajeFallo?: string;
  setFlag?: string;
  completaMision?: boolean;
  consumir?: boolean;
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  ancho?: number;
  alto?: number;
  label: string;
  tipo: HotspotTipo;

  item?: Item;
  mensaje?: string;
  dialogos?: DialogoCondicional[];
  mensajeFallo?: string;

  requiere?: string;
  requiereFlag?: string;
  requiereFlagFalso?: string;
  mensajeExito?: string;
  setFlag?: string;
  completaMision?: boolean;
  consumir?: boolean;

  usarCon?: UsarCon[];
  destino?: string;
  destinoSpawnX?: number;

  ocultarSiFlag?: string;
  ocultarSiNoFlag?: string;
  requiereCerca?: boolean;

  // Para puzles especiales
  puzle?: 'piano' | 'faroles' | 'consenso' | 'mausoleo';
}

export interface SubEscena {
  id: string;
  fondo: string;
  descripcion: string;
  anchoMundo?: number;
  hotspots: Hotspot[];
  escenaAnterior?: string;
  musica?: string;
  parallax?: boolean;
}

export interface NPC {
  id: string;
  nombre: string;
  emoji: string;
  x: number;
  y: number;
  color: string;
  dialogos: DialogoCondicional[];
}

export interface Mision {
  id: number;
  titulo: string;
  año: number;
  ubicacion: string;
  fondo?: string;
  descripcion?: string;
  pista?: string;
  anchoMundo?: number;
  hotspots?: Hotspot[];
  subEscenas?: Record<string, SubEscena>;
  escenaInicial?: string;
  npcs?: NPC[];
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
  {
    id: 'pañuelo_rojo',
    nombre: 'Pañuelo de la Internacional',
    desc: 'Rojo como la revolución, suave como la justicia social. Ideal para cubrir faroles.',
    icono: '🟥',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PISTAS
// ─────────────────────────────────────────────────────────────────────────────

export const PISTAS: Record<number, string> = {
  1905: 'Hablá con el capataz. Si no cede, usá el pan como argumento dialéctico. La revolución empieza con el estómago.',
  1912: 'Primero conseguí la hora exacta del reloj de la locomotora. Después hablá con Lenin en el vagón suizo.',
  1917: 'Una buena propaganda necesita un buen megáfono. Buscá uno en la sala del Comité.',
  1917.1: 'Apagá los tres faroles del Palacio usando el pañuelo rojo. Empezá por el más lejano del guardia.',
  1919: 'Trotsky no cede ante palabras. Necesitás tocar La Internacional en el piano del tren: Do, Mi, Sol, Do.',
  1922: 'Convencé a los tres delegados con los items correctos. Después firmá la mesa central.',
  1924: 'Caminá por la Plaza Roja. Reflexioná sobre lo que pasó. El piano espera la última melodía.',
};

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
    anchoMundo: 2000,
    hotspots: [
      {
        id: 'volante',
        x: 380, y: 560,
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
        x: 750, y: 480,
        tipo: 'hablar',
        label: 'Obrero Cansado',
        dialogos: [
          {
            texto: 'Compañera, si me vas a hablar de plusvalía, primero consígueme fuego.',
          },
          {
            requiereFlag: 'puerta_abierta',
            texto: '¡La puerta! ¡La puerta cedió! El pan era más fuerte que el Zar. La historia no lo va a creer.',
          },
        ],
      },
      {
        id: 'puerta_fabrica',
        x: 1450, y: 420,
        tipo: 'usar',
        label: 'Puerta Trabada',
        requiere: 'pan_duro',
        mensajeFallo: 'Está trabada por el hielo y la burocracia zarista. Necesitás algo contundente.',
        mensajeExito:
          '¡Usaste el pan duro como palanca! La puerta cedió con un crujido histórico. ¡El pan es la base de la revolución!',
        setFlag: 'puerta_abierta',
        completaMision: true,
      },
      {
        id: 'caldera_fondo',
        x: 200, y: 350,
        tipo: 'examinar',
        label: 'Caldera Gigante',
        mensaje: 'Una caldera del tamaño de un departamento en Moscú. Hierve con el resentimiento de mil obreros.',
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
    anchoMundo: 2000,
    hotspots: [
      {
        id: 'camarada_impresor',
        x: 350, y: 460,
        tipo: 'hablar',
        label: 'Camarada Impresor',
        dialogos: [
          {
            texto: 'Si no imprimimos esto hoy, Lenin nos va a mandar a contar árboles a Siberia. Y son muchos árboles.',
          },
          {
            requiereFlag: 'prensa_funcionando',
            texto: '¡Las palabras de Lenin vuelan por toda Europa! Aunque la tinta huele a cerdo.',
          },
        ],
      },
      {
        id: 'engranaje',
        x: 980, y: 520,
        tipo: 'usar',
        label: 'Engranaje Trabado',
        requiere: 'grasa',
        mensajeFallo:
          'La prensa no gira. Necesita lubricación. El capital no lubrica, pero la grasa sí.',
        mensajeExito:
          '¡La máquina ruge con el poder del proletariado! Las palabras de Lenin volarán por toda Europa. ¡Que tiemble el capital!',
        setFlag: 'prensa_funcionando',
        completaMision: true,
      },
      {
        id: 'lata_grasa',
        x: 1550, y: 580,
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
      {
        id: 'carta_lenin',
        x: 1200, y: 380,
        tipo: 'examinar',
        label: 'Carta de Lenin',
        mensaje: '"Camaradas: si la prensa no funciona para el viernes, no habrá revolución. Ni vodka. - V.I."',
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
      exterior: {
        id: 'exterior',
        fondo: '/escenas/mision_3_afuera.png',
        descripcion:
          'Estación Gottmadingen. El "Zug der Provokation" aguarda en la vía. Lenin tiene urgencias fisiológicas. El oficial alemán tiene aburrimiento crónico. El maquinista, sueño. ¿Por dónde empezás?',
        hotspots: [
          {
            id: 'nav_locomotora',
            x: 450, y: 560,
            tipo: 'navegar',
            label: 'Locomotora',
            destino: 'locomotora',
            destinoSpawnX: 80,
          },
          {
            id: 'nav_vagon_aleman',
            x: 1050, y: 570,
            tipo: 'navegar',
            label: 'Vagón Verde (Alemán)',
            destino: 'vagon_aleman',
            destinoSpawnX: 80,
          },
          {
            id: 'nav_vagon_suizo',
            x: 1550, y: 620,
            tipo: 'navegar',
            label: 'Vagón Marrón (Ruso)',
            destino: 'vagon_suizo',
            destinoSpawnX: 80,
          },
        ],
      },
      locomotora: {
        id: 'locomotora',
        fondo: '/escenas/mision_3_locomotora.png',
        descripcion:
          'La cabina de la locomotora. Vapor, hierro y un maquinista que ha delegado sus responsabilidades al subconsciente.',
        escenaAnterior: 'exterior',
        hotspots: [
          {
            id: 'maquinista',
            x: 1200, y: 620,
            tipo: 'hablar',
            label: 'Maquinista',
            dialogos: [
              {
                requiereFlag: 'maquinista_despierto',
                texto: 'Gracias por el Schnapps, camarada. El reloj marca las 04:00 exactas, pero llevamos 10 minutos de retraso. Típico del sistema ferroviario del Kaiser.',
              },
              {
                texto: 'Zzzzz... Neun... Zzzzz... Cerveza... Zzzzz. No hay manera de despertarlo con palabras. Necesita motivación líquida de alta graduación.',
              },
            ],
            usarCon: [
              {
                requiere: 'schnapps',
                mensajeExito:
                  '¡AAAACH! ¡DAS BRENNT! ¡Eso quema más que el carbón de la caldera! Gracias, camarada rusa. Si buscás la hora exacta, el reloj de bronce marca las 04:00, pero vamos con 10 minutos de retraso.',
                setFlag: 'maquinista_despierto',
                consumir: true,
              },
            ],
          },
          {
            id: 'reloj_bronce',
            x: 980, y: 220,
            tipo: 'hablar',
            label: 'Reloj de Bronce KPEV',
            dialogos: [
              {
                requiereFlag: 'maquinista_despierto',
                texto: 'Son exactamente las 04:10. Un reloj de precisión prusiana. Irónico que sirva para coordinar una revolución rusa.',
                setFlag: 'hora_conocida',
              },
              {
                texto: 'El reloj está ahí, impasible. Pero el vapor cubre las agujas y el maquinista dormido no ayuda.',
              },
            ],
          },
          {
            id: 'caldera_fuego',
            x: 520, y: 620,
            tipo: 'examinar',
            label: 'Caldera',
            mensaje:
              'El corazón de hierro del tren. Las brasas arden con la intensidad de un mitin obrero.',
          },
        ],
      },
      vagon_aleman: {
        id: 'vagon_aleman',
        fondo: '/escenas/mision_3_vagon_aleman.png',
        descripcion:
          'El vagón del Oberst Kraneblstrang. Terciopelo verde, madera oscura y un oficial cuyo aburrimiento es técnicamente un arma de guerra.',
        escenaAnterior: 'exterior',
        hotspots: [
          {
            id: 'oficial_aleman',
            x: 950, y: 440,
            tipo: 'hablar',
            label: 'Oficial Alemán',
            dialogos: [
              {
                texto: 'Ustedes las rusas se quedan de su lado de la tiza. Mi trabajo es que no toquen suelo alemán, no ser su guía turístico.',
              },
            ],
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
            ],
          },
          {
            id: 'botella_schnapps',
            x: 1150, y: 420,
            tipo: 'recoger',
            label: 'Botella de Schnapps',
            item: {
              id: 'schnapps',
              nombre: 'Schnapps Alemán',
              desc: 'Líquido transparente con un olor que podría derretir acero o despertar muertos.',
              icono: '🍾',
            },
            mensaje:
              'El oficial mira por la ventana con nostalgia prusiana. Tomaste la botella con la discreción de una bolchevique de alto rango.',
          },
          {
            id: 'raciones_guerra',
            x: 1250, y: 480,
            tipo: 'recoger',
            label: 'Raciones de Guerra',
            item: {
              id: 'raciones',
              nombre: 'Raciones de Guerra',
              desc: 'Dice "Calidad Superior". La etiqueta miente con descaro imperial.',
              icono: '🥫',
            },
            mensaje:
              'Una lata pesada con olor a hierro y resignación.',
          },
          {
            id: 'sello_alto_mando',
            x: 1050, y: 510,
            tipo: 'recoger',
            label: 'Sello del Alto Mando',
            item: {
              id: 'sello',
              nombre: 'Sello Imperial Alemán',
              desc: 'Bronce macizo. Águila bicéfala. Pesa como la conciencia de un Kaiser.',
              icono: '🦅',
            },
            mensaje:
              'El Oberst sigue mirando el paisaje con melancolía burocrática. El sello ahora es parte de la revolución.',
          },
          {
            id: 'tiza_gastada',
            x: 500, y: 820,
            tipo: 'recoger',
            label: 'Tiza Gastada',
            item: {
              id: 'tiza',
              nombre: 'Tiza Blanca',
              desc: 'Media usada. Todavía sirve para dibujar mapas, fronteras o tratados internacionales improvisados.',
              icono: '🪨',
            },
            mensaje:
              'Un pequeño trozo de tiza. El arma más poderosa para redefinir fronteras.',
          },
        ],
      },
      vagon_suizo: {
        id: 'vagon_suizo',
        fondo: '/escenas/mision_3_vagon_suizo.png',
        descripcion:
          'El vagón "ruso". Una línea de tiza divide el suelo en dos soberanías. Por la puerta del baño sale un humo que podría cubrir Petrogrado.',
        escenaAnterior: 'exterior',
        hotspots: [
          {
            id: 'lenin',
            x: 1100, y: 580,
            tipo: 'hablar',
            label: 'Lenin',
            dialogos: [
              {
                requiereFlag: 'mision_1917_completa',
                texto:
                  '¡Victoria! Los fumadores han capitulado ante la autoridad del sello imperial. Paradójico, pero eficiente. Ahora, a Petrogrado.',
              },
              {
                requiereFlag: 'orden_escrita',
                requiereFlagFalso: 'mision_1917_completa',
                texto:
                  'El Decreto Provisional del Turno de Baño está escrito. Solo falta un sello oficial para que esos burócratas del tabaco obedezcan. ¡Traeme un sello, camarada!',
              },
              {
                requiereFlag: 'hora_conocida',
                requiereFlagFalso: 'orden_escrita',
                texto:
                  '¡Las 04:10! ¡Perfecto! Con ese dato científico redactaré ahora mismo el Decreto Provisional del Turno de Baño.',
                setFlag: 'orden_escrita',
              },
              {
                texto:
                  '¡Inaudito! ¡El derecho al aseo es un derecho fundamental del proletariado! Esos fumadores han convertido el baño en un club privado de nicotina. ¡Necesito la hora exacta para un horario oficial!',
              },
            ],
            usarCon: [
              {
                requiere: 'sello',
                requiereFlag: 'orden_escrita',
                mensajeExito:
                  '¡PUM! El sello del Águila Imperial prusiana queda estampado en el decreto de Lenin. Una paradoja histórica bellísima. Los fumadores abren la puerta, tosiendo y derrotados. ¡La higiene proletaria ha triunfado!',
                setFlag: 'mision_1917_completa',
                completaMision: true,
                consumir: false,
              },
              {
                requiere: 'sello',
                mensajeFallo:
                  'Lenin necesita algo que sellar primero. ¿Averiguaste la hora exacta?',
              },
            ],
          },
          {
            id: 'krupskaya',
            x: 1320, y: 440,
            tipo: 'hablar',
            label: 'Krúpskaya',
            dialogos: [
              {
                requiereFlag: 'orden_escrita',
                texto:
                  'Vladímir terminó el decreto en tiempo récord. En Ginebra tenía un horario de ducha más rígido que el Manifiesto.',
              },
              {
                texto:
                  'Si esto sigue así, Vladimir va a fundar un partido político dedicado exclusivamente a la reforma sanitaria de los ferrocarriles imperiales. Y ganaría.',
              },
            ],
          },
          {
            id: 'puerta_bano',
            x: 820, y: 380,
            tipo: 'examinar',
            label: 'Puerta del Baño',
            mensaje: 'Sale tanto humo por debajo que parece que están quemando el Capital ahí dentro.',
          },
          {
            id: 'linea_tiza',
            x: 800, y: 860,
            tipo: 'usar',
            label: 'Línea de Tiza',
            requiere: 'tiza',
            mensajeFallo:
              'La vieja línea divide el tren en dos mundos. Para redibujarla necesitás... bueno, tiza.',
            mensajeExito:
              'Borrás la línea vieja y dibujás una nueva, diez centímetros más adelante. La soberanía rusa se expande. La puerta del baño es ahora, técnicamente, territorio ruso.',
            setFlag: 'frontera_expandida',
            consumir: true,
          },
        ],
      },
    },
    siguienteMision: 1917.1,
  },

  // ══════════════════════════════════════════════════════════════
  // MISIÓN 1917.1 — Octubre: Asalto al Palacio de Invierno
  // ══════════════════════════════════════════════════════════════
  1917.1: {
    id: 1917.1,
    titulo: 'Asalto al Palacio de Invierno',
    año: 1917,
    ubicacion: 'Petrogrado',
    fondo: '/escenas/mision_1917_octubre.svg',
    descripcion:
      '25 de octubre. Petrogrado. La ciudad duerme bajo la nieve. Vos, Alexandra Kollontai, tenés que infiltrarte en el Palacio y apagar las luces antes del asalto.',
    anchoMundo: 2400,
    hotspots: [
      {
        id: 'guardia_dormido',
        x: 400, y: 520,
        tipo: 'hablar',
        label: 'Guardia Zarista',
        dialogos: [
          {
            texto: 'Zzz... ¿Quién va?... No, no soy un guardia, soy un mueble... Zzz...',
          },
          {
            requiereItem: 'schnapps',
            texto: '¿Oís eso? Parece una botella que necesita compañía...',
            respuestaNPC: 'El guardia se despierta sobresaltado: "¡Una mujer! ¿Espía?" No, solo una camarada con sed. Tomá, probá esto.',
            setFlag: 'guardia_distraido',
          },
        ],
      },
      {
        id: 'farol_1',
        x: 700, y: 380,
        tipo: 'usar',
        label: 'Farol del Patio',
        requiere: 'pañuelo_rojo',
        mensajeFallo: 'El farol está muy alto. Necesitás algo para alcanzarlo sin llamar la atención.',
        mensajeExito: 'Cubriste el farol con el pañuelo. La luz se tiñe de rojo. Uno menos.',
        setFlag: 'farol_1_apagado',
        consumir: false,
      },
      {
        id: 'farol_2',
        x: 1200, y: 340,
        tipo: 'usar',
        label: 'Farol de la Entrada',
        requiere: 'pañuelo_rojo',
        mensajeFallo: 'Demasiado visible desde la ventana del mayordomo.',
        mensajeExito: 'El segundo farol cae en la oscuridad roja. El Palacio empieza a perder sus referencias.',
        setFlag: 'farol_2_apagado',
        consumir: false,
      },
      {
        id: 'farol_3',
        x: 1800, y: 360,
        tipo: 'usar',
        label: 'Farol del Jardín',
        requiere: 'pañuelo_rojo',
        mensajeFallo: 'Un perro guardian ladra desde lejos. Mejor no arriesgarse sin un plan.',
        mensajeExito: 'Tres faroles apagados. El Palacio de Invierno es ahora técnicamente una cueva muy ornamentada.',
        setFlag: 'farol_3_apagado',
        completaMision: true,
        consumir: false,
      },
      {
        id: 'caja_herramientas',
        x: 1600, y: 620,
        tipo: 'recoger',
        label: 'Caja de Herramientas',
        item: {
          id: 'llave_inglesa',
          nombre: 'Llave Inglesa',
          desc: 'Para apretar tuercas, aflojar certezas o golpear cabezas en caso de emergencia.',
          icono: '🔧',
        },
        mensaje: 'Una llave inglesa. Útil para todo, como un buen panfleto.',
      },
      {
        id: 'mapa_petrogrado',
        x: 2200, y: 480,
        tipo: 'recoger',
        label: 'Mapa de Petrogrado',
        item: {
          id: 'mapa',
          nombre: 'Mapa de Petrogrado',
          desc: 'Muestra todas las patrullas. Dibuja el camino más seguro con líneas rojas temblorosas.',
          icono: '🗺️',
        },
        mensaje: 'El mapa tiene una nota: "Las patrullas cambian a las 02:00. No seáis bolcheviques impuntuales."',
      },
      {
        id: 'nieve_monton',
        x: 100, y: 600,
        tipo: 'examinar',
        label: 'Montón de Nieve',
        mensaje: 'Bajo la nieve hay una botella vacía de vodka. Alguien pasó frío y filosofía aquí.',
      },
    ],
    siguienteMision: 1919,
  },

  // ══════════════════════════════════════════════════════════════
  // MISIÓN 1919 — El Tren Blindado de Trotsky
  // ══════════════════════════════════════════════════════════════
  1919: {
    id: 1919,
    titulo: 'El Tren Blindado de Trotsky',
    año: 1919,
    ubicacion: 'Frente Oriental',
    fondo: '/escenas/mision_1919_tren.svg',
    descripcion:
      '1919. El Frente Oriental. Trotsky viaja en su tren blindado personal. Vos tenés que convencerlo de que el arte es tan importante como la guerra.',
    anchoMundo: 2600,
    hotspots: [
      {
        id: 'trotsky',
        x: 1800, y: 480,
        tipo: 'hablar',
        label: 'Trotsky',
        dialogos: [
          {
            texto: 'Camarada, no tengo tiempo para poesía. Tengo un ejército que organizar y un bigote que peinar.',
          },
          {
            requiereFlag: 'piano_tocado',
            texto: '¡La Internacional! En un piano de burgueses... qué ironía más deliciosa. Tomá, estos documentos prueban que el arte es arma de clase. Lleváselos a Moscú.',
            setFlag: 'trotsky_convencido',
          },
          {
            requiereFlag: 'partitura_encontrada',
            requiereFlagFalso: 'piano_tocado',
            texto: '¿Una partitura? Trotsky no lee música. Trotsky lee mapas de batalla. Pero si sabés tocar... el piano está en el vagón de lujo.',
          },
        ],
      },
      {
        id: 'piano_colga',
        x: 600, y: 520,
        tipo: 'usar',
        label: 'Piano de Cola',
        puzle: 'piano',
        requiere: 'partitura_rota',
        mensajeFallo: 'Un piano magnífico, cerrado con un mecanismo musical. Dice: "Solo suena para quien conoce la canción del pueblo."',
        mensajeExito: '', // manejado por el componente de puzle
      },
      {
        id: 'partitura_suelo',
        x: 400, y: 650,
        tipo: 'recoger',
        label: 'Papel Rasgado',
        item: {
          id: 'partitura_rota',
          nombre: 'Partitura Rota',
          desc: '"La Internacional". Solo se ven las primeras notas: Do - Mi - Sol - Do. El resto está quemado por una cerilla revolucionaria.',
          icono: '🎼',
        },
        mensaje: 'Un trozo de partitura. Las notas están manchadas de carbón. "La Internacional"... incompleta.',
      },
      {
        id: 'carbon_cajon',
        x: 1400, y: 600,
        tipo: 'recoger',
        label: 'Cajón de Carbón',
        item: {
          id: 'carbon',
          nombre: 'Trozo de Carbón',
          desc: 'Combustible proletario. También sirve para escribir mensajes urgentes en paredes.',
          icono: '⬛',
        },
        mensaje: 'Carbón del bueno. El que hace andar locomotoras y corazones.',
      },
      {
        id: 'botella_vacia',
        x: 2200, y: 580,
        tipo: 'recoger',
        label: 'Botella Vacía',
        item: {
          id: 'botella_vacia',
          nombre: 'Botella Vacía',
          desc: 'Huele a vodka barato y decisiones apresuradas.',
          icono: '🍶',
        },
        mensaje: 'Una botella. Podés usarla como mensaje, arma o instrumento musical de viento.',
      },
      {
        id: 'mecanico',
        x: 1000, y: 550,
        tipo: 'hablar',
        label: 'Mecánico Borracho',
        dialogos: [
          {
            texto: 'El piano... *hip* ...está desafinado desde 1917. Pero si tocás las primeras notas de... *hip* ...la canción... se abre solito.',
          },
          {
            requiereFlag: 'partitura_encontrada',
            texto: '¡Ah, tenés la partitura! Do-Mi-Sol-Do. Es fácil. O al menos lo era antes de la revolución.',
          },
        ],
      },
      {
        id: 'documentos_compartimento',
        x: 700, y: 450,
        tipo: 'recoger',
        label: 'Documentos del Alto Mando',
        ocultarSiNoFlag: 'piano_tocado',
        item: {
          id: 'documentos',
          nombre: 'Documentos Secretos',
          desc: 'Planes de batalla. Y una lista de compras: leche, pan, derrocar al capitalismo.',
          icono: '📁',
        },
        mensaje: 'Los documentos del Estado Mayor. Ahora son documentos del Estado del Pueblo.',
      },
      {
        id: 'fotografia',
        x: 2000, y: 500,
        tipo: 'recoger',
        label: 'Fotografía Enmarcada',
        item: {
          id: 'foto',
          nombre: 'Fotografía de Familia',
          desc: 'Trotsky, su mujer y sus hijos. Incluso los revolucionarios tienen gente que los espera.',
          icono: '🖼️',
        },
        mensaje: 'Una foto familiar. Trotsky sonríe. Eso no lo muestra la historiografía.',
      },
    ],
    siguienteMision: 1922,
  },

  // ══════════════════════════════════════════════════════════════
  // MISIÓN 1922 — Fundación de la URSS
  // ══════════════════════════════════════════════════════════════
  1922: {
    id: 1922,
    titulo: 'Fundación de la URSS',
    año: 1922,
    ubicacion: 'Moscú',
    fondo: '/escenas/mision_1922_moscu.svg',
    descripcion:
      'Diciembre de 1922. El Gran Teatro de Moscú. Tres delegados, tres problemas, una sola Unión. Vos tenés que convencer a todos.',
    anchoMundo: 2200,
    hotspots: [
      {
        id: 'delegado_ucrania',
        x: 400, y: 480,
        tipo: 'hablar',
        label: 'Delegado de Ucrania',
        dialogos: [
          {
            texto: 'Ucrania aporta el trigo. Si no hay trigo, no hay pan. Si no hay pan, no hay revolución. ¿Dónde están nuestras garantías?',
          },
          {
            requiereItem: 'foto',
            texto: 'Una familia... sí, todos tenemos familias. Pero la familia más grande es la Unión. Estoy convencido.',
            setFlag: 'ucrania_convencida',
            consumeItem: false,
          },
          {
            requiereFlag: 'ucrania_convencida',
            texto: 'Ucrania firma. Pero que conste: queremos nuestro propio himno.',
          },
        ],
      },
      {
        id: 'delegado_bielorrusia',
        x: 1100, y: 460,
        tipo: 'hablar',
        label: 'Delegado de Bielorrusia',
        dialogos: [
          {
            texto: 'Nosotros aportamos la industria. Pero nuestras fábricas están rotas. ¿Quién las repara?',
          },
          {
            requiereItem: 'llave_inglesa',
            texto: '¡Una llave inglesa! El símbolo más internacional del proletariado. Si ella puede arreglar tuercas, nosotros podemos arreglar naciones.',
            setFlag: 'bielorrusia_convencida',
            consumeItem: false,
          },
          {
            requiereFlag: 'bielorrusia_convencida',
            texto: 'Bielorrusia firma. Y traeré mi propia llave para la ceremonia.',
          },
        ],
      },
      {
        id: 'delegado_caucaso',
        x: 1800, y: 500,
        tipo: 'hablar',
        label: 'Delegado del Cáucaso',
        dialogos: [
          {
            texto: 'El Cáucaso aporta el vino y el petróleo. Pero también aportamos recuerdos dolorosos. ¿Cómo olvidamos el pasado?',
          },
          {
            requiereItem: 'documentos',
            texto: 'Documentos del frente... veo que luchamos juntos. Eso es más fuerte que cualquier herida.',
            setFlag: 'caucaso_convencido',
            consumeItem: false,
          },
          {
            requiereFlag: 'caucaso_convencido',
            texto: 'El Cáucaso firma. Y brindaremos con vino georgiano.',
          },
        ],
      },
      {
        id: 'mesa_firma',
        x: 1100, y: 650,
        tipo: 'usar',
        label: 'Mesa de Firma',
        requiereFlag: 'ucrania_convencida',
        requiereFlagFalso: 'urss_firmada',
        mensajeFallo: 'Primero tenés que convencer a los tres delegados. La unión no se firma en soledad.',
        mensajeExito: 'Los tres delegados firman. La Unión de Repúblicas Socialistas Soviéticas nace oficialmente. El 30 de diciembre de 1922, Alexandra Kollontai fue testigo.',
        setFlag: 'urss_firmada',
        completaMision: true,
      },
      {
        id: 'tinta_botella',
        x: 1400, y: 680,
        tipo: 'recoger',
        label: 'Tintero',
        item: {
          id: 'tinta',
          nombre: 'Tinta de la Revolución',
          desc: 'Roja, obviamente. Pero también permanente. Como los cambios que estamos haciendo.',
          icono: '🖋️',
        },
        mensaje: 'Tinta roja. Para escribir la historia, no para borrarla.',
      },
    ],
    siguienteMision: 1924,
  },

  // ══════════════════════════════════════════════════════════════
  // MISIÓN 1924 — Epílogo: El Legado
  // ══════════════════════════════════════════════════════════════
  1924: {
    id: 1924,
    titulo: 'El Legado',
    año: 1924,
    ubicacion: 'Moscú',
    fondo: '/escenas/mision_1924_mausoleo.svg',
    descripcion:
      'Enero de 1924. Lenin ha muerto. El Mausoleo está en construcción. Vos caminás entre los obreros, pensando en todo lo que pasó.',
    anchoMundo: 2000,
    hotspots: [
      {
        id: 'monumento_lenin',
        x: 1000, y: 400,
        tipo: 'examinar',
        label: 'Monumento a Lenin',
        mensaje: '"Lenin vivió. Lenin vive. Lenin vivirá." El mármol no dice nada sobre los baños del tren de 1917.',
      },
      {
        id: 'obreros_mausoleo',
        x: 600, y: 550,
        tipo: 'hablar',
        label: 'Obreros del Mausoleo',
        dialogos: [
          {
            texto: 'Camarada, ¿usted estuvo en el Expreso? ¡La historia viva! Contemos a nuestros hijos que conocimos a la mujer que usó un pan como palanca.',
          },
        ],
      },
      {
        id: 'nieve_fresca',
        x: 1500, y: 600,
        tipo: 'examinar',
        label: 'Nieve Fresca',
        mensaje: 'La nieve cubre todo. Las huellas de hoy serán historia mañana. Y las de ayer, leyenda.',
      },
      {
        id: 'flores_marmol',
        x: 1050, y: 520,
        tipo: 'examinar',
        label: 'Flores sobre el Mármol',
        mensaje: 'Claveles rojos. Alguien dejó una nota: "Gracias por el baño. - V.I." No, esperá. Eso no puede ser real.',
      },
      {
        id: 'bandera_urss',
        x: 200, y: 300,
        tipo: 'examinar',
        label: 'Bandera de la URSS',
        mensaje: 'La hoz y el martillo. Herramientas de trabajo. La revolución no fue un evento, fue un oficio.',
      },
      {
        id: 'piano_viejo',
        x: 1700, y: 500,
        tipo: 'usar',
        label: 'Piano Abandonado',
        puzle: 'piano',
        requiere: 'partitura_rota',
        mensajeFallo: 'Un piano viejo, desafinado. Pero todavía recuerda las notas. Si supieras cuáles...',
        mensajeExito: 'Tocás La Internacional una vez más. Las notas se desvanecen en el frío de Moscú. Pero alguien, en algún lugar, las sigue cantando.',
        setFlag: 'fin_historia',
        completaMision: true,
        consumir: false,
      },
    ],
    siguienteMision: null,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getEscenaActual(mision: Mision, subEscenaId: string | null): SubEscena | null {
  if (mision.subEscenas && subEscenaId) {
    return mision.subEscenas[subEscenaId] ?? null;
  }
  return null;
}

export function getHotspotsActivos(
  mision: Mision,
  subEscenaId: string | null,
  flags: Record<string, boolean>
): Hotspot[] {
  const escena = getEscenaActual(mision, subEscenaId);
  const hotspots = escena?.hotspots ?? mision.hotspots ?? [];
  return hotspots.filter((hs) => {
    if (hs.ocultarSiFlag && flags[hs.ocultarSiFlag]) return false;
    if (hs.ocultarSiNoFlag && !flags[hs.ocultarSiNoFlag]) return false;
    return true;
  });
}
