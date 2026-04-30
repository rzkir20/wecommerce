import type { Context } from 'hono'

import type { AuthUser } from './auth.controller.js'
import { buildAuthTokenAndUser, setSessionCookie } from './auth.controller.js'

const QR_LOGIN_EXPIRES_MS = 1000 * 60 * 2

type QrLoginSession = {
  expiresAt: number
  consumed: boolean
  approvedToken?: string
  approvedUser?: AuthUser
}

const qrLoginSessions = new Map<string, QrLoginSession>()

function pruneExpiredQrSessions() {
  const now = Date.now()
  for (const [id, session] of qrLoginSessions.entries()) {
    if (session.expiresAt <= now) {
      qrLoginSessions.delete(id)
    }
  }
}

export async function initQrLogin(c: Context) {
  pruneExpiredQrSessions()

  const qrToken = crypto.randomUUID()
  const expiresAt = Date.now() + QR_LOGIN_EXPIRES_MS
  qrLoginSessions.set(qrToken, {
    expiresAt,
    consumed: false,
  })

  return c.json({
    qrToken,
    expiresAt,
    expiresInMs: QR_LOGIN_EXPIRES_MS,
  })
}

export async function scanQrLogin(c: Context) {
  pruneExpiredQrSessions()

  const userId = c.get('jwtUserId')
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  let body: { qrToken?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const qrToken = String(body.qrToken ?? '').trim()
  if (!qrToken) {
    return c.json({ error: 'qrToken is required' }, 400)
  }

  const session = qrLoginSessions.get(qrToken)
  if (!session || session.expiresAt <= Date.now()) {
    qrLoginSessions.delete(qrToken)
    return c.json({ error: 'QR login session expired or not found' }, 404)
  }
  if (session.consumed) {
    return c.json({ error: 'QR login session already used' }, 409)
  }
  if (session.approvedToken) {
    return c.json({ error: 'QR login session already approved' }, 409)
  }

  try {
    const approved = await buildAuthTokenAndUser(c, userId)
    qrLoginSessions.set(qrToken, {
      ...session,
      approvedToken: approved.token,
      approvedUser: approved.user,
    })
    return c.json({ ok: true, status: 'approved' })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to approve QR login' }, 500)
  }
}

export async function getQrLoginStatus(c: Context) {
  pruneExpiredQrSessions()

  const qrToken = String(c.req.param('qrToken') ?? '').trim()
  if (!qrToken) {
    return c.json({ error: 'qrToken is required' }, 400)
  }

  const session = qrLoginSessions.get(qrToken)
  if (!session || session.expiresAt <= Date.now()) {
    qrLoginSessions.delete(qrToken)
    return c.json({ status: 'expired' }, 410)
  }
  if (session.consumed) {
    return c.json({ status: 'used' }, 410)
  }
  if (!session.approvedToken || !session.approvedUser) {
    return c.json({
      status: 'pending',
      expiresAt: session.expiresAt,
    })
  }

  setSessionCookie(c, session.approvedToken)
  qrLoginSessions.set(qrToken, {
    ...session,
    consumed: true,
  })

  return c.json({
    status: 'approved',
    token: session.approvedToken,
    user: session.approvedUser,
  })
}
