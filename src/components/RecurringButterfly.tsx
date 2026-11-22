import React, { useEffect, useRef, useState } from 'react';

interface RecurringButterflyProps {
  /** Whether Section 1's portrait sketch has finished so the butterfly can awaken */
  awakened: boolean;
  /** Reference to the birthday cake anchor where the butterfly rests in Section 4 */
  cakePerchRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Anatomically detailed single wing pair (forewing + scalloped hindwing)
 * with realistic insect venation (costal, subcostal, radial, discal cell, cubital & anal veins),
 * velvet plum apical border, pearlescent submarginal dots, and pastel lavender-blush iridescent scales.
 */
const RealisticWingSvg: React.FC<{ side: 'left' | 'right'; isEvening: boolean }> = ({
  side,
  isEvening,
}) => {
  const gradId = `wingMembrane-${side}`;
  const hindGradId = `hindMembrane-${side}`;
  const sheenId = `wingSheen-${side}`;

  return (
    <svg
      viewBox="0 0 110 124"
      fill="none"
      className="h-full w-full overflow-visible"
      style={{
        transform: side === 'right' ? 'scaleX(-1)' : undefined,
      }}
    >
      <defs>
        {/* Forewing iridescent lavender-rose-ivory scale gradient */}
        <linearGradient id={gradId} x1="108" y1="62" x2="10" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D5368" stopOpacity="0.92" />
          <stop offset="18%" stopColor="#D7BBE4" stopOpacity="0.94" />
          <stop offset="52%" stopColor="#F1D5DF" stopOpacity="0.93" />
          <stop offset="78%" stopColor="#D9C3EA" stopOpacity="0.95" />
          <stop offset="93%" stopColor="#563C54" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#3D293B" stopOpacity="0.98" />
        </linearGradient>

        {/* Hindwing softer blush-champagne scale gradient */}
        <linearGradient id={hindGradId} x1="106" y1="64" x2="26" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#755A6C" stopOpacity="0.9" />
          <stop offset="22%" stopColor="#F5DECE" stopOpacity="0.92" />
          <stop offset="60%" stopColor="#EED0DC" stopOpacity="0.93" />
          <stop offset="86%" stopColor="#CBB6DF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#5B4258" stopOpacity="0.96" />
        </linearGradient>

        {/* Subtle luminous golden/moonlit scale shimmer */}
        <radialGradient id={sheenId} cx="42%" cy="38%" r="58%">
          <stop
            offset="0%"
            stopColor={isEvening ? '#FFF3D2' : '#FFFFFF'}
            stopOpacity={isEvening ? '0.42' : '0.35'}
          />
          <stop offset="65%" stopColor="#F6DFC9" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* === HINDWING (Lower scalloped wing layered slightly behind forewing) === */}
      <path
        d="M106 64 C94 66, 74 68, 56 76 C44 82, 34 91, 35 99 C36 104, 41 105, 44 109 C47 113, 52 118, 59 117 C64 116, 68 119, 74 117 C82 115, 92 106, 98 95 C103 86, 106 75, 106 64 Z"
        fill={`url(#${hindGradId})`}
        stroke="#573F55"
        strokeWidth="0.9"
      />

      {/* Hindwing anatomical radial & anal venation */}
      <g stroke="#4E384D" strokeLinecap="round" opacity="0.58">
        <path d="M105 66 Q82 75 41 96" strokeWidth="1.05" />
        <path d="M105 68 Q84 84 49 111" strokeWidth="0.95" />
        <path d="M105 70 Q88 92 64 116" strokeWidth="0.9" />
        <path d="M104 72 Q94 96 79 115" strokeWidth="0.85" />
        <path d="M104 74 Q98 92 92 104" strokeWidth="0.75" />
        {/* Delicate discal cross-vein */}
        <path d="M84 74 Q79 84 81 92" strokeWidth="0.7" opacity="0.75" />
      </g>

      {/* Hindwing delicate submarginal eyespot & scalloped pearl dots */}
      <circle cx="52" cy="98" r="4.6" fill="#5D425B" fillOpacity="0.45" stroke="#FAF2EA" strokeWidth="0.7" />
      <circle cx="52" cy="98" r="2.1" fill="#3B273A" />
      <circle cx="51" cy="97" r="0.8" fill="#FFFDF9" />
      <circle cx="43" cy="105" r="1.35" fill="#FFFBF5" opacity="0.82" />
      <circle cx="55" cy="113" r="1.4" fill="#FFFBF5" opacity="0.82" />
      <circle cx="69" cy="114" r="1.3" fill="#FFFBF5" opacity="0.78" />
      <circle cx="82" cy="109" r="1.15" fill="#FFFBF5" opacity="0.72" />

      {/* === FOREWING (Upper primary aerodynamic wing) === */}
      <path
        d="M107 58 C94 34, 68 12, 34 6 C18 3, 6 9, 5 21 C4 33, 12 44, 18 52 C24 60, 32 67, 45 70 C64 74, 88 70, 107 62 Z"
        fill={`url(#${gradId})`}
        stroke="#4D364B"
        strokeWidth="1"
      />

      {/* Iridescent sheen overlay */}
      <path
        d="M105 58 C92 36, 68 16, 36 10 C22 7, 13 13, 12 22 C11 33, 20 44, 29 53 C44 65, 76 68, 105 61 Z"
        fill={`url(#${sheenId})`}
      />

      {/* Dark plum-velvet apical wingtip shading */}
      <path
        d="M44 8 C30 5, 13 5, 6 16 C4 24, 8 34, 15 44 C20 35, 29 22, 44 8 Z"
        fill="#3F2A3E"
        fillOpacity="0.58"
      />

      {/* Forewing biological venation: stiff costal margin, discal cell, radial R1-R5, median & cubital branches */}
      <g stroke="#493347" strokeLinecap="round" strokeLinejoin="round">
        {/* Stiff leading costal & subcostal vein */}
        <path d="M106 57 C90 36, 64 16, 20 8" strokeWidth="1.55" opacity="0.76" />
        {/* Discal cell upper & lower structural struts */}
        <path d="M106 59 C86 46, 64 36, 46 31" strokeWidth="1.15" opacity="0.68" />
        <path d="M106 60 C86 56, 64 52, 48 47" strokeWidth="1.1" opacity="0.64" />
        <path d="M46 31 C44 37, 45 43, 48 47" strokeWidth="0.9" opacity="0.58" />
        {/* Branching radial veins fanning to wingtip */}
        <path d="M58 29 Q38 18 14 14" strokeWidth="0.95" opacity="0.62" />
        <path d="M47 32 Q28 26 9 26" strokeWidth="0.9" opacity="0.6" />
        <path d="M46 38 Q28 38 13 40" strokeWidth="0.88" opacity="0.58" />
        <path d="M48 46 Q32 51 20 53" strokeWidth="0.88" opacity="0.56" />
        {/* Cubital vein toward trailing margin */}
        <path d="M68 56 Q48 63 34 65" strokeWidth="0.85" opacity="0.54" />
      </g>

      {/* Delicate pearlescent white submarginal spots in the dark apical tip */}
      <ellipse cx="22" cy="15" rx="3.2" ry="1.8" transform="rotate(-18 22 15)" fill="#FFFDF9" opacity="0.86" />
      <ellipse cx="14" cy="24" rx="2.5" ry="1.5" transform="rotate(-8 14 24)" fill="#FFFDF9" opacity="0.84" />
      <circle cx="13" cy="34" r="1.55" fill="#FFFDF9" opacity="0.8" />
      <circle cx="19" cy="44" r="1.45" fill="#FFFDF9" opacity="0.78" />
      <circle cx="26" cy="54" r="1.35" fill="#FFFDF9" opacity="0.72" />
      <circle cx="36" cy="62" r="1.2" fill="#FFFDF9" opacity="0.68" />
    </svg>
  );
};

