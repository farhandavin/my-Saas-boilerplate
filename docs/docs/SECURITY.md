# 🛡️ Security Primer

This document outlines the security mechanisms protecting user data in the SaaS Boilerplate.

## 🔑 PII Encryption Key

We use **AES-256-GCM** encryption to protect Sensitive Data (PII) before it is sent to AI models or stored in logs. This requires a 32-byte encryption key.

### How to Generate a Secure Key

You generally **CANNOT** just type a random string. It must be exactly 32 bytes (hex encoded or raw).

**Method 1: Using Node.js (Recommended)**
Run this one-liner in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
*Output Example:* `a1b2c3d4...` (64 chars long hex string, representing 32 bytes)

**Method 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

### Where to Set It
Add the output string to your `.env` file:
```env
PII_ENCRYPTION_KEY=your_generated_hex_string_here
```

> ⚠️ **CRITICAL WARNiNG:**
> Never commit this key to Git. If you lose this key, **all encrypted data becomes permanently unreadable**. Store a backup in a secure password manager (1Password / LastPass).

---

## 🔒 Authentication Flow
(See `docs/auth.md` for full details)

- **Session Strategy**: We use HTTP-only Secure Cookies.
- **CSRF Protection**: Enabled by default in Next.js Server Actions.
- **Role Based Access**: Middleware checks `user_metadata.role` before rendering protected routes.

## 🕵️ Privacy Proxy (AI Layer)

All requests to LLMs (OpenAI/Anthropic) go through `src/lib/ai/privacy-layer.ts`.
1. **PII Detection**: Regex scans for emails, phones, credit cards.
2. **Masking**: Replaces PII with `[EMAIL_1]`, `[PHONE_2]`.
3. **Round-Trip**: The LLM *never* sees the real data.
4. **Unmasking**: The UI re-hydrates the response with the original data only for the authorized user.
