import { Hono } from 'hono'

import {
  getMyShopController,
  getShopBySlugController,
  updateMyShopController,
} from '../controllers/shops.controller.js'

import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

import type { AppBindings } from '../types/hono-env.js'

export const shopsRoutes = new Hono<AppBindings>()

shopsRoutes.get('/public/:slug', getShopBySlugController)

shopsRoutes.get('/me', requireAuth, requireRole(['seller']), getMyShopController)
shopsRoutes.patch('/me', requireAuth, requireRole(['seller']), updateMyShopController)
