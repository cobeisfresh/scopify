import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

type AgreedPlanQuestion = {
  id: string
  order: number
  textEn: string
  textDe: string
  answerText: string
}
type AgreedPlanSection = {
  id: string
  nameEn: string
  nameDe: string
  order: number
  questions: AgreedPlanQuestion[]
}
type AgreedPlanResponse = {
  project: {
    id: string
    name: string
    clientName: string
    status: string
    language: 'en' | 'de'
  }
  sections: AgreedPlanSection[]
}

export function useAgreedPlan() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['agreed-plan', id],
    queryFn: () => apiFetch<AgreedPlanResponse>(`/projects/${id}/agreed-plan`),
    enabled: !!id,
    retry: false,
  })

  return {
    project: data?.project,
    sections: data?.sections ?? [],
    isLoading,
    isError,
    errorMessage: error instanceof Error ? error.message : undefined,
  }
}
