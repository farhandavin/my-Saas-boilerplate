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

## 🧠 PILAR 1: AI (The Intelligence)
*Fokus: Menggantikan tugas kognitif berulang dengan kecerdasan mesin.*

### 1. CEO Digest (Rangkuman Eksekutif Otomatis)
* **Apa**: Asisten pribadi yang membaca ribuan data transaksi kemarin dan menyajikannya dalam 1 paragraf singkat.
* **Mekanisme**:
    1.  **Cron Job** (via Inngest) berjalan pukul 05:00 pagi.
    2.  Mengambil data agregat dari DB (Total Revenue, Top Spending, Pending Tasks).
    3.  Data mentah dikirim ke **LLM (Gemini)** dengan prompt: *"Bertindaklah sebagai analis bisnis, rangkum data JSON ini menjadi 3 poin wawasan strategis."*
    4.  Output dikirim via Email atau Dashboard Card.
* **Nilai**: Menghemat 1-2 jam waktu CEO membaca laporan mentah setiap hari.

### 2. AI Pre-Check (Validasi Input Cerdas)
* **Apa**: "Satpam Digital" yang memeriksa draf dokumen sebelum disimpan atau diajukan.
* **Mekanisme**:
    1.  User mengisi form (misal: Invoice).
    2.  Saat klik tombol "Pre-check", data dikirim ke **API AI**.
    3.  AI memvalidasi terhadap Ruleset (SOP): *"Apakah PPN 11%?"*, *"Apakah tanggal jatuh tempo logis?"*, *"Apakah diskon melebihi 20%?"*.
    4.  Mengembalikan respon JSON: `{ "valid": false, "reason": "Diskon 50% melanggar SOP maksimal 20%" }`.
* **Nilai**: Mencegah human error yang merugikan finansial secara preventif.

### 3. Internal RAG (Retrieval-Augmented Generation)
* **Apa**: Chatbot yang hanya menjawab berdasarkan "Otak Perusahaan" (Dokumen Internal), bukan internet umum.
* **Mekanisme**:
    1.  User upload PDF (SOP/Kontrak).
    2.  Sistem memecah teks (**Chunking**) dan mengubahnya menjadi vektor angka (**Embeddings**).
    3.  Vektor disimpan di PostgreSQL (**pgvector**).
    4.  Saat user bertanya, sistem mencari vektor yang paling mirip, lalu menyuruh AI menjawab berdasarkan teks tersebut.
* **Nilai**: Menghapus halusinasi AI dan menjamin jawaban sesuai kebijakan perusahaan.

### 4. Privacy Layer (PII Masking)
* **Apa**: Filter keamanan yang menyensor data pribadi sebelum keluar dari server Anda.
* **Mekanisme**:
    1.  **Middleware** mencegat request ke API AI.
    2.  Menggunakan **Regex** atau **Named Entity Recognition (NER)** untuk mendeteksi NIK, Email, No HP.
    3.  Menggantinya menjadi `[REDACTED_PHONE]`.
    4.  Data aman dikirim ke Gemini/OpenAI.
* **Nilai**: Kepatuhan hukum (UU PDP/GDPR) dan mencegah kebocoran data klien.

### 5. Operational Intelligence
* **Apa**: Kalkulator margin keuntungan per user secara real-time.
* **Mekanisme**:
    1.  Mencatat setiap token input/output yang dipakai user.
    2.  Menghitung biaya (**Cost**): Token x Harga API.
    3.  Membandingkan dengan Harga Langganan User (**Revenue**).
* **Nilai**: Mencegah "kerugian bandar" (mengetahui kapan harus menaikkan harga atau membatasi user boros).

---

## 🏗️ PILAR 2: B2B (The Infrastructure)
*Fokus: Keamanan, Isolasi Data, dan Konektivitas.*

### 6. Hybrid Multi-Tenancy Architecture
* **Apa**: Strategi database fleksibel berdasarkan seberapa banyak user membayar.
* **Mekanisme**:
    *   **Tier Low (Shared)**: Semua data user A & B ada di tabel yang sama. Dibedakan kolom `tenant_id`. Hemat resource.
    *   **Tier Medium (Schema)**: Satu Database, tapi User A punya Schema `tenant_a`, User B punya Schema `tenant_b`. Data terpisah secara logika.
    *   **Tier High (Isolated)**: User Enterprise dibuatkan **Database Fisik baru** (Server terpisah) di Neon/Supabase. Koneksi via URL database khusus.
* **Nilai**: USP (*Unique Selling Point*) utama untuk menjual ke korporat besar yang paranoid soal keamanan data.

### 7. Seamless Migration Engine
* **Apa**: Fitur "Pindah Rumah" otomatis untuk data (Upgrade Tier).
* **Mekanisme**:
    1.  User klik "Upgrade to Enterprise".
    2.  **Background Job (Inngest)** menyala.
    3.  Job mengunci data lama (Read-only) -> Copy data dari Shared DB -> Paste ke Isolated DB baru -> Verifikasi -> Update Connection String.
    4.  User refresh halaman, sudah di server baru.
* **Nilai**: Skalabilitas tanpa sakit kepala. Memungkinkan user tumbuh dari kecil ke raksasa tanpa ganti aplikasi.

### 8. API-First & Webhooks
* **Apa**: Pintu akses bagi aplikasi lain untuk berinteraksi dengan OS Anda.
* **Mekanisme**:
    *   **API**: Endpoint publik aman (misal: `GET /api/v1/invoices`) dengan API Key.
    *   **Webhooks**: Sistem mengirim HTTP POST ke URL klien saat event terjadi (misal: `invoice.paid`).
