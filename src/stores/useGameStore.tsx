import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import useAuthStore from './useAuthStore'
import { toast } from '@/hooks/use-toast'

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
  const { user } = useAuthStore()
  const [prevLevel, setPrevLevel] = useState<string | null>(null)

  const points = user?.points || 0
  const levelName = user?.level || 'Nível I - Observador Certificado (Iniciante)'
  const level = levelName.includes('III') ? 3 : levelName.includes('II') ? 2 : 1

  useEffect(() => {
    if (user && prevLevel && prevLevel !== user.level) {
      toast({
        title: '🎉 Nível Atualizado!',
        description: `Seu nível agora é: ${user.level}`,
      })
    }
    if (user) {
      setPrevLevel(user.level)
    }
  }, [user?.level])

  // Fake add points for local optimistic UI if needed
  const addPoints = (pts: number) => {}

  const isNivel2Base = (user?.turma || 15) <= 14

  const niveisProgress: NivelProgress[] = [
    {
      id: 'I',
      name: 'Observador Certificado (Iniciante)',
      points: Math.min(500, points),
      status: level >= 2 || isNivel2Base ? 'Concluído' : 'Em Andamento',
    },
    {
      id: 'II',
      name: 'Observador Certificado Pleno',
      points: Math.min(500, points),
      status:
        level >= 3
          ? 'Concluído'
          : level === 2 || (isNivel2Base && level >= 2)
            ? 'Em Andamento'
            : 'Pendente',
    },
    {
      id: 'III',
      name: 'Mobilizador',
      points: Math.max(0, points - 500),
      status: level >= 3 && points >= 1000 ? 'Concluído' : level >= 3 ? 'Em Andamento' : 'Pendente',
    },
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
