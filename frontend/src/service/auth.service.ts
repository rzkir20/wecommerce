import { queryOptions } from '@tanstack/react-query'

import { API_PATHS, apiJson } from '#/lib/config'

export {
  PWD_RESET_EMAIL_KEY,
  PWD_RESET_TOKEN_KEY,
} from '#/lib/password-reset-keys'

/** Kunci cache server state untuk pengguna yang sedang login (`GET/PATCH /me`). */
export const AUTH_ME_QUERY_KEY = ['auth', 'me'] as const

const AUTH_ME_STALE_MS = 2 * 60_000

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{ user: AuthUser }> {
  return apiJson<{ user: AuthUser }>(API_PATHS.auth.login, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registerAccount(
  name: string,
  email: string,
  password: string,
  phone: string = '',
): Promise<{ user: AuthUser }> {
  return apiJson<{ user: AuthUser }>(API_PATHS.auth.register, {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone }),
  })
}

export async function fetchAuthMe(): Promise<{ user: AuthUser }> {
  return apiJson<{ user: AuthUser }>(API_PATHS.auth.me)
}

/** Opsi TanStack Query + cache GET /auth/me (baca profil sesi). */
export function authMeQueryOptions() {
  return queryOptions({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: fetchAuthMe,
    staleTime: AUTH_ME_STALE_MS,
    gcTime: 30 * 60_000,
  })
}

export async function patchAuthProfile(
  body: UpdateProfileBody,
): Promise<{ user: AuthUser }> {
  return apiJson<{ user: AuthUser }>(API_PATHS.auth.me, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function logoutRequest(): Promise<{ ok: boolean }> {
  return apiJson<{ ok: boolean }>(API_PATHS.auth.logout, {
    method: 'POST',
  })
}

export async function requestForgotPassword(
  email: string,
): Promise<{ ok: true }> {
  return apiJson<{ ok: true }>(API_PATHS.auth.forgotPassword, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function verifyForgotPasswordOtp(
  email: string,
  otp: string,
): Promise<{ ok: true; resetToken: string }> {
  return apiJson<{ ok: true; resetToken: string }>(
    API_PATHS.auth.forgotPasswordVerify,
    {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    },
  )
}

export async function resetForgottenPassword(input: {
  resetToken: string
  newPassword: string
  confirmPassword: string
}): Promise<{ ok: true }> {
  return apiJson<{ ok: true }>(API_PATHS.auth.forgotPasswordReset, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function initQrLoginSession(): Promise<QrInitResponse> {
  return apiJson<QrInitResponse>(API_PATHS.qr.init, {
    method: 'POST',
  })
}

export async function fetchQrLoginStatus(
  qrToken: string,
): Promise<QrLoginStatusResponse> {
  return apiJson<QrLoginStatusResponse>(API_PATHS.qr.status(qrToken))
}
