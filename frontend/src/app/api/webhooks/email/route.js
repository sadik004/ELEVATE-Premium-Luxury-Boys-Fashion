import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Receiver } from '@upstash/qstash';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const preferredRegion = 'iad1';

export async function POST(req) {
  // Graceful bypass for local dev if missing env vars
  if (!process.env.QSTASH_CURRENT_SIGNING_KEY || !process.env.UPSTASH_REDIS_REST_URL) {
     console.warn("Missing Upstash env vars. Webhook processing safely bypassed for local dev.");
     return new NextResponse("Bypassed", { status: 200 });
  }

  const redis = Redis.fromEnv();
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
  });

  const body = await req.text();

  // 1. Security: Verify QStash Signature
  try {
    const isValid = await receiver.verify({
      signature: req.headers.get("upstash-signature"),
      body,
    });
    if (!isValid) return new NextResponse("Invalid signature", { status: 401 });
  } catch (err) {
    return new NextResponse("Signature verification failed", { status: 401 });
  }

  const messageId = req.headers.get("upstash-message-id");
  if (!messageId) return new NextResponse("Missing message ID", { status: 400 });

  // 2. Idempotency: Acquire Lock
  const lockKey = `idempotency:email:${messageId}`;
  const isNewMessage = await redis.set(lockKey, "processing", { nx: true, ex: 86400 });

  if (!isNewMessage) {
    console.log(`[IDEMPOTENCY] Message ${messageId} is currently processing or already completed. Skipping.`);
    // Return 200 so QStash acknowledges the message and stops retrying
    return new NextResponse("Already processed", { status: 200 });
  }

  const payload = JSON.parse(body);

  // 3. Execution Phase
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: payload.email,
      subject: 'Sign in to ELEVATE',
      html: `<body>
               <h2>Sign in to ELEVATE</h2>
               <p>Click the link below to sign in.</p>
               <a href="${payload.url}">Sign in</a>
             </body>`
    });

    if (error) {
      throw new Error(`Resend API Error: ${error.message}`);
    }

    // 4. Success: Mark permanently completed
    await redis.set(lockKey, "completed", { ex: 86400 });

    return new NextResponse("Email Sent", { status: 200 });

  } catch (error) {
    // 5. CRITICAL FIX: Release the lock on failure
    await redis.del(lockKey);

    console.error("[WEBHOOK FAILED]", error);

    // Return 500 so QStash registers a failure and initiates exponential backoff retry
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
