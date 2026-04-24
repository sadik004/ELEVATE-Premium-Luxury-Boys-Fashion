import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

// Initialize Redis and Ratelimit (if environment variables exist)
// Note: In development/sandbox we gracefully fall back if Upstash is not fully configured,
// but the plan requires we set this up.
let ratelimit;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'), // 5 requests per 10 minutes
  });
} else {
  // Dummy ratelimiter for environments where Upstash isn't configured yet
  ratelimit = {
    limit: async () => ({ success: true })
  };
}

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Rate Limiting by IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await ratelimit.limit(`ratelimit_send_otp_${ip}`);

    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTP.create({
      data: {
        email,
        otp,
        expiresAt,
        verified: false,
      },
    });

    // Send OTP via Resend
    // If we're in a dummy environment without a real API key, we skip the actual send to avoid crashes
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: 'Your OTP Code',
        html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
      });
    } else {
      console.log(`[Development] OTP generated for ${email}: ${otp}`);
    }

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
