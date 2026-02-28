// src/context/GameContext.tsx
"use client";
import React, { createContext, useContext, useState } from 'react';

export interface Item {
  id: string;
  nombre: string;
  desc: string;
  icono: string;
}

export interface GameState {
  nombre: string;
  genero: string;
  año: number;
  ubicacion: string;
  inventario: Item[];
  fervor: number;
}

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>({
    nombre: "",
    genero: "Camarada",
    año: 1905,
    ubicacion: "San Petersburgo",
    inventario: [],
    fervor: 100,
  });

  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame debe usarse dentro de GameProvider");
  return ctx;
};
