'use client'

import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api-client'

export function useApi<T = unknown>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(url))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    try {
      const result = await apiFetch<T>(url)
      setData(result)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, refetch: load, setData }
}
