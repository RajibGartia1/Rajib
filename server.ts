import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Generate Song endpoint (produces 2 clips like Suno AI)
  app.post("/api/generate-song", async (req, res) => {
    try {
      const {
        prompt = "a vibrant synthwave anthem with nostalgic leads",
        customMode = false,
        lyrics = "",
        style = "",
        title = "",
        instrumental = false,
        model = "v4.0",
        tempo = "medium",
        key = "auto",
      } = req.body;

      const ai = getAiClient();

      if (!ai) {
        // Fallback realistic generative templates if API key is not yet set
        const fallbackClips = createFallbackClips({
          prompt,
          customMode,
          lyrics,
          style,
          title,
          instrumental,
          model,
        });
        return res.json({ clips: fallbackClips });
      }

      const promptInstructions = `
You are the AI music producer engine behind Suno AI.
Your task is to generate TWO distinct, high-quality song variations (Clip 1 and Clip 2) based on the user's request.

User inputs:
- Simple prompt / idea: "${prompt}"
- Custom mode enabled: ${customMode}
- Custom lyrics provided: "${lyrics ? lyrics.slice(0, 500) : "None (generate original lyrics)"}"
- Music style / genres: "${style || "Match the idea or prompt naturally"}"
- Custom title: "${title || "Generate catchy title"}"
- Instrumental only: ${instrumental}
- Desired tempo vibe: ${tempo}
- Target key: ${key}

Rules:
1. For each clip, generate:
   - Catchy, creative song title
   - Complete, rhythmic, rhyming lyrics structured with tags like [Intro], [Verse 1], [Chorus], [Verse 2], [Guitar Solo], [Bridge], [Drop], [Outro]. If instrumental is true, lyrics can describe instrument sections or cues like "[Driving Bassline Intro]", "[Arpeggiated Synth Lead]", etc.
   - Detailed style description (genres, production style, instrumentation, atmosphere)
   - 4-6 genre & mood tags (e.g. ["Synthwave", "Retro 80s", "Cyberpunk", "Driving Bass", "Nostalgic"])
   - BPM (number between 75 and 165)
   - Musical Key (e.g. "A minor", "F# minor", "C major", "D minor", "G major", "E minor")
   - Scale: "minor" or "major"
   - Chord progression: 4 chord names (e.g. ["Am", "F", "C", "G"] or ["Em", "C", "G", "D"] or ["Dm", "Bb", "F", "C"])
   - Melody Style: one of "synth-lead", "acoustic-strum", "funk-groove", "lofi-piano", "rock-riff", "electronic-arpeggio", "orchestral"
   - Energy: decimal between 0.4 and 0.95
   - Visual Cover Art Prompt (a vivid description for album cover art)
   - Primary color (vibrant hex, e.g. "#FF4B3E", "#A855F7", "#06B6D4", "#F59E0B", "#10B981")
   - Secondary color (hex, complementary)
   - Accent color (bright hex)
   - Vocal style description (e.g. "Warm female vocals with subtle reverb", "Gritty soulful male vocals", "Vocoder autotune harmonies", or "Instrumental")

Both clips should be compelling variations of the concept (Clip 1 may have a punchy melodic take, Clip 2 may have a different arrangement, tempo, or emotional cadence).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptInstructions,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    lyrics: { type: Type.STRING },
                    styleDescription: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    bpm: { type: Type.INTEGER },
                    key: { type: Type.STRING },
                    scale: { type: Type.STRING },
                    chords: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    melodyStyle: { type: Type.STRING },
                    energy: { type: Type.NUMBER },
                    coverArtPrompt: { type: Type.STRING },
                    primaryColor: { type: Type.STRING },
                    secondaryColor: { type: Type.STRING },
                    accentColor: { type: Type.STRING },
                    vocalStyle: { type: Type.STRING },
                  },
                  required: [
                    "title",
                    "lyrics",
                    "styleDescription",
                    "tags",
                    "bpm",
                    "key",
                    "scale",
                    "chords",
                    "melodyStyle",
                    "energy",
                    "coverArtPrompt",
                    "primaryColor",
                    "secondaryColor",
                    "accentColor",
                  ],
                },
              },
            },
            required: ["clips"],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.clips && Array.isArray(parsed.clips) && parsed.clips.length > 0) {
        return res.json({ clips: parsed.clips });
      }

      // If parsing is empty, fallback
      const fallback = createFallbackClips({ prompt, customMode, lyrics, style, title, instrumental, model });
      return res.json({ clips: fallback });
    } catch (error) {
      console.error("Error generating song with Gemini:", error);
      const fallback = createFallbackClips(req.body || {});
      return res.json({ clips: fallback });
    }
  });

  // Generate Lyrics endpoint (for Custom Mode helper)
  app.post("/api/generate-lyrics", async (req, res) => {
    try {
      const { prompt = "", style = "", title = "" } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.json({
          lyrics: `[Verse 1]\nNeon signs flicker in the midnight mist\nEchoes of melodies that can't be missed\nChasing the frequency through the wire\nIgniting a spark that turns into fire\n\n[Chorus]\nTurn up the signal, let the sound break free\nDancing on the waves of pure harmony\nFrom the highest peak to the lowest floor\nWe're craving the beat and we're asking for more\n\n[Verse 2]\nSubwoofers humming like an ocean tide\nNowhere to run and no reason to hide\nLost in the groove till the morning light\nEverything's golden in the sound tonight\n\n[Drop]\n(Heavy beat drop and filtered synth leads)\n\n[Chorus]\nTurn up the signal, let the sound break free\nDancing on the waves of pure harmony\nFrom the highest peak to the lowest floor\nWe're craving the beat and we're asking for more\n\n[Outro]\nFading to the stars...\nLet the rhythm breathe.\n`,
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Write structured, lyrical, catchy song lyrics for a music track.
Topic/Prompt: ${prompt || "An energetic anthem about freedom, technology, and late night energy"}
Genre/Style: ${style || "Modern Electro Pop"}
Title: ${title || "Catchy Title"}

Include section headers in square brackets like [Verse 1], [Chorus], [Verse 2], [Bridge], [Drop], [Outro].
Make the cadence rhythmic, vivid, and musical. Return ONLY the lyrics with the section headers.`,
      });

      res.json({ lyrics: response.text?.trim() || "" });
    } catch (err) {
      console.error("Error generating lyrics:", err);
      res.status(500).json({ error: "Failed to generate lyrics" });
    }
  });

  // Extend Song endpoint (continues track)
  app.post("/api/extend-song", async (req, res) => {
    try {
      const { song, continueAt = "02:00" } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.json({
          extendedLyrics: `${song?.lyrics || ""}\n\n[Extension from ${continueAt}]\n[Guitar Solo & Build]\nThe tension rises, harmonic waves collide\n\n[Grand Finale Chorus]\nTurn up the signal, let the sound break free\nForever timeless in our memory!\n\n[Outro]\nEchoes dissolving into ambient space.`,
          addedDuration: 60,
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are continuing and extending a song titled "${song.title}" (${song.styleDescription}).
Original lyrics:
${song.lyrics}

Generate the extension continuation lyrics starting from ${continueAt}, leading through a climax/bridge and an epic outro.
Use section headers like [Extended Bridge], [Guitar Solo / Drop], [Climactic Chorus], [Outro]. Return ONLY the new extension text.`,
      });

      res.json({
        extendedLyrics: response.text?.trim() || "",
        addedDuration: 60,
      });
    } catch (err) {
      console.error("Error extending song:", err);
      res.status(500).json({ error: "Failed to extend song" });
    }
  });

  // Create Cover / Re-genre endpoint
  app.post("/api/create-cover", async (req, res) => {
    try {
      const { originalSong, newStyle = "Acoustic Unplugged" } = req.body;
      const ai = getAiClient();

      if (!ai) {
        const coverClip = {
          title: `${originalSong.title} (${newStyle} Cover)`,
          lyrics: originalSong.lyrics,
          styleDescription: `${newStyle}, acoustic textures, organic instruments`,
          tags: [newStyle, "Cover", "Reimagined", "Acoustic"],
          bpm: 95,
          key: originalSong.key || "G Major",
          scale: "major",
          chords: ["G", "Em", "C", "D"],
          melodyStyle: "acoustic-strum",
          energy: 0.5,
          coverArtPrompt: `An intimate vinyl cover of ${originalSong.title} in ${newStyle} aesthetic`,
          primaryColor: "#E09F3E",
          secondaryColor: "#9E2A2B",
          accentColor: "#FFF3B0",
          vocalStyle: "Raw acoustic heartfelt vocals",
        };
        return res.json({ coverClip });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Transform this song into a cover version in the style of "${newStyle}":
Original Title: "${originalSong.title}"
Original Style: "${originalSong.styleDescription}"
Lyrics:
${originalSong.lyrics}

Adapt the style description, tags, BPM, key, scale, chords, melodyStyle, and colors to reflect this radical new cover genre.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              lyrics: { type: Type.STRING },
              styleDescription: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              bpm: { type: Type.INTEGER },
              key: { type: Type.STRING },
              scale: { type: Type.STRING },
              chords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              melodyStyle: { type: Type.STRING },
              energy: { type: Type.NUMBER },
              coverArtPrompt: { type: Type.STRING },
              primaryColor: { type: Type.STRING },
              secondaryColor: { type: Type.STRING },
              accentColor: { type: Type.STRING },
              vocalStyle: { type: Type.STRING },
            },
            required: [
              "title",
              "lyrics",
              "styleDescription",
              "tags",
              "bpm",
              "key",
              "scale",
              "chords",
              "melodyStyle",
              "energy",
              "primaryColor",
              "secondaryColor",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json({ coverClip: parsed });
    } catch (err) {
      console.error("Error creating cover:", err);
      res.status(500).json({ error: "Failed to create cover" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Suno AI Studio server running at http://0.0.0.0:${PORT}`);
  });
}

function createFallbackClips(params: any) {
  const promptLower = (params.prompt || params.style || "").toLowerCase();
  const isRock = promptLower.includes("rock") || promptLower.includes("metal");
  const isHipHop = promptLower.includes("rap") || promptLower.includes("hip hop") || promptLower.includes("trap");
  const isLofi = promptLower.includes("lofi") || promptLower.includes("lo-fi") || promptLower.includes("chill");
  const isAcoustic = promptLower.includes("acoustic") || promptLower.includes("folk") || promptLower.includes("indie");

  let genre = "Synthwave";
  let bpm = 124;
  let key = "A minor";
  let chords = ["Am", "F", "C", "G"];
  let melodyStyle = "synth-lead";
  let energy = 0.82;
  let primary = "#FF4B3E";
  let secondary = "#8B5CF6";
  let accent = "#06B6D4";

  if (isRock) {
    genre = "Hard Rock / Alternative";
    bpm = 138;
    key = "E minor";
    chords = ["Em", "G", "C", "D"];
    melodyStyle = "rock-riff";
    energy = 0.9;
    primary = "#EF4444";
    secondary = "#F97316";
    accent = "#FDE047";
  } else if (isHipHop) {
    genre = "Modern Trap / Hip-Hop";
    bpm = 140;
    key = "C minor";
    chords = ["Cm", "Ab", "Fm", "G"];
    melodyStyle = "electronic-arpeggio";
    energy = 0.85;
    primary = "#10B981";
    secondary = "#6366F1";
    accent = "#A7F3D0";
  } else if (isLofi) {
    genre = "Lo-Fi Beats / Chillhop";
    bpm = 82;
    key = "F major";
    chords = ["Fmaj7", "Dm7", "Gm7", "C7"];
    melodyStyle = "lofi-piano";
    energy = 0.45;
    primary = "#EC4899";
    secondary = "#8B5CF6";
    accent = "#F472B6";
  } else if (isAcoustic) {
    genre = "Indie Folk / Acoustic";
    bpm = 96;
    key = "G major";
    chords = ["G", "Em", "C", "D"];
    melodyStyle = "acoustic-strum";
    energy = 0.55;
    primary = "#F59E0B";
    secondary = "#D97706";
    accent = "#FDE68A";
  }

  const baseTitle = params.title || (params.prompt ? params.prompt.slice(0, 24).replace(/[^\w\s]/g, "") : "Midnight Horizon");

  return [
    {
      title: `${baseTitle || "Neon Skyline"}`,
      lyrics: params.lyrics || `[Verse 1]\nStreets are glowing in the electric rain\nEchoes humming through a sleepless brain\nNeon reflections on a silver hood\nDoing things we never thought we could\n\n[Chorus]\nWe are electric, running the grid\nLiving the dreams that we never hid\nTake the wheel, don't touch the brake\nThis is the future that we make\n\n[Verse 2]\nDigital shadows dancing side by side\nInfinite highways open and wide\n\n[Drop]\n(Soaring synth leads and driving percussion)\n\n[Chorus]\nWe are electric, running the grid\nLiving the dreams that we never hid\n\n[Outro]\nFading to neon lights...\nEnd of line.`,
      styleDescription: `${genre}, punchy rhythm, dynamic mix, high energy, crisp mastering`,
      tags: [genre, "High Fidelity", "Vibrant", "Melodic", "Club Ready"],
      bpm,
      key,
      scale: key.includes("minor") ? "minor" : "major",
      chords,
      melodyStyle,
      energy,
      coverArtPrompt: `Retro-futuristic album art with neon lines and glowing aesthetic for ${baseTitle}`,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      vocalStyle: params.instrumental ? "Instrumental" : "Lead melodic vocals with wide stereo spread",
    },
    {
      title: `${baseTitle || "Neon Skyline"} (Vibe Mix)`,
      lyrics: params.lyrics || `[Intro - Atmosphere]\n(Soft pulsing bass and rhythmic hi-hats)\n\n[Verse 1]\nClock strikes two and the city sighs\nBinary stars in your velvet eyes\nStatic whispers on the radio line\nEverything falls into sweet design\n\n[Chorus]\nRide the wave into midnight blue\nNothing to lose when I'm next to you\nHear the rhythm that the heartbeat makes\nEvery promise that the city breaks\n\n[Guitar Solo]\n(Expressive synth-guitar melodic run)\n\n[Chorus]\nRide the wave into midnight blue\nNothing to lose when I'm next to you\n\n[Outro]\nLet the bass echo down...\nMidnight blue.`,
      styleDescription: `${genre}, atmospheric intro, spatial reverbs, deep analog bassline`,
      tags: [genre, "Atmospheric", "Deep Bass", "Late Night", "Studio Cut"],
      bpm: bpm - 4,
      key,
      scale: key.includes("minor") ? "minor" : "major",
      chords,
      melodyStyle,
      energy: Math.max(0.4, energy - 0.1),
      coverArtPrompt: `Deep night atmospheric typography and abstract gradient waveforms for ${baseTitle}`,
      primaryColor: secondary,
      secondaryColor: primary,
      accentColor: accent,
      vocalStyle: params.instrumental ? "Instrumental" : "Ethereal vocal harmonies and smooth chorus",
    },
  ];
}

startServer();
