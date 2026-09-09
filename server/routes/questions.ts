import { Hono } from 'hono'
import { z } from 'zod'
import { prisma } from '../db.ts'
import { parseQuestionnaire } from '../lib/importQuestionnaire.ts'
import type { AppEnv } from '../lib/honoEnv.ts'

const questionInputSchema = z.object({
  textEn: z.string().min(1),
  textDe: z.string().min(1),
  notesEn: z.string().nullable().optional(),
  notesDe: z.string().nullable().optional(),
  recommendationEn: z.string().nullable().optional(),
  recommendationDe: z.string().nullable().optional(),
  assumptionsEn: z.string().nullable().optional(),
  assumptionsDe: z.string().nullable().optional(),
})

const commitSchema = z.object({
  sections: z.array(
    z.object({
      nameEn: z.string().min(1),
      nameDe: z.string().min(1),
      questions: z.array(questionInputSchema),
    }),
  ),
})

const questionUpdateSchema = questionInputSchema.partial()

const manualQuestionSchema = questionInputSchema.extend({
  sectionId: z.string().min(1),
})

const reorderSchema = z.object({
  updates: z.array(
    z.object({ id: z.string().min(1), order: z.number().int() }),
  ),
})

export const questionsRoute = new Hono<AppEnv>()

questionsRoute.post('/import', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return c.json(
      { error: 'Expected a "file" field with the .xlsx upload' },
      400,
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const parsed = parseQuestionnaire(buffer)
    return c.json(parsed)
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to parse workbook',
      },
      400,
    )
  }
})

questionsRoute.post('/commit', async (c) => {
  const body = commitSchema.parse(await c.req.json())

  await prisma.$transaction(async (tx) => {
    await tx.changeRequest.deleteMany()
    await tx.answer.deleteMany()
    await tx.projectSection.deleteMany()
    await tx.question.deleteMany()
    await tx.section.deleteMany()

    for (const [sectionOrder, section] of body.sections.entries()) {
      await tx.section.create({
        data: {
          nameEn: section.nameEn,
          nameDe: section.nameDe,
          order: sectionOrder,
          questions: {
            create: section.questions.map((question, questionOrder) => ({
              order: questionOrder,
              ...question,
            })),
          },
        },
      })
    }
  })

  return c.json({ ok: true })
})

questionsRoute.get('/', async (c) => {
  const sections = await prisma.section.findMany({
    orderBy: { order: 'asc' },
    include: { questions: { orderBy: { order: 'asc' } } },
  })
  return c.json({ sections })
})

questionsRoute.post('/', async (c) => {
  const body = manualQuestionSchema.parse(await c.req.json())

  const lastQuestion = await prisma.question.findFirst({
    where: { sectionId: body.sectionId },
    orderBy: { order: 'desc' },
  })

  const question = await prisma.question.create({
    data: { ...body, order: (lastQuestion?.order ?? -1) + 1 },
  })

  return c.json({ question })
})

questionsRoute.patch('/reorder', async (c) => {
  const body = reorderSchema.parse(await c.req.json())

  await prisma.$transaction(
    body.updates.map((update) =>
      prisma.question.update({
        where: { id: update.id },
        data: { order: update.order },
      }),
    ),
  )

  return c.json({ ok: true })
})

questionsRoute.patch('/:id', async (c) => {
  const body = questionUpdateSchema.parse(await c.req.json())
  const question = await prisma.question.update({
    where: { id: c.req.param('id') },
    data: body,
  })
  return c.json({ question })
})

questionsRoute.delete('/:id', async (c) => {
  await prisma.question.delete({ where: { id: c.req.param('id') } })
  return c.json({ ok: true })
})
