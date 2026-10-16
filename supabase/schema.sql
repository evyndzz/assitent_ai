-- ==============================================================================
-- Schema Supabase PostgreSQL untuk Asisten AI Pribadi (WhatsApp & Web Dashboard)
-- ==============================================================================

-- 1. Tabel Pencatatan Keuangan (Pemasukan & Pengeluaran)
CREATE TABLE IF NOT EXISTS finances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                -- WhatsApp JID / Nomor HP (misal: 628123456789@s.whatsapp.net)
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT NOT NULL,               -- Kategori: Makanan, Transportasi, Gaji, Belanja, Hiburan, Tagihan, dll
    payment_method TEXT DEFAULT 'Cash',   -- Tunai, BCA, Mandiri, Gopay, OVO, dll
    note TEXT,                            -- Keterangan transaksi
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks untuk pencarian dan agregasi cepat
CREATE INDEX IF NOT EXISTS idx_finances_user ON finances(user_id);
CREATE INDEX IF NOT EXISTS idx_finances_date ON finances(transaction_date);
CREATE INDEX IF NOT EXISTS idx_finances_type ON finances(type);

-- 2. Tabel Pengingat (Reminders)
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                -- WhatsApp JID tujuan notifikasi
    message TEXT NOT NULL,                -- Isi pesan pengingat
    remind_at TIMESTAMPTZ NOT NULL,       -- Waktu pengingat harus dibunyikan/dikirim
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks untuk scheduler pengingat
CREATE INDEX IF NOT EXISTS idx_reminders_status_time ON reminders(status, remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);

-- 3. Tabel Catatan Cepat & Ide (Notes)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                -- WhatsApp JID pemilik catatan
    title TEXT,                           -- Judul catatan (opsional)
    content TEXT NOT NULL,                -- Isi ide / catatan
    category TEXT DEFAULT 'Umum',         -- Ide, Todo, Pekerjaan, Pribadi, dll
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks untuk catatan
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);

-- ==============================================================================
-- Row Level Security (RLS) & Akses Anon (Untuk Kemudahan Personal Setup)
-- ==============================================================================
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Perbolehkan operasi CRUD penuh untuk service_role dan anon key
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to finances for anon') THEN
        CREATE POLICY "Allow all access to finances for anon" ON finances FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to reminders for anon') THEN
        CREATE POLICY "Allow all access to reminders for anon" ON reminders FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to notes for anon') THEN
        CREATE POLICY "Allow all access to notes for anon" ON notes FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Opsional: Realtime publication jika ingin dashboard otomatis update saat ada data baru
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE finances, reminders, notes;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

