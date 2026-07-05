export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/api'
import { getCredits, getUserPlan } from '@/services/generation-service'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const [credits, plan] = await Promise.all([getCredits(user.id), getUserPlan(user.id)])
    return ok({ credits, plan })
  } catch (err) {
    console.error('Get credits error:', err)
    return serverError('Could not load your credits.')
  }
}
