# ELEVATE — Premium Luxury Boys Fashion

> Ultra-premium e-commerce platform for luxury boys' fashion

## Overview

ELEVATE is a full-stack luxury e-commerce platform dedicated to high-end boys' fashion. Designed with a focus on an ultra-premium dark aesthetic, the application features an engaging, interactive 3D frontend powered by React Three Fiber and GSAP animations.

The system utilizes a dual-stack architecture:
- **Frontend**: A Next.js 15 (App Router) application that handles all User Interface, State Management (Zustand), and Authentication (via NextAuth and PrismaAdapter).
- **Core Backend**: A modern **FastAPI** Python application that serves as the source of truth for core business logic, product catalog management, payment processing (SSLCommerz), and robust Redis caching.

A legacy **Express.js** backend is also maintained in the repository as a fallback.

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router), React 19
- **Authentication:** NextAuth (using PrismaAdapter)
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

### Legacy Fallback Backend (Express.js)
- **Framework:** Express.js (Node.js)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken) and bcryptjs

## Project Architecture

### Folder Structure
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

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js (v18+ recommended)
- PostgreSQL
- Redis Server
- npm

### 1. Core Backend Setup (FastAPI)
1. Navigate to the modern backend directory:
   ```bash
   cd backend-fastapi
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the environment variables by creating a `.env` file based on your local setup (requires `DATABASE_URL` and `REDIS_URL`).
5. Run database migrations:
   ```bash
   alembic upgrade head
   ```
6. Seed the database:
   ```bash
   python seed.py
   ```
7. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 5000
   ```
   *(Runs on http://localhost:5000. API docs available at http://localhost:5000/docs)*

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (requires legacy peer deps due to Next/React 19, Tailwind, & Three.js interactions):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *(Runs on http://localhost:3000)*

### 3. Legacy Backend Setup (Express.js - Fallback Only)
1. Navigate to the legacy backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   ```
4. Setup the database and seed data:
   ```bash
   npx prisma db push
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *(Runs on http://localhost:5000)*

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
- **Authentication:** Dual-layer architecture handling UI auth via NextAuth on the frontend and securing sensitive data APIs on the backend.
- **Payments:** Integrated with SSLCommerz for secure transactions.
- **Cart Management:** Global state management for an intuitive shopping experience using Zustand.
- **High-Performance API:** The backend utilizes Redis caching on read-heavy routes to drastically reduce API latency.