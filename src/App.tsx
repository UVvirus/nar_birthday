/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_BIRTHDAY_CONTENT,
  type BirthdayContentConfig,
} from './config/birthdayContent';
import { usePianoAudio } from './hooks/usePianoAudio';
import { OpeningCurtain } from './components/OpeningCurtain';
import { Section1Portrait } from './components/Section1Portrait';
import { ChapterBridge } from './components/ChapterBridge';
import { Section2AnimatedWorld } from './components/Section2AnimatedWorld';
import { Section3Scrapbook } from './components/Section3Scrapbook';
import { Section4FinalWish } from './components/Section4FinalWish';
import { RecurringButterfly } from './components/RecurringButterfly';
import { FloatingMusicControl } from './components/FloatingMusicControl';
import { CustomizeDrawer } from './components/CustomizeDrawer';

const CHAPTER_ANCHORS = [
  { id: 'section-portrait', label: 'Portrait' },
  { id: 'section-world', label: 'Her World' },
  { id: 'section-appreciation', label: 'Keepsakes' },
  { id: 'section-wish', label: 'The Wish' },
];

export default function App() {
  const [content, setContent] = useState<BirthdayContentConfig>(DEFAULT_BIRTHDAY_CONTENT);
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [butterflyAwakened, setButterflyAwakened] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isEvening, setIsEvening] = useState(false);

  const cakePerchRef = useRef<HTMLDivElement | null>(null);

  const piano = usePianoAudio(content.assets.customAudioUrl);

  const handleStartWithMusic = useCallback(() => {
    setExperienceStarted(true);
    piano.play();
  }, [piano]);

  const handleSketchComplete = useCallback(() => {
    setButterflyAwakened(true);
  }, []);

  const handleResetDefaults = useCallback(() => {
    setContent(DEFAULT_BIRTHDAY_CONTENT);
  }, []);

  // Track active section and twilight theme transitions cleanly on scroll
  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      const sectionIds = CHAPTER_ANCHORS.map((c) => c.id);
      let currentIdx = 0;

      sectionIds.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh * 0.45) {
          currentIdx = idx;
        }
      });

      setActiveChapter(currentIdx);

      const wishEl = document.getElementById('section-wish');
      if (wishEl) {
        const wishTop = wishEl.getBoundingClientRect().top;
        setIsEvening(wishTop <= vh * 0.6);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Completely prevent scrolling & scrollbars while the opening starry intro is active
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (!experienceStarted) {
      window.scrollTo(0, 0);
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';
      body.style.overscrollBehavior = 'none';
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
      html.style.overscrollBehavior = '';
      body.style.overscrollBehavior = '';
    }
    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
      html.style.overscrollBehavior = '';
      body.style.overscrollBehavior = '';
    };
  }, [experienceStarted]);

  return (
    <div
      className={`relative w-full ${
        experienceStarted ? 'min-h-screen' : 'h-[100dvh] overflow-hidden'
      }`}
    >
      {/* Opening Curtain (initiates user-permitted continuous piano soundtrack) */}
      <OpeningCurtain
        visible={!experienceStarted}
        recipientName={content.recipientName}
        title={content.openingTitle}
        subtitle={content.openingSubtitle}
        onStartWithMusic={handleStartWithMusic}
      />

      {/* Quiet Vertical Chapter Progress Rail (Desktop Only) */}
      {experienceStarted && (
        <nav
          aria-label="Story chapters"
          className="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex"
        >
          {CHAPTER_ANCHORS.map((chapter, idx) => {
            const isActive = activeChapter === idx;
            return (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                aria-current={isActive ? 'location' : undefined}
                className="group flex items-center gap-2.5 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8D79AE]"
              >
                <span
                  className={`text-[11px] tracking-[0.14em] uppercase transition-all duration-300 ${
                    isActive
                      ? isEvening
                        ? 'opacity-100 text-[#F7D794]'
                        : 'opacity-100 text-[#2E282A]'
                      : isEvening
                        ? 'opacity-0 text-[#D5C8E8] group-hover:opacity-80'
                        : 'opacity-0 text-[#665B5E] group-hover:opacity-80'
                  }`}
                >
                  {chapter.label}
                </span>
                <span
                  className={`block h-[1.5px] rounded-full transition-all duration-300 ${
                    isActive
                      ? isEvening
                        ? 'w-6 bg-[#F7D794]'
                        : 'w-6 bg-[#8D79AE]'
                      : isEvening
                        ? 'w-2.5 bg-white/30 group-hover:w-4 group-hover:bg-white/60'
                        : 'w-2.5 bg-[#2E282A]/22 group-hover:w-4 group-hover:bg-[#8D79AE]/60'
                  }`}
                />
              </a>
            );
          })}
        </nav>
      )}

      {/* Recurring Pastel Butterfly Companion */}
      <RecurringButterfly
        awakened={butterflyAwakened}
        cakePerchRef={cakePerchRef}
      />

      {/* Main Four-Chapter Animated Short Film */}
      <main>
        {/* SECTION 1: The Portrait Comes to Life */}
        <Section1Portrait
          started={experienceStarted}
          chapterLabel={content.section1.chapterLabel}
          message={content.section1.message}
          scrollPrompt={content.section1.scrollPrompt}
          portraitSrc={content.assets.portrait2D}
          isCustomPortrait={content.assets.isCustomPortrait}
          onSketchComplete={handleSketchComplete}
        />

        {/* BOTANICAL & BUTTERFLY FLIGHT BRIDGE */}
        <ChapterBridge />

        {/* SECTION 2: Her Animated World */}
        <Section2AnimatedWorld
          chapterLabel={content.section2.chapterLabel}
          heading={content.section2.heading}
          message={content.section2.message}
          footnote={content.section2.footnote}
          portrait2DSrc={content.assets.portrait2D}
          character3DSrc={content.assets.character3DImage}
          character3DVideoSrc={content.assets.character3DVideo}
        />

        {/* SECTION 3: Little Things Noticed About You */}
        <Section3Scrapbook
          chapterLabel={content.section3.chapterLabel}
          heading={content.section3.heading}
          subheading={content.section3.subheading}
          cards={content.section3.cards}
          easterEggs={content.section3.easterEggs}
          botanicalArtSrc={content.assets.scrapbookBotanical}
          hiddenEnvelope={content.hiddenEnvelope}
        />

        {/* SECTION 4: The Final Birthday Wish */}
        <Section4FinalWish
          chapterLabel={content.section4.chapterLabel}
          wishBody={content.section4.wishBody}
          closingHeadline={content.section4.closingHeadline}
          wishButtonLabel={content.section4.wishButtonLabel}
          wishMadeMessage={content.section4.wishMadeMessage}
          cakeImageSrc={content.assets.eveningCake}
          cakePerchRef={cakePerchRef}
        />
      </main>

      {/* Minimal Floating Piano Control & Live Waveform Visualizer */}
      {experienceStarted && (
        <FloatingMusicControl
          isPlaying={piano.isPlaying}
          trackTitle={content.assets.audioTrackTitle}
          isEvening={isEvening}
          onTogglePlay={piano.toggle}
          getFrequencyBars={piano.getFrequencyBars}
          onOpenCustomize={() => setCustomizeOpen(true)}
        />
      )}

      {/* Discreet Personalization & Media Replacement Drawer */}
      <CustomizeDrawer
        open={customizeOpen}
        content={content}
        onClose={() => setCustomizeOpen(false)}
        onUpdateContent={setContent}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
