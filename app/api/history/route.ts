export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/api'
import { listHistory } from '@/services/history-service'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const history = await listHistory(user.id, 100)
    return ok({ history })
  } catch (err) {
    console.error('List history error:', err)
    return serverError('Could not load your activity history.')
  }
}
