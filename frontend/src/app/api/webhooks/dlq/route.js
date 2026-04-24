import { Receiver } from "@upstash/qstash";

export const runtime = 'edge';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

export async function POST(req) {
  try {
    const signature = req.headers.get("Upstash-Signature");
    if (!signature) {
      return new Response("Missing signature", { status: 401 });
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

    // The payload from QStash Failure Callback contains the original body
    // that exhausted its retries.
    const { identifier, traceId } = body.body ? JSON.parse(body.body) : {};

    console.error(`[Trace: ${traceId || 'unknown'}] DLQ_ALERT: Exhausted all QStash retries for email sending. User: ${identifier || 'unknown'}`);

    // TODO: Add your preferred monitoring tool here when Sentry is removed

    return new Response("DLQ logged", { status: 200 });
  } catch (err) {
    console.error("DLQ processing failed:", err);
    return new Response("Internal Error", { status: 500 });
  }
}