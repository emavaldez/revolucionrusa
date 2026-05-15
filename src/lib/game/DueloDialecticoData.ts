// DueloDialecticoData — Preguntas de trivia histórica por misión
// Cada misión tiene al menos un duelo con preguntas de opción múltiple

export interface PreguntaDuelo {
  id: string;
  pregunta: string;
  contexto?: string; // ambientación histórica
  respuestas: RespuestaDuelo[];
  explicacion: string; // se muestra después de responder
}

export interface RespuestaDuelo {
  texto: string;
  correcta: boolean;
  feedback: string; // por qué es correcta o incorrecta
}

export interface RondaDuelo {
  id: string;
  nombre: string; // nombre del oponente
  emoji: string;
  preguntas: PreguntaDuelo[];
}

// Datos históricamente accurate
export const DUELOS_POR_MISION: Record<number, RondaDuelo[]> = {
  1905: [
    {
      id: 'gapón',
      nombre: 'Padre Gapón',
      emoji: '⛪',
      preguntas: [
        {
          id: 'gapón_1',
          pregunta: '¿Quién lideraba la Unión de los Obreros de Fábricas de San Petersburgo que organizó la marcha del Domingo Sangriento?',
          contexto: 'Mientras caminás hacia el Palacio de Invierno, el líder de la marcha te pregunta si conocés la historia del movimiento obrero ruso.',
          respuestas: [
            { texto: 'Georgi Gapón, un sacerdote ortodoxo', correcta: true, feedback: '¡Correcto! Gapón era un sacerdote que creía en un "Zar bueno" que escucharía al pueblo.' },
            { texto: 'Vladimir Lenin, líder bolchevique exiliado', correcta: false, feedback: 'No. Lenin estaba en Suiza. Gapón era un sacerdote, no un marxista.' },
            { texto: 'León Trotsky, presidente del Soviet', correcta: false, feedback: 'No. Trotsky no llegó a San Petersburgo hasta después de la masacre.' },
          ],
          explicacion: 'El Padre Georgi Gapón organizó la marcha pacífica. Creía que el Zar recibiría a los obreros. Nicolás II ordenó disparar. Murieron más de 1000 personas.',
        },
        {
          id: 'gapón_2',
          pregunta: '¿Cuántos obreros murieron aproximadamente en el Domingo Sangriento?',
          contexto: 'Los disparos cesan. Cuerpos en la nieve. Un obrero preguntó cuántos cayeron.',
          respuestas: [
            { texto: 'Más de 1000', correcta: true, feedback: 'Correcto. Las estimaciones varían entre 1000 y 4000 muertos. El Zar perdió su imagen de "padre del pueblo".' },
            { texto: 'Menos de 100', correcta: false, feedback: 'No. Fue mucho peor. Las crónicas hablan de ríos de sangre en la Plaza del Palacio.' },
            { texto: 'Ninguno, solo hubo heridos', correcta: false, feedback: 'Falso. Hubo cientos de muertos. La masacre fue real y brutal.' },
          ],
          explicacion: 'El Domingo Sangriento (9 de enero de 1905) dejó entre 1000 y 4000 muertos según distintas fuentes. Este día marcó el inicio de la Revolución de 1905.',
        },
      ],
    },
    {
      id: 'capataz',
      nombre: 'Capataz de Putilov',
      emoji: '👨‍🏭',
      preguntas: [
        {
          id: 'capataz_1',
          pregunta: '¿Por qué la Fábrica Putilov era tan importante para la Revolución Rusa?',
          contexto: 'El capataz, con desprecio, te pregunta "¿Y esta fábrica qué tiene de especial?"',
          respuestas: [
            { texto: 'Era la fábrica metalúrgica más grande del Imperio Ruso, con más de 12.000 obreros', correcta: true, feedback: 'Correcto. Putilov empleaba a 12.000 obreros y fabricaba locomotoras, cañones y barcos.' },
            { texto: 'Era la única fábrica textil de San Petersburgo', correcta: false, feedback: 'No. Putilov era metalúrgica. Producía material ferroviario y armamento.' },
            { texto: 'El Zar tenía su residencia de verano allí', correcta: false, feedback: 'No. Los Zares veraneaban en Tsárskoye Seló, no en una fábrica.' },
          ],
          explicacion: 'La Fábrica Putilov era el corazón industrial de San Petersburgo. Cuando despidieron a 4 obreros en enero de 1905, 12.000 se declararon en huelga. Esa huelga desencadenó el Domingo Sangriento.',
        },
      ],
    },
  ],
  1917: [
    {
      id: 'menchevique',
      nombre: 'Menchevique de la Duma',
      emoji: '👔',
      preguntas: [
        {
          id: 'menchevique_1',
          pregunta: '¿Cuál fue la diferencia principal entre bolcheviques y mencheviques?',
          contexto: 'Un político menchevique te desafía a explicar la diferencia: "Ustedes los bolcheviques son unos extremistas, camarada."',
          respuestas: [
            { texto: 'Los bolcheviques querían un partido de revolucionarios profesionales; los mencheviques, un partido de masas abierto', correcta: true, feedback: '¡Exacto! Lenin quería una vanguardia disciplinada; los mencheviques preferían un partido amplio como los socialdemócratas europeos.' },
            { texto: 'Los bolcheviques apoyaban al Zar; los mencheviques querían derrocarlo', correcta: false, feedback: 'Al revés. Ambos querían derrocar al Zar. Los bolcheviques eran más radicales.' },
            { texto: 'No había diferencia, era el mismo partido', correcta: false, feedback: 'Falso. Se separaron en 1903 en el II Congreso del POSDR. La diferencia era fundamental sobre cómo organizar la revolución.' },
          ],
          explicacion: 'La división ocurrió en 1903. Bolcheviques (mayoría) = partido de cuadros profesionales. Mencheviques (minoría) = partido de masas democrático. Esta diferencia marcaría toda la historia de la URSS.',
        },
        {
          id: 'menchevique_2',
          pregunta: '¿Qué fueron las "Tesis de Abril" de Lenin?',
          respuestas: [
            { texto: 'Un plan para pasar de la revolución burguesa a la revolución socialista inmediatamente', correcta: true, feedback: 'Correcto. Lenin sorprendió a todos al llegar a Petrogrado y proponer "Todo el poder a los Soviets".' },
            { texto: 'Una receta para hacer pan con menos harina', correcta: false, feedback: 'No. Lenin no era panadero. Las Tesis de Abril fueron su programa político al regresar del exilio.' },
            { texto: 'Un tratado de paz con Alemania', correcta: false, feedback: 'No. Eso fue Brest-Litovsk en 1918, un año después de las Tesis de Abril.' },
          ],
          explicacion: 'Las Tesis de Abril (1917) propusieron: 1) No apoyar al Gobierno Provisional, 2) Todo el poder a los Soviets, 3) Nacionalización de tierras, 4) Fusión de todos los bancos. Fue un giro radical que sorprendió incluso a sus camaradas.',
        },
      ],
    },
  ],
  1919: [
    {
      id: 'trotsky_debate',
      nombre: 'León Trotsky',
      emoji: '👓',
      preguntas: [
        {
          id: 'trotsky_1',
          pregunta: '¿Qué estrategia usó Trotsky para organizar el Ejército Rojo durante la Guerra Civil?',
          contexto: 'Trotsky ajusta sus anteojos y te mira con intensidad. "Camarada, si querés hablar de arte, primero demostrame que entendés la guerra."',
          respuestas: [
            { texto: 'Reclutar ex-oficiales zaristas como "especialistas militares" supervisados por comisarios políticos', correcta: true, feedback: '¡Correcto! Trotsky usó a 50.000 ex-oficiales zaristas (voenspetsy) con un comisario político al lado para asegurar lealtad.' },
            { texto: 'Formar un ejército solo con obreros voluntarios, sin oficiales', correcta: false, feedback: 'Eso fue el intento inicial, y fracasó. Trotsky entendió que necesitaban expertos militares, aunque fueran ex-zaristas.' },
            { texto: 'Importar generales franceses para entrenar al Ejército Rojo', correcta: false, feedback: 'No. Francia apoyaba a los blancos. Trotsky usó recursos propios y ex-oficiales rusos.' },
          ],
          explicacion: 'Trotsky reclutó a 50.000 ex-oficiales zaristas (voenspetsy) y los puso bajo comisarios políticos. Su tren blindado recorrió 65.000 km durante la guerra civil, coordinando frentes. Esta estrategia fue clave para la victoria roja.',
        },
        {
          id: 'trotsky_2',
          pregunta: '¿Qué fue el "Tren de Trotsky" realmente?',
          respuestas: [
            { texto: 'Un tren blindado con imprenta, telégrafo, cine y sala de reuniones que recorría los frentes', correcta: true, feedback: '¡Exacto! No era solo un tren de guerra. Tenía su propia imprenta (para propaganda) y hasta un cine donde proyectaba películas a los soldados.' },
            { texto: 'Un tren de pasajeros común con un par de ametralladoras', correcta: false, feedback: 'Para nada. El tren de Trotsky era una ciudad móvil autosuficiente con tecnología de punta para la época.' },
            { texto: 'Nunca existió, es una leyenda soviética', correcta: false, feedback: 'Existió y está documentado. Trotsky viajó 65.000 km en él. Hoy es parte del mito revolucionario.' },
          ],
          explicacion: 'El tren blindado de Trotsky (1918-1921) era una ciudad fortaleza móvil: sala de mapas, telégrafo, imprenta, garaje de autos blindados, cine y hasta una banda de música. Recorrió 65.000 km, yendo al frente más peligroso en cada momento.',
        },
      ],
    },
  ],
  1922: [
    {
      id: 'stalin_debate',
      nombre: 'Iósif Stalin',
      emoji: '👨‍🦰',
      preguntas: [
        {
          id: 'stalin_1',
          pregunta: '¿Qué cargo ocupaba Stalin cuando se formó la URSS en 1922?',
          respuestas: [
            { texto: 'Secretario General del Partido Comunista', correcta: true, feedback: 'Correcto. Stalin fue nombrado Secretario General en abril de 1922. Un cargo administrativo que pocos tomaron en serio... hasta que fue tarde.' },
            { texto: 'Comisario del Pueblo para Asuntos Exteriores', correcta: false, feedback: 'Ese era Chicherin. Stalin manejaba la organización interna del partido.' },
            { texto: 'Presidente del Soviet Supremo', correcta: false, feedback: 'Ese cargo no existía en 1922. Stalin era Secretario General, un puesto que controlaba los nombramientos.' },
          ],
          explicacion: 'Stalin fue nombrado Secretario General en el XI Congreso del Partido (abril 1922). El cargo era de bajo perfil, pero Stalin lo usó para colocar a sus leales en todos los puestos clave. Lenin advirtió sobre este peligro en su "Testamento" pero ya era tarde.',
        },
        {
          id: 'stalin_2',
          pregunta: '¿Cuál fue la posición de Lenin sobre la formación de la URSS?',
          respuestas: [
            { texto: 'Quería una federación voluntaria de repúblicas iguales, no una nueva "Rusia" dominante', correcta: true, feedback: '¡Correcto! Lenin insistió en que fuera una unión de repúblicas iguales contra el plan de Stalin de "autonomización" (absorberlas en Rusia).' },
            { texto: 'Quería que todas las repúblicas fueran directamente provincias rusas', correcta: false, feedback: 'Ese era el plan de Stalin (autonomización). Lenin lo rechazó.' },
            { texto: 'Se oponía a la formación de la URSS completamente', correcta: false, feedback: 'No. Lenin apoyaba la unión, pero en términos de igualdad entre repúblicas, no de dominación rusa.' },
          ],
          explicacion: 'Stalin propuso la "autonomización" (las repúblicas se convertirían en provincias autónomas de la RSFSR). Lenin insistió en una federación de repúblicas iguales. La propuesta de Lenin ganó, pero Stalin pondría su sello más tarde.',
        },
      ],
    },
  ],
};

