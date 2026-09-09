import type { ReactNode } from 'react'
import { useClientAuth } from '@/lib/auth'

export function RequireClientAuth({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useClientAuth()

  if (isLoading)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  if (isError || !data) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-2 p-8 text-center">
        <h1 className="text-xl font-semibold">Not signed in</h1>
        <p className="text-sm text-muted-foreground">
          Use the invite link your COBE contact sent you.
        </p>
      </div>
    )
  }

  return children
}
