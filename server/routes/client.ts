import { Hono } from 'hono'
import { z } from 'zod'
import { prisma } from '../db.ts'
import type { AppEnv } from '../lib/honoEnv.ts'

const answerSchema = z.object({
  text: z.string(),
  usedRecommendation: z.boolean().optional(),
})

export const clientRoute = new Hono<AppEnv>()

clientRoute.get('/project', async (c) => {
  const projectId = c.get('clientProjectId')
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
  })

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

  const changeRequests = await prisma.changeRequest.findMany({
    where: { projectId, status: 'open' },
  })
  const changeRequestByQuestionId = new Map(
    changeRequests.map((cr) => [cr.questionId, cr]),
  )

  const sections = projectSections.map(({ section }) => ({
    id: section.id,
    nameEn: section.nameEn,
    nameDe: section.nameDe,
    order: section.order,
    questions: section.questions.map((question) => ({
      ...question,
      answer: answerByQuestionId.get(question.id) ?? null,
      openChangeRequest: changeRequestByQuestionId.get(question.id) ?? null,
    })),
  }))

  return c.json({
    project: {
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      status: project.status,
      language: project.language,
    },
    sections,
  })
})

clientRoute.put('/answers/:questionId', async (c) => {
  const projectId = c.get('clientProjectId')
  const questionId = c.req.param('questionId')
  const body = answerSchema.parse(await c.req.json())

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  })
  if (!question) return c.json({ error: 'Question not found' }, 404)

  const projectSection = await prisma.projectSection.findUnique({
    where: {
      projectId_sectionId: { projectId, sectionId: question.sectionId },
    },
  })
  if (!projectSection)
    return c.json({ error: 'Question not part of this project' }, 403)

  const answer = await prisma.answer.upsert({
    where: { projectId_questionId: { projectId, questionId } },
    update: {
      text: body.text,
      usedRecommendation: body.usedRecommendation ?? false,
    },
    create: {
      projectId,
      questionId,
      text: body.text,
      usedRecommendation: body.usedRecommendation ?? false,
    },
  })

  return c.json({ answer })
})

clientRoute.post('/submit', async (c) => {
  const projectId = c.get('clientProjectId')
  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'submitted' },
  })
  return c.json({ ok: true })
})
