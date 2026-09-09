import { Hono } from 'hono'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../db.ts'
import type { AppEnv } from '../lib/honoEnv.ts'

const createProjectSchema = z.object({
  name: z.string().min(1),
  clientName: z.string().min(1),
})

const sectionsSchema = z.object({
  sectionIds: z.array(z.string().min(1)),
})

export const projectsRoute = new Hono<AppEnv>()

projectsRoute.post('/', async (c) => {
  const body = createProjectSchema.parse(await c.req.json())
  const project = await prisma.project.create({
    data: { ...body, status: 'draft', ownerId: c.get('staffUserId') },
  })
  return c.json({ project })
})

projectsRoute.get('/', async (c) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return c.json({ projects })
})

projectsRoute.get('/:id', async (c) => {
  const project = await prisma.project.findUnique({
    where: { id: c.req.param('id') },
    include: { sections: true, invites: { orderBy: { createdAt: 'desc' } } },
  })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  return c.json({
    project: {
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      status: project.status,
      createdAt: project.createdAt,
    },
    enabledSectionIds: project.sections.map((section) => section.sectionId),
    invites: project.invites,
  })
})

projectsRoute.patch('/:id/sections', async (c) => {
  const body = sectionsSchema.parse(await c.req.json())
  const projectId = c.req.param('id')

  await prisma.$transaction([
    prisma.projectSection.deleteMany({ where: { projectId } }),
    prisma.projectSection.createMany({
      data: body.sectionIds.map((sectionId) => ({ projectId, sectionId })),
    }),
  ])

  return c.json({ ok: true })
})

projectsRoute.post('/:id/invite', async (c) => {
  const projectId = c.req.param('id')
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const invite = await prisma.invite.create({
    data: { token: uuidv4(), projectId },
  })

  if (project.status === 'draft') {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'awaiting_client' },
    })
  }

  return c.json({ invite })
})
