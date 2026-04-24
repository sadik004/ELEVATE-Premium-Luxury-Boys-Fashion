import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create a new ratelimiter that allows 5 requests per 15 minutes
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

export async function middleware(request) {
  // Only protect the email sign-in route
  if (request.nextUrl.pathname === '/api/auth/signin/email' && request.method === 'POST') {
    const ip = request.ip ?? '127.0.0.1';

    // We try to extract the email from the payload to make the limit per IP + Email
    // Since NextAuth uses x-www-form-urlencoded by default, we read the formData
    let identifier = 'unknown';
    try {
      const clone = request.clone();
      const formData = await clone.formData();
      identifier = formData.get('email') || 'unknown';
    } catch (e) {
      // Ignore if we can't parse it
    }

    const rateLimitKey = `ratelimit_auth_${ip}_${identifier}`;

    const { success, limit, reset, remaining } = await ratelimit.limit(rateLimitKey);

    if (!success) {
      console.warn(`RATE_LIMIT_EXCEEDED: IP ${ip} tried to request magic link for ${identifier}`);
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later or use Google sign in."
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/auth/signin/email',
};