import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import type {
  Language,
  NewQuestionInput,
  QuestionEditPatch,
  SectionDTO,
} from '@/components/QuestionTable/QuestionTable.types'

type ParsedQuestion = {
  textEn: string
  textDe: string
  notesEn: string | null
  notesDe: string | null
  recommendationEn: string | null
  recommendationDe: string | null
  assumptionsEn: string | null
  assumptionsDe: string | null
}

type ParsedSection = {
  nameEn: string
  nameDe: string
  questions: ParsedQuestion[]
}
type ImportResponse = { sections: ParsedSection[] }

function withIds(sections: ParsedSection[]): SectionDTO[] {
  return sections.map((section, sectionIndex) => ({
    id: uuidv4(),
    order: sectionIndex,
    nameEn: section.nameEn,
    nameDe: section.nameDe,
    questions: section.questions.map((question, questionIndex) => ({
      id: uuidv4(),
      order: questionIndex,
      ...question,
    })),
  }))
}

export function useQuestionImport() {
  const [sections, setSections] = useState<SectionDTO[] | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [isUploading, setIsUploading] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [committed, setCommitted] = useState(false)

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await apiFetch<ImportResponse>('/admin/questions/import', {
        method: 'POST',
        body: formData,
      })
      setSections(withIds(result.sections))
      setCommitted(false)
      toast.success(`Parsed ${result.sections.length} sections`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to parse workbook',
      )
    } finally {
      setIsUploading(false)
    }
  }

  const editQuestion = (questionId: string, patch: QuestionEditPatch) => {
    setSections(
      (current) =>
        current?.map((section) => ({
          ...section,
          questions: section.questions.map((question) =>
            question.id === questionId ? { ...question, ...patch } : question,
          ),
        })) ?? current,
    )
  }

  const deleteQuestion = (questionId: string) => {
    setSections(
      (current) =>
        current?.map((section) => ({
          ...section,
          questions: section.questions.filter(
            (question) => question.id !== questionId,
          ),
        })) ?? current,
    )
  }

  const moveQuestion = (
    sectionId: string,
    questionId: string,
    direction: 'up' | 'down',
  ) => {
    setSections(
      (current) =>
        current?.map((section) => {
          if (section.id !== sectionId) return section
          const index = section.questions.findIndex(
            (question) => question.id === questionId,
          )
          const targetIndex = direction === 'up' ? index - 1 : index + 1
          if (
            index === -1 ||
            targetIndex < 0 ||
            targetIndex >= section.questions.length
          )
            return section
          const questions = [...section.questions]
          ;[questions[index], questions[targetIndex]] = [
            questions[targetIndex],
            questions[index],
          ]
          return { ...section, questions }
        }) ?? current,
    )
  }

  const addQuestion = (sectionId: string, input: NewQuestionInput) => {
    setSections(
      (current) =>
        current?.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                questions: [
                  ...section.questions,
                  {
                    id: uuidv4(),
                    order: section.questions.length,
                    textEn: input.textEn,
                    textDe: input.textDe,
                    notesEn: null,
                    notesDe: null,
                    recommendationEn: null,
                    recommendationDe: null,
                    assumptionsEn: null,
                    assumptionsDe: null,
                  },
                ],
              }
            : section,
        ) ?? current,
    )
  }

  const commit = async () => {
    if (!sections) return
    setIsCommitting(true)
    try {
      await apiFetch('/admin/questions/commit', {
        method: 'POST',
        body: JSON.stringify({
          sections: sections.map((section) => ({
            nameEn: section.nameEn,
            nameDe: section.nameDe,
            questions: section.questions.map((question) => ({
              textEn: question.textEn,
              textDe: question.textDe,
              notesEn: question.notesEn,
              notesDe: question.notesDe,
              recommendationEn: question.recommendationEn,
              recommendationDe: question.recommendationDe,
              assumptionsEn: question.assumptionsEn,
              assumptionsDe: question.assumptionsDe,
            })),
          })),
        }),
      })
      setCommitted(true)
      toast.success('Question bank updated')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save question bank',
      )
    } finally {
      setIsCommitting(false)
    }
  }

  return {
    sections,
    language,
    setLanguage,
    isUploading,
    isCommitting,
    committed,
    uploadFile,
    editQuestion,
    deleteQuestion,
    moveQuestion,
    addQuestion,
    commit,
  }
}
