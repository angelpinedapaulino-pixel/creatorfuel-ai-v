export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/api'
import { getDashboardStats } from '@/services/dashboard-service'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const stats = await getDashboardStats(user)
    return ok(stats)
  } catch (err) {
    console.error('Dashboard stats error:', err)
    return serverError('Could not load your dashboard.')
  }
}
