export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers:
      init?.body instanceof FormData
        ? undefined
        : { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(
      body?.error ?? `Request to ${path} failed with status ${response.status}`,
    )
  }

  return response.json() as Promise<T>
}
