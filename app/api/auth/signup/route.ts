export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken, authCookieOptions, AUTH_COOKIE } from '@/lib/auth'
import { ok, fail, serverError, isValidEmail } from '@/lib/api'
import { provisionNewUser } from '@/services/user-service'
import { logActivity } from '@/services/history-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = (body?.name ?? '').toString().trim()
    const email = (body?.email ?? '').toString().trim().toLowerCase()
    const password = (body?.password ?? '').toString()

    if (!name) return fail('Please enter your name.')
    if (!isValidEmail(email)) return fail('Please enter a valid email address.')
    if (password.length < 6) return fail('Password must be at least 6 characters long.')

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return fail('An account with this email already exists.', 409)

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'USER' },
      select: { id: true, email: true, name: true, avatar: true, role: true },
    })

    await provisionNewUser(user.id)
    await logActivity({
      userId: user.id,
      action: 'Account created',
      details: 'Welcome to CreatorFuel AI! Your workspace is ready.',
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    const res = ok({ user }, 201)
    res.cookies.set(AUTH_COOKIE, token, authCookieOptions())
    return res
  } catch (err) {
    console.error('Signup error:', err)
    return serverError('Could not create your account. Please try again.')
  }
}
