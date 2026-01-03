---
sidebar_label: Installation Guide
sidebar_position: 3
title: Installation Guide
---

# 🚀 Installation & Configuration Guide

Welcome to the **Enterprise OS**. This guide is designed to help you set up the entire application from scratch, including how to obtain every single API key required.

## ✅ Prerequisites

*   **Node.js** (v18.17.0+)
*   **Git**
*   **Stripe CLI** (Required for local payment testing)

---

## 🛠️ Step 1: Clone & Install

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd my-saas-next

# 2. Install dependencies
npm install
```

---

## 🔑 Step 2: Environment Variables (The Important Part)

The application relies on several services. Rename `.env.example` to `.env`:

```bash
cp .env.example .env
```

Now, let's fill in each section.

### 1. Database (PostgreSQL)
We recommend **Neon** or **Supabase** for a managed Serverless Postgres.

*   **Provider**: [Neon.tech](https://neon.tech) / [Supabase.com](https://supabase.com)
*   **Action**: Create a new project.
*   **Get Key**: Look for "Connection String". It looks like:
    `postgresql://user:password@host/dbname?sslmode=require`
*   **Set in .env**: `DATABASE_URL`

### 2. Authentication (Auth.js)
This secures your app.

*   **Action**: Open your terminal inside the project folder.
*   **Run**: `npx auth secret`
*   **Set in .env**: `AUTH_SECRET` (Copy the generated string)

### 3. Google OAuth & AI (Gemini)
Used for "Login with Google" and AI features.

*   **Provider**: [Google Cloud Console](https://console.cloud.google.com/)
*   **Action**:
    1.  Create a New Project.
    2.  Go to **APIs & Services > Credentials**.
    3.  Click **Create Credentials > OAuth Client ID**.
    4.  Application Type: **Web Application**.
    5.  **Authorized Javascript Origins**: `http://localhost:3000`
    6.  **Authorized Redirect URIs**: `http://localhost:3000/api/auth/google/callback`
*   **Set in .env**: `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`

**For AI (Gemini):**
*   **Provider**: [Google AI Studio](https://aistudio.google.com/)
*   **Action**: "Get API Key" -> Create key in new project.
*   **Set in .env**: `GEMINI_API_KEY`

### 4. Stripe (Payments)
*   **Provider**: [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
*   **Get Keys**: Go to **Developers > API keys**.
*   **Set in .env**: 
    *   `STRIPE_SECRET_KEY` (starts with `sk_test_...`)
    *   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_...`)

**Setup Webhook (Crucial for testing):**
1.  Open a new terminal.
2.  Run `stripe login`.
3.  Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
4.  Copy the `whsec_...` key shown in the terminal.
5.  **Set in .env**: `STRIPE_WEBHOOK_SECRET`

**Setup Price IDs:**
1.  Go to **Product Catalog** in Stripe.
2.  Create two products: "Pro Plan" and "Enterprise Plan".
3.  Add a price for each (e.g., $29/month).
4.  Copy the **Price ID** (starts with `price_...`).
5.  **Set in .env**: `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` & `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`.

### 5. Email (Resend)
Used for sending magic links and notifications.

*   **Provider**: [Resend.com](https://resend.com)
*   **Action**: Create API Key.
*   **Set in .env**: `RESEND_API_KEY`

### 6. Upstash (Rate Limiting)
Protects your API from spam.

*   **Provider**: [Upstash Console](https://console.upstash.com/)
*   **Action**: Create Redis Database.
*   **Get Keys**: Scroll to "REST API" section.
*   **Set in .env**: `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`.

---

## 🗄️ Step 3: Database Migration

Sync your local code schema with your remote database.

```bash
npx drizzle-kit push
```

---

## 🚀 Step 4: Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`. You are ready to go!