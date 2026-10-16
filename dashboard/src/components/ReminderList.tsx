import React from "react";
import type { ReminderRecord } from "../lib/supabase";
import { Bell, CheckCircle2, Clock, Trash2 } from "lucide-react";

interface ReminderListProps {
  reminders: ReminderRecord[];
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
}

export const ReminderList: React.FC<ReminderListProps> = ({
  reminders,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-700" />
          <h2 className="font-bold text-slate-900 text-base">Jadwal Pengingat (Reminders)</h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {reminders.filter((r) => r.status === "pending").length} Aktif
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center">
            <Bell className="w-10 h-10 stroke-[1.2] mb-2" />
            <p className="text-sm">Belum ada pengingat terjadwal.</p>
            <p className="text-xs text-slate-400 mt-1">
              Kirim chat WA: &ldquo;Ingatkan saya rapat besok jam 10&rdquo;
            </p>
          </div>
        ) : (
          reminders.map((item) => {
            const isCompleted = item.status === "completed";
            const remindDate = new Date(item.remind_at);
            const formattedDate = remindDate.toLocaleDateString("id-ID", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            });

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                  isCompleted
                    ? "bg-slate-50/60 border-slate-200 opacity-60"
                    : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onToggleStatus(item.id, item.status)}
                    title={isCompleted ? "Tandai Belum Selesai" : "Tandai Selesai"}
                    className={`mt-0.5 transition ${
                      isCompleted ? "text-emerald-500" : "text-slate-300 hover:text-emerald-500"
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold ${
                        isCompleted ? "line-through text-slate-500" : "text-slate-800"
                      }`}
                    >
                      {item.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate} WIB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isCompleted
                        ? "bg-slate-200 text-slate-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isCompleted ? "Selesai" : "Menunggu"}
                  </span>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

