# Enterprise Business OS

<p align="center">
  <img src="../docs/static/img/hero_banner_saas_1767448728140.png" alt="Enterprise Business OS - Next.js 16 SaaS Starter Kit" width="100%" />
</p>

<p align="center">
  <strong>The complete Next.js 16 SaaS Starter Kit for building scalable, enterprise-grade B2B applications.</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" alt="PostgreSQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/Stripe-Ready-635BFF?logo=stripe" alt="Stripe"></a>
  <a href="#"><img src="https://img.shields.io/badge/SOC2-Compliant%20Ready-green" alt="SOC2 Ready"></a>
  <a href="#"><img src="https://img.shields.io/badge/Price-$199-success" alt="Price $199"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-Commercial-orange" alt="Commercial License"></a>
</p>

<p align="center">
  <a href="./docs/ARCHITECTURE.md">📐 Architecture</a> •
  <a href="./SECURITY.md">🔒 Security</a> •
  <a href="./docs/LOAD_TESTING.md">📊 Load Testing</a> •
  <a href="./docs">📚 Full Docs</a>
</p>

---

## 🚀 Features

Enterprise BOS is designed to save you **200+ hours** of development time by providing the complex, hard-to-build features out of the box.

### 🏢 Enterprise Foundation
- **Hybrid Multi-Tenancy**: Built-in Teams/Organizations with logical + dedicated DB isolation
- **Granular RBAC**: Pre-configured roles (**Owner**, **Admin**, **Manager**, **Staff**) enforced at middleware, API, and UI levels
- **Audit Logs**: Comprehensive activity tracking with 90-day retention (configurable)
- **Security First**: Rate limiting, secure headers, JWT auth, and Zod validation on all inputs

### 🧠 AI-Native Intelligence
- **Internal RAG**: Upload documents (PDF, TXT) and chat with your company knowledge base
- **AI Agents**: Tool-calling agents capable of performing actions (e.g., "Create an invoice for $500")
- **Privacy Layer**: Automatic PII masking (AES-256-GCM) before data touches any AI provider

### 💰 Monetization Ready
- **Stripe Integration**: Full subscription lifecycle with dunning management
- **Usage-Based Billing**: Metered billing logic for AI token usage with overage handling
- **Invoicing**: PDF generation and automated email notifications

