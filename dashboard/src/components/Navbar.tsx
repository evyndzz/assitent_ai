import React from "react";
import { Bot, RefreshCw, Database } from "lucide-react";

interface NavbarProps {
  onRefresh: () => void;
  isLoading: boolean;
  isDbConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, isLoading, isDbConnected }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-lg leading-tight">AssistAI Hub</h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Baileys WA
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Asisten AI Pribadi &bull; WhatsApp + Gemini AI + Supabase
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
            <Database className={`w-3.5 h-3.5 ${isDbConnected ? "text-emerald-500" : "text-amber-500"}`} />
            <span>{isDbConnected ? "Supabase Terhubung" : "Mode Demo (Lokal)"}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Perbarui Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};

