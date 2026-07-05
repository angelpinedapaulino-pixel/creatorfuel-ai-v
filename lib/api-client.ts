export interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
}

/** Client-side fetch wrapper that normalizes the { success, data, error } envelope. */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...(options ?? {}),
  })

  let json: ApiResult<T> | null = null
  try {
    json = await res.json()
  } catch {
    json = null
  }

  if (!res.ok || !json?.success) {
    throw new Error(json?.error || 'Request failed. Please try again.')
  }

  return (json?.data ?? ({} as T))
}
