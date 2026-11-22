import React from 'react';
import { motion } from 'motion/react';
import type { CardIllustrationKind, EasterEggKind } from '../config/birthdayContent';

interface CardIllustrationProps {
  kind: CardIllustrationKind;
  animated?: boolean;
  className?: string;
}

/**
 * Hand-drawn pastel ink-and-watercolor illustrations tailored to each of Narmadha's 5 letters.
 * Shares the exact blush, lavender, sage, warm champagne, and sepia ink palette of the entire story.
 */
export const CardStoryIllustration: React.FC<CardIllustrationProps> = ({
  kind,
  animated = false,
  className = 'h-16 w-16',
}) => {
  switch (kind) {
    case 'smile':
      return (
        <svg viewBox="0 0 88 88" fill="none" className={className} aria-hidden="true">
          {/* Soft warm dawn wash */}
          <motion.circle
            cx="44"
            cy="44"
            r="26"
            fill="#F9DFD8"
            fillOpacity="0.52"
            initial={animated ? { scale: 0.6, opacity: 0 } : false}
            animate={animated ? { scale: [0.95, 1.05, 0.95], opacity: 0.58 } : undefined}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Sunlit radiating rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
            <motion.line
              key={deg}
              x1="44"
              y1="14"
              x2="44"
              y2="20"
              stroke="#E2AF7E"
              strokeWidth="1.4"
              strokeLinecap="round"
              transform={`rotate(${deg} 44 44)`}
              initial={animated ? { opacity: 0, pathLength: 0 } : false}
              animate={animated ? { opacity: [0.45, 1, 0.45], pathLength: 1 } : undefined}
              transition={{ duration: 2.2, delay: idx * 0.08, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          {/* Sun circle & gentle warm smile arc */}
          <circle
            cx="44"
            cy="44"
            r="17"
            fill="#FCEBE1"
            stroke="#C98A99"
            strokeWidth="1.35"
          />
          <circle cx="38" cy="41" r="1.4" fill="#5D4C52" />
          <circle cx="50" cy="41" r="1.4" fill="#5D4C52" />
          <circle cx="34.5" cy="45" r="2.6" fill="#F0BAC7" opacity="0.65" />
          <circle cx="53.5" cy="45" r="2.6" fill="#F0BAC7" opacity="0.65" />
          <motion.path
            d="M37 47 C 40 52, 48 52, 51 47"
            stroke="#5D4C52"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0 } : false}
            animate={animated ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Tiny floating sparkle stars */}
          <motion.path
            d="M68 22 L69.5 26 L73.5 27.5 L69.5 29 L68 33 L66.5 29 L62.5 27.5 L66.5 26 Z"
            fill="#E5B97A"
            initial={animated ? { scale: 0, rotate: -20 } : false}
            animate={animated ? { scale: [0.85, 1.15, 0.85], rotate: [0, 12, 0] } : undefined}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      );

    case 'craziness':
      return (
        <svg viewBox="0 0 88 88" fill="none" className={className} aria-hidden="true">
          {/* Lavender playful wash */}
          <circle cx="44" cy="46" r="24" fill="#E9DFF6" fillOpacity="0.55" />
          {/* Tilted paper party crown / whimsical doodle */}
          <motion.g
            initial={animated ? { rotate: -14, scale: 0.8 } : false}
            animate={animated ? { rotate: [-9, -3, -9], scale: 1 } : { rotate: -7 }}
            transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '44px', originY: '48px' }}
          >
            <path
              d="M24 54 L28 31 L39 42 L45 25 L52 42 L63 32 L64 54 Z"
              fill="#F8DEC9"
              fillOpacity="0.9"
              stroke="#9A7EB8"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
            <line x1="25" y1="54" x2="63" y2="54" stroke="#9A7EB8" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="28" cy="29" r="2.4" fill="#E6A9B9" />
            <circle cx="45" cy="23" r="2.8" fill="#EAB877" />
            <circle cx="63" cy="30" r="2.4" fill="#A9C2A8" />
          </motion.g>
          {/* Playful spiraling squiggle trails */}
          <motion.path
            d="M17 34 C 13 28, 19 23, 24 26"
            stroke="#CE91A4"
            strokeWidth="1.4"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0 } : false}
            animate={animated ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.9, delay: 0.15 }}
          />
          <motion.path
            d="M68 58 C 75 56, 76 49, 71 46"
            stroke="#8FA791"
            strokeWidth="1.4"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0 } : false}
            animate={animated ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.9, delay: 0.25 }}
          />
          <motion.circle
            cx="21"
            cy="63"
            r="2.4"
            fill="#D4BFE8"
            animate={animated ? { y: [0, -4, 0] } : undefined}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="69"
            cy="22"
            r="2.1"
            fill="#F0BAC7"
            animate={animated ? { y: [0, -5, 0] } : undefined}
            transition={{ duration: 2.6, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      );

    case 'fighter':
      return (
        <svg viewBox="0 0 88 88" fill="none" className={className} aria-hidden="true">
          {/* Sage serenity backdrop */}
          <circle cx="44" cy="48" r="24" fill="#DCE9DB" fillOpacity="0.5" />
          {/* Gentle hill/ground line */}
          <path d="M22 66 Q44 60 66 66" stroke="#859E86" strokeWidth="1.3" strokeLinecap="round" />
          {/* Resilient wildflower stem growing steadily upward */}
          <motion.path
            d="M44 64 C 44 52, 43 44, 44 31"
            stroke="#6E8970"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0 } : false}
            animate={animated ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.path
            d="M44 54 C 34 52, 29 46, 28 41 C 35 42, 40 46, 44 51"
            fill="#C1D5C0"
            fillOpacity="0.8"
            stroke="#6E8970"
            strokeWidth="1.2"
            initial={animated ? { scale: 0.4, opacity: 0 } : false}
            animate={animated ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.7, delay: 0.25 }}
          />
          <motion.path
            d="M44 49 C 53 47, 58 42, 60 36 C 53 38, 48 42, 44 46"
            fill="#C1D5C0"
            fillOpacity="0.72"
            stroke="#6E8970"
            strokeWidth="1.2"
            initial={animated ? { scale: 0.4, opacity: 0 } : false}
            animate={animated ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.7, delay: 0.35 }}
          />
          {/* Blooming bud & rising golden guiding star */}
          <motion.g
            initial={animated ? { scale: 0.5, opacity: 0 } : false}
            animate={animated ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.75, delay: 0.4 }}
          >
            <circle cx="44" cy="29" r="7.5" fill="#F4CCD7" stroke="#C58395" strokeWidth="1.2" />
            <circle cx="44" cy="29" r="2.8" fill="#E8B978" />
          </motion.g>
          <motion.path
            d="M44 10 L45.6 14.5 L50 16 L45.6 17.5 L44 22 L42.4 17.5 L38 16 L42.4 14.5 Z"
            fill="#E7B975"
            animate={animated ? { y: [0, -2.5, 0], opacity: [0.65, 1, 0.65] } : undefined}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      );

    case 'little-things':
      return (
        <svg viewBox="0 0 88 88" fill="none" className={className} aria-hidden="true">
          {/* Warm peach wash */}
          <circle cx="44" cy="46" r="24" fill="#F8E2CF" fillOpacity="0.56" />
          {/* Hand-tied hometown gift parcel / keepsake box */}
          <motion.g
            initial={animated ? { y: 6, opacity: 0 } : false}
            animate={animated ? { y: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <rect
              x="25"
              y="38"
              width="38"
              height="27"
              rx="4"
              fill="#FFF9F1"
              stroke="#B48C78"
              strokeWidth="1.35"
            />
            <line x1="44" y1="38" x2="44" y2="65" stroke="#D994A6" strokeWidth="2.4" />
            <line x1="25" y1="51" x2="63" y2="51" stroke="#D994A6" strokeWidth="2.2" />
            {/* Ribbon bow */}
            <path
              d="M44 38 C 37 29, 29 31, 33 38 C 36 40, 41 39, 44 38 Z"
              fill="#F2C2CE"
              stroke="#C47E91"
              strokeWidth="1.15"
            />
            <path
              d="M44 38 C 51 29, 59 31, 55 38 C 52 40, 47 39, 44 38 Z"
              fill="#F2C2CE"
              stroke="#C47E91"
              strokeWidth="1.15"
            />
          </motion.g>
          {/* Rising warm thought wisps / tiny petals */}
          <motion.path
            d="M36 26 C 34 22, 38 19, 36 15"
            stroke="#C9A8D8"
            strokeWidth="1.2"
            strokeLinecap="round"
            animate={animated ? { y: [0, -3, 0], opacity: [0.4, 0.9, 0.4] } : undefined}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M52 25 C 54 21, 50 18, 52 14"
            stroke="#E3AC84"
            strokeWidth="1.2"
            strokeLinecap="round"
            animate={animated ? { y: [0, -3.5, 0], opacity: [0.4, 0.9, 0.4] } : undefined}
            transition={{ duration: 3.1, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      );

    case 'narmadha':
    default:
      return (
        <svg viewBox="0 0 88 88" fill="none" className={className} aria-hidden="true">
          {/* Soft blush + lavender halo */}
          <circle cx="44" cy="44" r="25" fill="#EDE2F7" fillOpacity="0.54" />
          {/* Gentle watercolor crescent moon cradling a pastel butterfly */}
          <path
            d="M49 22 C 36 24, 27 35, 28 48 C 29 60, 39 68, 51 67 C 38 70, 24 61, 22 47 C 20 33, 31 20, 45 20 C 46.5 20, 47.8 20.8, 49 22 Z"
            fill="#F8E2BA"
            stroke="#C8A26A"
            strokeWidth="1.15"
          />
          <motion.g
            animate={animated ? { y: [0, -4, 0], rotate: [-4, 4, -4] } : undefined}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '54px', originY: '42px' }}
          >
            <path
              d="M54 42 C 49 34, 40 33, 40 40 C 40 45, 47 45, 53 43.5 Z"
              fill="#F1C5D4"
              stroke="#9D83B8"
              strokeWidth="1"
            />
            <path
              d="M54 42 C 59 34, 68 33, 68 40 C 68 45, 61 45, 55 43.5 Z"
              fill="#D9C7EE"
              stroke="#9D83B8"
              strokeWidth="1"
            />
            <path
              d="M53.5 44 C 48 46, 44 50, 47 52 C 50 54, 53 50, 54 45.5 Z"
              fill="#F7D8E2"
            />
            <path
              d="M54.5 44 C 60 46, 64 50, 61 52 C 58 54, 55 50, 54 45.5 Z"
              fill="#E5D9F4"
            />
            <ellipse cx="54" cy="43.5" rx="1.1" ry="4" fill="#5D4D66" />
          </motion.g>
          <motion.circle
            cx="62"
            cy="24"
            r="2"
            fill="#E7B975"
            animate={animated ? { opacity: [0.4, 1, 0.4] } : undefined}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          <circle cx="32" cy="24" r="1.4" fill="#B99FD6" opacity="0.8" />
        </svg>
      );
  }
};

