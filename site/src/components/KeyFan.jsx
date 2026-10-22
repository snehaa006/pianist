import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useScrub } from '../lib/hooks';
import { useSound } from '../lib/sound.jsx';
import { fold, strike, tapPress, TAP_LIFE } from '../lib/tone';
import { NOTE_KINDS, NOTE_SHAPES } from '../lib/notes';

// A painted hand fan of piano keys, drawn after the client's picture of one, measure for measure: 28 paper leaves, one
// white key each, from a little above level at the left round to the handle at the right. Leaves alternate cream and
// tan, as the pleats catch the light or turn from it, and alternate leaves stand a little in, so the rim steps. Along
// the rim runs a deep red border between two gold lines; at each key's foot is red and gold tracery. Black keys lie on
// the leaves as on a keyboard, lit from the top left. Below the paper the sticks show, dark wood between cream, then
// close into a ribbed dark hub. The handle is the last stick: dark wood with gold engraving and a red jewel, lying
// along the right edge past the rim, with a jewelled rivet at the pivot and the sticks' heads fanned below it. Behind
// it, five staff lines with notes written on them and two gold arcs (the picture's rays of light are left out); the
// leaves overhang the line where the cream sheet meets the ink, as the fan in the picture does. Music notes leave the rim and fly away up the
// page, past her words, as the birds leave the hero's keyboard.
//
// It opens as it scrolls into view and shuts again when scrolled back: --open (0 shut, 1 open) is eased toward where
// the fan stands on the screen (useScrub), and turns each leaf and black key about the pivot from straight up to its
// place, while the handle swings up from hanging straight down to lie along the right edge; shut, it is a single key
// standing on its handle. Every leaf, black key and the handle is its own small SVG, turned by a CSS transform, so the
// browser moves them as layers and never redraws them while the fan opens. The ground (staff, arcs) and the notes come
// in as it opens. With reduced motion it is open and the flying notes rest above the rim.
//
// The keys can be played: pressing one (white or black) dips it toward the pivot and lights it, sounds its note
// (lib/tone.js; the leaves run from C2 at the left to B5 at the right, middle C at the top) and lets a few notes fly up
// from its tip. While "Hear me play" is on, the keys play along with her: each goes down with the note she plays on it
// (folded into the fan's four octaves), and a note flies off it as the note begins.
const CX = 600;
const CY = 600; // the pivot, in the viewBox
const R = 500; // the rim (alternate leaves stand PLEAT in)
const PLEAT = 5;
const RIN = 235; // where the paper begins
const RH = 98; // the dark hub, where the sticks close together
const BAND = 19; // the red border with its gold lines
const START = -86; // the first leaf's outer edge, in degrees from straight up
const N = 28; // leaves: four octaves of white keys, C to B
const W = 6; // each leaf's width, in degrees
const H = W / 2;
const GUARD = 84.5; // the handle's angle, lying along the last leaf
const HORIZON = 484; // where the cream sheet meets the ink below it (site.css hangs the fan so)
const BLACK_AFTER = [0, 1, 3, 4, 5]; // white keys (C=0 … B=6) followed by a black key
const WHITE_STEPS = [0, 2, 4, 5, 7, 9, 11]; // semitones of C D E F G A B
const LOW = 36;
const HIGH = 83; // C2 to B5, the fan's range
const whiteMidi = i => LOW + 12 * Math.floor(i / 7) + WHITE_STEPS[i % 7]; // leaf 0 is C2
const PLAYED = { down: 0.035, up: 0.14 }; // a played note's key goes down and comes back up over these (s), as elsewhere
const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const xy = (r, deg) => {
  const t = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(t), CY - r * Math.cos(t)];
};
const pt = (r, deg) =>
  xy(r, deg)
    .map(v => v.toFixed(1))
    .join(' ');
const wedge = (r1, r2, a, b = -a) => `M${pt(r1, b)}L${pt(r2, b)}L${pt(r2, a)}L${pt(r1, a)}Z`;
const chord = (r, h) => `M${pt(r, -h)}L${pt(r, h)}`;
const arc = (r, a, b) => `M${pt(r, a)}A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${pt(r, b)}`;

