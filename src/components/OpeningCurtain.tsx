import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music } from 'lucide-react';

interface OpeningCurtainProps {
  visible: boolean;
  recipientName: string;
  title: string;
  subtitle: string;
  onStartWithMusic: () => void;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  depth: number;
  hue: string;
  hasFlare: boolean;
}

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
}

interface CursorSparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
}

/**
 * Enchanted Starry Night Opening Curtain.
 * Renders a living midnight sky with twinkling stars, occasional shooting stars,
 * drifting golden fireflies, a glowing crescent moon, subtle pointer parallax,
 * and gentle stardust trails—dissolving into warm morning light when the piano begins.
 */
export const OpeningCurtain: React.FC<OpeningCurtainProps> = ({
  visible,
  recipientName,
  title,
  subtitle,
  onStartWithMusic,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const starColors = [
      '255, 250, 238', // warm pearl
      '248, 224, 178', // starlight champagne
      '224, 214, 252', // moonlit lavender
      '250, 220, 232', // faint rose star
      '214, 232, 255', // pale celestial blue
    ];

    const starCount = Math.min(165, Math.max(95, Math.floor((width * height) / 9200)));
    const stars: Star[] = Array.from({ length: starCount }, (_, i) => {
      const bright = i % 13 === 0;
      return {
        x: Math.random() * width,
        y: Math.random() * height * 0.9,
        radius: bright ? 1.5 + Math.random() * 1.1 : 0.55 + Math.random() * 1.1,
        baseAlpha: bright ? 0.72 + Math.random() * 0.25 : 0.25 + Math.random() * 0.55,
        twinkleSpeed: 0.0009 + Math.random() * 0.0022,
        phase: Math.random() * Math.PI * 2,
        depth: 0.35 + Math.random() * 0.95,
        hue: starColors[i % starColors.length],
        hasFlare: bright,
      };
    });

    const fireflies: Firefly[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: height * (0.48 + Math.random() * 0.48),
      vx: (Math.random() - 0.5) * 0.28,
      vy: -0.06 - Math.random() * 0.22,
      radius: 1.4 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
    }));

    const shootingStars: ShootingStar[] = [];
    const cursorSparkles: CursorSparkle[] = [];

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let lastSparkleAt = 0;
    let nextMeteorAt = performance.now() + 2400;

    const onPointerMove = (e: PointerEvent) => {
      const nx = e.clientX / Math.max(1, width) - 0.5;
      const ny = e.clientY / Math.max(1, height) - 0.5;
      targetParallaxX = nx * 24;
      targetParallaxY = ny * 16;

      if (!prefersReducedMotion) {
        const now = performance.now();
        if (now - lastSparkleAt > 42) {
          lastSparkleAt = now;
          cursorSparkles.push({
            x: e.clientX + (Math.random() - 0.5) * 10,
            y: e.clientY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -0.25 - Math.random() * 0.35,
            size: 1.2 + Math.random() * 1.6,
            life: 0,
            maxLife: 44 + Math.random() * 24,
          });
          if (cursorSparkles.length > 36) cursorSparkles.shift();
        }
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let rafId = 0;

    const drawFourPointStar = (x: number, y: number, r: number, alpha: number, rgb: string) => {
      ctx.save();
      ctx.strokeStyle = `rgba(${rgb}, ${alpha * 0.65})`;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(x - r * 3.8, y);
      ctx.lineTo(x + r * 3.8, y);
      ctx.moveTo(x, y - r * 3.8);
      ctx.lineTo(x, y + r * 3.8);
      ctx.stroke();
      ctx.restore();
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      parallaxX += (targetParallaxX - parallaxX) * 0.04;
      parallaxY += (targetParallaxY - parallaxY) * 0.04;

      // 1. Twinkling Stars with subtle parallax depth
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = prefersReducedMotion
          ? 0.85
          : 0.48 + 0.52 * Math.sin(now * s.twinkleSpeed + s.phase);
        const alpha = s.baseAlpha * twinkle;
        const sx = ((s.x - parallaxX * s.depth) % width + width) % width;
        const sy = s.y - parallaxY * s.depth * 0.65;

        if (s.hasFlare && alpha > 0.45) {
          drawFourPointStar(sx, sy, s.radius, alpha, s.hue);
        }

        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.radius * 3.2);
        glow.addColorStop(0, `rgba(${s.hue}, ${alpha})`);
        glow.addColorStop(0.45, `rgba(${s.hue}, ${alpha * 0.35})`);
        glow.addColorStop(1, `rgba(${s.hue}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, sy, s.radius * 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 253, 248, ${Math.min(1, alpha * 1.15)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.radius * 0.72, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Occasional Graceful Shooting Stars
      if (!prefersReducedMotion && now >= nextMeteorAt) {
        nextMeteorAt = now + 3400 + Math.random() * 3200;
        const startFromLeft = Math.random() > 0.35;
        const angle = startFromLeft
          ? 0.34 + Math.random() * 0.22
          : Math.PI - (0.34 + Math.random() * 0.22);
        const speed = 7.5 + Math.random() * 4.5;
        shootingStars.push({
          x: startFromLeft ? width * (0.08 + Math.random() * 0.45) : width * (0.55 + Math.random() * 0.38),
          y: height * (0.06 + Math.random() * 0.26),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          length: 95 + Math.random() * 70,
          life: 0,
          maxLife: 46 + Math.random() * 20,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const m = shootingStars[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life += 1;

        const progress = m.life / m.maxLife;
        const opacity = Math.sin(progress * Math.PI);
        const norm = Math.hypot(m.vx, m.vy) || 1;
        const tailX = m.x - (m.vx / norm) * m.length;
        const tailY = m.y - (m.vy / norm) * m.length;

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 250, 232, ${opacity * 0.95})`);
        grad.addColorStop(0.35, `rgba(232, 214, 255, ${opacity * 0.55})`);
        grad.addColorStop(1, 'rgba(232, 214, 255, 0)');

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 252, 240, ${opacity})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (m.life >= m.maxLife) {
          shootingStars.splice(i, 1);
        }
      }

      // 3. Drifting Warm Golden Fireflies near the midnight horizon
      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i];
        if (!prefersReducedMotion) {
          f.x += f.vx + Math.sin(now * 0.0008 + f.phase) * 0.16;
          f.y += f.vy + Math.cos(now * 0.0011 + f.phase) * 0.12;
          if (f.y < height * 0.32) {
            f.y = height * 0.98;
            f.x = Math.random() * width;
          }
          if (f.x < -12) f.x = width + 12;
          if (f.x > width + 12) f.x = -12;
        }

        const pulse = prefersReducedMotion
          ? 0.55
          : 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(now * 0.0024 + f.phase));
        const fx = f.x - parallaxX * 0.45;
        const fy = f.y - parallaxY * 0.35;

        const halo = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.radius * 5.2);
        halo.addColorStop(0, `rgba(255, 229, 158, ${pulse * 0.9})`);
        halo.addColorStop(0.4, `rgba(247, 206, 130, ${pulse * 0.32})`);
        halo.addColorStop(1, 'rgba(247, 206, 130, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(fx, fy, f.radius * 5.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Subtle Interactive Stardust Trail on Cursor Move
      for (let i = cursorSparkles.length - 1; i >= 0; i--) {
        const sp = cursorSparkles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life += 1;
        const alpha = (1 - sp.life / sp.maxLife) * 0.75;
        if (alpha <= 0) {
          cursorSparkles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(248, 228, 190, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * (1 - sp.life / (sp.maxLife * 1.4)), 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="opening-curtain"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-50 flex h-[100dvh] w-screen touch-none overscroll-none flex-col items-center justify-center overflow-hidden px-6 text-center"
          style={{
            background:
              'radial-gradient(ellipse 85% 70% at 50% 108%, #342552 0%, #1F183B 42%, #130F28 76%, #0B0819 100%)',
          }}
        >
          {/* Layer 1: Ethereal Pastel Cosmic Nebula Clouds */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 56% 42% at 20% 28%, rgba(154, 118, 206, 0.22) 0%, transparent 66%), radial-gradient(ellipse 52% 46% at 82% 24%, rgba(226, 165, 194, 0.16) 0%, transparent 64%), radial-gradient(ellipse 68% 40% at 52% 88%, rgba(235, 186, 152, 0.14) 0%, transparent 65%)',
            }}
          />

          {/* Layer 2: Live Starfield, Shooting Stars, Fireflies & Stardust Canvas */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {/* Layer 3: Luminous Crescent Moon with Soft Halo in Upper Right Sky */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute top-6 right-5 sm:top-12 sm:right-14 md:top-14 md:right-20"
          >
            <div className="relative flex items-center justify-center">
              {/* Outer lunar glow */}
              <div
                className="absolute h-28 w-28 rounded-full sm:h-44 sm:w-44"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 241, 204, 0.28) 0%, rgba(213, 198, 242, 0.12) 44%, transparent 72%)',
                }}
              />
              <svg
                width="68"
                height="68"
                viewBox="0 0 72 72"
                fill="none"
                className="relative h-11 w-11 drop-shadow-[0_0_18px_rgba(255,241,196,0.55)] sm:h-16 sm:w-16"
              >
                <defs>
                  <linearGradient id="moonGrad" x1="16" y1="10" x2="56" y2="62" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFBF0" />
                    <stop offset="60%" stopColor="#F9E7BE" />
                    <stop offset="100%" stopColor="#E6C994" />
                  </linearGradient>
                </defs>
                <path
                  d="M44.5 11.5C30.8 13.8 20.5 25.8 20.5 40.2C20.5 52.8 28.6 63.4 39.8 67.3C23.5 67.7 10 54.4 10 38C10 21.4 23.4 8 40 8C41.6 8 43.1 8.1 44.5 8.4V11.5Z"
                  fill="url(#moonGrad)"
                  transform="translate(8 -2) rotate(-14 36 36)"
                />
                {/* Tiny companion stars beside the crescent */}
                <circle cx="52" cy="22" r="1.4" fill="#FFF8E3" opacity="0.9" />
                <circle cx="58" cy="34" r="1" fill="#E3D7FA" opacity="0.75" />
              </svg>
            </div>
          </motion.div>

          {/* Layer 4: Delicate Starlight Constellation Arc Behind Center Title */}
          <svg
            aria-hidden="true"
            viewBox="0 0 680 340"
            fill="none"
            className="pointer-events-none absolute top-1/2 left-1/2 w-[92vw] max-w-[680px] -translate-x-1/2 -translate-y-1/2 opacity-45"
          >
            <motion.path
              d="M52 215 L146 128 L254 88 L358 58 L466 96 L568 154 L630 118"
              stroke="url(#constellationLine)"
              strokeWidth="0.9"
              strokeDasharray="3 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            />
            {[
              [52, 215, 2.2],
              [146, 128, 2.6],
              [254, 88, 2.1],
              [358, 58, 3.0],
              [466, 96, 2.3],
              [568, 154, 2.6],
              [630, 118, 2.0],
            ].map(([cx, cy, r], idx) => (
              <g key={idx}>
                <circle cx={cx} cy={cy} r={r * 2.6} fill="#F7D794" opacity="0.16" />
                <circle cx={cx} cy={cy} r={r} fill="#FFF8E7" opacity="0.9" />
              </g>
            ))}
            <defs>
              <linearGradient id="constellationLine" x1="52" y1="150" x2="630" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D5C8E8" stopOpacity="0" />
                <stop offset="25%" stopColor="#D5C8E8" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#F7D794" stopOpacity="0.85" />
                <stop offset="75%" stopColor="#ECC5CE" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#D5C8E8" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Layer 5: Dreamy Moonlit Rolling Horizon & Mist Silhouette */}
          <div aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 left-0 h-24 sm:h-44">
            <svg
              viewBox="0 0 1440 200"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#261D42" stopOpacity="0.58" />
                  <stop offset="100%" stopColor="#120D24" stopOpacity="0.92" />
                </linearGradient>
                <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18122E" stopOpacity="0.86" />
                  <stop offset="100%" stopColor="#0C091B" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d="M0 124 C 240 64, 520 156, 820 102 C 1060 58, 1260 112, 1440 84 L 1440 200 L 0 200 Z"
                fill="url(#hillBack)"
              />
              <path
                d="M0 152 C 320 110, 640 178, 980 128 C 1180 98, 1340 132, 1440 118 L 1440 200 L 0 200 Z"
                fill="url(#hillFront)"
              />
            </svg>
          </div>

          {/* Center Celestial Story Cover */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex w-full max-w-xl flex-col items-center px-3 pb-6 sm:px-4 sm:pb-0"
          >
            {/* Glowing Moonlit Butterfly Accent */}
            <motion.div
              aria-hidden="true"
              animate={{ y: [0, -6, 0], rotate: [-5, 2, -5] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-2.5 drop-shadow-[0_0_14px_rgba(232,208,255,0.55)] sm:mb-3"
            >
              <svg width="40" height="30" viewBox="0 0 40 32" fill="none" className="h-7 w-9 sm:h-8 sm:w-10">
                <path
                  d="M20 16 C14 7, 4 5, 3 13 C2 19, 10 20, 19 18 Z"
                  fill="#E8C6DF"
                  fillOpacity="0.9"
                  stroke="#FFF4DC"
                  strokeWidth="0.7"
                />
                <path
                  d="M20 16 C26 7, 36 5, 37 13 C38 19, 30 20, 21 18 Z"
                  fill="#D6C6F4"
                  fillOpacity="0.9"
                  stroke="#FFF4DC"
                  strokeWidth="0.7"
                />
                <path
                  d="M19 18 C13 20, 7 25, 11 28 C15 30, 18 25, 19.5 20 Z"
                  fill="#F3D2DF"
                  fillOpacity="0.82"
                />
                <path
                  d="M21 18 C27 20, 33 25, 29 28 C25 30, 22 25, 20.5 20 Z"
                  fill="#E2D5FA"
                  fillOpacity="0.82"
                />
                <ellipse cx="20" cy="17.5" rx="1.15" ry="4.5" fill="#FFF7E4" />
                <path d="M19.5 13.5 C18.5 10.5, 17 9.5, 16 9" stroke="#FFF7E4" strokeWidth="0.7" strokeLinecap="round" />
                <path d="M20.5 13.5 C21.5 10.5, 23 9.5, 24 9" stroke="#FFF7E4" strokeWidth="0.7" strokeLinecap="round" />
              </svg>
            </motion.div>

            <p
              className="font-hand text-[1.75rem] text-[#F5DCAB] sm:text-4xl"
              style={{ textShadow: '0 0 22px rgba(247, 215, 148, 0.35)' }}
            >
              For {recipientName}
            </p>

            <h1
              className="mt-2.5 font-serif text-[2.25rem] leading-[1.12] font-normal tracking-tight text-[#FBF8F3] sm:mt-3 sm:text-5xl md:text-6xl"
              style={{ textShadow: '0 6px 32px rgba(10, 7, 24, 0.55)' }}
            >
              {title}
            </h1>

            <p className="mt-3.5 max-w-xs text-[0.9rem] leading-relaxed text-[#CFC6E2] sm:mt-4 sm:max-w-sm sm:text-base">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-col items-center sm:mt-10">
              <button
                type="button"
                onClick={onStartWithMusic}
                className="group relative inline-flex min-h-[48px] max-w-[92vw] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBF6EC] px-6 py-3.5 text-[13.5px] font-medium text-[#1D1631] shadow-[0_0_34px_rgba(247,215,148,0.28),0_12px_30px_rgba(8,6,20,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_46px_rgba(247,215,148,0.46),0_16px_34px_rgba(8,6,20,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7D794] whitespace-nowrap shrink-0 sm:gap-2.5 sm:px-8 sm:text-sm"
              >
                <Music className="h-4 w-4 shrink-0 text-[#7E63A6] transition-transform duration-200 group-hover:scale-110" />
                <span>Press to hear my piano magic ✨</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
