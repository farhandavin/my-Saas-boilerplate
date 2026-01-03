# 🔧 Troubleshooting Guide

This guide covers common issues you might encounter when developing or deploying the SaaS Boilerplate.

## 🔴 Critical Issues

### 1. Redis Connection Timeout (Vercel Serverless)

**Symptoms:**
- API requests fail with 504 Gateway Timeout.
- Logs show `IORedis: ConnectionTimeout` or `ECONNRESET`.
- Happens frequently on "Cold Starts".

**The Cause:**
Vercel Serverless functions freeze execution when not active. If a Redis connection is kept open (or the client tries to reconnect during a freeze), it can hang.

**The Fix:**
We use `@upstash/redis` (HTTP-based) instead of `ioredis` (TCP-based) in `src/lib/redis.ts` to avoid this entirely. If you are still seeing this, ensure you are NOT using a TCP-based client in your own code modules.

If you *must* use a TCP client (e.g. for subscriptions), add this to your connection logic:
```typescript
// Ensure connection is closed after execution if possible, 
// or use global instance check for hot reloads.
if (process.env.NODE_ENV !== 'production') globalThis.redis = redis
```

**For Upstash HTTP (Current Implementation):**
If you see timeouts with the HTTP client, you are likely hitting an Upstash rate limit or region latency issue.
1. Check Upstash Console for "Request Limit Exceeded".
2. Ensure your Vercel Region matches your Upstash Region (e.g., both in `us-east-1`).

---

### 2. Database `Too many clients`

**Symptoms:**
- Postgres throws `FATAL: sorry, too many clients already`.

**The Fix:**
Next.js in dev mode hot-reloads rapidly, creating new DB connections.
1. Ensure `src/lib/db.ts` uses the global singleton pattern (already implemented).
2. If using Prisma, ensure you rarely instantiate `new PrismaClient()` outside the export.

---

### 3. Build Fails: "Type error: Property '...' does not exist on type '...'"

**Cause:**
Usually happens when `prisma generate` hasn't updated the client after a schema change.

**Fix:**
```bash
npx prisma generate
```
Re-run this command whenever you change `schema.prisma`.

---

## 🟡 UI/UX Issues

### 1. Styles Not Applying (Tailwind)
**Fix:**
- Ensure your component is inside `src/app` or `src/components`.
- If you added a new folder (e.g., `src/modules`), add it to `tailwind.config.ts`:
```ts
content: [
  // ...
  "./src/modules/**/*.{js,ts,jsx,tsx}",
],
```

### 2. Icons Missing
- We use `lucide-react`. If an icon fails to import, check if you are using the correct name (PascalCase).
