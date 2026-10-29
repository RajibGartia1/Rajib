import React, { useState } from "react";
import { X, FastForward, Sparkles, Loader2 } from "lucide-react";
import { SongClip } from "../types";

interface ExtendModalProps {
  song: SongClip | null;
  isOpen: boolean;
  onClose: () => void;
  onExtend: (song: SongClip, continueAt: string, promptHint: string) => Promise<void>;
}

export const ExtendModal: React.FC<ExtendModalProps> = ({
  song,
  isOpen,
  onClose,
  onExtend,
}) => {
  const [continueAt, setContinueAt] = useState("01:45");
  const [promptHint, setPromptHint] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !song) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onExtend(song, continueAt, promptHint);
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
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Extend Track</h3>
              <p className="text-xs text-slate-400">Add new sections & extend duration</p>
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
              Continue from timestamp
            </label>
            <input
              type="text"
              value={continueAt}
              onChange={(e) => setContinueAt(e.target.value)}
              placeholder="e.g. 01:45"
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              The AI will transition the song from this timestamp forward
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Extension style or story direction (optional)
            </label>
            <textarea
              value={promptHint}
              onChange={(e) => setPromptHint(e.target.value)}
              placeholder="e.g. Add an emotional bridge, heavy guitar solo, and an explosive final chorus..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none resize-none"
            />
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
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Extension...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Extend (+60s)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