* **Nilai**: Membuat sistem menjadi pusat ekosistem, terintegrasi dengan ERP/Accounting software lain.

### 9. Smart RBAC (Role-Based Access Control)
* **Apa**: Hierarki izin akses yang granular.
* **Mekanisme**:
    1.  Mendefinisikan Role (Admin, Manager, Staff) dan Permission.
    2.  **Middleware** mengecek setiap request: *"Apakah User X punya izin `delete_invoice`?"*.
    3.  Jika tidak, tolak (403 Forbidden).
* **Nilai**: Keamanan internal perusahaan klien (Staf magang tidak bisa melihat gaji CEO).

### 10. Audit Logs (Jejak Digital)
* **Apa**: CCTV database yang mencatat segala aktivitas.
* **Mekanisme**:
    *   Setiap operasi INSERT, UPDATE, DELETE memicu pencatatan ke tabel `audit_logs`.
    *   Menyimpan: Actor (Siapa), Action (Apa), Old_Value, New_Value, Timestamp.
* **Nilai**: Transparansi total dan syarat wajib audit untuk perusahaan finansial.

---

## 💳 PILAR 3: Payment (The Monetization)
*Fokus: Kelancaran arus kas dan strategi harga.*

### 11. Tiered Subscription & Usage Billing
* **Apa**: Model bayar gabungan (Langganan tetap + Bayar sesuai pakai).
* **Mekanisme**:
    *   Integrasi **Stripe Subscription** untuk biaya bulanan.
    *   Integrasi **Stripe Metering** untuk biaya variabel (token AI).
    *   Tagihan digabung di akhir bulan.
* **Nilai**: Adil bagi user (bayar murah jika jarang pakai AI) dan menguntungkan bagi Anda (pendapatan tak terbatas).

### 12. Automated Dunning Management
* **Apa**: Penanganan otomatis saat kartu kredit user ditolak/kadaluarsa.
* **Mekanisme**:
    1.  Stripe mengirim sinyal `payment_failed`.
    2.  Sistem otomatis mengirim email peringatan.
    3.  Jika gagal 3x, sistem melakukan **"Soft Lock"** (kunci akses tanpa hapus data).
* **Nilai**: Mengurangi Churn (kehilangan pelanggan) yang tidak disengaja.

---

## 🛡️ PILAR 4: Operational (The Hidden Pillar)
*Fokus: Kestabilan dan Pemeliharaan Sistem.*

### 13. Schema Sync (Sinkronisasi Database Massal)
* **Apa**: Cara mengupdate struktur tabel di 100 database Enterprise sekaligus.
* **Mekanisme**:
    1.  Script deployment membaca daftar koneksi database aktif.
    2.  Melakukan looping perintah migrasi (`drizzle-kit push`) ke setiap URL database secara paralel/antrian.
* **Nilai**: Maintainability. Tanpa ini, update fitur untuk klien Enterprise akan mustahil.

### 14. Data Residency Router
* **Apa**: Logika untuk menentukan lokasi server penyimpanan data.
* **Mekanisme**:
    1.  Saat registrasi, user memilih region: "Indonesia" atau "Global".
    2.  Sistem membuat database di Region AWS/Google Cloud yang sesuai (misal: `ap-southeast-3` untuk Jakarta).
* **Nilai**: Kepatuhan regulasi lokal (Data Sovereignty) untuk sektor publik.

### 15. Graceful Degradation (Anti-Crash)
* **Apa**: Strategi "Tetap Jalan Walau Pincang".
* **Mekanisme**:
    1.  Jika API AI timeout/error.
    2.  Sistem menangkap error, menyembunyikan fitur AI, dan menampilkan input manual biasa.
    3.  Aplikasi utama (CRUD) tetap berfungsi normal.
* **Nilai**: Reliability. User tetap bisa bekerja meskipun fitur tambahan sedang gangguan.

### 16. Project & Task Management (Kanban)
* **Apa**: Sistem manajemen proyek kolaboratif gaya GitHub/Trello.
* **Mekanisme**:
    1.  User membuat **Project** dan mengundang member tertentu (Project-level access).
    2.  User membuat **Tasks** dengan status (Todo, In Progress, Done) dan Priority.
    3.  Tampilan Visual **Kanban Board** untuk drag-and-drop status update.
* **Nilai**: Produktivitas tim terpusat. Tidak perlu langganan Trello/Jira terpisah.

### 17. White-Labeling Engine
* **Apa**: Kemampuan mengganti Logo, Warna, dan Domain agar terlihat seperti aplikasi milik klien sendiri.
* **Mekanisme**:
    1.  Admin mengupload Logo dan memilih Primary Color di Settings.
    2.  **Custom SMTP**: Mengirim email notifikasi (Invite/Invoice) menggunakan server email klien sendiri.
    3.  UI otomatis menyesuaikan tema berdasarkan konfigurasi penyewa.
* **Nilai**: Brand Identity. Klien Enterprise ingin software terasa "milik mereka".

### 18. Advanced Observability Suite
* **Apa**: "Dashboard Kokpit" untuk memantau kesehatan sistem secara mikroskopis.
* **Mekanisme**:
    *   **OpenTelemetry**: Melacak perjalanan data (Trace) dari frontend ke backend hingga database.
    *   **PostHog**: Menganalisis perilaku user (Pages, Clicks) untuk perbaikan UX.
    *   **Sentry**: Menangkap error + rekaman sesi sebelum crash terjadi.
* **Nilai**: Kecepatan perbaikan bug dan pemahaman mendalam tentang user.
