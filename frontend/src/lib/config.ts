export const API_URL = import.meta.env.VITE_API_URL

export const API_PATHS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    histories: '/api/auth/histories',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
    forgotPassword: '/api/auth/forgot-password',
    forgotPasswordVerify: '/api/auth/forgot-password/verify',
    forgotPasswordReset: '/api/auth/forgot-password/reset',
  },
  qr: {
    init: '/api/qr/init',
    scan: '/api/qr/scan',
    status: (qrToken: string) => `/api/qr/status/${encodeURIComponent(qrToken)}`,
  },
  seller: {
    applications: '/api/seller/applications',
    applicationsUpload: '/api/seller/applications/upload',
    applicationsMe: '/api/seller/applications/me',
  },
  shops: {
    me: '/api/shops/me',
    public: (slug: string) =>
      `/api/shops/public/${encodeURIComponent(slug)}`,
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
  const url = `${API_URL}${path}`
  const headers = new Headers(init?.headers)
  const isFormDataBody =
    typeof FormData !== 'undefined' && init?.body instanceof FormData
  if (!headers.has('Content-Type') && !isFormDataBody) {
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
