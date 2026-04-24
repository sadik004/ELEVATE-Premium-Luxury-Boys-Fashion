import * as Sentry from "@sentry/nextjs";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

export const runtime = 'edge';

async function handler(req) {
  try {
    const body = await req.json();

    // The payload from QStash Failure Callback contains the original body
    // that exhausted its retries.
    const { identifier, traceId } = body.body ? JSON.parse(body.body) : {};

    console.error(`[Trace: ${traceId || 'unknown'}] DLQ_ALERT: Exhausted all QStash retries for email sending. User: ${identifier || 'unknown'}`);

    // Capture in Sentry for immediate developer alerting
    Sentry.captureMessage(`Magic Link Email Failure Exhausted for ${identifier}`, {
      level: 'fatal',
      tags: {
        service: "dlq-monitor",
        traceId: traceId
      },
      extra: {
        upstashPayload: body
      }
    });

    return new Response("DLQ logged", { status: 200 });
  } catch (err) {
    console.error("DLQ processing failed:", err);
    return new Response("Internal Error", { status: 500 });
  }
}

// Ensure the DLQ alert actually comes from Upstash
export const POST = verifySignatureAppRouter(handler);