/**
 * Recurring realistic 3D articulated butterfly companion.
 * - Uses true 3D perspective wing hinges (`rotateY` + aeroelastic `rotateZ`) with a natural
 *   flap-and-glide cadence and synchronized lift recoil.
 * - Glides organically along a smooth curved flight trajectory across Sections 1–3.
 * - Lands gently beside the birthday cake in Section 4, folding its wings in a calm basking dihedral.
 */
export const RecurringButterfly: React.FC<RecurringButterflyProps> = ({
  awakened,
  cakePerchRef,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isResting, setIsResting] = useState(false);
  const [isEvening, setIsEvening] = useState(false);

  useEffect(() => {
    if (!awakened) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;

    const current = {
      x: window.innerWidth * 0.68,
      y: window.innerHeight * 0.34,
      heading: -18,
      bank: 0,
      scale: 0.92,
    };

    const tick = (nowMs: number) => {
      const t = nowMs * 0.001;
      const scrollY = window.scrollY;
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, scrollY / docHeight));

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const isMobile = vw < 640;
      let targetX = isMobile ? vw * 0.84 : vw * 0.68;
      let targetY = isMobile ? vh * 0.22 : vh * 0.34;
      let targetScale = isMobile ? 0.58 : 0.96;
      let restingNow = false;

      const perchEl = cakePerchRef.current;
      const perchRect = perchEl?.getBoundingClientRect();
      const shouldLandOnCake =
        progress > 0.84 &&
        perchRect &&
        perchRect.top > 40 &&
        perchRect.top < vh - 40;

      if (shouldLandOnCake && perchRect) {
        targetX = perchRect.left + perchRect.width * 0.5;
        targetY = perchRect.top + perchRect.height * 0.5;
        targetScale = isMobile ? 0.56 : 0.88;
        restingNow = true;
      } else if (isMobile) {
        // On mobile, glide delicately near the outer margins so her face & letter text stay unobstructed
        const sideSwing = Math.sin(progress * Math.PI * 2.6 + 0.7);
        const edgeAnchor = sideSwing >= 0 ? vw * 0.86 : vw * 0.14;
        const flutterX = prefersReducedMotion ? 0 : Math.sin(t * 1.25) * 10;
        const flutterY = prefersReducedMotion ? 0 : Math.cos(t * 1.65) * 10;

        targetX = Math.max(30, Math.min(vw - 30, edgeAnchor + flutterX));
        const mobileY = vh * (0.18 + Math.abs(Math.sin(progress * Math.PI * 2.1)) * 0.16);
        targetY = Math.max(58, Math.min(vh - 120, mobileY + flutterY));
      } else {
        // Sinuous organic garden flight arc across the page on tablet/desktop
        const waveX = Math.sin(progress * Math.PI * 3.1 + 0.55) * (vw * 0.27);
        // Natural figure-8 hovering drift
        const flutterX = prefersReducedMotion ? 0 : Math.sin(t * 1.35) * 20 + Math.cos(t * 2.6) * 6;
        const flutterY = prefersReducedMotion ? 0 : Math.cos(t * 1.85) * 14 + Math.sin(t * 3.4) * 4;

        targetX = vw * 0.52 + waveX + flutterX;
        targetX = Math.max(52, Math.min(vw - 52, targetX));

        const verticalArc =
          progress < 0.22
            ? vh * (0.3 + progress * 1.25)
            : vh * (0.28 + Math.sin(progress * Math.PI * 2.45) * 0.14);
        targetY = Math.max(82, Math.min(vh - 104, verticalArc + flutterY));
      }

      const lerp = restingNow ? 0.065 : 0.055;
      const prevX = current.x;
      const prevY = current.y;
      current.x += (targetX - current.x) * lerp;
      current.y += (targetY - current.y) * lerp;

      const vx = current.x - prevX;
      const vy = current.y - prevY;

      // Orient the butterfly nose naturally along its flight velocity vector, or perched gently angled on the cake
      let targetHeading = -22;
      if (!restingNow) {
        const speed = Math.hypot(vx, vy);
        if (speed > 0.25) {
          // Convert velocity vector into graceful nose-forward tilt (clamped so it never flips upside-down awkwardly)
          const rawAngle = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
          targetHeading = Math.max(-52, Math.min(52, rawAngle * 0.55));
        } else {
          targetHeading = Math.sin(t * 1.1) * 14 - 10;
        }
      } else {
        targetHeading = -24 + Math.sin(t * 0.7) * 2;
      }

      const targetBank = restingNow ? 0 : Math.max(-18, Math.min(18, vx * 2.2));

      current.heading += (targetHeading - current.heading) * 0.08;
      current.bank += (targetBank - current.bank) * 0.08;
      current.scale += (targetScale - current.scale) * 0.08;

      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${current.x.toFixed(1)}px, ${current.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${current.heading.toFixed(1)}deg) scale(${current.scale.toFixed(3)})`;
      }

      setIsResting((prev) => (prev !== restingNow ? restingNow : prev));
      setIsEvening((prev) => {
        const eveningNow = progress > 0.78;
        return prev !== eveningNow ? eveningNow : prev;
      });

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [awakened, cakePerchRef]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={`pointer-events-none fixed top-0 left-0 z-30 transition-opacity duration-1000 ${
        awakened ? 'opacity-100' : 'opacity-0'
      } ${isResting ? 'butterfly-resting' : ''}`}
      style={{
        willChange: 'transform, opacity',
        filter: isEvening
          ? 'drop-shadow(0 6px 14px rgba(247, 215, 148, 0.36))'
          : 'drop-shadow(0 14px 12px rgba(78, 58, 76, 0.2))',
      }}
    >
      {/* 3D Perspective Stage */}
      <div className="butterfly-3d-stage relative h-[76px] w-[86px]">
        <div className="butterfly-3d-rig relative h-full w-full">
          {/* Left 3D Articulated Wing */}
          <div className="butterfly-wing-left absolute top-0 left-0 h-[76px] w-[43px]">
            <RealisticWingSvg side="left" isEvening={isEvening} />
          </div>

          {/* Right 3D Articulated Wing */}
          <div className="butterfly-wing-right absolute top-0 right-0 h-[76px] w-[43px]">
            <RealisticWingSvg side="right" isEvening={isEvening} />
          </div>

          {/* Central Realistic Insect Body: Head, Compound Eyes, Clubbed Antennae, Fuzzy Thorax & Segmented Abdomen */}
          <svg
            viewBox="0 0 40 124"
            fill="none"
            className="pointer-events-none absolute top-0 left-1/2 h-[76px] w-[26px] -translate-x-1/2 overflow-visible"
            style={{ transform: 'translateZ(2px)' }}
          >
            <defs>
              <linearGradient id="thoraxGrad" x1="20" y1="30" x2="20" y2="92" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4A3544" />
                <stop offset="35%" stopColor="#352332" />
                <stop offset="75%" stopColor="#4B3746" />
                <stop offset="100%" stopColor="#2B1C28" />
              </linearGradient>
            </defs>

            {/* Graceful curved clubbed antennae */}
            <path
              d="M18.2 35 C14.5 23, 10 15, 5.5 11"
              stroke="#3B2938"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <ellipse
              cx="5"
              cy="10.5"
              rx="1.8"
              ry="1.15"
              transform="rotate(-38 5 10.5)"
              fill="#3B2938"
            />
            <path
              d="M21.8 35 C25.5 23, 30 15, 34.5 11"
              stroke="#3B2938"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <ellipse
              cx="35"
              cy="10.5"
              rx="1.8"
              ry="1.15"
              transform="rotate(38 35 10.5)"
              fill="#3B2938"
            />

            {/* Head & compound eyes */}
            <ellipse cx="20" cy="36.5" rx="3.4" ry="2.8" fill="#32202E" />
            <circle cx="17.2" cy="36.2" r="1.45" fill="#1F131D" />
            <circle cx="22.8" cy="36.2" r="1.45" fill="#1F131D" />
            <circle cx="17.1" cy="35.8" r="0.45" fill="#E8D8EE" opacity="0.65" />
            <circle cx="22.7" cy="35.8" r="0.45" fill="#E8D8EE" opacity="0.65" />

            {/* Velvet Thorax */}
            <ellipse cx="20" cy="48" rx="4.1" ry="9.5" fill="url(#thoraxGrad)" />
            <ellipse cx="19.2" cy="46" rx="1.4" ry="5" fill="#7D6278" opacity="0.35" />

            {/* Tapered Segmented Abdomen */}
            <path
              d="M17.2 56 C16.8 68, 17.6 80, 20 89 C22.4 80, 23.2 68, 22.8 56 Z"
              fill="url(#thoraxGrad)"
            />
            <line x1="17.5" y1="63" x2="22.5" y2="63" stroke="#7A5F74" strokeWidth="0.7" opacity="0.5" />
            <line x1="17.7" y1="69" x2="22.3" y2="69" stroke="#7A5F74" strokeWidth="0.7" opacity="0.5" />
            <line x1="18.1" y1="75" x2="21.9" y2="75" stroke="#7A5F74" strokeWidth="0.7" opacity="0.45" />
            <line x1="18.7" y1="81" x2="21.3" y2="81" stroke="#7A5F74" strokeWidth="0.65" opacity="0.4" />
          </svg>
        </div>
      </div>
    </div>
  );
};
