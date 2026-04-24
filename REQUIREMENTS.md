# ELEVATE Requirements And Workflow

This document lists what the project needs to run, what has already been implemented, and what remains before production.

## Runtime Requirements

Frontend:

- Node.js 18 or newer.
- npm.
- PostgreSQL-compatible database for Prisma auth tables.
- Resend account for OTP email delivery.
- Optional Upstash Redis REST database for OTP rate limiting.
- Optional Google OAuth app for Google sign-in.

Backend:

- Python 3.10 or newer.
- PostgreSQL-compatible database for commerce tables.
- Redis.
- SSLCommerz merchant credentials.
- Public backend URL for production callbacks and IPN.

## Implemented Functional Requirements

Authentication:

- Users can request an OTP by email.
- Users can log in with OTP.
- Users can register by requesting and verifying an OTP.
- Users can recover access with an OTP.
- OTPs expire after 10 minutes.
- OTPs cannot be reused after successful verification.
- OTP email delivery uses Resend when configured.
- OTP requests are rate-limited by Upstash when configured.
- Google OAuth provider is present.

Storefront:

- Product browsing pages exist.
- Product detail route exists.
- Cart page exists.
- Cart state is handled on the frontend.

Commerce backend:

- Product and category APIs exist.
- Backend auth endpoints exist.
- Protected order APIs exist.
- Payment initiation route exists.
- SSLCommerz success, fail, cancel, and IPN routes exist.

Integration:

- Frontend can hydrate a backend bearer token after NextAuth sign-in.
- Cart/payment flow is designed to call FastAPI, not process payments in the frontend.

## Pending Requirements

Before local end-to-end OTP can be considered complete:

- Push `frontend/prisma/schema.prisma` to the auth database.
- Use a working database URL. For Supabase, use the connection pooler if direct host access fails.
- Restart the frontend dev server after env changes.
- Send a real OTP email through Resend and verify it in the browser.

Before production:

- Rotate any exposed secrets.
- Configure Vercel frontend env vars.
- Configure Render backend env vars.
- Configure Resend verified sender/domain.
- Configure Google OAuth credentials if Google login is enabled.
- Configure SSLCommerz production or sandbox credentials.
- Set `BACKEND_PUBLIC_URL` to the public backend URL.
- Run frontend Prisma schema setup.
- Run backend Alembic migrations.
- Replace magic-link e2e coverage with OTP coverage.

## Frontend Env Requirements

Required:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-strong-secret
BACKEND_AUTH_BRIDGE_SECRET=replace-with-strong-secret
DATABASE_URL=postgresql://user:password@host:5432/database
RESEND_API_KEY=re_replace_me
EMAIL_FROM=onboarding@resend.dev
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Optional:

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Notes:

- Keep `frontend/.env.local` for the Next.js dev server.
- Prisma CLI reads `frontend/.env` by default, not `.env.local`.
- Do not commit real env files.

## Backend Env Requirements

Required:

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

## Local Setup Workflow

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
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 5000
```

## OTP Verification Workflow

1. Start frontend.
2. Visit `/login`.
3. Enter an email.
4. Confirm `/api/auth/send-otp` succeeds.
5. Check inbox or development server console for the OTP.
6. Enter the 6-digit OTP.
7. Confirm redirect to `/cart`.
8. Confirm backend token hydration before checkout.

## Payment Verification Workflow

1. Start backend on port `5000`.
2. Start frontend on port `3000`.
3. Sign in through OTP or Google.
4. Add product to cart.
5. Start checkout.
6. Confirm frontend calls `POST /api/payments/initiate`.
7. Confirm backend returns `gatewayUrl`.
8. Complete or cancel on SSLCommerz sandbox.
9. Confirm backend callback updates payment/order status.
10. Confirm browser returns to cart with payment status query params.

## Test And Build Workflow

Frontend build:

```bash
cd frontend
npm run build
```

Backend tests:

```bash
cd backend-fastapi
pytest
```

## Security Requirements

- Never commit real secrets.
- Rotate any secret that appears outside private env storage.
- Do not log OTP codes in production.
- Do not expose database URLs to client-side code.
- Keep SSLCommerz validation backend-only.
- Keep `BACKEND_AUTH_BRIDGE_SECRET` private.
