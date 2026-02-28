// src/components/ui/Inventory.tsx
import { useGame } from "@/context/GameContext";

export default function Inventory() {
  const { gameState } = useGame();

  return (
    <div className="fixed bottom-4 right-4 flex gap-2">
      {gameState.inventario.map((item: any, index: number) => (
        <div 
          key={index}
          className="w-12 h-12 bg-paper-light border-2 border-black flex items-center justify-center cursor-help group relative"
          title={item.nombre}
        >
          <span className="text-2xl">{item.icono}</span>
          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-[10px] p-2 w-32 border-2 border-soviet-gold">
            <p className="font-bold uppercase">{item.nombre}</p>
            <p className="italic opacity-80">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}