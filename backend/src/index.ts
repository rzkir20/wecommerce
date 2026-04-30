/**
 * Cloudflare Worker (stub). API penuh + MySQL: `pnpm dev` (Node).
 */
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) =>
  c.json({
    ok: true,
    message: 'Worker stub — gunakan server Node (pnpm dev) untuk auth + MySQL',
  }),
)

export default app
