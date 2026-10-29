import React from "react";
import {
  Compass,
  PlusCircle,
  Library,
  Heart,
  Radio,
  SlidersHorizontal,
  Flame,
  Music4,
  Volume2,
} from "lucide-react";

interface SidebarProps {
  activeTab: "create" | "explore" | "library" | "liked";
  onTabChange: (tab: "create" | "explore" | "library" | "liked") => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  songCount: number;
  likedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  selectedTag,
  onTagSelect,
  songCount,
  likedCount,
}) => {
  const genrePills = [
    "Synthwave",
    "Lo-Fi",
    "Cyberpunk",
    "Indie Folk",
    "City Pop",
    "Hard Rock",
    "Future Bass",
    "Trap",
    "Jazz",
  ];

  return (
    <aside
      className="w-56 bg-slate-950 border-r border-slate-850 flex flex-col justify-between p-3 flex-shrink-0 select-none hidden md:flex"
      id="suno-sidebar-navigation"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          <button
            onClick={() => onTabChange("create")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "create"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-create-btn"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-4 h-4" />
              <span>Create</span>
            </div>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono">
              New
            </span>
          </button>

          <button
            onClick={() => onTabChange("explore")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "explore"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-explore-btn"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </div>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={() => onTabChange("library")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "library"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-library-btn"
          >
            <div className="flex items-center gap-2.5">
              <Library className="w-4 h-4" />
              <span>My Library</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{songCount}</span>
          </button>

          <button
            onClick={() => onTabChange("liked")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "liked"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
            id="nav-liked-btn"
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4" />
              <span>Liked Songs</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{likedCount}</span>
          </button>
        </div>

        {/* Explore Genres & Styles */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Music Genres
            </span>
            {selectedTag && (
              <button
                onClick={() => onTagSelect(null)}
                className="text-[10px] text-rose-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 px-1">
            {genrePills.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                  selectedTag === tag
                    ? "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Suno v4 Audio Engine</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          High-fidelity multi-stem audio synthesizer with Gemini song composition.
        </p>
      </div>
    </aside>
  );
};
