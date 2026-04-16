# AI Agent Instructions for ELEVATE

This document outlines strict coding standards, technology stack layers, and common pitfalls to ensure consistent, secure, and accurate development on the ELEVATE e-commerce platform. AI agents MUST read and strictly adhere to these guidelines.

## 1. Tech Layers

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript/JavaScript (React 19)
- **Styling:** CSS Modules ONLY. **Do NOT use Tailwind CSS.**
- **3D & Animation:** @react-three/fiber, @react-three/drei, GSAP (ScrollTrigger plugin).
- **State Management:** Zustand.

### Backend
- **Framework:** Express.js (Node.js)
- **ORM:** Prisma
- **Databases:** PostgreSQL (Strictly for Production), SQLite (Strictly for Local Dev/Testing)
- **Authentication:** JWT (jsonwebtoken) and bcryptjs.

## 2. Project Structure

```text
.
├── backend/                   # Express.js REST API
│   ├── middleware/            # Express middlewares (e.g., Auth)
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
- **NO HARDCODED SECRETS:** NEVER include API keys, JWT secrets, database connection strings, or any other sensitive information in the code, logs, or commit messages. Always use environment variables (`process.env.XXX`).
- Production backend must enforce `NODE_ENV=production`, require `JWT_SECRET`, `DATABASE_URL`, and `FRONTEND_URL`, and use strict CORS.

### B. Backend & Prisma
- **Idempotent Database Seeding:** All Prisma seed scripts MUST be idempotent. Use `createMany` with `skipDuplicates: true` and rely on unique fields (e.g., `slug`) to prevent duplicate data on restarts. Do not assign auto-increment IDs manually.
- **Foreign Key Constraints:** When performing a complete database reset during seeding, strictly manage deletion order (e.g., clear dependent child records like `OrderItem` before parent records like `Product`).
- **Safe Fallbacks:** API routes must gracefully handle database errors (including Prisma missing table errors). Do not throw 500 errors; instead, return empty arrays `[]` for lists or 404 for single items.
- **Model Field Defaults:** Seed scripts must ensure all required model fields exist before insertion, applying default values dynamically if missing from the dataset.
- Do not modify backend code or configuration (e.g., altering Prisma schema to use SQLite locally) when tasks are strictly constrained to frontend modifications.

### C. Frontend
- **Styling:** ALWAYS use CSS Modules. Tailwind is prohibited.
- **Routing & Redirects:** Next.js permanent routing redirects MUST be configured in `next.config.mjs` using `async redirects()` rather than component-level redirects.
- **Image Optimization:** Next.js `<Image />` components must use `fill` and `style={{ objectFit: 'cover' }}`. Their `src` must be dynamically constructed via `NEXT_PUBLIC_API_URL`. Ensure `next.config.mjs` allows the necessary `remotePatterns`.
- **API Fetching:** Include robust try-catch blocks with explicit console logging to identify Network, CORS, or 500 errors when data fetching fails.
- **Dependency Installation:** Always run `npm install --legacy-peer-deps` in the `frontend/` directory to resolve conflicts between Next.js 15, React 19, and @react-three.

### D. General Workflow
- **Clean Workspace:** Always clean up temporary test scripts, verification scripts, and output logs from the working directory before staging files for a commit.
- **Explicit Tracking:** Always explicitly track and stage new files (e.g., `git add .`) before committing to prevent empty commits and empty pull requests.

## 4. Common Commands

*Use these commands to build, test, and run the project.*

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
