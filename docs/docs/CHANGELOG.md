# Changelog

All notable changes to **Enterprise Business OS** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-01-03

### 🎉 Major Release: Enterprise-Grade Features

This release transforms the boilerplate into a production-ready, enterprise-grade SaaS platform with AI-native features and SOC2 compliance readiness.

### ✨ Added

#### AI & Intelligence
- **CEO Digest**: Automated daily executive summaries generated via AI (Inngest cron job)
- **AI Pre-Check**: Validates invoices and critical data against company policies before saving
- **Internal RAG (Retrieval-Augmented Generation)**: Chat with company documents (PDF/TXT) using pgvector embeddings
- **PII Masking Layer**: AES-256-GCM encryption for automatic sensitive data redaction before AI processing
- **AI Service Decoupling**: Generic AI provider interface supporting Google Gemini and OpenAI

#### Multi-Tenancy & RBAC
- **Hybrid Multi-Tenancy**: Shared database for standard tier, dedicated database option for enterprise
- **Granular RBAC**: 4 built-in roles (Owner, Admin, Manager, Staff) enforced at middleware, API, and UI levels
- **Team Management**: Invite members via email with token-based acceptance flow
- **Audit Logs**: Comprehensive activity tracking with 90-day retention (configurable via cron cleanup)

#### Billing & Payments
- **Stripe Webhook Idempotency**: Atomic operations to prevent double-billing
- **Usage-Based Billing**: Metered billing logic for AI token consumption with overage calculations
- **Dunning Management**: Automated payment failure handling with escalation emails
- **Invoice Generation**: PDF generation and automated notifications

#### Security & Compliance
- **Hardened Secrets**: Removed fallback values - app crashes if critical secrets missing
- **Rate Limiting**: Upstash Redis-based rate limiting on all API routes
- **Secure Headers**: Pre-configured CSP, X-Frame-Options, XSS protection
- **Zod Validation**: Type-safe input validation on all API endpoints
- **Database Indexes**: 8+ optimized indexes for multi-tenancy query performance

#### Developer Experience
- **One-Click Local Setup**: `npm run setup:local` automates environment configuration
- **Docker Compose**: Local PostgreSQL for development (optional)
- **Environment Validator**: Startup script checks for missing critical environment variables
- **Code Scaffolding**: `npm run generate` creates module boilerplate (service, schema, tests)
- **Concurrent Dev Mode**: `npm run dev:all` runs Next.js + Stripe CLI + Inngest in one terminal

#### Testing & Quality
- **E2E Test Suite**: 20+ Playwright tests covering auth, RBAC, projects, teams
- **Unit Tests**: Vitest configuration with coverage reporting
- **Load Testing Guide**: k6 scripts for performance benchmarking
- **UTF-8 Encoding**: Standardized across all files

#### Documentation
- **SOC2 Compliance Docs**: Security policy and compliance checklist (SECURITY.md)
- **Load Testing Guide**: Performance benchmarking with k6 (LOAD_TESTING.md)
- **Cron Jobs Documentation**: Scheduled task setup and monitoring (CRON.md)
- **Comparison Guide**: Feature comparison vs ShipFast, Divjoy, SaasRock (COMPARISON.md)
- **Buyer's Guide**: ROI calculator and value proposition (buyers-guide.md)
- **Quick Start Guide**: 5-minute setup walkthrough (QUICK_START.md)

### 🔧 Changed

- **Upgraded to Next.js 16**: Latest App Router with enhanced caching capabilities
- **Switched to Drizzle ORM**: Migrated from Prisma for better type safety and performance
- **Custom JWT Authentication**: Edge-compatible auth replacing Auth.js for full RBAC control
- **Structured Logging**: JSON-formatted logs with log levels and scoped loggers
- **Internationalization**: next-intl support for English and Indonesian (en/id)

### 🐛 Fixed

- **Project Visibility Bug**: Staff members can now view projects created by team owners
- **Stripe Webhook Errors**: Improved error handling and retry logic via Inngest
- **Type Safety Issues**: Eliminated all `any` types in core services (authService, teamService, webhookService)
- **Build Errors**: Resolved TypeScript strict mode errors across dashboard components
- **Unicode Encoding**: Fixed character encoding issues in test suite

### 🗑️ Removed

- **Insecure Fallback Secrets**: Removed default JWT secrets (app now crashes if not configured)
- **Hardcoded UI Data**: Moved to database-driven content

### 🔐 Security

- **Critical**: Fixed authentication bypass vulnerability in `/api/auth` routes
- **High**: Implemented idempotency keys for Stripe webhooks to prevent double-billing
- **Medium**: Added rate limiting to prevent brute-force attacks
- **Medium**: Implemented PII masking before data touches AI providers

---

## [1.0.0] - 2025-12-15

### Initial Release

#### Core Features
- **Authentication**: Email/password + Google OAuth
- **Stripe Integration**: Basic subscription checkout and webhooks
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS with dark mode support
- **Basic Multi-Tenancy**: Team structure with owner/member roles

---

## Migration Guides

### Migrating from 1.0.0 to 2.0.0

> [!WARNING]
> **Breaking Changes**: This is a major version upgrade with several breaking changes.

#### Database Migration

1. **ORM Change**: We've migrated from Prisma to Drizzle. Run migration:
   ```bash
   # Backup your database first!
   npx drizzle-kit push
   ```

2. **New Tables**: Several new tables added (audit_logs, usage_billings, documents, etc.)

3. **Schema Changes**:
   - `users` table: Added `is_super_admin` boolean
   - `teams` table: Added `subscription_tier`, `billing_period`, `usage_this_month`
   - `projects` table: Added `assigned_users` JSONB field

#### Environment Variables

Add these new required variables to your `.env`:

```env
# Required (app will crash without these)
AUTH_SECRET=                    # Generate with: npx auth secret
CRON_SECRET=                    # Generate with: npx auth secret

# Optional but recommended
GEMINI_API_KEY=                 # For AI features
UPSTASH_REDIS_REST_URL=         # For rate limiting
UPSTASH_REDIS_REST_TOKEN=
INNGEST_SIGNING_KEY=            # For background jobs
INNGEST_EVENT_KEY=
```

#### Code Changes

1. **Auth**: If you've customized auth logic, update to use new JWT helpers:
   ```typescript
   // Old (Prisma + Auth.js)
   import { getServerSession } from 'next-auth';
   const session = await getServerSession();

   // New (Custom JWT)
   import { getUserFromToken } from '@/lib/auth-helper';
   const user = await getUserFromToken();
   ```

2. **Database Queries**: Update Prisma queries to Drizzle:
   ```typescript
   // Old
   await prisma.user.findUnique({ where: { id } });

   // New
   import { db } from '@/db';
   import { users } from '@/db/schema';
   await db.select().from(users).where(eq(users.id, id));
   ```

#### Testing

Run the full test suite after migration:
```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for upcoming features.

---

## Support

Questions about a specific version? Email **farhandavin14@gmail.com** or open a GitHub issue.

---

**Last Updated**: January 3, 2026
