export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, signToken, authCookieOptions, AUTH_COOKIE } from '@/lib/auth'
import { ok, fail, serverError, isValidEmail } from '@/lib/api'
import { logActivity } from '@/services/history-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = (body?.email ?? '').toString().trim().toLowerCase()
    const password = (body?.password ?? '').toString()

    if (!isValidEmail(email)) return fail('Please enter a valid email address.')
    if (!password) return fail('Please enter your password.')

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return fail('Invalid email or password.', 401)

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return fail('Invalid email or password.', 401)

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    await logActivity({ userId: user.id, action: 'Signed in', details: 'You signed in to your account.' })

    const res = ok({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    })
    res.cookies.set(AUTH_COOKIE, token, authCookieOptions())
    return res
  } catch (err) {
    console.error('Login error:', err)
    return serverError('Could not sign you in. Please try again.')
  }
}
