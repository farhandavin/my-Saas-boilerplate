# Grand Documentation: Enterprise Business OS

## 🏗️ Introduction
**Enterprise Business OS** adalah sistem operasi bisnis menyeluruh yang menggantikan tugas kognitif berulang dengan kecerdasan mesin, menyediakan infrastruktur isolasi data kelas enterprise, dan strategi monetisasi yang fleksibel.

---

## 🧠 PILAR 1: AI (The Intelligence)
**Fokus:** Menggantikan tugas kognitif berulang dengan kecerdasan mesin.

### 1. CEO Digest (Rangkuman Eksekutif Otomatis)
*   **Apa:** Asisten pribadi yang membaca ribuan data transaksi kemarin dan menyajikannya dalam 1 paragraf singkat.
*   **Mekanisme:**
    *   **Cron Job (Task Scheduler)** berjalan pukul 05:00 pagi.
    *   Mengambil data agregat dari DB (Total Revenue, Top Spending, Pending Tasks).
    *   Data mentah dikirim ke LLM (Gemini) dengan prompt: *"Bertindaklah sebagai analis bisnis, rangkum data JSON ini menjadi 3 poin wawasan strategis."*
    *   Output dikirim via Email/Dashboard Card.
*   **Nilai:** Menghemat 1-2 jam waktu CEO membaca laporan mentah.

### 2. AI Pre-Check (Validasi Input Cerdas)
*   **Apa:** "Satpam Digital" yang memeriksa draf dokumen sebelum disimpan atau diajukan.
*   **Mekanisme:**
    *   User mengisi form (misal: Invoice).
    *   Saat klik tombol "Pre-check", data dikirim ke API AI.
    *   AI memvalidasi terhadap Ruleset (SOP): *"Apakah PPN 11%?"*, *"Apakah tanggal jatuh tempo logis?"*, *"Apakah diskon melebihi batas wajar?"*.
    *   Mengembalikan respon JSON: `{ "valid": false, "reason": "Diskon 50% melanggar SOP maksimal 20%" }`.
*   **Nilai:** Mencegah human error yang merugikan finansial.

### 3. Internal RAG (Retrieval-Augmented Generation)
*   **Apa:** Chatbot yang hanya menjawab berdasarkan "Otak Perusahaan" (Dokumen Internal), bukan internet umum.
*   **Mekanisme:**
    *   User upload PDF (SOP/Kontrak).
    *   Sistem memecah teks (Chunking) dan mengubahnya menjadi vektor angka (Embeddings).
    *   Vektor disimpan di PostgreSQL (pgvector).
    *   Saat user bertanya, sistem mencari vektor yang paling mirip, lalu menyuruh AI menjawab berdasarkan teks tersebut.
*   **Nilai:** Menghapus halusinasi AI dan menjamin jawaban sesuai kebijakan perusahaan.

### 4. Privacy Layer (PII Masking)
*   **Apa:** Filter keamanan yang menyensor data pribadi sebelum keluar dari server Anda.
*   **Mekanisme:**
    *   Middleware mencegat request ke API AI.
    *   Menggunakan Regex atau Named Entity Recognition (NER) untuk mendeteksi NIK, Email, No HP.
    *   Menggantinya menjadi `[REDACTED_PHONE]`.
    *   Data aman dikirim ke Gemini/OpenAI.
*   **Nilai:** Kepatuhan hukum (UU PDP/GDPR) dan mencegah kebocoran data klien.

### 5. Operational Intelligence
*   **Apa:** Kalkulator margin keuntungan per user secara real-time.
*   **Mekanisme:**
    *   Mencatat setiap token input/output yang dipakai user.
    *   Menghitung biaya (Cost): Token x Harga API.
    *   Membandingkan dengan Harga Langganan User (Revenue).
*   **Nilai:** Mencegah kerugian bandar (Anda tahu kapan harus menaikkan harga atau membatasi user boros).

---

## 🏗️ PILAR 2: B2B (The Infrastructure)
**Fokus:** Keamanan, Isolasi Data, dan Konektivitas.

