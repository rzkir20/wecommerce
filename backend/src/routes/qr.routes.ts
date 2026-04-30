import { Hono } from 'hono'

import * as QrController from '../controllers/qr.controller.js'

import { requireAuth } from '../middleware/auth.middleware.js'

export const qrRoutes = new Hono()
    .post('/init', QrController.initQrLogin)
    .post('/scan', requireAuth, QrController.scanQrLogin)
    .get('/status/:qrToken', QrController.getQrLoginStatus)
