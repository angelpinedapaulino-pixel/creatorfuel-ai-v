export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <DashboardShell
      user={{ id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role }}
    >
      {children}
    </DashboardShell>
  )
}
