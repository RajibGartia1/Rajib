import React, { useState } from "react";
import { X, Disc3, Sparkles, Loader2 } from "lucide-react";
import { SongClip } from "../types";

interface CoverModalProps {
  song: SongClip | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateCover: (song: SongClip, newStyle: string) => Promise<void>;
}

export const CoverModal: React.FC<CoverModalProps> = ({
  song,
  isOpen,
  onClose,
  onCreateCover,
}) => {
  const [newStyle, setNewStyle] = useState("Acoustic Unplugged");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !song) return null;

  const popularStyles = [
    "Acoustic Unplugged",
    "Heavy Metal & Distortion",
    "Lo-Fi Chillhop Beats",
    "80s Synthwave & Vocoder",
    "Cyberpunk Neurofunk EDM",
    "Jazz Big Band Swing",
    "Reggae Dub",
    "Orchestral Cinematic Epic",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreateCover(song, newStyle);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Disc3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Cover</h3>
              <p className="text-xs text-slate-400">Reimagine {song.title} in a new style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select or type a new musical style
            </label>
            <input
              type="text"
              value={newStyle}
              onChange={(e) => setNewStyle(e.target.value)}
              placeholder="e.g. Acoustic Indie Folk, French House..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Preset Styles
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {popularStyles.map((style) => (
                <button
                  type="button"
                  key={style}
                  onClick={() => setNewStyle(style)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    newStyle === style
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Cover...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Cover Clip
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