### 6. Hybrid Multi-Tenancy Architecture
*   **Apa:** Strategi database fleksibel berdasarkan seberapa banyak user membayar.
*   **Mekanisme:**
    *   **Tier Low (Shared):** Semua data user A & B ada di tabel yang sama. Dibedakan kolom `tenant_id`. Hemat resource.
    *   **Tier Medium (Schema):** Satu Database, tapi User A punya Schema `tenant_a`, User B punya Schema `tenant_b`. Data terpisah secara logika.
    *   **Tier High (Isolated):** User Enterprise dibuatkan Database Fisik baru (Server terpisah) di Neon/Supabase. Koneksi via URL database khusus.
*   **Nilai:** USP (Unique Selling Point) utama untuk menjual ke korporat besar yang paranoid soal keamanan data.

### 7. Seamless Migration Engine
*   **Apa:** Fitur "Pindah Rumah" otomatis untuk data.
*   **Mekanisme:**
    *   User klik "Upgrade to Enterprise".
    *   Background Job (Inngest) menyala.
    *   Job mengunci data lama (Read-only) -> Copy data dari Shared DB -> Paste ke Isolated DB baru -> Verifikasi jumlah baris -> Update Connection String user.
    *   User refresh halaman, sudah di server baru.
*   **Nilai:** Skalabilitas tanpa sakit kepala. Memungkinkan user tumbuh dari kecil ke raksasa tanpa ganti aplikasi.

### 8. API-First & Webhooks
*   **Apa:** Pintu akses bagi aplikasi lain untuk berinteraksi dengan OS Anda.
*   **Mekanisme:**
    *   **API:** Endpoint publik (misal: `GET /api/v1/invoices`) yang aman dengan API Key.
    *   **Webhooks:** Sistem Anda mengirim HTTP POST ke URL klien saat event terjadi (misal: `invoice.paid`).
*   **Nilai:** Membuat sistem Anda menjadi pusat ekosistem, terintegrasi dengan ERP/Accounting software lain.

### 9. Smart RBAC (Role-Based Access Control)
*   **Apa:** Hierarki izin akses yang granular.
*   **Mekanisme:**
    *   Mendefinisikan Role (Admin, Manager, Staff) dan Permission (Create, Read, Update, Delete).
    *   Middleware mengecek setiap request: *"Apakah User X punya izin `delete_invoice`?"*.
    *   Jika tidak, tolak (403 Forbidden).
*   **Nilai:** Keamanan internal perusahaan klien (Staf magang tidak bisa melihat gaji CEO).

### 10. Audit Logs (Jejak Digital)
*   **Apa:** CCTV database yang mencatat segala aktivitas.
*   **Mekanisme:**
    *   Setiap operasi INSERT, UPDATE, DELETE memicu pencatatan ke tabel `audit_logs`.
    *   Menyimpan: Actor (Siapa), Action (Apa), Old_Value, New_Value, Timestamp.
*   **Nilai:** Transparansi total dan syarat audit untuk perusahaan finansial.

---

## 💳 PILAR 3: Payment (The Monetization)
**Fokus:** Kelancaran arus kas dan strategi harga.

### 11. Tiered Subscription & Usage Billing
*   **Apa:** Model bayar gabungan (Langganan tetap + Bayar sesuai pakai).
*   **Mekanisme:**
    *   Integrasi Stripe Subscription untuk biaya bulanan (akses fitur).
    *   Integrasi Stripe Metering untuk biaya variabel (token AI).
    *   Tagihan digabung di akhir bulan.
*   **Nilai:** Adil bagi user (bayar murah jika jarang pakai AI) dan menguntungkan bagi Anda (pendapatan tak terbatas).

### 12. Automated Dunning Management
*   **Apa:** Penanganan otomatis saat kartu kredit user ditolak/kadaluarsa.
*   **Mekanisme:**
    *   Stripe mengirim sinyal `payment_failed`.
    *   Sistem Anda otomatis mengirim email peringatan.
    *   Jika gagal 3x, sistem otomatis mengunci akses ("Soft Lock") tanpa menghapus data.
*   **Nilai:** Mengurangi Churn (kehilangan pelanggan) yang tidak disengaja.

---

## 🛡️ PILAR 4: Operational (The Hidden Pillar)
**Fokus:** Kestabilan dan Pemeliharaan Sistem.

### 13. Schema Sync (Sinkronisasi Database Massal)
*   **Apa:** Cara mengupdate struktur tabel di 100 database Enterprise sekaligus.
*   **Mekanisme:**
    *   Script deployment membaca daftar semua koneksi database aktif.
    *   Melakukan looping perintah migrasi (`drizzle-kit push`) ke setiap URL database secara paralel/antrian.
