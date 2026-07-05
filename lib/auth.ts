import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const AUTH_COOKIE = 'cf_token'
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'creatorfuel-dev-secret'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export interface SafeUser {
  id: string
  email: string
  name: string
  avatar: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password ?? '', 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password ?? '', hash ?? '')
  } catch {
    return false
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    if (!decoded?.userId) return null
    return decoded
  } catch {
    return null
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TOKEN_MAX_AGE,
  }
}

export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}

/** Reads and verifies the JWT from the request cookies (server-only). */
export function getTokenPayload(): JwtPayload | null {
  try {
    const token = cookies().get(AUTH_COOKIE)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

/** Returns the authenticated user record (without password) or null. */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const payload = getTokenPayload()
  if (!payload?.userId) return null
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return user
  } catch {
    return null
  }
}
