import React, { useState } from "react";
import {
  Heart,
  Sliders,
  MoreVertical,
  Download,
  FastForward,
  Disc3,
  Copy,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  Music,
} from "lucide-react";
import { SongClip } from "../types";
import { SongCover } from "./SongCover";
import { formatTime } from "../utils/lyricsParser";

interface SongCardProps {
  song: SongClip;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlay: () => void;
  onToggleLike: (id: string) => void;
  onOpenLyrics: (song: SongClip) => void;
  onOpenStems: (song: SongClip) => void;
  onExtend: (song: SongClip) => void;
  onCreateCover: (song: SongClip) => void;
  onDownloadWav: (song: SongClip) => void;
  onDelete: (id: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isPlaying,
  isCurrent,
  onPlay,
  onToggleLike,
  onOpenLyrics,
  onOpenStems,
  onExtend,
  onCreateCover,
  onDownloadWav,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(song.styleDescription || song.title);
    setCopied(true);
    setShowMenu(false);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative bg-slate-900/60 hover:bg-slate-900/90 border rounded-2xl p-3.5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 ${
        isCurrent
          ? "border-rose-500/50 bg-slate-900/95 shadow-lg shadow-rose-950/20"
          : "border-slate-800/80 hover:border-slate-700"
      }`}
      id={`song-card-${song.id}`}
    >
      {/* Cover Image with play trigger */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <SongCover
          song={song}
          size="md"
          isPlaying={isPlaying && isCurrent}
          onPlayToggle={onPlay}
        />

        {/* Mobile-only title header */}
        <div className="flex-1 sm:hidden">
          <h4 className="text-sm font-bold text-white line-clamp-1">{song.title}</h4>
          <span className="text-[11px] text-slate-400 block">{song.styleDescription}</span>
        </div>
      </div>

      {/* Main Track Info */}
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={`text-sm font-bold truncate cursor-pointer hover:underline ${
              isCurrent ? "text-rose-400" : "text-white"
            }`}
            onClick={onPlay}
          >
            {song.title}
          </h4>
          <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            Clip {song.clipNumber}
          </span>
          {song.instrumental && (
            <span className="text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded">
              Instrumental
            </span>
          )}
        </div>

        {/* Style description */}
        <p className="text-xs text-slate-400 line-clamp-1 mb-2">
          {song.styleDescription}
        </p>

        {/* Tags & Musical attributes */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(song.duration)}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono">{song.bpm} BPM</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono">{song.key}</span>

          {/* Style tags pills */}
          <div className="hidden lg:flex items-center gap-1 ml-2">
            {song.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-750"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850">
        {/* Like Button */}
        <button
          onClick={() => onToggleLike(song.id)}
          className={`flex items-center gap-1 p-2 rounded-lg transition-colors text-xs ${
            song.isLiked
              ? "text-rose-500 bg-rose-500/10"
              : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
          }`}
          title="Like Song"
        >
          <Heart className={`w-4 h-4 ${song.isLiked ? "fill-rose-500" : ""}`} />
          <span className="text-[11px] font-mono">{song.likes}</span>
        </button>

        {/* Lyrics Drawer Toggle */}
        <button
          onClick={() => onOpenLyrics(song)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="View Lyrics & Karaoke"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Stems Mixer Toggle */}
        <button
          onClick={() => onOpenStems(song)}
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Open Stem Separation Mixer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Download WAV */}
        <button
          onClick={() => onDownloadWav(song)}
          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Download Master WAV"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Context More Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 bottom-full mb-1 w-44 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-30 space-y-0.5 text-xs text-slate-300 animate-fadeIn">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onExtend(song);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white text-left transition-colors"
                >
                  <FastForward className="w-3.5 h-3.5 text-purple-400" />
                  <span>Extend Track</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onCreateCover(song);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white text-left transition-colors"
                >
                  <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Create Cover / Remix</span>
                </button>

                <button
                  onClick={handleCopyPrompt}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white text-left transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy Prompt</span>
                </button>

                <div className="my-1 border-t border-slate-800" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(song.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 text-left transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
