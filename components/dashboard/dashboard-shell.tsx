'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  LayoutDashboard, FolderKanban, Brain, History as HistoryIcon, Settings as SettingsIcon,
  LogOut, Bell, UserCircle, Sparkles,
} from 'lucide-react'
import { AppShell } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@/types'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/ai-generator', label: 'AI Generator', icon: Sparkles },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/business-brain', label: 'Business Brain', icon: Brain },
  { href: '/dashboard/history', label: 'History', icon: HistoryIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
]

function initials(name: string) {
  return (name ?? '').split(' ').map((p) => p.charAt(0)).slice(0, 2).join('').toUpperCase() || 'U'
}

export function DashboardShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const onLogout = async () => {
    await logout()
    toast.success('Signed out')
    router.push('/')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="mb-6 px-2"><BrandLogo /></Link>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.href, item.exact)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 border-t border-border/60 pt-4">
        <Link
          href="/dashboard/profile"
          className={cn(
            'mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            isActive('/dashboard/profile') ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <UserCircle className="h-4 w-4" /> Profile
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  )

  const header = (
    <div className="flex flex-1 items-center justify-end gap-3">
      <Button
        variant="ghost" size="icon"
        onClick={() => toast('You have no new notifications', { icon: '🔔' })}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
      </Button>
      <Link href="/dashboard/profile" className="flex items-center gap-2.5">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-semibold leading-tight">{user?.name ?? 'User'}</div>
          <div className="text-xs text-muted-foreground">{user?.role === 'ADMIN' ? 'Administrator' : 'Member'}</div>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full brand-gradient text-sm font-semibold text-white">
          {initials(user?.name ?? '')}
        </span>
      </Link>
    </div>
  )

  return <AppShell sidebar={sidebar} header={header}>{children}</AppShell>
}
