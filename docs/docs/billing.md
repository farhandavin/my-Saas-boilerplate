# Billing & Stripe

This project uses **Stripe Checkout** for payments and **Stripe Webhooks** for subscription management.

## Setup Steps

1.  Create a product in your Stripe Dashboard.
2.  Get the `Price ID` (starts with `price_...`).
3.  Add it to your Frontend `.env`:
    ```bash
    VITE_STRIPE_PRICE_PRO=price_12345
    ```

## Webhook Configuration
For local development, you need the Stripe CLI to forward events.

1.  Login to Stripe CLI:
    ```bash
    stripe login
    ```
2.  Listen for events:
    ```bash
    stripe listen --forward-to localhost:5001/api/webhook
    ```
3.  Copy the `Whsec_...` secret displayed in the terminal to your Backend `.env` file under `STRIPE_WEBHOOK_SECRET`.