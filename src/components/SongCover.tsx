import React from "react";
import { Play, Pause, Disc3, Music2, Sparkles } from "lucide-react";
import { SongClip } from "../types";

interface SongCoverProps {
  song: SongClip;
  size?: "sm" | "md" | "lg" | "xl";
  isPlaying?: boolean;
  onPlayToggle?: () => void;
  showPlayOverlay?: boolean;
  className?: string;
}

export const SongCover: React.FC<SongCoverProps> = ({
  song,
  size = "md",
  isPlaying = false,
  onPlayToggle,
  showPlayOverlay = true,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-11 h-11 text-xs rounded-lg",
    md: "w-16 h-16 text-sm rounded-xl",
    lg: "w-24 h-24 text-base rounded-xl",
    xl: "w-48 h-48 sm:w-56 sm:h-56 text-lg rounded-2xl",
  };

  const primary = song.primaryColor || "#FF4B3E";
  const secondary = song.secondaryColor || "#8B5CF6";
  const accent = song.accentColor || "#06B6D4";

  // Generate deterministic pattern based on song title & id
  const hash = (song.title + song.id).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const patternType = hash % 4;

  return (
    <div
      className={`relative overflow-hidden group select-none shadow-md flex-shrink-0 cursor-pointer ${sizeClasses[size]} ${className}`}
      onClick={onPlayToggle}
      id={`song-cover-${song.id}`}
    >
      {/* Dynamic Procedural Background Canvas Art */}
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
        style={{
          background: `linear-gradient(${135 + (hash % 90)}deg, ${primary} 0%, ${secondary} 50%, #0F172A 100%)`,
        }}
      >
        {/* Abstract Architectural/Vinyl Visual Pattern */}
        {patternType === 0 && (
          <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
            <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
            <circle cx="50" cy="50" r="18" stroke="white" strokeWidth="1" fill="none" opacity="0.4" />
            <circle cx="50" cy="50" r="6" fill={accent} opacity="0.8" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" opacity="0.3" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.5" opacity="0.3" />
          </svg>
        )}
        {patternType === 1 && (
          <svg className="absolute inset-0 w-full h-full opacity-35 mix-blend-overlay" viewBox="0 0 100 100">
            <polygon points="50,10 90,85 10,85" stroke="white" strokeWidth="1.5" fill="none" />
            <polygon points="50,90 90,15 10,15" stroke="white" strokeWidth="1" fill="none" opacity="0.4" />
            <circle cx="50" cy="50" r="14" fill={accent} opacity="0.6" />
          </svg>
        )}
        {patternType === 2 && (
          <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen" viewBox="0 0 100 100">
            <path d="M0,50 Q25,20 50,50 T100,50" stroke="white" strokeWidth="2" fill="none" />
            <path d="M0,60 Q25,30 50,60 T100,60" stroke={accent} strokeWidth="2" fill="none" />
            <path d="M0,40 Q25,10 50,40 T100,40" stroke={secondary} strokeWidth="1.5" fill="none" />
          </svg>
        )}
        {patternType === 3 && (
          <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay" viewBox="0 0 100 100">
            <rect x="15" y="15" width="70" height="70" rx="8" stroke="white" strokeWidth="1" fill="none" />
            <rect x="28" y="28" width="44" height="44" rx="4" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
            <circle cx="50" cy="50" r="8" fill={accent} opacity="0.9" />
          </svg>
        )}

        {/* Ambient Glow */}
        <div
          className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl opacity-60 pointer-events-none"
          style={{ backgroundColor: accent }}
        />

        {/* Music Emblem & Title Lettermark */}
        <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 bg-black/30 backdrop-blur-xs px-1.5 py-0.5 rounded">
              {song.model || "v4.0"}
            </span>
            {song.instrumental ? (
              <Music2 className="w-3.5 h-3.5 text-white/80" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
            )}
          </div>
          {size !== "sm" && (
            <div className="text-left">
              <span className="text-white font-extrabold text-[11px] leading-tight drop-shadow line-clamp-1 block">
                {song.title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover & Active Play Overlay */}
      {showPlayOverlay && (
        <div
          className={`absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 ${
            isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 active:scale-95">
            {isPlaying ? (
              <div className="flex items-center gap-0.5">
                <span className="w-0.5 h-3.5 bg-slate-900 animate-pulse" />
                <span className="w-0.5 h-4 bg-slate-900 animate-pulse delay-75" />
                <span className="w-0.5 h-2.5 bg-slate-900 animate-pulse delay-150" />
              </div>
            ) : (
              <Play className="w-4 h-4 fill-slate-900 ml-0.5" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
