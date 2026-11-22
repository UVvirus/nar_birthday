export interface TracedStroke {
  id: string;
  d: string;
  strokeWidth: number;
  opacity: number;
  color: string;
}

export interface VectorizedPortrait {
  width: number;
  height: number;
  strokes: TracedStroke[];
}

interface Point {
  x: number;
  y: number;
}

const NEIGHBORS_8: [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

/**
 * Converts a polyline of pixel coordinates into a smooth hand-drawn SVG quadratic Bezier path.
 */
function pointsToSmoothSvgPath(pts: Point[]): string {
  if (pts.length < 2) return '';

  // Subsample slightly so tiny pixel jitters become graceful artist curves
  const sampled: Point[] = [pts[0]];
  for (let i = 2; i < pts.length - 1; i += 2) {
    sampled.push(pts[i]);
  }
  sampled.push(pts[pts.length - 1]);

  if (sampled.length === 2) {
    return `M${sampled[0].x.toFixed(1)} ${sampled[0].y.toFixed(1)} L${sampled[1].x.toFixed(1)} ${sampled[1].y.toFixed(1)}`;
  }

  let d = `M${sampled[0].x.toFixed(1)} ${sampled[0].y.toFixed(1)}`;
  for (let i = 1; i < sampled.length - 1; i++) {
    const midX = (sampled[i].x + sampled[i + 1].x) * 0.5;
    const midY = (sampled[i].y + sampled[i + 1].y) * 0.5;
    d += ` Q${sampled[i].x.toFixed(1)} ${sampled[i].y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = sampled[sampled.length - 1];
  d += ` L${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

/**
 * Extracts crisp, continuous vector SVG pencil strokes directly from any loaded portrait image
 * using Gaussian smoothing, Sobel gradient + non-maximum suppression, directional contour chaining,
 * and natural artist sketching ordering (face & eyes first -> hair -> garment -> garden florals).
 */
export function vectorizePortraitForVivus(
  img: HTMLImageElement,
  targetAspectRatio: number
): VectorizedPortrait {
  const safeAspect = Math.max(0.48, Math.min(1.5, targetAspectRatio));
  const width = safeAspect < 0.78 ? 250 : 300;
  const height = Math.round(width / safeAspect);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return { width, height, strokes: [] };
  }

  // Cover-fit image cleanly to working vector resolution
  const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
  let drawW = width;
  let drawH = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > safeAspect) {
    drawW = height * imgRatio;
    offsetX = (width - drawW) * 0.5;
  } else {
    drawH = width / imgRatio;
    offsetY = (height - drawH) * 0.5;
  }

  ctx.fillStyle = '#FBF8F3';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

  let pixels: Uint8ClampedArray;
  try {
    pixels = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return { width, height, strokes: [] };
  }

  // 1. Grayscale luminance
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    gray[i] = 0.299 * pixels[p] + 0.587 * pixels[p + 1] + 0.114 * pixels[p + 2];
  }

  // 2. Light 3x3 Gaussian blur to suppress sensor grain while preserving eyes & embroidery
  const smooth = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      smooth[i] =
        (gray[i - width - 1] +
          2 * gray[i - width] +
          gray[i - width + 1] +
          2 * gray[i - 1] +
          4 * gray[i] +
          2 * gray[i + 1] +
          gray[i + width - 1] +
          2 * gray[i + width] +
          gray[i + width + 1]) /
        16;
    }
  }

  // 3. Sobel magnitude & quantized orientation
  const mag = new Float32Array(width * height);
  const dir = new Uint8Array(width * height); // 0=H, 1=45, 2=V, 3=135

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx =
        -smooth[i - width - 1] +
        smooth[i - width + 1] -
        2 * smooth[i - 1] +
        2 * smooth[i + 1] -
        smooth[i + width - 1] +
        smooth[i + width + 1];
      const gy =
        -smooth[i - width - 1] -
        2 * smooth[i - width] -
        smooth[i - width + 1] +
        smooth[i + width - 1] +
        2 * smooth[i + width] +
        smooth[i + width + 1];

      mag[i] = Math.hypot(gx, gy);

      let angle = (Math.atan2(gy, gx) * 180) / Math.PI;
      if (angle < 0) angle += 180;
      if (angle < 22.5 || angle >= 157.5) dir[i] = 0;
      else if (angle < 67.5) dir[i] = 1;
      else if (angle < 112.5) dir[i] = 2;
      else dir[i] = 3;
    }
  }

  // 4. Non-Maximum Suppression + region-aware thresholding (crisp detail on face, airy soft florals on edges)
  const isTall = height > width * 1.2;
  const faceMinY = isTall ? height * 0.05 : height * 0.1;
  const faceMaxY = isTall ? height * 0.27 : height * 0.52;
  const faceMinX = width * 0.31;
  const faceMaxX = width * 0.69;

  const edges = new Uint8Array(width * height);
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const i = y * width + x;
      const m = mag[i];
      if (m < 24) continue;

      let n1 = 0;
      let n2 = 0;
      const d = dir[i];
      if (d === 0) {
        n1 = mag[i - 1];
        n2 = mag[i + 1];
      } else if (d === 1) {
        n1 = mag[i - width + 1];
        n2 = mag[i + width - 1];
      } else if (d === 2) {
        n1 = mag[i - width];
        n2 = mag[i + width];
      } else {
        n1 = mag[i - width - 1];
        n2 = mag[i + width + 1];
      }

      if (m >= n1 && m >= n2) {
        const inFace = x >= faceMinX && x <= faceMaxX && y >= faceMinY && y <= faceMaxY;
        const inSubject = x >= width * 0.2 && x <= width * 0.8 && y >= height * 0.05 && y <= height * 0.95;
        const threshold = inFace ? 30 : inSubject ? 48 : 66;
        if (m >= threshold) {
          edges[i] = 1;
        }
      }
    }
  }

  // 5. Trace connected edge pixels into continuous strokes
  const visited = new Uint8Array(width * height);
  interface RawChain {
    pts: Point[];
    avgStrength: number;
    cx: number;
    cy: number;
    zone: number; // 0 = face/head, 1 = upper body/kurta, 2 = lower garment, 3 = surrounding florals/butterflies
  }
  const chains: RawChain[] = [];

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const startIdx = y * width + x;
      if (!edges[startIdx] || visited[startIdx]) continue;

      const pts: Point[] = [{ x, y }];
      visited[startIdx] = 1;
      let strengthSum = mag[startIdx];
      let cx = x;
      let cy = y;
      let prevDx = 0;
      let prevDy = 0;

      // Follow connected edge pixels up to 52px per natural stroke
      while (pts.length < 52) {
        const cur = pts[pts.length - 1];
        let bestX = -1;
        let bestY = -1;
        let bestScore = -1e9;

        for (let k = 0; k < NEIGHBORS_8.length; k++) {
          const [dx, dy] = NEIGHBORS_8[k];
          const nx = cur.x + dx;
          const ny = cur.y + dy;
          if (nx < 2 || nx >= width - 2 || ny < 2 || ny >= height - 2) continue;
          const nIdx = ny * width + nx;
          if (!edges[nIdx] || visited[nIdx]) continue;

          // Prefer continuing smoothly in the same direction + stronger gradient
          const align = prevDx === 0 && prevDy === 0 ? 0 : (dx * prevDx + dy * prevDy) * 35;
          const score = mag[nIdx] + align;
          if (score > bestScore) {
            bestScore = score;
            bestX = nx;
            bestY = ny;
          }
        }

        if (bestX === -1) break;
        prevDx = bestX - cur.x;
        prevDy = bestY - cur.y;
        const nextIdx = bestY * width + bestX;
        visited[nextIdx] = 1;
        pts.push({ x: bestX, y: bestY });
        strengthSum += mag[nextIdx];
        cx += bestX;
        cy += bestY;
      }

      if (pts.length >= 5) {
        const meanX = cx / pts.length;
        const meanY = cy / pts.length;
        const inFace =
          meanX >= faceMinX && meanX <= faceMaxX && meanY >= faceMinY && meanY <= faceMaxY;
        const inUpperBody =
          meanX >= width * 0.22 &&
          meanX <= width * 0.78 &&
          meanY >= faceMaxY &&
          meanY <= height * 0.62;
        const inLowerBody =
          meanX >= width * 0.24 && meanX <= width * 0.76 && meanY > height * 0.62;

        const zone = inFace ? 0 : inUpperBody ? 1 : inLowerBody ? 2 : 3;
        chains.push({
          pts,
          avgStrength: strengthSum / pts.length,
          cx: meanX,
          cy: meanY,
          zone,
        });
      }
    }
  }

  // Keep the most expressive strokes (always prioritize face & silhouette detail, cap ~230 paths for silky 60fps Vivus)
  const prioritized = [...chains].sort((a, b) => {
    const scoreA = a.pts.length * (a.zone === 0 ? 3.2 : a.zone === 1 ? 1.8 : a.zone === 2 ? 1.35 : 0.85) + a.avgStrength * 0.14;
    const scoreB = b.pts.length * (b.zone === 0 ? 3.2 : b.zone === 1 ? 1.8 : b.zone === 2 ? 1.35 : 0.85) + b.avgStrength * 0.14;
    return scoreB - scoreA;
  });

  const selected = prioritized.slice(0, 235);

  // Sort selected paths in natural artist drawing order:
  // Face/eyes -> upper body & embroidery -> lower garment -> delicate background flowers & butterflies
  selected.sort((a, b) => {
    if (a.zone !== b.zone) return a.zone - b.zone;
    const bandA = Math.floor(a.cy / 24);
    const bandB = Math.floor(b.cy / 24);
    if (bandA !== bandB) return bandA - bandB;
    return bandA % 2 === 0 ? a.cx - b.cx : b.cx - a.cx;
  });

  const strokes: TracedStroke[] = selected.map((chain, idx) => {
    const isFace = chain.zone === 0;
    const isFloral = chain.zone === 3;
    const intensity = Math.min(1, chain.avgStrength / 145);

    return {
      id: `v-stroke-${idx}`,
      d: pointsToSmoothSvgPath(chain.pts),
      strokeWidth: isFace
        ? 0.92 + intensity * 0.35
        : isFloral
          ? 0.68 + intensity * 0.28
          : 0.82 + intensity * 0.38,
      opacity: isFace
        ? 0.76 + intensity * 0.22
        : isFloral
          ? 0.34 + intensity * 0.24
          : 0.56 + intensity * 0.3,
      color: isFace ? '#362D30' : isFloral ? '#6D6166' : '#463B3F',
    };
  });

  return { width, height, strokes };
}