interface EasterEggIconProps {
  kind: EasterEggKind;
  className?: string;
}

/**
 * Tiny margin trinket stamps for the 4 personal Narmadha Easter eggs.
 */
export const EasterEggStampIcon: React.FC<EasterEggIconProps> = ({
  kind,
  className = 'h-11 w-11',
}) => {
  switch (kind) {
    case 'halwa':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="14" y="24" width="36" height="24" rx="5" fill="#F8E5D2" stroke="#B68B6B" strokeWidth="1.4" />
          <path d="M14 35 H50" stroke="#D994A6" strokeWidth="2.2" />
          <path d="M32 24 V48" stroke="#D994A6" strokeWidth="2.2" />
          <path d="M32 24 C26 16, 20 18, 24 24" fill="#F2C5D1" stroke="#C07E90" strokeWidth="1.2" />
          <path d="M32 24 C38 16, 44 18, 40 24" fill="#F2C5D1" stroke="#C07E90" strokeWidth="1.2" />
          <circle cx="51" cy="18" r="2" fill="#E6B87A" />
        </svg>
      );

    case 'office':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M17 28 H42 V44 C42 49, 37 52, 29.5 52 C22 52, 17 49, 17 44 Z"
            fill="#FFFDF9"
            stroke="#8D79AE"
            strokeWidth="1.4"
          />
          <path d="M42 32 C48 32, 48 43, 42 43" stroke="#8D79AE" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M25 22 C24 18, 28 16, 26 12" stroke="#D59EB0" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M34 21 C33 17, 37 15, 35 11" stroke="#A6BFA7" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="29.5" cy="39" r="3" fill="#EBDFF7" />
        </svg>
      );

    case 'project':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect
            x="16"
            y="14"
            width="30"
            height="36"
            rx="3"
            fill="#FAF8F2"
            stroke="#7F9881"
            strokeWidth="1.4"
          />
          <line x1="22" y1="24" x2="40" y2="24" stroke="#B7C9B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="31" x2="37" y2="31" stroke="#B7C9B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="38" x2="34" y2="38" stroke="#D7B7C5" strokeWidth="1.5" strokeLinecap="round" />
          {/* Tiny angled pencil */}
          <path d="M39 45 L51 33 L54 36 L42 48 L37 49 Z" fill="#F2D2B4" stroke="#9A7E6B" strokeWidth="1.2" />
        </svg>
      );

    case 'certificate':
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M26 39 L21 54 L29 50 L32 55 L34 40" fill="#EBD6E0" stroke="#B87E93" strokeWidth="1.15" />
          <path d="M38 39 L43 54 L35 50 L32 55 L30 40" fill="#DDD0EE" stroke="#8F78B0" strokeWidth="1.15" />
          <circle cx="32" cy="28" r="14" fill="#F8E2B8" stroke="#C99B58" strokeWidth="1.4" />
          <circle cx="32" cy="28" r="9.5" fill="#FFFDF8" stroke="#DFBD86" strokeWidth="1" strokeDasharray="2 2" />
          <path
            d="M32 22 L33.7 25.8 L37.8 26.2 L34.7 28.9 L35.6 33 L32 30.8 L28.4 33 L29.3 28.9 L26.2 26.2 L30.3 25.8 Z"
            fill="#E2A86B"
          />
        </svg>
      );
  }
};
