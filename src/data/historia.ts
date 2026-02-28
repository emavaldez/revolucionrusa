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

export const ITEMS_INICIALES = [
  { id: 'pan_duro', nombre: 'Pan Duro', desc: 'Un espécimen arqueológico de la panadería local.', icono: '🥖' },
  { id: 'volante', nombre: 'Volante del POSDR', desc: 'Contiene verdades prohibidas y manchas de té.', icono: '📄' }
];