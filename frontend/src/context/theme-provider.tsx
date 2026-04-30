import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

const THEMES: Theme[] = ['dark', 'light', 'system']

function readStoredTheme(storageKey: string): Theme | undefined {
  if (typeof window === 'undefined') return undefined
  const stored = localStorage.getItem(storageKey)
  if (stored !== null && THEMES.includes(stored as Theme)) {
    return stored as Theme
  }
  return undefined
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  // SSR has no localStorage; hydrate preference after mount to avoid mismatch + ReferenceError
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const stored = readStoredTheme(storageKey)
    if (stored !== undefined) setTheme(stored)
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (next: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, next)
      }
      setTheme(next)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
