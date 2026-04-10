import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface NivelProgress {
  id: string
  name: string
  points: number
  status: 'Concluído' | 'Em Andamento' | 'Pendente'
}

interface GameState {
  points: number
  level: number
  levelName: string
  niveisProgress: NivelProgress[]
  addPoints: (pts: number) => void
}

const GameContext = createContext<GameState | undefined>(undefined)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(150)

  // Calculate level based on mock thresholds
  const level = Math.floor(points / 1000) + 1
  const levelNames = [
    'Nível I - Observador Certificado (Iniciante)',
    'Nível II - Observador Certificado Pleno',
    'Nível III - Mobilizador',
  ]
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)]

  const addPoints = (pts: number) => setPoints((p) => p + pts)

  // Gamification Logic: Pleno >= 200, Mobilizador >= 500
  const niveisProgress: NivelProgress[] = [
    { id: 'I', name: 'Observador Certificado (Iniciante)', points: 350, status: 'Concluído' },
    { id: 'II', name: 'Observador Certificado Pleno', points: 150, status: 'Em Andamento' },
    { id: 'III', name: 'Mobilizador', points: 750, status: 'Pendente' },
  ]

  return (
    <GameContext.Provider value={{ points, level, levelName, niveisProgress, addPoints }}>
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
