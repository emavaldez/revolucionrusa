// src/context/GameContext.tsx — VERSIÓN COMPLETA con Fervor, Codex, Decisiones
"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Decision } from '@/lib/game/FervorSystem';
import type { CodexEntry } from '@/lib/game/HistoricalCodex';

export interface Item {
  id: string;
  nombre: string;
  desc: string;
  icono: string;
}

export interface DecisionRecord {
  decisionId: string;
  opcionId: string;
  misionId: number;
  fervorDelta: number;
}

export interface GameState {
  nombre: string;
  genero: string;
  año: number;
  ubicacion: string;
  inventario: Item[];
  fervor: number;
  misionesCompletadas: number[];
  pistasUsadas: number;
  decisiones: DecisionRecord[];
  codexDesbloqueados: string[];
  flags: Record<string, boolean>;
}

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  hasItem: (itemId: string) => boolean;
  modifyFervor: (delta: number) => void;
  recordDecision: (decisionId: string, opcionId: string, misionId: number, delta: number) => void;
  unlockCodex: (entryId: string) => void;
  setFlag: (flag: string) => void;
  hasFlag: (flag: string) => boolean;
  resetGame: () => void;
}

const initialState: GameState = {
  nombre: "Alexandra",
  genero: "Camarada",
  año: 1905,
  ubicacion: "San Petersburgo",
  inventario: [],
  fervor: 50,
  misionesCompletadas: [],
  pistasUsadas: 0,
  decisiones: [],
  codexDesbloqueados: [],
  flags: {},
};

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const addItem = useCallback((item: Item) => {
    setGameState((prev) => {
      if (prev.inventario.some((i) => i.id === item.id)) return prev;
      return { ...prev, inventario: [...prev.inventario, item] };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setGameState((prev) => ({
      ...prev,
      inventario: prev.inventario.filter((i) => i.id !== itemId),
    }));
  }, []);

  const hasItem = useCallback(
    (itemId: string) => gameState.inventario.some((i) => i.id === itemId),
    [gameState.inventario]
  );

  const modifyFervor = useCallback((delta: number) => {
    setGameState((prev) => ({
      ...prev,
      fervor: Math.max(0, Math.min(100, prev.fervor + delta)),
    }));
  }, []);

  const recordDecision = useCallback(
    (decisionId: string, opcionId: string, misionId: number, delta: number) => {
      setGameState((prev) => ({
        ...prev,
        decisiones: [
          ...prev.decisiones,
          { decisionId, opcionId, misionId, fervorDelta: delta },
        ],
        fervor: Math.max(0, Math.min(100, prev.fervor + delta)),
      }));
    },
    []
  );

  const unlockCodex = useCallback((entryId: string) => {
    setGameState((prev) => {
      if (prev.codexDesbloqueados.includes(entryId)) return prev;
      return {
        ...prev,
        codexDesbloqueados: [...prev.codexDesbloqueados, entryId],
      };
    });
  }, []);

  const setFlag = useCallback((flag: string) => {
    setGameState((prev) => ({
      ...prev,
      flags: { ...prev.flags, [flag]: true },
    }));
  }, []);

  const hasFlag = useCallback(
    (flag: string) => !!gameState.flags[flag],
    [gameState.flags]
  );

  const resetGame = useCallback(() => {
    setGameState(initialState);
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        addItem,
        removeItem,
        hasItem,
        modifyFervor,
        recordDecision,
        unlockCodex,
        setFlag,
        hasFlag,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame debe usarse dentro de GameProvider");
  return ctx;
};
