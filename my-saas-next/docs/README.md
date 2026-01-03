# Developer Documentation

Welcome to the technical documentation for the SaaS Boilerplate. This directory contains detailed guides for the core modules of the system.

## 📚 Modules

- **[Authentication](auth.md)**: User registration, login, and team invitation flows.
- **[Billing & Monetization](billing.md)**: Subscriptions, credit system, and Stripe integration.
- **[AI Services](ai-services.md)**: Generative AI, RAG, and Privacy Layer details.

## 🚀 Getting Started

If you are new to the codebase, we recommend starting with the **Authentication** module to understand how users and teams are structured.

## 🏗️ Architecture Note

This project follows a **Service-Oriented Architecture** within a monolith. All business logic is encapsulated in `src/services/`, while Next.js App Router handles the HTTP/Routing layer.
