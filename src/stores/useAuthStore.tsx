import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
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
  onboarding_completed: boolean
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

const APP_VERSION = '1.0.3'

const extractUserFromRecord = (record: any): User | null => {
  if (!record || typeof record !== 'object' || !record.id || record.role === undefined) {
    return null
  }
  return {
    id: record.id,
    name: record.name || (record.email ? record.email.split('@')[0] : 'Usuário'),
    full_name: record.full_name || '',
    nickname: record.nickname || '',
    email: record.email || '',
    role: record.role || 'observer',
    points: record.points || 0,
    level: record.level || 'Nível I - Observador Certificado (Iniciante)',
    avatar: record.avatar ? pb.files.getUrl(record, record.avatar) : '',
    is_active: record.is_active !== false,
    onboarding_completed: record.onboarding_completed === true,
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
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (pb.authStore.isValid && pb.authStore.record) {
        return extractUserFromRecord(pb.authStore.record)
      }
    } catch (e) {
      console.warn('Failed to parse initial user state', e)
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(true)

  const clearAllStorage = () => {
    pb.authStore.clear()
    try {
      localStorage.removeItem('pocketbase_auth')
    } catch (e) {
      console.warn('Failed to clear storage', e)
    }
  }

  const updateUserData = () => {
    try {
      const record = pb.authStore.record
      if (record && pb.authStore.isValid) {
        const parsedUser = extractUserFromRecord(record)
        if (parsedUser) {
          setUser(parsedUser)
        } else {
          throw new Error('Malformed user record in local storage')
        }
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Error parsing user data:', err)
      clearAllStorage()
      setUser(null)
    }
  }

  const isValidatingRef = useRef(false)

  const validateSession = async (isMounted: boolean) => {
    if (isValidatingRef.current) return
    isValidatingRef.current = true
    try {
      const currentVersion = localStorage.getItem('app_version')
      if (currentVersion !== APP_VERSION) {
        clearAllStorage()
        localStorage.setItem('app_version', APP_VERSION)
      }

      if (pb.authStore.isValid && pb.authStore.token) {
        try {
          const tokenPayload = JSON.parse(atob(pb.authStore.token.split('.')[1]))
          if (tokenPayload.exp * 1000 < Date.now()) {
            throw new Error('Token expired locally')
          }
        } catch (e) {
          throw new Error('Invalid token format or expired')
        }

        try {
          await pb.collection('users').authRefresh()
        } catch (refreshErr: any) {
          console.warn('Auth refresh failed', refreshErr)
          if (refreshErr?.status !== 0) {
            clearAllStorage()
          }
        }
      } else {
        clearAllStorage()
      }
    } catch (err: any) {
      console.error('Session validation failed:', err)
      clearAllStorage()
    } finally {
      isValidatingRef.current = false
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
      } else {
        clearAllStorage()
        setUser(null)
      }
    } catch (err: any) {
      console.warn('Silent session refresh failed:', err)
      if (err?.status !== 0) {
        clearAllStorage()
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
      is_active: false,
      onboarding_completed: false,
    })
  }

  const logout = () => {
    clearAllStorage()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user && pb.authStore.isValid,
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
