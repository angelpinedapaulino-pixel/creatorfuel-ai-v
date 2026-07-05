export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/api'
import { getSettings, updateSettings } from '@/services/user-service'
import { logActivity } from '@/services/history-service'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const settings = await getSettings(user.id)
    return ok({ settings })
  } catch (err) {
    console.error('Get settings error:', err)
    return serverError()
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const body = await req.json().catch(() => ({}))
    const patch: Record<string, unknown> = {}
    if (body?.theme !== undefined) patch.theme = (body.theme ?? 'dark').toString()
    if (body?.notifications !== undefined) patch.notifications = Boolean(body.notifications)
    if (body?.language !== undefined) patch.language = (body.language ?? 'English').toString()
    if (body?.timezone !== undefined) patch.timezone = (body.timezone ?? 'UTC').toString()

    const settings = await updateSettings(user.id, patch)
    await logActivity({ userId: user.id, action: 'Settings updated', details: 'You updated your workspace settings.' })
    return ok({ settings })
  } catch (err) {
    console.error('Update settings error:', err)
    return serverError('Could not update your settings.')
  }
}
