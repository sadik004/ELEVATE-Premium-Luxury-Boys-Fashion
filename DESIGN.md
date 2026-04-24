# ELEVATE Design And Architecture

This document explains how the application is shaped, why responsibilities are split the way they are, and how a new developer should reason about changes.

## Product Goal

ELEVATE is a premium boys' fashion e-commerce experience. The frontend should feel polished and luxury-focused, while the backend should remain practical, reliable, and explicit about catalog, order, and payment state.

## System Design

ELEVATE uses two applications:

- `frontend/`: Next.js app for customer experience, authentication, cart UI, and auth database records.
- `backend-fastapi/`: FastAPI app for commerce APIs, order persistence, and SSLCommerz payments.

The split is intentional. NextAuth is strongest inside the Next.js app, while commerce and payment flows are safer in the backend where order/payment state can be validated and updated centrally.

## Frontend Design

The frontend is responsible for:

- Storefront pages and navigation.
- Product browsing and cart interactions.
- OTP login, signup verification, recovery login, and Google OAuth.
- Auth session management through NextAuth.
- Auth persistence through Prisma tables.
- Calling backend commerce APIs using `NEXT_PUBLIC_API_URL`.

Key frontend routes:

- `/`: landing/storefront entry.
- `/shop`: catalog browsing.
- `/product/[slug]`: product detail.
- `/cart`: cart and checkout entry.
- `/login`: OTP login.
- `/register`: signup OTP request.
- `/verify-email`: signup OTP verification.
- `/forgot-password`: recovery OTP request.
- `/reset-password`: recovery OTP login.

Key frontend API routes:

- `/api/auth/send-otp`: create and send OTP.
- `/api/auth/[...nextauth]`: NextAuth OTP and Google provider.
- `/api/auth/backend-token`: bridge from NextAuth session to FastAPI bearer token.

Frontend visual direction:

- Premium, editorial, high-contrast luxury tone.
- Gold accents may be used, but avoid making every surface the same color family.
- Use restrained UI controls for checkout and account flows.
- Keep forms clear, direct, and mobile-safe.

## Backend Design

The backend is responsible for:

- Product and category APIs.
- Backend users and bearer-token auth for protected commerce APIs.
- Order creation and order history.
- Payment initiation, status updates, validation, callbacks, and IPN.
- Commerce database models and migrations.
- Redis-backed caching for read-heavy catalog routes.

Main backend route groups:

- `/api/auth`
- `/api/categories`
- `/api/products`
- `/api/orders`
- `/api/payments`

The backend must run on port `5000` locally so the frontend default API URL works consistently.

## Data Ownership

Frontend database tables:

- `User`
- `Account`
- `Session`
- `OTP`

Backend database tables:

- Commerce users
- Categories
- Products
- Orders
- Order items
- Payments

Do not merge these ownership boundaries without a deliberate migration plan.

## OTP Auth Design

OTP auth is implemented inside the frontend because it is tied to NextAuth session creation.

Flow:

1. User submits an email.
2. `/api/auth/send-otp` normalizes the email.
3. Upstash rate limiting runs if configured.
4. A 6-digit OTP is generated.
5. OTP is stored with `expiresAt` and `verified=false`.
6. Resend sends the email.
7. User submits OTP through NextAuth CredentialsProvider.
8. The latest OTP for that email is checked.
9. Expired, wrong, or already-used OTPs are rejected.
10. Valid OTP is marked verified.
11. A Prisma user is created or updated.
12. NextAuth session is issued.

Development-only behavior:

- If `RESEND_API_KEY` is missing and `NODE_ENV` is not production, the OTP is logged to the server console.

Production behavior:

- Missing Resend config returns an error.
- OTP codes must not be logged.

## Backend Token Bridge

NextAuth authenticates the browser, but FastAPI protects commerce APIs with its own bearer token. The bridge route solves that mismatch:

1. Browser has a valid NextAuth session.
2. `AuthHydrator` calls `/api/auth/backend-token`.
3. The route logs into or registers the matching backend user.
4. The returned backend JWT is stored in frontend auth state.
5. Cart/order/payment calls use that backend token.

`BACKEND_AUTH_BRIDGE_SECRET` must stay private because it participates in deterministic backend credential generation for bridged users.

## Payment Design

SSLCommerz is backend-owned.

Flow:

1. Frontend sends checkout request to `POST /api/payments/initiate`.
2. Backend creates an order.
3. Backend creates a pending payment row.
4. Backend creates an SSLCommerz session.
5. Backend returns the gateway URL.
6. Browser goes to SSLCommerz.
7. SSLCommerz calls backend callback/IPN routes.
8. Backend validates payment and updates order/payment status.
9. Backend redirects user back to the frontend cart page.

Never trust frontend-only payment status. Treat SSLCommerz validation and backend payment rows as the source of truth.

## Environment Design

Frontend env is separate from backend env.

Frontend needs:

- NextAuth URL and secret.
- Prisma auth database URL.
- Resend email key and sender.
- Optional Upstash rate limit config.
- Optional Google OAuth config.
- Backend API URL.
- Backend auth bridge secret.

Backend needs:

- Backend database URL.
- Redis URL.
- JWT secret.
- Frontend URL.
- Public backend URL.
- SSLCommerz credentials.

Do not commit real env files.

## Deployment Design

Frontend:

- Deploy on Vercel.
- Configure env vars in Vercel dashboard.
- Run Prisma auth schema setup against the auth database.

Backend:

- Deploy on Render.
- Configure env vars in Render dashboard.
- Run Alembic migrations.
- Expose a public backend URL for SSLCommerz callbacks.

## Known Design Debt

- The old magic-link e2e test should be replaced with an OTP test.
- Supabase direct DB connection may fail on environments without IPv6 support; use the pooler URL.
- Auth and commerce currently use separate user records bridged by email. This is acceptable for now, but future account management should document how profile changes sync across both systems.
