# ELEVATE — Premium Luxury Boys Fashion

> Ultra-premium e-commerce platform for luxury boys' fashion

## Tech Stack
- **Frontend:** Next.js 15, React, Three.js (@react-three/fiber, @react-three/drei), GSAP, Zustand.
- **Backend:** Express.js, Prisma ORM, SQLite, JWT Authentication.

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy the environment file: `cp .env.example .env`
4. Setup the database and seed data:
   ```bash
   npx prisma db push
   npm run seed
   ```
5. Start the backend server: `npm run dev` (Runs on http://localhost:5000)

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the frontend development server: `npm run dev` (Runs on http://localhost:3000)

## Features
- **3D Hero Section:** Implemented using Three.js and React Three Fiber.
- **Animations:** Scroll animations powered by GSAP.
- **Authentication:** JWT-based user authentication.
- **Cart Management:** State managed globally using Zustand.
- **Products:** Dynamically loaded and seeded from a SQLite database using Prisma.
