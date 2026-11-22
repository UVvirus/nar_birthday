import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BotanicalIllustration, FloatingPetalsLayer } from './BotanicalIllustrations';

gsap.registerPlugin(ScrollTrigger);

interface Section2AnimatedWorldProps {
  chapterLabel: string;
  heading: string;
  message: string;
  footnote: string;
  portrait2DSrc: string;
  character3DSrc: string;
  character3DVideoSrc: string | null;
}

// Keep subtle sparkles strictly along the outer floral edges so her face and outfit stay completely clear
const SPARKLES = [
  { left: '10%', top: '14%', size: 3.5, delay: '0s', dur: '3.8s' },
  { left: '14%', top: '48%', size: 3, delay: '1.2s', dur: '4.4s' },
  { left: '11%', top: '78%', size: 3.5, delay: '0.7s', dur: '4.0s' },
  { left: '88%', top: '16%', size: 3.5, delay: '1.6s', dur: '4.2s' },
  { left: '90%', top: '54%', size: 3, delay: '0.9s', dur: '3.6s' },
  { left: '86%', top: '82%', size: 3.5, delay: '2.0s', dur: '4.3s' },
];

export const Section2AnimatedWorld: React.FC<Section2AnimatedWorldProps> = ({
  chapterLabel,
  heading,
  message,
  footnote,
  portrait2DSrc,
  character3DSrc,
  character3DVideoSrc,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerBlockRef = useRef<HTMLDivElement | null>(null);
  const stageCardRef = useRef<HTMLDivElement | null>(null);
  const textBlockRef = useRef<HTMLDivElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imgError, setImgError] = useState(false);
  const [mediaAspect, setMediaAspect] = useState<number>(character3DVideoSrc ? 9 / 16 : 4 / 3);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    setImgError(false);
    if (!character3DVideoSrc) {
      setMediaAspect(4 / 3);
    }
  }, [character3DSrc, character3DVideoSrc]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !character3DVideoSrc) return;
    vid.muted = true;
    vid.play().catch(() => {});
  }, [character3DVideoSrc]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (headerBlockRef.current) {
        const headerItems = headerBlockRef.current.querySelectorAll('[data-header-reveal]');
        gsap.fromTo(
          headerItems,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerBlockRef.current,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (stageCardRef.current) {
        gsap.fromTo(
          stageCardRef.current,
          { y: 28, scale: 0.96, opacity: 0.65 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 86%',
              end: 'top 36%',
              scrub: 0.6,
            },
          }
        );
      }

      if (textBlockRef.current) {
        const items = textBlockRef.current.querySelectorAll('[data-reveal]');
        gsap.fromTo(
          items,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.16,
            duration: 0.95,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: textBlockRef.current,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-ny * 5).toFixed(2)),
      ry: Number((nx * 6).toFixed(2)),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  // Split message softly into rhythmic phrases for poetic visual pacing
  const messagePhrases = React.useMemo(() => {
    const parts = message.split(/(?<=\.)\s+/);
    return parts.length > 1 ? parts : [message];
  }, [message]);

  return (
    <section
      ref={sectionRef}
      id="section-world"
      aria-label="Her Animated World"
      className="relative w-full overflow-hidden px-5 pt-4 pb-16 sm:px-8 sm:pt-8 md:pt-10 md:pb-24"
      style={{
        background:
          'linear-gradient(180deg, #F8F1F4 0%, #F6EEF3 28%, #F3ECF7 68%, #F9F4EE 100%)',
      }}
    >
      {/* Ambient floating petals & morning glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 22% 38%, rgba(246, 219, 196, 0.34) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(213, 200, 232, 0.32) 0%, transparent 48%)',
        }}
      />
      <FloatingPetalsLayer tone="day" count={12} />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Chapter Header Centered Above the Video */}
        <div ref={headerBlockRef} className="mb-7 text-center sm:mb-12">
          <p
            data-header-reveal
            className="text-xs tracking-[0.22em] text-[#8D79AE] uppercase"
          >
            {chapterLabel}
          </p>

          <h2
            data-header-reveal
            className="mt-2.5 font-serif text-[1.85rem] leading-tight font-normal text-[#2E282A] sm:mt-3 sm:text-4xl lg:text-[2.75rem]"
          >
            {heading}
          </h2>
        </div>

        {/* Two-column cinematic balance on desktop */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
          {/* Left / Primary Visual Anchor: Animated Character Dancing in Pastel Flower Garden */}
          <div className={mediaAspect < 0.8 ? 'flex justify-center lg:col-span-6' : 'lg:col-span-7'}>
            <div
              ref={stageCardRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className={`relative mx-auto ${
                mediaAspect < 0.8 ? 'flex justify-center' : 'w-full max-w-[660px]'
              }`}
              style={{ perspective: '1200px' }}
            >
              {/* Soft outer pastel framing halo */}
              <div
                className={`relative overflow-hidden rounded-[24px] bg-[#F5EAEF] shadow-[0_24px_60px_-20px_rgba(104,84,114,0.22)] transition-transform duration-300 ease-out sm:rounded-[32px] ${
                  mediaAspect < 0.8 ? '' : 'w-full'
                }`}
                style={{
                  aspectRatio: `${mediaAspect}`,
                  width:
                    mediaAspect < 0.8
                      ? `min(80vw, calc(58svh * ${mediaAspect}), ${Math.round(540 * mediaAspect)}px)`
                      : undefined,
                  transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Animated Character Layer (pre-rendered looping dance video OR living character render) */}
                {character3DVideoSrc ? (
                  <video
                    ref={videoRef}
                    src={character3DVideoSrc}
                    poster={portrait2DSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      if (v.videoWidth > 0 && v.videoHeight > 0) {
                        setMediaAspect(v.videoWidth / v.videoHeight);
                      }
                    }}
                    className="h-full w-full object-cover"
                    aria-label="Animated character dancing gracefully in a pastel flower garden"
                  />
                ) : !imgError ? (
                  <img
                    src={character3DSrc}
                    alt="3D animated character dancing gracefully in a sunlit pastel flower garden"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={() => setImgError(true)}
                    className="animate-garden-dance h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F7E6EC] via-[#FBF5EF] to-[#E9E0F5] p-8 text-center">
                    <BotanicalIllustration motif="peach-blossom" className="h-20 w-20" />
                    <p className="mt-4 font-serif text-xl text-[#4B4145]">
                      3D Character Garden Stage
                    </p>
                  </div>
                )}

                {/* Warm Golden Afternoon Sunbeams */}
                <div
                  aria-hidden="true"
                  className="animate-sunbeam pointer-events-none absolute -top-12 -left-16 h-[150%] w-2/3"
                  style={{
                    background:
                      'linear-gradient(108deg, transparent 15%, rgba(255, 245, 224, 0.34) 44%, rgba(255, 232, 200, 0.14) 64%, transparent 82%)',
                  }}
                />

                {/* Drifting Sunlit Firefly & Pollen Sparkles */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                  {SPARKLES.map((s, idx) => (
                    <span
                      key={idx}
                      className="absolute rounded-full bg-[#FFF7DF]"
                      style={{
                        left: s.left,
                        top: s.top,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        boxShadow: '0 0 12px 3px rgba(255, 238, 192, 0.85)',
                        animation: `candleFlicker ${s.dur} ease-in-out ${s.delay} infinite`,
                      }}
                    />
                  ))}
                </div>

                {/* Soft vignette edge blending into pastel surround */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/55"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Poetic Birthday Narrative */}
          <div
            ref={textBlockRef}
            className={`text-center lg:text-left ${
              mediaAspect < 0.8 ? 'lg:col-span-6' : 'lg:col-span-5'
            }`}
          >
            <div className="space-y-5">
              {messagePhrases.map((phrase, idx) => (
                <p
                  key={idx}
                  data-reveal
                  className={`font-serif leading-relaxed text-[#2E282A] ${
                    idx === 0
                      ? 'text-2xl italic text-[#7B6596] sm:text-[1.75rem]'
                      : 'text-xl text-[#3E3538] sm:text-2xl'
                  }`}
                >
                  {phrase}
                </p>
              ))}
            </div>

            <div
              data-reveal
              className="mt-8 border-t border-[#2E282A]/10 pt-5"
            >
              <p className="font-hand text-2xl leading-snug text-[#6E8870]">
                {footnote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
