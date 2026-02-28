// src/components/scenes/DueloDialectico.tsx
import { useState } from 'react';

const INSULTOS_ZARISTAS = [
  {
    pregunta: "¡El orden natural exige que el Zar sea el padre del pueblo!",
    respuestas: [
      { texto: "¡El materialismo histórico dice que tu orden es una fase!", correcta: true },
      { texto: "¡Mi padre no usa corona!", correcta: false },
      { texto: "¡La plusvalía pertenece al obrero!", correcta: false }
    ]
  },
  {
    pregunta: "¡Ustedes los bolcheviques solo traen el caos a la Santa Rusia!",
    respuestas: [
      { texto: "No es caos, es la contradicción inevitable del capitalismo.", correcta: true },
      { texto: "¡Caos es el que tiene el Zar en la cabeza!", correcta: false },
      { texto: "¡Viva Lenin!", correcta: false }
    ]
  }
];

export default function DueloDialectico({ onWin }: { onWin: () => void }) {
  const [paso, setPaso] = useState(0);

  const chequearRespuesta = (esCorrecta: boolean) => {
    if (esCorrecta) {
      if (paso + 1 < INSULTOS_ZARISTAS.length) {
        setPaso(paso + 1);
      } else {
        alert("¡Has humillado al burgués con pura lógica proletaria!");
        onWin();
      }
    } else {
      alert("Te han dejado sin palabras. ¡Debes leer más a Marx!");
    }
  };

  return (
    <div className="bg-soviet-red p-6 border-4 border-soviet-gold text-white">
      <h3 className="text-xl font-black mb-4 uppercase">¡DUELO DE TEORÍA!</h3>
      <p className="bg-black/30 p-4 italic mb-6">"{INSULTOS_ZARISTAS[paso].pregunta}"</p>
      <div className="space-y-2">
        {INSULTOS_ZARISTAS[paso].respuestas.map((r, i) => (
          <button 
            key={i}
            onClick={() => chequearRespuesta(r.correcta)}
            className="w-full text-left p-2 border border-white hover:bg-soviet-gold hover:text-black transition-all"
          >
            {r.texto}
          </button>
        ))}
      </div>
    </div>
  );
}