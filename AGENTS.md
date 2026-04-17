# AI Agent Instructions for ELEVATE

This document outlines strict coding standards, technology stack layers, and common pitfalls to ensure consistent, secure, and accurate development on the ELEVATE e-commerce platform. AI agents MUST read and strictly adhere to these guidelines.

## 1. Tech Layers

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript/JavaScript (React 19)
- **Styling:** CSS Modules ONLY. **Do NOT use Tailwind CSS.**
- **3D & Animation:** @react-three/fiber, @react-three/drei, GSAP (ScrollTrigger plugin).
- **State Management:** Zustand.

### Primary Backend (FastAPI)
- **Framework:** FastAPI (Python)
- **ORM:** SQLAlchemy (with Asyncpg), Alembic for migrations
- **Databases:** PostgreSQL
- **Caching:** Redis (`redis.asyncio` and `fastapi-cache2`)
- **Authentication:** PyJWT, Passlib (bcrypt)

### Legacy Backend (Express.js - Fallback)
- **Framework:** Express.js (Node.js)
- **ORM:** Prisma
- **Databases:** PostgreSQL (Production), SQLite (Local Dev/Testing)
- **Authentication:** JWT (`jsonwebtoken`) and `bcryptjs`.

## 2. Project Structure

```text
.
├── backend-fastapi/           # Primary FastAPI REST API
│   ├── alembic/               # Database migrations
│   ├── app/                   # API core, routes, schemas, crud, models
│   ├── tests/                 # Pytest test suite
│   ├── requirements.txt       # Python dependencies
│   └── seed.py                # Database seed script
├── backend/                   # Legacy Express.js REST API (Fallback)
│   ├── prisma/                # Prisma schema and seed scripts
│   ├── routes/                # API route definitions
│   └── server.js              # Entry point for backend
└── frontend/                  # Next.js Application
    ├── src/                   # React components, pages, and hooks
    ├── next.config.mjs        # Next.js configuration
    └── package.json           # Frontend dependencies
```

## 3. Strict Code Standards & Best Practices

### A. Security Constraints
- **NO HARDCODED SECRETS:** NEVER include API keys, JWT secrets, database connection strings, or any other sensitive information in the code, logs, or commit messages. Always use environment variables (`process.env.XXX` or `.env` files).
- Production backends must enforce strict environment variables (`JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL`) and strict CORS.

### B. Backend (FastAPI & Legacy Prisma)
- **FastAPI Caching:** Always implement Redis caching on read-heavy endpoints (e.g., `/products`, `/categories`) using the `@cache()` decorator from `fastapi-cache2` to drastically reduce page load latency.
- **FastAPI Async:** All I/O bound operations in the FastAPI backend must strictly use `async def` for performance.
- **Database Seeding:** All seed scripts MUST be idempotent. Do not assign auto-increment IDs manually.
- **Foreign Key Constraints:** When performing a complete database reset during seeding, strictly manage deletion order (e.g., clear dependent child records like `OrderItem` before parent records like `Product`).
- **Safe Fallbacks:** API routes must gracefully handle database errors. Do not throw 500 errors; instead, return empty arrays `[]` for lists or 404 for single items.
- Do not modify backend code or configuration when tasks are strictly constrained to frontend modifications.

### C. Frontend
- **Styling:** ALWAYS use CSS Modules. Tailwind is prohibited.
- **Routing & Redirects:** Next.js permanent routing redirects MUST be configured in `next.config.mjs` using `async redirects()`.
- **Image Optimization:** Next.js `<Image />` components must use `fill` and `style={{ objectFit: 'cover' }}`. Their `src` must be dynamically constructed via `NEXT_PUBLIC_API_URL`. Ensure `next.config.mjs` allows the necessary `remotePatterns`.
- **API Fetching:** Include robust try-catch blocks with explicit console logging to identify Network, CORS, or 500 errors when data fetching fails.
- **Dependency Installation:** Always run `npm install --legacy-peer-deps` in the `frontend/` directory to resolve conflicts between Next.js 15, React 19, and @react-three.

### D. General Workflow
- **Clean Workspace:** Always clean up temporary test scripts, verification scripts, and output logs from the working directory before staging files for a commit.
- **Explicit Tracking:** Always explicitly track and stage new files (e.g., `git add .`) before committing to prevent empty commits and empty pull requests. Ensure `__pycache__`, `venv`, `*.pyc`, and `*.db` are ignored.

## 4. Common Commands

*Use these commands to build, test, and run the project.*

**Primary Backend (FastAPI):**
```bash
cd backend-fastapi
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 5000
```

**Testing FastAPI Backend:**
```bash
cd backend-fastapi
source venv/bin/activate
PYTHONPATH=. pytest
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

**Legacy Backend (Express.js):**
```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```
