import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/api/*', cors({ origin: process.env.CORS_ORIGIN ?? '*' }))

app.get('/api/health', (c) => c.json({ ok: true }))

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port })
