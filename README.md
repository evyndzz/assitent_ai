# 🤖 AssistAI - Asisten AI Pribadi Pintar (WhatsApp & Web Dashboard)

> Proyek asisten pribadi cerdas berbasis WhatsApp dan Web Dashboard interaktif. Mampu mencatat keuangan, menjadwalkan pengingat (*reminders*), dan menyimpan ide penting secara otomatis hanya dengan percakapan bahasa alami (*natural language*). 
> **100% Biaya Infrastruktur Rp0 (Free Tier Cloud).**

---

## 🌟 Fitur Utama

1. **Pencatatan Keuangan Otomatis (Finance Tracker):**
   - Cukup ketik: *"Beli makan siang Rp25.000 pakai uang BCA"* atau *"Dapat komisi freelance 1.5jt"*.
   - AI mengidentifikasi jenis (Pemasukan/Pengeluaran), nominal rupiah, kategori, metode bayar, dan menyimpannya ke Supabase.
   - Tanyakan saldo kapan saja: *"Pengeluaran saya bulan ini berapa?"* atau *"Cek saldo"*.

2. **Sistem Pengingat Fleksibel (Reminder Scheduler):**
   - Cukup ketik: *"Ingatkan saya rapat dengan klien besok jam 10 pagi"* atau *"Ingatkan 30 menit lagi angkat cucian"*.
   - Scheduler di background secara berkala memantau jadwal dan otomatis mengirim pesan pengingat ke WhatsApp Anda tepat waktu.

3. **Pencatatan Catatan / Ide Cepat (Quick Notes):**
   - Cukup ketik: *"Catat ide: Bikin website portfolio pakai NuxtJS"*.
   - Catatan tersimpan rapi dan dapat dicari di Web Dashboard.

4. **Web Dashboard Interaktif:**
   - **Kartu Metrik:** Total pemasukan, total pengeluaran, saldo bersih, dan pengingat aktif.
   - **Grafik Visual:** Diagram lingkaran (*doughnut chart*) pengeluaran berdasarkan kategori.
   - **Tabel Transaksi:** Riwayat lengkap transaksi dengan filter pemasukan/pengeluaran.
   - **Manajemen Pengingat & Catatan:** Tandai selesai atau hapus pengingat & ide secara langsung dari browser.
   - **Realtime Sync:** Perubahan data dari chat WhatsApp langsung terupdate di dashboard secara *real-time*.

---

## 📐 Arsitektur Sistem

```
[ WhatsApp (Pengguna) ] 
       │ (Kirim Pesan Natural)
       ▼
[ Bot Engine (Node.js + Baileys) ] ── (NLP Intent Extraction) ──> [ Google Gemini API ]
       │                                                                  │
       ├───────────────────── (CRUD Data Terstruktur) ────────────────────┤
       ▼                                                                  ▼
[ Database (Supabase PostgreSQL) ] <══════════════════════ [ Web Dashboard (Vite + Tailwind) ]
       │
       ▼ (Polling Tiap 30 Detik)
[ Reminder Scheduler (Cron) ] ── (Push Notifikasi) ──> [ WhatsApp Pengguna ]
```

---

## 📁 Struktur Direktori

