# Billing & Monetization Documentation

## 💰 Overview
The **Billing Service** (`src/services/billingService.ts`) manages subscriptions, usage tracking (Credit System), and invoicing. It is designed to support a **Hybrid Pricing Model** (Subscription + Usage-Based Overages).

## 🏷️ Pricing Tiers (Hardcoded Configuration)

| Tier | Base Price (IDR) | Token Limit | Overage Rate |
| :--- | :--- | :--- | :--- |
| **FREE** | Rp 0 | 500 | - |
| **PRO** | Rp 299.000 | 50,000 | Rp 10 / 1k tokens |
| **ENTERPRISE** | Rp 999.000 | 500,000 | Rp 10 / 1k tokens |

> *Configuration is located in `billingService.ts` constant `PRICING`.*

## 💳 Credit System (AI Tokens)
The system tracks AI usage via `aiUsageCount` on the `teams` table.

### Usage Tracking Flow
1.  **Check Quota**: Before any AI operation, `BillingService.checkQuota(teamId, cost)` is called.
2.  **Execute Operation**: If checking passes, the AI task runs.
3.  **Deduct/Track**: `BillingService.trackUsage(teamId, tokensUsed)` increments the counter.
    *   Also updates/creates a `usage_billings` record for the current month.
    *   Triggers "Upsell" notification if usage approaches the limit.

## 🧾 Monthly Billing Cycle
- **Background Job**: `processMonthlyBilling()` (Usually triggered via Cron/Inngest).
- **Logic**:
  1.  Calculates `overageTokens = usage - limit`.
  2.  `usageAmount = overageTokens * rate`.
  3.  `totalAmount = baseAmount + usageAmount`.
  4.  Generates a database record in `usage_billings`.
  5.  Sends email notification to Team Admins.

## 🔌 Stripe Integration
- **Webhooks**: `handleSubscriptionChange` updates `team.tier` and `team.subscriptionStatus`.
- **Payment Failure**: Automatically downgrades status to `past_due` and blocks AI access via `checkQuota`.

## 🚀 Usage Example

```typescript
import { BillingService } from '@/services/billingService';

const teamId = "team_123";
const estimatedCost = 100;

// 1. Gatekeeping
const canProceed = await BillingService.checkQuota(teamId, estimatedCost);
if (!canProceed) throw new Error("Quota exceeded or Payment failed");

// 2. Perform Expensive Action...
// ...

// 3. Billing
await BillingService.trackUsage(teamId, estimatedCost);
```
