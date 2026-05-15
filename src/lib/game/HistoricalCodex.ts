// HistoricalCodex — Entradas históricas desbloqueables
// Cada entrada se desbloquea explorando ciertos hotspots o completando acciones

export interface CodexEntry {
  id: string;
  titulo: string;
  año: number;
  categoria: 'personaje' | 'evento' | 'lugar' | 'concepto' | 'documento';
  resumen: string;
  texto: string;
  imagen?: string;
  desbloqueadoPor: string; // flag que lo desbloquea
  // Frases memorables de personajes históricos
  cita?: { texto: string; autor: string };
}

export const CODEX_ENTRIES: Record<string, CodexEntry> = {
  lenin_exilio: {
    id: 'lenin_exilio',
    titulo: 'Lenin en el Exilio (1900-1917)',
    año: 1917,
    categoria: 'personaje',
    resumen: 'Vladimir Ilich Uliánov pasó 17 años en el exilio antes de regresar a Rusia en el tren sellado.',
    texto: 'Lenin vivió en Suiza, Francia, Polonia y Austria-Hungría durante 17 años. Escribió cientos de artículos y libros. Dirigió el partido desde la distancia. Cuando Alemania le ofreció el tren sellado para regresar a Rusia en 1917, sabía que era una apuesta: los alemanes esperaban que desestabilizara al gobierno ruso. Tenían razón.',
    desbloqueadoPor: 'hora_conocida',
    cita: { texto: 'No podemos esperar. Si no tomamos el poder ahora, la historia no nos perdonará.', autor: 'V. I. Lenin, Octubre 1917' },
  },
  kollontai: {
    id: 'kollontai',
    titulo: 'Alexandra Kollontai (1872-1952)',
    año: 1905,
    categoria: 'personaje',
    resumen: 'Revolucionaria, feminista, escritora y primera mujer embajadora de la historia moderna.',
    texto: 'Alexandra Kollontai fue mucho más que una revolucionaria. Fue la primera mujer en ocupar un cargo ministerial (Comisaria del Pueblo para la Beneficencia Pública) y la primera mujer embajadora de la historia (Noruega, 1923). Escribió sobre el amor libre, los derechos de las mujeres y la nueva moral comunista. Era hija de un general ucraniano y una finlandesa. Podría haber tenido una vida aristocrática; eligió la revolución.',
    desbloqueadoPor: 'puerta_abierta',
    cita: { texto: 'La emancipación de la mujer es imposible bajo el capitalismo. Solo el socialismo puede liberarla.', autor: 'Alexandra Kollontai, 1918' },
  },
  bloody_sunday: {
    id: 'bloody_sunday',
    titulo: 'Domingo Sangriento (9 de enero de 1905)',
    año: 1905,
    categoria: 'evento',
    resumen: 'La masacre de una marcha pacífica de obreros frente al Palacio de Invierno.',
    texto: 'El 9 de enero de 1905 (22 de enero gregoriano), una multitud de obreros liderados por el Padre Gapón marchó hacia el Palacio de Invierno para entregar un petitorio al Zar. Cantaban "Dios salve al Zar". Llevaban íconos religiosos. Las tropas abrieron fuego. Entre 1000 y 4000 personas murieron. El "Zar padre" se había convertido en el "Zar sangriento". Este día inició la Revolución de 1905.',
    desbloqueadoPor: 'bs_marcho',
    cita: { texto: '¡Ya no tenemos Zar! ¡La sangre de nuestros hermanos está entre él y el pueblo!', autor: 'Obrero anónimo, 9 de enero de 1905' },
  },
  tren_sellado: {
    id: 'tren_sellado',
    titulo: 'El Tren Sellado (Abril 1917)',
    año: 1917,
    categoria: 'evento',
    resumen: 'El viaje de Lenin desde Suiza a Petrogrado en un tren que Alemania permitió pasar.',
    texto: 'En abril de 1917, Alemania permitió a Lenin y otros 31 exiliados viajar en un tren sellado a través de Alemania hacia Suecia y luego a Rusia. El gobierno alemán financió el viaje esperando que Lenin desestabilizara a su enemigo en guerra. El tren tenía una línea de tiza entre los vagones alemán y ruso. Lenin pasó el viaje discutiendo, escribiendo y... discutiendo el uso del baño con los fumadores.',
    desbloqueadoPor: 'mision_1917_completa',
    cita: { texto: 'Nos mandan en un vagón sellado, como un bacilo de la peste. Pero la peste del capitalismo ya está aquí.', autor: 'Lenin, antes de abordar el tren, 1917' },
  },
  winter_palace: {
    id: 'winter_palace',
    titulo: 'Asalto al Palacio de Invierno (25 de Octubre de 1917)',
    año: 1917,
    categoria: 'evento',
    resumen: 'La toma del Palacio de Invierno que selló la Revolución de Octubre.',
    texto: 'En la noche del 25 de octubre de 1917 (7 de noviembre), el crucero Aurora disparó un salva (blanco) como señal para el asalto al Palacio de Invierno, donde se refugiaban los ministros del Gobierno Provisional. La resistencia fue mínima. La película "Octubre" de Eisenstein (1928) dramatizó el evento con miles de extras. En realidad, el asalto fue confuso, con pocas bajas, y los ministros fueron arrestados casi sin lucha.',
    desbloqueadoPor: 'farol_3_apagado',
    cita: { texto: '¡El poder en Rusia está en el suelo! ¡Levántenlo!', autor: 'Lenin, desde Smolny, durante el asalto' },
  },
  aurora: {
    id: 'aurora',
    titulo: 'El Crucero Aurora',
    año: 1917,
    categoria: 'lugar',
    resumen: 'El crucero que disparó el cañonazo que inició la Revolución de Octubre.',
    texto: 'El Aurora fue construido en 1900. Participó en la Guerra Ruso-Japonesa y en la Primera Guerra Mundial. El 25 de octubre de 1917, disparó un proyectil de fogueo desde el río Neva. Ese disparo fue la señal para que los revolucionarios asaltaran el Palacio de Invierno. Hoy el Aurora es un museo flotante en San Petersburgo. Su cañón de proa sigue apuntando al Palacio de Invierno.',
    desbloqueadoPor: 'bs_peleo',
    cita: { texto: 'El Aurora no disparó contra el Palacio. Disparó contra la historia.', autor: 'Historiador soviético, años 60' },
  },
  trotsky_train: {
    id: 'trotsky_train',
    titulo: 'El Tren Blindado de Trotsky (1918-1921)',
    año: 1919,
    categoria: 'lugar',
    resumen: 'La ciudad fortaleza móvil desde donde Trotsky comandó la Guerra Civil.',
    texto: 'El tren blindado de Trotsky era un complejo militar móvil: sala de mapas, telégrafo, imprenta, garaje para autos blindados, depósito de municiones, cocina, sala de cine, y una banda de música. Viajó 65,000 km durante la guerra civil, apareciendo en los frentes más críticos. Trotsky vivía, trabajaba y dormía en el tren. Su presencia personal en los frentes levantaba la moral de las tropas.',
    desbloqueadoPor: 'trotsky_convencido',
    cita: { texto: 'Podéis estar seguros: allí donde yo estoy, la victoria no tarda en llegar.', autor: 'León Trotsky, 1919' },
  },
  brest_litovsk: {
    id: 'brest_litovsk',
    titulo: 'Tratado de Brest-Litovsk (Marzo 1918)',
    año: 1918,
    categoria: 'evento',
    resumen: 'La paz humillante con Alemania que salvó la revolución a costa de territorio.',
    texto: 'El 3 de marzo de 1918, Lenin firmó el Tratado de Brest-Litovsk con las Potencias Centrales. Rusia perdió 1.3 millones de km², un tercio de su población, la mitad de su industria y el 90% de sus minas de carbón. Bujarin llamó a "una guerra revolucionaria". Trotsky propuso "ni paz ni guerra". Lenin, pragmático, dijo: "Hay que firmar para respirar". Tuvo razón. La revolución sobrevivió.',
    desbloqueadoPor: 'bl_firmado',
    cita: { texto: 'Una paz vergonzosa es mejor que una guerra honrosa si la paz permite al partido tomar aliento.', autor: 'Lenin, defendiendo Brest-Litovsk' },
  },
  kronstadt: {
    id: 'kronstadt',
    titulo: 'Rebelión de Kronstadt (Marzo 1921)',
    año: 1921,
    categoria: 'evento',
    resumen: 'La rebelión de los marineros que fueron héroes de la revolución contra el autoritarismo bolchevique.',
    texto: 'En marzo de 1921, los marineros de la base naval de Kronstadt se rebelaron contra el gobierno bolchevique. Exigían: libertad de prensa, libertad de reunión, elecciones libres a los soviets, y el fin de la dictadura del partido. Fueron los mismos marineros que habían sido la vanguardia de la Revolución de Octubre. Trotsky ordenó aplastar la rebelión. El Ejército Rojo atacó sobre el hielo del Golfo de Finlandia. Miles murieron. Fue el principio del fin del sueño revolucionario.',
    desbloqueadoPor: 'kr_apoyado',
    cita: { texto: '¡Soviets sin comunistas!', autor: 'Consigna de los rebeldes de Kronstadt, 1921' },
  },
  stalin_rise: {
    id: 'stalin_rise',
    titulo: 'El Ascenso de Stalin (1922-1929)',
    año: 1922,
    categoria: 'personaje',
    resumen: 'Cómo un burócrata casi desconocido se convirtió en el dictador más poderoso del siglo XX.',
    texto: 'Stalin fue nombrado Secretario General en 1922. Nadie le dio importancia. Era un cargo administrativo, encargado de los nombramientos del partido. Pero Stalin entendió que quien controla los nombramientos controla el partido. Colocó a sus leales en todos los puestos. Cuando Lenin murió en 1924, Stalin ya era imparable. Trotsky, el gran rival, fue exiliado en 1929 y asesinado en México en 1940. La revolución había devorado a sus hijos.',
    desbloqueadoPor: 'sr_stalin',
    cita: { texto: 'Yo sé que después de mi muerte pondrán un montón de basura sobre mi tumba. Pero el viento de la historia la barrerá sin piedad.', autor: 'León Trotsky, 1939' },
  },
  nep: {
    id: 'nep',
    titulo: 'NEP — Nueva Política Económica (1921-1928)',
    año: 1921,
    categoria: 'concepto',
    resumen: 'El retroceso capitalista temporal que salvó a la URSS de la hambruna.',
    texto: 'Después de la guerra civil y la rebelión de Kronstadt, Lenin entendió que el "comunismo de guerra" (requisas forzosas, nacionalización total) era insostenible. La NEP permitió: comercio privado limitado, agricultores podían vender sus excedentes, pequeñas empresas privadas. Era un "retroceso capitalista" necesario. La NEP fue impopular entre los revolucionarios radicales, pero evitó el colapso económico. Stalin la abolió en 1928 con su Primer Plan Quinquenal.',
    desbloqueadoPor: 'kr_neutral',
    cita: { texto: 'Un paso atrás para dar dos pasos adelante.', autor: 'Lenin, justificando la NEP, 1921' },
  },
};

export function getCodexByFlag(flag: string): CodexEntry | null {
  return Object.values(CODEX_ENTRIES).find((e) => e.desbloqueadoPor === flag) ?? null;
}

export function getDesbloqueados(flags: Record<string, boolean>): CodexEntry[] {
  return Object.values(CODEX_ENTRIES).filter(
    (e) => flags[e.desbloqueadoPor]
  );
}

export const CODEX_POR_CATEGORIA: Record<string, CodexEntry[]> = {
  personaje: Object.values(CODEX_ENTRIES).filter((e) => e.categoria === 'personaje'),
  evento: Object.values(CODEX_ENTRIES).filter((e) => e.categoria === 'evento'),
  lugar: Object.values(CODEX_ENTRIES).filter((e) => e.categoria === 'lugar'),
  concepto: Object.values(CODEX_ENTRIES).filter((e) => e.categoria === 'concepto'),
  documento: Object.values(CODEX_ENTRIES).filter((e) => e.categoria === 'documento'),
};
