import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { toast } from 'sonner'
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
  created?: string
  birth_date?: string
  cep?: string
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
  if (!record || typeof record !== 'object' || !record.id) {
    return null
  }
  return {
    id: record.id,
    name: record.name || (record.email ? record.email.split('@')[0] : 'Usuário'),
    full_name: record.full_name || '',
    nickname: record.nickname || '',
    email: record.email || '',
    role: record.role || 'observer',
    points: typeof record.points === 'number' ? record.points : 0,
    level: record.level || 'Nível I - Observador Certificado (Iniciante)',
    avatar: record.avatar ? pb.files.getUrl(record, record.avatar) : '',
    // Defensive normalization: guarantee boolean is_active even with stale localStorage residues
    is_active:
      typeof record.is_active === 'boolean' ? record.is_active : record.is_active !== false,
    onboarding_completed: record.onboarding_completed === true,
    created: record.created || '',
    birth_date: record.birth_date || '',
    cep: record.cep || '',
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
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastShownRef = useRef(false)

  const handleSessionExpired = useCallback((showToast: boolean = true) => {
    clearAllStorage()
    setUser(null)
    if (showToast && !toastShownRef.current) {
      toastShownRef.current = true
      toast.error('Sua sessão expirou, faça login novamente', {
        id: 'session-expired',
        duration: 5000,
      })
      // Reset after a brief delay so subsequent actual expirations can notify again
      setTimeout(() => {
        toastShownRef.current = false
      }, 5000)
    }
  }, [])

  const getTokenExpTime = (token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload && typeof payload.exp === 'number') {
        return payload.exp * 1000 // ms
      }
    } catch {
      // invalid token format
    }
    return null
  }

  // Schedule proactive refresh before token expires
  const scheduleProactiveRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }

    if (!pb.authStore.isValid || !pb.authStore.token) return

    const expTime = getTokenExpTime(pb.authStore.token)
    if (!expTime) return

    const now = Date.now()
    const timeUntilExp = expTime - now

    if (timeUntilExp <= 0) {
      // Already expired
      handleSessionExpired(true)
      return
    }

    // Refresh 10 minutes (600,000ms) before expiration, or halfway through if lifetime is shorter
    const refreshLeadTime = Math.min(600000, Math.max(10000, timeUntilExp / 2))
    const refreshInMs = Math.max(1000, timeUntilExp - refreshLeadTime)

    refreshTimerRef.current = setTimeout(async () => {
      if (!pb.authStore.isValid || !pb.authStore.token) return
      try {
        await pb.collection('users').authRefresh()
        updateUserData()
        scheduleProactiveRefresh()
      } catch (err: any) {
        console.warn('Proactive auth-refresh failed:', err)
        // 401 or other HTTP error (excluding status 0 network drop/cancellation)
        if (err?.status && err.status >= 400 && err.status < 500) {
          handleSessionExpired(true)
        } else {
          // If network error, retry in 30 seconds if token not expired yet
          const remaining = (getTokenExpTime(pb.authStore.token) || 0) - Date.now()
          if (remaining > 5000) {
            refreshTimerRef.current = setTimeout(
              scheduleProactiveRefresh,
              Math.min(30000, remaining - 2000),
            )
          } else {
            handleSessionExpired(true)
          }
        }
      }
    }, refreshInMs)
  }, [handleSessionExpired])

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
        const expTime = getTokenExpTime(pb.authStore.token)
        if (expTime && expTime < Date.now()) {
          throw new Error('Token expired locally')
        }

        try {
          await pb.collection('users').authRefresh()
          scheduleProactiveRefresh()
        } catch (refreshErr: any) {
          console.warn('Auth refresh failed during initial validation', refreshErr)
          if (refreshErr?.status && refreshErr.status >= 400 && refreshErr.status < 500) {
            handleSessionExpired(true)
          }
        }
      } else {
        clearAllStorage()
      }
    } catch (err: any) {
      console.error('Session validation failed:', err)
      handleSessionExpired(false)
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
        if (pb.authStore.isValid && pb.authStore.token) {
          scheduleProactiveRefresh()
        }
      }
    })

    // Listen to document visibility/focus to immediately verify and refresh session if needed
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pb.authStore.isValid && pb.authStore.token) {
        const expTime = getTokenExpTime(pb.authStore.token)
        if (expTime) {
          const timeUntilExp = expTime - Date.now()
          // If token has less than 15 minutes left or expired, refresh or expire
          if (timeUntilExp <= 0) {
            handleSessionExpired(true)
          } else if (timeUntilExp < 900000) {
            pb.collection('users')
              .authRefresh()
              .then(() => {
                updateUserData()
                scheduleProactiveRefresh()
              })
              .catch((err) => {
                if (err?.status && err.status >= 400 && err.status < 500) {
                  handleSessionExpired(true)
                }
              })
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      unsub()
    }
  }, [scheduleProactiveRefresh, handleSessionExpired])

  const checkSession = async () => {
    try {
      if (pb.authStore.isValid && pb.authStore.token) {
        await pb.collection('users').authRefresh()
        updateUserData()
        scheduleProactiveRefresh()
      } else {
        handleSessionExpired(false)
      }
    } catch (err: any) {
      console.warn('Silent session refresh failed:', err)
      if (err?.status && err.status >= 400 && err.status < 500) {
        handleSessionExpired(true)
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
