export const dynamic = 'force-dynamic'

import { ok, serverError } from '@/lib/api'
import { AUTH_COOKIE, clearCookieOptions } from '@/lib/auth'

export async function POST() {
  try {
    const res = ok({ message: 'Signed out.' })
    res.cookies.set(AUTH_COOKIE, '', clearCookieOptions())
    return res
  } catch (err) {
    console.error('Logout error:', err)
    return serverError()
  }
}
