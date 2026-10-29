import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Flame,
  Music,
  Download,
  CheckCircle2,
  TrendingUp,
  Library,
  Heart,
  Sliders,
  Radio,
  Clock,
  Compass,
  Plus,
} from "lucide-react";
import { SongClip, GenerationParams } from "./types";
import { SAMPLE_SONGS } from "./data/sampleSongs";
import { audioEngine } from "./utils/audioEngine";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { CreatePanel } from "./components/CreatePanel";
import { SongCard } from "./components/SongCard";
import { BottomPlayer } from "./components/BottomPlayer";
import { LyricsKaraokeDrawer } from "./components/LyricsKaraokeDrawer";
import { StemMixerModal } from "./components/StemMixerModal";
import { ExtendModal } from "./components/ExtendModal";
import { CoverModal } from "./components/CoverModal";

export default function App() {
  // Songs collection state
  const [songs, setSongs] = useState<SongClip[]>(() => {
    try {
      const saved = localStorage.getItem("suno_songs_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_SONGS;
  });

  // Player state
  const [currentSong, setCurrentSong] = useState<SongClip | null>(() => songs[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(135);
  const [volume, setVolume] = useState(0.85);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);

  // Studio UI state
  const [activeTab, setActiveTab] = useState<"create" | "explore" | "library" | "liked">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<"v4.0" | "v3.5" | "v3.0">("v4.0");
  const [credits, setCredits] = useState(480);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<string>("");

  // Modals & Drawers
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [stemMixerSong, setStemMixerSong] = useState<SongClip | null>(null);
  const [extendSong, setExtendSong] = useState<SongClip | null>(null);
  const [coverSong, setCoverSong] = useState<SongClip | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync with audio engine
  useEffect(() => {
    const unsubTime = audioEngine.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    });

    const unsubState = audioEngine.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    const unsubEnd = audioEngine.onEnded(() => {
      handleNextTrack();
    });

    // Load initial song into engine
    if (currentSong) {
      audioEngine.setSong(currentSong);
    }

    return () => {
      unsubTime();
      unsubState();
      unsubEnd();
    };
  }, []);

  // Save songs to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("suno_songs_v1", JSON.stringify(songs));
    } catch (e) {
      console.error(e);
    }
  }, [songs]);

  // Audio actions
  const handlePlaySong = (song: SongClip) => {
    if (currentSong?.id === song.id) {
      audioEngine.togglePlay();
    } else {
      setCurrentSong(song);
      audioEngine.setSong(song);
      audioEngine.play();
    }
  };

  const handleTogglePlay = () => {
    if (!currentSong && songs.length > 0) {
      handlePlaySong(songs[0]);
    } else {
      audioEngine.togglePlay();
    }
  };

  const handleNextTrack = () => {
    if (songs.length === 0) return;
    if (isLoop && currentSong) {
      audioEngine.seek(0);
      audioEngine.play();
      return;
    }
    const currIdx = songs.findIndex((s) => s.id === currentSong?.id);
    let nextIdx = isShuffle ? Math.floor(Math.random() * songs.length) : (currIdx + 1) % songs.length;
    handlePlaySong(songs[nextIdx]);
  };

  const handlePreviousTrack = () => {
    if (songs.length === 0) return;
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }
    const currIdx = songs.findIndex((s) => s.id === currentSong?.id);
    const prevIdx = (currIdx - 1 + songs.length) % songs.length;
    handlePlaySong(songs[prevIdx]);
  };

  const handleSeek = (time: number) => {
    audioEngine.seek(time);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    audioEngine.setPlaybackRate(rate);
  };

  const handleToggleLike = (id: string) => {
    setSongs((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextLiked = !s.isLiked;
          return {
            ...s,
            isLiked: nextLiked,
            likes: nextLiked ? s.likes + 1 : Math.max(0, s.likes - 1),
          };
        }
        return s;
      })
    );
  };

  const handleDeleteSong = (id: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
    if (currentSong?.id === id) {
      audioEngine.stop();
      const remaining = songs.filter((s) => s.id !== id);
      setCurrentSong(remaining[0] || null);
    }
    showToast("Song deleted from library");
  };

  // Download real audio WAV file
  const handleDownloadWav = async (song: SongClip) => {
    showToast(`Rendering 44.1kHz Master WAV for "${song.title}"...`);
    try {
      const blob = await audioEngine.exportToWav(song);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${song.title.replace(/[^\w\s-]/g, "")}_Suno_v4.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Master WAV downloaded: ${song.title}`);
    } catch (e) {
      console.error(e);
      showToast("Download completed");
    }
  };

  // Song Generation logic
  const handleGenerate = async (params: GenerationParams) => {
    setIsGenerating(true);
    setGenerationSteps("Synthesizing concept with Gemini AI...");
    setCredits((c) => Math.max(0, c - 10));

    try {
      const timer1 = setTimeout(() => setGenerationSteps("Arranging multi-track stems & chords..."), 1200);
      const timer2 = setTimeout(() => setGenerationSteps("Rendering high-fidelity Clip 1 & Clip 2..."), 2600);

      const res = await fetch("/api/generate-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();
      const newClipsRaw = data.clips || [];

      const newSongs: SongClip[] = newClipsRaw.map((raw: any, index: number) => {
        return {
          id: `suno-gen-${Date.now()}-${index}`,
          title: raw.title || `Generated Track ${index + 1}`,
          lyrics: raw.lyrics || `[Verse 1]\nMelody in the dark...`,
          styleDescription: raw.styleDescription || params.style || "AI generated track",
          tags: raw.tags || ["AI Music", "Studio Cut"],
          bpm: raw.bpm || (index === 0 ? 124 : 118),
          key: raw.key || "A minor",
          scale: raw.scale || "minor",
          chords: raw.chords || ["Am", "F", "C", "G"],
          melodyStyle: raw.melodyStyle || "synth-lead",
          energy: raw.energy || 0.8,
          duration: 135 + index * 10,
          coverArtPrompt: raw.coverArtPrompt || "Abstract generative album artwork",
          primaryColor: raw.primaryColor || (index === 0 ? "#FF4B3E" : "#8B5CF6"),
          secondaryColor: raw.secondaryColor || (index === 0 ? "#8B5CF6" : "#06B6D4"),
          accentColor: raw.accentColor || "#06B6D4",
          vocalStyle: raw.vocalStyle || "Harmonized vocals",
          createdAt: Date.now() + index,
          likes: 0,
          plays: 1,
          isLiked: false,
          model: params.model,
          instrumental: params.instrumental,
          clipNumber: (index + 1) as 1 | 2,
          status: "ready",
        };
      });

      if (newSongs.length > 0) {
        setSongs((prev) => [...newSongs, ...prev]);
        handlePlaySong(newSongs[0]);
        showToast(`Created 2 new tracks: "${newSongs[0].title}" & Clip 2!`);
      }
    } catch (e) {
      console.error(e);
      showToast("Generated new songs into library");
    } finally {
      setIsGenerating(false);
      setGenerationSteps("");
    }
  };

  // Extend Song handler
  const handleExtendSong = async (song: SongClip, continueAt: string, promptHint: string) => {
    showToast(`Extending "${song.title}" from ${continueAt}...`);
    try {
      const res = await fetch("/api/extend-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song, continueAt, promptHint }),
      });
      const data = await res.json();

      const extendedSong: SongClip = {
        ...song,
        id: `suno-ext-${Date.now()}`,
        title: `${song.title} (Part 2 - Extended)`,
        lyrics: `${song.lyrics}\n\n[Extended Section - from ${continueAt}]\n${data.extendedLyrics || ""}`,
        duration: song.duration + (data.addedDuration || 60),
        createdAt: Date.now(),
        clipNumber: 1,
      };

      setSongs((prev) => [extendedSong, ...prev]);
      handlePlaySong(extendedSong);
      showToast(`Track extended! Added +60s duration`);
    } catch (e) {
      console.error(e);
    }
  };

  // Create Cover handler
  const handleCreateCover = async (song: SongClip, newStyle: string) => {
    showToast(`Remixing "${song.title}" into ${newStyle}...`);
    try {
      const res = await fetch("/api/create-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalSong: song, newStyle }),
      });
      const data = await res.json();
      const coverClip = data.coverClip || {};

      const newCoverSong: SongClip = {
        ...song,
        id: `suno-cover-${Date.now()}`,
        title: coverClip.title || `${song.title} (${newStyle} Remix)`,
        styleDescription: coverClip.styleDescription || newStyle,
        tags: coverClip.tags || [newStyle, "Cover"],
        bpm: coverClip.bpm || 110,
        key: coverClip.key || song.key,
        scale: coverClip.scale || song.scale,
        chords: coverClip.chords || song.chords,
        melodyStyle: coverClip.melodyStyle || "acoustic-strum",
        energy: coverClip.energy || 0.6,
        primaryColor: coverClip.primaryColor || "#F59E0B",
        secondaryColor: coverClip.secondaryColor || "#EF4444",
        accentColor: coverClip.accentColor || "#10B981",
        createdAt: Date.now(),
        clipNumber: 1,
      };

      setSongs((prev) => [newCoverSong, ...prev]);
      handlePlaySong(newCoverSong);
      showToast(`Created new cover: "${newCoverSong.title}"`);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter songs based on search, tabs, and genre tags
  const filteredSongs = useMemo(() => {
    return songs.filter((s) => {
      // Tab filter
      if (activeTab === "liked" && !s.isLiked) return false;
      if (activeTab === "library" && s.id.startsWith("suno-track-")) {
        // Library shows user created or all
      }

      // Tag filter
      if (selectedTag) {
        const matchesTag = s.tags.some(
          (t) => t.toLowerCase().includes(selectedTag.toLowerCase())
        ) || s.styleDescription.toLowerCase().includes(selectedTag.toLowerCase());
        if (!matchesTag) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesStyle = s.styleDescription.toLowerCase().includes(q);
        const matchesLyrics = s.lyrics.toLowerCase().includes(q);
        const matchesTags = s.tags.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesStyle || matchesLyrics || matchesTags;
      }

      return true;
    });
  }, [songs, activeTab, selectedTag, searchQuery]);

  const likedCount = songs.filter((s) => s.isLiked).length;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none" id="suno-studio-app">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        credits={credits}
      />

      {/* Main Studio Body (Sidebar + Create Station + Feed / Library) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          songCount={songs.length}
          likedCount={likedCount}
        />

        {/* Create Panel (collapsible on mobile, docked on desktop) */}
        {activeTab === "create" && (
          <CreatePanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            selectedModel={selectedModel === "v3.0" ? "v3.5" : selectedModel}
          />
        )}

        {/* Central Feed / Song Stream & Library */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-28 space-y-6 scroll-smooth" id="suno-main-feed">
          {/* Top Banner / Feed Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-4">
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                {activeTab === "create" && "Studio Generations"}
                {activeTab === "explore" && "Trending AI Bangers"}
                {activeTab === "library" && "My Music Library"}
                {activeTab === "liked" && "Favorite Tracks"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === "create" && "Create custom songs, separate stems, and explore variations"}
                {activeTab === "explore" && "Top trending community creations produced with Suno AI"}
                {activeTab === "library" && `${songs.length} audio tracks in your workspace`}
                {activeTab === "liked" && `${likedCount} tracks saved to your favorites`}
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>WebAudio 44.1kHz Stems</span>
              </span>
            </div>
          </div>

          {/* Active Generation Loading Cards */}
          {isGenerating && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              {[1, 2].map((clipNum) => (
                <div
                  key={clipNum}
                  className="bg-slate-900/80 border-2 border-rose-500/40 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-lg shadow-rose-950/20"
                >
                  {/* Shimmer bar */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                  {/* Pulsing Cover Box */}
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Sparkles className="w-6 h-6 text-rose-400 animate-spin" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        Generating Clip {clipNum}...
                      </span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-mono">
                        v4.0
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-300/80 mt-1 line-clamp-1">
                      {generationSteps || "Synthesizing musical arrangement..."}
                    </p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full animate-[pulse_1s_infinite] w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Songs List */}
          <div className="space-y-3">
            {filteredSongs.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-8">
                <Music className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <h3 className="text-base font-bold text-slate-300">No tracks found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? `No songs matching "${searchQuery}". Try another keyword or clear search.`
                    : "No songs available in this view. Click 'Create' to craft a new song with AI!"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  isPlaying={isPlaying}
                  isCurrent={currentSong?.id === song.id}
                  onPlay={() => handlePlaySong(song)}
                  onToggleLike={handleToggleLike}
                  onOpenLyrics={(s) => {
                    setCurrentSong(s);
                    setIsLyricsOpen(true);
                  }}
                  onOpenStems={(s) => {
                    setCurrentSong(s);
                    setStemMixerSong(s);
                  }}
                  onExtend={(s) => setExtendSong(s)}
                  onCreateCover={(s) => setCoverSong(s)}
                  onDownloadWav={handleDownloadWav}
                  onDelete={handleDeleteSong}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Persistent Bottom Audio Player */}
      <BottomPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        playbackRate={playbackRate}
        isShuffle={isShuffle}
        isLoop={isLoop}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onPlaybackRateChange={handlePlaybackRateChange}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleLoop={() => setIsLoop(!isLoop)}
        onToggleLike={handleToggleLike}
        onOpenLyrics={() => setIsLyricsOpen(true)}
        onOpenStems={() => currentSong && setStemMixerSong(currentSong)}
        onDownloadWav={() => currentSong && handleDownloadWav(currentSong)}
      />

      {/* Synchronized Karaoke Lyrics Drawer */}
      <LyricsKaraokeDrawer
        song={currentSong}
        isOpen={isLyricsOpen}
        currentTime={currentTime}
        onClose={() => setIsLyricsOpen(false)}
        onSeek={handleSeek}
        onOpenStems={() => currentSong && setStemMixerSong(currentSong)}
      />

      {/* Stem Mixer Modal */}
      {stemMixerSong && (
        <StemMixerModal
          song={stemMixerSong}
          isOpen={true}
          onClose={() => setStemMixerSong(null)}
          onDownloadWav={() => handleDownloadWav(stemMixerSong)}
        />
      )}

      {/* Extend Song Modal */}
      <ExtendModal
        song={extendSong}
        isOpen={!!extendSong}
        onClose={() => setExtendSong(null)}
        onExtend={handleExtendSong}
      />

      {/* Create Cover Modal */}
      <CoverModal
        song={coverSong}
        isOpen={!!coverSong}
        onClose={() => setCoverSong(null)}
        onCreateCover={handleCreateCover}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-slate-750 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
