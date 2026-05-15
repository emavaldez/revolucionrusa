// ItemCombination — Sistema de combinación de items
// Define qué items se pueden combinar y qué producen

export interface CombinacionRecipe {
  id: string;
  itemA: string;
  itemB: string;
  resultado: {
    id: string;
    nombre: string;
    desc: string;
    icono: string;
  };
  mensaje: string;
  consumirA: boolean;
  consumirB: boolean;
  setFlag?: string;
}

export const COMBINACIONES: CombinacionRecipe[] = [
  {
    id: 'papel_carbon',
    itemA: 'volante',
    itemB: 'carbon',
    resultado: {
      id: 'volante_nuevo',
      nombre: 'Volante Revolucionario Impreso',
      desc: 'Texto claro sobre fondo blanco. Listo para distribuir.',
      icono: '📰',
    },
    mensaje: 'Usás el carbón para rescribir el volante. Ahora se entiende: "¡Abajo el Zar! ¡Pan y Tierra!"',
    consumirA: true,
    consumirB: false,
    setFlag: 'volante_mejorado',
  },
  {
    id: 'pan_vodka',
    itemA: 'pan_duro',
    itemB: 'schnapps',
    resultado: {
      id: 'pan_remojado',
      nombre: 'Pan Remojado en Schnapps',
      desc: 'Comestible y alcohólico. Dos necesidades en una.',
      icono: '🍞',
    },
    mensaje: 'El pan absorbe el schnapps. Ahora huele a revolución y a taberna bávara.',
    consumirA: true,
    consumirB: true,
  },
  {
    id: 'pañuelo_tiza',
    itemA: 'pañuelo_rojo',
    itemB: 'tiza',
    resultado: {
      id: 'bandera_impro',
      nombre: 'Bandera Revolucionaria',
      desc: 'Un pañuelo rojo con una hoz y martillo dibujadas con tiza. No es permanente, pero impone.',
      icono: '🚩',
    },
    mensaje: 'Dibujás la hoz y el martillo en el pañuelo con la tiza. Ahora tenés una bandera revolucionaria.',
    consumirA: true,
    consumirB: true,
    setFlag: 'bandera_hecha',
  },
  {
    id: 'botella_grasa',
    itemA: 'botella_vacia',
    itemB: 'grasa',
    resultado: {
      id: 'molotov',
      nombre: 'Cóctel Molotov Improvisado',
      desc: 'Una botella con grasa de cerdo y un trapo. No es refinado, pero el fuego no es refinado.',
      icono: '🔥',
    },
    mensaje: 'Llenás la botella con grasa y le ponés un trapo. Un molotov improvisado. La guerra civil no espera.',
    consumirA: true,
    consumirB: true,
    setFlag: 'molotov_listo',
  },
  {
    id: 'schnapps_agua',
    itemA: 'schnapps',
    itemB: 'manual_justo',
    resultado: {
      id: 'vodka_teoria',
      nombre: 'Vodka Teórico',
      desc: 'Schnapps adulterado con agua, servido sobre páginas de teoría marxista. Para pensar borracho.',
      icono: '🍸',
    },
    mensaje: 'Vertés el schnapps sobre el manual. Las páginas absorben el alcohol. Un compañero borracho y culto.',
    consumirA: true,
    consumirB: true,
  },
  {
    id: 'tinta_papel',
    itemA: 'tinta',
    itemB: 'volante',
    resultado: {
      id: 'volante_oficial',
      nombre: 'Proclama Oficial del Soviet',
      desc: 'Impreso con tinta roja. El comité lo aprueba. La historia lo recordará.',
      icono: '📜',
    },
    mensaje: 'Usás la tinta roja para imprimir la proclama del Soviet. Ahora es oficial. Tiene peso histórico.',
    consumirA: true,
    consumirB: true,
    setFlag: 'proclama_oficial',
  },
  {
    id: 'carbon_pared',
    itemA: 'carbon',
    itemB: 'mapa',
    resultado: {
      id: 'mapa_marcado',
      nombre: 'Mapa de Estrategia',
      desc: 'El mapa de Petrogrado con anotaciones de carbón. Las rutas de los guardias están marcadas.',
      icono: '🗺️',
    },
    mensaje: 'Con el carbón marcás las rutas de las patrullas en el mapa. Ahora tenés un plan de escape.',
    consumirA: false,
    consumirB: true,
    setFlag: 'mapa_estrategico',
  },
  {
    id: 'llave_racion',
    itemA: 'llave_inglesa',
    itemB: 'raciones',
    resultado: {
      id: 'racion_abierta',
      nombre: 'Ración Abierta',
      desc: 'Finalmente abriste la lata. Adentro hay carne en gelatina y un sabor a desesperación.',
      icono: '🥫',
    },
    mensaje: 'Con la llave inglesa forzás la lata. Adentro: carne en gelatina, papas y un botón de uniforme.',
    consumirA: false,
    consumirB: true,
    setFlag: 'racion_abierta',
  },
];

// Buscar combinaciones posibles con un item dado
export function getCombinacionesCon(itemId: string): CombinacionRecipe[] {
  return COMBINACIONES.filter(
    (c) => c.itemA === itemId || c.itemB === itemId
  );
}

// Verificar si dos items se pueden combinar
export function checkCombinacion(
  itemAId: string,
  itemBId: string
): CombinacionRecipe | null {
  return (
    COMBINACIONES.find(
      (c) =>
        (c.itemA === itemAId && c.itemB === itemBId) ||
        (c.itemA === itemBId && c.itemB === itemAId)
    ) ?? null
  );
}

// Items que existen en el juego (para referencia)
export const TODOS_ITEMS = [
  'pan_duro', 'manual_justo', 'pañuelo_rojo',
  'volante', 'grasa', 'schnapps', 'raciones', 'sello',
  'tiza', 'llave_inglesa', 'mapa', 'partitura_rota',
  'carbon', 'botella_vacia', 'documentos', 'foto',
  'tinta', 'molotov', 'bandera_impro', 'volante_nuevo',
  'volante_oficial', 'vodka_teoria', 'pan_remojado',
  'mapa_marcado', 'racion_abierta', 'proclama_oficial',
];
