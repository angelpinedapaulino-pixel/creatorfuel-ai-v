'use client'

import Link from 'next/link'
import { ArrowRight, Brain, Sparkles, CheckCircle2 } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { GENERATOR_TOOLS } from '@/lib/generators'
import { ToolIcon } from '@/components/generator/icon-map'
import { CreditPill } from '@/components/generator/credit-pill'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { BusinessBrainData } from '@/types'

export default function AIGeneratorHub() {
  const { data, loading } = useApi<{ brain: BusinessBrainData | null }>('/api/business-brain')
  const brain = data?.brain ?? null
  const hasBrain = Boolean(brain?.businessName)

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">AI Generator</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seven AI tools that turn your Business Brain into scroll-stopping content in seconds.
          </p>
        </div>
        <CreditPill />
      </div>

      {/* Business Brain status */}
      {loading ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : hasBrain ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary/10 p-4 ring-1 ring-primary/20">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary"><CheckCircle2 className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold">Using your Business Brain: {brain?.businessName}</p>
              <p className="text-xs text-muted-foreground">Every generation is automatically personalized to your brand.</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm"><Link href="/dashboard/business-brain">Edit profile</Link></Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><Brain className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold">Set up your Business Brain first</p>
              <p className="text-xs text-muted-foreground">Tools work without it, but results are far better when personalized.</p>
            </div>
          </div>
          <Button asChild size="sm"><Link href="/dashboard/business-brain">Set up now <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      )}

      {/* Tools grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GENERATOR_TOOLS.map((tool) => (
          <Link
            key={tool.id}
            href={`/dashboard/ai-generator/${tool.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/60 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-primary/40"
          >
            <span
              className="mb-4 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md"
              style={{ backgroundImage: `linear-gradient(135deg, ${tool.accentFrom}, ${tool.accentTo})` }}
            >
              <ToolIcon name={tool.icon} className="h-6 w-6" />
            </span>
            <h3 className="font-display text-base font-semibold">{tool.name}</h3>
            <p className="mt-0.5 text-xs font-medium text-primary">{tool.tagline}</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Open tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-secondary/40 p-4 text-xs text-muted-foreground ring-1 ring-border/50">
        <Sparkles className="h-4 w-4 text-primary" />
        Each generation uses <span className="font-semibold text-foreground">1 credit</span>. Results are saved to your History automatically and can be saved as Projects.
      </div>
    </div>
  )
}
