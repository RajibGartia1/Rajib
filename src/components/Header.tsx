import React from "react";
import { Sparkles, Flame, Search, Crown, ChevronDown } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedModel: "v4.0" | "v3.5" | "v3.0";
  onModelChange: (m: "v4.0" | "v3.5" | "v3.0") => void;
  credits: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedModel,
  onModelChange,
  credits,
}) => {
  return (
    <header className="h-16 border-b border-slate-850 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0" id="suno-main-header">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 select-none group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-950/40 text-white transform group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white font-sans">
                suno
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 -mt-1 hidden sm:block">
              Music Studio
            </span>
          </div>
        </div>

        {/* Model Picker */}
        <div className="relative ml-2 hidden md:block">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value as any)}
            className="appearance-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none cursor-pointer"
            id="model-selector-dropdown"
          >
            <option value="v4.0">Model v4.0 (Studio Master)</option>
            <option value="v3.5">Model v3.5 (Fast Creative)</option>
            <option value="v3.0">Model v3.0 (Legacy)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search songs, styles, tags, or lyrics..."
            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-rose-500/70 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            id="global-search-input"
          />
        </div>
      </div>

      {/* Right Controls: Credits & User */}
      <div className="flex items-center gap-3">
        {/* Credits Counter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold text-white">{credits}</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">credits</span>
        </div>

        {/* Upgrade Pro */}
        <button className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Pro</span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400/40 flex items-center justify-center text-xs font-bold text-white shadow-sm cursor-pointer select-none">
          AI
        </div>
      </div>
    </header>
  );
};