*   **Nilai:** Maintainability. Tanpa ini, Anda mati kutu saat harus update fitur untuk klien Enterprise.

### 14. Data Residency Router
*   **Apa:** Logika untuk menentukan lokasi server penyimpanan data.
*   **Mekanisme:**
    *   Saat registrasi, user memilih region: "Indonesia" atau "Global".
    *   Sistem membuat database di Region AWS/Google Cloud yang sesuai (misal: `ap-southeast-3` untuk Jakarta).
*   **Nilai:** Kepatuhan regulasi lokal (seperti kewajiban data center di Indonesia untuk sektor publik).

### 15. Graceful Degradation (Anti-Crash)
*   **Apa:** Strategi "Tetap Jalan Walau Pincang".
*   **Mekanisme:**
    *   Jika API AI timeout atau error.
    *   Sistem menangkap error tersebut, menyembunyikan fitur AI, dan menampilkan input manual biasa.
    *   Aplikasi utama (CRUD) tetap bisa dipakai.
*   **Nilai:** Reliability. User tetap bisa bekerja meskipun fitur tambahan sedang gangguan.

---

## 💻 Technical Stack

*   **Framework:** Next.js 14/15 (App Router) + TypeScript.
*   **Database:** PostgreSQL dengan **Drizzle ORM** (karena mendukung schema-based multi-tenancy dengan sangat baik).
*   **AI:** Vercel AI SDK + Gemini API / OpenAI.
*   **Infrastructure:** Inngest (untuk Background Jobs/Migration Engine) dan Neon/Supabase untuk database.
*   **UI:** Tailwind CSS + Shadcn UI (standar industri saat ini).

---

## 📂 Halaman & Fitur Aplikasi (Sitemap)

### 1. Public Pages (Halaman Luar)
Halaman ini adalah kesan pertama bagi pembeli atau user klien Anda.
*   **Landing Page:** Penjelasan fitur, pricing table, dan testimoni.
*   **Login & Register:** Form autentikasi (support Social Login & Magic Link).
*   **Forgot Password:** Alur pemulihan akun.

### 2. Core Dashboard (Pusat Kendali)
Halaman utama di mana "AI Intelligence" dipamerkan.
*   **Main Overview:** Menampilkan CEO Digest (Widget ringkasan di paling atas) dan chart statistik pendapatan/pengeluaran.
*   **Activity/Audit Logs Page:** List jejak digital siapa melakukan apa (Pillar 2).

### 3. Business Modules (Contoh CRUD + AI Pre-check)
Gunakan satu contoh objek, misalnya "Invoices" atau "Project".
*   **List View:** Tabel data dengan filter, search, dan pagination.
*   **Create/Edit Form:** Di sini fitur AI Pre-check bekerja (validasi otomatis saat input data).
*   **Detail View:** Menampilkan data lengkap beserta log perubahan khusus data tersebut.

### 4. Advanced AI Features (Pillar 1)
Halaman khusus untuk fitur kecerdasan buatan.
*   **Knowledge Base (RAG):** Halaman upload PDF/Dokumen untuk di-training ke AI. Ada progress bar saat embedding.
*   **AI Playground/Chat:** Antarmuka chatbot untuk bertanya pada dokumen internal perusahaan.

### 5. Management & Settings (Pillar 2 & 3)
Bagian yang membuat sistem ini disebut "Enterprise".
*   **Team Management (RBAC):** Halaman invite member, ganti Role (Admin/Manager/Staff).
*   **Organization Settings:** Pengaturan nama perusahaan, logo, dan pilihan Data Residency (Pillar 4).
*   **Billing & Usage:** Menampilkan paket langganan saat ini dan Usage Metering (berapa token AI yang sudah dipakai).
*   **API & Webhooks:** Tempat user generate API Key untuk integrasi pihak ketiga.

### 6. Superadmin (Internal OS)
Halaman khusus Anda (pemilik SaaS) untuk memantau infrastruktur.
*   **System Health & Operational Intelligence:** Menampilkan biaya API yang keluar vs pendapatan dari user (Pillar 1 - Poin 5).
*   **Tenant Manager:** Daftar semua perusahaan yang mendaftar dan status database mereka (Isolated/Shared).
