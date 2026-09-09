import { Navigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export function InviteRedeem() {
  const { token } = useParams<{ token: string }>()

  const { isSuccess, isError } = useQuery({
    queryKey: ['invite-redeem', token],
    queryFn: () => apiFetch(`/invite/${token}/redeem`, { method: 'GET' }),
    enabled: !!token,
    retry: false,
  })

  if (isSuccess) return <Navigate to="/client" replace />

  if (isError || !token) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-2 p-8 text-center">
        <h1 className="text-xl font-semibold">Invite link not valid</h1>
        <p className="text-sm text-muted-foreground">
          Ask your COBE contact for a new link.
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 text-sm text-muted-foreground">Signing you in…</div>
  )
}
