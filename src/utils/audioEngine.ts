import { SongClip, StemSettings } from "../types";

// Note to frequency map helper
const NOTE_FREQS: Record<string, number> = {
  C2: 65.41,
  "C#2": 69.3,
  D2: 73.42,
  "D#2": 77.78,
  E2: 82.41,
  F2: 87.31,
  "F#2": 92.5,
  G2: 98.0,
  "G#2": 103.83,
  A2: 110.0,
  "A#2": 116.54,
  B2: 123.47,
  C3: 130.81,
  "C#3": 138.59,
  D3: 146.83,
  "D#3": 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  G3: 196.0,
  "G#3": 207.65,
  A3: 220.0,
  "A#3": 233.08,
  B3: 246.94,
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  "G#4": 415.3,
  A4: 440.0,
  "A#4": 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
};

// Chord note offsets (semitones)
const CHORD_DEFS: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  "7": [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dim: [0, 3, 6],
  sus4: [0, 5, 7],
};

function parseChord(chordName: string): { root: string; type: string } {
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return { root: "C", type: "maj" };
  const root = match[1].replace("b", "#");
  const rest = match[2].toLowerCase();
  let type = "maj";
  if (rest.includes("min") || rest.startsWith("m") && !rest.startsWith("maj")) {
    type = rest.includes("7") ? "min7" : "min";
  } else if (rest.includes("maj7")) {
    type = "maj7";
  } else if (rest.includes("7")) {
    type = "7";
  } else if (rest.includes("dim")) {
    type = "dim";
  }
  return { root, type };
}

function getChordFrequencies(chordName: string, octave: number = 3): number[] {
  const { root, type } = parseChord(chordName);
  const baseNote = `${root}${octave}`;
  const baseFreq = NOTE_FREQS[baseNote] || 220;
  const intervals = CHORD_DEFS[type] || [0, 4, 7];
  return intervals.map((interval) => baseFreq * Math.pow(2, interval / 12));
}

