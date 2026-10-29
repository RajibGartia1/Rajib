import React, { useEffect, useRef, useState } from "react";
import { X, Copy, Check, Music2, Sparkles, Sliders } from "lucide-react";
import { SongClip } from "../types";
import { parseLyrics, formatTime } from "../utils/lyricsParser";

interface LyricsKaraokeDrawerProps {
  song: SongClip | null;
  isOpen: boolean;
  currentTime: number;
  onClose: () => void;
  onSeek: (time: number) => void;
  onOpenStems: () => void;
}

export const LyricsKaraokeDrawer: React.FC<LyricsKaraokeDrawerProps> = ({
  song,
  isOpen,
  currentTime,
  onClose,
  onSeek,
  onOpenStems,
}) => {
  const [copied, setCopied] = useState(false);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const lines = song ? parseLyrics(song.lyrics, song.duration) : [];

  // Find active line
  const activeLineIndex = lines.findIndex(
    (l) => currentTime >= l.startTime && currentTime <= l.endTime
  );

  // Auto-scroll active lyric into view
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex]);

  const handleCopy = () => {
    if (!song) return;
    navigator.clipboard.writeText(song.lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !song) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 md:w-[420px] bg-slate-950/95 border-l border-slate-850 shadow-2xl backdrop-blur-md flex flex-col transition-all duration-300 animate-slideInRight"
      id="lyrics-karaoke-drawer"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
              {song.title}
            </h3>
            <p className="text-[11px] text-slate-400">
              {song.key} • {song.bpm} BPM • {formatTime(song.duration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenStems}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-colors"
            title="Open Stem Mixer"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
            title="Copy Lyrics"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Style & Tags info banner */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-850 flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Style:</span>
        {song.tags.slice(0, 3).map((tag, i) => (
          <span
            key={i}
            className="text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/50"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Karaoke Scrolling Lyrics Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-4 font-sans select-text scroll-smooth"
      >
        {lines.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            <Music2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Instrumental Track</p>
            <p className="text-xs text-slate-600 mt-1">No lyrics for this piece</p>
          </div>
        ) : (
          lines.map((line, index) => {
            const isActive = index === activeLineIndex;
            const isPassed = currentTime > line.endTime;
            const isHeader = line.text.startsWith("[") && line.text.endsWith("]");

            if (isHeader) {
              return (
                <div
                  key={line.id}
                  className="pt-4 pb-1 cursor-pointer group"
                  onClick={() => onSeek(line.startTime)}
                >
                  <span className="text-xs font-mono font-bold tracking-wider text-rose-400/90 uppercase border-b border-rose-500/20 pb-0.5 group-hover:text-rose-300">
                    {line.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={line.id}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(line.startTime)}
                className={`py-1 cursor-pointer transition-all duration-200 rounded-md px-2 -mx-2 ${
                  isActive
                    ? "text-white font-extrabold text-lg sm:text-xl scale-102 bg-rose-500/10 border-l-2 border-rose-500 pl-3 drop-shadow-md"
                    : isPassed
                    ? "text-slate-400 hover:text-slate-200 text-base"
                    : "text-slate-500 hover:text-slate-300 text-base opacity-75"
                }`}
              >
                {line.text}
              </div>
            );
          })
        )}
      </div>

      {/* Footer advice */}
      <div className="p-3 border-t border-slate-850 bg-slate-900/40 text-[11px] text-slate-500 text-center">
        Click any line to jump to that moment in the track
      </div>
    </div>
  );
};
