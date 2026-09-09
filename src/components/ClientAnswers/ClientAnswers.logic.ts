import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import type { Language } from '@/components/QuestionTable/QuestionTable.types'
import type { ClientProjectResponse } from './ClientAnswers.types'

const PROJECT_QUERY_KEY = ['client', 'project'] as const

function buildValues(
  sections: ClientProjectResponse['sections'] | undefined,
): Record<string, string> {
  const values: Record<string, string> = {}
  for (const section of sections ?? []) {
    for (const question of section.questions) {
      values[question.id] = question.answer?.text ?? ''
    }
  }
  return values
}

export function useClientAnswers() {
  const queryClient = useQueryClient()
  const [language, setLanguage] = useState<Language>('en')

  const { data, isLoading } = useQuery({
    queryKey: PROJECT_QUERY_KEY,
    queryFn: () => apiFetch<ClientProjectResponse>('/client/project'),
  })

  const form = useForm<Record<string, string>>({
    values: buildValues(data?.sections),
    resetOptions: { keepDirtyValues: true },
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY })

  const saveMutation = useMutation({
    mutationFn: ({
      questionId,
      text,
      usedRecommendation,
    }: {
      questionId: string
      text: string
      usedRecommendation: boolean
    }) =>
      apiFetch(`/client/answers/${questionId}`, {
        method: 'PUT',
        body: JSON.stringify({ text, usedRecommendation }),
      }),
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : 'Failed to save answer',
      ),
  })

  const submitMutation = useMutation({
    mutationFn: () => apiFetch('/client/submit', { method: 'POST' }),
    onSuccess: () => {
      invalidate()
      toast.success('Submitted for review')
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Failed to submit'),
  })

  const saveAnswer = (questionId: string, usedRecommendation = false) => {
    saveMutation.mutate({
      questionId,
      text: form.getValues(questionId) ?? '',
      usedRecommendation,
    })
  }

  const applyRecommendation = (
    questionId: string,
    recommendationText: string,
  ) => {
    form.setValue(questionId, recommendationText, { shouldDirty: true })
    saveMutation.mutate({
      questionId,
      text: recommendationText,
      usedRecommendation: true,
    })
  }

  return {
    project: data?.project,
    sections: data?.sections ?? [],
    isLoading,
    language,
    setLanguage,
    form,
    saveAnswer,
    applyRecommendation,
    submit: () => submitMutation.mutate(),
    isSubmitting: submitMutation.isPending,
  }
}
