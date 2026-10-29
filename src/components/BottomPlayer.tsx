import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  FileText,
  Sliders,
  Download,
  Gauge,
  Heart,
} from "lucide-react";
import { SongClip } from "../types";
import { SongCover } from "./SongCover";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { formatTime } from "../utils/lyricsParser";

interface BottomPlayerProps {
  currentSong: SongClip | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isShuffle: boolean;
  isLoop: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleShuffle: () => void;
  onToggleLoop: () => void;
  onToggleLike: (id: string) => void;
  onOpenLyrics: () => void;
  onOpenStems: () => void;
  onDownloadWav: () => void;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  isShuffle,
  isLoop,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleShuffle,
  onToggleLoop,
  onToggleLike,
  onOpenLyrics,
  onOpenStems,
  onDownloadWav,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  if (!currentSong) return null;

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(prevVolume || 0.8);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 h-22 bg-slate-950/95 border-t border-slate-850 px-4 sm:px-6 flex items-center justify-between shadow-2xl backdrop-blur-md select-none"
      id="suno-bottom-audio-player"
    >
      {/* LEFT: Current Track Details */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px] max-w-[280px]">
        <SongCover
          song={currentSong}
          size="sm"
          isPlaying={isPlaying}
          onPlayToggle={onTogglePlay}
        />

        <div className="min-w-0 flex-1">
          <h4
            className="text-xs font-bold text-white truncate cursor-pointer hover:underline"
            onClick={onOpenLyrics}
          >
            {currentSong.title}
          </h4>
          <p className="text-[11px] text-slate-400 truncate">
            {currentSong.tags[0] || "Suno Track"} • {currentSong.key}
          </p>
        </div>

        <button
          onClick={() => onToggleLike(currentSong.id)}
          className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
            currentSong.isLiked
              ? "text-rose-500"
              : "text-slate-500 hover:text-slate-300"
          }`}
          title="Favorite"
        >
          <Heart className={`w-4 h-4 ${currentSong.isLiked ? "fill-rose-500" : ""}`} />
        </button>
      </div>

      {/* CENTER: Transport Controls & Waveform */}
      <div className="flex-1 max-w-2xl px-2 sm:px-6 flex flex-col items-center">
        {/* Buttons Row */}
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={onToggleShuffle}
            className={`p-1.5 rounded-lg text-xs transition-colors hidden sm:block ${
              isShuffle ? "text-rose-400 font-bold" : "text-slate-500 hover:text-slate-300"
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onPrevious}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Master Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
            id="master-play-pause-btn"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleLoop}
            className={`p-1.5 rounded-lg text-xs transition-colors hidden sm:block ${
              isLoop ? "text-rose-400 font-bold" : "text-slate-500 hover:text-slate-300"
            }`}
            title="Repeat"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Waveform Scrubber & Timestamps */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="flex-1">
            <WaveformVisualizer
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onSeek={onSeek}
              height={26}
              primaryColor={currentSong.primaryColor}
              accentColor={currentSong.accentColor}
            />
          </div>

          <span className="text-[10px] font-mono text-slate-500 w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* RIGHT: Volume, Speed, Tools */}
      <div className="flex items-center justify-end gap-2 w-1/4 min-w-[160px]">
        {/* Speed Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="p-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg flex items-center gap-1"
            title="Playback Speed"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">{playbackRate}x</span>
          </button>

          {showSpeedMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowSpeedMenu(false)}
              />
              <div className="absolute right-0 bottom-full mb-2 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-2xl z-30 space-y-0.5">
                {speedOptions.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      onPlaybackRateChange(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-1 text-xs font-mono rounded-lg text-left transition-colors ${
                      playbackRate === rate
                        ? "bg-rose-500 text-white font-bold"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Stem Mixer Toggle */}
        <button
          onClick={onOpenStems}
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-colors"
          title="Stem Separation Mixer"
          id="bottom-stem-mixer-btn"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Karaoke Lyrics Toggle */}
        <button
          onClick={onOpenLyrics}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
          title="Synchronized Lyrics"
          id="bottom-lyrics-btn"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Download Master WAV */}
        <button
          onClick={onDownloadWav}
          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors hidden sm:block"
          title="Download WAV (.wav)"
          id="bottom-download-btn"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Volume Slider */}
        <div className="hidden lg:flex items-center gap-1.5 ml-1">
          <button
            onClick={toggleMute}
            className="p-1 text-slate-400 hover:text-white"
          >
            {volume === 0 || isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false);
              onVolumeChange(parseFloat(e.target.value));
            }}
            className="w-18 accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
