import React, { useState } from "react";
import {
  Sparkles,
  Dice5,
  Music2,
  Wand2,
  Plus,
  Loader2,
  Sliders,
  ChevronDown,
  Flame,
} from "lucide-react";
import { GenerationParams } from "../types";

interface CreatePanelProps {
  onGenerate: (params: GenerationParams) => Promise<void>;
  isGenerating: boolean;
  selectedModel: "v4.0" | "v3.5";
}

const SURPRISE_PROMPTS = [
  "a vibrant 80s synthwave anthem about cruising down midnight highways in Neo Tokyo with punchy drums and nostalgic pads",
  "chill lo-fi jazz hip-hop with warm vinyl crackle, sleepy Rhodes chords, and soft summer rain outside a cafe",
  "heavy industrial cyberpunk neurofunk with distorted saw bass, aggressive halftime drums, and dystopian metal guitar riffs",
  "warm indie folk acoustic ballad with delicate fingerpicking, gentle cello, and nostalgic campfire harmonies",
  "funky Japanese 80s city pop with bouncy slap bass, sparkling FM synthesizers, and breezy brass melodies",
  "euphoric melodic future bass with vocal chops, huge supersaw chords, and energetic club drops",
  "epic cinematic orchestral fantasy theme with heroic brass horns, driving war taiko drums, and choral chanting",
];

export const CreatePanel: React.FC<CreatePanelProps> = ({
  onGenerate,
  isGenerating,
  selectedModel,
}) => {
  const [customMode, setCustomMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [style, setStyle] = useState("");
  const [title, setTitle] = useState("");
  const [instrumental, setInstrumental] = useState(false);
  const [tempo, setTempo] = useState<"slow" | "medium" | "fast" | "custom">("medium");
  const [key, setKey] = useState("auto");
  const [isWritingLyrics, setIsWritingLyrics] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSurprise = () => {
    const random = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(random);
  };

  const insertLyricTag = (tag: string) => {
    setLyrics((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n\n[${tag}]\n` : `[${tag}]\n`;
    });
  };

  const handleGenerateLyrics = async () => {
    setIsWritingLyrics(true);
    try {
      const res = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || style || "An energetic song about freedom and late night music",
          style,
          title,
        }),
      });
      const data = await res.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
      }
    } catch (e) {
      console.error("Failed to generate lyrics:", e);
    } finally {
      setIsWritingLyrics(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    await onGenerate({
      prompt: customMode ? `${title} - ${style}` : prompt || "A cinematic synthwave track",
      customMode,
      lyrics,
      style,
      title,
      instrumental,
      model: selectedModel,
      tempo,
      key,
    });
  };

  const quickStyles = [
    "Synthwave",
    "Lo-Fi Hip Hop",
    "Cyberpunk",
    "Indie Folk",
    "Pop Punk",
    "Future Bass",
    "City Pop",
    "Hard Rock",
  ];

  return (
    <div
      className="w-full lg:w-96 bg-slate-950 border-r border-slate-850 p-4 flex flex-col justify-between flex-shrink-0 select-none overflow-y-auto"
      id="suno-create-panel"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Mode Toggle Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-850">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-bold text-white">Create Song</span>
          </div>

          {/* Simple vs Custom Toggle */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setCustomMode(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                !customMode
                  ? "bg-rose-500 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                customMode
                  ? "bg-rose-500 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Instrumental Switch */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 px-3 py-2 rounded-xl">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Instrumental</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={instrumental}
              onChange={(e) => setInstrumental(e.target.checked)}
              className="sr-only peer"
              id="instrumental-toggle-checkbox"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500" />
          </label>
        </div>

        {/* SIMPLE MODE */}
        {!customMode ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Song Description
                </label>
                <button
                  type="button"
                  onClick={handleSurprise}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  <span>Surprise Me</span>
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. a 90s eurodance banger about coding late at night with heavy bass and uplifting vocals..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                id="simple-prompt-input"
              />
            </div>

            {/* Quick Inspiration Tags */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Quick Styles
              </span>
              <div className="flex flex-wrap gap-1">
                {quickStyles.map((qs) => (
                  <button
                    key={qs}
                    type="button"
                    onClick={() => setPrompt((p) => (p ? `${p}, ${qs}` : qs))}
                    className="text-[11px] bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 px-2 py-1 rounded-lg transition-colors"
                  >
                    + {qs}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* CUSTOM MODE */
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Dreams"
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                id="custom-title-input"
              />
            </div>

            {/* Lyrics Section */}
            {!instrumental && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Lyrics
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateLyrics}
                    disabled={isWritingLyrics}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold disabled:opacity-50"
                    id="ai-write-lyrics-btn"
                  >
                    {isWritingLyrics ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    <span>Write with AI</span>
                  </button>
                </div>

                {/* Structure tags inserter */}
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {["Verse", "Chorus", "Drop", "Bridge", "Guitar Solo", "Outro"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertLyricTag(tag)}
                      className="text-[10px] font-mono font-bold bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 px-1.5 py-0.5 rounded transition-colors"
                    >
                      + [{tag}]
                    </button>
                  ))}
                </div>

                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="[Verse 1]&#10;Write or paste your lyrics here...&#10;&#10;[Chorus]&#10;Add your catchy hook..."
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none font-mono leading-relaxed"
                  id="custom-lyrics-textarea"
                />
              </div>
            )}

            {/* Style of Music */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Style of Music
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. upbeat electro pop, female vocals, 128 bpm"
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                id="custom-style-input"
              />
            </div>
          </div>
        )}

        {/* Advanced Options Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced Controls</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-3 animate-fadeIn">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Tempo (BPM Vibe)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(["slow", "medium", "fast"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTempo(t)}
                      className={`text-xs py-1 rounded-lg border capitalize transition-colors ${
                        tempo === t
                          ? "bg-rose-500/20 border-rose-500 text-rose-400 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Musical Key
                </label>
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="auto">Auto Key (AI Choice)</option>
                  <option value="A minor">A Minor (Nostalgic / Dark)</option>
                  <option value="C major">C Major (Bright / Uplifting)</option>
                  <option value="D minor">D Minor (Heroic / Cyberpunk)</option>
                  <option value="F major">F Major (Warm / Relaxed)</option>
                  <option value="G major">G Major (Acoustic / Joyful)</option>
                  <option value="E minor">E Minor (Rock / Intense)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Big Create Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:via-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50 cursor-pointer"
          id="suno-create-submit-btn"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Generating 2 Clips...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Create (10 Credits)</span>
            </>
          )}
        </button>
      </form>

      {/* Info notice */}
      <div className="pt-4 border-t border-slate-850 text-[11px] text-slate-500 text-center">
        Powered by Suno v4.0 Audio Model & Gemini Composition
      </div>
    </div>
  );
};
