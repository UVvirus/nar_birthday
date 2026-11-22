import React, { useEffect, useState } from 'react';
import { Pause, Play, SlidersHorizontal } from 'lucide-react';

interface FloatingMusicControlProps {
  isPlaying: boolean;
  trackTitle: string;
  isEvening: boolean;
  onTogglePlay: () => void;
  getFrequencyBars: (count: number) => number[];
  onOpenCustomize: () => void;
}

const BAR_COUNT = 10;

/**
 * Minimal floating piano control with live reactive waveform visualizer.
 * Stays unobtrusive and compact across mobile and desktop viewports,
 * adapting contrast seamlessly when the user scrolls into the dark evening finale.
 */
export const FloatingMusicControl: React.FC<FloatingMusicControlProps> = ({
  isPlaying,
  trackTitle,
  isEvening,
  onTogglePlay,
  getFrequencyBars,
  onOpenCustomize,
}) => {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: BAR_COUNT }, () => 0.16));

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isPlaying || prefersReducedMotion) {
      setBars(Array.from({ length: BAR_COUNT }, (_, i) => (isPlaying ? 0.35 + (i % 3) * 0.14 : 0.16)));
      return;
    }

    let rafId = 0;
    let lastUpdate = 0;

    const update = (ts: number) => {
      if (ts - lastUpdate > 42) {
        lastUpdate = ts;
        const raw = getFrequencyBars(BAR_COUNT);
        // Gentle symmetric acoustic piano contour weighting
        const shaped = raw.map((val, idx) => {
          const centerWeight = 1 - Math.abs(idx - (BAR_COUNT - 1) / 2) / (BAR_COUNT * 0.72);
          return Math.max(0.16, Math.min(1, val * (0.68 + centerWeight * 0.45)));
        });
        setBars(shaped);
      }
      rafId = window.requestAnimationFrame(update);
    };

    rafId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, getFrequencyBars]);

  return (
    <aside
      aria-label="Background piano controls"
      className={`fixed right-3.5 bottom-[max(0.875rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-2 rounded-full px-2.5 py-1.5 transition-all duration-500 sm:right-6 sm:bottom-6 sm:gap-3 sm:px-3 sm:py-2 ${
        isEvening
          ? 'border border-white/15 bg-[#1D1831]/84 text-[#FAF4EC] shadow-[0_10px_32px_rgba(8,6,18,0.45)] backdrop-blur-md'
          : 'border border-[#2E282A]/10 bg-[#FFFDF9]/90 text-[#2E282A] shadow-[0_10px_28px_rgba(70,56,64,0.1)] backdrop-blur-md'
      }`}
    >
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause piano music' : 'Play piano music'}
        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D79AE] shrink-0 ${
          isEvening
            ? 'bg-[#F7D794] text-[#1A162B] hover:bg-[#FCE3AE]'
            : 'bg-[#2E282A] text-[#FBF8F3] hover:bg-[#463C40]'
        }`}
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
      </button>

      {/* Reactive Piano Waveform Visualizer */}
      <div
        className="flex h-6 items-end gap-[2.5px] px-0.5"
        aria-hidden="true"
      >
        {bars.map((level, i) => (
          <span
            key={i}
            className={`w-[2.5px] rounded-full transition-transform duration-75 ${
              isEvening ? 'bg-[#F7D794]/85' : 'bg-[#8D79AE]'
            }`}
            style={{
              height: '22px',
              transform: `scaleY(${level.toFixed(2)})`,
              transformOrigin: 'bottom',
              opacity: isPlaying ? 0.65 + level * 0.35 : 0.35,
            }}
          />
        ))}
      </div>

      {/* Concise single-line state & track */}
      <div className="hidden max-w-[136px] flex-col pr-1 sm:flex">
        <span className="truncate text-xs font-medium leading-tight">
          {trackTitle}
        </span>
        <span
          className={`text-[11px] leading-tight ${
            isEvening ? 'text-[#D5C8E8]/80' : 'text-[#665B5E]'
          }`}
        >
          {isPlaying ? 'Playing' : 'Paused'}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenCustomize}
        title="Personalize text, portrait, or piano recording"
        aria-label="Personalize story and media"
        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D79AE] shrink-0 ${
          isEvening
            ? 'text-[#D5C8E8] hover:bg-white/10 hover:text-white'
            : 'text-[#665B5E] hover:bg-[#2E282A]/6 hover:text-[#2E282A]'
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
      </button>
    </aside>
  );
};
