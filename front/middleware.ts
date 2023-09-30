import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hasToken = request.cookies.has('session_token');
  const { pathname } = request.nextUrl;
  if (!hasToken) {
    if (pathname.startsWith('/login')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  } else {
    if (!pathname.startsWith('/login')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
