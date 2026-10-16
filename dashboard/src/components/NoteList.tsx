import React, { useState } from "react";
import type { NoteRecord } from "../lib/supabase";
import { StickyNote, Search, Trash2, Tag } from "lucide-react";

interface NoteListProps {
  notes: NoteRecord[];
  onDelete: (id: string) => void;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, onDelete }) => {
  const [search, setSearch] = useState("");

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      n.content.toLowerCase().includes(q) ||
      (n.category && n.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-slate-700" />
          <h2 className="font-bold text-slate-900 text-base">Catatan &amp; Ide Cepat</h2>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ide atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-slate-400 text-center">
            <StickyNote className="w-10 h-10 stroke-[1.2] mb-2" />
            <p className="text-sm">Belum ada catatan ditemukan.</p>
            <p className="text-xs text-slate-400 mt-1">
              Kirim chat WA: &ldquo;Catat ide: Bikin website portofolio&rdquo;
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const dateObj = new Date(item.created_at);
            const dateStr = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={item.id}
                className="bg-amber-50/40 border border-amber-200/70 p-4 rounded-xl flex flex-col justify-between hover:shadow-sm transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-semibold text-slate-900 text-xs line-clamp-1">
                      {item.title || "Catatan Cepat"}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Tag className="w-2.5 h-2.5" />
                      {item.category || "Umum"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-200/40 text-[10px] text-slate-400">
                  <span>{dateStr}</span>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition"
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

