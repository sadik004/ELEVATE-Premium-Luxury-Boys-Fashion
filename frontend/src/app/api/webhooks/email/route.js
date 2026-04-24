import { Receiver } from "@upstash/qstash";
import { Redis } from '@upstash/redis';
import * as Sentry from "@sentry/nextjs";

export const runtime = 'edge';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function POST(req) {
  let traceId;
  let messageId;
  let lockAcquired = false;

  try {
    const signature = req.headers.get("Upstash-Signature");
    messageId = req.headers.get("Upstash-Message-Id");

    if (!signature || !messageId) {
      return new Response("Missing signature or message ID", { status: 401 });
    }

    const rawBody = await req.text();
    const isValid = await receiver.verify({
      signature,
      body: rawBody,
    });

    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { identifier, url, traceId: incomingTraceId } = body;
    traceId = incomingTraceId;

    // ⏱️ Timeout Safety Fix: Atomic Idempotency Lock
    // Attempt to set a lock for this message ID. It automatically expires after 30s.
    // If it already exists, this is a duplicate QStash retry we should ignore.
    const lockKey = `email_lock_${messageId}`;
    const acquired = await redis.set(lockKey, 'locked', { nx: true, ex: 30 });

    if (!acquired) {
      console.log(`[Trace: ${traceId}] Duplicate execution prevented for message ${messageId}`);
      return new Response("Already processing", { status: 200 }); // Return 200 to ack to QStash
    }

    lockAcquired = true;
    console.log(`[Trace: ${traceId}] Webhook worker starting execution for ${identifier}`);

    // Worker Execution Safety: Apply a 8-second AbortController to the fetch request
    // This ensures Vercel doesn't hard-kill the function at 10s, allowing our finally block to run
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Call Resend API directly over HTTPS
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        from: "Elevate Auth <login@yourdomain.com>",
        to: identifier,
        subject: "Sign in to Elevate",
        html: `
          <body style="background: #0a0a0a; color: #fff; font-family: sans-serif; padding: 20px;">
            <h1 style="color: #D4AF37;">Welcome to Elevate</h1>
            <p>Click the secure link below to sign in:</p>
            <a href="${url}" style="background: #D4AF37; color: #0a0a0a; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px;">Sign In</a>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">If you did not request this email you can safely ignore it.</p>
          </body>
        `,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[Trace: ${traceId}] RESEND_API_ERROR:`, response.status, errorData);

      // If Resend throws a 429 Rate Limit, we delete the lock so QStash can cleanly retry it later
      if (response.status === 429) {
        await redis.del(lockKey);
        lockAcquired = false;
      }

      throw new Error(`Resend API failed with status ${response.status}`);
    }

    // Success! We intentionally DO NOT delete the lock here.
    // The 30s TTL ensures this message ID is ignored if QStash accidentally double-fires
    // before it receives our 200 OK response.
    console.log(`[Trace: ${traceId}] Webhook worker execution successful.`);
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error(`[Trace: ${traceId || 'unknown'}] Webhook worker failed:`, error);

    // Timeout Safety: Clean up lock on internal execution failure so QStash can try again
    if (lockAcquired && messageId && error.name === 'AbortError') {
        const lockKey = `email_lock_${messageId}`;
        await redis.del(lockKey).catch(() => {});
    }

    Sentry.captureException(error, {
      tags: {
        service: "email-queue-worker",
        traceId: traceId
      },
    });

    return new Response("Failed", { status: 500 });
  }
}