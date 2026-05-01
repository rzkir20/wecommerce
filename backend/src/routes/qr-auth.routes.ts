import { Hono } from 'hono'

import {
  approveQrLoginController,
  qrLoginStatusController,
  startQrLoginController,
} from '../controllers/qr-auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import type { AppBindings } from '../types/hono-env.js'

export const qrAuthRoutes = new Hono<AppBindings>()

qrAuthRoutes.post('/start', startQrLoginController)
qrAuthRoutes.get('/status/:token', qrLoginStatusController)
qrAuthRoutes.post('/approve', requireAuth, approveQrLoginController)
