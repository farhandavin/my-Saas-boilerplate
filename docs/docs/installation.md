# Installation Guide

## Prerequisites
Ensure you have the following installed:
* Node.js (v18 or higher)
* PostgreSQL (Local or Cloud like Supabase/Neon)
* NPM or Yarn

## Backend Setup

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    Copy the example file.
    ```bash
    cp .env.example .env
    ```
4.  Database Migration:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  Start Server:
    ```bash
    npm run dev
    ```

## Frontend Setup

1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Client:
    ```bash
    npm run dev
    ```