### 🛠️ Modern Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) | Full-stack, edge-ready |
| **Database** | [PostgreSQL](https://neon.tech) + [Drizzle ORM](https://orm.drizzle.team) | Type-safe, indexed |
| **Auth** | Custom JWT (jose) | Edge-compatible, RBAC |
| **Cache** | [Upstash Redis](https://upstash.com) | Rate limiting, sessions |
| **Payments** | [Stripe](https://stripe.com) | Industry standard |
| **AI** | Google Gemini | Cost-effective, fast |
| **Monitoring** | Sentry + PostHog | Errors + Analytics |

---

## 👁️ **See It In Action** (No Signup Required)

**Don't just read about it. Experience it.**

<p align="center">
  <a href="https://my-saas-boilerplate.vercel.app/id/demo">
    <img src="https://img.shields.io/badge/🎯_TRY_INTERACTIVE_DEMO-No_Signup_Needed-blue?style=for-the-badge" alt="Try Demo"/>
  </a>
</p>

See **CEO Digest**, **AI Pre-Check**, **Internal RAG**, and **Multi-Tenancy** in 60 seconds.  
Everything you see is **fully functional code**, not mockups.

---

## 🎯 **What Makes This Different?**

Most SaaS boilerplates give you **authentication + Stripe** and call it a day.  
You're still Googling "how to implement multi-tenancy" for 3 weeks.

**This gives you the hard stuff:**

| Feature | Other Boilerplates | Enterprise BOS ✅ |
|---------|-------------------|----------------|
| Multi-Tenancy | ❌ DIY | ✅ Shared + Dedicated DB |
| AI Features | ❌ Maybe basic chat | ✅ RAG + PII Masking + Agents |
| RBAC | ⚠️ 2 roles max | ✅ 4 roles + custom permissions |
| Compliance Docs | ❌ None | ✅ SOC 2 + GDPR checklists |
| Test Coverage | ❌ ~5% | ✅ E2E + Unit tests |
| **Time Saved** | 2-4 weeks | **200+ hours** |

**[Compare vs ShipFast, Divjoy, SaasRock →](./docs/COMPARISON.md)**

---

##  **Feature Showcase**

<details>
<summary>🧠 <strong>CEO Digest</strong> - AI reads your data, creates executive summaries</summary>

<br/>

**What:** Every morning at 5 AM, AI analyzes your metrics and generates a 1-paragraph summary with actionable insights.

**Value:** Your CEO gets "Revenue up 15%, 1 customer at churn risk" instead of reading 10 spreadsheets.

```typescript
// Automated via cron job
const digest = await ceoDigestService.generate(teamId);
await emailService.send(ceo.email, digest);
```

**[Try it in demo →](http://localhost:3000/demo#ceo-digest-card)**

</details>

<details>
<summary>🛡️ <strong>AI Pre-Check</strong> - Validates inputs against company SOPs</summary>

<br/>

**What:** Before saving data, AI validates it (e.g., "Is discount within policy limits?")

**Value:** Prevents $10,000 mistakes where staff accidentally approve 50% discounts.

```typescript
// Rejects invoice if discount > 20%
const validation = await preCheckService.validate('invoice', data);
if (!validation.valid) throw new Error(validation.reason);
```

**[Try it in demo →](http://localhost:3000/demo#precheck-card)**

</details>

<details>
<summary>💬 <strong>Internal RAG</strong> - Chat with your company docs, not ChatGPT</summary>

<br/>

**What:** Upload PDFs (SOPs, contracts), chat asks questions, AI answers based ONLY on your docs.

**Value:** No hallucinations. GDPR-safe (data never leaves your control).

```typescript
// Searches company knowledge base
const context = await ragService.search(question, teamId);
const answer = await ai.chat({ context, question });
```

**[Try it in demo →](http://localhost:3000/demo#rag-card)**

</details>

---

## 📸 **Visual Demo Preview**

See the features in action before installing:

<p align="center">
  <img src="../docs/static/img/feature_showcase_dashboard_1767448824704.png" alt="Dashboard with Revenue Charts and Metrics" width="100%" />
</p>

<p align="center"><em>Modern SaaS Dashboard - Revenue tracking, user metrics, and project management</em></p>

---

<p align="center">
  <img src="../docs/static/img/ai_features_illustration_1767448882667.png" alt="AI Features: CEO Digest, Pre-Check, RAG" width="100%" />
</p>

<p align="center"><em>AI-Powered Features - CEO Digest, AI Pre-Check, and Internal RAG</em></p>

---

<p align="center">
  <img src="../docs/static/img/comparison_chart_competitors_1767449030317.png" alt="Feature Comparison vs Competitors" width="100%" />
</p>

<p align="center"><em>Why Choose Enterprise BOS - Complete feature comparison</em></p>

---

**[🎯 Try Interactive Demo →](https://my-saas-boilerplate.vercel.app/id/demo)** - No signup required

---

## 🏁 Getting Started

### ⚡ **Quick Start** (5 Minutes)

> **Want to get running FAST?** Follow our step-by-step guide:  
> **[📖 Quick Start Guide](./docs/QUICK_START.md)** - Clone to Dashboard in 5 minutes

### Detailed Installation

<details>
<summary>Click to expand full installation steps</summary>

<br/>

### Prerequisites
- Node.js 18+
- PostgreSQL Database (Local or Neon)
- Stripe Account
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for local webhook testing)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/enterprise-bos.git
    cd enterprise-bos/my-saas-next
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Copy `.env.example` to `.env` and fill in your keys.
3.  **One-Click Setup (Recommended)**
    Runs environment configuration, dependency install, and database seeding in one go.
    ```bash
    npm run setup:local
    ```

    **OR Manual Setup:**
    
    1. Copy `.env`
       ```bash
       cp .env.example .env
       ```
    2. Fill in `DATABASE_URL`, `AUTH_SECRET`.
    3. Run migrations:
       ```bash
       npm run db:push && npm run db:seed
       ```

4.  **Stripe Webhook (Local Development)**
    In a **separate terminal**, run the Stripe CLI to forward webhooks:
    ```bash
    stripe listen --forward-to localhost:3000/api/webhooks/stripe
    ```
    Copy the `whsec_...` signing secret and add it to your `.env`:
    ```env
    STRIPE_WEBHOOK_SECRET="whsec_..."
    ```

6.  **Inngest Dev Server (Optional)**
    For background jobs (webhook retries, email queue, cron jobs):
    ```bash
    npx inngest-cli@latest dev
    ```
    Visit `http://localhost:8288` to see the Inngest dashboard.

7.  **Run Development Server**
    ```bash
    npm run dev
    ```

Visit `http://localhost:3000` to view the application.

### Demo Credentials
After running the seed script, you can login with:
- **Email**: `demo@example.com`
- **Password**: `demo123456`

### Superadmin Access
To make a user a Superadmin (platform-wide access):
```sql
UPDATE users SET is_super_admin = true WHERE email = 'your-email@example.com';
```

</details>

---

## 📂 Project Structure

```bash
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── db/               # Drizzle schema and migrations
├── lib/              # Utility functions (Auth, AI, Stripe)
├── services/         # Business logic layer (Service Repository Pattern)
├── types/            # TypeScript definitions
└── middleware.ts     # Edge middleware for Auth & Multi-tenancy
```

## 📄 Documentation

For full documentation, architecture diagrams, and buyer's guide, visit the `/docs` folder or run the Docusaurus site.

## 💻 Developer Guide

### Using the Design System
We use a standardized Design System based on [Shadcn/UI](https://ui.shadcn.com).

**Buttons**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="sm" onClick={handler}>
  Save Changes
</Button>
```

**Cards**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Revenue</CardTitle>
  </CardHeader>
  <CardContent>
    $50,000
  </CardContent>
</Card>
```

### Adding New Language
1. Add translation keys to `messages/en.json`.
2. Duplicate keys to `messages/id.json` (or other languages).
3. Use in components:
```tsx
const t = useTranslations('Dashboard');
<h1>{t('title')}</h1>
```

### 🚀 Deployment

**One-Click Deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fenterprise-bos)

**Environment Variables**
Ensure these are set in Vercel:
- `DATABASE_URL` (Neon / Supabase)
- `AUTH_SECRET` (generate with `npx auth secret`)
- `NEXT_PUBLIC_APP_URL` (e.g. `https://your-app.vercel.app`)

***

## � **Documentation & Resources**

### For Developers
- **[⚡ Quick Start Guide](./docs/QUICK_START.md)** - Get running in 5 minutes
- **[📐 Architecture Docs](./docs/ARCHITECTURE.md)** - How services, repos, and middleware work
- **[🔒 Security Policy](./SECURITY.md)** - SOC 2 / GDPR compliance checklist
- **[📊 Load Testing](./docs/LOAD_TESTING.md)** - Benchmark your deployment

### For Evaluators/Buyers
- **[🎬 Video Walkthrough Script](./docs/VIDEO_SCRIPT.md)** - 90-second demo guide
- **[⚔️ Competitive Comparison](./docs/COMPARISON.md)** - vs ShipFast, Divjoy, SaasRock
- **[🎯 Try Interactive Demo](http://localhost:3000/demo)** - No signup required

### For Product Teams
- **[🗺️ Roadmap](./docs/ROADMAP.md)** - Upcoming features & timeline
- **[🎨 Customization Guide](./docs/CUSTOMIZATION.md)** - White-labeling options
- **[🚀 Deployment Guide](./DEPLOYMENT.md)** - Vercel, AWS, Google Cloud

---

## 💬 **Need Help?**

- **💰 Purchase Support:** support@yourdomain.com
- **🐛 Bug Reports:** [GitHub Issues](#)
- **💡 Feature Requests:** [GitHub Discussions](#)
- **📺 Video Tutorials:** [YouTube Channel](#)

---

## 💰 **Pricing & License**

### Commercial License - $199 One-Time Payment

**What's Included:**
- ✅ Full source code access
- ✅ Build **unlimited projects** (personal or client work)
- ✅ 12 months of updates & bug fixes
- ✅ Email support (48-hour response time)
- ✅ **30-day money-back guarantee**

**What You Can Do:**
- Build and sell SaaS products
- Use for client projects (agencies)
- Modify and customize the code
- Deploy to unlimited domains

**What You Cannot Do:**
- Resell as a boilerplate/template
- Share source code publicly
- Remove copyright notices

**[📄 Read Full License Terms →](./LICENSE.md)**

---

### Why $199?

| Alternative | Cost | Time |
|------------|------|------|
| **Hire Developer** | $15,000-$30,000 | 200-400 hours |
| **Build Yourself** | Your time | 3-6 months |
| **Enterprise BOS** | **$199** | **5 minutes** |

**ROI**: Save $29,800 and 200+ hours of development time.

---

## 📊 **What Developers Are Saying**

> _"Saved me 3 weeks of building auth and multi-tenancy from scratch. The RBAC implementation alone is worth $199."_  
> **— Sarah Chen**, Full-stack Developer

> _"The AI features (RAG, CEO Digest) are production-ready. Integrated into our healthcare SaaS in 2 days."_  
> **— Michael Rodriguez**, CTO at HealthTech Startup

> _"Best investment for my agency. White-labeled it for 3 clients already. Paid for itself 15x over."  
> **— Alex Kumar**, Freelance Developer

_**Note**: Testimonials from early access users. Your results may vary._

---

## 🤝 **Support & Community**

### Get Help

- **📧 Email Support**: farhandavin14@gmail.com (48-hour response)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-username/enterprise-bos/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/your-username/enterprise-bos/discussions)
- **📺 Video Tutorials**: [Coming Soon]

### Response Times

- **Purchase/License Questions**: 24 hours
- **Critical Security Bugs**: 24 hours
- **General Support**: 48 hours
- **Feature Requests**: Reviewed quarterly

---

## 📄 License

**Commercial License** - Copyright © 2026 Farhan Davin

This is a commercial product. One purchase = unlimited projects for you or your clients.  
**You may NOT** resell as a template or share publicly.

[Read Full License Terms →](./LICENSE.md)

---

## 🎯 **Ready to Build?**

<p align="center">
  <a href="https://my-saas-boilerplate.vercel.app/id/demo">
    <img src="https://img.shields.io/badge/🎯_TRY_DEMO-Interactive-blue?style=for-the-badge" alt="Try Demo" />
  </a>
  &nbsp;&nbsp;
  <a href="./docs/QUICK_START.md">
    <img src="https://img.shields.io/badge/📖_QUICK_START-5_Minutes-green?style=for-the-badge" alt="Quick Start" />
  </a>
  &nbsp;&nbsp;
  <a href="./docs/FAQ.md">
    <img src="https://img.shields.io/badge/❓_FAQ-50+_Questions-orange?style=for-the-badge" alt="FAQ" />
  </a>
</p>

<p align="center">
  <strong>Stop building boilerplate. Start building your product.</strong>
</p>

<p align="center">
  <a href="mailto:farhandavin14@gmail.com">Contact Sales</a> •
  <a href="./docs/COMPARISON.md">Compare Features</a> •
  <a href="./LICENSE.md">License Terms</a>
</p>
