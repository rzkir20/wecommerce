export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL ?? process.env.VITE_API_URL ?? 'http://localhost:8787'
}

export const API_PATHS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
  },
  qr: {
    init: '/api/qr/init',
    scan: '/api/qr/scan',
    status: (qrToken: string) => `/api/qr/status/${encodeURIComponent(qrToken)}`,
  },
} as const

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit & { token?: string | null },
): Promise<T> {
  const url = `${getApiUrl()}${path}`
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = init?.token
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const { token: _t, ...rest } = init ?? {}
  const res = await fetch(url, {
    ...rest,
    headers,
    credentials: rest.credentials ?? 'include',
  })

  const text = await res.text()
  let data: unknown = {}
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = {}
    }
  }

  if (!res.ok) {
    const msg =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof data.error === 'string'
        ? (data as { error: string }).error
        : res.statusText || 'Request failed'
    throw new ApiError(res.status, msg)
  }

  return data as T
}