// Preguntas de desempate / generales
export const PREGUNTAS_GENERALES: PreguntaDuelo[] = [
  {
    id: 'general_1',
    pregunta: '¿Cuál fue la causa inmediata de la Revolución de Febrero de 1917?',
    respuestas: [
      { texto: 'Protestas de mujeres obreras por pan y la negativa del Zar a compartir el poder', correcta: true, feedback: 'Correcto. El 23 de febrero (8 de marzo), mujeres obreras salieron a las calles por pan. En 5 días, el Zar abdicó.' },
      { texto: 'Un golpe militar organizado por los generales', correcta: false, feedback: 'No. Fue una revolución popular espontánea que sorprendió a todos, incluso a los revolucionarios.' },
      { texto: 'El asesinato de Rasputín en diciembre de 1916', correcta: false, feedback: 'Rasputín fue asesinado en diciembre de 1916, pero la revolución no empezó hasta febrero de 1917.' },
    ],
    explicacion: 'El 23 de febrero (8 de marzo gregoriano) de 1917, mujeres obreras de Petrogrado protestaron por el pan. El Día Internacional de la Mujer se convirtió en el detonante de la Revolución de Febrero.',
  },
  {
    id: 'general_2',
    pregunta: '¿Qué fue el "Poder Dual" entre Febrero y Octubre de 1917?',
    respuestas: [
      { texto: 'El Gobierno Provisional y el Soviet de Petrogrado compartían el poder', correcta: true, feedback: 'Correcto. Había dos centros de poder: el Gobierno Provisional (burgués) y el Soviet (obrero/soldado). Un equilibrio inestable.' },
      { texto: 'Zar y Duma gobernaban juntos', correcta: false, feedback: 'No. El Zar abdicó en febrero. Ya no tenía poder.' },
      { texto: 'Alemania y Rusia administraban Petrogrado conjuntamente', correcta: false, feedback: 'No. Alemania y Rusia estaban en guerra.' },
    ],
    explicacion: 'Entre febrero y octubre de 1917, Rusia tuvo dos gobiernos: el Provisional (Príncipe Lvov, después Kerensky) y el Soviet de Petrogrado. Esta dualidad paralizó las decisiones y permitió que los bolcheviques ganaran apoyo con "Paz, Pan y Tierra".',
  },
];