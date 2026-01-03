# 🚀 Deployment Guide

This project is optimized for deployment on **Vercel** (Frontend/API) and **Neon** (Database).

## 1. Prerequisites

- [Vercel Account](https://vercel.com)
- [Neon Account](https://neon.tech)
- [Stripe Account](https://stripe.com)
- GitHub Repository pushed

## 2. Environment Variables

Before deploying, ensure you have the following secrets ready in Vercel Project Settings:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connection string from Neon (Pooled Mode recommended) |
| `AUTH_SECRET` | Random string for session encryption (`npx auth secret`) |
| `AUTH_URL` | Your production domain (e.g., `https://my-saas.vercel.app`) |
| `GEMINI_API_KEY` | Google AI Studio API Key |
| `STRIPE_SECRET_KEY` | Stripe Secret Key (Live Mode) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Public Key (Live Mode) |
| `STRIPE_WEBHOOK_SECRET` | Secret from Stripe Webhook Dashboard (Endpoint: `/api/webhooks/stripe`) |

## 3. Database Migration (Production)

Once your database is connected, you need to push the schema to production:

1. **Get the production connection string** from Neon.
2. **Run migration from local terminal**:
   ```bash
   # Create a temporary .env.prod file or just pass the var inline
   DATABASE_URL="postgres://user:pass@prod-host/neondb" npm run db:push
   ```
   *Tip: It's safer to run `db:push` from your local machine to the production DB than to run it efficiently in the build step, though you can configure a post-install script if preferred.*

## 4. Deploy to Vercel

1. **Import Project**: Go to Vercel Dashboard -> Add New -> Project -> Import from GitHub.
2. **Configure Settings**:
   - Framework: **Next.js**
   - Root Directory: `my-saas-next` (if monorepo) or `./`
   - Build Command: `npm run build`
   - Install Command: `npm install`
3. **Environment Variables**: Copy-paste your secrets from Step 2.
4. **Deploy**: Click **Deploy**.

## 5. Post-Deployment Checks

- **Stripe Webhook**: Update your Stripe Webhook URL to `https://your-domain.com/api/webhooks/stripe`.
- **Auth Provider**: Add your production domain to Google/GitHub OAuth Authorized Origins.
- **Seeding (Optional)**: If you want demo data in production, run:
  ```bash
  DATABASE_URL="prod_url" npm run db:seed
  ```
