import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUp, Sparkles } from 'lucide-react';
import { FloatingPetalsLayer } from './BotanicalIllustrations';

gsap.registerPlugin(ScrollTrigger);

interface Section4FinalWishProps {
  chapterLabel: string;
  wishBody: string;
  closingHeadline: string;
  wishButtonLabel: string;
  wishMadeMessage: string;
  cakeImageSrc: string;
  cakePerchRef: React.RefObject<HTMLDivElement | null>;
}

interface StarParticle {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  isFirefly: boolean;
  vx: number;
  vy: number;
}

/**
 * Section 4: Cinematic Evening Sky & Birthday Cake Finale.
 * - Live HTML5 Canvas twinkling twilight starfield & drifting warm fireflies.
 * - Painterly artisan pastel birthday cake emerging softly into evening light.
 * - Real-time flickering candle glow halos + interactive "Make a wish" blow-out moment.
 * - Hosts the exact landing perch for the recurring butterfly.
 */
export const Section4FinalWish: React.FC<Section4FinalWishProps> = ({
  chapterLabel,
  wishBody,
  closingHeadline,
  wishButtonLabel,
  wishMadeMessage,
  cakeImageSrc,
  cakePerchRef,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cakeBlockRef = useRef<HTMLDivElement | null>(null);
  const messageBlockRef = useRef<HTMLDivElement | null>(null);

  const [candlesLit, setCandlesLit] = useState(true);
  const [wishBurstCount, setWishBurstCount] = useState(0);
  const [imgError, setImgError] = useState(false);

  // Live canvas evening stars & drifting golden fireflies
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let width = 0;
    let height = 0;
    let particles: StarParticle[] = [];

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = width < 640 ? 64 : 115;
      particles = Array.from({ length: starCount }, (_, i) => {
        const isFirefly = i % 7 === 0;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: isFirefly ? 1.8 + Math.random() * 1.8 : 0.7 + Math.random() * 1.3,
          baseAlpha: isFirefly ? 0.55 : 0.25 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
          speed: isFirefly ? 0.8 + Math.random() * 0.8 : 0.5 + Math.random() * 1.4,
          isFirefly,
          vx: isFirefly ? (Math.random() - 0.5) * 0.24 : 0,
          vy: isFirefly ? -0.14 - Math.random() * 0.22 : 0,
        };
      });
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = (nowMs: number) => {
      const t = nowMs * 0.001;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (!prefersReducedMotion && p.isFirefly) {
          p.x += p.vx + Math.sin(t * 0.8 + p.phase) * 0.14;
          p.y += p.vy;
          if (p.y < -10) p.y = height + 10;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        const twinkle = prefersReducedMotion
          ? 1
          : 0.55 + 0.45 * Math.sin(t * p.speed + p.phase);
        const alpha = p.baseAlpha * twinkle;

        if (p.isFirefly) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          grad.addColorStop(0, `rgba(247, 215, 148, ${alpha.toFixed(3)})`);
          grad.addColorStop(0.5, `rgba(247, 215, 148, ${(alpha * 0.3).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(247, 215, 148, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(248, 242, 255, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    rafId = window.requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll-triggered cinematic reveal for cake and handwritten wish
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (cakeBlockRef.current) {
        gsap.fromTo(
          cakeBlockRef.current,
          { opacity: 0, y: 42, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.25,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cakeBlockRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (messageBlockRef.current) {
        const lines = messageBlockRef.current.querySelectorAll('[data-wish-reveal]');
        gsap.fromTo(
          lines,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.22,
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: messageBlockRef.current,
              start: 'top 84%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleToggleWish = () => {
    if (candlesLit) {
      setCandlesLit(false);
      setWishBurstCount((c) => c + 1);
    } else {
      setCandlesLit(true);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="section-wish"
      aria-label="The Final Birthday Wish"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-5 pt-20 pb-36 text-[#FAF4EC] sm:px-8 md:pt-28 md:pb-32"
      style={{
        background:
          'linear-gradient(180deg, #28213D 0%, #1C1730 34%, #151226 72%, #110F1F 100%)',
      }}
    >
      {/* Live Evening Starfield & Firefly Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Soft dusk lavender & warm candlelight horizon glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(247, 215, 148, 0.14) 0%, rgba(168, 149, 199, 0.08) 36%, transparent 66%)',
        }}
      />
      <FloatingPetalsLayer tone="dusk" count={7} />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <p className="text-xs tracking-[0.24em] text-[#D5C8E8]/85 uppercase">
          {chapterLabel}
        </p>

        {/* Birthday Cake Showcase with Flickering Candle Halos & Butterfly Landing Perch */}
        <div
          ref={cakeBlockRef}
          className="relative mt-6 flex w-full max-w-[290px] flex-col items-center sm:mt-8 sm:max-w-[390px] md:max-w-[430px]"
        >
          {/* Invisible anchor perch beside the upper-left pastel flowers of the cake where the recurring butterfly lands */}
          <div
            ref={cakePerchRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-[41%] left-[19%] z-30 h-4 w-4"
          />

          <button
            type="button"
            onClick={handleToggleWish}
            aria-label={candlesLit ? 'Blow out the birthday candles and make a wish' : 'Relight the birthday candles'}
            className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7D794]"
          >
            {!imgError ? (
              <img
                src={cakeImageSrc}
                alt="Pastel two-tier artisan birthday cake adorned with piped flowers and glowing taper candles under an evening sky"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover transition-all duration-1000"
                style={{
                  filter: candlesLit
                    ? 'brightness(1.03) saturate(1.04)'
                    : 'brightness(0.76) saturate(0.88)',
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#231D38] text-[#FAF4EC]">
                <span className="font-serif text-xl">Birthday Cake</span>
              </div>
            )}

            {/* Soft Radial Twilight Vignette seamlessly dissolving image edges into the evening sky */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, transparent 46%, rgba(22, 18, 38, 0.72) 74%, #18142B 98%)',
              }}
            />

            {/* Animated Volumetric Flickering Candle Glow Halos aligned over the three taper flames */}
            {candlesLit ? (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {[
                  { left: '44.8%', top: '23.2%', delay: '0s', width: '11%' },
                  { left: '50.1%', top: '20.4%', delay: '-0.7s', width: '13%' },
                  { left: '55.5%', top: '23.4%', delay: '-1.3s', width: '11%' },
                ].map((glow, idx) => (
                  <span
                    key={idx}
                    className="animate-candle-flicker absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: glow.left,
                      top: glow.top,
                      width: glow.width,
                      animationDelay: glow.delay,
                      background:
                        'radial-gradient(circle, rgba(255, 245, 210, 0.72) 0%, rgba(247, 200, 118, 0.34) 44%, transparent 74%)',
                      mixBlendMode: 'screen',
                    }}
                  />
                ))}
              </div>
            ) : (
              /* Soft dim veil over extinguished wicks + gentle rising smoke wisps */
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {[
                  { left: '44.8%', top: '23%' },
                  { left: '50.1%', top: '20.5%' },
                  { left: '55.5%', top: '23.2%' },
                ].map((pos, idx) => (
                  <React.Fragment key={`${wishBurstCount}-${idx}`}>
                    <span
                      className="absolute h-6 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1C1730]/82 blur-[2px]"
                      style={{ left: pos.left, top: pos.top }}
                    />
                    <span
                      className="animate-smoke-rise absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E6DFF2]/40 blur-[5px]"
                      style={{
                        left: pos.left,
                        top: pos.top,
                        animationDelay: `${idx * 0.14}s`,
                      }}
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
          </button>

          {/* Quiet Interactive Wish Action */}
          <div className="mt-3 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleToggleWish}
              className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full border border-[#F7D794]/35 bg-[#FAF4EC]/6 px-5 py-2 text-xs font-medium tracking-wide text-[#F7D794] transition-all duration-200 hover:border-[#F7D794]/65 hover:bg-[#F7D794]/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7D794] whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{candlesLit ? wishButtonLabel : 'Relight the candles'}</span>
            </button>

            <p
              className={`min-h-[24px] font-hand text-xl text-[#D5C8E8] transition-opacity duration-700 ${
                candlesLit ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {wishMadeMessage}
            </p>
          </div>
        </div>

        {/* Final Heartfelt Birthday Message & Handwritten Signature Reveal */}
        <div ref={messageBlockRef} className="mt-6 max-w-2xl px-1 sm:mt-8">
          <p
            data-wish-reveal
            className="font-serif text-[1.18rem] leading-relaxed tracking-[0.01em] text-[#F4ECE4]/95 sm:text-2xl md:text-[1.75rem]"
          >
            {wishBody}
          </p>

          <h2
            data-wish-reveal
            className="mt-6 font-hand text-[2.75rem] leading-tight font-medium tracking-wide text-[#F7D794] sm:mt-7 sm:text-6xl md:text-7xl"
            style={{
              textShadow: '0 4px 28px rgba(247, 215, 148, 0.28)',
            }}
          >
            {closingHeadline}
          </h2>

          {/* Delicate decorative horizontal divider */}
          <div
            data-wish-reveal
            aria-hidden="true"
            className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-[#D5C8E8]/45 to-transparent"
          />

          <div data-wish-reveal className="mt-8">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 text-xs tracking-[0.14em] text-[#D5C8E8]/75 uppercase transition-colors duration-200 hover:text-[#FAF4EC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7D794] whitespace-nowrap"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>Watch from the beginning</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
