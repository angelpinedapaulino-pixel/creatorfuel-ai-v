export const dynamic = 'force-dynamic'

import { ok, serverError } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return ok({ user: null })
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
    console.error('Me error:', err)
    return serverError()
  }
}
