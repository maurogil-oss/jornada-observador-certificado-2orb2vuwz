import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type Role = 'observer' | 'admin' | null

interface User {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthState {
  user: User | null
  login: (email: string, role: Role) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('auth_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth_user')
    }
  }, [user])

  const login = (email: string, role: Role) => {
    setUser({
      id: Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0],
      email,
      role,
    })
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
