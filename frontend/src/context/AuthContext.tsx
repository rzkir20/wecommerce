import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { apiJson } from '../lib/api'

const TOKEN_KEY = 'wecommerce_token'

const USER_KEY = 'wecommerce_user'

export type AuthUser = {
  id: string
  email: string
  name: string
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  ready: boolean
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const u = JSON.parse(raw) as AuthUser
    if (u.id && u.email && u.name) return u
  } catch {
    /* ignore */
  }
  return null
}

export function avatarUrlForEmail(email: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const persist = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const t = localStorage.getItem(TOKEN_KEY)
      const u = readStoredUser()
      if (!t || !u) {
        if (!cancelled) {
          setUser(null)
          setToken(null)
          setReady(true)
        }
        return
      }
      try {
        const res = await apiJson<{ user: AuthUser }>('/api/auth/me', {
          token: t,
        })
        if (!cancelled) {
          setToken(t)
          setUser(res.user)
          localStorage.setItem(USER_KEY, JSON.stringify(res.user))
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
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
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiJson<{ token: string; user: AuthUser }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      )
      persist(res.token, res.user)
    },
    [persist],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiJson<{ token: string; user: AuthUser }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        },
      )
      persist(res.token, res.user)
    },
    [persist],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      login,
      register,
      logout,
    }),
    [user, token, ready, login, register, logout],
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
