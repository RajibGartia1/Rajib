import { SongClip } from "../types";

export const SAMPLE_SONGS: SongClip[] = [
  {
    id: "suno-track-001",
    title: "Neon Horizon",
    lyrics: `[Intro - Analog Pulse]
(Gentle synth arpeggios and filtered sub bass)

[Verse 1]
Midnight chrome under electric rain
Reflecting headlights washing out the pain
Highway stretching past the city line
Chasing a dream in binary design

[Pre-Chorus]
Can you feel the voltage rise?
Look into the neon skies

[Chorus]
We are electric, running the grid
Living the dreams that the daytime hid
Step on the gas and don't look back
Leaving our fire on the endless track

[Drop]
(Driving 124 BPM bassline and synth brass lead)

[Verse 2]
Cyber shadows dancing on the glass
Every second moving way too fast
Signal's clear and the beat is tight
Everything's gold in the neon night

[Bridge]
Time slows down at the red line
Forever caught in the design

[Chorus]
We are electric, running the grid
Living the dreams that the daytime hid
Step on the gas and don't look back
Leaving our fire on the endless track

[Outro]
Fading into the neon horizon...
Drive on.`,
    styleDescription: "80s synthwave, nostalgic analog synthesizers, punchy 808 snare, driving bassline, vocoder harmonies, 124 bpm",
    tags: ["Synthwave", "Retrowave", "124 BPM", "Analog", "Cyberpunk", "Driving Bass"],
    bpm: 124,
    key: "A minor",
    scale: "minor",
    chords: ["Am", "F", "C", "G"],
    melodyStyle: "synth-lead",
    energy: 0.88,
    duration: 142,
    coverArtPrompt: "Retrofuturistic supercar speeding into glowing digital horizon with grid lines and magenta sunset",
    primaryColor: "#FF4B3E",
    secondaryColor: "#8B5CF6",
    accentColor: "#06B6D4",
    vocalStyle: "Melodic vocoder harmonies with warm analog chorus",
    createdAt: Date.now() - 1000 * 60 * 45,
    likes: 1420,
    plays: 8940,
    isLiked: true,
    model: "v4.0",
    instrumental: false,
    clipNumber: 1,
    status: "ready",
    waveformData: [
      12, 18, 25, 40, 65, 80, 75, 90, 85, 95, 70, 60, 45, 80, 95, 100, 85, 60,
      40, 30, 20, 45, 70, 85, 90, 95, 80, 70, 60, 75, 90, 100, 95, 80, 50, 20,
    ],
  },
  {
    id: "suno-track-002",
    title: "Midnight Espresso",
    lyrics: `[Intro]
(Vinyl crackle, warm Rhodes piano chords, gentle rain)

[Verse 1]
Two in the morning, steam rising slow
Streetlights outside in an amber glow
Pages turning with the rhythm of the clock
Thoughts drifting easy down an empty block

[Chorus]
Midnight espresso, sweet and refined
Washing the static right out of my mind
Drop the needle, let the sax groove play
Tomorrow's worries are a world away

[Instrumental Solo]
(Mellow jazz piano solo over walking bass)

[Verse 2]
Cat curled up on the windowsill
World has stopped and the night is still
Muted trumpet through the chilly air
Not a single rush to be anywhere

[Chorus]
Midnight espresso, sweet and refined
Washing the static right out of my mind
Drop the needle, let the sax groove play
Tomorrow's worries are a world away

[Outro]
Just one more sip...
Vinyl fading out into rain.`,
    styleDescription: "Lo-Fi hip hop, jazzy Rhodes piano, vinyl crackle, warm upright bass, sleepy saxophone, relaxed swing",
    tags: ["Lo-Fi", "Chillhop", "Jazz", "82 BPM", "Coffee Shop", "Rainy Night"],
    bpm: 82,
    key: "F major",
    scale: "major",
    chords: ["Fmaj7", "Dm7", "Gm7", "C7"],
    melodyStyle: "lofi-piano",
    energy: 0.48,
    duration: 130,
    coverArtPrompt: "Cozy coffee shop window with rain droplets, warm lamp, vintage vinyl player, and steam rising",
    primaryColor: "#EC4899",
    secondaryColor: "#F59E0B",
    accentColor: "#FDE68A",
    vocalStyle: "Whispery intimate vocals with tape saturation",
    createdAt: Date.now() - 1000 * 60 * 120,
    likes: 3120,
    plays: 18450,
    isLiked: false,
    model: "v4.0",
    instrumental: false,
    clipNumber: 1,
    status: "ready",
    waveformData: [
      8, 14, 20, 35, 45, 50, 48, 55, 52, 58, 42, 38, 30, 48, 58, 62, 55, 40,
      28, 22, 16, 30, 48, 55, 58, 60, 52, 45, 38, 48, 56, 62, 58, 48, 30, 15,
    ],
  },
  {
    id: "suno-track-003",
    title: "Cybernetic Overdrive",
    lyrics: `[Intro - Industrial Siren]
(Distorted sub drone and punchy metallic hi-hats)

[Verse 1]
System reboot in a high-rise vault
Override the circuit, it's nobody's fault
Cables pulsing with a heavy surge
Standing right upon the matrix verge

[Drop - Full Neurofunk]
(Aggressive sawtooth bass riff and 138 BPM halftime kick)

[Chorus]
Cybernetic overdrive!
Only the fearless can survive
Bypass the firewall, smash the gate
We decide the future state!

[Guitar Solo]
(Blistering industrial synth-metal guitar shred)

[Chorus]
Cybernetic overdrive!
Only the fearless can survive
Bypass the firewall, smash the gate
We decide the future state!

[Outro]
System critical.
Terminal shutdown.`,
    styleDescription: "Industrial cyberpunk, aggressive saw bass, dark electro, metal guitar stabs, distorted drums, 138 bpm",
    tags: ["Cyberpunk", "Industrial", "Dark Synth", "Aggressive", "138 BPM", "Bass Heavy"],
    bpm: 138,
    key: "D minor",
    scale: "minor",
    chords: ["Dm", "Bb", "F", "C"],
    melodyStyle: "rock-riff",
    energy: 0.94,
    duration: 125,
    coverArtPrompt: "Futuristic skull with glowing neon wires, molten steel sparks, and cybernetic optics",
    primaryColor: "#EF4444",
    secondaryColor: "#10B981",
    accentColor: "#FDE047",
    vocalStyle: "Gritty distorted robotic vocals",
    createdAt: Date.now() - 1000 * 60 * 360,
    likes: 870,
    plays: 5410,
    isLiked: false,
    model: "v3.5",
    instrumental: false,
    clipNumber: 2,
    status: "ready",
    waveformData: [
      20, 30, 45, 75, 90, 100, 95, 100, 95, 100, 85, 70, 50, 90, 100, 100, 95, 80,
      60, 40, 35, 60, 85, 100, 100, 100, 90, 80, 70, 85, 98, 100, 95, 85, 65, 30,
    ],
  },
  {
    id: "suno-track-004",
    title: "Golden Hour Acoustic",
    lyrics: `[Intro]
(Gentle fingerpicked acoustic guitar in open D tuning)

[Verse 1]
Dust motes dancing in the slanted sun
Another peaceful day is almost done
Gravel crunching beneath our shoes
Nothing to prove and nothing to lose

[Chorus]
Take my hand in the golden hour
Feel the quiet, subtle power
Sun dipping down past the canyon crest
Resting our heads upon evening's chest

[Verse 2]
Crickets tuning up their twilight song
Where we are is right where we belong
Breeze cool against the sun-baked stone
Never felt so far from alone

[Chorus]
Take my hand in the golden hour
Feel the quiet, subtle power
Sun dipping down past the canyon crest
Resting our heads upon evening's chest

[Outro]
Whispers into the dark...
Golden hour.`,
    styleDescription: "Warm indie folk, fingerstyle acoustic guitar, gentle shaker, cello pad, melodic female vocals",
    tags: ["Indie Folk", "Acoustic", "Golden Hour", "Peaceful", "96 BPM", "Warm"],
    bpm: 96,
    key: "G major",
    scale: "major",
    chords: ["G", "Em", "C", "D"],
    melodyStyle: "acoustic-strum",
    energy: 0.52,
    duration: 150,
    coverArtPrompt: "Sunburst over golden wildflower valley with rustic wooden porch and warm amber sky",
    primaryColor: "#F59E0B",
    secondaryColor: "#EA580C",
    accentColor: "#FEF08A",
    vocalStyle: "Breathful emotive female folk vocals",
    createdAt: Date.now() - 1000 * 60 * 720,
    likes: 2450,
    plays: 14200,
    isLiked: true,
    model: "v4.0",
    instrumental: false,
    clipNumber: 1,
    status: "ready",
    waveformData: [
      10, 15, 22, 38, 48, 55, 52, 60, 58, 62, 45, 40, 32, 50, 62, 68, 60, 45,
      30, 25, 18, 35, 52, 60, 62, 65, 55, 48, 40, 52, 60, 65, 62, 50, 32, 18,
    ],
  },
  {
    id: "suno-track-005",
    title: "Tokyo Raindrift",
    lyrics: `[Intro]
(City Pop slap bass, sparkling FM synthesizers, Japanese flute flourish)

[Verse 1]
Shibuya crossing in purple light
Umbrellas opening against the night
Tokyo Tower piercing through the clouds
Melting away the roar of the crowds

[Chorus]
Dance in the raindrift, funk in the street
Follow the rhythm of your own heartbeat
Neon reflections on glass and stone
Tonight Tokyo is our own

[Bridge]
(Funky brass section & slap bass solo)

[Chorus]
Dance in the raindrift, funk in the street
Follow the rhythm of your own heartbeat
Neon reflections on glass and stone
Tonight Tokyo is our own

[Outro]
Arigato...
Raindrops falling into jazz.`,
    styleDescription: "80s Japanese City Pop, funk slap bass, sparkling FM bells, cheerful brass section, infectious groove, 116 bpm",
    tags: ["City Pop", "Funk", "116 BPM", "Tokyo", "Groovy", "Slap Bass"],
    bpm: 116,
    key: "C minor",
    scale: "minor",
    chords: ["Cm", "Ab", "Fm", "G"],
    melodyStyle: "funk-groove",
    energy: 0.78,
    duration: 138,
    coverArtPrompt: "Vintage 1980s anime aesthetic of Tokyo city lights through rain-streaked window",
    primaryColor: "#06B6D4",
    secondaryColor: "#8B5CF6",
    accentColor: "#F43F5E",
    vocalStyle: "Bright bouncy City Pop female vocal style",
    createdAt: Date.now() - 1000 * 60 * 1440,
    likes: 1980,
    plays: 11300,
    isLiked: false,
    model: "v4.0",
    instrumental: false,
    clipNumber: 2,
    status: "ready",
    waveformData: [
      15, 22, 32, 50, 70, 82, 78, 88, 84, 90, 68, 58, 44, 75, 88, 92, 82, 60,
      42, 32, 24, 48, 72, 84, 88, 92, 78, 68, 58, 72, 86, 92, 88, 74, 48, 22,
    ],
  },
];
