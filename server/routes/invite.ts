import { Hono } from 'hono'
import { prisma } from '../db.ts'
import { createClientSession } from '../lib/auth.ts'
import type { AppEnv } from '../lib/honoEnv.ts'

export const inviteRoute = new Hono<AppEnv>()

inviteRoute.get('/:token/redeem', async (c) => {
  const invite = await prisma.invite.findUnique({
    where: { token: c.req.param('token') },
  })
  if (!invite) return c.json({ error: 'Invalid invite link' }, 404)

  await createClientSession(c, invite.projectId)
  if (!invite.usedAt) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    })
  }

  return c.json({ ok: true })
})
