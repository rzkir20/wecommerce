import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { API_PATHS, apiJson } from '../lib/config'

export type AuthUser = {
  id: string
  email: string
  name: string
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
  loginWithQr: (payload: { user: AuthUser }) => void
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function avatarUrlForEmail(email: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
}

export function AuthProvider({
  children,
  initialUser,
}: AuthProviderProps) {
  const hasInitialState = initialUser !== undefined
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null)
  const [ready, setReady] = useState(hasInitialState)

  const logout = useCallback(() => {
    void apiJson<{ ok: boolean }>(API_PATHS.auth.logout, { method: 'POST' }).catch(() => {
      // Tetap clear local state walau request logout gagal.
    })
    setUser(null)
  }, [])

  useEffect(() => {
    if (ready) return
    let cancelled = false
    const run = async () => {
      try {
        const res = await apiJson<{ user: AuthUser }>(API_PATHS.auth.me)
        if (!cancelled) {
          setUser(res.user)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [ready])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiJson<{ user: AuthUser }>(API_PATHS.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setUser(res.user)
    },
    [],
  )

  const loginWithQr = useCallback((payload: { user: AuthUser }) => {
    setUser(payload.user)
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiJson<{ user: AuthUser }>(API_PATHS.auth.register, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
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
      loginWithQr,
      register,
      logout,
    }),
    [user, ready, login, loginWithQr, register, logout],
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
