import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hasToken = request.cookies.has('session_token')

  if (request.nextUrl.pathname.startsWith('/login')) {
    if (hasToken) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (!hasToken && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  // matcher: [
  //   '/((?!_next/static|_next/image|favicon.ico).*)',
  // ]
  matcher: ["/((?!.*\\.).*)", "/favicon.ico"],
}