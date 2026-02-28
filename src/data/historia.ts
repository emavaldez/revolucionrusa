// src/data/historia.ts
export const HISTORIA = {
  1905: {
    titulo: "La Huelga de Putilov",
    descripcion: "Enero de 1905. 12,000 obreros han dejado sus puestos. El frío cala los huesos, pero el fervor revolucionario calienta el ambiente.",
    npc: "Padre Gapón",
    dialogo_inicial: "¡Camarada! Necesitamos llevar esta petición al Palacio de Invierno. ¿Te unes a la procesión o te quedarás comiendo ese pan duro?",
    opciones: [
      { texto: "¡Por el Zar y el Pueblo! (Unirse)", fervor: 10, siguiente: "procesion" },
      { texto: "¿Petición? Prefiero organizar un Soviet. (Dialéctica)", fervor: 20, siguiente: "debate" }
    ]
  }
};

export const INVENTARIO_BASE = [
  { id: 'pan_duro', nombre: 'Pan Duro', desc: 'Arma contundente o cena, según la necesidad.', icono: '🥖' },
  { id: 'manual_justo', nombre: 'Manual de Juan B. Justo', desc: 'Socialismo con sabor a asado. Confunde a los rusos.', icono: '📘' }
];

export const MISIONES = {
  1905: {
    id: 1905,
    titulo: "El Domingo Sangriento",
    fondo: "/escenas/mision_1905.png",
    descripcion: "Fábrica Putilov. El frío cala los huesos y el Zar no responde las cartas.",
    hotspots: [
      {
        id: "volante",
        x: 20, y: 80, // Porcentaje de la pantalla
        tipo: "recoger",
        label: "Volante Pisoteado",
        item: { id: 'volante', nombre: 'Volante del POSDR', desc: 'Manchado con barro y teoría.', icono: '📄' },
        mensaje: "Un volante revolucionario. Alguien lo pisó. Típico."
      },
      {
        id: "puerta_fabrica",
        x: 75, y: 50,
        tipo: "usar",
        label: "Puerta Trabada",
        requiere: "pan_duro",
        mensajeFallo: "Está trabada por el hielo. Necesito algo para hacer palanca.",
        mensajeExito: "Usaste el pan duro como palanca. La puerta cedió. ¡El pan es la base de la revolución!",
        accion: "abrir_puerta"
      },
      {
        id: "obrero_viejo",
        x: 40, y: 65,
        tipo: "hablar",
        label: "Obrero Cansado",
        mensaje: "Compañero, si me vas a hablar de plusvalía, primero consígueme fuego."
      }
    ],
    siguienteMision: 1912
  },
  1912: {
    id: 1912,
    titulo: "La Imprenta de la Pravda",
    fondo: "/escenas/mision_1912.png",
    descripcion: "Praga. Un sótano húmedo. La tinta escasea, pero sobran las palabras.",
    hotspots: [
      {
        id: "engranaje",
        x: 50, y: 60,
        tipo: "usar",
        label: "Engranaje Trabado",
        requiere: "grasa",
        mensajeFallo: "La prensa no gira. Necesita lubricación burguesa.",
        mensajeExito: "La máquina ruge. ¡Que tiemble el capital!",
        accion: "arreglar_prensa"
      }
    ],
    siguienteMision: 1917
  }
};