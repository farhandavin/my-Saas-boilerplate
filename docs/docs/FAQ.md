# Frequently Asked Questions (FAQ)

Quick answers to common questions about **Enterprise Business OS**.

---

## 📦 Pre-Purchase Questions

### What exactly am I buying?

You're purchasing the complete source code for a production-ready Next.js 16 SaaS boilerplate with:
- Full authentication system (email/password + Google OAuth)
- Stripe integration (subscriptions + webhooks)
- Multi-tenancy with RBAC (4 roles)
- AI features (RAG, CEO Digest, AI Pre-Check)
- Security & compliance documentation (SOC2, GDPR)
- 20+ E2E tests

**You get**: All source code, 12 months of updates, email support, written documentation.  
**You don't get**: Deployment credits, third-party API keys (Stripe, Gemini, etc.), custom development.

---

### How is this different from ShipFast or other boilerplates?

| Feature | Enterprise BOS | ShipFast | Divjoy |
|---------|---------------|----------|--------|
| **Target Audience** | B2B SaaS, enterprise | Simple B2C | Agencies |
| **Multi-Tenancy** | ✅ Full (Shared+Dedicated DB) | ❌ Single user | ⚠️ Basic |
| **RBAC** | ✅ 4 roles + custom | ❌ | ⚠️ 2 roles |
| **AI Features** | ✅ RAG, PII masking, agents | ❌ | ❌ |
| **Compliance** | ✅ SOC2 + GDPR docs | ❌ | ❌ |
| **Price** | $199 | $249 | $249 |

**TL;DR**: We're built for **complex B2B SaaS** (think Notion, Linear, Salesforce). ShipFast is great for simple MVP landing pages.

[See full comparison →](./COMPARISON)

---

### Can I use this for client projects?

**Yes!** You can build unlimited projects for yourself or clients. Examples:
- Build a SaaS for a healthcare client ✅
- Create an internal tool for a corporation ✅
- Launch your own SaaS product ✅

**What you CAN'T do**: Resell the boilerplate itself as a template.

---

### Do I need to give you credit in my app?

**No.** You can remove all "Powered by Enterprise BOS" references. We encourage white-labeling.

---

### What if I find a critical bug?

Email **farhandavin14@gmail.com** with:
1. Steps to reproduce
2. Expected vs actual behavior
3. Your environment (OS, Node version)

**Response time**: 24 hours for critical security bugs, 48 hours for standard bugs.

We'll provide a fix via GitHub patch or direct code snippet.

---

### Is there a refund policy?

**Yes. 30-day money-back guarantee.** No questions asked.

If it doesn't fit your needs within 30 days, email **farhandavin14@gmail.com** for a full refund. You must delete all copies from your systems.

---

### How do I get updates after 12 months?

You can continue using your current version **forever**. Security patches are provided indefinitely.

For **major feature updates** after 12 months, we'll offer optional paid renewals (pricing TBD, likely $99/year).

---

## 🛠️ Technical Questions

### What tech stack does this use?

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL (Neon/Supabase recommended) |
| ORM | Drizzle ORM |
| Auth | Custom JWT (edge-compatible) |
| Payments | Stripe |
| AI | Google Gemini (pluggable architecture) |
| Cache | Upstash Redis |
| Email | Resend |
| Monitoring | Sentry + PostHog |

**All dependencies are MIT-licensed** (no GPL, no vendor lock-in).

---

### Can I use a different database (MySQL, MongoDB)?

**PostgreSQL only** out of the box. The schema uses Postgres-specific features:
- `pgvector` extension (for AI embeddings)
- JSONB columns
- Full-text search

Migrating to MySQL/MongoDB would require significant refactoring (not recommended).

---

### Can I swap Stripe for Paddle or LemonSqueezy?

**Yes**, but you'll need to rewrite the billing service. Our architecture is modular:
- `billingService.ts` handles all payment logic
- Webhooks are in `/api/webhooks/stripe`

Estimated effort: 8-12 hours for an experienced developer.

---

### Can I use OpenAI instead of Google Gemini?

**Yes!** We have a pluggable AI architecture. Just swap the provider in `aiService.ts`:

```typescript
// Current: Google Gemini
import { google } from '@ai-sdk/google';
const model = google('gemini-1.5-pro');

// Switch to OpenAI
import { openai } from '@ai-sdk/openai';
const model = openai('gpt-4-turbo');
```

[See AI Services docs →](./ai-services)

---

### What's the minimum hosting cost?

**$0/month** if you stay within free tiers:

| Service | Free Tier | Cost After |
|---------|-----------|-----------|
| **Vercel** | 100GB bandwidth | $20/mo |
| **Neon (DB)** | 0.5GB storage | $19/mo |
| **Upstash** | 10K requests/day | $10/mo |
| **Stripe** | Unlimited | 2.9% + $0.30/tx |

**Realistic costs at 1,000 users**: ~$50-100/month.

