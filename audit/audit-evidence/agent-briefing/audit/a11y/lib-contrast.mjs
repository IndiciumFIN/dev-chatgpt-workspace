// WCAG 2.x contrast maths + real-pixel colour extraction (modal colour of the box).
export function srgbToLin(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
export function relLuminance([r, g, b]) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
export function contrast(a, b) {
  const la = relLuminance(a), lb = relLuminance(b);
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
export const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
export const rgbStr = ([r, g, b]) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * Modal (most frequent, tolerance-clustered) colour of a pixel buffer.
 * Corners are deliberately NOT used: they catch the border / antialiasing edge.
 */
export function modalColor(img, { x0 = 0, y0 = 0, x1 = img.width, y1 = img.height, tol = 6 } = {}) {
  const bins = new Map();
  const d = img.data;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * img.width + x) * 4;
      if (d[i + 3] < 8) continue;
      const key = `${d[i] >> 3},${d[i + 1] >> 3},${d[i + 2] >> 3}`;
      const b = bins.get(key) || { n: 0, r: 0, g: 0, bl: 0 };
      b.n++; b.r += d[i]; b.g += d[i + 1]; b.bl += d[i + 2];
      bins.set(key, b);
    }
  }
  if (!bins.size) return null;
  let best = null;
  for (const b of bins.values()) if (!best || b.n > best.n) best = b;
  const c = [best.r / best.n, best.g / best.n, best.bl / best.n];
  // mean absolute deviation inside the winning cluster -> tells us how flat the box is
  let sad = 0, cnt = 0;
  for (const [key, b] of bins) {
    const [r, g, bl] = key.split(",").map((v) => v * 8 + 4);
    if (dist([r, g, bl], c) <= 24) {
      sad += (b.n * dist([b.r / b.n, b.g / b.n, b.bl / b.n], c)); cnt += b.n;
    }
  }
  return { rgb: c, hex: hex(c), share: best.n / Math.max(1, cnt), flatness: cnt ? sad / cnt : 0, total: cnt };
}

/**
 * Real glyph colour: take every pixel far enough from the box background and
 * return the modal cluster among them. Antialiased fringe pixels sit close to
 * the background and are discarded, so thin small text still resolves.
 */
export function glyphColor(img, bg, { x0 = 0, y0 = 0, x1 = img.width, y1 = img.height, minDist = 42, tol = 8 } = {}) {
  const far = [];
  const d = img.data;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * img.width + x) * 4;
      if (d[i + 3] < 8) continue;
      const c = [d[i], d[i + 1], d[i + 2]];
      if (dist(c, bg) >= minDist) far.push(c);
    }
  }
  if (!far.length) return null;
  const bins = new Map();
  for (const c of far) {
    const key = `${c[0] >> 3},${c[1] >> 3},${c[2] >> 3}`;
    const b = bins.get(key) || { n: 0, r: 0, g: 0, bl: 0, cs: [] };
    b.n++; b.r += c[0]; b.g += c[1]; b.bl += c[2];
    bins.set(key, b);
  }
  let best = null;
  for (const b of bins.values()) {
    const m = [b.r / b.n, b.g / b.n, b.bl / b.n];
    if (!best || b.n > best.n) best = { ...b, m };
  }
  return { rgb: best.m, hex: hex(best.m), pixels: far.length, clusters: bins.size };
}