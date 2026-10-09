import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, tokenStore } from './api'
import { refreshDirectory } from './directory'
import type { RegisterInput, User } from './types'

const USER_KEY = 'cc-user'

interface AuthState {
  user: User | null
  ready: boolean
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
}

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      if (raw && tokenStore.get()) setUser(JSON.parse(raw))
    } catch {
      /* ignore corrupt session */
    }
    setReady(true)
  }, [])

  const persist = (token: string, u: User) => {
    tokenStore.set(token)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
    refreshDirectory()
    return u
  }

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password)
    return persist(token, user)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const { token, user } = await api.register(input)
    return persist(token, user)
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  return <AuthCtx.Provider value={{ user, ready, login, register, logout }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
