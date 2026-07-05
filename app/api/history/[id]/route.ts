export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ok, fail, unauthorized, serverError } from '@/lib/api'
import { deleteHistory } from '@/services/history-service'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const deleted = await deleteHistory(user.id, params.id)
    if (!deleted) return fail('History entry not found.', 404)
    return ok({ deleted: true })
  } catch (err) {
    console.error('Delete history error:', err)
    return serverError('Could not delete this entry.')
  }
}