```
assist_ai/
├── backend/                  # Bot Engine WhatsApp + REST API + Scheduler
│   ├── src/
│   │   ├── ai/               # Gemini AI SDK & Natural Language Prompt Engine
│   │   ├── bot/              # Baileys WhatsApp Socket & Message Router
│   │   ├── db/               # Supabase Client & CRUD Helpers
│   │   ├── scheduler/        # Background Cron Job untuk Notifikasi Pengingat
│   │   ├── server.ts         # Express REST API (Healthcheck & Status)
│   │   └── index.ts          # Main Entrypoint
│   ├── package.json
│   └── .env.example
├── dashboard/                # Web Dashboard Interaktif (Vite + React + Tailwind)
│   ├── src/
│   │   ├── components/       # MetricCards, ExpenseChart, TransactionList, ReminderList, NoteList
│   │   ├── lib/supabase.ts   # Supabase Browser Client & Sample Data
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
├── supabase/
│   └── schema.sql            # Skrip DDL Database (Tabel finances, reminders, notes, RLS)
└── README.md
```

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat Sistem
- **Node.js** versi 18 atau lebih baru (`node -v`)
- Akun gratis **[Google AI Studio](https://aistudio.google.com/)** untuk mendapatkan Gemini API Key
- Akun gratis **[Supabase](https://supabase.com/)** untuk database PostgreSQL

---

### 2. Setup Database di Supabase
1. Masuk ke dashboard [Supabase](https://supabase.com/) dan buat project baru (gratis).
2. Buka menu **SQL Editor** di panel sebelah kiri.
3. Buka file [`supabase/schema.sql`](supabase/schema.sql), salin seluruh isinya, tempel ke SQL Editor Supabase, dan klik **Run**.
4. Buka menu **Project Settings -> API**, catat:
   - **Project URL**
   - **anon / public key** (atau `service_role` key untuk backend)

---

### 3. Konfigurasi & Menjalankan Backend (WhatsApp Bot)

1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Buat file `.env` dari `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Buka file `.env` dan isi kredensial Anda:
   ```env
   PORT=3001
   BOT_NAME="AssistAI Personal"
   GEMINI_API_KEY=AIzaSy...                # Dari Google AI Studio
   SUPABASE_URL=https://xxxx.supabase.co   # Dari Supabase
   SUPABASE_ANON_KEY=eyJhbGciOi...        # Dari Supabase
   ```
4. Jalankan bot WhatsApp:
   ```bash
   npm run start
   ```
5. **Scan QR Code:** Terminal akan menampilkan QR code. Buka aplikasi WhatsApp di HP Anda -> **Perangkat Tertaut (Linked Devices)** -> **Tautkan Perangkat**, lalu arahkan kamera ke terminal.
6. Saat muncul pesan `🎉 [WhatsApp Connected] Bot Asisten AI siap digunakan!`, bot Anda sudah aktif!

---

### 4. Konfigurasi & Menjalankan Web Dashboard

1. Buka terminal baru dan masuk ke folder dashboard:
   ```bash
   cd dashboard
   ```
2. Buat file `.env` dari `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Buka file `.env` dan isi kredensial Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. Jalankan server frontend:
   ```bash
   npm run dev
   ```
5. Buka browser di [http://localhost:5173](http://localhost:5173). Dashboard Anda siap menampilkan data secara *real-time*!

---

## 💬 Contoh Percakapan di WhatsApp

| Kategori | Pesan Pengguna | Respon Bot & Aksi Sistem |
| :--- | :--- | :--- |
| **Pengeluaran** | *"Beli makan siang 35rb pake bca"* | AI mencatat pengeluaran Rp35.000 kategori *Makanan & Minuman* metode *BCA*. Muncul di grafik dashboard. |
| **Pemasukan** | *"Alhamdulillah dapat transferan freelance 2.500.000"* | AI mencatat pemasukan Rp2.500.000 kategori *Freelance / Gaji*. Saldo otomatis bertambah. |
| **Pengingat** | *"Ingatkan saya telpon vendor besok jam 9 pagi"* | Bot menjadwalkan reminder. Besok jam 09:00 WIB, bot otomatis mengirim chat pengingat ke Anda. |
| **Catatan Cepat**| *"Catat ide: Bikin sistem booking barbershop via WA"* | AI menyimpan catatan ke tabel *notes*. Bisa dicari dan dibaca kapan saja di dashboard. |
| **Tanya Saldo** | *"Berapa pengeluaran saya bulan ini?"* | Bot merekap total pengeluaran, pemasukan, dan sisa saldo saat ini secara instan di chat. |

---

## ☁️ Rekomendasi Deployment 24/7 (100% Gratis)

- **Backend (Bot & Scheduler):** Dapat dideploy di **Railway / Render / VPS Lokal (seperti Raspberry Pi atau laptop)**. Sesi login Baileys tersimpan di folder `backend/auth_info_baileys/` sehingga tidak perlu scan QR berulang kali.
- **Frontend Dashboard:** Dapat dideploy dengan 1-klik di **Vercel** atau **Netlify** secara gratis.

---

## 📜 Lisensi
MIT License - Bebas digunakan dan dikembangkan untuk keperluan personal maupun komersial.

