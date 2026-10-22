import { useEffect, useRef } from 'react';
import { useDrift } from '../lib/hooks';

// A painted hand fan of piano keys, after the client's picture of one: paper leaves, one white key each, pleated so
// the rim steps in and out, with a red border between cream lines along it and a red filigree where each leaf meets its
// stick; black keys lie on the leaves, lit from the top left. Below the leaves the sticks show, cream between dark
// wood, then close into the dark hub round a jewelled rivet; the guard stick runs out to the right as the handle.
// Behind it, rays of light, five staff lines and two red arcs; music notes leave the rim and fly away up the page,
// as the birds leave the hero's keyboard.
// Colours are the site's own: cream paper, crimson, ink and lacquer, dust where the picture has gold.
//
// It opens as it scrolls into view: --open (0 shut, 1 open, from useDrift's --p, see site.css) turns each leaf and the
// handle about the pivot from straight up to its place, so shut it is a single key standing on the pivot. Shadows are
// drawn shapes, not filters, so nothing is re-rendered as it turns. The ground (rays, staff, arcs) and the notes come
// in as it opens. With reduced motion it is open and the notes rest on the staff.
const CX = 600;
const CY = 600; // the pivot, in the viewBox
const R = 470; // the rim (alternate leaves stand a little in, the pleat)
const RIN = 285; // where the paper begins
const RH = 150; // the dark hub, where the sticks close together
const BAND = 20; // the red border
const A0 = -84;
const A1 = 89; // the span, degrees from straight up
const N = 22; // leaves: three octaves of white keys and a C
const W = (A1 - A0) / N;
const GUARD = 93; // the handle
const HORIZON = 497; // where the cream sheet meets the ink below it (site.css hangs the fan so)
const BLACK_AFTER = [0, 1, 3, 4, 5]; // white keys (C=0 … B=6) followed by a black key

const pt = (r, deg) => {
  const t = (deg * Math.PI) / 180;
  return `${(CX + r * Math.sin(t)).toFixed(1)} ${(CY - r * Math.cos(t)).toFixed(1)}`;
};
const wedge = (r1, r2, h) => `M${pt(r1, -h)}L${pt(r2, -h)}L${pt(r2, h)}L${pt(r1, h)}Z`;
const chord = (r, h) => `M${pt(r, -h)}L${pt(r, h)}`;
const arc = (r, a, b) => `M${pt(r, a)}A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${pt(r, b)}`;

const H = W / 2;
const leaf = ro => ({
  paper: wedge(RIN, ro, H),
  band: wedge(ro - BAND, ro, H),
  stripes: `${chord(ro - BAND, H)}${chord(ro - 4, H)}`,
  rim: chord(ro, H)
});
const LEAVES = [leaf(R), leaf(R - 7)];
const FOLDS = `M${pt(RIN, -H)}L${pt(R, -H)}`;
// A filigree where the paper meets its stick: a stem rising from the edge and two scrolls curling away from it.
const fy = CY - RIN;
const FILIGREE = [
  `M${CX} ${fy - 3}V${fy - 30}`,
  `M${CX} ${fy - 8}c-3 -7 -11 -7 -13 -2c-2 5 4 8 6 4`,
  `M${CX} ${fy - 8}c3 -7 11 -7 13 -2c2 5 -4 8 -6 4`,
  `M${CX} ${fy - 20}c-2 -5 -8 -5 -9 -1M${CX} ${fy - 20}c2 -5 8 -5 9 -1`,
  `M${CX - 16} ${fy - 2}H${CX + 16}`
].join('');
const RING = wedge(RH, RIN, H);
const STICK = wedge(0, RIN + 6, H * 0.34);
const PINS = `M${pt(RH, -H * 0.62)}L${pt(RIN, -H * 0.62)}M${pt(RH, H * 0.62)}L${pt(RIN, H * 0.62)}`;
const HUB = wedge(0, RH, H);
const GRAIN = `M${pt(14, 0)}L${pt(RH, 0)}`;

// A black key lying on the leaves: its body, the lit top, the bevelled front (toward the pivot) and a glint.
const BK = { top: CY - (R - BAND - 6), len: 122, w: 15 };
const bkBottom = BK.top + BK.len;
const BLACK = {
  body: `M${CX - BK.w} ${BK.top}H${CX + BK.w}V${bkBottom}H${CX - BK.w}Z`,
  face: `M${CX - BK.w + 3} ${BK.top + 3}H${CX + BK.w - 4}V${bkBottom - 12}H${CX - BK.w + 3}Z`,
  front: `M${CX - BK.w} ${bkBottom}H${CX + BK.w}L${CX + BK.w - 4} ${bkBottom - 12}H${CX - BK.w + 3}Z`,
  glint: `M${CX - BK.w + 5} ${BK.top + 6}V${bkBottom - 16}`
};

