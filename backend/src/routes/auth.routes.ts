import { Hono } from 'hono'

import * as AuthController from '../controllers/auth.controller.js'

import { requireAuth } from '../middleware/auth.middleware.js'

export const authRoutes = new Hono()
  .post('/register', AuthController.register)
  .post('/login', AuthController.login)
  .post('/logout', AuthController.logout)
  .get('/me', requireAuth, AuthController.me)

export type { AuthUser } from '../controllers/auth.controller.js'
