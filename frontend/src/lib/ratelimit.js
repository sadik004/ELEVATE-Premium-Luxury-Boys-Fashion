import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const isProduction = process.env.NODE_ENV === 'production';

let ratelimit = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'), // 3 requests per minute
    analytics: true,
    prefix: '@upstash/ratelimit',
  });
}

/**
 * Checks if a request should be rate limited.
 * 
 * @param {string} identifier - A unique identifier for the request (e.g., IP + email)
 * @returns {Promise<{success: boolean, limit: number, remaining: number, reset: number}>}
 */
export async function checkRateLimit(identifier) {
  // 1. Mandatory Check in Production
  if (!ratelimit) {
    if (isProduction) {
      console.error('CRITICAL: Rate limiting is missing in production environment!');
      // Block requests if rate limiting is broken/missing in production
      return { success: false, limit: 0, remaining: 0, reset: Date.now() };
    } else {
      console.warn('Rate limiting bypassed in development (Upstash env vars missing)');
      return { success: true, limit: 100, remaining: 100, reset: Date.now() };
    }
  }

  try {
    const result = await ratelimit.limit(identifier);
    return result;
  } catch (error) {
    console.error('Rate limiter exception:', error);
    // In production, if the rate limiter itself fails (e.g. Redis down),
    // we might want to fail closed (block) or fail open (allow).
    // For a luxury app, we fail open but log the error to avoid blocking real customers.
    return { success: true, limit: 0, remaining: 0, reset: Date.now() };
  }
}
