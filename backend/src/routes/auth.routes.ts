import { Hono } from 'hono'

import {
  historiesController,
  loginController,
  logoutController,
  meController,
  registerController,
} from '../controllers/auth.controller.js'

import { requireAuth } from '../middleware/auth.middleware.js'

import { qrAuthRoutes } from './qr-auth.routes.js'

import type { AppBindings } from '../types/hono-env.js'

export const authRoutes = new Hono<AppBindings>()

authRoutes.post('/register', registerController)
authRoutes.post('/login', loginController)
authRoutes.get('/histories', requireAuth, historiesController)
authRoutes.get('/me', requireAuth, meController)
authRoutes.post('/logout', logoutController)
authRoutes.route('/qr', qrAuthRoutes)
