````markdown
# 🚀 Ultimate SaaS Boilerplate (PERN Stack)

> Build your next big idea with focus and clarity. The most efficient way to start your SaaS journey using PostgreSQL, Express, React, and Node.js.

![License](https://img.shields.io/badge/license-Commercial-blue.svg)
![Stack](https://img.shields.io/badge/stack-PERN-green.svg)
![Stripe](https://img.shields.io/badge/payments-Stripe-purple.svg)

## 📖 Overview

This boilerplate provides a solid foundation for building scalable SaaS applications. It comes pre-configured with **Authentication**, **Subscription Payments**, **Team Management**, and **AI Integration**, saving you weeks of development time.

### ✨ Key Features

* **🔐 Authentication System:** Secure Email/Password login, Google OAuth, and Password Reset flow (powered by Passport.js & JWT).
* **💳 Stripe Integration:** Full subscription handling including Checkout, Webhooks, Customer Portal, and Plan Upgrades/Downgrades.
* **👥 Team Management:** Built-in support for creating and managing teams.
* **🤖 AI-Powered:** Ready-to-use integration with Google Gemini AI for generative content.
* **🎨 Modern UI/UX:** Built with React 19, Tailwind CSS, and Lucide Icons. Includes Dark Mode support and animated Auth pages.
* **🗄️ Database:** Robust data modeling with PostgreSQL and Prisma ORM.
* **⚡ Developer Experience:** Fast setup script and concurrent development server.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Axios, React Router 7.
* **Backend:** Node.js, Express.js.
* **Database:** PostgreSQL, Prisma ORM.
* **Services:** Stripe (Payments), Google Gemini (AI), Resend (Transactional Emails).

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* PostgreSQL installed and running locally
* Stripe Account (for keys)
* Google Cloud Console Project (for OAuth)

### 1. Installation

We have included a setup script to install all dependencies automatically.

```bash
# Run the automated setup script
node setup-project.js
````

Alternatively, you can install manually:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2\. Environment Variables

Create a `.env` file in the **`backend`** directory (copy from `.env.example`).

```env
# Server Config
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Prisma)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/my_saas_db?schema=public"

# Auth (JWT)
JWT_SECRET="your_super_secret_jwt_key"
JWT_EXPIRES_IN="1d"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AI & Email
GEMINI_API_KEY="your_google_gemini_key"
RESEND_API_KEY="re_..."
```

### 3\. Database Setup

Initialize the database schema using Prisma:

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4\. Running the App

Run both frontend and backend concurrently with a single command from the **root** directory:

```bash
npm run dev
```

  * **Frontend:** http://localhost:5173
  * **Backend:** http://localhost:5001

-----

## 💳 Stripe Setup Guide

1.  **Create Products:** Go to your Stripe Dashboard and create two products: "Pro" and "Team".
2.  **Get Price IDs:** Copy the Price ID (e.g., `price_123...`) for both products.
3.  **Update Code:**
      * **Backend:** Update `PLANS` object in `backend/src/controllers/paymentController.js`.
      * **Frontend:** Update `PLAN_PRICES` object in `frontend/src/pages/Dashboard.jsx`.
4.  **Webhook Setup:** Use the Stripe CLI to forward webhooks to your local server:
    ```bash
    stripe listen --forward-to localhost:5001/api/webhook
    ```
    Copy the webhook signing secret to your `.env` file.

-----

## 📂 Project Structure

```
├── backend/
│   ├── prisma/          # Database schema & migrations
│   ├── src/
│   │   ├── config/      # Passport & other configs
│   │   ├── controllers/ # Logic for Auth, Payments, Teams, AI
│   │   ├── routes/      # API Routes
│   │   └── middleware/  # Auth verification
│   └── server.js        # Entry point & Webhook handler
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard, Auth, Home pages
│   │   └── hooks/       # Custom hooks (e.g., useTheme)
│   └── index.html
└── setup-project.js     # Auto-installer script
```

-----

## 📄 License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE) - feel free to use it for your personal and commercial projects.

-----

Developed with ❤️ by [farhan davin rinaldi]

```