[See cost calculator →](#what-s-the-minimum-hosting-cost)

---

### Does this support mobile apps (React Native, Flutter)?

**Not out of the box**, but the API is ready:
- All endpoints return JSON
- JWT authentication works cross-platform
- CORS configured for mobile origins

You'd need to build the mobile UI yourself (we only provide Next.js web UI).

---

### How scalable is this?

**Tested up to 10,000 concurrent users** with proper configuration:
- Vercel Edge functions (auto-scaling)
- Neon Postgres (serverless, auto-scaling)
- Redis caching (reduces DB load by 70%)

For 100K+ users, you'll need:
- Dedicated database (not serverless)
- CDN for static assets
- Load balancing

[See load testing guide →](./LOAD_TESTING)

---

### Is TypeScript required?

**Yes.** The entire codebase is TypeScript with strict mode enabled. Switching to JavaScript would break type-safe Zod validation and Drizzle ORM.

---

## 🔒 Security & Compliance

### Is this GDPR compliant?

We provide **tools for GDPR compliance**, but compliance is your responsibility:
- ✅ Data export API (`/api/user/export`)
- ✅ Data deletion API (`/api/user/delete`)
- ✅ Audit logs for data access
- ✅ Cookie consent UI (you must implement)
- ✅ Privacy policy template (docs/COMPLIANCE.md)

**You must**: Add cookie banners, write your privacy policy, appoint a DPO (if required).

---

### Is this SOC 2 certified?

**No.** But we provide SOC 2 **documentation templates**:
- Security policy (SECURITY.md)
- Access control matrix
- Incident response plan
- Audit log implementation

You'd still need a SOC 2 audit by a CPA firm (costs $15K-$50K).

---

### How are passwords stored?

**Bcrypt** with 12 rounds (industry standard). Never plain text.

```typescript
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(password, 12);
```

---

### What about rate limiting?

**Yes**, implemented via Upstash Redis:
- 10 requests/minute for login endpoints
- 100 requests/minute for authenticated API
- Configurable per route

See `lib/rate-limit.ts` for customization.

---

## 💼 Business Use Cases

### Can I white-label this for clients?

**Absolutely!** Change:
- Logo (`public/logo.svg`)
- App name (`.env`: `NEXT_PUBLIC_APP_NAME`)
- Colors (`tailwind.config.ts`)
- Email templates (`components/emails/`)

Remove all "Enterprise BOS" branding. It's yours.

[See customization guide →](./CUSTOMIZATION)

---

### Can I build a competing SaaS boilerplate?

**No.** That violates the license. You **cannot**:
- Resell this as a template
- Create a "Next.js Starter Kit" using our code
- Publish to Gumroad/ThemeForest

You **can**:
- Build a SaaS product (e.g., "ProjectManagerPro") using this code
- Sell that SaaS to customers

---

### Do I need to buy multiple licenses for my team?

**One license per company/client project**, not per developer.

**Scenario 1**: You have 5 developers building YOUR SaaS → **1 license**  
**Scenario 2**: Agency building for 3 different clients → **3 licenses**

For teams 5+ developers, contact **farhandavin14@gmail.com** for team pricing.

---

### Can I get an invoice for my company?

Yes. Email **farhandavin14@gmail.com** with:
- Company name
- Tax ID / VAT number
- Billing address

We'll send a proper invoice within 48 hours.

---

## 🚀 Getting Started

### How long does setup take?

**5 minutes** with the Quick Start guide, assuming you have:
- Node.js 18+ installed
- PostgreSQL database (Neon free tier works)
- Basic terminal knowledge

[Quick Start Guide →](./QUICK_START)

---

### I'm stuck on setup. What do I do?

1. Check [Troubleshooting Guide](./TROUBLESHOOTING)
2. Search GitHub Issues (someone likely had the same problem)
3. Email **farhandavin14@gmail.com** with:
   - Error message (full stack trace)
   - Steps you took
   - Your environment (`node -v`, `npm -v`)

Response time: 48 hours.

---

### Do you have video tutorials?

**Coming soon!** We're creating:
- 5-minute setup walkthrough
- Feature deep-dives (RAG, billing, RBAC)
- Deployment guides (Vercel, AWS)

For now, see [Visual Assets](./VISUAL_ASSETS) to see product screenshots and feature illustrations.

---

### Can I see a live demo?

**Yes!** Visit: **https://my-saas-boilerplate.vercel.app/id**

Click **"Try Demo"** (no signup required) to test:
- CEO Digest
- AI Pre-Check
- Internal RAG
- Team Management

---

## 🤝 Support & Community

### How do I report a bug?

1. Check if it's already reported: [GitHub Issues](#)
2. Open new issue with template (we'll provide)
3. Or email: **farhandavin14@gmail.com**

**Include**:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos (if UI bug)

---

### How do I request a feature?

Open a **GitHub Discussion** (Feature Requests section).

We prioritize based on:
- Number of upvotes
- Alignment with enterprise focus
- Implementation complexity

Popular requests get added in quarterly updates.

---

### Is there a community?

Currently **email support only** (farhandavin14@gmail.com).

We're planning a Discord community once we reach 100+ customers.

---

### Can I contribute code?

**Not at this time.** This is a commercial product. But we welcome:
- Bug reports
- Documentation improvements
- Feature suggestions

---

## 📊 Miscellaneous

### What Node.js version do I need?

**Node.js 18.17.0 or higher** (latest LTS recommended).

Check your version:
```bash
node -v
```

---

### Can I use Yarn or PNPM instead of NPM?

**Yes**, but NPM is officially supported. If using Yarn/PNPM, you're on your own for dependency conflicts.

---

### Why is the Docker Compose setup optional?

Most developers use managed databases (Neon, Supabase) which don't require Docker.

Docker is provided for developers who prefer full local control.

---

### How often do you update the boilerplate?

**Major updates**: Quarterly (Jan, April, July, Oct)  
**Security patches**: Within 48 hours of disclosure  
**Bug fixes**: Weekly (bundled)

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## ❓ Still Have Questions?

**Email**: farhandavin14@gmail.com  
**Live Demo**: https://my-saas-boilerplate.vercel.app/id  
**Documentation**: [Browse all docs](./installation.md)

**Response Time**: 48 hours for standard questions, 24 hours for purchase/license inquiries.

---

**Last Updated**: January 3, 2026
