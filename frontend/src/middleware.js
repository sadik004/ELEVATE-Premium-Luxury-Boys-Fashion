import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getToken } from 'next-auth/jwt';

// Initialize ratelimiter (5 requests per 15 minutes)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
});

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

    // In dev, if URL/Token are missing, bypass gently
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn("Upstash Redis env variables missing. Rate limiting bypassed.");
      return NextResponse.next();
    }

    try {
      const { success, limit, remaining } = await ratelimit.limit(`ratelimit_auth_${ip}`);

      if (!success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() }
        });
      }
    } catch (err) {
       console.error("Ratelimit error:", err);
       // Allow request through if Redis fails
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/:path*', '/admin/:path*'],
};
