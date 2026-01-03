---
sidebar_label: Installation Guide
sidebar_position: 3
title: Installation Guide
---

# Installation Guide

Follow these steps to set up the Enterprise OS locally.

## Prerequisites

Ensure you have the following installed:
* **Node.js** (v18 or higher)
* **PostgreSQL** (Local or Cloud like Neon/Supabase)
* **NPM** or **Yarn**

## Quick Start

The Enterprise OS is a unified Next.js application (Fullstack). You only need to run one server.

### 1. clone the repository & Install Dependencies

Navigate to the application directory:

```bash
cd my-saas-next
npm install
```

### 2. Configure Environment

Copy the example environment file and configure your database credentials:

```bash
cp .env.example .env
```

> **Tip:** Edit `.env` and fill in your `DATABASE_URL` and `NEXTAUTH_SECRET`.

### 3. Database Setup

Run the migrations to set up your PostgreSQL schema:

```bash
npx drizzle-kit push
```
*(Or if using Prisma)*
```bash
npx prisma migrate dev --name init
```

### 4. Seed Initial Data (Optional)

Populate the database with default roles and settings:

```bash
npm run seed
```

### 5. Start the Development Server

Launch the application:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).