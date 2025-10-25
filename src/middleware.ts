// src/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const pathname = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isAuthPage = pathname === '/login' || pathname === '/register'
  
  // Protected paths that require authentication
  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/explore') ||
    pathname.startsWith('/search') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/activity') ||
    pathname.startsWith('/users')

  // Redirect to login if accessing protected page without token
  if (!token && isProtectedPage) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif).*)',
  ],
}