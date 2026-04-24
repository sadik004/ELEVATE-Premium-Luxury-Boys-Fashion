# ELEVATE - Premium Luxury Boys Fashion

ELEVATE is a dual-stack e-commerce application for premium boys' fashion. The project is split into a Next.js frontend and a FastAPI backend so authentication/UI, commerce data, and payments stay in clear ownership boundaries.

## Current Status

Last reviewed: 2026-04-24.

Completed:

- Next.js storefront pages, product/shop/cart UI, and shared UI components are present.
- Frontend OTP authentication is implemented with NextAuth CredentialsProvider.
- Google OAuth wiring is present, but credentials must be configured before use.
- OTP generation, storage, verification, expiry, reuse prevention, Resend delivery, and optional Upstash rate limiting are implemented.
- Backend-token hydration exists through `frontend/src/app/api/auth/backend-token/route.js`.
- FastAPI backend owns products, categories, auth, orders, and SSLCommerz payment routes.
- SSLCommerz initiation, success/fail/cancel callbacks, validation, and IPN route files are present.
- `frontend` production build was verified successfully.
- Prisma Client generation was verified successfully.

Known blockers / unfinished work:

- Frontend Prisma schema still needs to be pushed to the production auth database. The direct Supabase host resolved only to IPv6 in the current local environment, so use a Supabase connection pooler URL if direct `5432` cannot connect.
- Secrets that were shared during setup should be rotated before production use: database password, Resend API key, and Upstash token.
- `frontend/tests/e2e/auth-email.spec.js` still describes the old magic-link flow and should be updated for OTP.
- Google login requires real `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- Production SSLCommerz credentials and a public backend URL are required before real payment callbacks can work.

## Architecture

```text
Browser
  |
  | Next.js routes, cart UI, auth UI
  v
frontend/
  |-- NextAuth, Prisma auth tables, OTP email delivery
  |-- Zustand cart/auth state
  |-- Calls FastAPI with NEXT_PUBLIC_API_URL
  v
backend-fastapi/
  |-- Product/category/order/payment APIs
  |-- SQLAlchemy commerce models and Alembic migrations
  |-- SSLCommerz session + callback/IPN handling
  v
PostgreSQL / Redis / SSLCommerz / Resend / Upstash
```

Frontend owns browser authentication and UI. Backend owns commerce state and payments.

Do not move SSLCommerz logic into the frontend. Do not make the frontend directly manage product, order, payment, or category database rows.

## Project Structure

```text
frontend/
  prisma/schema.prisma                 NextAuth User/Account/Session/OTP schema
  src/app/api/auth/send-otp/route.js    OTP generation, storage, rate limit, email send
  src/app/api/auth/[...nextauth]/       OTP and Google sign-in
  src/app/api/auth/backend-token/       NextAuth-to-FastAPI token bridge
  src/app/login                         OTP login UI
  src/app/register                      Signup OTP request UI
  src/app/verify-email                  Signup OTP verification UI
  src/app/forgot-password               Recovery OTP request UI
  src/app/reset-password                Recovery OTP login UI
  src/app/cart                          Cart and payment initiation UI

backend-fastapi/
  app/main.py                           FastAPI app entry
  app/api/v1/api.py                     Router registration
  app/api/v1/endpoints/                 Auth, catalog, order, payment routes
  app/models/models.py                  SQLAlchemy commerce models
  app/services/sslcommerz.py            SSLCommerz service client
  alembic/                              Backend database migrations
  seed.py                               Idempotent seed script
```

## Frontend Workflow

1. Create `frontend/.env.local` from `frontend/.env.example`.
2. For Prisma CLI commands, also provide `frontend/.env` or load `DATABASE_URL` in the shell. Prisma CLI does not automatically read `.env.local`.
3. Install dependencies and prepare Prisma.

```bash
cd frontend
npm install
npx prisma db push
npx prisma generate
npm run dev
```

The frontend runs at `http://localhost:3000`.

Required frontend env vars:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-strong-secret
BACKEND_AUTH_BRIDGE_SECRET=replace-with-strong-secret
DATABASE_URL=postgresql://user:password@host:5432/database
RESEND_API_KEY=re_replace_me
EMAIL_FROM=onboarding@resend.dev
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Optional frontend env vars:

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

OTP behavior:

- `POST /api/auth/send-otp` creates a 6-digit code and stores it in the `OTP` table.
- Codes expire after 10 minutes.
- The latest code for the email is checked during CredentialsProvider sign-in.
- A verified code is marked used and cannot be reused.
- If Resend is missing in development, the OTP is logged to the server console.
- In production, missing Resend config returns an error instead of logging OTP codes.

## Backend Workflow

```bash
cd backend-fastapi
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 5000
```

On macOS/Linux:

```bash
source venv/bin/activate
```

The backend runs at `http://localhost:5000`. API docs are at `http://localhost:5000/docs`.

Required backend env vars:

```env
PROJECT_NAME=ELEVATE API
API_V1_STR=/api
JWT_SECRET=replace-with-strong-secret
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:3000
BACKEND_PUBLIC_URL=http://localhost:5000
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_SANDBOX=true
SSLCOMMERZ_CURRENCY=BDT
```

## Commerce And Payment Flow

1. User signs in through OTP or Google on the frontend.
2. `AuthHydrator` calls `POST /api/auth/backend-token`.
3. The frontend stores the backend bearer token in Zustand.
4. Cart calls `POST /api/payments/initiate` on the FastAPI backend.
5. Backend creates an order and pending payment.
6. Backend requests an SSLCommerz session and returns `gatewayUrl`.
7. Browser redirects to SSLCommerz.
8. SSLCommerz calls backend success/fail/cancel/IPN routes.
9. Backend validates successful payments and updates order/payment status.
10. Backend redirects the browser back to the frontend cart page with payment query params.

Implemented payment routes:

- `POST /api/payments/initiate`
- `GET|POST /api/payments/success`
- `GET|POST /api/payments/fail`
- `GET|POST /api/payments/cancel`
- `GET|POST /api/payments/ipn`

## Checks

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend-fastapi
pytest
```

## Deployment

- Frontend: Vercel.
- Backend: Render.
- Backend must listen on port `5000` unless Render maps it externally.
- Put secrets in provider dashboards only.
- Run Alembic migrations for backend schema changes.
- Run Prisma schema push/migrations for frontend auth schema changes.
- `BACKEND_PUBLIC_URL` must be a public URL in production because SSLCommerz must reach callback and IPN routes.

## Security Notes

- Never commit `.env`, `.env.local`, API keys, database URLs, OTP codes, NextAuth secrets, Resend keys, Redis tokens, Google OAuth secrets, or SSLCommerz credentials.
- Rotate any secret that has been shared in chat, screenshots, logs, or issue comments.
- Keep development-only OTP logging out of production.
