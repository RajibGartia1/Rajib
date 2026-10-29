export interface SongClip {
  id: string;
  title: string;
  lyrics: string;
  styleDescription: string;
  tags: string[];
  bpm: number;
  key: string;
  scale: "minor" | "major";
  chords: string[];
  melodyStyle: "synth-lead" | "acoustic-strum" | "funk-groove" | "lofi-piano" | "rock-riff" | "electronic-arpeggio" | "orchestral";
  energy: number;
  duration: number; // in seconds
  coverArtPrompt?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  vocalStyle?: string;
  createdAt: number;
  likes: number;
  plays: number;
  isLiked: boolean;
  model: "v4.0" | "v3.5" | "v3.0";
  instrumental: boolean;
  clipNumber: 1 | 2;
  status: "ready" | "generating" | "failed";
  waveformData?: number[];
}

export interface LyricLine {
  id: string;
  section?: string;
  text: string;
  startTime: number;
  endTime: number;
}

export interface StemSettings {
  vocals: { volume: number; muted: boolean; solo: boolean };
  drums: { volume: number; muted: boolean; solo: boolean };
  bass: { volume: number; muted: boolean; solo: boolean };
  instruments: { volume: number; muted: boolean; solo: boolean };
}

export interface GenerationParams {
  prompt: string;
  customMode: boolean;
  lyrics: string;
  style: string;
  title: string;
  instrumental: boolean;
  model: "v4.0" | "v3.5";
  tempo: "slow" | "medium" | "fast" | "custom";
  key: string;
}
