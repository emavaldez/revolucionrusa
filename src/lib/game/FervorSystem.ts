// FervorSystem — Sistema de decisiones con consecuencias
// Cada decisión en una misión modifica el fervor del personaje

export interface Decision {
  id: string;
  misionId: number;
  texto: string; // lo que ve el jugador
  contexto: string; // lo que dice el NPC / situación
  opciones: OpcionDecision[];
  esCritica?: boolean; // si es una decisión que cambia el final
}

export interface OpcionDecision {
  id: string;
  texto: string;
  fervorDelta: number; // positivo = más radical, negativo = más moderado
  descripcionResultado: string; // feedback al jugador
  setFlag?: string; // flag que activa
  bloqueaFlags?: string[]; // flags que bloquea
}

// Decisiones históricamente reales de la Revolución Rusa
export const DECISIONES: Record<number, Decision[]> = {
  1905: [
    {
      id: 'bloody_sunday',
      misionId: 1905,
      texto: 'Las tropas están formadas frente al Palacio de Invierno.',
      contexto: 'El padre Gapón lidera la marcha pacífica. Los soldados tienen órdenes de disparar. ¿Qué hacés?',
      opciones: [
        { id: 'bs_marchar', texto: 'Marchar al frente con los obreros — la fe mueve montañas', fervorDelta: 10, descripcionResultado: 'Avanzás entre la multitud. Los primeros disparos suenan. El hielo se tiñe de rojo.', setFlag: 'bs_marcho' },
        { id: 'bs_disolverse', texto: 'Disuadir a los obreros — esto terminará en masacre', fervorDelta: -15, descripcionResultado: 'Lográs convencer a algunos. Otros avanzan. Los disparos suenan. Salvaste algunas vidas.', setFlag: 'bs_disolvio' },
        { id: 'bs_pelear', texto: '¡Agarren piedras! ¡No nos dejamos masacrar!', fervorDelta: 20, descripcionResultado: 'La lucha es desigual. Pero el Zar escuchará que el pueblo no se rinde tan fácil.', setFlag: 'bs_peleo' },
      ],
      esCritica: true,
    },
    {
      id: 'tras_bloody',
      misionId: 1905,
      texto: 'Después de la masacre, los obreros están desmoralizados.',
      contexto: 'Algunos quieren reconciliarse con el Zar. Otros quieren armarse. ¿Qué camino proponés?',
      opciones: [
        { id: 'tb_soviet', texto: 'Hay que organizar un Soviet — la única fuerza real es la colectiva', fervorDelta: 5, descripcionResultado: 'El primer Soviet de San Petersburgo se forma. Trotsky lo presidirá.', setFlag: 'soviet_formado' },
        { id: 'tb_petitorio', texto: 'Redactemos un petitorio — la razón también es arma', fervorDelta: -10, descripcionResultado: 'El petitorio llega al Palacio. No obtienen respuesta.', setFlag: 'petitorio_enviado' },
      ],
    },
  ],
  1917: [
    {
      id: 'febrero_decision',
      misionId: 1917,
      texto: 'Las mujeres obreras están protestando por pan.',
      contexto: '"¡Pan para nuestros hijos!" cantan frente a la fábrica. Los soldados dudan. ¿Te unís?',
      opciones: [
        { id: 'fd_unirse', texto: 'Unirme a las mujeres — esta chispa va a incendiar Petrogrado', fervorDelta: 10, descripcionResultado: 'Las filas de la protesta crecen. Los soldados bajan sus fusiles.', setFlag: 'fd_unido', bloqueaFlags: ['fd_disolver'] },
        { id: 'fd_esperar', texto: 'Esperar y observar — una revolución no se hace con pancartas de pan', fervorDelta: -5, descripcionResultado: 'La protesta crece sin vos. Pero estás intacto para lo que viene.', setFlag: 'fd_espero' },
      ],
      esCritica: true,
    },
  ],
  1918: [
    {
      id: 'brest_litovsk',
      misionId: 1918,
      texto: 'Los alemanes avanzan. Lenin quiere firmar la paz.',
      contexto: 'Bujarin grita "¡Guerra revolucionaria!" Trotsky propone "Ni paz ni guerra". Lenin insiste: firmar es necesario para salvar la revolución. ¿Qué apoyás?',
      opciones: [
        { id: 'bl_firmar', texto: 'Firmar la paz (Lenin) — a veces retroceder es avanzar', fervorDelta: -15, descripcionResultado: 'Brest-Litovsk se firma. Perdés territorio. Ganás tiempo. La decisión más difícil de la revolución.', setFlag: 'bl_firmado', bloqueaFlags: ['bl_guerra'] },
        { id: 'bl_guerra', texto: 'Guerra revolucionaria (Bujarin) — ¡la revolución se defiende con las armas!', fervorDelta: 20, descripcionResultado: 'Llamás a la guerra santa revolucionaria. Miles morirán. Pero el espíritu se mantiene.', setFlag: 'bl_guerra', bloqueaFlags: ['bl_firmado'] },
        { id: 'bl_trotsky', texto: 'Ni paz ni guerra (Trotsky) — confiemos en el ejército alemán', fervorDelta: 5, descripcionResultado: 'Trotsky anuncia "Ni paz ni guerra". Los alemanes avanzan igual. Terminás firmando, pero peor.', setFlag: 'bl_trotsky', bloqueaFlags: ['bl_firmado', 'bl_guerra'] },
      ],
      esCritica: true,
    },
    {
      id: 'romanov',
      misionId: 1918,
      texto: 'La familia Romanov está prisionera en Ekaterimburgo.',
      contexto: 'Las blancas se acercan. El Soviet local quiere ejecutarlos. Llega un telegrama cifrado. ¿Qué hacés?',
      opciones: [
        { id: 'ro_ejecutar', texto: 'Ejecutarlos — el Zar no puede ser una bandera para los blancos', fervorDelta: 25, descripcionResultado: 'La familia es ejecutada. El acto más oscuro de la revolución. Pero los blancos pierden su estandarte.', setFlag: 'ro_ejecutado', bloqueaFlags: ['ro_salvado'] },
        { id: 'ro_salvar', texto: 'Salvarlos — la revolución no se construye sobre asesinatos', fervorDelta: -30, descripcionResultado: 'Los Romanov escapan al exilio. Las blancas tienen un Zar vivo. Pero vos dormís de noche.', setFlag: 'ro_salvado', bloqueaFlags: ['ro_ejecutado'] },
      ],
      esCritica: true,
    },
  ],
  1921: [
    {
      id: 'kronstadt',
      misionId: 1921,
      texto: 'Los marineros de Kronstadt se han revelado contra el partido.',
      contexto: 'Fueron los héroes de Octubre. Ahora exigen libertad de prensa, fin de la dictadura del partido. Trotsky ordena aplastarlos. ¿Qué hacés?',
      opciones: [
        { id: 'kr_aplastar', texto: 'Apoyar a Trotsky — la disciplina del partido es primero', fervorDelta: 15, descripcionResultado: 'El Ejército Rojo ataca sobre el hielo. Miles de ex-camaradas mueren. El partido se mantiene unido.', setFlag: 'kr_aplastado', bloqueaFlags: ['kr_apoyar'] },
        { id: 'kr_apoyar', texto: 'Apoyar a los marineros — la revolución traicionó sus ideales', fervorDelta: -20, descripcionResultado: 'Te ponés del lado de los rebeldes. Sos expulsada del partido. Pero Kronstadt sabe que no está sola.', setFlag: 'kr_apoyado', bloqueaFlags: ['kr_aplastar'] },
        { id: 'kr_neutral', texto: 'Intentar mediar — la sangre de camaradas no riega la revolución', fervorDelta: -5, descripcionResultado: 'Tu mediación fracasa. Los cañones hablan. Pero escribís un informe para el futuro.', setFlag: 'kr_neutral', bloqueaFlags: ['kr_aplastar', 'kr_apoyar'] },
      ],
      esCritica: true,
    },
  ],
  1922: [
    {
      id: 'stalin_rise',
      misionId: 1922,
      texto: 'Stalin acumula poder silenciosamente.',
      contexto: 'Como Secretario General controla los nombramientos. Trotsky no le da importancia. Vos ves el peligro. ¿Qué hacés?',
      opciones: [
        { id: 'sr_aliarse', texto: 'Aliarte con Stalin — el poder pragmático construye la Unión', fervorDelta: -10, descripcionResultado: 'Stalin te coloca en el Comité Central. Tenés influencia real. Pero mirás de reojo sus métodos.', setFlag: 'sr_stalin' },
        { id: 'sr_trotsky', texto: 'Advertir a Trotsky — hay que frenarlo antes de que sea tarde', fervorDelta: 10, descripcionResultado: 'Trotsky te escucha pero no actúa. \"El aparato no es el partido\", dice. Ya es tarde.', setFlag: 'sr_trotsky' },
        { id: 'sr_exiliarse', texto: 'Irte al servicio diplomático — desde lejos se ve mejor el cuadro', fervorDelta: -5, descripcionResultado: 'Pedís un puesto diplomático. Noruega te espera. No verás el destrucción de tus ideales.', setFlag: 'sr_exilio' },
      ],
      esCritica: true,
    },
  ],
};

