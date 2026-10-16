import React, { useEffect, useState, useCallback } from "react";
import {
  supabase,
  isSupabaseConfigured,
  sampleFinances,
  sampleReminders,
  sampleNotes,
  FinanceRecord,
  ReminderRecord,
  NoteRecord,
} from "./lib/supabase";
import { Navbar } from "./components/Navbar";
import { MetricCards } from "./components/MetricCards";
import { ExpenseChart } from "./components/ExpenseChart";
import { TransactionList } from "./components/TransactionList";
import { ReminderList } from "./components/ReminderList";
import { NoteList } from "./components/NoteList";
import { Info, Sparkles, MessageSquare } from "lucide-react";

export const App: React.FC = () => {
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data from Supabase or fallback to mock
  const fetchData = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Mode Demo
      setFinances(sampleFinances);
      setReminders(sampleReminders);
      setNotes(sampleNotes);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch finances
      const { data: finData } = await supabase
        .from("finances")
        .select("*")
        .order("transaction_date", { ascending: false });

      // 2. Fetch reminders
      const { data: remData } = await supabase
        .from("reminders")
        .select("*")
        .order("remind_at", { ascending: true });

      // 3. Fetch notes
      const { data: noteData } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (finData) setFinances(finData as FinanceRecord[]);
      if (remData) setReminders(remData as ReminderRecord[]);
      if (noteData) setNotes(noteData as NoteRecord[]);
    } catch (err) {
      console.error("Error fetching Supabase data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Setup Supabase Realtime Listener jika terhubung
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("schema-db-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "finances" },
          () => fetchData()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "reminders" },
          () => fetchData()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notes" },
          () => fetchData()
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [fetchData]);

  // Toggle Reminder Status
  const handleToggleReminder = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";

    // Optimistic UI update
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus as any } : r))
    );

    if (isSupabaseConfigured && supabase) {
      await supabase.from("reminders").update({ status: nextStatus }).eq("id", id);
    }
  };

  // Delete Reminder
  const handleDeleteReminder = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from("reminders").delete().eq("id", id);
    }
  };

  // Delete Note
  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from("notes").delete().eq("id", id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        onRefresh={fetchData}
        isLoading={loading}
        isDbConnected={isSupabaseConfigured}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Banner informasi jika dalam mode demo / setup guide */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold block text-sm mb-1 text-amber-950">
                Mode Demo Aktif: Supabase belum terhubung ke Web Dashboard
              </span>
              Data di bawah ini merupakan data contoh (*sample data*). Untuk menghubungkan database
              asli, jalankan skrip SQL di{" "}
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">supabase/schema.sql</code>,
              kemudian buat file{" "}
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">dashboard/.env</code>{" "}
              berisi <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> dan{" "}
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code>.
            </div>
          </div>
        )}

        {/* 1. Baris Kartu Metrik Keuangan & Pengingat */}
        <MetricCards finances={finances} reminders={reminders} />

        {/* 2. Grid Visualisasi & Transaksi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Grafik Kategori Pengeluaran */}
          <div className="lg:col-span-5">
            <ExpenseChart finances={finances} />
          </div>

          {/* Tabel Riwayat Transaksi */}
          <div className="lg:col-span-7">
            <TransactionList finances={finances} />
          </div>
        </div>

        {/* 3. Grid Manajemen Pengingat & Catatan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReminderList
            reminders={reminders}
            onToggleStatus={handleToggleReminder}
            onDelete={handleDeleteReminder}
          />
          <NoteList notes={notes} onDelete={handleDeleteNote} />
        </div>

        {/* 4. Petunjuk Chat WhatsApp Interaktif */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Contoh Perintah WhatsApp Natural (Gemini AI)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Keuangan Otomatis
              </span>
              <p className="text-slate-500 italic">
                &ldquo;Beli kopi starbucks 45rb pakai gopay&rdquo; atau &ldquo;Dapat komisi desain 1.2jt&rdquo;
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Jadwal Pengingat
              </span>
              <p className="text-slate-500 italic">
                &ldquo;Ingatkan saya bayar wifi besok jam 8 pagi&rdquo; atau &ldquo;Ingatkan rapat 15 menit lagi&rdquo;
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Simpan Catatan / Ide
              </span>
              <p className="text-slate-500 italic">
                &ldquo;Catat ide: Bikin tool otomatisasi posting media sosial&rdquo;
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>AI Personal Assistant &bull; Node.js + Baileys + Google Gemini API + Supabase</p>
          <p>Biaya Infrastruktur: Rp0 / Bulan (Free Tier Cloud)</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

