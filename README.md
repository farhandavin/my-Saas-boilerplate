
```markdown
# 🚀 SaaS Boilerplate v2.0 - Enterprise SaaS Starter Kit

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Node](https://img.shields.io/badge/node-v18%2B-green.svg) ![React](https://img.shields.io/badge/react-v18-blue.svg) ![Architecture](https://img.shields.io/badge/architecture-service--repository-orange)

![Dashboard Preview](https://via.placeholder.com/1200x600.png?text=Dashboard+Preview+Image)

**SaaS Boilerplate v2.0** is the ultimate foundation for building scalable, production-ready SaaS applications. Engineered with a strict **Service-Repository Architecture** and powered by **React Query**, it eliminates technical debt before it starts.

Stop building authentication and billing from scratch. Focus on your core business logic.

---

## ✨ Key Features

- **🛡️ Enterprise Architecture:** Backend logic is decoupled using Service-Repository patterns (Clean Code).
- **⚡ High-Performance Frontend:** Built with Vite, React, and TanStack Query (v5) for instant UI updates.
- **🔐 Secure Authentication:** Complete flow with JWT, Google OAuth, and Password Recovery.
- **💳 Stripe Integration:** Full subscription lifecycle management (Checkout, Webhooks, Customer Portal).
- **🤖 AI-Ready:** Pre-configured Google Gemini AI integration for generative features.
- **👥 Team Management:** Multi-tenancy support with Invite flows and Role-Based Access Control (RBAC).
- **🎨 Premium UI:** Custom Tailwind CSS design system with Dark Mode support.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express, Prisma ORM, PostgreSQL |
| **Frontend** | React, Tailwind CSS, TanStack Query, Lucide Icons |
| **Tooling** | ESLint, Prettier, Vite |

---

## 🚀 Installation Guide

### Prerequisites
- Node.js v18+
- PostgreSQL Database
- Stripe Account (for payments)
- Google Cloud Console Project (for OAuth & AI)

### 1. Backend Setup
Navigate to the server directory.

```bash
cd backend
cp .env.example .env          # Configure your database and API keys
npm install                   # Install dependencies
npx prisma migrate dev --name init  # Initialize the database
npm run dev                   # Start the server at http://localhost:5001

```

### 2. Frontend Setup

Navigate to the client directory in a new terminal.

```bash
cd frontend
cp .env.example .env          # Configure API endpoints
npm install                   # Install dependencies
npm run dev                   # Start the client at http://localhost:5173

```

---

## 🔑 Environment Variables Reference

Configure these variables in your `.env` files.

### Backend (`/backend/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Server port | `5001` |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pass@localhost:5432/mydb` |
| `JWT_SECRET` | Secret key for signing tokens | `supersecretkey` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key (sk_test_...) | `sk_test_123...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret (whsec_...) | `whsec_123...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-123...` |
| `GEMINI_API_KEY` | Google Gemini AI Key | `AIzaSy...` |
| `RESEND_API_KEY` | Resend API Key for Emails | `re_123...` |

### Frontend (`/frontend/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_URL` | URL of your backend API | `http://localhost:5001` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe Publishable Key (pk_test_...) | `pk_test_123...` |

---

## 📂 Project Structure

We follow industry-standard **Clean Architecture** to ensure maintainability.

```bash
.
├── backend
│   ├── src
│   │   ├── config        # Database & Passport configs
│   │   ├── controllers   # Adapter Layer (Req/Res handling only)
│   │   ├── services      # Business Logic Layer (Core logic)
│   │   ├── repositories  # Data Access Layer (Prisma)
│   │   ├── routes        # API Definitions
│   │   └── middleware    # Auth & Error handling
├── frontend
│   ├── src
│   │   ├── components    # Reusable UI Atoms
│   │   ├── hooks         # Custom Hooks & React Query Logic
│   │   ├── pages         # Application Views
│   │   └── services      # Axios Interceptor

```

---

## 🧪 Quality Assurance

We enforce high code quality standards. Run these commands to check for errors.

```bash
# Backend Linting
cd backend
npm run lint

# Frontend Linting
cd frontend
npm run lint

```

---

## 📚 Documentation & Support

* **Full Documentation:** [Link to your Docusaurus Site or Google Doc]
* **Support:** For any issues, please create a ticket on our [Support Portal] or email support@yourdomain.com.

Thank you for purchasing **SaaS Boilerplate v2.0**!

---

© 2025 Farhan Davin. All rights reserved.

```

### Apa yang saya tambahkan agar "Hard Approval"?

1.  **Banner Image Placeholder:** `![Dashboard Preview]`. Pembeli (dan reviewer) adalah makhluk visual. Anda **WAJIB** menaruh screenshot dashboard yang cantik di sini. Jangan biarkan kosong.
2.  **Environment Variables Reference (Tabel .env):** Ini paling sering dikomplain pembeli. "Apa isi .env-nya?". Dengan tabel ini, mereka tahu persis apa yang harus diisi.
3.  **Frontend Setup:** Anda tadi lupa memasukkan cara install Frontend. Saya sudah menambahkannya.
4.  **Folder Structure Tree:** Ini membuktikan klaim "Clean Architecture" Anda. Reviewer bisa melihat sekilas bahwa Anda memisahkan `controllers`, `services`, dan `repositories`.
5.  **Quality Assurance (Linting):** Menunjukkan bahwa kode Anda bebas error (karena kita baru saja memperbaiki script `lint` tadi).
6.  **Support Section:** Menunjukkan bahwa Anda penjual yang bertanggung jawab.

```