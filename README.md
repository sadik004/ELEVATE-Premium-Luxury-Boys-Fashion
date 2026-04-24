# ELEVATE — Premium Luxury Boys Fashion

> Ultra-premium e-commerce platform for luxury boys' fashion

## Overview

ELEVATE is a full-stack luxury e-commerce platform dedicated to high-end boys' fashion. Designed with a focus on an ultra-premium dark aesthetic, the application features an engaging, interactive 3D frontend powered by React Three Fiber and GSAP animations.

The system utilizes a dual-stack architecture:
- **Frontend (Next.js, NextAuth)**: Strictly handles User Interface, State Management (Zustand), and Authentication (via NextAuth CredentialsProvider for custom OTP-based email login and Google OAuth).
- **Backend (FastAPI)**: Strictly handles Core Business Logic, product catalog management, payment processing (SSLCommerz), and robust Redis caching.

A legacy **Express.js** backend is also maintained in the repository as a fallback.

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router), React 19
- **Authentication:** NextAuth (OTP + Google) via Prisma ORM
- **3D & Rendering:** Three.js, @react-three/fiber, @react-three/drei
- **Animations:** GSAP (ScrollTrigger plugin)
- **State Management:** Zustand
- **Styling:** Tailwind CSS

### Core Backend (FastAPI)
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **ORM:** SQLAlchemy (with Asyncpg) & Alembic for migrations
- **Caching:** Redis (redis.asyncio) & fastapi-cache2
- **Database:** PostgreSQL (Neon)
- **Authentication Services:** JWT (PyJWT), Passlib (bcrypt)
- **Payments:** SSLCommerz Integration

---

## Project Architecture

### Folder Structure
```text
.
├── AGENTS.md                  # Strict rules and guidelines for AI agents
├── README.md                  # Main documentation for human developers
├── backend-fastapi/           # Primary FastAPI REST API
│   ├── alembic/               # Alembic database migrations
│   ├── app/                   # API core application logic
│   │   ├── api/               # API endpoints/routers
│   │   ├── core/              # Core configurations and security
│   │   ├── crud/              # Database CRUD operations
│   │   ├── db/                # Database session and setup
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic schemas for request/response validation
│   │   ├── services/          # External services integration (e.g., payments)
│   │   └── main.py            # FastAPI application entry point
│   ├── tests/                 # Pytest test suite
│   ├── requirements.txt       # Python dependencies
│   └── seed.py                # Database seed script
├── backend/                   # Legacy Express.js REST API (Fallback)
│   ├── middleware/            # Express middlewares (e.g., auth.js)
│   ├── prisma/                # Prisma schema and seed scripts
│   ├── routes/                # API route definitions (auth, categories, orders, products)
│   ├── utils/                 # Utility functions (e.g., email.js)
│   └── server.js              # Entry point for backend
└── frontend/                  # Next.js Application
    ├── prisma/                # Next.js frontend Prisma schema for NextAuth
    ├── public/                # Static assets (SVGs, icons)
    ├── src/                   # Source code
    │   ├── app/               # Next.js App Router pages and API routes
    │   │   ├── api/           # Backend-for-Frontend API endpoints
    │   │   │   └── auth/      # NextAuth config and OTP logic (/send-otp)
    │   │   ├── login/         # Custom OTP email & Google login page
    │   │   ├── cart/          # Cart UI
    │   │   └── ...            # Other application pages
    │   ├── components/        # Reusable React UI components
    │   ├── lib/               # Utility libraries (e.g., API client, Prisma singleton)
    │   └── middleware.js      # Edge middleware for route protection and rate limiting
    ├── tests/                 # E2E frontend test suite
    ├── next.config.mjs        # Next.js configuration and remote patterns
    ├── tailwind.config.js     # Tailwind CSS configuration
    └── package.json           # Frontend dependencies
```

---

## 🛠 Frontend Local Setup

The frontend is a modern Next.js 15 application utilizing App Router and Prisma.

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Execution
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   *(Requires legacy peer deps due to Next/React 19, Tailwind, & Three.js interactions)*
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Configure Environment Variables:**
   Copy the example `.env` file or ensure the following are set in `.env.local`:
   ```bash
   # Authentication Database (Prisma)
   DATABASE_URL="postgresql://user:password@localhost:5432/elevate_db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret"

   # Backend Connection
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   ```
4. **Generate Prisma Client & Sync Database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *(The frontend will run on http://localhost:3000)*

---

## ⚙️ Backend Local Setup

The modern backend is powered by Python and FastAPI, serving as the core engine for products and orders.

### Prerequisites
- Python 3.10+
- PostgreSQL
- Redis Server

### Installation & Execution
1. **Navigate to the modern backend directory:**
   ```bash
   cd backend-fastapi
   ```
2. **Create and activate a Python virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure Environment Variables:**
   Create a `.env` file in `backend-fastapi` requiring `DATABASE_URL` and `REDIS_URL`.
5. **Run Database Migrations & Seed:**
   ```bash
   alembic upgrade head
   python seed.py
   ```
6. **Start the FastAPI Server:**
   ```bash
   uvicorn app.main:app --reload --port 5000
   ```
   *(The backend runs on http://localhost:5000. Interactive API docs are available at http://localhost:5000/docs)*

---

## Testing

To run the automated tests for the primary FastAPI backend:
```bash
cd backend-fastapi
source venv/bin/activate
PYTHONPATH=. pytest
```

## Features
- **3D Hero Section:** Implemented using Three.js and React Three Fiber to deliver an engaging, immersive visual experience.
- **Animations:** High-performance scroll animations powered by GSAP and ScrollTrigger.
- **Authentication:** Dual-layer architecture handling UI auth via NextAuth on the frontend (Secure 2-step OTP) and securing sensitive data APIs on the backend.
- **Payments:** Integrated with SSLCommerz for secure transactions.
- **Cart Management:** Global state management for an intuitive shopping experience using Zustand.
- **High-Performance API:** The backend utilizes Redis caching on read-heavy routes to drastically reduce API latency.