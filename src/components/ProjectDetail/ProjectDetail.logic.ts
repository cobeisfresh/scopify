import { useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'

type InviteDTO = {
  id: string
  token: string
  createdAt: string
  usedAt: string | null
}

type ProjectDetailResponse = {
  project: {
    id: string
    name: string
    clientName: string
    status: string
    language: 'en' | 'de'
    createdAt: string
  }
  enabledSectionIds: string[]
  invites: InviteDTO[]
}

export function useProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const projectQuery = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiFetch<ProjectDetailResponse>(`/admin/projects/${id}`),
    enabled: !!id,
  })

  const invalidateProject = () =>
    queryClient.invalidateQueries({ queryKey: ['project', id] })

  const sectionsMutation = useMutation({
    mutationFn: (sectionIds: string[]) =>
      apiFetch(`/admin/projects/${id}/sections`, {
        method: 'PATCH',
        body: JSON.stringify({ sectionIds }),
      }),
    onSuccess: invalidateProject,
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : 'Failed to update sections',
      ),
  })

  const inviteMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ invite: InviteDTO }>(`/admin/projects/${id}/invite`, {
        method: 'POST',
      }),
    onSuccess: () => {
      invalidateProject()
      toast.success('Invite link created')
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : 'Failed to create invite',
      ),
  })

  const languageMutation = useMutation({
    mutationFn: (language: 'en' | 'de') =>
      apiFetch(`/admin/projects/${id}/language`, {
        method: 'PATCH',
        body: JSON.stringify({ language }),
      }),
    onSuccess: invalidateProject,
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : 'Failed to update language',
      ),
  })

  const enabledSectionIds = new Set(projectQuery.data?.enabledSectionIds ?? [])

  const toggleSection = (sectionId: string, enabled: boolean) => {
    const next = new Set(enabledSectionIds)
    if (enabled) next.add(sectionId)
    else next.delete(sectionId)
    sectionsMutation.mutate([...next])
  }

  const copyInviteLink = async (token: string) => {
    const url = `${window.location.origin}/invite/${token}`
    await navigator.clipboard.writeText(url)
    toast.success('Invite link copied')
  }

  return {
    project: projectQuery.data?.project,
    enabledSectionIds,
    invites: projectQuery.data?.invites ?? [],
    isLoading: projectQuery.isLoading,
    toggleSection,
    generateInvite: () => inviteMutation.mutate(),
    copyInviteLink,
    updateLanguage: (language: 'en' | 'de') =>
      languageMutation.mutate(language),
  }
}
