import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './use-auth'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from './use-realtime'

interface GameContextType {
  points: number
  level: string
  loading: boolean
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within a GameProvider')
  return context
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth()
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState('Nível I')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!isAuthenticated || !user) {
      setPoints(0)
      setLevel('Nível I')
      setLoading(false)
      return
    }
    try {
      const record = await pb.collection('users').getOne(user.id)
      setPoints(record.points || 0)
      setLevel(record.level || 'Nível I')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user, isAuthenticated])

  useRealtime(
    'users',
    (e) => {
      if (user && e.record.id === user.id) {
        setPoints(e.record.points || 0)
        setLevel(e.record.level || 'Nível I')
      }
    },
    !!user,
  )

  return <GameContext.Provider value={{ points, level, loading }}>{children}</GameContext.Provider>
}
