import type { Context } from 'hono'

import { parseUpdateShopBody } from '../middleware/shops.middleware.js'
import { getShopBySlug, getShopForUser, updateShopForUser } from '../services/shops.service.js'

import type { AppBindings } from '../types/hono-env.js'

export async function getShopBySlugController(c: Context) {
  const slug = c.req.param('slug')
  if (!slug) {
    return c.json({ error: 'Slug wajib' }, 400)
  }

  const shop = await getShopBySlug(slug)
  if (!shop || shop.status !== 'active') {
    return c.json({ error: 'Toko tidak ditemukan' }, 404)
  }

  return c.json({ shop })
}

export async function getMyShopController(c: Context<AppBindings>) {
  const authUser = c.get('authUser')
  const shop = await getShopForUser(authUser.id)

  if (!shop) {
    return c.json({ error: 'Toko tidak ditemukan' }, 404)
  }

  return c.json({ shop })
}

export async function updateMyShopController(c: Context<AppBindings>) {
  const authUser = c.get('authUser')
  const body = await c.req.json().catch(() => null)
  const parsed = parseUpdateShopBody(body)

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400)
  }

  const result = await updateShopForUser(authUser.id, parsed.data)
  if (!result.ok) {
    return c.json({ error: result.error }, result.status)
  }

  return c.json({ shop: result.shop })
}
