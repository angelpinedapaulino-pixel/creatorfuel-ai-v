'use client'

import { Zap } from 'lucide-react'
import { useCredits } from '@/hooks/use-credits'
import { Skeleton } from '@/components/ui/skeleton'

export function CreditPill() {
  const { credits, loading } = useCredits()
  if (loading) return <Skeleton className="h-9 w-28 rounded-full" />
  const remaining = credits?.remaining ?? 0
  const low = remaining <= 5
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 ${
        low ? 'bg-destructive/10 text-destructive ring-destructive/30' : 'bg-primary/10 text-primary ring-primary/25'
      }`}
    >
      <Zap className="h-4 w-4" />
      {remaining} <span className="font-normal text-muted-foreground">credits</span>
    </div>
  )
}
