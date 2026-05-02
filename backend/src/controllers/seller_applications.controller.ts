import type { Context } from 'hono'

import {
  parseCreateSellerApplicationBody,
  parseRejectSellerApplicationBody,
} from '../middleware/seller_applications.middleware.js'
import {
  approveSellerApplication,
  createSellerApplication,
  listMySellerApplications,
  listPendingSellerApplications,
  rejectSellerApplication,
} from '../services/seller_applications.service.js'

import type { AppBindings } from '../types/hono-env.js'

export async function createSellerApplicationController(c: Context<AppBindings>) {
  const authUser = c.get('authUser')
  const body = await c.req.json().catch(() => null)
  const parsed = parseCreateSellerApplicationBody(body)

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400)
  }

  const result = await createSellerApplication(authUser.id, parsed.data)
  if (!result.ok) {
    return c.json({ error: result.error }, result.status)
  }

  return c.json({ application: result.application }, 201)
}

export async function listMySellerApplicationsController(c: Context<AppBindings>) {
  const authUser = c.get('authUser')
  const applications = await listMySellerApplications(authUser.id)
  return c.json({ applications })
}

export async function listPendingSellerApplicationsController(c: Context<AppBindings>) {
  const applications = await listPendingSellerApplications()
  return c.json({ applications })
}

export async function approveSellerApplicationController(c: Context<AppBindings>) {
  const applicationId = c.req.param('id')
  if (!applicationId) {
    return c.json({ error: 'ID pengajuan wajib' }, 400)
  }

  const result = await approveSellerApplication(applicationId)
  if (!result.ok) {
    return c.json({ error: result.error }, result.status)
  }

  return c.json({
    application: result.application,
    shop: result.shop,
  })
}

export async function rejectSellerApplicationController(c: Context<AppBindings>) {
  const applicationId = c.req.param('id')
  if (!applicationId) {
    return c.json({ error: 'ID pengajuan wajib' }, 400)
  }

  const body = await c.req.json().catch(() => null)
  const parsed = parseRejectSellerApplicationBody(body)

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400)
  }

  const result = await rejectSellerApplication(applicationId, parsed.data.rejection_reason)
  if (!result.ok) {
    return c.json({ error: result.error }, result.status)
  }

  return c.json({ application: result.application })
}
