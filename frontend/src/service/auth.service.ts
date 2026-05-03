import type { AuthUser } from '#/context/AuthContext'

import { API_PATHS, apiJson } from '#/lib/config'

export {
  PWD_RESET_EMAIL_KEY,
  PWD_RESET_TOKEN_KEY,
} from '#/lib/password-reset-keys'

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

export type QrInitResponse = { qrToken: string; expiresAt: number }

export async function initQrLoginSession(): Promise<QrInitResponse> {
  return apiJson<QrInitResponse>(API_PATHS.qr.init, {
    method: 'POST',
  })
}

export type QrLoginStatusResponse = {
  status: 'pending' | 'approved' | 'expired' | 'used'
  expiresAt?: number
  user?: { id: string; email: string; name: string }
}

export async function fetchQrLoginStatus(
  qrToken: string,
): Promise<QrLoginStatusResponse> {
  return apiJson<QrLoginStatusResponse>(API_PATHS.qr.status(qrToken))
}
