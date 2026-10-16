import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface FinanceRecord {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  payment_method: string;
  note: string;
  transaction_date: string;
  created_at: string;
}

export interface ReminderRecord {
  id: string;
  user_id: string;
  message: string;
  remind_at: string;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
}

export interface NoteRecord {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project-id")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock data untuk mode demo saat Supabase belum disambungkan
export const sampleFinances: FinanceRecord[] = [
  {
    id: "1",
    user_id: "628123456789@s.whatsapp.net",
    type: "income",
    amount: 5500000,
    category: "Gaji & Freelance",
    payment_method: "BCA",
    note: "Gaji Freelance UI Project",
    transaction_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "2",
    user_id: "628123456789@s.whatsapp.net",
    type: "expense",
    amount: 45000,
    category: "Makanan & Minuman",
    payment_method: "Gopay",
    note: "Makan siang ayam geprek + es teh",
    transaction_date: new Date(Date.now() - 86400000 * 1).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "3",
    user_id: "628123456789@s.whatsapp.net",
    type: "expense",
    amount: 150000,
    category: "Transportasi",
    payment_method: "OVO",
    note: "Isi bensin Pertamax full",
    transaction_date: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "4",
    user_id: "628123456789@s.whatsapp.net",
    type: "expense",
    amount: 350000,
    category: "Tagihan & Utilitas",
    payment_method: "BCA",
    note: "Langganan internet IndiHome",
    transaction_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

export const sampleReminders: ReminderRecord[] = [
  {
    id: "rem-1",
    user_id: "628123456789@s.whatsapp.net",
    message: "Rapat evaluasi proyek mingguan dengan tim dev",
    remind_at: new Date(Date.now() + 3600000 * 2).toISOString(),
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "rem-2",
    user_id: "628123456789@s.whatsapp.net",
    message: "Bayar tagihan listrik PLN sebelum tanggal 20",
    remind_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "rem-3",
    user_id: "628123456789@s.whatsapp.net",
    message: "Jemput paket di pos satpam",
    remind_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: "completed",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const sampleNotes: NoteRecord[] = [
  {
    id: "note-1",
    user_id: "628123456789@s.whatsapp.net",
    title: "Ide Bisnis Micro-SaaS",
    content: "Bikin WhatsApp bot untuk pencatatan otomatis restoran lokal menggunakan Gemini AI.",
    category: "Ide",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "note-2",
    user_id: "628123456789@s.whatsapp.net",
    title: "Rekomendasi Buku",
    content: "Atomic Habits oleh James Clear dan The Psychology of Money oleh Morgan Housel.",
    category: "Pribadi",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

