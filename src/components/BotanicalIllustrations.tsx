import React from 'react';
import type { BotanicalMotif } from '../config/birthdayContent';

interface MotifProps {
  motif: BotanicalMotif;
  className?: string;
}

/**
 * Delicate heirloom pastel botanical line & wash illustrations
 * used consistently across Section 1 blooms and Section 3 scrapbook cards.
 */
export const BotanicalIllustration: React.FC<MotifProps> = ({ motif, className = 'w-14 h-14' }) => {
  switch (motif) {
    case 'peony':
      return (
        <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
          <path
            d="M40 72 C40 58, 39 50, 41 42"
            stroke="#7E977F"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M40 58 C30 56, 25 50, 22 44 C29 45, 35 48, 40 54"
            fill="#C7D7C5"
            fillOpacity="0.65"
            stroke="#7E977F"
            strokeWidth="1.1"
          />
          <path
            d="M41 55 C50 53, 56 47, 58 41 C51 43, 45 47, 41 52"
            fill="#C7D7C5"
            fillOpacity="0.55"
            stroke="#7E977F"
            strokeWidth="1.1"
          />
          <circle cx="40" cy="31" r="16" fill="#F4D2DA" fillOpacity="0.55" />
          <path
            d="M40 16 C48 16, 55 23, 54 31 C53 40, 46 45, 39 45 C31 45, 25 39, 26 30 C27 22, 32 16, 40 16 Z"
            fill="#F6D8DF"
            fillOpacity="0.72"
            stroke="#C78A9A"
            strokeWidth="1.15"
          />
          <path
            d="M33 27 C36 22, 44 22, 47 27 C49 32, 45 38, 40 38 C34 38, 31 33, 33 27 Z"
            fill="#FCE9EE"
            stroke="#C78A9A"
            strokeWidth="1.1"
          />
          <path
            d="M37 30 C39 28, 42 29, 42 32 C42 34, 38 35, 37 32"
            stroke="#B67686"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <circle cx="40" cy="31" r="2.2" fill="#E6B982" />
        </svg>
      );

    case 'lavender':
      return (
        <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
          <path
            d="M36 72 C38 52, 41 34, 45 14"
            stroke="#7E977F"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M42 70 C44 56, 48 44, 54 30"
            stroke="#7E977F"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {[
            { cx: 45, cy: 17, r: 3.2 },
            { cx: 41, cy: 23, r: 3.4 },
            { cx: 47, cy: 25, r: 3.4 },
            { cx: 39, cy: 30, r: 3.6 },
            { cx: 46, cy: 33, r: 3.5 },
            { cx: 38, cy: 38, r: 3.4 },
            { cx: 44, cy: 40, r: 3.2 },
            { cx: 53, cy: 33, r: 2.8 },
            { cx: 50, cy: 40, r: 3 },
            { cx: 55, cy: 44, r: 2.8 },
          ].map((bud, i) => (
            <ellipse
              key={i}
              cx={bud.cx}
              cy={bud.cy}
              rx={bud.r * 0.72}
              ry={bud.r}
              transform={`rotate(${i % 2 === 0 ? -18 : 18} ${bud.cx} ${bud.cy})`}
              fill="#D5C6EA"
              stroke="#9882BA"
              strokeWidth="1"
            />
          ))}
        </svg>
      );

    case 'eucalyptus':
      return (
        <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
          <path
            d="M28 70 C36 52, 44 36, 52 14"
            stroke="#6F8A72"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {[
            { cx: 32, cy: 56, rx: 7, ry: 5, rot: -26 },
            { cx: 45, cy: 52, rx: 7, ry: 5, rot: 22 },
            { cx: 36, cy: 42, rx: 6.5, ry: 4.8, rot: -22 },
            { cx: 49, cy: 37, rx: 6.5, ry: 4.8, rot: 24 },
            { cx: 42, cy: 27, rx: 5.5, ry: 4.2, rot: -18 },
            { cx: 54, cy: 23, rx: 5, ry: 3.8, rot: 20 },
          ].map((leaf, i) => (
            <ellipse
              key={i}
              cx={leaf.cx}
              cy={leaf.cy}
              rx={leaf.rx}
              ry={leaf.ry}
              transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
              fill="#C3D5C2"
              fillOpacity="0.72"
              stroke="#6F8A72"
              strokeWidth="1.1"
            />
          ))}
        </svg>
      );

    case 'peach-blossom':
      return (
        <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
          <path
            d="M22 66 C34 54, 44 46, 58 24"
            stroke="#8B766C"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="41"
              cy="28"
              rx="6.2"
              ry="10"
              transform={`rotate(${angle} 41 38)`}
              fill="#FADEC9"
              fillOpacity="0.82"
              stroke="#CFA080"
              strokeWidth="1.05"
            />
          ))}
          <circle cx="41" cy="38" r="4.2" fill="#E8B97F" />
          <circle cx="57" cy="24" r="4.5" fill="#F8D5C2" stroke="#CFA080" strokeWidth="1" />
        </svg>
      );

    case 'forget-me-not':
    default:
      return (
        <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
          <path
            d="M38 70 C39 54, 40 46, 36 32"
            stroke="#7B967E"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M39 56 C46 50, 51 44, 54 34"
            stroke="#7B967E"
            strokeWidth="1.15"
            strokeLinecap="round"
          />
          {[0, 72, 144, 216, 288].map((angle) => (
            <circle
              key={`a-${angle}`}
              cx={35 + Math.cos((angle * Math.PI) / 180) * 6.5}
              cy={28 + Math.sin((angle * Math.PI) / 180) * 6.5}
              r="4.5"
              fill="#D9D4EE"
              stroke="#978DC0"
              strokeWidth="1"
            />
          ))}
          <circle cx="35" cy="28" r="3" fill="#F3D18E" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <circle
              key={`b-${angle}`}
              cx={54 + Math.cos((angle * Math.PI) / 180) * 5.2}
              cy={31 + Math.sin((angle * Math.PI) / 180) * 5.2}
              r="3.6"
              fill="#F3D0DA"
              stroke="#C58B9C"
              strokeWidth="0.95"
            />
          ))}
          <circle cx="54" cy="31" r="2.4" fill="#F3D18E" />
        </svg>
      );
  }
};

interface FloatingPetalsProps {
  tone?: 'day' | 'dusk';
  count?: number;
}

export const FloatingPetalsLayer: React.FC<FloatingPetalsProps> = ({
  tone = 'day',
  count = 10,
}) => {
  const petals = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${6 + ((i * 19) % 88)}%`,
        top: `${4 + ((i * 23) % 72)}%`,
        size: 10 + (i % 4) * 4,
        duration: `${11 + (i % 5) * 2.4}s`,
        delay: `${-(i * 1.9)}s`,
        color:
          tone === 'dusk'
            ? i % 2 === 0
              ? 'rgba(247, 215, 148, 0.45)'
              : 'rgba(213, 200, 232, 0.32)'
            : ['#F2C6D0', '#DFD3EE', '#F7DFC9', '#C6D7C6'][i % 4],
      })),
    [count, tone]
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="animate-petal-drift absolute block"
          style={
            {
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size * 0.68}px`,
              backgroundColor: p.color,
              borderRadius: '68% 32% 72% 28% / 60% 40% 60% 40%',
              filter: tone === 'dusk' ? 'blur(0.5px)' : 'none',
              opacity: 0.65,
              '--drift-duration': p.duration,
              '--drift-delay': p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
