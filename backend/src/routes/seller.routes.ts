import { Hono } from 'hono'

import {
  approveSellerApplicationController,
  createSellerApplicationController,
  listMySellerApplicationsController,
  listPendingSellerApplicationsController,
  rejectSellerApplicationController,
} from '../controllers/seller_applications.controller.js'

import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

import type { AppBindings } from '../types/hono-env.js'

export const sellerRoutes = new Hono<AppBindings>()

sellerRoutes.post('/applications', requireAuth, createSellerApplicationController)
sellerRoutes.get('/applications/me', requireAuth, listMySellerApplicationsController)

sellerRoutes.get(
  '/applications/pending',
  requireAuth,
  requireRole(['super_admins']),
  listPendingSellerApplicationsController
)

sellerRoutes.patch(
  '/applications/:id/approve',
  requireAuth,
  requireRole(['super_admins']),
  approveSellerApplicationController
)

sellerRoutes.patch(
  '/applications/:id/reject',
  requireAuth,
  requireRole(['super_admins']),
  rejectSellerApplicationController
)
