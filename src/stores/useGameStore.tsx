import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface EixoProgress {
  id: string
  name: string
  points: number
  level: 'Iniciante' | 'Pleno' | 'Mobilizador'
}

interface GameState {
  points: number
  level: number
  levelName: string
  eixosProgress: EixoProgress[]
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

  // Gamification Logic: Pleno >= 200, Mobilizador >= 500
  const eixosProgress: EixoProgress[] = [
    { id: 'I', name: 'Formação', points: 350, level: 'Pleno' },
    { id: 'II', name: 'Atuação', points: 150, level: 'Iniciante' },
    { id: 'III', name: 'Liderança', points: 750, level: 'Mobilizador' },
  ]

  return (
    <GameContext.Provider value={{ points, level, levelName, eixosProgress, addPoints }}>
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
