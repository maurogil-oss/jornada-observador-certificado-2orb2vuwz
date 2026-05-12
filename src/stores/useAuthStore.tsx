import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'

type Role = 'observer' | 'admin' | null

interface User {
  id: string
  name: string
  full_name?: string
  nickname?: string
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
  turma?: number
  cpf_document?: string
  rg?: string
  rg_issuer?: string
  rg_state?: string
}

interface RegisterData {
  turma: number
  full_name: string
  nickname?: string
  cpf_document: string
  rg: string
  rg_issuer: string
  rg_state: string
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
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateUserData = () => {
    const record = pb.authStore.record
    if (record && pb.authStore.isValid) {
      setUser({
        id: record.id,
        name: record.name || record.email.split('@')[0],
        full_name: record.full_name || '',
        nickname: record.nickname || '',
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
        turma: record.turma,
        cpf_document: record.cpf_document,
        rg: record.rg,
        rg_issuer: record.rg_issuer,
        rg_state: record.rg_state,
      })
    } else {
      setUser(null)
    }
  }

  const validateSession = async (isMounted: boolean) => {
    try {
      if (pb.authStore.isValid && pb.authStore.token) {
        await pb.collection('users').authRefresh()
      } else {
        pb.authStore.clear()
      }
    } catch (err: any) {
      console.error('Session validation failed:', err)
      if (err.status !== 0) {
        pb.authStore.clear()
      }
    } finally {
      if (isMounted) {
        updateUserData()
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let isMounted = true

    validateSession(isMounted)

    const unsub = pb.authStore.onChange(() => {
      if (isMounted) {
        updateUserData()
      }
    })

    return () => {
      isMounted = false
      unsub()
    }
  }, [])

  const checkSession = async () => {
    try {
      if (pb.authStore.isValid && pb.authStore.token) {
        await pb.collection('users').authRefresh()
        updateUserData()
      }
    } catch (err: any) {
      if (err.status !== 0) {
        pb.authStore.clear()
        setUser(null)
      }
    }
  }

  const login = async (email: string, pass: string) => {
    await pb.collection('users').authWithPassword(email, pass)
  }

  const register = async (data: RegisterData) => {
    await pb.collection('users').create({
      ...data,
      name: data.nickname || data.full_name.split(' ')[0],
      role: 'observer',
      points: 0,
      level: 'Nível I - Observador Certificado (Iniciante)',
      is_active: false, // Wait for admin approval
    })
  }

  const logout = () => {
    pb.authStore.clear()
    try {
      localStorage.removeItem('pocketbase_auth')
      sessionStorage.clear()
    } catch (e) {
      console.warn('Failed to clear storage', e)
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: pb.authStore.isValid,
        isLoading,
        checkSession,
      }}
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
