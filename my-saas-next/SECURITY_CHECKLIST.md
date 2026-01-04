# 🔐 SECURITY CHECKLIST - Pre-Sale Actions

> **IMPORTANT**: Complete this checklist BEFORE publishing or selling this boilerplate.

## 🚨 API Keys to Regenerate

Your `.env` file contained real credentials that may have been committed to Git history. 
You MUST regenerate these keys immediately:

### Critical (Payment & Auth)
- [ ] **Stripe Keys** - [Dashboard](https://dashboard.stripe.com/apikeys)
  - Regenerate `sk_test_...` (Secret Key)
  - Regenerate `pk_test_...` (Publishable Key) 
  - Regenerate `whsec_...` (Webhook Secret)
  
- [ ] **Google OAuth** - [Console](https://console.cloud.google.com/apis/credentials)
  - Regenerate Client Secret for `GOOGLE_CLIENT_SECRET`

- [ ] **Auth Secrets**
  - Run `npx auth secret` for new `AUTH_SECRET`
  - Run `openssl rand -hex 32` for new `JWT_SECRET`

### Database & Services
- [ ] **Neon Database** - [Dashboard](https://console.neon.tech/)
  - Create NEW database or reset password for `DATABASE_URL`

- [ ] **Upstash Redis** - [Console](https://console.upstash.com/)
  - Regenerate REST Token for `UPSTASH_REDIS_REST_TOKEN`

- [ ] **Resend Email** - [Dashboard](https://resend.com/api-keys)
  - Regenerate API key for `RESEND_API_KEY`

### AI & Monitoring
- [ ] **Google AI (Gemini)** - [AI Studio](https://aistudio.google.com/app/apikey)
  - Regenerate `GEMINI_API_KEY`

- [ ] **Sentry** - [Project Settings](https://sentry.io/settings/)
  - Regenerate `SENTRY_AUTH_TOKEN`

- [ ] **PostHog** - [Project Settings](https://app.posthog.com/project/settings)
  - Regenerate `NEXT_PUBLIC_POSTHOG_KEY`

## 🧹 Git History Cleanup

If credentials were committed to Git, consider these options:

### Option 1: Clean History (Recommended for private repos)
```bash
# Remove .env from entire Git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote
git push origin --force --all
```

### Option 2: Start Fresh (Easiest)
```bash
# Remove .git and start new repository
rm -rf .git
git init
git add .
git commit -m "Initial commit - Enterprise OS Boilerplate"
```

## ✅ Pre-Sale Verification

Run these checks before selling:

```bash
# 1. Verify .env is not tracked
git status

# 2. Verify .env.example IS tracked
git ls-files | grep ".env.example"

# 3. Search for any hardcoded secrets
grep -r "sk_test_" --include="*.ts" --include="*.tsx" .
grep -r "whsec_" --include="*.ts" --include="*.tsx" .
grep -r "re_" --include="*.ts" --include="*.tsx" .

# 4. Run build to ensure everything works
npm run build
```

## 📦 Packaging for Sale

1. Delete your local `.env` file (keep only `.env.example`)
2. Run `npm run build` to verify clean build
3. Remove any personal test data from screenshots/docs
4. Update CHANGELOG.md with version info
5. Create release tag: `git tag v3.0.0`

---

**After completing this checklist, your boilerplate is ready for sale! 🚀**
