import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Lock, MailOpen, Sparkles, X } from 'lucide-react';
import type { AppreciationCardItem, EasterEggItem } from '../config/birthdayContent';
import { CardStoryIllustration, EasterEggStampIcon } from './ScrapbookIllustrations';

gsap.registerPlugin(ScrollTrigger);

interface Section3ScrapbookProps {
  chapterLabel: string;
  heading: string;
  subheading: string;
  cards: AppreciationCardItem[];
  easterEggs: EasterEggItem[];
  botanicalArtSrc: string;
  hiddenEnvelope: {
    teaserLabel: string;
    unlockedTeaserLabel: string;
    salutation: string;
    body: string[];
    signOff: string;
  };
}

/**
 * Interactive Keepsake Letters & Margin Easter Eggs Chapter.
 * 1. Initially each of the 5 cards appears as a folded handmade letter showing ONLY its number, title & small illustration.
 * 2. Clicking unfolds it like a handwritten letter, revealing the personal note alongside an animated story illustration.
 * 3. Four playful personal Easter eggs (The Narmuuu Effect, The Project Girl, The Halwa Moment, The Idiot Certificate)
 *    are tucked organically into the scrapbook margins.
 * 4. Reading all 5 letters unseals a final keepsake letter.
 */
export const Section3Scrapbook: React.FC<Section3ScrapbookProps> = ({
  chapterLabel,
  heading,
  subheading,
  cards,
  easterEggs,
  botanicalArtSrc,
  hiddenEnvelope,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [foundEggIds, setFoundEggIds] = useState<string[]>([]);
  const [activeEgg, setActiveEgg] = useState<EasterEggItem | null>(null);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  const allFiveRead = cards.length > 0 && readIds.length >= cards.length;

  // Close open modal on ESC
  useEffect(() => {
    if (!envelopeOpen && !activeEgg) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEnvelopeOpen(false);
        setActiveEgg(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [envelopeOpen, activeEgg]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current || !cardsContainerRef.current) return;

    const ctx = gsap.context(() => {
      const noteEls = cardsContainerRef.current?.querySelectorAll<HTMLElement>('[data-scrapbook-note]');
      if (!noteEls) return;

      noteEls.forEach((el, idx) => {
        const fromX = window.innerWidth < 768 ? 0 : idx % 2 === 0 ? -24 : 24;
        gsap.fromTo(
          el,
          { opacity: 0, y: 38, x: fromX },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [cards.length]);

  const toggleCard = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const openEasterEgg = (egg: EasterEggItem) => {
    setActiveEgg(egg);
    setFoundEggIds((prev) => (prev.includes(egg.id) ? prev : [...prev, egg.id]));
  };

  const getEggForCardIndex = (idx: number) =>
    easterEggs.find((egg) => egg.anchorAfterIndex === idx);

  return (
    <section
      ref={sectionRef}
      id="section-appreciation"
      aria-label="Little Things Noticed About You"
      className="paper-grain relative w-full overflow-hidden px-4 pt-16 pb-28 sm:px-8 sm:pt-24 md:pt-28 md:pb-44"
      style={{
        background:
          'linear-gradient(180deg, #F9F4EE 0%, #FBF7F1 76%, #EFE7F0 91%, #28213D 100%)',
      }}
    >
      {/* Subtle pressed watercolor botanical backdrop blended cleanly into the cotton paper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-1/2 w-[920px] max-w-[125vw] -translate-x-1/2 opacity-[0.16]"
      >
        <img
          src={botanicalArtSrc}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-auto w-full object-contain mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Editorial Chapter Header */}
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs tracking-[0.22em] text-[#8D79AE] uppercase">
            {chapterLabel}
          </p>
          <h2 className="mt-3 font-serif text-[1.95rem] leading-tight font-normal text-[#2E282A] sm:mt-4 sm:text-5xl">
            {heading}
          </h2>
          <p className="mt-2.5 font-hand text-[1.4rem] text-[#6E8870] sm:mt-3 sm:text-[1.7rem]">
            {subheading}
          </p>
        </div>

        {/* Winding Scrapbook Thread + Five Interactive Folded Letters + Margin Easter Eggs */}
        <div ref={cardsContainerRef} className="relative mt-10 sm:mt-16">
          {/* Delicate winding dashed ink line behind letters on medium+ screens */}
          <svg
            aria-hidden="true"
            viewBox="0 0 600 1280"
            preserveAspectRatio="none"
            className="pointer-events-none absolute top-0 left-1/2 hidden h-full w-[520px] -translate-x-1/2 md:block"
          >
            <path
              d="M210 30 C130 160, 440 240, 390 390 C340 530, 140 590, 210 740 C275 880, 440 930, 340 1100 C295 1175, 290 1220, 300 1260"
              fill="none"
              stroke="#C8B6CB"
              strokeWidth="1.4"
              strokeDasharray="6 9"
              strokeLinecap="round"
              opacity="0.65"
            />
          </svg>

          <div className="relative z-10 flex flex-col gap-6 md:gap-8">
            {cards.map((card, index) => {
              const isExpanded = expandedIds.includes(card.id);
              const isRead = readIds.includes(card.id);
              const marginEgg = getEggForCardIndex(index);
              const eggFound = marginEgg ? foundEggIds.includes(marginEgg.id) : false;

              return (
                <div
                  key={card.id}
                  data-scrapbook-note
                  className="relative flex w-full flex-col items-center md:block"
                >
                  {/* Main Folded Letter Card */}
                  <div className={`w-full md:max-w-[520px] ${card.offsetClass}`}>
                    <button
                      type="button"
                      onClick={() => toggleCard(card.id)}
                      aria-expanded={isExpanded}
                      className="group relative block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8D79AE]"
                    >
                      {/* Translucent Pastel Washi Tape */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-2.5 left-1/2 z-20 h-5 w-22 -translate-x-1/2 shadow-[0_1px_2px_rgba(46,40,42,0.06)] transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: card.tapeTint,
                          transform: `translateX(-50%) rotate(${index % 2 === 0 ? -3 : 3}deg)`,
                        }}
                      />

                      {/* Folded Handmade Cotton-Paper Letter */}
                      <article
                        className="relative overflow-hidden rounded-[8px] border border-[#2E282A]/9 shadow-[0_14px_34px_-16px_rgba(88,70,78,0.16)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_20px_42px_-18px_rgba(88,70,78,0.22)]"
                        style={{
                          backgroundColor: card.paperTint,
                          transform: isExpanded ? 'rotate(0deg)' : `rotate(${card.rotation}deg)`,
                        }}
                      >
                        {/* Subtle envelope fold V-crease visible when closed */}
                        <svg
                          viewBox="0 0 480 34"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                          className={`pointer-events-none absolute top-0 left-0 h-8 w-full transition-opacity duration-500 ${
                            isExpanded ? 'opacity-20' : 'opacity-65'
                          }`}
                        >
                          <path
                            d="M0 0 L240 28 L480 0"
                            fill="none"
                            stroke="#D8C9C3"
                            strokeWidth="1"
                          />
                        </svg>

                        {/* FULL-WIDTH LETTER CONTENT (No icons squeezing the text) */}
                        <div className="relative px-5 pt-5 pb-4 sm:px-8 sm:pt-7 sm:pb-6">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="font-serif text-xs tracking-[0.2em] text-[#9A8798]">
                                0{index + 1}
                              </span>
                              {isRead && (
                                <span
                                  aria-label="Letter opened"
                                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#DCE9DB] text-[#5B775D]"
                                >
                                  <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                                </span>
                              )}
                            </div>

                            <span
                              aria-hidden="true"
                              className="inline-block h-2.5 w-2.5 rounded-full transition-transform duration-300 group-hover:scale-125"
                              style={{ backgroundColor: card.sealTint }}
                            />
                          </div>

                          <h3 className="mt-1.5 font-hand text-[1.75rem] leading-tight font-medium text-[#2E282A] sm:text-[2.15rem]">
                            {card.title}
                          </h3>

                          {/* Unfolding Handwritten Letter Interior (Full Card Width) */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                key="letter-interior"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }}
                                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                  className="mt-3.5 border-t border-dashed border-[#D8C9DF] pt-3.5 sm:mt-4 sm:pt-4"
                                >
                                  <p className="font-serif text-sm italic tracking-wide text-[#8A769F] sm:text-[0.95rem]">
                                    {card.message}
                                  </p>

                                  <p className="mt-2.5 font-serif text-[1.03rem] leading-relaxed text-[#352E31] sm:mt-3 sm:text-[1.18rem]">
                                    “{card.keepsakeNote}”
                                  </p>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Quiet Fold Action Hint */}
                          <div className="mt-3.5 flex items-center justify-between border-t border-[#2E282A]/5 pt-2.5 text-xs text-[#85777B]">
                            <span>
                              {isExpanded
                                ? 'Fold letter back'
                                : isRead
                                  ? 'Open letter again'
                                  : 'Tap to unfold letter'}
                            </span>
                            <span aria-hidden="true" className="font-serif text-sm text-[#B78FA0]">
                              {isExpanded ? '−' : '+'}
                            </span>
                          </div>
                        </div>
                      </article>
                    </button>
                  </div>

                  {/* Desktop Hidden Margin Easter Egg Stamp tucked gently in the open opposite margin */}
                  {marginEgg && (
                    <div
                      className={`hidden md:block md:absolute md:top-1/2 md:-translate-y-1/2 ${
                        marginEgg.side === 'left'
                          ? 'md:left-4 lg:left-8'
                          : 'md:right-4 lg:right-8'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openEasterEgg(marginEgg)}
                        aria-label={`Discover hidden margin note: ${marginEgg.title}`}
                        className="group flex cursor-pointer flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-all duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D79AE]"
                        style={{
                          transform: `rotate(${marginEgg.side === 'left' ? -5 : 5}deg)`,
                        }}
                      >
                        <div className="relative flex h-15 w-15 items-center justify-center rounded-full border border-dashed border-[#C7B3CD]/80 bg-[#FFFDF9]/85 shadow-[0_8px_22px_-10px_rgba(92,72,98,0.22)] transition-all duration-300 group-hover:scale-108 group-hover:border-[#9E82B8] group-hover:bg-[#FFFDF9]">
                          <EasterEggStampIcon kind={marginEgg.kind} className="h-11 w-11" />
                          {eggFound && (
                            <span
                              aria-hidden="true"
                              className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DCE9DB] text-[#5B775D] shadow-xs"
                            >
                              <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                            </span>
                          )}
                        </div>
                        <span className="font-hand text-base text-[#7F6E8B] transition-colors group-hover:text-[#2E282A]">
                          {marginEgg.marginLabel}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Margin Easter Eggs Row (so mobile readers can easily discover all 4 hidden trinkets) */}
          <div className="mt-10 md:hidden">
            <p className="text-center font-hand text-xl text-[#8A759E]">
              tucked quietly in the margins…
            </p>
            <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {easterEggs.map((egg) => {
                const found = foundEggIds.includes(egg.id);
                return (
                  <button
                    key={egg.id}
                    type="button"
                    onClick={() => openEasterEgg(egg)}
                    className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-[#CDB9D3]/80 bg-[#FFFDF9]/80 px-3 py-3 text-center transition-all hover:bg-[#FFFDF9] focus-visible:outline-2 focus-visible:outline-[#8D79AE]"
                  >
                    <div className="relative">
                      <EasterEggStampIcon kind={egg.kind} className="h-10 w-10" />
                      {found && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DCE9DB] text-[#5B775D]">
                          <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                    <span className="font-hand text-base text-[#665B5E] group-hover:text-[#2E282A]">
                      {egg.marginLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* === ALL-5-READ UNLOCKABLE FINAL KEEPSAKE ENVELOPE === */}
          <div className="mt-14 flex flex-col items-center text-center sm:mt-20">
            {/* Delicate 5-dot reading progress trail */}
            <div
              aria-label={`${readIds.length} of ${cards.length} letters opened`}
              className="mb-5 flex items-center gap-2.5"
            >
              {cards.map((c) => {
                const done = readIds.includes(c.id);
                return (
                  <span
                    key={c.id}
                    className={`block rounded-full transition-all duration-500 ${
                      done
                        ? 'h-2.5 w-2.5 bg-[#C98FA1] shadow-[0_0_8px_rgba(201,143,161,0.55)]'
                        : 'h-2 w-2 bg-[#D3C4DA]/75'
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                if (allFiveRead) setEnvelopeOpen(true);
              }}
              disabled={!allFiveRead}
              aria-label={
                allFiveRead
                  ? 'Open unlocked final keepsake letter'
                  : `Read all ${cards.length} letters to unlock the final note (${readIds.length} of ${cards.length} opened)`
              }
              className={`group relative inline-flex flex-col items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8D79AE] ${
                allFiveRead ? 'cursor-pointer' : 'cursor-default opacity-80'
              }`}
            >
              <motion.div
                animate={
                  allFiveRead
                    ? { y: [0, -5, 0], scale: [1, 1.03, 1] }
                    : { y: 0, scale: 1 }
                }
                transition={
                  allFiveRead
                    ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                    : undefined
                }
                className={`relative flex h-20 w-32 items-center justify-center rounded-[7px] border transition-all duration-500 ${
                  allFiveRead
                    ? 'border-[#D49DAE] bg-[#FFFBF5] shadow-[0_16px_38px_-10px_rgba(168,118,144,0.34)] group-hover:-translate-y-1.5 group-hover:-rotate-1'
                    : 'border-[#C9B9B2]/75 bg-[#F6EFE7] shadow-[0_10px_24px_-10px_rgba(88,68,72,0.16)]'
                }`}
              >
                {/* Envelope flap lines */}
                <svg
                  viewBox="0 0 128 80"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <path
                    d="M3 4 L64 46 L125 4"
                    fill="none"
                    stroke={allFiveRead ? '#DFB4C1' : '#D5C3BA'}
                    strokeWidth="1.25"
                  />
                </svg>

                {/* Wax Seal: Locked -> Unlocked Glowing Seal */}
                <span
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-500 ${
                    allFiveRead
                      ? 'bg-[#D58EA2] text-[#FFFDF9] ring-4 ring-[#F4D2DC]/75 group-hover:scale-110'
                      : 'bg-[#C4B7BE] text-[#FAF7F4]'
                  }`}
                >
                  {allFiveRead ? (
                    <MailOpen className="h-4 w-4" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                </span>
              </motion.div>

              <div className="flex flex-col items-center gap-1">
                <span
                  className={`font-hand text-xl transition-colors sm:text-2xl ${
                    allFiveRead
                      ? 'text-[#73568D] group-hover:text-[#2E282A]'
                      : 'text-[#6F636B]'
                  }`}
                >
                  {allFiveRead ? hiddenEnvelope.unlockedTeaserLabel : hiddenEnvelope.teaserLabel}
                </span>
                {!allFiveRead && (
                  <span className="text-xs text-[#8A7E84]">
                    {readIds.length} of {cards.length} letters opened
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* === UNLOCKED FINAL LETTER MODAL === */}
      <AnimatePresence>
        {envelopeOpen && (
          <motion.div
            key="envelope-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={() => setEnvelopeOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D1829]/60 px-5 backdrop-blur-xs"
          >
            <motion.div
              key="envelope-letter"
              role="dialog"
              aria-modal="true"
              aria-label="Unlocked final birthday note for Narmadha"
              initial={{ opacity: 0, y: 26, scale: 0.93, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="paper-grain relative max-h-[85svh] w-full max-w-md overflow-y-auto rounded-xl border border-[#DFD2C8] bg-[#FFFDF9] p-6 shadow-[0_28px_70px_rgba(20,16,32,0.36)] sm:p-10"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEnvelopeOpen(false);
                }}
                aria-label="Close note"
                className="absolute top-3 right-3 z-30 flex h-10 w-10 cursor-pointer touch-manipulation items-center justify-center rounded-full text-[#665B5E] transition-colors hover:bg-[#2E282A]/8 hover:text-[#2E282A] focus-visible:outline-2 focus-visible:outline-[#8D79AE] sm:top-3.5 sm:right-3.5"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="mb-4 flex items-center gap-3 pr-8 sm:mb-5">
                <CardStoryIllustration kind="narmadha" animated={true} className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
                <p className="font-hand text-2xl leading-snug text-[#8D79AE] sm:text-3xl">
                  {hiddenEnvelope.salutation}
                </p>
              </div>

              <div className="space-y-4 font-serif text-lg leading-relaxed text-[#2E282A] sm:text-xl">
                {hiddenEnvelope.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className={
                      i === hiddenEnvelope.body.length - 1
                        ? 'italic text-[#5D4970]'
                        : undefined
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-7 border-t border-dashed border-[#DFD0E6] pt-4">
                <p className="font-hand text-3xl text-[#6E8870]">
                  {hiddenEnvelope.signOff}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === MARGIN EASTER EGG POPOVER / CERTIFICATE MODAL === */}
      <AnimatePresence>
        {activeEgg && (
          <motion.div
            key="egg-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={() => setActiveEgg(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D1829]/55 px-5 backdrop-blur-xs"
          >
            <motion.div
              key={activeEgg.id}
              role="dialog"
              aria-modal="true"
              aria-label={activeEgg.title}
              initial={{ opacity: 0, y: 20, scale: 0.92, rotate: activeEgg.isCertificate ? -1.2 : 1 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className={`paper-grain relative max-h-[85svh] w-full max-w-md overflow-y-auto rounded-xl bg-[#FFFDF9] p-6 shadow-[0_28px_70px_rgba(20,16,32,0.34)] sm:p-9 ${
                activeEgg.isCertificate
                  ? 'border-2 border-[#D7B98A] text-center'
                  : 'border border-[#DDD0D8] text-left'
              }`}
            >
              {/* Inner ceremonial double frame for the playful Idiot Certificate */}
              {activeEgg.isCertificate && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-2.5 rounded-lg border border-dashed border-[#D7B98A]/70"
                />
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveEgg(null);
                }}
                aria-label="Close hidden note"
                className="absolute top-3 right-3 z-30 flex h-10 w-10 cursor-pointer touch-manipulation items-center justify-center rounded-full text-[#665B5E] transition-colors hover:bg-[#2E282A]/8 hover:text-[#2E282A] focus-visible:outline-2 focus-visible:outline-[#8D79AE] sm:top-3.5 sm:right-3.5"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {activeEgg.isCertificate ? (
                <div className="relative z-10 flex flex-col items-center py-2">
                  <EasterEggStampIcon kind="certificate" className="h-14 w-14 sm:h-16 sm:w-16" />
                  <p className="mt-2 text-[11px] tracking-[0.24em] text-[#A48453] uppercase">
                    Official Birthday Award
                  </p>
                  <h3 className="mt-1.5 font-serif text-2xl font-medium text-[#2E282A] sm:text-3xl">
                    {activeEgg.title}
                  </h3>
                  <p className="mt-2 font-hand text-2xl text-[#8D79AE]">
                    Proudly presented to Narmadha
                  </p>
                  <p className="mt-4 rounded-lg bg-[#FAF5EC] px-4 py-3.5 font-serif text-base leading-relaxed italic text-[#362E32] sm:px-5 sm:py-4 sm:text-xl">
                    “{activeEgg.body}”
                  </p>
                  {activeEgg.footnote && (
                    <p className="mt-5 inline-flex items-center gap-1.5 text-xs tracking-wide text-[#85777B]">
                      <Sparkles className="h-3.5 w-3.5 text-[#C99B58]" />
                      <span>{activeEgg.footnote}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="flex items-center gap-3 pr-8">
                    <EasterEggStampIcon kind={activeEgg.kind} className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
                    <div>
                      <p className="text-[11px] tracking-[0.2em] text-[#9A85B0] uppercase">
                        Little Margin Note
                      </p>
                      <h3 className="font-hand text-2xl leading-tight text-[#2E282A] sm:text-3xl">
                        {activeEgg.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-5 font-serif text-lg leading-relaxed text-[#352E31] sm:text-xl">
                    {activeEgg.body}
                  </p>

                  {activeEgg.footnote && (
                    <p className="mt-5 border-t border-dashed border-[#DFD2E6] pt-3.5 font-hand text-xl text-[#6E8870]">
                      {activeEgg.footnote}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
