---
sidebar_position: 2
sidebar_label: Product Specs
title: Product Specification Document
description: Grand Documentation for Enterprise Business OS (4-Pillar Architecture)
---

# Product Specification Document: Enterprise Business OS

**Version:** 2.1  
**Status:** Canonical  
**Framework:** Next.js 15 (App Router)  
**Database:** PostgreSQL + Drizzle ORM  
**Infrastructure:** Inngest, Neon/Supabase  

---

## 🏗️ Architecture Overview

The Enterprise Business OS is built upon **4 Strategic Pillars** designed to automate cognitive tasks, ensure enterprise-grade security, monetize effectively, and maintain stability at scale.

### Core Technology Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: PostgreSQL (Neon/Supabase) with **Drizzle ORM** (Schema-based Multi-tenancy)
- **AI Engine**: Vercel AI SDK + Google Gemini / OpenAI
- **Background Jobs**: Inngest (Migration Engine, Cron Jobs)
- **UI System**: Tailwind CSS + Shadcn UI

---

## 🧠 PILLAR 1: AI (The Intelligence)
*Focus: Replacing repetitive cognitive tasks with machine intelligence.*

### 1. CEO Digest (Automated Executive Summary)
* **What**: A personal assistant that analyzes thousands of daily transactions and condenses them into a single concise paragraph.
* **Mechanism**:
    1.  **Cron Job** (via Inngest) executes at 05:00 AM.
    2.  Aggregates data from DB (Total Revenue, Top Spending, Pending Tasks).
    3.  Raw data is sent to **LLM (Gemini)** with the prompt: *"Act as a business analyst, summarize this JSON data into 3 strategic insights."*
    4.  Output is delivered via Email or Dashboard Card.
* **Value**: Saves the CEO 1-2 hours of raw report analysis daily.

### 2. AI Pre-Check (Intelligent Input Validation)
* **What**: A "Digital Gatekeeper" that inspects document drafts before submission or storage.
* **Mechanism**:
    1.  User fills out a form (e.g., Invoice).
    2.  User clicks "Pre-check", sending data to the **AI API**.
    3.  AI validates against the Ruleset (SOP): *"Is VAT 11%?"*, *"Is the due date logical?"*, *"Does the discount exceed 20%?"*.
    4.  Returns a JSON response: `{ "valid": false, "reason": "50% discount violates max 20% SOP" }`.
* **Value**: Preventatively eliminates financially damaging human errors.

### 3. Internal RAG (Retrieval-Augmented Generation)
* **What**: A chatbot that answers solely based on the "Company Brain" (Internal Documents), excluding external internet data.
* **Mechanism**:
    1.  User uploads PDFs (SOPs/Contracts).
    2.  System breaks text down (**Chunking**) and converts it into number vectors (**Embeddings**).
    3.  Vectors are stored in PostgreSQL (**pgvector**).
    4.  When a user asks a question, the system retrieves the most similar vector and prompts the AI to answer based on that text.
* **Value**: Eliminates AI hallucinations and guarantees answers align with company policy.

### 4. Privacy Layer (PII Masking)
* **What**: A security filter that redacts personal data before it leaves your server.
* **Mechanism**:
    1.  **Middleware** intercepts requests to the AI API.
    2.  Uses **Regex** or **Named Entity Recognition (NER)** to detect NIDs, Emails, Phone Numbers.
    3.  Replaces them with placeholders like `[REDACTED_PHONE]`.
    4.  Sanitized data is sent to Gemini/OpenAI.
* **Value**: Ensures legal compliance (GDPR/PDP) and prevents client data leakage.

### 5. Operational Intelligence
* **What**: Real-time profit margin calculator per user.
* **Mechanism**:
    1.  Tracks every input/output token used by the user.
    2.  Calculates **Cost**: Token Count x API Price.
    3.  Compares against User Subscription Price (**Revenue**).
* **Value**: Prevents "House Losses" (identifying when to raise prices or limit heavy users).

---

## 🏗️ PILLAR 2: B2B (The Infrastructure)
*Focus: Security, Data Isolation, and Connectivity.*

### 6. Hybrid Multi-Tenancy Architecture
* **What**: A flexible database strategy based on user tiers.
* **Mechanism**:
    *   **Low Tier (Shared)**: Users A & B reside in the same table. Distinguished by a `tenant_id` column. Resource efficient.
    *   **Medium Tier (Schema)**: Single Database, but User A has Schema `tenant_a`, User B has Schema `tenant_b`. Logically separated data.
    *   **High Tier (Isolated)**: Enterprise Users get a **New Physical Database** (Dedicated Server) on Neon/Supabase. Connection via a unique database URL.
* **Value**: A key USP (*Unique Selling Point*) for selling to large corporations concerned with data security.

### 7. Seamless Migration Engine
* **What**: Automated "Moving Service" for data (Tier Upgrades).
* **Mechanism**:
    1.  User clicks "Upgrade to Enterprise".
    2.  **Background Job (Inngest)** triggers.
    3.  Job locks old data (Read-only) -> Copies data from Shared DB -> Pastes into new Isolated DB -> Verifies -> Updates Connection String.
    4.  User refreshes the page, now running on the new server.
