import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export type StaffUser = { id: string; email: string; name: string }
export type ClientProject = {
  id: string
  name: string
  clientName: string
  status: string
}

export function useStaffAuth() {
  return useQuery({
    queryKey: ['auth', 'staff'],
    queryFn: () => apiFetch<{ staffUser: StaffUser }>('/auth/staff/me'),
    retry: false,
  })
}

export function useClientAuth() {
  return useQuery({
    queryKey: ['auth', 'client'],
    queryFn: () => apiFetch<{ project: ClientProject }>('/auth/client/me'),
    retry: false,
  })
}
