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
  avatar: string
  is_active: boolean
  birth_date?: string
  city?: string
  state?: string
  country?: string
  workplace?: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  passwordConfirm: string
  birth_date?: string
  city?: string
  state?: string
  country?: string
  workplace?: string
}

interface AuthState {
  user: User | null
  login: (email: string, pass: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
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
          avatar: record.avatar ? pb.files.getUrl(record, record.avatar) : '',
          is_active: record.is_active !== false,
          birth_date: record.birth_date || '',
          city: record.city || '',
          state: record.state || '',
          country: record.country || '',
          workplace: record.workplace || '',
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

  const register = async (data: RegisterData) => {
    await pb.collection('users').create({
      ...data,
      role: 'observer',
      points: 0,
      level: 'Nível I - Observador Certificado (Iniciante)',
    })
    await login(data.email, data.password)
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
