import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
const isProduction = process.env.NODE_ENV === 'production';

export async function POST(req) {
  try {
    const { email, purpose = 'login' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'OTP storage is not configured. Set DATABASE_URL in frontend/.env.local.' },
        { status: 500 }
      );
    }

    // Rate Limiting by IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await ratelimit.limit(`ratelimit_send_otp_${ip}_${normalizedEmail}`);

    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTP.create({
      data: {
        email: normalizedEmail,
        otp,
        expiresAt,
        verified: false,
      },
    });

    if (!process.env.RESEND_API_KEY) {
      if (isProduction) {
        return NextResponse.json(
          { error: 'Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.' },
          { status: 500 }
        );
      }

      console.log(`[Development] OTP generated for ${normalizedEmail}: ${otp}`);
      return NextResponse.json(
        { message: 'Email delivery is not configured locally. OTP was logged to the server console.' },
        { status: 200 }
      );
    }

    const copy = {
      signup: {
        subject: 'Verify your ELEVATE account',
        intro: 'Use this code to verify your ELEVATE account.',
      },
      recovery: {
        subject: 'Recover your ELEVATE access',
        intro: 'Use this code to recover access to your ELEVATE account.',
      },
      login: {
        subject: 'Your ELEVATE access code',
        intro: 'Use this code to sign in to ELEVATE.',
      },
    }[purpose] || {
      subject: 'Your ELEVATE access code',
      intro: 'Use this code to continue.',
    };

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: normalizedEmail,
      subject: copy.subject,
      html: `<p>${copy.intro}</p><p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    return NextResponse.json({ message: 'OTP sent successfully. Check your email.' }, { status: 200 });

  } catch (error) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
