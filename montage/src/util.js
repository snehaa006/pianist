import { FPS, HEIGHT, WIDTH } from './edl.js';

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
// The site's legato curve, cubic-bezier(0.22, 1, 0.36, 1), solved for y at x.
export function legato(x) {
  const p1x = 0.22, p1y = 1, p2x = 0.36, p2y = 1;
  let t = x;
  for (let i = 0; i < 8; i++) {
    const cx = 3 * (1 - t) * (1 - t) * t * p1x + 3 * (1 - t) * t * t * p2x + t * t * t;
    const dx = 3 * (1 - t) * (1 - t) * p1x + 6 * (1 - t) * t * (p2x - p1x) + 3 * t * t * (1 - p2x);
    if (Math.abs(dx) < 1e-6) break;
    t = clamp(t - (cx - x) / dx);
  }
  return 3 * (1 - t) * (1 - t) * t * p1y + 3 * (1 - t) * t * t * p2y + t * t * t;
}
export const easeInOut = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeSine = k => -(Math.cos(Math.PI * k) - 1) / 2;
export const sec = f => f / FPS;
export const frames = s => Math.round(s * FPS);

// Interpolate a list of { t, ...values } keys at time t (eased between keys).
export function keyed(keys, t, field, ease = easeInOut) {
  if (t <= keys[0].t) return keys[0][field];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) return lerp(a[field], b[field], ease((t - a.t) / (b.t - a.t || 1)));
  }
  return keys[keys.length - 1][field];
}

// A view of the frame: centre (x, y) in source units, zoom z. Returns the video's box inside a panel of
// size (pw, ph), keeping the frame edges out of view.
export function viewBox(view, pw = WIDTH, ph = HEIGHT) {
  const scale = Math.max(pw / WIDTH, ph / HEIGHT) * view.z;
  const w = WIDTH * scale, h = HEIGHT * scale;
  let left = pw / 2 - view.x * w;
  let top = ph / 2 - view.y * h;
  left = clamp(left, pw - w, 0);
  top = clamp(top, ph - h, 0);
  return { left, top, width: w, height: h };
}

export const mixView = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) });
