import { createServerFn } from '@tanstack/react-start'

import { getRequestHeader } from '@tanstack/react-start/server'

import type { AuthUser } from '#/context/AuthContext'

import { API_PATHS, API_URL } from '#/lib/config'

export const themeInitializerScript = `
(() => {
  const storageKey = 'vite-ui-theme';
  const root = document.documentElement;
  const storedTheme = localStorage.getItem(storageKey);
  const isValidTheme = storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system';
  const preferredTheme = isValidTheme ? storedTheme : 'system';
  const resolvedTheme =
    preferredTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preferredTheme;

  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
})();
`

export const getSessionUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthUser | null> => {
    try {
      const cookie = getRequestHeader('cookie') ?? ''
      if (!cookie) return null

      const res = await fetch(`${API_URL}${API_PATHS.auth.me}`, {
        headers: {
          cookie,
        },
      })

      if (!res.ok) return null

      const data = (await res.json()) as { user?: AuthUser }
      return data.user ?? null
    } catch {
      return null
    }
  },
)
