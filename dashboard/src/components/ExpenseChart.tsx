import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { FinanceRecord } from "../lib/supabase";
import { formatRupiah } from "./MetricCards";
import { PieChart } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  finances: FinanceRecord[];
}

const PALETTE = [
  "#f43f5e", // Rose
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#64748b", // Slate
];

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ finances }) => {
  const expenses = finances.filter((f) => f.type === "expense");

  // Group by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((item) => {
    const cat = item.category || "Lainnya";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(item.amount);
  });

  const categories = Object.keys(categoryTotals);
  const dataValues = Object.values(categoryTotals);
  const totalExpense = dataValues.reduce((a, b) => a + b, 0);

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: dataValues,
        backgroundColor: PALETTE.slice(0, categories.length),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0;
            return ` ${formatRupiah(val)} (${pct}%)`;
          },
        },
      },
    },
    cutout: "68%",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-slate-700" />
          <h2 className="font-bold text-slate-900 text-base">Distribusi Pengeluaran</h2>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          Berdasarkan Kategori
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400">
          <PieChart className="w-12 h-12 stroke-[1.2] mb-2" />
          <p className="text-sm">Belum ada data pengeluaran tercatat.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6 my-auto">
          {/* Donut Chart */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <span className="text-sm font-bold text-slate-800">{formatRupiah(totalExpense)}</span>
            </div>
          </div>

          {/* Category breakdown items */}
          <div className="flex-1 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {categories.map((cat, idx) => {
              const val = categoryTotals[cat];
              const pct = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
              const color = PALETTE[idx % PALETTE.length];

              return (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="font-medium text-slate-700 truncate">{cat}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-slate-500 font-mono">{pct}%</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(val)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

