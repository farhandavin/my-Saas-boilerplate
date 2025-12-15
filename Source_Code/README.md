# 🚀 Ultimate SaaS Boilerplate: Build AI & B2B Apps Faster!

**Stop Wasting 200+ Hours on Boring Configs! Start Building Your Dream Today!** 🎉

Are you tired of writing the same authentication code, wrestling with database schemas, and debugging payment webhooks over and over again? **Say goodbye to the headache!** 👋

The **Ultimate SaaS Boilerplate** is here to slash **80% of your initial development time**. Built with the modern and powerful **PERN Stack (PostgreSQL, Express, React, Node.js)**, this isn't just an empty template—it's a **production-ready foundation** packed with everything you need to launch: **Full Stripe Integration**, **Team Management (B2B)**, and cutting-edge **Generative AI (Google Gemini)** capabilities.

Focus on your brilliant business idea and let us handle the boring infrastructure. **Happy coding, happy launching!** 🚀

---

## 🌟 Why You'll Love This (The "Money Makers")
*These are the game-changing features that will make your customers hit that "Subscribe" button!*

### 1. 💳 Complete End-to-End Stripe Subscription System
Don't spend weeks reading Stripe docs! We've done the heavy lifting for you.
* **Checkout Sessions:** Ready for One-time payments or Subscriptions (Pro/Team plans).
* **Customer Portal:** Let users manage their own billing, update cards, or cancel/resume subscriptions easily.
* **Smart Webhooks:** Automated backend logic handles plan upgrades and downgrades in real-time.
* **Dynamic Pricing UI:** A beautiful frontend that adapts to your user's subscription status.

### 2. 🤖 Native AI Integration (Google Gemini)
Ready to build the next big AI wrapper?
* **AI-Powered Backend:** Fully integrated with **Google Gemini AI**.
* **Ready-to-Use API:** specialized endpoints to generate amazing text content.
* **Responsive UI:** A chat/prompt interface that's ready for you to customize and expand.

### 3. 👥 B2B Team Management & Collaboration
A rare gem in standard boilerplates! Perfect for building Enterprise or Agency apps.
* **Create Organizations:** Users can create and manage their own Teams.
* **Role-Based Access:** Built-in database structure for `TeamMember` and `Owner` relationships.
* **Management Dashboard:** A sleek UI for inviting and managing team members.

### 4. ⚡ "One-Command" Setup Script
We value your time! Experience the best Developer Experience (DX).
* **Automated Setup:** Our custom `setup-project.js` script installs all dependencies (Root, Backend, Frontend).
* **Environment Config:** Sets up your `.env` variables automatically.
* **Database Ready:** Runs Prisma migrations for you.
* **Just run `npm run setup` and you are ready to code!**

### 5. 🔐 Secure Hybrid Authentication
* **Google OAuth:** One-click login with Passport.js integration.
* **Magic Link / Email Password:** Robust flows for Sign Up, Login, Forgot Password, and Secure Token Reset.
* **JWT Protection:** Pre-configured middleware to keep your API routes safe and secure.

---

## 🛠️ Solid Foundation (Technical Goodies)
*The technical excellence that ensures your code is clean, scalable, and a joy to work with.*

* **⚛️ Modern Tech Stack:** Blazing fast frontend with **React 19 (Vite)** and a scalable **Node.js/Express** backend.
* **🗄️ Database Powerhouse:** **PostgreSQL** with **Prisma ORM**. Clean, type-safe, and readable database schemas.
* **🎨 Beautiful Dark Mode:** Includes a custom `useTheme` hook. Seamlessly switch between Light and Dark modes, fully styled with **Tailwind CSS**.
* **📱 Responsive UI Components:** Professional dashboard layouts built with Tailwind and **Lucide Icons**. Looks stunning on desktop and mobile!
* **✨ Esthetic Auth Pages:** Say no to boring forms! Enjoy 3D flip animations and interactive visuals on Login/Register pages.
* **🚀 Deployment Ready:** Comes with `vercel.json` configuration for hassle-free deployment to Vercel or other serverless platforms.
* **VP Clean Architecture:** Organized folder structure (Controllers, Routes, Middleware) that makes teamwork a breeze.

---

## 💡 Get Started in Minutes

1.  **Clone the repo.**
2.  **Run `npm run setup`** to install everything.
3.  **Add your API Keys** (Stripe, Google, etc.) to the `.env` file.
4.  **Run `npm run dev`** and watch your SaaS come to life!

---

**⏳ Save Time. Launch Faster. Earn Sooner.**

Get the **Ultimate SaaS Boilerplate** today and turn your idea into Monthly Recurring Revenue (MRR) in days, not months! 💸

**[Buy Now & Start Building!]**






-----

````markdown
# 📘 Comprehensive Usage & Setup Guide

Welcome to the **Ultimate SaaS Boilerplate**! This guide will walk you through setting up, configuring, and using every feature of this PERN stack application.

---