* **Value**: Painless scalability. Allows users to grow from startups to giants without changing applications.

### 8. API-First & Webhooks
* **What**: Access gates for other applications to interact with your OS.
* **Mechanism**:
    *   **API**: Secure public endpoints (e.g., `GET /api/v1/invoices`) with API Keys.
    *   **Webhooks**: System sends HTTP POST to client URLs when events occur (e.g., `invoice.paid`).
* **Value**: Transforms the system into an ecosystem hub, integrated with other ERP/Accounting software.

### 9. Smart RBAC (Role-Based Access Control)
* **What**: Granular access permission hierarchy.
* **Mechanism**:
    1.  Defines Roles (Admin, Manager, Staff) and Permissions.
    2.  **Middleware** checks every request: *"Does User X have `delete_invoice` permission?"*.
    3.  If not, reject (403 Forbidden).
* **Value**: Internal client corporate security (Interns cannot see CEO salaries).

### 10. Audit Logs (Digital Trail)
* **What**: A database CCTV recording all activities.
* **Mechanism**:
    *   Every INSERT, UPDATE, DELETE triggers a log entry in the `audit_logs` table.
    *   Stores: Actor (Who), Action (What), Old_Value, New_Value, Timestamp.
* **Value**: Total transparency and a mandatory requirement for financial audits.

---

## 💳 PILLAR 3: Payment (The Monetization)
*Focus: Cash flow smoothness and pricing strategy.*

### 11. Tiered Subscription & Usage Billing
* **What**: Hybrid payment model (Fixed Subscription + Pay-as-you-go).
* **Mechanism**:
    *   **Stripe Subscription** integration for monthly fees.
    *   **Stripe Metering** integration for variable costs (AI tokens).
    *   Invoices are consolidated at month-end.
* **Value**: Fair for users (pay less if AI is rarely used) and profitable for you (uncapped revenue potential).

### 12. Automated Dunning Management
* **What**: Automated handling of declined/expired credit cards.
* **Mechanism**:
    1.  Stripe sends a `payment_failed` signal.
    2.  System automatically sends warning emails.
    3.  If failed 3x, system executes a **"Soft Lock"** (access restricted without data deletion).
* **Value**: Reduces involuntary churn (losing customers accidentally).

---

## 🛡️ PILLAR 4: Operational (The Hidden Pillar)
*Focus: Stability and System Maintenance.*

### 13. Schema Sync (Mass Database Synchronization)
* **What**: Updating table structures across 100 Enterprise databases simultaneously.
* **Mechanism**:
    1.  Deployment script reads the list of active database connections.
    2.  Loops migration commands (`drizzle-kit push`) to each database URL in parallel/queue.
* **Value**: Maintainability. Without this, feature updates for Enterprise clients would be impossible.

### 14. Data Residency Router
* **What**: Logic to determine data storage location.
* **Mechanism**:
    1.  During registration, user selects region: "Indonesia" or "Global".
    2.  System creates a database in the corresponding AWS/Google Cloud Region (e.g., `ap-southeast-3` for Jakarta).
* **Value**: Local regulatory compliance (Data Sovereignty) for public sectors.

### 15. Graceful Degradation (Anti-Crash)
* **What**: "Keep Running Even If Limping" strategy.
* **Mechanism**:
    1.  If AI API timeouts/errors.
    2.  System catches the error, hides AI features, and shows standard manual input.
    3.  Core application (CRUD) remains fully functional.
* **Value**: Reliability. Users can continue working even if auxiliary features are down.

### 16. Project & Task Management (Kanban)
* **What**: GitHub/Trello-style collaborative project management system.
* **Mechanism**:
    1.  User creates **Projects** and invites specific members (Project-level access).
    2.  User creates **Tasks** with status (Todo, In Progress, Done) and Priority.
    3.  Visual **Kanban Board** for drag-and-drop status updates.
* **Value**: Centralized team productivity. No need for separate Trello/Jira subscriptions.

### 17. White-Labeling Engine
* **What**: Ability to swap Logos, Colors, and Domains to look like the client's own application.
* **Mechanism**:
    1.  Admin uploads Logo and selects Primary Color in Settings.
    2.  **Custom SMTP**: Sends notification emails (Invites/Invoices) using the client's own email server.
    3.  UI automatically adapts themes based on tenant configuration.
* **Value**: Brand Identity. Enterprise clients want software that feels "theirs".

### 18. Advanced Observability Suite
* **What**: "Cockpit Dashboard" for microscopic system health monitoring.
* **Mechanism**:
    *   **OpenTelemetry**: Tracks data journey (Trace) from frontend to backend to database.
    *   **PostHog**: Analyzes user behavior (Pages, Clicks) for UX improvement.
    *   **Sentry**: Captures errors + session recordings before crashes occur.
* **Value**: Rapid bug fixing and deep user understanding.
