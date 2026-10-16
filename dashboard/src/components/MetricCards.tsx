import React from "react";
import { TrendingUp, TrendingDown, Wallet, Bell } from "lucide-react";
import type { FinanceRecord, ReminderRecord } from "../lib/supabase";

interface MetricCardsProps {
  finances: FinanceRecord[];
  reminders: ReminderRecord[];
}

export const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const MetricCards: React.FC<MetricCardsProps> = ({ finances, reminders }) => {
  const totalIncome = finances
    .filter((f) => f.type === "income")
    .reduce((sum, f) => sum + Number(f.amount), 0);

  const totalExpense = finances
    .filter((f) => f.type === "expense")
    .reduce((sum, f) => sum + Number(f.amount), 0);

  const balance = totalIncome - totalExpense;
  const pendingRemindersCount = reminders.filter((r) => r.status === "pending").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pemasukan */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Pemasukan</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(totalIncome)}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Pemasukan Tercatat
          </p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Total Pengeluaran */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Pengeluaran</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(totalExpense)}</h3>
          <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Pengeluaran Tercatat
          </p>
        </div>
        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
          <TrendingDown className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Saldo Bersih */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sisa Saldo Bersih</p>
          <h3 className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-slate-900" : "text-rose-600"}`}>
            {formatRupiah(balance)}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Pemasukan dikurangi pengeluaran</p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Wallet className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Pengingat Aktif */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pengingat Menunggu</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingRemindersCount} Jadwal</h3>
          <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
            <Bell className="w-3.5 h-3.5" /> Siap dikirim ke WhatsApp
          </p>
        </div>
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <Bell className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

