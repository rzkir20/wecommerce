import { Hono } from 'hono'

import {
  healthController,
  rootController,
  supabaseHealthController,
} from '../controllers/health.controller.js'

export const healthRoutes = new Hono()

healthRoutes.get('/', rootController)
healthRoutes.get('/health', healthController)
healthRoutes.get('/supabase/health', supabaseHealthController)
