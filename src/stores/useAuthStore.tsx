import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'

type Role = 'observer' | 'admin' | null

interface User {
  id: string
  name: string
  email: string
  role: Role
  points: number
  level: string
}

interface AuthState {
  user: User | null
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const updateUserData = () => {
      const record = pb.authStore.record
      if (record) {
        setUser({
          id: record.id,
          name: record.name || record.email.split('@')[0],
          email: record.email,
          role: record.role || 'observer',
          points: record.points || 0,
          level: record.level || 'Nível I - Observador Certificado (Iniciante)',
        })
      } else {
        setUser(null)
      }
    }

    updateUserData()
    setIsLoading(false)

    const unsub = pb.authStore.onChange(() => {
      updateUserData()
    })

    return () => {
      unsub()
    }
  }, [])

  const login = async (email: string, pass: string) => {
    await pb.collection('users').authWithPassword(email, pass)
  }

  const register = async (name: string, email: string, pass: string) => {
    await pb.collection('users').create({
      email,
      password: pass,
      passwordConfirm: pass,
      name,
      role: 'observer',
      points: 0,
      level: 'Nível I - Observador Certificado (Iniciante)',
    })
    await login(email, pass)
  }

  const logout = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated: pb.authStore.isValid, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}
