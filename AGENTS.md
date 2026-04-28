# ELEVATE Agent Instructions

This file is for humans and AI agents working inside this repository. Document the code that exists today, not hoped-for future behavior.

## Project State

Last reviewed: 2026-04-24.

Working / implemented:

- Next.js frontend with storefront, auth pages, cart, and shared UI components.
- OTP auth through NextAuth CredentialsProvider.
- Google OAuth provider is wired but needs real credentials.
- OTP send route stores codes in Prisma, sends with Resend, supports optional Upstash rate limiting, expires codes after 10 minutes, and prevents reuse.
- Backend-token bridge exists so NextAuth users can call protected FastAPI commerce APIs.
- FastAPI backend has auth, product, category, order, and SSLCommerz payment route modules.
- Frontend build and Prisma Client generation have been verified.

Needs attention:

- Push the frontend Prisma auth schema to the real database. If Supabase direct `5432` does not work locally, use the Supabase pooler connection string.
- Rotate any secrets that were shared outside private env storage.
- Update the old magic-link e2e test to OTP.
- Configure production Resend, Upstash, Google OAuth, SSLCommerz, and hosting env vars.

## Architecture Boundaries

### Frontend: `frontend/`

The frontend owns:

- UI rendering and app routes.
- Cart/auth browser state with Zustand.
- Authentication with NextAuth v4.
- OTP generation, storage, verification, and email delivery.
- Prisma auth database tables: `User`, `Account`, `Session`, `OTP`.
- Backend-token hydration after NextAuth sign-in through `frontend/src/app/api/auth/backend-token/route.js`.

Frontend stack:

- Next.js 15 App Router and React 19.
- NextAuth v4 with GoogleProvider and CredentialsProvider OTP login.
- Prisma Adapter for NextAuth.
- Resend for OTP email delivery.
- Upstash Redis REST rate limiting for OTP sends when env vars are configured.
- Tailwind CSS v3 with standard `tailwindcss`, `postcss`, and `autoprefixer`.
- Zustand, Three.js, @react-three/fiber, @react-three/drei, GSAP, Lenis.

The frontend must not:

- Process SSLCommerz payments.
- Directly manage product, category, order, or payment rows in the backend database.
- Commit API keys, OTP codes, NextAuth secrets, database URLs, Redis tokens, Resend keys, Google secrets, or SSLCommerz credentials.

### Backend: `backend-fastapi/`

The backend owns:

- Product and category APIs.
- Backend auth and bearer-token protection for commerce APIs.
- Order creation and order history.
- Payment creation, SSLCommerz session initiation, validation, callbacks, and IPN.
- SQLAlchemy models and Alembic migrations for core commerce tables.
- Redis-backed caching for read-heavy routes.

Backend stack:

- FastAPI and Uvicorn.
- SQLAlchemy async ORM using asyncpg.
- Alembic migrations.
- PostgreSQL.
- Redis and fastapi-cache2.
- PyJWT and Passlib bcrypt.
- SSLCommerz through `httpx`.

The backend must listen on port `5000` locally and in deployment unless the hosting platform maps it externally.

## Current Auth Flow

1. User enters email/phone and password on `/login`.
2. NextAuth CredentialsProvider finds the user by email or phone.
3. Password is verified using `bcryptjs`.
4. If valid, NextAuth creates a session and `AuthHydrator` calls `POST /api/auth/backend-token` to get a FastAPI bearer token.

Registration Flow:
1. User enters Name, Email, Phone (optional), and Password on `/register`.
2. Frontend calls `POST /api/auth/send-otp` to send a verification code to the email.
3. User is redirected to `/verify-email`.
4. User enters OTP.
5. Frontend calls `POST /api/auth/register` which verifies OTP, hashes the password, and creates the Prisma `User`.
6. User is automatically signed in.

Forgot Password Flow:
1. User enters email on `/forgot-password`.
2. Frontend calls `POST /api/auth/send-otp` with `purpose="recovery"`.
3. User is redirected to `/reset-password`.
4. User enters OTP and new password.
5. Frontend calls `POST /api/auth/reset-password` which verifies OTP and updates the password.
6. User is automatically signed in.

Do not reintroduce magic-link or OTP-only login. The current auth system is Email/Phone + Password with OTP verification for registration and recovery.

## Current Payment Flow

SSLCommerz is implemented in the FastAPI backend:

- Config: `backend-fastapi/app/core/config.py`
- Service: `backend-fastapi/app/services/sslcommerz.py`
- Routes: `backend-fastapi/app/api/v1/endpoints/payments.py`
- Router registration: `backend-fastapi/app/api/v1/api.py`
- Payment model: `backend-fastapi/app/models/models.py`

Checkout flow:

1. Frontend cart calls `POST /api/payments/initiate`.
2. Backend creates an order and pending payment.
3. Backend creates an SSLCommerz session and returns `GatewayPageURL` as `gatewayUrl`.
4. Frontend redirects the browser to SSLCommerz.
5. SSLCommerz calls backend success/fail/cancel/IPN routes.
6. Backend validates successful payments and updates order/payment status.
7. Backend redirects the browser back to the frontend cart page with payment status query params.

`BACKEND_PUBLIC_URL` must be public in production because SSLCommerz needs to reach callback and IPN routes.

## Local Commands

Frontend:

```bash
cd frontend
npm install
npx prisma db push
npx prisma generate
npm run dev
```

Backend:

```bash
cd backend-fastapi
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 5000
```

Checks:

```bash
cd frontend
npm run build
```

```bash
cd backend-fastapi
pytest
```

## Change Rules

- Keep auth/UI in the frontend and commerce/payment logic in the backend.
- Use `NEXT_PUBLIC_API_URL` for frontend-to-backend calls. In development it may fall back to `http://localhost:5000`.
- Keep the backend on port `5000`.
- Use Alembic migrations for backend schema changes.
- Use Prisma migrations or `prisma db push` intentionally for frontend auth schema changes.
- Seed scripts must be idempotent and must let the ORM/database handle auto-increment IDs.
- Keep Tailwind on standard `tailwindcss`, `postcss`, and `autoprefixer`; do not add `@tailwindcss/postcss`.
- Avoid modifying unrelated dirty files. This repository may already contain user changes.
- Do not log OTP codes in production. Development-only OTP console logging is allowed only when `RESEND_API_KEY` is missing.
- Rotate any secret that appears in chat, logs, screenshots, tickets, or commits.
