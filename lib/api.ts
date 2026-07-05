import { NextResponse } from 'next/server'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...(extra ?? {}) }, { status })
}

export function unauthorized() {
  return fail('You must be signed in to do that.', 401)
}

export function serverError(message = 'Something went wrong. Please try again.') {
  return fail(message, 500)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email ?? '').trim())
}