## 🛠️ 1. Prerequisites

Before you begin, ensure you have the following installed/created:

* **Node.js** (v18 or higher)
* **PostgreSQL** (Running locally or a cloud instance like Supabase/Neon)
* **Stripe Account** (For payments)
* **Google Cloud Console Project** (For OAuth & Gemini AI)

---

## 📦 2. Installation

We have simplified the process with an automated script.

### Option A: Automated Setup (Recommended)
Run this single command in the root directory. It will install dependencies for the root, backend, and frontend, and create your `.env` file.

```bash
node setup-project.js
````

### Option B: Manual Installation

If you prefer to do it manually:

```bash
# 1. Install Root Dependencies
npm install

# 2. Install Backend Dependencies
cd backend
npm install
cp .env.example .env

# 3. Install Frontend Dependencies
cd ../frontend
npm install
```

-----

## ⚙️ 3. Configuration (Environment Variables)

Open the `.env` file located in the `backend/` folder. You **must** fill in these values for the app to function correctly.

### Database & Server

  * `PORT`: `5001` (Default)
  * `DATABASE_URL`: Your PostgreSQL connection string.
      * *Example:* `postgresql://user:password@localhost:5432/my_saas_db?schema=public`
  * `CLIENT_URL`: `http://localhost:5173` (For CORS and redirects)

### Authentication (JWT & Google)

  * `JWT_SECRET`: Generate a random string (e.g., `openssl rand -base64 32`).
  * `GOOGLE_CLIENT_ID`: From Google Cloud Console (APIs & Services \> Credentials).
  * `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.
      * *Redirect URI:* `http://localhost:5001/api/auth/google/callback`

### Stripe Payments

  * `STRIPE_SECRET_KEY`: From Stripe Dashboard (Developers \> API keys).
  * `STRIPE_PUBLISHABLE_KEY`: From Stripe Dashboard.
  * `STRIPE_WEBHOOK_SECRET`: Generated after running the Stripe CLI listen command (see Section 5).

### AI & Email

  * `GEMINI_API_KEY`: From Google AI Studio (Get API key).
  * `RESEND_API_KEY`: (Optional) For sending emails via Resend.

-----

## 🔑 Detailed Configuration Guide: How to Get Your API Keys

This section provides step-by-step instructions on how to obtain the necessary credentials for `Authentication`, `Stripe`, and `AI Services`.

### 1. Authentication Setup

#### A. Generate `JWT_SECRET`
This key is used to sign and verify JSON Web Tokens for user sessions. You can generate a secure random string using your terminal.

1.  Open your terminal.
2.  Run the following command:
    ```bash
    openssl rand -base64 32
    ```
3.  Copy the output string and paste it into your `.env` file as `JWT_SECRET`.

#### B. Google OAuth (`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`)
To enable "Sign in with Google", you need to set up a project in the Google Cloud Console.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click the project dropdown in the top bar and select **"New Project"**. Name it (e.g., "SaaS Boilerplate") and click **Create**.
3.  **Configure Consent Screen:**
    * Navigate to **"APIs & Services"** > **"OAuth consent screen"**.
    * Select **External** (for testing) and click **Create**.
    * Fill in the required fields (App name, User support email, Developer contact information). Click **Save and Continue**.
4.  **Create Credentials:**
    * Navigate to **"Credentials"** on the left sidebar.
    * Click **"+ CREATE CREDENTIALS"** and select **"OAuth client ID"**.
    * **Application type:** Select **Web application**.
    * **Name:** Enter a name (e.g., "SaaS Web Client").
    * **Authorized redirect URIs:** Click **"ADD URI"** and paste the following URL (as seen in your setup):
        ```text
        http://localhost:5001/api/auth/google/callback
        ```
    * Click **Create**.
5.  Copy the **Client ID** and **Client Secret** and paste them into your `.env` file.

---

### 2. Stripe Payments Setup

