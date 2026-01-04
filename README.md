# 🚀 Enterprise Business OS - SaaS Boilerplate

![License](https://img.shields.io/badge/license-Commercial-blue.svg) ![Next.js](https://img.shields.io/badge/next.js-v16-black.svg) ![Drizzle](https://img.shields.io/badge/drizzle-orm-green.svg)

**Enterprise Business OS** is the ultimate foundation for building scalable, production-ready SaaS applications. Engineered with **Next.js 16 (App Router)** and **4 Strategic Pillars** (AI, B2B, Payments, Ops).

Stop building authentication and billing from scratch. Focus on your core business logic.

---

## ✨ Key Features

- **🧠 AI-Native:** Built-in Google Gemini integration for CEO Digest and RAG Chat.
- **🏗️ Enterprise Architecture:** Unified Next.js Monorepo structure.
- **🔐 Secure Authentication:** Complete flow with Auth.js (JWT, Google OAuth).
- **💳 Stripe Integration:** Hybrid Billing (Subscription + Usage-based).
- **👥 Multi-Tenancy:** Secure data isolation with RLS (Row Level Security).
- **🎨 Premium UI:** Custom Tailwind CSS + Shadcn UI design system.

---

## 🚀 Installation Guide

### Prerequisites
- Node.js v18.17.0+
- PostgreSQL Database (Neon/Supabase)
- Stripe Account
- Google Cloud Console Project

### 1. Setup Project
Since you purchased the boilerplate, simply unzip the file.

```bash
# 1. Navigate to the project folder
cd my-saas-next

# 2. Install dependencies
npm install

# 3. Configure Environment
cp .env.example .env
# (Fill in your API keys in .env)
```

### 2. Run Database Migration

```bash
# Sync schema with your remote DB
npx drizzle-kit push
```

### 3. Start Development

```bash
npm run dev
# App runs at http://localhost:3000
```

---

## 🔑 Environment Variables Reference

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pass@host/db?sslmode=require` |
| `AUTH_SECRET` | Auth.js Secret (run `npx auth secret`) | `supersecretkey` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Public Key | `pk_test_...` |
| `GEMINI_API_KEY` | Google AI Studio Key | `AIzaSy...` |
| `NEXT_PUBLIC_APP_URL` | App Domain | `http://localhost:3000` |

---

## 📂 Project Structure

```bash
my-saas-next/
├── src/
│   ├── app/              # Next.js App Router Pages
│   ├── components/       # Reusable UI Components
│   ├── db/               # Drizzle Schema & Config
│   ├── lib/              # Core Utilities (Stripe, Auth, AI)
│   ├── services/         # Business Logic Layer
│   └── actions/          # Server Actions
├── drizzle/              # SQL Migrations
├── public/               # Static Assets
└── tests/                # Playwright E2E Tests
```

---

## 📚 Documentation & Support

* **Full Documentation:** See `/docs` folder or run `cd docs && npm start`
* **Support:** Email farhandavin14@gmail.com
* **License:** See [LICENSE.md](./LICENSE.md)

---

© 2026 Farhan Davin. All rights reserved.