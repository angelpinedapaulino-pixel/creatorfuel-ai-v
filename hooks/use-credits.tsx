'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api-client'
import type { CreditsInfo } from '@/types'

interface CreditsContextValue {
  credits: CreditsInfo | null
  plan: string
  isPaid: boolean
  loading: boolean
  refetch: () => Promise<void>
  setCredits: (c: CreditsInfo | null) => void
}

const CreditsContext = createContext<CreditsContextValue | undefined>(undefined)

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<CreditsInfo | null>(null)
  const [plan, setPlan] = useState<string>('FREE')
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ credits: CreditsInfo | null; plan?: string }>('/api/credits')
      setCredits(data?.credits ?? null)
      setPlan(data?.plan ?? 'FREE')
    } catch {
      setCredits(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <CreditsContext.Provider value={{ credits, plan, isPaid: plan !== 'FREE', loading, refetch, setCredits }}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits(): CreditsContextValue {
  const ctx = useContext(CreditsContext)
  if (!ctx) throw new Error('useCredits must be used within a CreditsProvider')
  return ctx
}
