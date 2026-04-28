import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkRateLimit } from '@/lib/ratelimit';

// Configuration moved to @/lib/ratelimit.js

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Admin Protection
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // 2. Auth Rate Limiting
  if (pathname.includes('/api/auth/signin/email')) {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';

    try {
      const { success, limit, remaining } = await checkRateLimit(`auth_${ip}`);

      if (!success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: { 
            "X-RateLimit-Limit": limit.toString(), 
            "X-RateLimit-Remaining": remaining.toString() 
          }
        });
      }
    } catch (err) {
       console.error("Ratelimit error:", err);
       // Allow request through if Redis fails to avoid blocking real users
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/:path*', '/admin/:path*'],
};
