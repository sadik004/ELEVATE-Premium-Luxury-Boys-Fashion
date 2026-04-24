# ELEVATE Project Architecture & Guidelines (AGENTS.md)

This document provides a strictly code-driven breakdown of the ELEVATE e-commerce architecture. Any AI agent operating within this repository MUST adhere to these architectural boundaries, security mechanisms, and data flows.

## 1. System Architecture Strict Boundaries

ELEVATE uses a modern dual-stack architecture:

- **Frontend (Next.js, NextAuth)**: Strictly handles UI rendering and Authentication.
  - **Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, Zustand, @react-three/fiber.
  - **Auth:** NextAuth with a custom `CredentialsProvider` handling OTP verification backed by Prisma ORM and Upstash rate-limiting.
  - **Email:** Sent via Resend API directly from Next.js server actions / API routes.

- **Backend (FastAPI)**: Strictly handles Core Business Logic, Products, Orders, and Payments.
  - **Stack:** Python FastAPI, SQLAlchemy (PostgreSQL), Redis.
  - **Cache:** Upstash Redis for idempotency and read-heavy routes.
  - **Payments:** SSLCommerz Integration.

## 2. Critical Rules (Do NOT Change)

- **Frontend Separation:** The Next.js frontend handles Auth and UI; it does NOT manage core business entities (like processing payments or managing product inventory directly in the DB). It queries the FastAPI backend for data.
- **Backend Port:** The backend API strictly listens on port `5000`. Frontend API requests route through the `NEXT_PUBLIC_API_URL` environment variable, falling back to `http://localhost:5000` in development.
- **No Magic Links:** The project previously used QStash and magic links. This has been completely replaced by a custom, secure 2-step OTP email authentication system using `CredentialsProvider`.
- **Database Seeding:** Seed scripts must be idempotent. Let the ORM handle auto-increment IDs.
- **Secret Management:** Never log or commit API keys or OTP codes in production.
- **Tailwind:** Use the standard `postcss` and `autoprefixer` packages in `package.json`. Do not install `@tailwindcss/postcss` to avoid version conflicts with Tailwind v4.

## 3. Deployment Flow

- Committing and pushing changes to the repository automatically triggers frontend deployment on Vercel and backend deployment on Render.
- No manual deployment steps are needed.
