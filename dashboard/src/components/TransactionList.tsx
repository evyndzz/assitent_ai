import React, { useState } from "react";
import type { FinanceRecord } from "../lib/supabase";
import { formatRupiah } from "./MetricCards";
import { ArrowUpRight, ArrowDownLeft, Receipt, CreditCard } from "lucide-react";

interface TransactionListProps {
  finances: FinanceRecord[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ finances }) => {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filtered = finances.filter((f) => {
    if (filter === "all") return true;
    return f.type === filter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-slate-700" />
          <h2 className="font-bold text-slate-900 text-base">Riwayat Transaksi</h2>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg transition ${
              filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-3 py-1 rounded-lg transition ${
              filter === "income" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-3 py-1 rounded-lg transition ${
              filter === "expense" ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Pengeluaran
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Tidak ada transaksi ditemukan pada filter ini.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Kategori & Keterangan</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const isIncome = item.type === "income";
                const dateObj = new Date(item.transaction_date || item.created_at);
                const formattedDate = dateObj.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                });

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${
                          isIncome ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {isIncome ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.category}</div>
                      <div className="text-slate-500 truncate max-w-xs text-[11px]">{item.note || "-"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {item.payment_method || "Cash"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {formattedDate} WIB
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold text-sm ${
                        isIncome ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"} {formatRupiah(Number(item.amount))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

