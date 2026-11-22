import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { BotanicalIllustration, FloatingPetalsLayer } from './BotanicalIllustrations';
import {
  OPENCV_PORTRAIT_HEIGHT,
  OPENCV_PORTRAIT_STROKES,
  OPENCV_PORTRAIT_WIDTH,
  OPENCV_SKETCH_IMAGE_URL,
} from '../data/portraitOpenCVPaths';
import { DEFAULT_BIRTHDAY_CONTENT } from '../config/birthdayContent';

interface Section1PortraitProps {
  started: boolean;
  chapterLabel: string;
  message: string;
  scrollPrompt: string;
  portraitSrc: string;
  isCustomPortrait: boolean;
  onSketchComplete: () => void;
}

interface PencilTip {
  x: number;
  y: number;
  angle: number;
  visible: boolean;
}

interface GraphiteDust {
  id: number;
  x: number;
  y: number;
}

type Stage = 'idle' | 'sketching' | 'blooming' | 'coloring' | 'complete';

interface SegmentedStroke {
  zone: number;
  pts: [number, number][];
  cumLengths: number[];
  totalLength: number;
}

/**
 * Generates sweeping 45-degree artist diagonal shading waypoints across the canvas
 * to lay down soft OpenCV graphite shading right over the drawn contour outline.
 */
function buildDiagonalShadingPath(width: number, height: number): [number, number][] {
  const waypoints: [number, number][] = [];
  const rowStep = height / 15;
  let goingRight = true;

  for (let row = 0; row <= 15; row++) {
    const yBase = Math.min(height - 8, 12 + row * rowStep);
    const xLeft = width * 0.08;
    const xRight = width * 0.92;
    const tiltOffset = height * 0.045;

    if (goingRight) {
      waypoints.push([xLeft, Math.max(8, yBase - tiltOffset)]);
      waypoints.push([xRight, Math.min(height - 8, yBase + tiltOffset)]);
    } else {
      waypoints.push([xRight, Math.min(height - 8, yBase + tiltOffset)]);
      waypoints.push([xLeft, Math.max(8, yBase - tiltOffset)]);
    }
    goingRight = !goingRight;
  }
  return waypoints;
}

/**
 * Pre-computes segment cumulative lengths for smooth constant-speed pencil contour tracing.
 */
function prepareOpenCVStrokes(): {
  strokes: SegmentedStroke[];
  totalContourLen: number;
} {
  let totalContourLen = 0;
  const strokes: SegmentedStroke[] = OPENCV_PORTRAIT_STROKES.map((s) => {
    const cumLengths: number[] = [0];
    let len = 0;
    for (let i = 1; i < s.p.length; i++) {
      len += Math.hypot(s.p[i][0] - s.p[i - 1][0], s.p[i][1] - s.p[i - 1][1]);
      cumLengths.push(len);
    }
    totalContourLen += len;
    return {
      zone: s.z,
      pts: s.p,
      cumLengths,
      totalLength: len,
    };
  });
  return { strokes, totalContourLen };
}

function sampleStrokeAt(stroke: SegmentedStroke, dist: number): [number, number] {
  if (stroke.pts.length === 0) return [0, 0];
  if (dist <= 0 || stroke.pts.length === 1) return stroke.pts[0];
  if (dist >= stroke.totalLength) return stroke.pts[stroke.pts.length - 1];

  for (let i = 1; i < stroke.cumLengths.length; i++) {
    if (stroke.cumLengths[i] >= dist) {
      const segStart = stroke.cumLengths[i - 1];
      const segLen = Math.max(0.0001, stroke.cumLengths[i] - segStart);
      const t = (dist - segStart) / segLen;
      const p0 = stroke.pts[i - 1];
      const p1 = stroke.pts[i];
      return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
    }
  }
  return stroke.pts[stroke.pts.length - 1];
}

