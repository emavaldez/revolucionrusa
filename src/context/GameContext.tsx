"use client";
import React, { createContext, useContext, useState } from 'react';

// Definimos qué datos vamos a guardar
interface GameState {
  nombre: string;
  genero: string;
  año: number;
  ubicacion: string;
  inventario: string[];
  fervor: number;
}

const GameContext = createContext<any>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>({
    nombre: "",
    genero: "Obrero",
    año: 1905,
    ubicacion: "San Petersburgo",
    inventario: ["Pan duro"],
    fervor: 100,
  });

  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);