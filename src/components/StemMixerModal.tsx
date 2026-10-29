import React, { useState } from "react";
import { X, Mic, Drum, Waves, Music, Volume2, Download, Sliders, Check } from "lucide-react";
import { SongClip, StemSettings } from "../types";
import { audioEngine } from "../utils/audioEngine";

interface StemMixerModalProps {
  song: SongClip;
  isOpen: boolean;
  onClose: () => void;
  onDownloadWav: () => void;
}

export const StemMixerModal: React.FC<StemMixerModalProps> = ({
  song,
  isOpen,
  onClose,
  onDownloadWav,
}) => {
  const [stems, setStems] = useState<StemSettings>(() => audioEngine.getStemSettings());
  const [masterVol, setMasterVol] = useState(audioEngine.getVolume());
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const updateStem = (
    channel: keyof StemSettings,
    updates: Partial<{ volume: number; muted: boolean; solo: boolean }>
  ) => {
    const next: StemSettings = {
      ...stems,
      [channel]: { ...stems[channel], ...updates },
    };
    setStems(next);
    audioEngine.setStems(next);
  };

  const handleSolo = (channel: keyof StemSettings) => {
    const currentSolo = stems[channel].solo;
    updateStem(channel, { solo: !currentSolo });
  };

  const handleMute = (channel: keyof StemSettings) => {
    const currentMuted = stems[channel].muted;
    updateStem(channel, { muted: !currentMuted });
  };

  const handleVolumeChange = (channel: keyof StemSettings, val: number) => {
    updateStem(channel, { volume: val });
  };

  const channels: { key: keyof StemSettings; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "vocals", label: "Vocals", icon: <Mic className="w-4 h-4" />, color: "#FF4B3E" },
    { key: "drums", label: "Drums", icon: <Drum className="w-4 h-4" />, color: "#F59E0B" },
    { key: "bass", label: "Bassline", icon: <Waves className="w-4 h-4" />, color: "#10B981" },
    { key: "instruments", label: "Instruments", icon: <Music className="w-4 h-4" />, color: "#06B6D4" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn" id="stem-mixer-modal">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Stem Separation & Mixer
              </h2>
              <p className="text-xs text-slate-400">
                Live multi-track stem isolation for <span className="text-white font-medium">{song.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            id="close-stem-mixer-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mixer Fader Racks */}
        <div className="grid grid-cols-4 gap-3 my-6">
          {channels.map((ch) => {
            const cfg = stems[ch.key];
            const anySolo = stems.vocals.solo || stems.drums.solo || stems.bass.solo || stems.instruments.solo;
            const isAudible = !cfg.muted && (!anySolo || cfg.solo);

            return (
              <div
                key={ch.key}
                className={`flex flex-col items-center bg-slate-950/70 border rounded-xl p-3 transition-colors ${
                  isAudible ? "border-slate-800" : "border-slate-850 opacity-60"
                }`}
              >
                {/* Channel Header */}
                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-300">
                  <span style={{ color: ch.color }}>{ch.icon}</span>
                  <span className="truncate">{ch.label}</span>
                </div>

                {/* Solo / Mute Buttons */}
                <div className="flex gap-1.5 w-full mb-3">
                  <button
                    onClick={() => handleSolo(ch.key)}
                    className={`flex-1 text-[11px] font-bold py-1 rounded transition-colors ${
                      cfg.solo
                        ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                    title="Solo Channel"
                  >
                    S
                  </button>
                  <button
                    onClick={() => handleMute(ch.key)}
                    className={`flex-1 text-[11px] font-bold py-1 rounded transition-colors ${
                      cfg.muted
                        ? "bg-rose-600 text-white font-extrabold shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                    title="Mute Channel"
                  >
                    M
                  </button>
                </div>

                {/* Vertical Slider + Simulated VU Meter */}
                <div className="flex items-center justify-center gap-3 h-36 w-full py-2">
                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={cfg.volume}
                    onChange={(e) => handleVolumeChange(ch.key, parseFloat(e.target.value))}
                    className="h-28 w-1.5 -rotate-90 origin-center accent-amber-500 cursor-pointer"
                  />

                  {/* Dynamic LED VU Meter */}
                  <div className="flex flex-col gap-1 w-2 h-28 bg-slate-900 rounded p-0.5 justify-end">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const isActive = isAudible && cfg.volume > (11 - i) / 12;
                      const isPeak = i < 2;
                      const isMid = i >= 2 && i < 6;
                      const color = isPeak ? "bg-rose-500" : isMid ? "bg-amber-400" : "bg-emerald-500";
                      return (
                        <div
                          key={i}
                          className={`w-full h-1.5 rounded-xs transition-opacity duration-75 ${
                            isActive ? `${color} opacity-90` : "bg-slate-800 opacity-20"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Volume Level Percentage */}
                <span className="text-[11px] font-mono text-slate-400 mt-2">
                  {Math.round(cfg.volume * 100)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Master Control & Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Master Level</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVol}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setMasterVol(v);
                    audioEngine.setVolume(v);
                  }}
                  className="w-28 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-xs font-mono text-slate-300">{Math.round(masterVol * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                // Reset stems
                const def: StemSettings = {
                  vocals: { volume: 1, muted: false, solo: false },
                  drums: { volume: 1, muted: false, solo: false },
                  bass: { volume: 1, muted: false, solo: false },
                  instruments: { volume: 1, muted: false, solo: false },
                };
                setStems(def);
                audioEngine.setStems(def);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Reset Faders
            </button>
            <button
              onClick={onDownloadWav}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95"
              id="export-stems-mix-btn"
            >
              <Download className="w-3.5 h-3.5" />
              Download Mixed Audio (.wav)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