// The guard stick, as the handle: lacquered wood with an inlaid line, two jewels and a curl.
const tip = CY - R - 74;
const HANDLE = {
  body: `M${CX - 22} ${CY + 34}L${CX + 22} ${CY + 34}L${CX + 16} ${tip + 16}Q${CX} ${tip - 8} ${CX - 16} ${tip + 16}Z`,
  inlay: `M${CX} ${CY - 40}V${tip + 22}`,
  curl: `M${CX} ${CY - R + 30}c-8 -10 -8 -22 0 -30c8 -8 8 -20 0 -30M${CX} ${CY - R + 30}c8 -10 8 -22 0 -30`
};
const SCALLOP = Array.from({ length: 11 }, (_, i) => 180 + (i - 5) * 11);

const NOTES = ['q', 'e', 'b', 's'];
const TONES = ['ink', 'ink', 'red', 'ink', 'felt'];
// Each note leaves the rim at its own angle and flies away up the page, out a little to its side and swaying, slow off
// the rim and quicker as it climbs, like the hero's birds; then another leaves. The delays are negative so the flight
// is already under way when the fan opens. Distances are in viewBox units, turned into cqw.
const FLIGHT = Array.from({ length: 18 }, (_, i) => {
  const j = Math.sin(i * 12.9898) * 43758.5453;
  const r = j - Math.floor(j); // a fixed scatter, 0..1
  const a = -72 + (144 * i) / 17 + (r - 0.5) * 6;
  const t = (a * Math.PI) / 180;
  const start = R + 14;
  const out = 120 + r * 160;
  const up = 900 + ((i * 137) % 500);
  return {
    kind: NOTES[i % 4],
    tone: TONES[i % 5],
    x: ((CX + start * Math.sin(t)) / 1200) * 100,
    y: ((CY - start * Math.cos(t)) / 700) * 100,
    dx: (out * Math.sin(t)) / 12,
    dy: (-out * Math.cos(t) - up) / 12,
    r0: (r - 0.5) * 30,
    r1: (r - 0.5) * -50 + (a > 0 ? 18 : -18),
    size: 0.9 + ((i * 7) % 5) / 10,
    dur: 9 + ((i * 5) % 7) * 0.8,
    delay: -((i * 2.9) % 14)
  };
});

