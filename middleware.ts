import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supabase sets this cookie on successful auth — it is our runtime truth for session existence.
const SESSION_COOKIE = 'sb-access-token';

const protectedPaths = [
  '/dashboard',
  '/missions',
  '/mission',
  '/crew',
  '/signals',
  '/solo',
  '/archive',
  '/admin',
  '/endgame'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isProtected) {
    const session = request.cookies.get(SESSION_COOKIE);
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/missions/:path*',
    '/mission/:path*',
    '/crew/:path*',
    '/signals/:path*',
    '/solo/:path*',
    '/archive/:path*',
    '/admin/:path*',
    '/endgame/:path*'
  ]
};
