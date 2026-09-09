import { v4 as uuidv4 } from 'uuid'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Context, Next } from 'hono'
import { prisma } from '../db.ts'

const STAFF_COOKIE = 'staff_session'
const CLIENT_COOKIE = 'client_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'Lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  }
}

export async function createStaffSession(c: Context, staffUserId: string) {
  const session = await prisma.session.create({
    data: {
      id: uuidv4(),
      subjectType: 'staff',
      staffUserId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  })
  setCookie(c, STAFF_COOKIE, session.id, cookieOptions())
}

export async function createClientSession(c: Context, projectId: string) {
  const session = await prisma.session.create({
    data: {
      id: uuidv4(),
      subjectType: 'client',
      projectId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  })
  setCookie(c, CLIENT_COOKIE, session.id, cookieOptions())
}

export function clearStaffSession(c: Context) {
  deleteCookie(c, STAFF_COOKIE, { path: '/' })
}

export function clearClientSession(c: Context) {
  deleteCookie(c, CLIENT_COOKIE, { path: '/' })
}

async function loadSession(
  sessionId: string | undefined,
  subjectType: 'staff' | 'client',
) {
  if (!sessionId) return null
  const session = await prisma.session.findUnique({ where: { id: sessionId } })
  if (
    !session ||
    session.subjectType !== subjectType ||
    session.expiresAt < new Date()
  )
    return null
  return session
}

export async function requireStaff(c: Context, next: Next) {
  const session = await loadSession(getCookie(c, STAFF_COOKIE), 'staff')
  if (!session?.staffUserId) return c.json({ error: 'Not authenticated' }, 401)
  c.set('staffUserId', session.staffUserId)
  await next()
}

export async function requireClient(c: Context, next: Next) {
  const session = await loadSession(getCookie(c, CLIENT_COOKIE), 'client')
  if (!session?.projectId) return c.json({ error: 'Not authenticated' }, 401)
  c.set('clientProjectId', session.projectId)
  await next()
}

export type SessionSubject =
  { type: 'staff'; staffUserId: string } | { type: 'client'; projectId: string }

export async function getSessionSubject(
  c: Context,
): Promise<SessionSubject | null> {
  const staffSession = await loadSession(getCookie(c, STAFF_COOKIE), 'staff')
  if (staffSession?.staffUserId)
    return { type: 'staff', staffUserId: staffSession.staffUserId }

  const clientSession = await loadSession(getCookie(c, CLIENT_COOKIE), 'client')
  if (clientSession?.projectId)
    return { type: 'client', projectId: clientSession.projectId }

  return null
}
