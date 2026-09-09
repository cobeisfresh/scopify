import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'

export type ProjectSummary = {
  id: string
  name: string
  clientName: string
  status: string
  createdAt: string
}

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  clientName: z.string().min(1, 'Client name is required'),
})

type CreateProjectValues = z.infer<typeof createProjectSchema>

export function useStaffDashboard() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<{ projects: ProjectSummary[] }>('/admin/projects'),
  })

  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', clientName: '' },
  })

  const createMutation = useMutation({
    mutationFn: (values: CreateProjectValues) =>
      apiFetch<{ project: ProjectSummary }>('/admin/projects', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: ({ project }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created')
      navigate(`/staff/projects/${project.id}`)
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : 'Failed to create project',
      ),
  })

  const onSubmit = form.handleSubmit((values) => createMutation.mutate(values))

  return {
    projects: data?.projects ?? [],
    isLoading,
    form,
    onSubmit,
  }
}
