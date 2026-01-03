# Cron Jobs & Background Tasks

This document explains all scheduled background jobs and how to manage them.

## Overview

Background jobs are powered by [Inngest](https://www.inngest.com/). This provides:
- ✅ Automatic retries with exponential backoff
- ✅ Job scheduling (cron)
- ✅ Dashboard for monitoring
- ✅ Zero-downtime deployments

---

## Available Jobs

### 1. Audit Log Cleanup
**Schedule**: Daily at 3:00 AM UTC (`0 3 * * *`)

Deletes audit logs older than 90 days to prevent unbounded database growth.

**File**: `src/lib/inngest/audit-cleanup.ts`

**Behavior**:
- Deletes from `audit_logs` table
- Deletes from `system_logs` table
- Logs cleanup result to `system_logs`

---

### 2. Webhook Retry
**Trigger**: Event-driven (`webhook/send`)

Sends outgoing webhooks with automatic retry (max 3 attempts).

**File**: `src/lib/inngest/webhook-retry.ts`

**Behavior**:
- Fetches webhook config from database
- Sends HTTP POST with signature
- Logs success/failure in `webhook_deliveries`
- Retries on failure with exponential backoff

---

### 3. Email Queue
**Trigger**: Event-driven (`email/send`, `email/send-batch`)

Sends emails asynchronously via Resend.

**File**: `src/lib/inngest/email-queue.ts`

**Behavior**:
- Single email: `inngest.send({ name: "email/send", data: { to, subject, html } })`
- Batch email: processes in batches of 10

---

## Development

Run the Inngest dev server locally:

```bash
npx inngest-cli@latest dev
```

Visit `http://localhost:8288` to:
- View registered functions
- Trigger test events
- Monitor job execution
- Inspect logs

---

## Production Setup

### Vercel Deployment
1. Add Inngest environment variables:
   ```env
   INNGEST_SIGNING_KEY="..."
   INNGEST_EVENT_KEY="..."
   ```

2. Inngest auto-discovers functions via `/api/inngest` endpoint.

### Manual Cron (Alternative)
If not using Inngest, you can trigger cleanup via HTTP:

```bash
curl -X POST https://your-app.com/api/cron/cleanup \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `INNGEST_SIGNING_KEY` | Yes (prod) | Signing key from Inngest dashboard |
| `INNGEST_EVENT_KEY` | Yes (prod) | Event key for sending events |
| `CRON_SECRET` | Yes | Secret for manual cron endpoints |

---

## Monitoring

In production, jobs are monitored via:
- **Inngest Dashboard**: Real-time job status
- **Sentry**: Error tracking (auto-integrated)
- **System Logs**: `system_logs` table in database
