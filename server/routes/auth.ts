import { Hono } from 'hono'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../db.ts'
import {
  clearClientSession,
  clearStaffSession,
  createStaffSession,
  requireClient,
  requireStaff,
} from '../lib/auth.ts'
import type { AppEnv } from '../lib/honoEnv.ts'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authRoute = new Hono<AppEnv>()

authRoute.post('/staff/login', async (c) => {
  const { email, password } = loginSchema.parse(await c.req.json())
  const staffUser = await prisma.staffUser.findUnique({ where: { email } })
  if (!staffUser || !(await bcrypt.compare(password, staffUser.passwordHash))) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }
  await createStaffSession(c, staffUser.id)
  return c.json({
    staffUser: {
      id: staffUser.id,
      email: staffUser.email,
      name: staffUser.name,
    },
  })
})

authRoute.post('/staff/logout', requireStaff, async (c) => {
  clearStaffSession(c)
  return c.json({ ok: true })
})

authRoute.get('/staff/me', requireStaff, async (c) => {
  const staffUser = await prisma.staffUser.findUniqueOrThrow({
    where: { id: c.get('staffUserId') },
  })
  return c.json({
    staffUser: {
      id: staffUser.id,
      email: staffUser.email,
      name: staffUser.name,
    },
  })
})

authRoute.post('/client/logout', requireClient, async (c) => {
  clearClientSession(c)
  return c.json({ ok: true })
})

authRoute.get('/client/me', requireClient, async (c) => {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: c.get('clientProjectId') },
  })
  return c.json({
    project: {
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      status: project.status,
    },
  })
})
