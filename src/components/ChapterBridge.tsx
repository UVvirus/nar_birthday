import React from 'react';
import { motion } from 'motion/react';
import { BotanicalIllustration } from './BotanicalIllustrations';

/**
 * Option 3: Intimate Botanical & Butterfly Flight Path Bridge
 * Connects Chapter One (The Portrait) directly into Chapter Two (Her Animated World)
 * with a gentle curving ink trail, swaying floral sprigs, and a whispered storybook line—
 * eliminating dead vertical whitespace while keeping both chapters crisp and legible.
 */
export const ChapterBridge: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden py-5 sm:py-7"
      style={{
        background: 'linear-gradient(180deg, #FBF8F3 0%, #FAF4F5 52%, #F8F1F4 100%)',
      }}
    >
      {/* Subtle warm radial breath behind the botanical bridge */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 46% 78% at 50% 50%, rgba(236, 197, 206, 0.2) 0%, transparent 72%)',
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6">
        {/* Top graceful butterfly flight trail entering the whispered line */}
        <motion.svg
          viewBox="0 0 180 68"
          fill="none"
          className="h-14 w-40 overflow-visible sm:h-16 sm:w-44"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.path
            d="M90 2 C 88 22, 54 26, 62 44 C 68 58, 92 54, 90 68"
            stroke="#B49FCA"
            strokeWidth="1.25"
            strokeDasharray="3.5 5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.35 }}
            whileInView={{ pathLength: 1, opacity: 0.85 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
          />
          <circle cx="62" cy="44" r="2.2" fill="#E6B8C4" opacity="0.85" />
          <circle cx="90" cy="66" r="2" fill="#C4B0DA" opacity="0.8" />
        </motion.svg>

        {/* Whispered transition line flanked by delicate swaying botanical sprigs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="my-1 flex items-center justify-center gap-2 sm:gap-5"
        >
          <div className="animate-gentle-sway shrink-0 opacity-80">
            <BotanicalIllustration
              motif="eucalyptus"
              className="h-8 w-8 -rotate-18 sm:h-12 sm:w-12"
            />
          </div>

          <p className="font-hand text-center text-[1.15rem] leading-snug tracking-wide text-[#8A75A8] sm:text-2xl">
            and just like that, the moment comes alive…
          </p>

          <div
            className="animate-gentle-sway shrink-0 opacity-80"
            style={{ animationDelay: '-2.4s' }}
          >
            <BotanicalIllustration
              motif="forget-me-not"
              className="h-8 w-8 rotate-14 sm:h-12 sm:w-12"
            />
          </div>
        </motion.div>

        {/* Lower flight trail leading smoothly down into Chapter Two */}
        <motion.svg
          viewBox="0 0 180 56"
          fill="none"
          className="h-12 w-40 overflow-visible sm:h-14 sm:w-44"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.path
            d="M90 0 C 90 16, 122 20, 114 36 C 108 48, 90 44, 90 56"
            stroke="#C999AA"
            strokeWidth="1.25"
            strokeDasharray="3.5 5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.35 }}
            whileInView={{ pathLength: 1, opacity: 0.85 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.25, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          />
          <circle cx="114" cy="36" r="2.2" fill="#E8C299" opacity="0.85" />
          <circle cx="90" cy="54" r="2.2" fill="#D4A6B8" opacity="0.8" />
        </motion.svg>
      </div>
    </div>
  );
};
