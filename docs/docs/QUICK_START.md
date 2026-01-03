# Quick Start Guide - Enterprise Business OS

## 🎯 Get Running in 5 Minutes

This guide will get you from **clone to running dashboard** in under 5 minutes. Perfect for impulse buyers who want to see value immediately.

---

## ⚡ Minute 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/my-saas-boilerplate.git
cd my-saas-boilerplate/my-saas-next

# Install dependencies
npm install
```

**What's happening:** Installing Next.js 16, Drizzle ORM, Stripe SDK, AI SDK, and 50+ other production-grade packages.

---

## ⚡ Minute 2-3: One-Click Setup (Recommended)

```bash
# Automates .env creation, secret generation, and database setup
npm run setup:local
```

**What this does:**
- ✅ Creates `.env` from example
- ✅ Generates secure `AUTH_SECRET` and `JWT_SECRET` keys
- ✅ Checks for Docker (optional)
- ✅ Installs dependencies
- ✅ Pushes DB schema and seeds demo data

> **Note:** If you don't use Docker, it will fallback to using the `DATABASE_URL` in your `.env`.

---

## ⚡ Minute 4: Run Development Server

```bash
# Standard dev server (Just Next.js)
npm run dev

# 🚀 POWER MODE (Recommended)
# Runs Next.js + Stripe Webhooks + Inngest in ONE terminal
npm run dev:all
```

**Visit:** [http://localhost:3000](http://localhost:3000)

You should see the landing page. Click **"Try Demo"** to see interactive features without login!

---

## ⚡ Minute 5: Explore Key Features

### 1. **Try the Interactive Demo** (No Login Required)
- Go to [http://localhost:3000/demo](http://localhost:3000/demo)
- Click "Start Tour" button
- Test CEO Digest, AI Pre-Check, RAG Chat

### 2. **Login to Dashboard**
```
Email: demo@example.com
Password: demo123456
```

### 3. **Explore These Pages First:**
- 📊 Dashboard: Real-time metrics and CEO Digest
- 👥 Team Management: Invite members with different roles
- 📄 Projects: Create and assign tasks
- 🔐 Settings → Security: Configure RBAC and audit logs

---

## 🚨 Troubleshooting Common Issues

### Issue 1: "Cannot connect to database"
**Solution:**
1. Check if `DATABASE_URL` is correct
2. Make sure Neon project is active (free tier might sleep)
3. Try: `npx drizzle-kit studio` to test connection

### Issue 2: "Module not found: @/components/..."
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: "Stripe webhook secret missing"
**Solution:**
- This is OK for local development
- Billing features will show "Configure Stripe" placeholder
- To enable: Follow [STRIPE_SETUP.md](./docs/STRIPE_SETUP.md)

### Issue 4: Port 3000 already in use
**Solution:**
```bash
# Kill the process on port 3000
npx kill-port 3000

# Or run on different port
PORT=3001 npm run dev
```

---

## 🎉 What's Next?

### For Developers Building a Product:
1. **Read Architecture Docs:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
2. **Configure Integrations:**
   - [Stripe Setup](./docs/STRIPE_SETUP.md) for billing
   - [AI Setup](./docs/AI_SETUP.md) for Gemini API
   - [Email Setup](./docs/EMAIL_SETUP.md) for Resend
3. **Customize Branding:** [docs/CUSTOMIZATION.md](./docs/CUSTOMIZATION.md)

### For Evaluators/Buyers:
1. **Compare Features:** [COMPARISON.md](./COMPARISON.md)
2. **Review Security:** [SECURITY.md](./SECURITY.md)
3. **Check Roadmap:** [ROADMAP.md](./ROADMAP.md)

---

## 📚 Full Documentation

- **📐 Architecture Guide:** How services, repositories, and middleware work
- **🔒 Security Policy:** SOC 2, GDPR compliance checklist
- **📊 Load Testing:** How to benchmark your deployment
- **🎨 Design System:** Using shadcn/ui components

**Documentation Site:** Run `cd docs && npm run start` for full Docusaurus site

---

## 💬 Need Help?

- **Community Discord:** [Join here](#)
- **Email Support:** support@yourdomain.com
- **GitHub Issues:** Report bugs or request features

---

**🚀 You're all set! Build something amazing.**