// A leaf, drawn pointing straight up: its paper, the fold's shade down its right side, the red border, its gold lines
// and its edges.
const leaf = ro => ({
  paper: wedge(RIN, ro, H),
  shade: wedge(RIN, ro, H, H - 1.5),
  crease: wedge(RIN, ro, H, H - 0.6),
  band: wedge(ro - BAND, ro, H),
  gilt: `${chord(ro - 3.2, H)}${chord(ro - BAND + 3.4, H)}`,
  edge: chord(ro - BAND, H),
  rim: chord(ro, H)
});
const LEAVES = [leaf(R), leaf(R - PLEAT)];
// The tracery at a key's foot, after the picture: gold lines inset up both sides, curling in at their tops; a red ogee
// arch, flared from the corners and rising to a point, with a small gold arch inside it; a gold V falling from the sides
// to the middle across it; a gold bud at the arch's point; a red line along the foot.
const C = (r1, d1, r2, d2, r3, d3) => `C${pt(r1, d1)} ${pt(r2, d2)} ${pt(r3, d3)}`;
const mirror = f => `${f(1)}${f(-1)}`;
const TRACERY = {
  gilt: [
    mirror(s => `M${pt(RIN + 6, s * 2)}L${pt(RIN + 64, s * 2)}${C(RIN + 69, s * 2, RIN + 70, s * 1.5, RIN + 67, s * 1.3)}`),
    mirror(s => `M${pt(RIN + 5, s * 1.3)}${C(RIN + 8, s * 0.45, RIN + 13, s * 0.15, RIN + 21, 0)}`),
    mirror(s => `M${pt(RIN + 38, s * 2)}${C(RIN + 27, s * 1.7, RIN + 14, s * 0.5, RIN + 5, 0)}`),
    `M${pt(RIN + 31, 0)}L${pt(RIN + 37, 0)}`,
    mirror(s => `M${pt(RIN + 34, 0)}${C(RIN + 37, s * 0.4, RIN + 40, s * 0.8, RIN + 43, s * 0.55)}`)
  ].join(''),
  red: [mirror(s => `M${pt(RIN + 5, s * 2.1)}${C(RIN + 9, s * 0.8, RIN + 18, s * 0.3, RIN + 31, 0)}`), chord(RIN + 4, 2.4)].join('')
};
// Below the paper: the cream between the sticks, a dark stick down the leaf's middle with a red line along its left
// side, the hub and its ribs, and a gold flourish on the cream at the leaf's left edge.
const RING = wedge(RH, RIN, H);
const HUB_EDGE = chord(RH, H);
const STICK = wedge(RH - 1, RIN + 2, 2.1);
const PIN = `M${pt(RH, -1.5)}L${pt(RIN, -1.5)}`;
const HUB = wedge(0, RH, H);
const RIBS = [-2, 0, 2].map(d => `M${pt(14, d)}L${pt(RH, d)}`).join('');
const FLOURISH = (() => {
  const [x1, y1] = xy(RIN - 8, -H);
  const [x2, y2] = xy(RIN - 34, -H);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}c3 5 -2 9 0 13s-3 9 ${(x2 - x1).toFixed(1)} ${(y2 - y1).toFixed(1)}`;
})();

// A black key lying on the leaves, from the red border to a third of the way in: its body, the top face, a gleam down
// its lit side, the bevelled front (toward the pivot) and the front's lit edge.
const BK = { top: CY - (R - PLEAT - BAND), bottom: CY - 320, w: 12 };
const BLACK = {
  body: `M${CX - BK.w} ${BK.top}H${CX + BK.w}V${BK.bottom}H${CX - BK.w}Z`,
  face: `M${CX - BK.w + 2.5} ${BK.top + 2}H${CX + BK.w - 2.5}V${BK.bottom - 12}H${CX - BK.w + 2.5}Z`,
  front: `M${CX - BK.w} ${BK.bottom}H${CX + BK.w}L${CX + BK.w - 2.5} ${BK.bottom - 12}H${CX - BK.w + 2.5}Z`,
  lip: `M${CX - BK.w + 3} ${BK.bottom - 12}H${CX + BK.w - 3}`,
  gleam: s => `M${CX + s * (BK.w - 4)} ${BK.top + 6}V${BK.bottom - 17}`
};

// The handle, drawn pointing straight up from the pivot (it turns to GUARD): lacquered wood, wider at its square end, a
// rounded tail past the pivot; a lit edge and grain; gold engraving (a long lens with a spine, scrolls, a ring round a
// red jewel near the end); red scrolls and beads either side of the rivet at the pivot, and the rivet: gold in a red
// ring.
const HL = 478; // its length from the pivot
const HANDLE = {
  body: `M${CX - 21} ${CY - HL}H${CX + 21}L${CX + 16} ${CY}C${CX + 16} ${CY + 22} ${CX + 6} ${CY + 40} ${CX} ${CY + 46}C${CX - 6} ${CY + 40} ${CX - 16} ${CY + 22} ${CX - 16} ${CY}Z`,
  edge: s => `M${CX + s * 19.5} ${CY - HL + 2}L${CX + s * 14.8} ${CY - 4}`,
  grain: `M${CX - 9} ${CY - HL + 6}L${CX - 7} ${CY - 30}M${CX + 4} ${CY - HL + 10}L${CX + 3} ${CY - 60}M${CX + 13} ${CY - HL + 20}L${CX + 10} ${CY - 120}`,
  gilt: [
    `M${CX} ${CY - 60}C${CX - 8} ${CY - 140} ${CX - 8} ${CY - 260} ${CX} ${CY - 340}C${CX + 8} ${CY - 260} ${CX + 8} ${CY - 140} ${CX} ${CY - 60}`,
    `M${CX} ${CY - 40}V${CY - 360}`,
    `M${CX} ${CY - 340}c-10 -6 -12 -20 -4 -24s12 4 6 9`,
    `M${CX} ${CY - 352}c10 -6 12 -20 4 -24s-12 4 -6 9`,
    `M${CX} ${CY - 380}c-8 6 -9 18 -2 24M${CX} ${CY - 380}c8 6 9 18 2 24`,
    `M${CX} ${CY - 388}V${CY - 428}`,
    `M${CX} ${CY - 70}c-7 -4 -9 -12 -3 -15M${CX} ${CY - 70}c7 -4 9 -12 3 -15`
  ].join(''),
  ring: { cy: CY - 444, r: 11 },
  jewel: `M${CX} ${CY - 437}c-5 0 -7 -4 -7 -7s3 -7 7 -7l3 -9l3 9c2 1 3 4 3 7s-3 7 -9 7Z`,
  scrolls: [-1, 1]
    .map(
      s =>
        `M${CX} ${CY + s * 10}c-6 ${s * 2} -8 ${s * 8} -4 ${s * 11}s6 0 4 ${s * -4}M${CX} ${CY + s * 10}c6 ${s * 2} 8 ${s * 8} 4 ${s * 11}s-6 0 -4 ${s * -4}M${CX} ${CY + s * 11}V${CY + s * 19}`
    )
    .join(''),
  beads: [-1, 1].map(s => `M${CX - 1.8} ${CY + s * 23}a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0`).join('')
};
// The sticks' heads, fanned below the pivot like a shell: ribs, and a scalloped edge between them.
const SHELL = {
  body: `M${CX} ${CY}L${pt(54, 104)}${Array.from({ length: 19 }, (_, k) => `A5 5 0 0 0 ${pt(54, 112 + k * 8)}`).join('')}Z`,
  ribs: Array.from({ length: 18 }, (_, k) => `M${pt(10, 112 + k * 8)}L${pt(53, 112 + k * 8)}`).join('')
};

// Each leaf, black key and the handle is drawn pointing straight up in its own SVG, whose box ends at the pivot (the
// handle's runs on past it, to its tail), so it turns about the pivot; the viewBox crops the shared drawing to the box.
const LEAF_BOX = { x: CX - 36, y: CY - R - 6, w: 72, h: R + 6 };
const KEY_BOX = { x: CX - 26, y: BK.top - 6, w: 52, h: CY - BK.top + 6 };
const HANDLE_BOX = { x: CX - 26, y: CY - HL - 4, w: 52, h: HL + 4 + 50 };
const boxStyle = b => ({
  left: `${(b.x / 1200) * 100}%`,
  top: `${(b.y / 700) * 100}%`,
  width: `${(b.w / 1200) * 100}%`,
  height: `${(b.h / 700) * 100}%`,
  transformOrigin: `50% ${(((CY - b.y) / b.h) * 100).toFixed(3)}%`
});
const viewBox = b => `${b.x} ${b.y} ${b.w} ${b.h}`;

// The ground: five staff lines just past the rim with notes written on them where the picture has them; two gold arcs
// beyond.
const STAFF = [510, 523, 536, 549, 562];
const GILT_ARCS = [607, 617];
const staffR = line => STAFF[0] + line * (STAFF[1] - STAFF[0]);
const WRITTEN = [
  [-66, 0.5, 'b'],
  [-57, 1, 'e'],
  [-50, 1.5, 'q'],
  [-38, 2.5, 'e'],
  [-28, 3, 'e'],
  [0.5, 3.5, 'e'],
  [9, 3, 'e'],
  [30, 3, 'q'],
  [37, 1, 'e'],
  [51, 2, 'b']
];

const NOTES = NOTE_KINDS;
const TONES = ['ink', 'ink', 'red', 'ink', 'felt'];
// Each note leaves the rim at its own angle and flies away up the page, out a little to its side and swaying, slow off
// the rim and quicker as it climbs, like the hero's birds; then another leaves. They climb --climb (set from the
// layout: up to the top of her words) times their own share, so the flock spreads up the whole text. The delays are
// negative so the flight is already under way when the fan opens. Sideways distances are in viewBox units, as cqw.
const FLIGHT = Array.from({ length: 22 }, (_, i) => {
  const j = Math.sin(i * 12.9898) * 43758.5453;
  const r = j - Math.floor(j); // a fixed scatter, 0..1
  const a = -76 + (152 * i) / 21 + (r - 0.5) * 6;
  const t = (a * Math.PI) / 180;
  const start = R + 30;
  const out = 120 + r * 180;
  return {
    kind: NOTES[i % 4],
    tone: TONES[i % 5],
    x: ((CX + start * Math.sin(t)) / 1200) * 100,
    y: ((CY - start * Math.cos(t)) / 700) * 100,
    dx: (out * Math.sin(t)) / 12,
    rise: 0.7 + ((i * 37) % 31) / 100, // share of --climb
    r0: (r - 0.5) * 30,
    r1: (r - 0.5) * -50 + (a > 0 ? 18 : -18),
    size: 0.9 + ((i * 7) % 5) / 10,
    dur: 11 + ((i * 5) % 7) * 0.9,
    delay: -((i * 2.9) % 17)
  };
});

function Glyph({ kind }) {
  const { heads, paths } = NOTE_SHAPES[kind];
  return (
    <>
      {heads.map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx="7.4" ry="5.2" transform={`rotate(-22 ${x} ${y})`} />
      ))}
      {paths.map(d => (
        <path key={d} d={d} />
      ))}
    </>
  );
}

function Note({ kind }) {
  const { box } = NOTE_SHAPES[kind];
  return (
    <svg viewBox={`0 0 ${box[0]} ${box[1]}`}>
      <Glyph kind={kind} />
    </svg>
  );
}

// --open: 0 while the fan's top is near the foot of the screen, 1 once it has risen half a screen.
const opening = (r, vh) => (vh * 0.95 - r.top) / (vh * 0.5);

export default function KeyFan({ className = '' }) {
  const ref = useRef(null);
  const count = useRef(0);
  const blades = useRef(new Map()); // each key's note → { el, angle }
  const taps = useRef(new Map()); // note → when its key was pressed by hand (s)
  const kick = useRef(() => {});
  const burstRef = useRef(null);
  const onScreen = useRef(false);
  const [bursts, setBursts] = useState([]);
  const { playhead, playing } = useSound();
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const reduced = useReducedMotion();
  useScrub(ref, opening, '--open');

  // Notes off a key's tip, wherever the fan stands in its opening: `count` of them, the first red.
  const burst = (angle, midi, howMany = 3, size = 1) => {
    const open = parseFloat(getComputedStyle(ref.current).getPropertyValue('--open'));
    const t = ((angle * (Number.isNaN(open) ? 1 : open)) * Math.PI) / 180;
    const x = ((CX + (R + 10) * Math.sin(t)) / 1200) * 100;
    const y = ((CY - (R + 10) * Math.cos(t)) / 700) * 100;
    const id = (count.current += 1);
    const notes = Array.from({ length: howMany }, (_, k) => ({
      key: `${id}-${k}`,
      x,
      y,
      kind: NOTES[(midi + k) % 4],
      tone: k === 0 ? 'red' : 'ink',
      dx: Math.sin(t) * 90 + (Math.random() - 0.5) * 170,
      rise: 260 + Math.random() * 300,
      r0: (Math.random() - 0.5) * 40,
      r1: (Math.random() - 0.5) * 70,
      size: (0.9 + Math.random() * 0.5) * size,
      dur: 2.4 + Math.random() * 1.1,
      delay: k * 0.09
    }));
    setBursts(b => [...b.slice(-24), ...notes]);
  };
  burstRef.current = burst;

  // A key pressed by hand: it sounds, goes down for a moment, and lets three notes go.
  const play = (angle, midi) => () => {
    strike(midi);
    taps.current.set(midi, performance.now() / 1000);
    kick.current();
    burst(angle, midi);
  };

  // How far down each key is (--press on its SVG: it dips and lights), from the presses by hand and, while the piano
  // plays, from her notes; a note flies off a key as one of hers begins on it (at most one every 80 ms, so a chord
  // lets one go). Runs while anything is moving and the fan is on screen.
  useEffect(() => {
    let raf = 0;
    let heard = null; // where the music was last frame (s)
    let lastBurst = 0;
    const lit = new Map();
    const tick = () => {
      raf = 0;
      const now = performance.now() / 1000;
      const press = new Map();
      taps.current.forEach((at, m) => {
        if (now - at > TAP_LIFE) taps.current.delete(m);
        else press.set(m, tapPress(now - at));
      });
      const p = reduced ? null : playhead();
      if (p) {
        for (const [start, end, note, velocity] of p.notes) {
          if (start - PLAYED.down > p.t) break;
          if (end + PLAYED.up < p.t) continue;
          const m = fold(note, LOW, HIGH);
          const key = blades.current.get(m);
          if (!key) continue;
          const down = smooth(start - PLAYED.down, start, p.t) * (1 - smooth(end, end + PLAYED.up, p.t));
          press.set(m, Math.max(press.get(m) || 0, down * (0.6 + 0.4 * velocity)));
          if (heard !== null && start > heard && start <= p.t && now - lastBurst > 0.08 && onScreen.current) {
            lastBurst = now;
            burstRef.current(key.angle, m, 1, 0.8 + 0.4 * velocity);
          }
        }
        heard = p.t;
      } else heard = null;
      let any = false;
      blades.current.forEach(({ el }, m) => {
        const v = Math.round((press.get(m) || 0) * 100) / 100;
        if (v) any = true;
        if (lit.get(m) !== v) {
          lit.set(m, v);
          el.style.setProperty('--press', v);
        }
      });
      if (taps.current.size || any || (playingRef.current && onScreen.current)) raf = requestAnimationFrame(tick);
    };
    kick.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    kick.current();
    return () => cancelAnimationFrame(raf);
  }, [playing, playhead, reduced]);
  const done = key => setBursts(b => b.filter(n => n.key !== key));
  // The notes fly only while the fan is on screen, and climb as high as the section above it (her words) reaches.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => {
      el.classList.toggle('is-on', e.isIntersecting);
      onScreen.current = e.isIntersecting;
      kick.current();
    });
    io.observe(el);
    const measure = () => {
      const above = el.previousElementSibling;
      const climb = above ? el.offsetTop - above.offsetTop + el.offsetHeight * 0.3 : window.innerHeight;
      el.style.setProperty('--climb', `${Math.round(climb)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.parentElement);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const angles = Array.from({ length: N }, (_, i) => START + W * (i + 0.5));
  // Black keys sit on the line between two leaves. Light comes from the top left: a key's lit side is its left one
  // unless it leans more than 45 degrees left, and its shadow falls down and right, turned into the key's own frame.
  const blacks = [];
  for (let i = 0; i < N - 1; i++) {
    if (!BLACK_AFTER.includes(i % 7)) continue;
    const a = START + W * (i + 1);
    const t = (a * Math.PI) / 180;
    blacks.push({
      a,
      midi: whiteMidi(i) + 1,
      lit: a < -45 ? 1 : -1,
      shadow: [4 * Math.cos(t) + 5 * Math.sin(t), -4 * Math.sin(t) + 5 * Math.cos(t)].map(v => v.toFixed(1)).join(' ')
    });
  }

  return (
    <div ref={ref} className={`keyfan ${className}`} aria-hidden="true">
      <svg className="keyfan__back" viewBox="0 0 1200 700">
        <defs>
          <clipPath id="kf-sky">
            <rect x="-600" y="-300" width="2400" height={HORIZON + 300} />
          </clipPath>
          <linearGradient id="kf-paper" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-paper)" />
            <stop offset="1" stopColor="var(--color-ivory)" />
          </linearGradient>
          <linearGradient id="kf-pleat" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--kf-pleat)" />
            <stop offset="1" stopColor="var(--kf-pleat-deep)" />
          </linearGradient>
          <linearGradient id="kf-black" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-graphite)" />
            <stop offset="0.4" stopColor="var(--color-lacquer)" />
            <stop offset="1" stopColor="var(--color-ink)" />
          </linearGradient>
          <linearGradient id="kf-black-r" x1="1" x2="0" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-graphite)" />
            <stop offset="0.4" stopColor="var(--color-lacquer)" />
            <stop offset="1" stopColor="var(--color-ink)" />
          </linearGradient>
          <linearGradient id="kf-wood" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--kf-wood-lit)" />
            <stop offset="0.3" stopColor="var(--kf-wood)" />
            <stop offset="1" stopColor="var(--color-lacquer)" />
          </linearGradient>
          <linearGradient id="kf-handle" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--kf-wood-lit)" />
            <stop offset="0.45" stopColor="var(--color-graphite)" />
            <stop offset="1" stopColor="var(--kf-wood)" />
          </linearGradient>
          {/* Age on the paper: soft brown stains, kept to the shape they are drawn on. */}
          <filter id="kf-age" x="0" y="0" width="1" height="1">
            <feTurbulence type="fractalNoise" baseFrequency="0.022 0.012" numOctaves="4" seed="11" />
            <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.22  2.2 0 0 0 -1.15" />
            <feComposite in2="SourceAlpha" operator="in" />
          </filter>
          <filter id="kf-soft" x="-0.5" y="-0.1" width="2" height="1.2">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <g className="keyfan__ground">
          <g clipPath="url(#kf-sky)">
            <path className="keyfan__staff" d={STAFF.map(r => arc(r, -100, 100)).join('')} />
            {GILT_ARCS.map((r, k) => (
              <path key={r} className={`keyfan__arc keyfan__arc--${k}`} d={arc(r, -100, 100)} />
            ))}
          </g>
          <g className="keyfan__written">
            {WRITTEN.map(([a, line, kind]) => {
              const s = 0.9;
              return (
                <g key={a} transform={`rotate(${a} ${CX} ${CY}) translate(${CX - 10 * s} ${CY - staffR(line) - 36 * s}) scale(${s})`}>
                  <Glyph kind={kind} />
                </g>
              );
            })}
          </g>
        </g>
        <g className="keyfan__shell">
          <path className="keyfan__shell-body" d={SHELL.body} />
          <path className="keyfan__shell-ribs" d={SHELL.ribs} />
        </g>
      </svg>

      {angles.map((a, i) => {
        const L = LEAVES[i % 2];
        return (
          <svg
            key={`l${i}`}
            ref={el => el && blades.current.set(whiteMidi(i), { el, angle: a })}
            className="keyfan__blade"
            viewBox={viewBox(LEAF_BOX)}
            style={{ ...boxStyle(LEAF_BOX), '--a': `${a}deg`, '--lift': Math.max(0, Math.sin((Math.abs(a) * Math.PI) / 90)).toFixed(2) }}
          >
            <path className="keyfan__hub" d={HUB} />
            <path className="keyfan__ribs" d={RIBS} />
            <path className="keyfan__ring" d={RING} />
            <path className="keyfan__hub-edge" d={HUB_EDGE} />
            <path className="keyfan__stick" d={STICK} fill="url(#kf-wood)" />
            <path className="keyfan__pin" d={PIN} />
            <path className="keyfan__flourish" d={FLOURISH} />
            <g className="keyfan__press" onPointerDown={play(a, whiteMidi(i))}>
              <path className="keyfan__paper" d={L.paper} fill={i % 2 ? 'url(#kf-pleat)' : 'url(#kf-paper)'} />
              <g className="keyfan__age" transform={`translate(${(i * 173) % 600} ${(i * 97) % 300})`} filter="url(#kf-age)">
                <path d={L.paper} transform={`translate(${-((i * 173) % 600)} ${-((i * 97) % 300)})`} />
              </g>
              <path className="keyfan__shade" d={L.shade} />
              <path className="keyfan__shade" d={L.crease} />
              <path className="keyfan__lit" d={L.paper} />
              <path className="keyfan__outline" d={L.paper} />
              <path className="keyfan__tracery keyfan__tracery--gilt" d={TRACERY.gilt} />
              <path className="keyfan__tracery keyfan__tracery--red" d={TRACERY.red} />
              <path className="keyfan__band" d={L.band} />
              <path className="keyfan__gilt" d={L.gilt} />
              <path className="keyfan__band-edge" d={L.edge} />
              <path className="keyfan__rim" d={L.rim} />
            </g>
          </svg>
        );
      })}

      {blacks.map(({ a, midi, lit, shadow }) => (
        <svg
          key={`b${a}`}
          ref={el => el && blades.current.set(midi, { el, angle: a })}
          className="keyfan__blade"
          viewBox={viewBox(KEY_BOX)}
          style={{ ...boxStyle(KEY_BOX), '--a': `${a}deg` }}
        >
          <path className="keyfan__shadow" d={BLACK.body} transform={`translate(${shadow})`} filter="url(#kf-soft)" />
          <g className="keyfan__press" onPointerDown={play(a, midi)}>
            <path className="keyfan__bk" d={BLACK.body} />
            <path className="keyfan__bk-face" d={BLACK.face} fill={lit > 0 ? 'url(#kf-black-r)' : 'url(#kf-black)'} />
            <path className="keyfan__bk-gleam" d={BLACK.gleam(lit)} />
            <path className="keyfan__bk-front" d={BLACK.front} />
            <path className="keyfan__bk-lip" d={BLACK.lip} />
            <path className="keyfan__bk-lit" d={BLACK.body} />
          </g>
        </svg>
      ))}

      <svg className="keyfan__blade keyfan__guard" viewBox={viewBox(HANDLE_BOX)} style={{ ...boxStyle(HANDLE_BOX), '--a': `${GUARD}deg` }}>
        <path className="keyfan__handle" d={HANDLE.body} fill="url(#kf-handle)" />
        <path className="keyfan__handle-grain" d={HANDLE.grain} />
        <path className="keyfan__handle-edge" d={HANDLE.edge(-1)} />
        <path className="keyfan__handle-edge keyfan__handle-edge--under" d={HANDLE.edge(1)} />
        <path className="keyfan__engraving" d={HANDLE.gilt} />
        <circle className="keyfan__engraving" cx={CX} cy={HANDLE.ring.cy} r={HANDLE.ring.r} />
        <path className="keyfan__jewel" d={HANDLE.jewel} />
        <path className="keyfan__scrolls" d={HANDLE.scrolls} />
        <path className="keyfan__beads" d={HANDLE.beads} />
        <circle className="keyfan__rivet-ring" cx={CX} cy={CY} r="9.5" />
        <circle className="keyfan__rivet" cx={CX} cy={CY} r="7" />
        <circle className="keyfan__rivet-core" cx={CX} cy={CY} r="3.4" />
        <circle className="keyfan__pearl" cx={CX - 1.2} cy={CY - 1.2} r="1.1" />
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
              '--rise': n.rise,
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

      <div className="keyfan__bursts">
        {bursts.map(n => (
          <span
            key={n.key}
            className={`keyfan__burst keyfan__note--${n.tone}`}
            onAnimationEnd={e => e.target === e.currentTarget && done(n.key)}
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              '--dx': `${n.dx}px`,
              '--rise': `${n.rise}px`,
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
