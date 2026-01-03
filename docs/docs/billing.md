---
sidebar_label: Billing & Payments
title: Billing & Payments
---

# 💳 Billing Module (Pillar 3)

The Enterprise OS uses a **Hybrid Billing Model**, combining **Flat Monthly Subscriptions** with **Usage-Based (Metered) Billing** for AI tokens.

## 💰 Pricing Structure

Pricing logic is centralized in `src/services/billingService.ts`.

| Plan | Base Price (IDR) | Token Limit | Overage Rate |
| :-- | :-- | :-- | :-- |
| **Free** | Rp 0 | 500 | - |
| **Pro** | Rp 299,000 | 50,000 | Rp 10 / 1k tokens |
| **Enterprise** | Rp 999,000 | 500,000 | Rp 10 / 1k tokens |

### Usage-Based Logic
If a user exceeds their **Token Limit**, the system automatically calculates overage fees:
`Overage Cost = (Used Tokens - Limit) / 1000 * Rate`

This is calculated in real-time via `BillingService.trackUsage()`.

---

## ⚙️ Configuration

### 1. Stripe Product Setup
You need to create two products in Stripe:
1.  **Pro Plan**: Recurring Monthly Price.
2.  **Enterprise Plan**: Recurring Monthly Price.

Copy the **Price IDs** (`price_...`) to your `.env`:
```bash
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID="price_..."
```

### 2. Webhook Setup
We listen for specific Stripe events to manage access.

**Command to Listen (Local):**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🔄 Webhook Lifecycle

The system handles these events in `src/app/api/webhooks/stripe/route.ts`:

### ✅ Automated Provisioning
*   **Event**: `customer.subscription.created` / `updated`
*   **Action**: Automatically updates the Team's `tier` and `subscriptionStatus` in the database.

### 🚨 Dunning Management (Auto-Lock)
If a payment fails, the system executes a **"3-Strike Policy"**:

1.  **Attempt #1 (First Failure)**:
    *   Status: `past_due`
    *   Action: Sends "Payment Warning" email.
2.  **Attempt #2 (Retry Failed)**:
    *   Status: `past_due`
    *   Action: Sends "Critical Warning" - AI features limited.
3.  **Attempt #3 (Final Failure)**:
    *   Status: `unpaid`
    *   Action: **Soft-Lock Account**. User cannot access Dashboard until payment is fixed.

---

## 📊 Invoicing

The system runs a **Monthly Cron Job** (via Inngest/Cron) to:
1.  Calculate total token usage.
2.  Generate an invoice record in `usageBillings` table.
3.  Send a summary email to the Team Admin.
