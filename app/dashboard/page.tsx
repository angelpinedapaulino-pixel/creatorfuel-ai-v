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
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  } catch { return '' }
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
  const usedPct = credits && credits.total > 0 ? Math.min(100, Math.round((credits.used / credits.total) * 100)) : 0
  const plan = data?.subscription?.plan ?? 'FREE'
  const projects = data?.recentProjects ?? []
  const history = data?.recentHistory ?? []

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back{loading ? '' : `, ${data?.user?.name?.split(' ')?.[0] ?? 'there'}`} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening in your content workspace.</p>
      </div>

      {/* Top cards */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Plan */}
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary"><Crown className="h-5 w-5" /></span>
            <Badge variant="secondary">{data?.subscription?.status ?? 'ACTIVE'}</Badge>
          </div>
          <h3 className="mt-4 text-sm font-medium text-muted-foreground">Current Plan</h3>
          {loading ? <Skeleton className="mt-1 h-8 w-24" /> : <p className="font-display text-2xl font-bold">{plan}</p>}
          <Button asChild variant="outline" size="sm" className="mt-4 w-full"><Link href="/#pricing">View plans <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>

        {/* Credits */}
        <div className="rounded-2xl bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary"><CreditCard className="h-5 w-5" /></span>
            <span className="text-xs text-muted-foreground">{credits ? `Resets ${formatDate(credits.resetDate)}` : ''}</span>
          </div>
          <h3 className="mt-4 text-sm font-medium text-muted-foreground">Credits</h3>
          {loading ? (
            <Skeleton className="mt-2 h-10 w-full" />
          ) : (
            <>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-display text-3xl font-bold">{credits?.remaining ?? 0}</span>
                <span className="mb-1 text-sm text-muted-foreground">/ {credits?.total ?? 0} remaining</span>
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

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.label} href={a.href} className="group rounded-2xl bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:brand-gradient group-hover:text-white"><a.icon className="h-5 w-5" /></span>
              <div className="text-sm font-semibold">{a.label}</div>
              <div className="text-xs text-muted-foreground">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent projects + activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Projects</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/projects">View all</Link></Button>
          </div>
          {loading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground"><FolderKanban className="h-6 w-6" /></span>
              <p className="text-sm text-muted-foreground">No projects yet. Create your first one!</p>
              <Button asChild size="sm"><Link href="/dashboard/projects"><Plus className="h-4 w-4" /> New Project</Link></Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{projectTypeLabel(p.type)} • {formatDate(p.createdAt)}</div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{p.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/history">View all</Link></Button>
          </div>
          {loading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground"><Activity className="h-6 w-6" /></span>
              <p className="text-sm text-muted-foreground">Your activity will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><CheckCircle2 className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{h.action}</div>
                    {h.details && <div className="truncate text-xs text-muted-foreground">{h.details}</div>}
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {formatDate(h.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