export class SunoAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Stems Gain Nodes
  private vocalsGain: GainNode | null = null;
  private drumsGain: GainNode | null = null;
  private bassGain: GainNode | null = null;
  private instrumentsGain: GainNode | null = null;

  private currentSong: SongClip | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 135;
  private playbackRate: number = 1.0;
  private volume: number = 0.85;

  private activeNodes: (AudioNode | number)[] = [];
  private schedulerTimer: number | null = null;
  private playbackStartContextTime: number = 0;
  private playbackStartOffset: number = 0;

  private timeListeners: ((time: number, duration: number) => void)[] = [];
  private endListeners: (() => void)[] = [];
  private stateListeners: ((isPlaying: boolean) => void)[] = [];

  private stemSettings: StemSettings = {
    vocals: { volume: 1.0, muted: false, solo: false },
    drums: { volume: 1.0, muted: false, solo: false },
    bass: { volume: 1.0, muted: false, solo: false },
    instruments: { volume: 1.0, muted: false, solo: false },
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.vocalsGain = this.ctx.createGain();
      this.drumsGain = this.ctx.createGain();
      this.bassGain = this.ctx.createGain();
      this.instrumentsGain = this.ctx.createGain();

      this.vocalsGain.connect(this.masterGain);
      this.drumsGain.connect(this.masterGain);
      this.bassGain.connect(this.masterGain);
      this.instrumentsGain.connect(this.masterGain);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setSong(song: SongClip) {
    const wasPlaying = this.isPlaying;
    this.stop();
    this.currentSong = song;
    this.currentTime = 0;
    this.duration = song.duration || 135;
    this.notifyTime();

    if (wasPlaying) {
      this.play();
    }
  }

  public getSong(): SongClip | null {
    return this.currentSong;
  }

  public play() {
    if (!this.currentSong) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.isPlaying) return;

    this.isPlaying = true;
    this.playbackStartContextTime = this.ctx.currentTime;
    this.playbackStartOffset = this.currentTime;

    this.startAudioSynthesisLoop();
    this.startProgressTicker();
    this.notifyState();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.stopActiveAudioNodes();
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.notifyState();
  }

  public stop() {
    this.pause();
    this.currentTime = 0;
    this.notifyTime();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(timeInSeconds: number) {
    const clampedTime = Math.max(0, Math.min(timeInSeconds, this.duration));
    const wasPlaying = this.isPlaying;

    if (wasPlaying) {
      this.stopActiveAudioNodes();
    }

    this.currentTime = clampedTime;
    this.playbackStartOffset = clampedTime;
    if (this.ctx) {
      this.playbackStartContextTime = this.ctx.currentTime;
    }

    this.notifyTime();

    if (wasPlaying) {
      this.startAudioSynthesisLoop();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    // re-trigger loop to match updated tempo
    if (this.isPlaying) {
      this.seek(this.currentTime);
    }
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public setStems(settings: StemSettings) {
    this.stemSettings = settings;
    this.applyStemGains();
  }

  public getStemSettings(): StemSettings {
    return this.stemSettings;
  }

  private applyStemGains() {
    if (!this.ctx || !this.vocalsGain || !this.drumsGain || !this.bassGain || !this.instrumentsGain) return;
    const { vocals, drums, bass, instruments } = this.stemSettings;

    const anySolo = vocals.solo || drums.solo || bass.solo || instruments.solo;

    const getStemGain = (stem: { volume: number; muted: boolean; solo: boolean }) => {
      if (stem.muted) return 0;
      if (anySolo && !stem.solo) return 0;
      return stem.volume;
    };

    const now = this.ctx.currentTime;
    this.vocalsGain.gain.setTargetAtTime(getStemGain(vocals), now, 0.05);
    this.drumsGain.gain.setTargetAtTime(getStemGain(drums), now, 0.05);
    this.bassGain.gain.setTargetAtTime(getStemGain(bass), now, 0.05);
    this.instrumentsGain.gain.setTargetAtTime(getStemGain(instruments), now, 0.05);
  }

  // --- Multi-track Music Generation & Scheduling ---
  private startAudioSynthesisLoop() {
    if (!this.ctx || !this.currentSong) return;

    this.applyStemGains();
    const song = this.currentSong;
    const bpm = (song.bpm || 120) * this.playbackRate;
    const secondsPerBeat = 60 / bpm;
    const secondsPerMeasure = secondsPerBeat * 4;

    const chords = song.chords && song.chords.length > 0 ? song.chords : ["Am", "F", "C", "G"];
    const lookahead = 1.5; // seconds to schedule ahead
    let nextMeasureTime = this.ctx.currentTime;

    const schedulePattern = () => {
      if (!this.isPlaying || !this.ctx) return;

      while (nextMeasureTime < this.ctx.currentTime + lookahead) {
        // Find which measure in the song progression we are at
        const trackElapsedTime = this.currentTime + (nextMeasureTime - this.ctx.currentTime);
        if (trackElapsedTime >= this.duration) {
          this.stop();
          this.endListeners.forEach((l) => l());
          return;
        }

        const measureIndex = Math.floor(trackElapsedTime / secondsPerMeasure);
        const chordName = chords[measureIndex % chords.length];

        this.scheduleMeasure(nextMeasureTime, secondsPerBeat, chordName, song, measureIndex);
        nextMeasureTime += secondsPerMeasure;
      }
    };

    schedulePattern();
    const interval = window.setInterval(schedulePattern, 200);
    this.activeNodes.push(interval as any);
  }

  private scheduleMeasure(
    startTime: number,
    beat: number,
    chordName: string,
    song: SongClip,
    measureIndex: number
  ) {
    if (!this.ctx || !this.drumsGain || !this.bassGain || !this.instrumentsGain || !this.vocalsGain) return;

    const isDropMeasure = measureIndex % 8 === 4 || measureIndex % 8 === 5;
    const isBreakdown = measureIndex % 16 === 14;
    const isIntro = measureIndex < 2;

    // 1. DRUMS TRACK
    if (!isBreakdown) {
      // Kick on 1 and 3 (or 4 on the floor for dance/electronic)
      const fourOnTheFloor = song.melodyStyle === "electronic-arpeggio" || song.tags.some((t) => t.toLowerCase().includes("edm") || t.toLowerCase().includes("dance"));
      const kickBeats = fourOnTheFloor ? [0, 1, 2, 3] : [0, 2];

      kickBeats.forEach((b) => {
        this.triggerKick(startTime + b * beat);
      });

      // Snare / Clap on 2 and 4
      if (!isIntro || measureIndex === 1) {
        this.triggerSnare(startTime + 1 * beat);
        this.triggerSnare(startTime + 3 * beat);
      }

      // Hi-Hats on 8th notes
      for (let i = 0; i < 8; i++) {
        const hatTime = startTime + i * (beat / 2);
        const isAccent = i % 2 === 0;
        this.triggerHiHat(hatTime, isAccent ? 0.35 : 0.2);
      }

      // Crash cymbal on section transitions
      if (measureIndex % 8 === 0) {
        this.triggerCrash(startTime);
      }
    }

    // 2. BASS TRACK
    const { root } = parseChord(chordName);
    const bassNote = `${root}2`;
    const bassFreq = NOTE_FREQS[bassNote] || 110;

    // Bassline rhythm: 8th notes or groovy syncopation
    const bassRhythm = [0, 0.5, 1.5, 2, 2.5, 3.5];
    bassRhythm.forEach((b) => {
      this.triggerBassNote(startTime + b * beat, bassFreq, beat * 0.45, song.melodyStyle);
    });

    // 3. CHORDS / HARMONY TRACK
    const chordFreqs = getChordFrequencies(chordName, 3);
    if (!isIntro || measureIndex > 0) {
      // Play warm polyphonic pad or rhythmic stabs
      this.triggerChordStab(startTime, chordFreqs, beat * 3.8, song.melodyStyle, isDropMeasure);
      if (song.energy > 0.6) {
        // Stabs on off-beats
        this.triggerChordStab(startTime + 1.5 * beat, chordFreqs, beat * 0.4, song.melodyStyle, false);
        this.triggerChordStab(startTime + 2.5 * beat, chordFreqs, beat * 0.4, song.melodyStyle, false);
      }
    }

    // 4. LEAD MELODY / ARPEGGIATOR
    const leadOctave = 4;
    const chordPitches = getChordFrequencies(chordName, leadOctave);
    const arpSteps = [0, 1, 2, 1, 0, 2, 1, 2];
    arpSteps.forEach((stepIdx, idx) => {
      const pitch = chordPitches[stepIdx % chordPitches.length];
      const noteTime = startTime + idx * (beat / 2);
      this.triggerLeadArpNote(noteTime, pitch, beat * 0.4, song.melodyStyle, song.energy);
    });

    // 5. VOCAL MELODY / FORMANT LINE (if not instrumental)
    if (!song.instrumental && (!isIntro || measureIndex === 1)) {
      const vocalScale = chordPitches.map((p) => p * 1.5);
      // Sing an expressive melodic motif across the measure
      const vocalRhythm = [0, 0.75, 1.5, 2.25, 3.0];
      vocalRhythm.forEach((t, i) => {
        const pitch = vocalScale[i % vocalScale.length];
        this.triggerVocalFormant(startTime + t * beat, pitch, beat * 0.6, i);
      });
    }
  }

  // --- Drum Synthesizers ---
  private triggerKick(time: number) {
    if (!this.ctx || !this.drumsGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(this.drumsGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private triggerSnare(time: number) {
    if (!this.ctx || !this.drumsGain) return;

    // Noise component
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(800, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.drumsGain);

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.08);

    oscGain.gain.setValueAtTime(0.6, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.drumsGain);

    noise.start(time);
    noise.stop(time + 0.18);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  private triggerHiHat(time: number, vol: number) {
    if (!this.ctx || !this.drumsGain) return;

    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumsGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  private triggerCrash(time: number) {
    if (!this.ctx || !this.drumsGain) return;
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(4500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumsGain);

    noise.start(time);
    noise.stop(time + 0.8);
  }

  // --- Bass Synthesizer ---
  private triggerBassNote(time: number, freq: number, duration: number, style: string) {
    if (!this.ctx || !this.bassGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = style === "rock-riff" ? "sawtooth" : style === "lofi-piano" ? "triangle" : "sawtooth";
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    const baseCutoff = style === "synth-lead" ? 1200 : 700;
    filter.frequency.setValueAtTime(baseCutoff * 2.2, time);
    filter.frequency.exponentialRampToValueAtTime(baseCutoff * 0.7, time + duration);

    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bassGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // --- Chord / Pad Synthesizer ---
  private triggerChordStab(time: number, freqs: number[], duration: number, style: string, isIntense: boolean) {
    if (!this.ctx || !this.instrumentsGain) return;

    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.instrumentsGain) return;
      const osc = this.ctx.createOscillator();
      const detuneOsc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = style === "acoustic-strum" ? "triangle" : style === "lofi-piano" ? "sine" : "sawtooth";
      detuneOsc.type = osc.type;

      osc.frequency.setValueAtTime(freq, time);
      detuneOsc.frequency.setValueAtTime(freq, time);
      detuneOsc.detune.setValueAtTime(7, time); // Subtle stereo chorus width

      filter.type = "lowpass";
      const cutoff = isIntense ? 3200 : 1600;
      filter.frequency.setValueAtTime(cutoff, time);

      const stabVol = (0.28 / freqs.length) * (isIntense ? 1.2 : 1.0);
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(stabVol, time + 0.05 + i * 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      detuneOsc.connect(filter);
      filter.connect(gain);
      gain.connect(this.instrumentsGain);

      osc.start(time);
      detuneOsc.start(time);
      osc.stop(time + duration);
      detuneOsc.stop(time + duration);
    });
  }

  // --- Lead / Arp Synthesizer ---
  private triggerLeadArpNote(time: number, freq: number, duration: number, style: string, energy: number) {
    if (!this.ctx || !this.instrumentsGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = style === "rock-riff" ? "sawtooth" : "square";
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq * 1.8, time);
    filter.Q.setValueAtTime(2.5, time);

    const leadVol = 0.16 * energy;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(leadVol, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.instrumentsGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // --- Vocal Formant Synthesizer ---
  private triggerVocalFormant(time: number, freq: number, duration: number, phraseIndex: number) {
    if (!this.ctx || !this.vocalsGain) return;

    // Dual formant filter modeling human vocal tract vowels (Ah, Oh, Ee)
    const vowels = [
      { f1: 730, f2: 1090 }, // Ah
      { f1: 570, f2: 840 },  // Oh
      { f1: 270, f2: 2290 }, // Ee
      { f1: 490, f2: 1350 }, // Eh
    ];
    const vowel = vowels[phraseIndex % vowels.length];

    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);
    // Add subtle expressive vibrato
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(5.5, time);
    vibratoGain.gain.setValueAtTime(6, time);
    vibrato.connect(osc.frequency);
    vibrato.start(time);
    vibrato.stop(time + duration);

    const formant1 = this.ctx.createBiquadFilter();
    formant1.type = "bandpass";
    formant1.frequency.setValueAtTime(vowel.f1, time);
    formant1.Q.setValueAtTime(4.0, time);

    const formant2 = this.ctx.createBiquadFilter();
    formant2.type = "bandpass";
    formant2.frequency.setValueAtTime(vowel.f2, time);
    formant2.Q.setValueAtTime(4.0, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.24, time + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(formant1);
    osc.connect(formant2);
    formant1.connect(gain);
    formant2.connect(gain);
    gain.connect(this.vocalsGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private stopActiveAudioNodes() {
    this.activeNodes.forEach((node) => {
      if (typeof node === "number") {
        clearInterval(node);
      }
    });
    this.activeNodes = [];
  }

  // --- Real-time Progress Tracking ---
  private startProgressTicker() {
    const ticker = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) {
        clearInterval(ticker);
        return;
      }
      const elapsedSinceStart = (this.ctx.currentTime - this.playbackStartContextTime) * this.playbackRate;
      this.currentTime = this.playbackStartOffset + elapsedSinceStart;

      if (this.currentTime >= this.duration) {
        this.stop();
        this.endListeners.forEach((l) => l());
      } else {
        this.notifyTime();
      }
    }, 100);

    this.activeNodes.push(ticker as any);
  }

  private notifyTime() {
    this.timeListeners.forEach((l) => l(this.currentTime, this.duration));
  }

  private notifyState() {
    this.stateListeners.forEach((l) => l(this.isPlaying));
  }

  public onTimeUpdate(cb: (time: number, duration: number) => void) {
    this.timeListeners.push(cb);
    return () => {
      this.timeListeners = this.timeListeners.filter((l) => l !== cb);
    };
  }

  public onEnded(cb: () => void) {
    this.endListeners.push(cb);
    return () => {
      this.endListeners = this.endListeners.filter((l) => l !== cb);
    };
  }

  public onStateChange(cb: (isPlaying: boolean) => void) {
    this.stateListeners.push(cb);
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== cb);
    };
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.duration;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Live visualizer data
  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(64);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  // --- Offline WAV Exporter ---
  public async exportToWav(song: SongClip): Promise<Blob> {
    const sampleRate = 44100;
    const totalSeconds = Math.min(song.duration || 120, 180); // export full song
    const offlineCtx = new OfflineAudioContext(2, sampleRate * totalSeconds, sampleRate);

    const masterGain = offlineCtx.createGain();
    masterGain.gain.setValueAtTime(0.85, 0);
    masterGain.connect(offlineCtx.destination);

    const bpm = song.bpm || 120;
    const secondsPerBeat = 60 / bpm;
    const secondsPerMeasure = secondsPerBeat * 4;
    const totalMeasures = Math.ceil(totalSeconds / secondsPerMeasure);
    const chords = song.chords && song.chords.length > 0 ? song.chords : ["Am", "F", "C", "G"];

    for (let m = 0; m < totalMeasures; m++) {
      const startTime = m * secondsPerMeasure;
      const chordName = chords[m % chords.length];
      const isBreakdown = m % 16 === 14;

      // Drums
      if (!isBreakdown) {
        [0, 2].forEach((b) => {
          const t = startTime + b * secondsPerBeat;
          const osc = offlineCtx.createOscillator();
          const g = offlineCtx.createGain();
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);
          g.gain.setValueAtTime(0.85, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.3);
        });

        // Snare on 2 and 4
        [1, 3].forEach((b) => {
          const t = startTime + b * secondsPerBeat;
          const osc = offlineCtx.createOscillator();
          const g = offlineCtx.createGain();
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
          g.gain.setValueAtTime(0.4, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.12);
        });
      }

      // Bass
      const { root } = parseChord(chordName);
      const bassFreq = NOTE_FREQS[`${root}2`] || 110;
      [0, 1, 2, 3].forEach((b) => {
        const t = startTime + b * secondsPerBeat;
        const osc = offlineCtx.createOscillator();
        const g = offlineCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(bassFreq, t);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + secondsPerBeat * 0.8);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(t);
        osc.stop(t + secondsPerBeat * 0.8);
      });

      // Chords
      const chordPitches = getChordFrequencies(chordName, 3);
      chordPitches.forEach((freq) => {
        const osc = offlineCtx.createOscillator();
        const g = offlineCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, startTime);
        g.gain.setValueAtTime(0.12 / chordPitches.length, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + secondsPerMeasure * 0.9);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + secondsPerMeasure * 0.95);
      });
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWavBlob(renderedBuffer);
  }
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      out.setUint8(pos++, str.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  writeString("RIFF");
  setUint32(length - 8);
  writeString("WAVE");
  writeString("fmt ");
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  writeString("data");
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: "audio/wav" });
}

export const audioEngine = new SunoAudioEngine();
