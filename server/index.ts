import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requireClient, requireStaff } from './lib/auth.ts'
import type { AppEnv } from './lib/honoEnv.ts'
import { authRoute } from './routes/auth.ts'
import { clientRoute } from './routes/client.ts'
import { inviteRoute } from './routes/invite.ts'
import { planRoute } from './routes/plan.ts'
import { projectsRoute } from './routes/projects.ts'
import { questionsRoute } from './routes/questions.ts'
import { reviewRoute } from './routes/review.ts'

const app = new Hono<AppEnv>()

app.use('/api/*', cors({ origin: process.env.CORS_ORIGIN ?? '*' }))

app.get('/api/health', (c) => c.json({ ok: true }))

app.route('/api/auth', authRoute)
app.route('/api/invite', inviteRoute)

app.use('/api/admin/*', requireStaff)
app.route('/api/admin/questions', questionsRoute)
app.route('/api/admin/projects', projectsRoute)
app.route('/api/admin', reviewRoute)

app.use('/api/client/*', requireClient)
app.route('/api/client', clientRoute)

app.route('/api/projects', planRoute)

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port })