// Calcular epílogo según fervor y decisiones críticas
export function calcularEpilogo(
  fervor: number,
  flags: Record<string, boolean>
): { titulo: string; texto: string; imagen: string } {
  const ejecutoRomanov = flags['ro_ejecutado'];
  const salvoRomanov = flags['ro_salvado'];
  const firmoPaz = flags['bl_firmado'];
  const fueGuerra = flags['bl_guerra'];
  const apoyoStalin = flags['sr_stalin'];
  const apoyoKron = flags['kr_apoyado'];

  if (ejecutoRomanov && fueGuerra && fervor >= 80) {
    return {
      titulo: 'LA LLAMA RADICAL',
      texto: 'Alexandra Kollontai nunca cedió. Ejecutó al Zar, libró guerra revolucionaria, y mantuvo el fervor intacto. Pero en 1924, mientras Stalin consolidaba su poder, ella entendió que la revolución también devora a sus hijos.',
      imagen: '/escenas/epilogo_radical.png',
    };
  }
  if (salvoRomanov && apoyoKron && fervor <= 30) {
    return {
      titulo: 'LA DISIDENTE',
      texto: 'Alexandra Kollontai salvó a los Romanov, apoyó a los rebeldes de Kronstadt y fue expulsada del partido. Pasó el resto de sus días escribiendo memorias en Noruega. La historia la recordó como una voz que advirtió, pero no fue escuchada.',
      imagen: '/escenas/epilogo_disidente.png',
    };
  }
  if (apoyoStalin) {
    return {
      titulo: 'LA SUPERVIVIENTE',
      texto: 'Alexandra sobrevivió a las purgas de Stalin gracias a su alianza temprana. Fue embajadora en Suecia. Vio el Gulag desde lejos. Murió en 1952, preguntándose si todo había valido la pena.',
      imagen: '/escenas/epilogo_superviviente.png',
    };
  }
  if (firmoPaz && fervor >= 40 && fervor <= 70) {
    return {
      titulo: 'LA DIPLOMÁTICA',
      texto: 'Alexandra encontró su lugar en la diplomacia. Fue la primera mujer embajadora de la historia moderna. Desde Estocolmo, observó el ascenso de Stalin con preocupación, pero siempre creyó en el socialismo con rostro humano.',
      imagen: '/escenas/epilogo_diplomatica.png',
    };
  }
  return {
    titulo: 'EL LEGADO DE ALEXANDRA',
    texto: 'Cada revolución tiene mil caras. La de Alexandra Kollontai fue una mezcla de fervor y duda, de acción y reflexión. En 1924, frente al mausoleo de Lenin, prometió no olvidar nunca por qué empezó todo.',
    imagen: '/escenas/epilogo_default.png',
  };
}
