# Architecture Overview

This document provides a high-level overview of the Enterprise Business OS architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Browser   │  │  Mobile App │  │   CLI       │  │   Webhooks  │        │
│  │   (React)   │  │   (Future)  │  │   (Future)  │  │   (Inbound) │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EDGE / CDN LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Vercel Edge Network                              │   │
│  │  • Static Asset Caching  • Edge Middleware  • Geographic Routing    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER (Next.js 16)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Middleware    │  │   App Router    │  │   API Routes    │             │
│  │                 │  │                 │  │                 │             │
│  │ • Rate Limiting │  │ • SSR/SSG Pages │  │ • REST Endpoints│             │
│  │ • Auth Check    │  │ • i18n (en/id)  │  │ • Webhook Recv  │             │
│  │ • RBAC          │  │ • Error Bounds  │  │ • File Upload   │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┼────────────────────┘                       │
│                                ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      SERVICE LAYER                                    │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │  │
│  │  │ AuthService│ │BillingServ │ │ AIService  │ │ProjectServ │        │  │
│  │  │            │ │            │ │            │ │            │        │  │
│  │  │ • Login    │ │ • Stripe   │ │ • Gemini   │ │ • CRUD     │        │  │
│  │  │ • OAuth    │ │ • Usage    │ │ • RAG      │ │ • Tasks    │        │  │
│  │  │ • JWT      │ │ • Invoices │ │ • Agents   │ │ • Members  │        │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   PostgreSQL     │  │   Upstash Redis  │  │   File Storage   │          │
│  │   (Neon/Supa)    │  │                  │  │   (Vercel Blob)  │          │
│  │                  │  │                  │  │                  │          │
│  │ • Users/Teams    │  │ • Rate Limiting  │  │ • Documents      │          │
│  │ • Projects       │  │ • Session Cache  │  │ • Invoices (PDF) │          │
│  │ • Invoices       │  │ • PII Mappings   │  │ • Avatars        │          │
│  │ • Audit Logs     │  │                  │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐│
│  │   Stripe   │ │  Google AI │ │   Resend   │ │  PostHog   │ │  Sentry   ││
│  │            │ │  (Gemini)  │ │            │ │            │ │           ││
│  │ • Payments │ │ • Chat     │ │ • Emails   │ │ • Analytics│ │ • Errors  ││
│  │ • Subs     │ │ • Embeddings│ │ • Transact │ │ • Events   │ │ • Traces  ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └───────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n routes (en, id)
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Protected dashboard
│   │   └── page.tsx       # Landing page
│   └── api/               # API routes
│       ├── auth/          # Auth endpoints
│       ├── projects/      # Project CRUD
│       ├── webhooks/      # Stripe, custom webhooks
│       └── ai/            # AI endpoints
│
├── components/            # React components
│   ├── ui/               # Design system (shadcn-style)
│   ├── dashboard/        # Dashboard-specific
│   ├── landing/          # Marketing pages
│   └── providers/        # Context providers
│
├── services/             # Business logic
│   ├── authService.ts    # Authentication
│   ├── billingService.ts # Stripe + usage
│   ├── aiService.ts      # AI integrations
│   └── ...
│
├── lib/                  # Utilities
│   ├── auth-helper.ts    # JWT verification
│   ├── logger.ts         # Structured logging
│   ├── rate-limit.ts     # Upstash rate limiting
│   └── db/               # Database utilities
│
├── db/                   # Database
│   ├── schema.ts         # Drizzle schema
│   └── index.ts          # Connection
│
├── schemas/              # Zod validation
│   ├── invoice.ts
│   ├── team.ts
│   └── project.ts
│
└── types/                # TypeScript types
    └── index.ts          # Shared types
```

## Data Flow

### Authentication Flow

```
User → Login Form → API /auth/login → AuthService
                                          │
                                          ▼
                                   Validate Credentials
                                          │
                                          ▼
                                   Generate JWT Token
                                          │
                                          ▼
                                   Set HttpOnly Cookie
                                          │
                                          ▼
                                   Redirect to Dashboard
```

### Multi-Tenancy Query Flow

```
API Request (with JWT)
         │
         ▼
    Middleware
    Extract teamId from JWT
         │
         ▼
    Service Layer
    All queries include: WHERE teamId = ?
         │
         ▼
    Database
    Indexed on teamId for performance
```

### Billing Flow

```
User Action (AI Token Usage)
         │
         ▼
    BillingService.checkQuota()
    ── Quota OK? ──┬── NO → Return Error
                   │
                   YES
                   │
                   ▼
    Execute Action
         │
         ▼
    BillingService.trackUsage()
         │
         ▼
    Update usage_billings table
         │
         ▼
    Check Upsell Triggers
```

## Technology Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | Next.js 16 | Full-stack, edge-ready |
| **Database** | PostgreSQL + Drizzle | Type-safe, performant |
| **Auth** | Custom JWT | Edge-compatible, no vendor lock |
| **Payments** | Stripe | Industry standard |
| **AI** | Google Gemini | Cost-effective, fast |
| **Caching** | Upstash Redis | Serverless-friendly |
| **Email** | Resend | Developer-friendly |
| **Monitoring** | Sentry + PostHog | Error + Product analytics |
