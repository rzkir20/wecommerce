import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { API_PATHS, apiJson } from '../lib/config'

const USER_KEY = 'wecommerce_user'
const TOKEN_KEY = 'wecommerce_token'

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
  token: string | null
  ready: boolean
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>
  loginWithQr: (payload: { user: AuthUser; token?: string | null }) => void
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

function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return null
    const token = raw.trim()
    return token || null
  } catch {
    return null
  }
}

export function avatarUrlForEmail(email: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
}

export function AuthProvider({
  children,
  initialUser,
}: AuthProviderProps) {
  const hasInitialState = initialUser !== undefined
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null)
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(hasInitialState)

  const persist = useCallback((nextUser: AuthUser, nextToken: string | null = null) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    void apiJson<{ ok: boolean }>(API_PATHS.auth.logout, { method: 'POST' }).catch(() => {
      // Tetap clear local state walau request logout gagal.
    })
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (ready) return
    let cancelled = false
    const run = async () => {
      const u = readStoredUser()
      const storedToken = readStoredToken()
      if (!u) {
        if (!cancelled) {
          setUser(null)
          setToken(storedToken)
          setReady(true)
        }
      }
      try {
        const res = await apiJson<{ user: AuthUser }>(API_PATHS.auth.me, {
          token: storedToken,
        })
        if (!cancelled) {
          setToken(storedToken)
          setUser(res.user)
          localStorage.setItem(USER_KEY, JSON.stringify(res.user))
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(USER_KEY)
          localStorage.removeItem(TOKEN_KEY)
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
  }, [ready])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiJson<{ token?: string; user: AuthUser }>(
        API_PATHS.auth.login,
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      )
      persist(res.user, res.token ?? null)
    },
    [persist],
  )

  const loginWithQr = useCallback(
    (payload: { user: AuthUser; token?: string | null }) => {
      persist(payload.user, payload.token ?? null)
    },
    [persist],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiJson<{ token?: string; user: AuthUser }>(
        API_PATHS.auth.register,
        {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        },
      )
      persist(res.user, res.token ?? null)
    },
    [persist],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      login,
      loginWithQr,
      register,
      logout,
    }),
    [user, token, ready, login, loginWithQr, register, logout],
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
