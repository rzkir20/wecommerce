import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { API_PATHS, apiJson } from '../lib/config'

import type { UserRole } from '../lib/role-proxy'

export type AuthUser = {
  id: string
  email: string
  name: string
  phone: string | null
  role?: UserRole
}

type AuthProviderProps = {
  children: React.ReactNode
  initialUser?: AuthUser | null
}

type AuthState = {
  user: AuthUser | null
  ready: boolean
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>
  refreshSession: () => Promise<AuthUser | null>
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function avatarUrlForEmail(email: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  /** Optimistic SSR hint; canonical session lives on API cookie (often another origin). */
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null)
  const [ready, setReady] = useState(false)

  const refreshSession = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await apiJson<{ user: AuthUser }>(API_PATHS.auth.me)
      setUser(res.user)
      return res.user
    } catch {
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await refreshSession()
      if (!cancelled) setReady(true)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [refreshSession])

  const logout = useCallback(() => {
    void apiJson<{ ok: boolean }>(API_PATHS.auth.logout, {
      method: 'POST',
    }).catch(() => {
      // Tetap clear local state walau request logout gagal.
    })
    setUser(null)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiJson<{ user: AuthUser }>(API_PATHS.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(res.user)
  }, [])

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone: string = '',
    ) => {
      const res = await apiJson<{ user: AuthUser }>(API_PATHS.auth.register, {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone }),
      })
      setUser(res.user)
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      refreshSession,
      register,
      logout,
    }),
    [user, ready, login, refreshSession, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext)
}
