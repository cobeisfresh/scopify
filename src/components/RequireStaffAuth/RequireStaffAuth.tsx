import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useStaffAuth } from '@/lib/auth'

export function RequireStaffAuth({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useStaffAuth()

  if (isLoading)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>
  if (isError || !data) return <Navigate to="/staff/login" replace />

  return children
}
