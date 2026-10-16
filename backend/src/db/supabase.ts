import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config";

let supabase: SupabaseClient | null = null;

export const initSupabase = (): SupabaseClient | null => {
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.warn("⚠️ [Supabase] SUPABASE_URL atau SUPABASE_KEY belum dikonfigurasi di file .env");
    return null;
  }
  if (!supabase) {
    supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false },
    });
    console.log("✅ [Supabase] Klien Supabase berhasil terhubung:", config.supabaseUrl);
  }
  return supabase;
};

// ==========================================
// Database Models & Interfaces
// ==========================================
export interface FinanceItem {
  id?: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  payment_method?: string;
  note?: string;
  transaction_date?: string;
  created_at?: string;
}

export interface ReminderItem {
  id?: string;
  user_id: string;
  message: string;
  remind_at: string;
  status?: "pending" | "completed" | "cancelled";
  created_at?: string;
}

export interface NoteItem {
  id?: string;
  user_id: string;
  title?: string;
  content: string;
  category?: string;
  created_at?: string;
}

// ==========================================
// Finance Operations
// ==========================================
export const addFinanceRecord = async (item: FinanceItem) => {
  const client = initSupabase();
  if (!client) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { data, error } = await client
    .from("finances")
    .insert([
      {
        user_id: item.user_id,
        type: item.type,
        amount: item.amount,
        category: item.category,
        payment_method: item.payment_method || "Cash",
        note: item.note || "",
        transaction_date: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getFinancesSummary = async (userId: string) => {
  const client = initSupabase();
  if (!client) {
    return { income: 0, expense: 0, balance: 0, count: 0, categories: {} as Record<string, number> };
  }

  // Ambil transaksi awal bulan ini sampai sekarang
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data, error } = await client
    .from("finances")
    .select("type, amount, category")
    .eq("user_id", userId)
    .gte("transaction_date", startOfMonth);

  if (error) throw error;

  let income = 0;
  let expense = 0;
  const categories: Record<string, number> = {};

  (data || []).forEach((row) => {
    const val = Number(row.amount) || 0;
    if (row.type === "income") {
      income += val;
    } else if (row.type === "expense") {
      expense += val;
      const cat = row.category || "Lainnya";
      categories[cat] = (categories[cat] || 0) + val;
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
    count: data?.length || 0,
    categories,
  };
};

export const getRecentFinances = async (userId: string, limit = 5) => {
  const client = initSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from("finances")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// ==========================================
// Reminder Operations
// ==========================================
export const addReminder = async (item: ReminderItem) => {
  const client = initSupabase();
  if (!client) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { data, error } = await client
    .from("reminders")
    .insert([
      {
        user_id: item.user_id,
        message: item.message,
        remind_at: item.remind_at,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPendingReminders = async (userId: string) => {
  const client = initSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("remind_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getAllDueReminders = async () => {
  const client = initSupabase();
  if (!client) return [];

  const now = new Date().toISOString();

  const { data, error } = await client
    .from("reminders")
    .select("*")
    .eq("status", "pending")
    .lte("remind_at", now);

  if (error) {
    console.error("❌ [Supabase] Error saat polling pengingat:", error);
    return [];
  }
  return data || [];
};

export const markReminderCompleted = async (id: string) => {
  const client = initSupabase();
  if (!client) return;

  const { error } = await client
    .from("reminders")
    .update({ status: "completed" })
    .eq("id", id);

  if (error) console.error("❌ [Supabase] Gagal mengupdate status reminder:", error);
};

// ==========================================
// Notes Operations
// ==========================================
export const addNote = async (item: NoteItem) => {
  const client = initSupabase();
  if (!client) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { data, error } = await client
    .from("notes")
    .insert([
      {
        user_id: item.user_id,
        title: item.title || "Catatan Tanpa Judul",
        content: item.content,
        category: item.category || "Umum",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getNotes = async (userId: string, limit = 5) => {
  const client = initSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

