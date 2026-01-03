# 🚀 Deployment Guide (Vercel)

This project is optimized for deployment on **Vercel**. It consists of two parts that should be deployed as **separate Vercel Projects**:

1.  **Main Application** (`my-saas-next`) - The SaaS App.
2.  **Documentation** (`docs`) - The Docs Site.

---

## 📦 Part 1: Deploying Main App

### 1. Push to GitHub
Ensure your code is pushed to a GitHub repository.

### 2. Import to Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/new).
2.  Import your repository.
3.  **Framework Preset**: Select `Next.js`.
4.  **Root Directory**: Click `Edit` and select `my-saas-next`. ⚠️ **Crucial Step!**

### 3. Environment Variables
Copy these from your local `.env`. You must set these in Vercel under **Settings > Environment Variables**:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Postgres Connection String (Supabase/Neon) |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `AUTH_URL` | Set to `https://your-project.vercel.app` (exclude paths) |
| `NEXT_PUBLIC_APP_URL` | Same as `AUTH_URL` |
| `NEXT_PUBLIC_DOCS_URL` | URL of your deployed docs (Part 2) |
| `PII_MASKING_ENABLED` | `true` or `false` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GEMINI_API_KEY` | Google AI Studio Key |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks |
| `RESEND_API_KEY` | Email Service Key |
| `UPSTASH_REDIS_REST_URL` | Upstash Console |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Console |

> **Note**: For `AUTH_URL`, Vercel automatically sets `VERCEL_URL`, but it's safer to explicitly set `AUTH_URL` once you have your production domain.

### 4. Deploy
Click **Deploy**. Vercel will build your Next.js app.

---

## 📚 Part 2: Deploying Documentation

### 1. New Project
1.  Go to Vercel Dashboard -> **Add New...** -> **Project**.
2.  Import the **SAME** repository again.

### 2. Configure Directory
1.  **Project Name**: e.g., `my-saas-docs`.
2.  **Framework Preset**: Select `Other` or `Docusaurus` (if detected).
3.  **Root Directory**: Click `Edit` and select `docs/docs` (Wait, check your structure).
    Since we moved files to `docs/docs`, the actual Docusaurus app root is `docs`.
    **Root Directory**: Select `docs`.

### 3. Build Command (If custom)
Default Docusaurus output directory is `build`.
- Build Command: `npm run build`
- Output Directory: `build`

### 4. Deploy
Click **Deploy**. Your docs will live at `https://my-saas-docs.vercel.app`.

---

## 🔗 Part 3: Connecting Them

1.  Take the URL from **Part 2** (e.g., `https://my-saas-docs.vercel.app`).
2.  Go to **Part 1 (Main App)** -> Settings -> Environment Variables.
3.  Update `NEXT_PUBLIC_DOCS_URL` with the new Docs URL.
4.  Redeploy Part 1.

Now `npm run dev:all` locally and Vercel production are perfectly synced!
