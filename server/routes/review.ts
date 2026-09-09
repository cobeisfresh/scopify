import { Hono } from 'hono'
import { z } from 'zod'
import { prisma } from '../db.ts'
import type { AppEnv } from '../lib/honoEnv.ts'

const changeRequestSchema = z.object({
  projectId: z.string().min(1),
  comment: z.string().min(1),
})

export const reviewRoute = new Hono<AppEnv>()

reviewRoute.get('/projects/:id/answers', async (c) => {
  const projectId = c.req.param('id')
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)

  const projectSections = await prisma.projectSection.findMany({
    where: { projectId },
    include: {
      section: { include: { questions: { orderBy: { order: 'asc' } } } },
    },
    orderBy: { section: { order: 'asc' } },
  })

  const answers = await prisma.answer.findMany({ where: { projectId } })
  const answerByQuestionId = new Map(
    answers.map((answer) => [answer.questionId, answer]),
  )

  const openChangeRequests = await prisma.changeRequest.findMany({
    where: { projectId, status: 'open' },
  })
  const openChangeRequestByQuestionId = new Map(
    openChangeRequests.map((cr) => [cr.questionId, cr]),
  )

  const sections = projectSections.map(({ section }) => ({
    id: section.id,
    nameEn: section.nameEn,
    nameDe: section.nameDe,
    order: section.order,
    questions: section.questions.map((question) => ({
      ...question,
      answer: answerByQuestionId.get(question.id) ?? null,
      openChangeRequest: openChangeRequestByQuestionId.get(question.id) ?? null,
    })),
  }))

  return c.json({
    project: {
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      status: project.status,
    },
    sections,
  })
})

reviewRoute.post('/projects/:id/accept', async (c) => {
  const project = await prisma.project.update({
    where: { id: c.req.param('id') },
    data: { status: 'agreed' },
  })
  return c.json({ project })
})

reviewRoute.post('/questions/:id/change-request', async (c) => {
  const questionId = c.req.param('id')
  const body = changeRequestSchema.parse(await c.req.json())

  const changeRequest = await prisma.changeRequest.create({
    data: {
      projectId: body.projectId,
      questionId,
      comment: body.comment,
      status: 'open',
    },
  })

  await prisma.project.update({
    where: { id: body.projectId },
    data: { status: 'awaiting_client' },
  })

  return c.json({ changeRequest })
})

reviewRoute.post('/change-requests/:id/resolve', async (c) => {
  const changeRequest = await prisma.changeRequest.update({
    where: { id: c.req.param('id') },
    data: { status: 'resolved' },
  })
  return c.json({ changeRequest })
})
