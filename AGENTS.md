# ELEVATE Project Architecture & Guidelines (AGENT.md)

This document provides a strictly code-driven breakdown of the ELEVATE e-commerce architecture. Any AI agent operating within this repository MUST adhere to these architectural boundaries, security mechanisms, and data flows.

## 1. Project Overview

ELEVATE is a high-performance, distributed e-commerce platform using a modern dual-stack architecture:
- **Frontend Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, Zustand, @react-three/fiber.
- **Backend Stack:** Python FastAPI, SQLAlchemy (PostgreSQL), Redis caching.
- **Authentication:** NextAuth (Google OAuth + Async Magic Links) using Prisma ORM.
- **Async Queue:** Upstash QStash.
- **Email Delivery:** Resend API.
- **Distributed State:** Upstash Redis (Idempotency and Rate Limiting).

## 2. Architecture Flow

### Authentication Flow (Async Queue via NextAuth)
The authentication flow uses an event-driven architecture to guarantee fast UI response times and fault-tolerant email delivery.
1. **Initiation:** User submits their email via the NextAuth client.
2. **Database:** NextAuth generates a VerificationToken and stores it via the `PrismaAdapter`.
3. **Queue Publish:** Inside `frontend/src/app/api/auth/[...nextauth]/route.js`, the custom `sendVerificationRequest` bypasses synchronous SMTP. Instead, it publishes a JSON payload (email and URL) to **Upstash QStash** with `retries: 3` and `"Upstash-Delay": "2s"`. The UI immediately receives a 200 OK.
4. **Webhook Trigger:** QStash sends a POST request to `frontend/src/app/api/webhooks/email/route.js`.
5. **Execution:** The webhook verifies the signature, acquires an idempotency lock, and sends the email via the **Resend API**.

## 3. Key Components

- **NextAuth Config:** `frontend/src/app/api/auth/[...nextauth]/route.js` (Contains the QStash publisher).
- **Webhook Consumer:** `frontend/src/app/api/webhooks/email/route.js` (The Node.js worker handling async email delivery).
- **Prisma Singleton:** `frontend/src/lib/prisma.js` (Manages database connections efficiently in serverless environments).
- **Middleware:** `frontend/src/middleware.js` (Protects sensitive routes at the Edge).
- **Database Schema:** `frontend/prisma/schema.prisma` (PostgreSQL definitions for users, sessions, and tokens).

## 4. Critical Rules (Do NOT Change)

- **Prisma Connections:** Do NOT instantiate `new PrismaClient()` directly in API routes. Always import the singleton from `@/lib/prisma` to prevent connection exhaustion during hot-reloads and cold starts.
- **Webhook Runtime:** The email webhook (`api/webhooks/email`) MUST use `export const runtime = 'nodejs';`. Do not switch it to `edge`, as Node SDKs like Resend require native Node.js APIs not fully polyfilled in Edge runtimes.
- **Idempotency Deletion on Failure:** If the email webhook fails (e.g., Resend throws an error), the Redis idempotency lock MUST be explicitly deleted (`await redis.del(lockKey)`) in the `catch` block so QStash can successfully retry.

## 5. Security Mechanisms

- **Rate Limiting:** `frontend/src/middleware.js` uses `@upstash/ratelimit` (Sliding Window: 5 requests / 15 mins) to protect `/api/auth/signin/email` from bot spam.
- **Signature Verification:** The webhook worker uses `@upstash/qstash` `receiver.verify()` to cryptographically ensure payloads originate solely from QStash, dropping forged external requests.
- **Idempotency Locks:** Uses atomic Redis `SET NX` locks (`isNewMessage = await redis.set(lockKey, "processing", { nx: true })`) to drop duplicate QStash deliveries (at-least-once delivery semantics).

## 6. Failure Handling & Queue Retry Behavior

- If the Resend API throws an error, the webhook catches it, drops the Redis lock, logs the error, and returns a `500 Internal Server Error`.
- QStash detects the 500 response and automatically places the job into a retry queue with exponential backoff (up to 3 retries, as configured in the NextAuth producer).
- If the worker succeeds, it updates the lock to "completed" and returns a `200 OK`, finalizing the queue message.

## 7. Deployment Notes

- **Vercel Serverless:** The application is built for Vercel. Next.js APIs run as Serverless Functions.
- **Environment Variables Required:**
  - `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - `RESEND_API_KEY`, `EMAIL_FROM`
  - `DATABASE_URL` (Neon or Supabase connection string)

## 8. Testing Checklist

When modifying authentication or email systems, validate the following:
1. `npm run dev` successfully builds without NextAuth module resolution errors.
2. The Prisma singleton does not leak connections over multiple request cycles.
3. Rapid succession hits to `/api/auth/signin/email` return a 429 Too Many Requests response.
4. Sending a valid POST directly to `/api/webhooks/email` without a QStash signature returns a 401 Unauthorized response.

## 9. Architectural Boundaries & Rules

- **Frontend strictly handles Auth and UI.**
- **Backend strictly handles Core Business Logic, Products, and Payments.**
