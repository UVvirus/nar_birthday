"""
Reusable Python OpenCV script to regenerate the graphite pencil sketch PNG
and nearest-neighbor artist-ordered contour paths from any replacement portrait photo.

Usage (local machine with Python + OpenCV):
    pip install opencv-python numpy
    python scripts/generate_opencv_sketch.py path/to/portrait.jpg
"""

import json
import math
import sys
from pathlib import Path
import cv2
import numpy as np


def chain_nearest_neighbor(contours, start_x, start_y):
    remaining = list(contours)
    ordered = []
    cur_x, cur_y = start_x, start_y
    while remaining:
        best_idx = 0
        best_dist = float("inf")
        reverse_flag = False
        for i, item in enumerate(remaining):
            pts = item["pts"]
            d_start = math.hypot(pts[0][0] - cur_x, pts[0][1] - cur_y)
            d_end = math.hypot(pts[-1][0] - cur_x, pts[-1][1] - cur_y)
            if d_start < best_dist:
                best_dist = d_start
                best_idx = i
                reverse_flag = False
            if d_end < best_dist:
                best_dist = d_end
                best_idx = i
                reverse_flag = True
        picked = remaining.pop(best_idx)
        pts = list(reversed(picked["pts"])) if reverse_flag else picked["pts"]
        ordered.append({"z": picked["zone"], "p": pts})
        cur_x, cur_y = pts[-1]
    return ordered


def generate_opencv_assets(image_path: str):
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")

    W, H = 720, 1280
    resized = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

    # 1. Color-dodge graphite pencil sketch blended with bilateral adaptive outlines
    inverted = cv2.bitwise_not(gray)
    blurred = cv2.GaussianBlur(inverted, (31, 31), 0)
    dodge = cv2.divide(gray, 255 - blurred, scale=256.0)
    bilateral = cv2.bilateralFilter(gray, 9, 55, 55)
    adaptive = cv2.adaptiveThreshold(
        bilateral, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 4
    )

    tone = np.clip(dodge * 0.84 + adaptive * 0.16, 28, 255)
    ink = np.clip((255.0 - tone) / 227.0, 0.0, 1.0)

    sketch_bgr = np.zeros((H, W, 3), dtype=np.uint8)
    sketch_bgr[:, :, 2] = np.round(251 - ink * 199)  # R
    sketch_bgr[:, :, 1] = np.round(248 - ink * 205)  # G
    sketch_bgr[:, :, 0] = np.round(243 - ink * 196)  # B

    out_sketch = Path("public/assets/portrait_opencv_sketch.png")
    out_sketch.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out_sketch), sketch_bgr)

    # 2. Canny + findContours + approxPolyDP artist stroke extraction
    CW, CH = 360, 640
    small = cv2.resize(bilateral, (CW, CH), interpolation=cv2.INTER_AREA)
    edges = cv2.Canny(small, 42, 118, L2gradient=True)
    edges_face = cv2.Canny(small, 22, 68, L2gradient=True)

    fx0, fx1 = int(CW * 0.34), int(CW * 0.66)
    fy0, fy1 = int(CH * 0.06), int(CH * 0.25)
    edges[fy0:fy1, fx0:fx1] = np.maximum(edges[fy0:fy1, fx0:fx1], edges_face[fy0:fy1, fx0:fx1])

    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    extracted = []
    for cnt in contours:
        arc = cv2.arcLength(cnt, False)
        if arc < 14:
            continue
        approx = cv2.approxPolyDP(cnt, 1.35, False).reshape(-1, 2)
        pts = [[int(x), int(y)] for x, y in approx]
        if len(pts) < 3:
            continue
        cx = sum(p[0] for p in pts) / len(pts)
        cy = sum(p[1] for p in pts) / len(pts)
        zone = 0 if (fx0 <= cx <= fx1 and fy0 <= cy <= fy1) else (1 if CW * 0.22 <= cx <= CW * 0.78 else 2)
        extracted.append({"pts": pts, "arc": arc, "zone": zone})

    face = sorted([c for c in extracted if c["zone"] == 0], key=lambda c: -c["arc"])[:75]
    subj = sorted([c for c in extracted if c["zone"] == 1], key=lambda c: -c["arc"])[:145]
    flor = sorted([c for c in extracted if c["zone"] == 2], key=lambda c: -c["arc"])[:55]

    ordered = (
        chain_nearest_neighbor(face, CW * 0.5, CH * 0.14)
        + chain_nearest_neighbor(subj, CW * 0.5, CH * 0.26)
        + chain_nearest_neighbor(flor, CW * 0.2, CH * 0.5)
    )

    out_ts = Path("src/data/portraitOpenCVPaths.ts")
    out_ts.write_text(
        f"export interface OpenCVContourStroke {{ z: number; p: [number, number][]; }}\n"
        f"export const OPENCV_PORTRAIT_WIDTH = {CW};\n"
        f"export const OPENCV_PORTRAIT_HEIGHT = {CH};\n"
        f"export const OPENCV_SKETCH_IMAGE_URL = '/assets/portrait_opencv_sketch.png';\n"
        f"export const OPENCV_PORTRAIT_STROKES: OpenCVContourStroke[] = {json.dumps(ordered)};\n",
        encoding="utf-8",
    )
    print(f"Generated {out_sketch} and {out_ts} ({len(ordered)} contours).")


if __name__ == "__main__":
    src_img = sys.argv[1] if len(sys.argv) > 1 else "src/assets/images/portrait_full_hd_1795145835089.jpg"
    generate_opencv_assets(src_img)
