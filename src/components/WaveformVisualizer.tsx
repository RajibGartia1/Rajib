import React, { useRef, useEffect, useState } from "react";
import { audioEngine } from "../utils/audioEngine";
import { formatTime } from "../utils/lyricsParser";

interface WaveformVisualizerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  height?: number;
  primaryColor?: string;
  accentColor?: string;
  barsCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  height = 36,
  primaryColor = "#FF4B3E",
  accentColor = "#06B6D4",
  barsCount = 64,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Pre-calculated base waveform bar heights
  const [baseHeights] = useState<number[]>(() => {
    return Array.from({ length: barsCount }, (_, i) => {
      // Natural music envelope with beat dynamics
      const beat = Math.sin(i * 0.35) * 0.3 + 0.5;
      const variation = Math.sin(i * 1.8) * 0.2;
      const base = 0.25 + beat * 0.5 + variation;
      return Math.max(0.15, Math.min(0.95, base));
    });
  });

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
      const currentBarIndex = Math.floor(progress * barsCount);

      // Get real frequency data from audio engine if playing
      const freqData = isPlaying ? audioEngine.getFrequencyData() : null;

      const barWidth = Math.max(2, (width / barsCount) - 1.5);
      const gap = 1.5;

      for (let i = 0; i < barsCount; i++) {
        let barH = baseHeights[i];

        // If playing, modulate with live frequency data
        if (isPlaying && freqData && freqData.length > 0) {
          const freqIndex = Math.floor((i / barsCount) * (freqData.length / 2));
          const freqVal = freqData[freqIndex] / 255;
          barH = Math.max(0.15, Math.min(1.0, barH * 0.6 + freqVal * 0.55));
        }

        const x = i * (barWidth + gap);
        const actualHeight = Math.max(4, barH * (h - 6));
        const y = (h - actualHeight) / 2;

        const isPlayed = i <= currentBarIndex;

        // Draw rounded vertical bar
        ctx.beginPath();
        const radius = barWidth / 2;

        if (isPlayed) {
          // Played bars gradient
          const grad = ctx.createLinearGradient(0, y, 0, y + actualHeight);
          grad.addColorStop(0, primaryColor);
          grad.addColorStop(1, accentColor);
          ctx.fillStyle = grad;
        } else {
          // Unplayed bars
          ctx.fillStyle = "#334155";
        }

        // Draw rounded rectangle
        ctx.roundRect(x, y, barWidth, actualHeight, radius);
        ctx.fill();
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [currentTime, duration, isPlaying, barsCount, baseHeights, primaryColor, accentColor]);

  // Handle Resize of canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = height;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [height]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    onSeek(ratio * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverX(mouseX);
    setHoverTime((mouseX / rect.width) * duration);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-pointer py-1 select-none group"
      style={{ height }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setHoverTime(null);
        setHoverX(null);
      }}
      id="interactive-waveform-visualizer"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Hover scrubber bar & timestamp tooltip */}
      {hoverX !== null && hoverTime !== null && (
        <>
          <div
            className="absolute top-0 bottom-0 w-[1.5px] bg-white/70 pointer-events-none transition-opacity duration-150"
            style={{ left: hoverX }}
          />
          <div
            className="absolute -top-7 transform -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[11px] font-mono px-1.5 py-0.5 rounded shadow-lg pointer-events-none"
            style={{ left: hoverX }}
          >
            {formatTime(hoverTime)}
          </div>
        </>
      )}
    </div>
  );
};
