# ⚡️ EmailCamp

> **Enterprise-Grade Email Campaign Orchestration Engine**
> Built for absolute scale, precision tracking, and autonomic delivery.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🚀 Mission Profile
**EmailCamp** transforms complex email delivery into a streamlined, highly visual operation. Architected from the ground up using the **Next.js App Router**, it couples an elite **Drag & Drop Visual Builder** with an industrial **AWS SES / SNS Parallel Dispatch Engine** to provide sub-second open/click tracking and autonomic scheduling.

## 🔥 Elite Features

### 🛠️ Advanced Orchestration
- **Drag & Drop Visual Editor:** Professional-grade template builder powered by Unlayer.
- **Autonomic Cron Scheduling:** Fully asynchronous dispatch runner firing queued broadcasts without user presence.
- **Parallel Burst Delivery:** High-concurrency dispatch architecture using optimized batch processing.

### 👤 Audience Intelligence
- **High-Fidelity Contact Profiles:** Drill deep into individual lifecycle timelines tracking every Open, Click, and Delivery event.
- **Intelligent List Segmentation:** Dynamically group vectors and dynamically filter targeting inside campaign wizardry.
- **Smart CSV Ingestion:** Context-aware automatic bulk imports mapping contacts straight into active segmentation groups.

### 📊 Real-Time Retrospective Analytics
- **Dynamic Link Tunneling:** High-speed Regex link rewriter injecting absolute telemetry tunnels on the fly.
- **Live Telemetry Feeds:** Visual aggregated dashboards monitoring global click-through and delivery rates.
- **Automated Bounce Defenses:** Dynamic AWS Webhook handler instantly blacklisting problematic recipients via SNS.

### 🔐 Enterprise Security
- **Clerk Auth Synchronization:** Multi-tenant organization context strict security enforcing role-based (Admin, Manager, Viewer) boundaries.
- **Middle-Tier Interception:** Universal auth trap ensuring absolute physical environment containment.

---

## 🛠️ Technical Architecture

```mermaid
graph TD
    A[Client Browser] -->|Auth Flow| B(Clerk Identity)
    B -->|Valid Session| C[Next.js App Router]
    C -->|ORM Queries| D[(PostgreSQL + Prisma)]
    C -->|Webhook Tunnel| E(AWS SNS)
    C -->|Parallel Burst| F[AWS SES Dispatch]
    C -->|Internal Heartbeat| G["/api/cron/dispatch"]
    G -->|Autonomic Trigger| F
    F -->|Event Callback| E
    E -->|Blacklist Logic| D
```

### 🛸 The Stack
- **Core Framework:** Next.js 15 (React 19, App Router)
- **Database Layer:** Prisma ORM + Neon PostgreSQL Serverless
- **Authentication:** Clerk (Enterprise Multi-Tenancy)
- **Email Substrate:** AWS SDK (SES for delivery, SNS for webhook handshakes)
- **Styling Paradigm:** Tailwind CSS + Framer Motion (Glassmorphic aesthetic)
- **Visualization:** Recharts Data Visualization

---

## 🛠️ Orbital Deployment

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Snehitha2706/EmailCamp.git
cd EmailCamp
```

### 2️⃣ Install Core Substrate
```bash
npm install
```

### 3️⃣ Define Environmental Vector
Create a `.env` file in the root directory specifying the coordinates below:
```env
# System Matrix
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Persistence Layer
DATABASE_URL="postgresql://user:pass@endpoint/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@endpoint/db?sslmode=require"

# AWS Arsenal
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

### 4️⃣ Initiate Engine ignition
```bash
npx prisma db push
npm run dev
```

---

## ⚖️ Intellectual License
Engineered as high-tier proprietary orchestration architecture. 
&copy; 2026 EmailCamp. All Operational Vectors Released.
