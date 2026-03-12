import React, { createContext, useContext, useState, ReactNode } from 'react'

interface GameState {
  points: number
  level: number
  levelName: string
  addPoints: (pts: number) => void
}

const GameContext = createContext<GameState | undefined>(undefined)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(1250)

  // Calculate level based on mock thresholds
  const level = Math.floor(points / 1000) + 1
  const levelNames = ['Iniciante', 'Engajado', 'Estrategista', 'Líder', 'Mestre']
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)]

  const addPoints = (pts: number) => setPoints((p) => p + pts)

  return (
    <GameContext.Provider value={{ points, level, levelName, addPoints }}>
      {children}
    </GameContext.Provider>
  )
}

export default function useGameStore() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameStore must be used within a GameProvider')
  }
  return context
}
