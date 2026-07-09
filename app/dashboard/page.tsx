'use client'

import Link from 'next/link'
import {
  Sparkles, CreditCard, FolderKanban, Brain, LayoutTemplate, Settings as SettingsIcon,
  Plus, ArrowRight, Activity, CheckCircle2, Crown, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi } from '@/hooks/use-api'
import { projectTypeLabel } from '@/lib/constants'
import type { DashboardStats } from '@/types'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })
  } catch {
    return ''
  }
}

const QUICK_ACTIONS = [
  { label: 'New Project', desc: 'Start creating content', href: '/dashboard/projects', icon: Plus },
  { label: 'Business Brain', desc: 'Tune your brand profile', href: '/dashboard/business-brain', icon: Brain },
  { label: 'Templates', desc: 'Browse content types', href: '/dashboard/projects', icon: LayoutTemplate },
  { label: 'Settings', desc: 'Manage your workspace', href: '/dashboard/settings', icon: SettingsIcon },
]

export default function DashboardHome() {
  const { data, loading } = useApi<DashboardStats>('/api/dashboard/stats')

  const credits = data?.credits
  const usedPct =
    credits && credits.total > 0
      ? Math.min(100, Math.round((credits.used / credits.total) * 100))
      : 0

  const plan = data?.subscription?.plan ?? 'FREE'
  const projects = data?.recentProjects ?? []
  const history = data?.recentHistory ?? []

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back
          {loading ? '' : `, ${data?.user?.name?.split(' ')?.[0] ?? 'there'}`} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in your content workspace.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">

        {/* CAMBIADO A ROJO */}
        <div className="group rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-7 shadow-[0_0_35px_rgba(124,58,237,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_0_60px_rgba(124,58,237,0.35)]">
          <div className="flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
              <Crown className="h-5 w-5" />
            </span>
            <Badge variant="secondary">
              {data?.subscription?.status ?? 'ACTIVE'}
            </Badge>
          </div>

          <h3 className="mt-4 text-sm font-medium text-muted-foreground">
            Current Plan
          </h3>

          {loading ? (
            <Skeleton className="mt-1 h-8 w-24" />
          ) : (
            <p className="font-display text-2xl font-bold">{plan}</p>
          )}

          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link href="/#pricing">
              View plans <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* CAMBIADO A ROJO */}
        <div className="group rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-7 shadow-[0_0_35px_rgba(124,58,237,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_0_60px_rgba(124,58,237,0.35)] lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
              <CreditCard className="h-5 w-5" />
            </span>

            <span className="text-xs text-muted-foreground">
              {credits ? `Resets ${formatDate(credits.resetDate)}` : ''}
            </span>
          </div>

          <h3 className="mt-4 text-sm font-medium text-muted-foreground">
            Credits
          </h3>

          {loading ? (
            <Skeleton className="mt-2 h-10 w-full" />
          ) : (
            <>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-display text-3xl font-bold">
                  {credits?.remaining ?? 0}
                </span>

                <span className="mb-1 text-sm text-muted-foreground">
                  / {credits?.total ?? 0} remaining
                </span>
              </div>

              <Progress value={usedPct} className="mt-3" />

              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{credits?.used ?? 0} used</span>
                <span>{usedPct}% of monthly credits</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Quick Actions
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="group rounded-3xl border border-violet-500/15 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-[0_0_25px_rgba(124,58,237,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_0_45px_rgba(124,58,237,0.30)]"
            >
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.45)] transition-all duration-300 group-hover:scale-110">
                <a.icon className="h-5 w-5" />
              </span>

              <div className="text-sm font-semibold">{a.label}</div>
              <div className="text-xs text-muted-foreground">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        {/* CAMBIADO A ROJO */}
        <div className="group rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-7 shadow-[0_0_35px_rgba(124,58,237,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_0_60px_rgba(124,58,237,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              Recent Projects
            </h2>

            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/projects">View all</Link>
            </Button>
          </div>

          <p>Test</p>
        </div>

        {/* CAMBIADO A ROJO */}
        <div className="group rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-7 shadow-[0_0_35px_rgba(124,58,237,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_0_60px_rgba(124,58,237,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              Recent Activity
            </h2>

            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/history">View all</Link>
            </Button>
          </div>

          <p>Test</p>
        </div>

      </div>
    </div>
  )
}