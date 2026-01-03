---
sidebar_label: Billing & Payments
title: Billing & Payments
---

# Billing & Stripe

This project uses **Stripe Checkout** for payments and **Stripe Webhooks** for subscription management.

## Setup Steps

1. Create a product in your Stripe Dashboard.
2. Get the `Price ID` (starts with `price_...`).
3. Add it to your `.env`:
    ```bash
    STRIPE_PRICE_ID_PRO=price_12345
    ```

## Webhook Configuration

For local development, you need the Stripe CLI to forward events.

1. Login to Stripe CLI:
    ```bash
    stripe login
    ```
2. Listen for events:
    ```bash
    stripe listen --forward-to localhost:3000/api/webhooks/stripe
    ```
3. Copy the `whsec_...` secret displayed in the terminal to your `.env` file under `STRIPE_WEBHOOK_SECRET`.