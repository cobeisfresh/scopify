import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import type {
  Language,
  NewQuestionInput,
  QuestionEditPatch,
  SectionDTO,
} from '@/components/QuestionTable/QuestionTable.types'

const QUESTIONS_QUERY_KEY = ['questions'] as const

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function useQuestionBank() {
  const queryClient = useQueryClient()
  const [language, setLanguage] = useState<Language>('en')

  const { data, isLoading } = useQuery({
    queryKey: QUESTIONS_QUERY_KEY,
    queryFn: () => apiFetch<{ sections: SectionDTO[] }>('/admin/questions'),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY })

  const editMutation = useMutation({
    mutationFn: ({
      questionId,
      patch,
    }: {
      questionId: string
      patch: QuestionEditPatch
    }) =>
      apiFetch(`/admin/questions/${questionId}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      invalidate()
      toast.success('Question updated')
    },
    onError: (error) =>
      toast.error(errorMessage(error, 'Failed to update question')),
  })

  const deleteMutation = useMutation({
    mutationFn: (questionId: string) =>
      apiFetch(`/admin/questions/${questionId}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidate()
      toast.success('Question deleted')
    },
    onError: (error) =>
      toast.error(errorMessage(error, 'Failed to delete question')),
  })

  const addMutation = useMutation({
    mutationFn: ({
      sectionId,
      input,
    }: {
      sectionId: string
      input: NewQuestionInput
    }) =>
      apiFetch('/admin/questions', {
        method: 'POST',
        body: JSON.stringify({
          sectionId,
          textEn: input.textEn,
          textDe: input.textDe,
        }),
      }),
    onSuccess: () => {
      invalidate()
      toast.success('Question added')
    },
    onError: (error) =>
      toast.error(errorMessage(error, 'Failed to add question')),
  })

  const reorderMutation = useMutation({
    mutationFn: (updates: { id: string; order: number }[]) =>
      apiFetch('/admin/questions/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ updates }),
      }),
    onSuccess: () => invalidate(),
    onError: (error) =>
      toast.error(errorMessage(error, 'Failed to reorder questions')),
  })

  const moveQuestion = (
    sectionId: string,
    questionId: string,
    direction: 'up' | 'down',
  ) => {
    const section = data?.sections.find(
      (candidate) => candidate.id === sectionId,
    )
    if (!section) return
    const index = section.questions.findIndex(
      (question) => question.id === questionId,
    )
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (
      index === -1 ||
      targetIndex < 0 ||
      targetIndex >= section.questions.length
    )
      return
    const current = section.questions[index]
    const target = section.questions[targetIndex]
    reorderMutation.mutate([
      { id: current.id, order: target.order },
      { id: target.id, order: current.order },
    ])
  }

  return {
    sections: data?.sections ?? [],
    isLoading,
    language,
    setLanguage,
    editQuestion: (questionId: string, patch: QuestionEditPatch) =>
      editMutation.mutate({ questionId, patch }),
    deleteQuestion: (questionId: string) => deleteMutation.mutate(questionId),
    addQuestion: (sectionId: string, input: NewQuestionInput) =>
      addMutation.mutate({ sectionId, input }),
    moveQuestion,
  }
}
