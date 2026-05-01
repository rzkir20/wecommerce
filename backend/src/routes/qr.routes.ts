import { Hono } from 'hono'

import {
  approveQrLoginController,
  qrLoginStatusController,
  startQrLoginController,
} from '../controllers/qr-auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import type { AppBindings } from '../types/hono-env.js'

export const qrRoutes = new Hono<AppBindings>()

// Legacy endpoints used by frontend app.
qrRoutes.post('/init', startQrLoginController)
qrRoutes.get('/status/:token', qrLoginStatusController)
qrRoutes.post('/scan', requireAuth, approveQrLoginController)
