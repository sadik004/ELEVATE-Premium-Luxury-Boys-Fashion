import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import * as Sentry from "@sentry/nextjs";

export const runtime = 'edge';

async function handler(req) {
  let traceId;
  try {
    const { identifier, url, traceId: incomingTraceId } = await req.json();
    traceId = incomingTraceId;

    console.log(`[Trace: ${traceId}] Webhook worker starting execution for ${identifier}`);

    // Call Resend API directly over HTTPS
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[Trace: ${traceId}] RESEND_API_ERROR:`, response.status, errorData);
      throw new Error(`Resend API failed with status ${response.status}`);
    }

    console.log(`[Trace: ${traceId}] Webhook worker execution successful.`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error(`[Trace: ${traceId || 'unknown'}] Webhook worker failed:`, error);

    Sentry.captureException(error, {
      tags: {
        service: "email-queue-worker",
        traceId: traceId
      },
    });

    return new Response("Failed", { status: 500 });
  }
}

// Secure the webhook endpoint
export const POST = verifySignatureAppRouter(handler);