#### A. API Keys (`STRIPE_SECRET_KEY` & `STRIPE_PUBLISHABLE_KEY`)
1.  Log in to your [Stripe Dashboard](https://dashboard.stripe.com/).
2.  Toggle **"Test Mode"** on (orange toggle in the top right).
3.  Go to the **"Developers"** tab and select **"API keys"**.
4.  Copy the **Publishable key** (starts with `pk_test_...`) to `STRIPE_PUBLISHABLE_KEY` in your `.env`.
5.  Click **"Reveal live key token"** (for Secret key) and copy it (starts with `sk_test_...`) to `STRIPE_SECRET_KEY` in your `.env`.

#### B. Webhook Secret (`STRIPE_WEBHOOK_SECRET`)
To test subscription updates locally, you need the Stripe CLI.

1.  [Install the Stripe CLI](https://stripe.com/docs/stripe-cli) if you haven't already.
2.  Login via the CLI:
    ```bash
    stripe login
    ```
3.  Start listening for webhooks and forward them to your local backend:
    ```bash
    stripe listen --forward-to localhost:5001/api/webhook
    ```
4.  The terminal will display a "Ready!" message with a signing secret (starts with `whsec_...`).
5.  Copy this secret and paste it into your `.env` file as `STRIPE_WEBHOOK_SECRET`.

---

### 3. AI & Email Services

#### A. Google Gemini AI (`GEMINI_API_KEY`)
1.  Visit [Google AI Studio](https://aistudio.google.com/).
2.  Click on **"Get API key"** in the sidebar.
3.  Click **"Create API key"**.
4.  Select your Google Cloud project (created in step 1) or create a new one.
5.  Copy the generated key to `GEMINI_API_KEY` in your `.env`.

#### B. Resend Email (`RESEND_API_KEY`) *Optional*
1.  Sign up or log in to [Resend.com](https://resend.com/).
2.  Navigate to **"API Keys"** in the sidebar.
3.  Click **"Create API Key"**.
4.  Give it a name (e.g., "SaaS App") and ensure "Full Access" or "Sending Access" is selected.
5.  Copy the key (starts with `re_...`) to `RESEND_API_KEY` in your `.env`.

## 🗄️ 4. Database Setup

Once your `.env` is configured with the `DATABASE_URL`, initialize your database schema.

```bash
cd backend

# 1. Generate Prisma Client
npx prisma generate

# 2. Push Schema to Database
npx prisma db push
```

-----

## 💳 5. Setting Up Stripe (Crucial Step)

To make subscriptions work, you need to sync Stripe with your code.

1.  **Create Products:** Go to your [Stripe Dashboard](https://dashboard.stripe.com/test/products) and create two products:
      * **Pro Plan** (Recurring Monthly)
      * **Team Plan** (Recurring Monthly)
2.  **Get Price IDs:** Copy the `API ID` for the pricing of each product (looks like `price_1XyZ...`).
3.  **Update Backend Code:**
      * Open `backend/src/controllers/paymentController.js`.
      * Replace the values in the `PLANS` object with your new Price IDs.
4.  **Update Frontend Code:**
      * Open `frontend/src/pages/Dashboard.jsx`.
      * Replace the values in the `PLAN_PRICES` object with the same Price IDs.
5.  **Start Webhook Listener:**
    To test payments locally, you need the Stripe CLI.
    ```bash
    stripe listen --forward-to localhost:5001/api/webhook
    ```
      * Copy the **Webhook Signing Secret** (`whsec_...`) printed in the terminal.
      * Paste it into your `backend/.env` file under `STRIPE_WEBHOOK_SECRET`.

-----

## 🚀 6. Running the Application

You can run both the frontend and backend with one command from the **root** directory:

```bash
npm run dev
```

  * **Frontend:** Visit `http://localhost:5173`
  * **Backend API:** Running at `http://localhost:5001`

-----

## 🕹️ 7. Feature Usage Guide

### 🔐 Authentication

  * **Sign Up/Login:** Users can register via Email/Password or "Sign in with Google".
  * **Password Reset:** If `RESEND_API_KEY` is configured, users can request a password reset link.
  * **Security:** Routes are protected using JWT. The token is stored in LocalStorage.

### 🤖 AI Generator

1.  Log in and navigate to the **Dashboard**.
2.  Click on the **"AI Tools"** tab in the sidebar.
3.  Type a prompt (e.g., *"Write a marketing email for a coffee shop"*).
4.  The system uses Google Gemini to generate the content.
      * *Note: Free users have limited access (logic can be customized in `aiController.js`).*

### 👥 Team Management

1.  Go to the **"Team"** tab on the Dashboard.
2.  Click **"New Team"**.
3.  Enter a team name.
4.  You will automatically become the `Owner` of the team.
5.  *Future Extension:* You can add logic to invite other users by email via `TeamMember` relationship in Prisma.

### 💰 Subscription Management

1.  Go to the **"Billing"** tab.
2.  Click **"Upgrade Now"** on the Pro or Team plan.
3.  You will be redirected to the **Stripe Checkout** page.
4.  Use Stripe Test Cards (e.g., `4242 4242...`) to complete payment.
5.  Upon success, you will be redirected back, and your plan status will update to **Pro** automatically (via Webhook).
6.  **Cancel/Resume:** You can cancel or resume your subscription directly from the dashboard.

-----

## ☁️ 8. Deployment

This project is configured for easy deployment.

### Backend (Render / Railway / Vercel)

  * **Vercel:** A `vercel.json` is included for serverless deployment. Simply import the `backend` folder to Vercel.
  * **Render/Railway:** Connect your repo and use `npm install && npm run start` as the build/start command. Ensure environment variables are set in the dashboard.

### Frontend (Vercel / Netlify)

  * Import the `frontend` folder to Vercel.
  * Set the Build Command to `vite build` (or `npm run build`).
  * **Important:** Add an Environment Variable `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://your-api.onrender.com`).

-----

**Happy Coding\!** 🚀

```
```
