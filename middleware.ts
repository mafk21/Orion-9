import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isProtected) {
    // Create Supabase server client to properly check session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        return NextResponse.redirect(url);
      }
    } catch {
      // If we can't verify the session, redirect to auth
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
