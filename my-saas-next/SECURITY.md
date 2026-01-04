# Security Policy

## Overview

Enterprise Business OS is built with security as a first-class concern. This document outlines our security practices, compliance measures, and guidelines for secure deployment.

## Security Architecture

### Authentication & Authorization

| Feature | Implementation | Notes |
|---------|---------------|-------|
| **Authentication** | JWT (jose library) | Edge-compatible, RS256/HS256 |
| **Session Management** | Configurable timeout | Default: 30 minutes |
| **Password Hashing** | bcrypt (12 rounds) | OWASP recommended |
| **2FA Support** | TOTP ready | Schema supports `two_factor_enabled` |
| **OAuth/SSO** | Google OAuth 2.0 | Extensible to SAML/OIDC |

### Role-Based Access Control (RBAC)

```
OWNER     → Full control (billing, deletion, transfer)
ADMIN     → Team management, settings, analytics
MANAGER   → Operational oversight, staff management  
STAFF     → Daily operations, limited access
```

Permissions are enforced at:
- **Middleware level** (`src/middleware.ts`)
- **API route level** (`withAuth` wrapper)
- **Component level** (`RBACWrapper.tsx`)

### Data Protection

#### Encryption

| Data Type | At Rest | In Transit |
|-----------|---------|------------|
| Passwords | bcrypt hashed | HTTPS/TLS 1.3 |
| PII | AES-256-GCM (optional) | HTTPS/TLS 1.3 |
| API Keys | SHA-256 hashed | HTTPS/TLS 1.3 |
| Database | Provider-managed | SSL required |

#### PII Masking (Privacy Layer)

The optional Privacy Layer (`src/lib/ai/privacy-layer.ts`) automatically:
- Detects email addresses, phone numbers, credit cards
- Masks PII before sending to AI providers
- Stores encrypted mappings in Redis (TTL: 10 minutes)
- Restores original data in responses

**Environment Variable**: `PII_ENCRYPTION_KEY` (32 characters required)

### Multi-Tenancy Isolation

Enterprise BOS implements **defense-in-depth** multi-tenancy with both application-level and database-level isolation.

#### Isolation Layers

| Layer | Implementation | Protection |
|-------|----------------|------------|
| **Database RLS** | PostgreSQL Row Level Security | Prevents data leaks even from application bugs |
| **Application** | `teamId` column on all tenant data | Standard query-level filtering |
| **API** | JWT contains `teamId`, validated on each request | Request-level validation |
| **Dedicated DB** | Enterprise tier supports `dedicatedDatabaseUrl` | Full physical isolation |

#### Row Level Security (RLS) Implementation

RLS is enabled at the database level via `drizzle/0001_enable_rls.sql`. This ensures tenant data isolation is enforced by PostgreSQL itself, not just application code.

**Protected Tables**:
- `projects`, `project_members`, `tasks`
- `documents`, `invoices`, `campaigns`
- `team_members`, `invitations`, `roles`
- `audit_logs`, `notifications`, `webhooks`, `webhook_deliveries`
- `api_keys`, `privacy_rules`, `usage_billings`, `migration_jobs`, `ai_feedback`

**How It Works**:

```typescript
// 1. Set tenant context before queries (src/lib/db-router.ts)
await setTenantContext(teamId);

// 2. All subsequent queries are automatically filtered by RLS
const projects = await db.select().from(projects);
// ↑ Only returns projects where team_id = current context

// 3. Even if a developer forgets the WHERE clause, RLS protects data
```

**Session Variable**: The `app.current_team_id` PostgreSQL session variable is set automatically when using `getTenantDb()` or `setTenantContext()`.

**Superadmin Access**: When `teamId` is not set (null context), RLS policies allow full access for platform-wide administration.

#### Usage in Services

```typescript
import { withTenantContext } from '@/lib/db-router';

// Recommended: Use withTenantContext for automatic cleanup
const projects = await withTenantContext(teamId, async (db) => {
  return await db.select().from(projects);
});
```


## Audit Logging

All security-relevant events are logged to the `audit_logs` table:

```typescript
interface AuditLog {
  id: string;
  teamId: string;
  userId: string;
  action: string;      // e.g., 'user.login', 'invoice.created'
  entity: string;      // e.g., 'auth', 'billing'
  details: string;
  ipAddress: string;
  createdAt: Date;
}
```

### Logged Events

| Category | Events |
|----------|--------|
| **Auth** | Login, logout, password reset, 2FA enable/disable |
| **Team** | Member added/removed, role changed, settings updated |
| **Billing** | Subscription changed, payment failed/succeeded |
| **Data** | Document uploaded, invoice created, project deleted |

### Retention Policy

- Default: 90 days (configurable via `AUDIT_LOG_RETENTION_DAYS`)
- Enterprise: Unlimited with archival to cold storage
- Export: Available via API and CSV download

## Rate Limiting

Implemented via Upstash Redis (`src/lib/rate-limit.ts`):

| Endpoint | Limit | Window |
|----------|-------|--------|
| API routes | 100 requests | 10 seconds |
| Auth endpoints | 5 requests | 60 seconds |
| AI endpoints | Based on plan tier | Per billing period |

**Behavior**: Returns `429 Too Many Requests` when exceeded.

## Security Headers

Configured in `next.config.ts`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [configured per deployment]
```

## Vulnerability Reporting

If you discover a security vulnerability, please report it via:

- **Email**: security@yourdomain.com
- **Response Time**: Within 48 hours
- **Bug Bounty**: Available for critical vulnerabilities

## Compliance Readiness

### SOC 2 Type II

This boilerplate includes infrastructure for SOC 2 compliance:

| Trust Principle | Implementation |
|-----------------|----------------|
| **Security** | RBAC, encryption, audit logs |
| **Availability** | Health checks, monitoring hooks |
| **Processing Integrity** | Input validation, idempotency |
| **Confidentiality** | Data encryption, PII masking |
| **Privacy** | Consent management ready |

### GDPR

- Data export API endpoint ready
- Right to deletion support
- Consent tracking schema available
- Data processing records via audit logs

## Secure Deployment Checklist

```markdown
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Set strong `AUTH_SECRET` (min 32 characters)  
- [ ] Configure `PII_ENCRYPTION_KEY` (exactly 32 characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS origins
- [ ] Set `NODE_ENV=production`
- [ ] Configure rate limiting (Upstash Redis)
- [ ] Enable Sentry error tracking
- [ ] Configure backup schedule for database
- [ ] Review security headers
```

## Contact

For security inquiries: security@yourdomain.com
