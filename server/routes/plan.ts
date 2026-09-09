import { Hono } from 'hono'
import { prisma } from '../db.ts'
import { getSessionSubject } from '../lib/auth.ts'
import type { AppEnv } from '../lib/honoEnv.ts'

export const planRoute = new Hono<AppEnv>()

planRoute.get('/:id/agreed-plan', async (c) => {
  const projectId = c.req.param('id')

  const subject = await getSessionSubject(c)
  if (!subject) return c.json({ error: 'Not authenticated' }, 401)
  if (subject.type === 'client' && subject.projectId !== projectId) {
    return c.json({ error: 'Not authorized for this project' }, 403)
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.status !== 'agreed')
    return c.json({ error: 'This project has not been agreed yet' }, 403)

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

  const sections = projectSections.map(({ section }) => ({
    id: section.id,
    nameEn: section.nameEn,
    nameDe: section.nameDe,
    order: section.order,
    questions: section.questions.map((question) => ({
      id: question.id,
      order: question.order,
      textEn: question.textEn,
      textDe: question.textDe,
      answerText: answerByQuestionId.get(question.id)?.text ?? '',
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
