import { LyricLine } from "../types";

export function parseLyrics(rawLyrics: string, totalDuration: number = 135): LyricLine[] {
  if (!rawLyrics) return [];

  const rawLines = rawLyrics
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const linesWithMeta: { text: string; section?: string; isHeader: boolean }[] = [];
  let currentSection = "Intro";

  for (const line of rawLines) {
    if (line.startsWith("[") && line.endsWith("]")) {
      currentSection = line.slice(1, -1);
      linesWithMeta.push({ text: line, section: currentSection, isHeader: true });
    } else {
      linesWithMeta.push({ text: line, section: currentSection, isHeader: false });
    }
  }

  // Distribute timing across the duration
  // Give headers a short duration, lyric lines longer duration
  const meaningfulLines = linesWithMeta.filter((l) => !l.isHeader);
  const count = Math.max(1, meaningfulLines.length);

  // Leave some intro & outro padding
  const introTime = 4;
  const outroTime = 6;
  const activeDuration = Math.max(20, totalDuration - introTime - outroTime);
  const timePerLine = activeDuration / count;

  let currentLineIndex = 0;
  const result: LyricLine[] = [];

  for (let i = 0; i < linesWithMeta.length; i++) {
    const item = linesWithMeta[i];
    if (item.isHeader) {
      const headerStart = introTime + currentLineIndex * timePerLine;
      result.push({
        id: `header-${i}`,
        section: item.section,
        text: item.text,
        startTime: Math.max(0, headerStart - 1.5),
        endTime: headerStart + 1.5,
      });
    } else {
      const start = introTime + currentLineIndex * timePerLine;
      const end = start + timePerLine;
      result.push({
        id: `line-${i}`,
        section: item.section,
        text: item.text,
        startTime: start,
        endTime: end,
      });
      currentLineIndex++;
    }
  }

  return result;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
