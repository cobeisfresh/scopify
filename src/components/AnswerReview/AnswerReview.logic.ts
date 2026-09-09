import { useState } from 'react'
import { useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import type { Language } from '@/components/QuestionTable/QuestionTable.types'
import type { ClientProjectResponse } from '@/components/ClientAnswers/ClientAnswers.types'

export function useAnswerReview() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [language, setLanguage] = useState<Language>('en')

  const queryKey = ['review', id] as const

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      apiFetch<ClientProjectResponse>(`/admin/projects/${id}/answers`),
    enabled: !!id,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const acceptMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/projects/${id}/accept`, { method: 'POST' }),
    onSuccess: () => {
      invalidate()
      toast.success('Plan agreed')
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Failed to accept'),
  })

  const changeRequestMutation = useMutation({
    mutationFn: ({
      questionId,
      comment,
    }: {
      questionId: string
      comment: string
    }) =>
      apiFetch(`/admin/questions/${questionId}/change-request`, {
        method: 'POST',
        body: JSON.stringify({ projectId: id, comment }),
      }),
    onSuccess: () => {
      invalidate()
      toast.success('Change requested')
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : 'Failed to request change',
      ),
  })

  const resolveMutation = useMutation({
    mutationFn: (changeRequestId: string) =>
      apiFetch(`/admin/change-requests/${changeRequestId}/resolve`, {
        method: 'POST',
      }),
    onSuccess: () => {
      invalidate()
      toast.success('Change request resolved')
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to resolve change request',
      ),
  })

  return {
    project: data?.project,
    sections: data?.sections ?? [],
    isLoading,
    language,
    setLanguage,
    requestChange: (questionId: string, comment: string) =>
      changeRequestMutation.mutate({ questionId, comment }),
    resolveChangeRequest: (changeRequestId: string) =>
      resolveMutation.mutate(changeRequestId),
    accept: () => acceptMutation.mutate(),
    isAccepting: acceptMutation.isPending,
  }
}
