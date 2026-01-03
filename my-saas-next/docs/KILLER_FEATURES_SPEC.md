# 🚀 Strategic Roadmap: 3 Killer Features
> "From Boilerplate to Enterprise Operating System"

Dokumen ini mendetailkan spesifikasi teknis dan implementasi untuk 3 fitur unggulan yang akan membedakan SaaS ini dari kompetitor.

---

## 1. 🕵️ "Privacy-First" AI Proxy (The GDPR Shield)
**Core Value:** Memberikan jaminan keamanan data bagi klien Enterprise (HealthTech, FinTech, Legal) yang takut menggunakan LLM karena isu privasi.

### Arsitektur Konseptual
Daripada memanggil OpenAI/Gemini secara langsung di setiap service, semua request AI harus melalui **Central Privacy Gateway (`src/services/ai-gateway`)**.

### Fitur Utama
1.  **PII Auto-Redaction (Smart Masking)**
    *   Menggunakan regex + NLP ringan untuk mendeteksi Email, Credit Card, SSN, dan Phone Number.
    *   Menggantinya dengan placeholder: `johndoe@gmail.com` -> `<EMAIL_1>`, `08123456789` -> `<PHONE_1>`.
    *   Menyimpan mapping asli di Redis sementara.
    *   Saat respon balik dari AI, sistem melakukan **De-masking** (mengembalikan data asli) jika diperlukan.
2.  **Field-Level Data Loss Prevention (DLP)**
    *   Konfigurasi database untuk menandai kolom "Sensitive".
    *   Jika developer tidak sengaja mengirim object user penuh ke prompt, sistem otomatis membuang field sensitif.
3.  **Audit Trail for Compliance**
    *   Mencatat *metadata* setiap prompt (siapa, kapan, berapa token) tanpa mencatat *isi* prompt (zero-knowledge logging opsional).

### Technical Implementation Plan
*   **File:** `src/lib/ai/privacy-layer.ts`
*   **Database:** Tambah tabel `ai_privacy_policies` (teamId, blockedKeywords, piiEnabled).
*   **UI:** Halaman `Settings > AI Privacy`
    *   Toggle: "Mask All Emails", "Mask Credit Cards".
    *   List: "Do Not Send these Database Columns".

---

## 2. 🤖 "Background Worker" Dashboard (The Agent Monitor)
**Core Value:** Mengubah persepsi user dari "Aplikasi Statis" menjadi "Sistem Otomatis yang Hidup". User suka melihat progres bar bergerak.

### Arsitektur Konseptual
Memanfaatkan event dari **Inngest** atau background job queue internal untuk memberikan *real-time feedback* ke UI via polling atau Server-Sent Events (SSE).

### Fitur Utama
1.  **Visual Agent Status**
    *   Menampilkan kartu status untuk setiap "Agent" yang berjalan (misal: "Weekly Report Agent: 45% Generating Summary...").
2.  **Job History & Replay**
    *   Log visual: "Laporan Gagal (Retry 2/3)" dengan tombol "Run Now".
3.  **Human-in-the-Loop Approval**
    *   Jika AI Agent punya confidence score rendah (< 70%), ia akan "Pause" dan meminta approval manusia via Dashboard ini sebelum mengirim email/action.

### Technical Implementation Plan
*   **Backend:** Endpoint `/api/agents/status` yang mengekspos status Inngest runs.
*   **Frontend:** `src/components/dashboard/AgentActivity.tsx`
    *   Menggunakan `useSWR` dengan refresh interval pendek (3s) atau WebSocket.
    *   UI State: `Idle`, `Thinking`, `Acting`, `Waiting Approval`.

---

## 3. 📦 One-Command Vertical Generation (The DX Engine)
**Core Value:** Kecepatan development ekstrem. Mengurangi waktu "boilerplate" dari 2 jam menjadi 30 detik untuk fitur baru.

### Enhance Existing Script (`generate-module.ts`)
Saat ini script hanya membuat file. Ke depan, script harus **memanipulasi** kode yang ada (Codebase Manipulation).

### Fitur Tambahan (v2.0)
1.  **Direct Sidebar Injection**
    *   *Logic:* Baca `src/config/navigation.ts` atau layout file.
    *   *Action:* Inject menu item baru (`{ name: 'Products', href: '/dashboard/products', icon: 'Box' }`) secara otomatis.
2.  **Schema-to-Source (Zod -> Form)**
    *   *Logic:* Dari definisi Zod schema (`name: z.string()`), otomatis generate file React Component `ProductForm.tsx` yang berisi input field dengan validasi `react-hook-form`.
3.  **Auto-Wiring API**
    *   Otomatis mendaftarkan route baru di `middleware.ts` jika perlu (meskipun Next.js file-routing sudah menangani sebagian besar hal ini, permission checks mungkin perlu inject).

### Technical Implementation Plan
*   **Library:** Gunakan `ts-morph` untuk manipulasi AST (Abstract Syntax Tree) yang aman, jangan hanya `fs.appendFile` string interpolation yang rawan syntax error.
*   **Command:** `npm run gen:feature <FeatureName> -- --with-ui --with-sidebar`

---

## 💡 Summary of Priority

| Fitur | Dampak Bisnis | Tingkat Kesulitan | Prioritas |
| :--- | :--- | :--- | :--- |
| **Privacy Proxy** | Tinggi (Unlock Enterprise) | Medium | **P1 (Immediate)** |
| **Vertical Gen** | Tinggi (Internal Speed) | Low (Scripting) | **P2 (Internal Tool)** |
| **Agent Dashboard**| Medium (UX Wow Factor) | High (Realtime) | **P3 (Next Phase)** |
