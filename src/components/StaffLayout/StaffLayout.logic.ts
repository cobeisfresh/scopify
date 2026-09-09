import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useStaffAuth } from '@/lib/auth'

export function useStaffLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data } = useStaffAuth()

  const logout = async () => {
    await apiFetch('/auth/staff/logout', { method: 'POST' })
    await queryClient.invalidateQueries({ queryKey: ['auth', 'staff'] })
    navigate('/staff/login')
  }

  return { staffUser: data?.staffUser, logout }
}