export const Section1Portrait: React.FC<Section1PortraitProps> = ({
  started,
  chapterLabel,
  message,
  scrollPrompt,
  portraitSrc,
  onSketchComplete,
}) => {
  const [stage, setStage] = useState<Stage>('idle');
  const [runId, setRunId] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(9 / 16);
  const [pencil, setPencil] = useState<PencilTip>({ x: 50, y: 15, angle: -34, visible: false });
  const [dustParticles, setDustParticles] = useState<GraphiteDust[]>([]);
  const [colorWashProgress, setColorWashProgress] = useState(0);
  const [sketchImgLoaded, setSketchImgLoaded] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dustCounterRef = useRef(0);
  const completionNotifiedRef = useRef(false);

  const usesPrecomputedOpenCV = portraitSrc === DEFAULT_BIRTHDAY_CONTENT.assets.portrait2D;

  // Load OpenCV graphite sketch image (or custom uploaded photo fallback)
  useEffect(() => {
    setImgError(false);
    setSketchImgLoaded(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
      setSketchImgLoaded(img);
    };
    img.onerror = () => {
      setImgError(true);
    };
    img.src = usesPrecomputedOpenCV ? OPENCV_SKETCH_IMAGE_URL : portraitSrc;
  }, [portraitSrc, usesPrecomputedOpenCV]);

  const handleReplay = useCallback(() => {
    setStage('idle');
    setColorWashProgress(0);
    setDustParticles([]);
    setPencil((p) => ({ ...p, visible: false }));
    setRunId((n) => n + 1);
  }, []);

  // Two-stage OpenCV Hand-Drawing Animation:
  // Stage 1: Crisp nearest-neighbor OpenCV contours drawn stroke-by-stroke under the pencil tip
  // Stage 2: Smooth 45° artist shading passes laying down the full OpenCV graphite pencil drawing
  useEffect(() => {
    if (!started || !sketchImgLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = usesPrecomputedOpenCV ? OPENCV_PORTRAIT_WIDTH * 2 : 540;
    const ch = usesPrecomputedOpenCV
      ? OPENCV_PORTRAIT_HEIGHT * 2
      : Math.round(540 / Math.max(0.5, Math.min(1.5, aspectRatio)));
    canvas.width = cw;
    canvas.height = ch;

    const scaleX = cw / OPENCV_PORTRAIT_WIDTH;
    const scaleY = ch / OPENCV_PORTRAIT_HEIGHT;

    // Prepare the full OpenCV graphite sketch offscreen layer
    const fullSketchCanvas = document.createElement('canvas');
    fullSketchCanvas.width = cw;
    fullSketchCanvas.height = ch;
    const fullSketchCtx = fullSketchCanvas.getContext('2d');
    if (!fullSketchCtx) return;

    fullSketchCtx.fillStyle = '#FBF8F3';
    fullSketchCtx.fillRect(0, 0, cw, ch);
    if (!usesPrecomputedOpenCV) {
      fullSketchCtx.filter = 'grayscale(100%) contrast(155%) brightness(112%)';
    }
    fullSketchCtx.drawImage(sketchImgLoaded, 0, 0, cw, ch);
    fullSketchCtx.filter = 'none';

    // Start completely blank warm off-white cotton paper
    ctx.fillStyle = '#FBF8F3';
    ctx.fillRect(0, 0, cw, ch);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      ctx.drawImage(fullSketchCanvas, 0, 0);
      setColorWashProgress(1);
      setStage('complete');
      setPencil((p) => ({ ...p, visible: false }));
      if (!completionNotifiedRef.current) {
        completionNotifiedRef.current = true;
        onSketchComplete();
      }
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let bloomTimeout = 0;
    let colorRafId = 0;

    // Persistent contour ink layer + progressive shading reveal mask
    const contourLayer = document.createElement('canvas');
    contourLayer.width = cw;
    contourLayer.height = ch;
    const contourCtx = contourLayer.getContext('2d');

    const shadeMask = document.createElement('canvas');
    shadeMask.width = cw;
    shadeMask.height = ch;
    const shadeMaskCtx = shadeMask.getContext('2d');

    const compCanvas = document.createElement('canvas');
    compCanvas.width = cw;
    compCanvas.height = ch;
    const compCtx = compCanvas.getContext('2d');

    if (!contourCtx || !shadeMaskCtx || !compCtx) return;

    const { strokes, totalContourLen } = prepareOpenCVStrokes();
    const shadingWaypoints = buildDiagonalShadingPath(cw, ch);

    // Precompute shading path cumulative distances
    const shadeCum: number[] = [0];
    let totalShadeLen = 0;
    for (let i = 1; i < shadingWaypoints.length; i++) {
      totalShadeLen += Math.hypot(
        shadingWaypoints[i][0] - shadingWaypoints[i - 1][0],
        shadingWaypoints[i][1] - shadingWaypoints[i - 1][1]
      );
      shadeCum.push(totalShadeLen);
    }

    const contourDurationMs = usesPrecomputedOpenCV ? 3800 : 800;
    const shadingDurationMs = 2600;
    const totalDurationMs = contourDurationMs + shadingDurationMs;

    const startDelay = window.setTimeout(() => {
      if (cancelled) return;
      setStage('sketching');

      let startTime: number | null = null;
      let prevContourDist = 0;
      let prevShadePt: [number, number] | null = null;
      let smoothTipX = cw * 0.5;
      let smoothTipY = ch * 0.14;
      let lastDustTime = 0;

      const drawContourSlice = (fromDist: number, toDist: number): [number, number] => {
        let cursor = 0;
        let lastPt: [number, number] = [smoothTipX, smoothTipY];

        for (let i = 0; i < strokes.length; i++) {
          const st = strokes[i];
          const sStart = cursor;
          const sEnd = cursor + st.totalLength;
          cursor = sEnd;

          if (sEnd <= fromDist) continue;
          if (sStart >= toDist) break;

          const localFrom = Math.max(0, fromDist - sStart);
          const localTo = Math.min(st.totalLength, toDist - sStart);

          contourCtx.save();
          contourCtx.lineCap = 'round';
          contourCtx.lineJoin = 'round';
          contourCtx.strokeStyle =
            st.zone === 0
              ? 'rgba(52, 43, 47, 0.88)'
              : st.zone === 1
                ? 'rgba(66, 56, 61, 0.72)'
                : 'rgba(112, 102, 108, 0.44)';
          contourCtx.lineWidth = st.zone === 0 ? 1.85 : st.zone === 1 ? 1.55 : 1.15;

          const startPt = sampleStrokeAt(st, localFrom);
          const endPt = sampleStrokeAt(st, localTo);

          contourCtx.beginPath();
          contourCtx.moveTo(startPt[0] * scaleX, startPt[1] * scaleY);

          for (let k = 1; k < st.cumLengths.length; k++) {
            const d = st.cumLengths[k];
            if (d > localFrom && d < localTo) {
              contourCtx.lineTo(st.pts[k][0] * scaleX, st.pts[k][1] * scaleY);
            }
          }
          contourCtx.lineTo(endPt[0] * scaleX, endPt[1] * scaleY);
          contourCtx.stroke();
          contourCtx.restore();

          // Softly reveal a whisper of OpenCV pencil tone right along the traced contour
          shadeMaskCtx.save();
          shadeMaskCtx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
          shadeMaskCtx.lineCap = 'round';
          shadeMaskCtx.lineWidth = st.zone === 0 ? 22 : 28;
          shadeMaskCtx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          shadeMaskCtx.shadowBlur = 14;
          shadeMaskCtx.beginPath();
          shadeMaskCtx.moveTo(startPt[0] * scaleX, startPt[1] * scaleY);
          shadeMaskCtx.lineTo(endPt[0] * scaleX, endPt[1] * scaleY);
          shadeMaskCtx.stroke();
          shadeMaskCtx.restore();

          lastPt = [endPt[0] * scaleX, endPt[1] * scaleY];
        }
        return lastPt;
      };

      const sampleShadePoint = (dist: number): [number, number] => {
        if (dist <= 0) return shadingWaypoints[0];
        if (dist >= totalShadeLen) return shadingWaypoints[shadingWaypoints.length - 1];
        for (let i = 1; i < shadeCum.length; i++) {
          if (shadeCum[i] >= dist) {
            const segStart = shadeCum[i - 1];
            const segLen = Math.max(0.0001, shadeCum[i] - segStart);
            const t = (dist - segStart) / segLen;
            const p0 = shadingWaypoints[i - 1];
            const p1 = shadingWaypoints[i];
            return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
          }
        }
        return shadingWaypoints[shadingWaypoints.length - 1];
      };

      const renderFrame = (now: number) => {
        if (cancelled) return;
        if (startTime === null) startTime = now;
        const elapsed = Math.max(0, now - startTime);

        let targetX = smoothTipX;
        let targetY = smoothTipY;
        let shadingOpacity = 0;

        if (usesPrecomputedOpenCV && elapsed <= contourDurationMs) {
          // PHASE 1: OpenCV Contour Line Drawing
          const t = Math.max(0, Math.min(1, elapsed / contourDurationMs));
          // Slightly gentler speed on her face (first 25%) so her eyes & smile feel lovingly sketched
          const paced = t < 0.28 ? t * 0.72 : 0.2016 + ((t - 0.28) / 0.72) * 0.7984;
          const curDist = paced * totalContourLen;
          const pt = drawContourSlice(prevContourDist, curDist);
          prevContourDist = curDist;
          targetX = pt[0];
          targetY = pt[1];
          shadingOpacity = 0.25 + t * 0.2;
        } else {
          // Ensure all contours are finished before shading
          if (usesPrecomputedOpenCV && prevContourDist < totalContourLen) {
            drawContourSlice(prevContourDist, totalContourLen);
            prevContourDist = totalContourLen;
          }

          // PHASE 2: Diagonal Graphite Shading Pass revealing the full OpenCV pencil sketch
          const shadeElapsed = Math.max(0, elapsed - contourDurationMs);
          const st = Math.max(0, Math.min(1, shadeElapsed / shadingDurationMs));
          const curShadeDist = st * totalShadeLen;
          const pt = sampleShadePoint(curShadeDist);

          // Natural hand shading oscillation along the stroke
          const oscX = Math.sin(now * 0.045) * 8;
          const oscY = Math.cos(now * 0.045) * 6;
          targetX = pt[0] + oscX;
          targetY = pt[1] + oscY;

          const prev = prevShadePt ?? pt;
          shadeMaskCtx.save();
          shadeMaskCtx.lineCap = 'round';
          shadeMaskCtx.lineJoin = 'round';
          shadeMaskCtx.strokeStyle = 'rgba(255, 255, 255, 0.96)';
          shadeMaskCtx.lineWidth = Math.max(78, ch * 0.11);
          shadeMaskCtx.shadowColor = 'rgba(255, 255, 255, 0.98)';
          shadeMaskCtx.shadowBlur = 32;
          shadeMaskCtx.beginPath();
          shadeMaskCtx.moveTo(prev[0], prev[1]);
          shadeMaskCtx.lineTo(targetX, targetY);
          shadeMaskCtx.stroke();
          shadeMaskCtx.restore();

          prevShadePt = [targetX, targetY];
          shadingOpacity = 0.55 + st * 0.45;
        }

        // Composite warm paper + revealed OpenCV graphite shading + crisp OpenCV contours
        compCtx.clearRect(0, 0, cw, ch);
        compCtx.globalCompositeOperation = 'source-over';
        compCtx.drawImage(shadeMask, 0, 0);
        compCtx.globalCompositeOperation = 'source-in';
        compCtx.drawImage(fullSketchCanvas, 0, 0);

        ctx.fillStyle = '#FBF8F3';
        ctx.fillRect(0, 0, cw, ch);
        ctx.save();
        ctx.globalAlpha = Math.min(1, shadingOpacity + 0.35);
        ctx.drawImage(compCanvas, 0, 0);
        ctx.restore();

        if (usesPrecomputedOpenCV) {
          ctx.save();
          // Let fine OpenCV contours stay crisp during outline, then blend seamlessly into the full OpenCV sketch
          const contourAlpha =
            elapsed <= contourDurationMs
              ? 0.92
              : Math.max(0.18, 0.92 - ((elapsed - contourDurationMs) / shadingDurationMs) * 0.74);
          ctx.globalAlpha = contourAlpha;
          ctx.drawImage(contourLayer, 0, 0);
          ctx.restore();
        }

        // Smooth damped pencil wrist movement
        const vx = targetX - smoothTipX;
        const lerp = elapsed <= contourDurationMs ? 0.52 : 0.44;
        smoothTipX += (targetX - smoothTipX) * lerp;
        smoothTipY += (targetY - smoothTipY) * lerp;

        const pctX = (smoothTipX / cw) * 100;
        const pctY = (smoothTipY / ch) * 100;
        const tilt = Math.max(-44, Math.min(-22, -34 + vx * 0.35));
        setPencil({ x: pctX, y: pctY, angle: tilt, visible: true });

        if (now - lastDustTime > 150) {
          lastDustTime = now;
          dustCounterRef.current += 1;
          const id = dustCounterRef.current;
          setDustParticles((prev) => [...prev.slice(-8), { id, x: pctX, y: pctY }]);
        }

        if (elapsed < totalDurationMs) {
          rafId = window.requestAnimationFrame(renderFrame);
        } else {
          // Settle final pristine OpenCV graphite sketch cleanly on paper
          ctx.fillStyle = '#FBF8F3';
          ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(fullSketchCanvas, 0, 0);
          setPencil((p) => ({ ...p, visible: false }));
          setStage('blooming');

          // Hold the completed OpenCV graphite portrait briefly as flowers bloom, then wash into full HD color
          bloomTimeout = window.setTimeout(() => {
            if (cancelled) return;
            setStage('coloring');
            let washStart: number | null = null;
            const washDuration = 2100;

            const stepWash = (washNow: number) => {
              if (cancelled) return;
              if (washStart === null) washStart = washNow;
              const wt = Math.max(0, Math.min(1, (washNow - washStart) / washDuration));
              const eased = 1 - Math.pow(1 - wt, 3);
              setColorWashProgress(eased);

              if (wt < 1) {
                colorRafId = window.requestAnimationFrame(stepWash);
              } else {
                setStage('complete');
                if (!completionNotifiedRef.current) {
                  completionNotifiedRef.current = true;
                  onSketchComplete();
                }
              }
            };
            colorRafId = window.requestAnimationFrame(stepWash);
          }, 950);
        }
      };

      rafId = window.requestAnimationFrame(renderFrame);
    }, 360);

    return () => {
      cancelled = true;
      window.clearTimeout(startDelay);
      window.clearTimeout(bloomTimeout);
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(colorRafId);
    };
  }, [started, sketchImgLoaded, aspectRatio, usesPrecomputedOpenCV, runId, onSketchComplete]);

  const flowersVisible = stage === 'blooming' || stage === 'coloring' || stage === 'complete';
  const messageVisible = stage === 'complete';
  const washClipPercent = Math.round(colorWashProgress * 120);
  const isVerticalFrame = aspectRatio < 0.78;

  return (
    <section
      id="section-portrait"
      aria-label="The Portrait Comes to Life"
      className="paper-grain relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#FBF8F3] px-4 pt-8 pb-5 sm:px-8 sm:pt-12 sm:pb-8"
    >
      {/* Subtle sunlit paper halo once portrait blooms */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-1500"
        style={{
          opacity: flowersVisible ? 1 : 0,
          background:
            'radial-gradient(circle at 50% 42%, rgba(246, 219, 196, 0.24) 0%, rgba(236, 197, 206, 0.14) 36%, transparent 68%)',
        }}
      />

      {flowersVisible && <FloatingPetalsLayer tone="day" count={9} />}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: started ? 0.85 : 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="relative z-10 mb-4 text-xs tracking-[0.22em] text-[#8D79AE] uppercase"
      >
        {chapterLabel}
      </motion.p>

      {/* Main Portrait Drawing Canvas Frame */}
      <div
        className={`relative z-10 flex w-full flex-col items-center ${
          isVerticalFrame ? 'max-w-[360px]' : 'max-w-[460px] sm:max-w-[500px]'
        }`}
      >
        <div
          className={`relative overflow-visible rounded-[24px] bg-[#FBF8F3] sm:rounded-[28px] ${
            isVerticalFrame ? '' : 'w-full'
          }`}
          style={{
            aspectRatio: `${aspectRatio}`,
            width: isVerticalFrame
              ? `min(82vw, calc(58svh * ${aspectRatio}), ${Math.round(520 * aspectRatio)}px)`
              : undefined,
            boxShadow:
              colorWashProgress > 0.2
                ? '0 26px 64px -20px rgba(110, 86, 98, 0.2)'
                : 'none',
            transition: 'box-shadow 1.4s ease',
          }}
        >
          {/* Layer 1: Live OpenCV Contour + Graphite Shading Canvas */}
          <canvas
            ref={canvasRef}
            aria-label="OpenCV progressive hand-drawn pencil sketch of the portrait"
            className="absolute inset-0 h-full w-full rounded-[28px] object-cover"
          />

          {/* Layer 2: Soft Radial Color Wash Reveal into the Full HD Portrait */}
          <div
            className="absolute inset-0 z-10 overflow-hidden rounded-[28px]"
            style={{
              clipPath: `circle(${washClipPercent}% at 50% 38%)`,
              opacity: colorWashProgress,
            }}
          >
            {!imgError ? (
              <img
                src={portraitSrc}
                alt="Portrait illuminated with soft pastel warmth"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#F9ECEF] via-[#FBF8F3] to-[#ECE5F4] p-6 text-center">
                <BotanicalIllustration motif="peony" className="h-16 w-16" />
                <p className="mt-3 font-serif text-lg text-[#665B5E]">Portrait Canvas</p>
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[28px]"
              style={{
                boxShadow: 'inset 0 0 28px 10px rgba(251, 248, 243, 0.42)',
              }}
            />
          </div>

          {/* Layer 3: Graphite Dust Motes & Live Moving Artist Pencil */}
          <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
            {dustParticles.map((p) => (
              <span
                key={p.id}
                className="absolute h-1 w-1 rounded-full bg-[#685C60]"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  opacity: stage === 'sketching' ? 0.35 : 0,
                  transition: 'opacity 0.5s ease',
                }}
              />
            ))}

            {/* Realistic Angled Cedar & Graphite Sketching Pencil */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 z-30"
              style={{
                left: `${pencil.x}%`,
                top: `${pencil.y}%`,
                opacity: pencil.visible ? 1 : 0,
                transform: `rotate(${pencil.angle}deg)`,
                transformOrigin: '0px 0px',
                transition: 'opacity 360ms ease',
              }}
            >
              <svg
                width="176"
                height="26"
                viewBox="0 -13 176 26"
                fill="none"
                className="-mt-[13px] origin-[0px_13px] scale-[0.72] overflow-visible sm:scale-100"
              >
                <ellipse cx="46" cy="11" rx="44" ry="4" fill="#2E282A" opacity="0.12" />
                <polygon points="0,0 11,-3.2 11,3.2" fill="#3D373A" />
                <polygon
                  points="10,-3 26,-6.5 26,6.5 10,3"
                  fill="#E8CFB1"
                  stroke="#C5A37F"
                  strokeWidth="0.6"
                />
                <rect
                  x="26"
                  y="-6.5"
                  width="112"
                  height="13"
                  rx="1.5"
                  fill="#9BB19C"
                  stroke="#789079"
                  strokeWidth="0.7"
                />
                <rect x="26" y="-2.2" width="112" height="4.4" fill="#B5C8B5" opacity="0.75" />
                <rect x="26" y="2.8" width="112" height="3.5" fill="#7D967F" opacity="0.55" />
                <rect
                  x="138"
                  y="-6.6"
                  width="15"
                  height="13.2"
                  rx="1"
                  fill="url(#pencilFerruleGold)"
                  stroke="#A78A62"
                  strokeWidth="0.6"
                />
                <line x1="143" y1="-6.4" x2="143" y2="6.4" stroke="#8C704B" strokeWidth="0.6" opacity="0.6" />
                <line x1="148" y1="-6.4" x2="148" y2="6.4" stroke="#8C704B" strokeWidth="0.6" opacity="0.6" />
                <path
                  d="M153 -6.2 H164 C167 -6.2 169 -3.8 169 0 C169 3.8 167 6.2 164 6.2 H153 Z"
                  fill="#E9B8C3"
                  stroke="#C58F9C"
                  strokeWidth="0.6"
                />
                <defs>
                  <linearGradient id="pencilFerruleGold" x1="138" y1="-7" x2="138" y2="7" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#EBD6B2" />
                    <stop offset="0.5" stopColor="#D3B587" />
                    <stop offset="1" stopColor="#B89869" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* Non-clickable scroll instruction right below the drawing, before the quote */}
      <motion.div
        aria-hidden={!messageVisible}
        initial={{ opacity: 0, y: 8 }}
        animate={messageVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none relative z-10 mt-5 flex select-none flex-col items-center gap-1"
      >
        <span className="text-[11px] tracking-[0.22em] text-[#8D79AE]/90 uppercase">
          Scroll down
        </span>
        <motion.span
          animate={messageVisible ? { y: [0, 5, 0] } : { y: 0 }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[#8D79AE]/80"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.div>

      {/* Poetic Opening Message & Butterfly Blessing Revealed After Sketch & Color Bloom */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={messageVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-4 flex max-w-xl flex-col items-center px-2 text-center sm:mt-5 sm:px-0"
      >
        <blockquote className="font-serif text-[1.2rem] leading-snug font-normal italic text-[#2E282A] sm:text-2xl md:text-[1.75rem]">
          “{message}”
        </blockquote>

        <p className="mt-3.5 font-hand text-[1.2rem] leading-snug text-[#8D79AE] sm:mt-4 sm:text-2xl">
          {scrollPrompt}
        </p>

        <button
          type="button"
          onClick={handleReplay}
          className="mt-3 inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 text-xs text-[#665B5E] transition-colors duration-200 hover:text-[#2E282A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8D79AE] whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Replay sketch</span>
        </button>
      </motion.div>
    </section>
  );
};