function Note({ kind }) {
  const head = (cx, cy) => <ellipse cx={cx} cy={cy} rx="7.4" ry="5.2" transform={`rotate(-22 ${cx} ${cy})`} />;
  if (kind === 'b') {
    return (
      <svg viewBox="0 0 36 46">
        {head(8, 38)}
        {head(25, 34)}
        <path d="M13.4 10.5h2.2V38h-2.2zM30.4 6.5h2.2V34h-2.2zM13.4 10.5L32.6 6.5v5.4L13.4 16z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 44">
      {head(10, 36)}
      <path d="M15.6 6h2.2v30h-2.2z" />
      {kind !== 'q' && <path d="M17.8 6c.2 7 9.2 9 7.2 20-1-7-4-10-7.2-11z" />}
      {kind === 's' && <path d="M17.8 13c.2 7 9.2 9 7.2 20-1-7-4-10-7.2-11z" />}
    </svg>
  );
}

export default function KeyFan({ className = '' }) {
  const ref = useRef(null);
  useDrift(ref);
  // The notes fly only while the fan is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-on', e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const angles = Array.from({ length: N }, (_, i) => A0 + W * (i + 0.5));
  const blacks = [];
  for (let i = 0; i < N - 1; i++) if (BLACK_AFTER.includes(i % 7)) blacks.push(A0 + W * (i + 1));
  const leafStyle = a => ({ '--a': `${a}deg` });

  return (
    <div ref={ref} className={`keyfan ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 700">
        <defs>
          <clipPath id="kf-sky">
            <rect width="1200" height={HORIZON} />
          </clipPath>
          <radialGradient id="kf-rays-fade" cx={CX} cy={CY} r="640" gradientUnits="userSpaceOnUse">
            <stop offset="0.3" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="kf-rays-mask">
            <rect width="1200" height="700" fill="url(#kf-rays-fade)" />
          </mask>
          <linearGradient id="kf-paper" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-paper)" />
            <stop offset="1" stopColor="var(--color-ivory)" />
          </linearGradient>
          <linearGradient id="kf-paper-shade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#E9DCC8" />
            <stop offset="1" stopColor="var(--color-ivory)" />
          </linearGradient>
          <linearGradient id="kf-black" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-graphite)" />
            <stop offset="0.55" stopColor="var(--color-lacquer)" />
            <stop offset="1" stopColor="var(--color-ink)" />
          </linearGradient>
          <linearGradient id="kf-wood" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-graphite)" />
            <stop offset="0.45" stopColor="var(--color-lacquer)" />
            <stop offset="1" stopColor="var(--color-ink)" />
          </linearGradient>
        </defs>

        <g className="keyfan__ground" clipPath="url(#kf-sky)">
          <g mask="url(#kf-rays-mask)">
            {Array.from({ length: 20 }, (_, i) => (
              <path key={i} className={`keyfan__ray keyfan__ray--${i % 2}`} d={wedge(0, 900, 4.6)} transform={`rotate(${-95 + i * 10} ${CX} ${CY})`} />
            ))}
          </g>
          <path className="keyfan__staff" d={[0, 1, 2, 3, 4].map(k => arc(R + 40 + k * 11, -100, 100)).join('')} />
          <path className="keyfan__arc" d={arc(R + 98, -100, 100)} />
          <path className="keyfan__arc keyfan__arc--thin" d={arc(R + 110, -100, 100)} />
        </g>

        <g className="keyfan__scallop">
          {SCALLOP.map(a => (
            <path key={a} d={wedge(0, 48, 5)} transform={`rotate(${a} ${CX} ${CY})`} />
          ))}
        </g>

        {angles.map((a, i) => {
          const L = LEAVES[i % 2];
          return (
            <g key={`l${i}`} className="keyfan__k" style={leafStyle(a)}>
              <path className="keyfan__hub" d={HUB} />
              <path className="keyfan__grain" d={GRAIN} />
              <path className="keyfan__ring" d={RING} />
              <path className="keyfan__pins" d={PINS} />
              <path className="keyfan__stick" d={STICK} />
              <path className="keyfan__paper" d={L.paper} fill={i % 2 ? 'url(#kf-paper-shade)' : 'url(#kf-paper)'} />
              <path className="keyfan__fold" d={FOLDS} />
              <path className="keyfan__filigree" d={FILIGREE} />
              <path className="keyfan__band" d={L.band} />
              <path className="keyfan__stripes" d={L.stripes} />
              <path className="keyfan__rim" d={L.rim} />
            </g>
          );
        })}

        <g>
          {blacks.map(a => (
            <g key={`b${a}`} className="keyfan__k" style={leafStyle(a)}>
              <path className="keyfan__shadow" d={BLACK.body} transform="translate(4 6)" />
              <path className="keyfan__bk" d={BLACK.body} />
              <path d={BLACK.face} fill="url(#kf-black)" />
              <path className="keyfan__bk-front" d={BLACK.front} />
              <path className="keyfan__bk-glint" d={BLACK.glint} />
            </g>
          ))}
        </g>

        <g className="keyfan__k" style={leafStyle(GUARD)}>
          <path className="keyfan__shadow" d={HANDLE.body} transform="translate(-6 4)" />
          <path d={HANDLE.body} fill="url(#kf-wood)" className="keyfan__handle" />
          <path className="keyfan__inlay" d={HANDLE.inlay} />
          <path className="keyfan__curl" d={HANDLE.curl} />
          <circle className="keyfan__jewel" cx={CX} cy={tip + 30} r="8.5" />
          <circle className="keyfan__pearl" cx={CX} cy={tip + 30} r="2.8" />
          <circle className="keyfan__jewel" cx={CX} cy={CY - R + 70} r="5.5" />
        </g>

        <circle className="keyfan__rivet" cx={CX} cy={CY} r="24" />
        <circle className="keyfan__jewel" cx={CX} cy={CY} r="14" />
        <circle className="keyfan__pearl" cx={CX} cy={CY} r="6" />
      </svg>

      <div className="keyfan__notes">
        {FLIGHT.map((n, i) => (
          <span
            key={i}
            className={`keyfan__note keyfan__note--${n.tone}`}
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              '--dx': `${n.dx}cqw`,
              '--dy': `${n.dy}cqw`,
              '--r0': `${n.r0}deg`,
              '--r1': `${n.r1}deg`,
              '--size': n.size,
              '--dur': `${n.dur}s`,
              '--delay': `${n.delay}s`
            }}
          >
            <Note kind={n.kind} />
          </span>
        ))}
      </div>
    </div>
  );
}
