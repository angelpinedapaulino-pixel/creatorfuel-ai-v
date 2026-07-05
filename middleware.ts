import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'cf_token'

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value
  const { pathname } = req.nextUrl

  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  // Guard dashboard routes: no token cookie -> send to login (full verification happens server-side).
  if (isDashboard && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // If already signed in, keep users out of the auth pages.
  if (isAuthPage && token) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
