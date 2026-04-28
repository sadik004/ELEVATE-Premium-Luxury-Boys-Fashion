import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { sendOtpEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/ratelimit';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Note: Configuration moved to @/lib/ratelimit.js

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

    // Rate Limiting by IP + Email
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await checkRateLimit(`send_otp_${ip}_${normalizedEmail}`);

    if (!success) {
      return NextResponse.json({ 
        error: 'Too many requests. Please try again in a minute.' 
      }, { status: 429 });
    }

    // Generate secure 6-digit OTP
    let otp = crypto.randomInt(100000, 999999).toString();

    // Deterministic OTP for e2e testing
    if (process.env.NEXT_PUBLIC_APP_ENV === 'test') {
      otp = '123456';
    }

    // Hash OTP for storage
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Expiry: 5 minutes
    const TTL = 5 * 60;
    const expiresAt = new Date(Date.now() + TTL * 1000);

    let storedSuccessfully = false;

    // 1. Try Redis Storage (Primary)
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        await redis.setex(`otp:${normalizedEmail}`, TTL, hashedOtp);
        storedSuccessfully = true;
      } catch (redisError) {
        console.error('Redis OTP storage failed, falling back to DB:', redisError);
      }
    }

    // 2. Try DB Storage (Fallback or Parallel)
    if (!storedSuccessfully || true) { // We always try DB as well for persistence/audit if possible
      try {
        await prisma.oTP.create({
          data: {
            email: normalizedEmail,
            otp: hashedOtp,
            expiresAt,
            verified: false,
          },
        });
        storedSuccessfully = true;
      } catch (dbError) {
        console.error('Database OTP storage failed:', dbError);
        if (!storedSuccessfully) {
          return NextResponse.json({ error: 'System is temporarily unavailable. Please try again later.' }, { status: 503 });
        }
      }
    }

    // 3. Send Email
    const emailResult = await sendOtpEmail({
      to: normalizedEmail,
      otp,
      purpose
    });

    if (!emailResult.success) {
      // In production, we fail if email delivery fails.
      // In development, the utility handles mocking.
      if (isProduction && !emailResult.mocked) {
        return NextResponse.json({ error: 'Failed to deliver email. Please try again later.' }, { status: 500 });
      }
    }

    const responseMessage = emailResult.mocked 
      ? 'OTP generated (Mocked). Check server console.' 
      : 'OTP sent successfully. Check your email.';

    return NextResponse.json({ message: responseMessage }, { status: 200 });

  } catch (error) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
