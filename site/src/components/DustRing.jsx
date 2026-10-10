import { useEffect, useRef } from 'react';
import { palette } from './fx/presets';

// The sound gate's ring for browsers without WebGPU, phones and reduced motion: 2D canvas dust that follows
// the same path as the AeroShards `ring` flow (the Watch ribbon closed into a circle: three travelling crests,
// a band that twists twice per turn). Reduced motion draws one still frame.
const TAU = Math.PI * 2;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const TONES = [
  { rgb: hex(palette.dust), share: 0.62 },
  { rgb: hex(palette.ivory), share: 0.3 },
  { rgb: hex(palette.brass), share: 0.08 } // brass ornament, on ink only
];

function seedParticles(count) {
  // Deterministic, so every visit draws the same ring.
  let s = 7;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-6))) * Math.cos(TAU * rand());
  return Array.from({ length: count }, () => {
    const pick = rand();
    const tone = pick < TONES[0].share ? TONES[0] : pick < TONES[0].share + TONES[1].share ? TONES[1] : TONES[2];
    const loose = rand() > 0.9;
    return {
      phase: rand(),
      lane: rand() - 0.5,
      scatter: gauss() * (loose ? 0.1 : 0.03),
      size: 0.9 + Math.pow(rand(), 3) * 2.2,
      alpha: 0.35 + rand() * 0.55,
      drift: 0.85 + rand() * 0.3,
      rgb: tone.rgb
    };
  });
}

export default function DustRing({ still = false, count }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const narrow = window.innerWidth < 700;
    const particles = seedParticles(count ?? (narrow ? 1800 : 3600));
    const fills = particles.map(p => `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${p.alpha.toFixed(3)})`);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = t => {
      // Same units as the shader: half the height is 1.
      const unit = h / 2;
      const ring = Math.min(0.68, (w / h) * 1.1);
      const travel = t * 0.17; // speed 0.5 × 0.34, as in AeroShards
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const angle = (((p.phase + (travel * p.drift) / (TAU * ring)) % 1) + 1) % 1 * TAU;
        const crest = Math.sin(angle * 3 - travel * 1.4) * 0.045;
        const twist = angle * 2 + travel * 0.5;
        const r = (ring + crest + Math.cos(twist) * p.lane * 0.36 * 0.8 + p.scatter) * unit;
        const x = cx + Math.cos(angle) * r;
        const y = cy - Math.sin(angle) * r;
        // The twist turns part of the band towards the light: those grains read brighter and larger.
        const face = 0.75 + Math.sin(twist) * p.lane * 0.5;
        ctx.fillStyle = fills[i];
        const s = p.size * face;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    };

    resize();
    let raf = 0;
    const t0 = performance.now();
    const loop = now => {
      draw((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    if (still) draw(0);
    else raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      if (still) draw(0);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [still, count]);

  return <canvas ref={ref} className="dust-ring" aria-hidden="true" />;
}
