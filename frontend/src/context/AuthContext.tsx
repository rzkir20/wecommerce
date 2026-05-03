import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
  AUTH_ME_QUERY_KEY,
  authMeQueryOptions,
  loginWithPassword,
  logoutRequest,
  patchAuthProfile,
  registerAccount,
} from '#/service/auth.service'

const AuthContext = createContext<AuthContextValue | null>(null)

export function avatarUrlForEmail(email: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const queryClient = useQueryClient()

  /** Optimistic SSR hint; canonical session lives on API cookie (often another origin). */
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null)
  const [ready, setReady] = useState(false)

  /** Seed TanStack Query agar pembaca pertama memakai data loader tanpa burst ganda. */
  useEffect(() => {
    if (initialUser) {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, { user: initialUser })
    }
  }, [initialUser, queryClient])

  const refreshSession = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await queryClient.fetchQuery(authMeQueryOptions())
      setUser(res.user)
      return res.user
    } catch {
      setUser(null)
      queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY })
      return null
    }
  }, [queryClient])

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
    void logoutRequest().catch(() => {
      // Tetap clear local state walau request logout gagal.
    })
    setUser(null)
    queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY })
  }, [queryClient])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginWithPassword(email, password)
      setUser(res.user)
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, res)
    },
    [queryClient],
  )

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone: string = '',
    ) => {
      const res = await registerAccount(name, email, password, phone)
      setUser(res.user)
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, res)
    },
    [queryClient],
  )

  const updateProfile = useCallback(
    async (body: UpdateProfileBody) => {
      const res = await patchAuthProfile(body)
      setUser(res.user)
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, res)
      return res
    },
    [queryClient],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      refreshSession,
      register,
      updateProfile,
      logout,
    }),
    [
      user,
      ready,
      login,
      refreshSession,
      register,
      updateProfile,
      logout,
    ],
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
