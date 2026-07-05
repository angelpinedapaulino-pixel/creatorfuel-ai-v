export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { ok, fail, unauthorized, serverError } from '@/lib/api'
import { logActivity } from '@/services/history-service'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    return ok({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('Get profile error:', err)
    return serverError()
  }
}

export async function PUT(req: NextRequest) {
  try {
    const current = await getCurrentUser()
    if (!current) return unauthorized()

    const body = await req.json().catch(() => ({}))
    const name = (body?.name ?? '').toString().trim()
    const avatar = body?.avatar !== undefined ? (body?.avatar ?? '').toString().trim() : undefined

    if (!name) return fail('Name cannot be empty.')

    const updated = await prisma.user.update({
      where: { id: current.id },
      data: {
        name,
        ...(avatar !== undefined ? { avatar: avatar || null } : {}),
      },
      select: { id: true, email: true, name: true, avatar: true, role: true },
    })

    await logActivity({ userId: current.id, action: 'Profile updated', details: 'You updated your profile details.' })
    return ok({ user: updated })
  } catch (err) {
    console.error('Update profile error:', err)
    return serverError('Could not update your profile.')
  }
}
