// The end of the Biography page, after the poster of a keyboard that turns into a city: the keys run toward you in
// perspective, and at their far end every white key rises into a tower (flat roofs, aerials, setbacks, sloped tops,
// little roof blocks), cream on the ink. One SVG, drawn from a fixed seed so it is the same every time; the towers
// grow up out of the keys as it comes into view (`reveal`, see .skyline in site.css). It is sized by its height (the
// room the footer leaves it): the drawing runs a screen's width further on either side, so wider boxes see more keys
// and narrower ones the middle.

const W = 1440; // the middle stretch, where the keyboard's perspective is centred
const H = 620;
const BACK = 360; // y of the keyboard's far edge, where the towers stand; the keys come forward to the bottom (H)
const VANISH = 35; // y where the keys' edges would meet, far above: a key is 1.8 times as wide at the front
const CX = W / 2;
const PITCH = 40; // a white key's width at the far edge: 36 keys across the middle stretch, 108 in all
const GAP = 3; // the line between two white keys there
const BLACK = 0.58; // a black key's width (share of PITCH) and its length (share of the keys' depth)
const BLACK_AFTER = [true, true, false, true, true, true, false]; // white keys a black key follows, from C
const SHADE = '#D3C7B7'; // the cream in the shadow where the towers meet the keys

// Seeded, so the city is the same on every visit.
function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const at = (x, y) => CX + ((x - CX) * (y - VANISH)) / (BACK - VANISH); // x at the far edge, seen at depth y
const n = v => Math.round(v * 10) / 10;
const rect = (x0, y0, x1, y1) => `M${n(x0)} ${n(y1)}V${n(y0)}H${n(x1)}V${n(y1)}Z`;
const quad = (x0, x1, y0, y1) => `M${n(at(x0, y0))} ${y0}L${n(at(x1, y0))} ${y0}L${n(at(x1, y1))} ${y1}L${n(at(x0, y1))} ${y1}Z`;

// One tower on [x0, x1], `h` tall, its roof picked by r.
function tower(x0, x1, h, r) {
  const top = BACK - h;
  const w = x1 - x0;
  const kind = r();
  if (kind < 0.28) return rect(x0, top, x1, BACK); // flat
  if (kind < 0.48) {
    // an aerial, sometimes on a small block
    const ax = x0 + w * (0.3 + r() * 0.4);
    const block = r() < 0.5 ? rect(ax - w * 0.2, top - 6, ax + w * 0.2, top) : '';
    return rect(x0, top, x1, BACK) + block + rect(ax - 1, top - 14 - r() * 20, ax + 1, top);
  }
  if (kind < 0.68) {
    // a setback: a narrower storey on top, to one side or in the middle
    const sw = w * (0.6 + r() * 0.2);
    const side = r();
    const sx = side < 0.35 ? x0 : side < 0.7 ? x1 - sw : x0 + (w - sw) / 2;
    return rect(x0, top, x1, BACK) + rect(sx, top - 6 - r() * 8, sx + sw, top);
  }
  if (kind < 0.84) {
    // a sloped roof
    const d = 5 + r() * 9;
    const left = r() < 0.5;
    return `M${n(x0)} ${BACK}V${n(top + (left ? d : 0))}L${n(x1)} ${n(top + (left ? 0 : d))}V${BACK}Z`;
  }
  if (kind < 0.95) {
    // little blocks on the roof
    const k = 2 + Math.floor(r() * 2);
    const bw = Math.min(5, w / (k * 2));
    let blocks = '';
    for (let i = 0; i < k; i++) {
      const bx = x0 + 2 + i * (bw + 2);
      blocks += rect(bx, top - 4, bx + bw, top);
    }
    return rect(x0, top, x1, BACK) + blocks;
  }
  // a thin cap, standing a little clear of the roof
  return rect(x0, top, x1, BACK) + rect(x0, top - 5, x1, top - 3);
}

function build() {
  const r = random(23);
  const keys = [];
  const blacks = [];
  const towers = [];
  const first = -W / PITCH;
  const last = (2 * W) / PITCH - 1;
  const front = H;
  const blackEnd = BACK + BLACK * (H - BACK);
  const bw = PITCH * BLACK;
  const hasBlack = i => BLACK_AFTER[((i % 7) + 7) % 7];
  for (let i = first; i <= last; i++) {
    const l = i * PITCH;
    const rt = l + PITCH;
    keys.push(quad(l + GAP / 2, rt - GAP / 2, BACK, front));
    if (i < last && hasBlack(i)) blacks.push(quad(rt - bw / 2, rt + bw / 2, BACK, blackEnd));
    // The tower stands on the part of the key the black keys leave free.
    const x0 = hasBlack(i - 1) ? l + bw / 2 : l + GAP / 2;
    const x1 = hasBlack(i) ? rt - bw / 2 : rt - GAP / 2;
    const h = 70 + 140 * r() ** 0.85;
    // They rise from the middle outward.
    towers.push({ d: tower(x0, x1, h, r), delay: Math.round((Math.abs(l + PITCH / 2 - CX) / PITCH) * 30 + r() * 120) });
  }
  return { keys: keys.join(''), blacks: blacks.join(''), towers };
}

const CITY = build();

export default function Skyline({ className = '' }) {
  return (
    <svg className={`skyline reveal ${className}`} viewBox={`${-W} 0 ${3 * W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="skyline-tower" gradientUnits="userSpaceOnUse" x1="0" y1={BACK - 34} x2="0" y2={BACK}>
          <stop offset="0" style={{ stopColor: 'var(--color-ivory)' }} />
          <stop offset="1" stopColor={SHADE} />
        </linearGradient>
        <linearGradient id="skyline-key" gradientUnits="userSpaceOnUse" x1="0" y1={BACK} x2="0" y2={BACK + 24}>
          <stop offset="0" stopColor={SHADE} />
          <stop offset="1" style={{ stopColor: 'var(--color-ivory)' }} />
        </linearGradient>
      </defs>
      <path d={CITY.keys} fill="url(#skyline-key)" />
      <path d={CITY.blacks} style={{ fill: 'var(--color-ink)' }} />
      {CITY.towers.map((t, i) => (
        <path key={i} className="skyline__tower" d={t.d} fill="url(#skyline-tower)" style={{ '--d': `${t.delay}ms` }} />
      ))}
    </svg>
  );
}
