import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useScrub } from '../lib/hooks';
import { useSound } from '../lib/sound.jsx';
import { fold, strike, tapPress, TAP_LIFE } from '../lib/tone';
import { NOTE_KINDS, NOTE_SHAPES } from '../lib/notes';

// A painted hand fan of piano keys, after the client's picture of one: paper leaves, one white key each, pleated so
// the rim steps in and out, with a red border between cream lines along it and a red filigree where each leaf meets its
// stick; black keys lie on the leaves, lit from the top left. Below the leaves the sticks show, cream between dark
// wood, then close into the dark hub round a jewelled rivet; the handle hangs straight down from it, so the fan stands
// level. Behind it, rays of light, five staff lines and two red arcs; music notes leave the rim and fly away up the
// page, past her words, as the birds leave the hero's keyboard.
// Colours are the site's own: cream paper, crimson, ink and lacquer, dust where the picture has gold.
//
// It opens as it scrolls into view and shuts again when scrolled back: --open (0 shut, 1 open) is eased toward where
// the fan stands on the screen (useScrub), and turns each leaf and black key about the pivot from straight up to its
// place; shut, it is a single key standing on its handle. Every leaf and black key is its own small SVG, turned by a
// CSS transform, so the browser moves them as layers and never redraws them while the fan opens. The ground (rays,
// staff, arcs) and the notes come in as it opens. With reduced motion it is open and the notes rest above the rim.
//
// The keys can be played: pressing one (white or black) dips it toward the pivot and lights it, sounds its note
// (lib/tone.js; the leaves run from C3 at the left to C6 at the right) and lets a few notes fly up from its tip. While
// "Hear me play" is on, the keys play along with her: each goes down with the note she plays on it (folded into the
// fan's three octaves), and a note flies off it as the note begins.
const CX = 600;
const CY = 600; // the pivot, in the viewBox
const R = 470; // the rim (alternate leaves stand a little in, the pleat)
const RIN = 285; // where the paper begins
const RH = 150; // the dark hub, where the sticks close together
const BAND = 20; // the red border
const SPAN = 88; // the leaves run from -SPAN to +SPAN degrees, level either side
const N = 22; // leaves: three octaves of white keys and a C
const W = (2 * SPAN) / N;
const HORIZON = 497; // where the cream sheet meets the ink below it (site.css hangs the fan so)
const BLACK_AFTER = [0, 1, 3, 4, 5]; // white keys (C=0 … B=6) followed by a black key
const WHITE_STEPS = [0, 2, 4, 5, 7, 9, 11]; // semitones of C D E F G A B
const whiteMidi = i => 48 + 12 * Math.floor(i / 7) + WHITE_STEPS[i % 7]; // leaf 0 is C3
const LOW = 48;
const HIGH = 84; // C3 to C6, the fan's range
const PLAYED = { down: 0.035, up: 0.14 }; // a played note's key goes down and comes back up over these (s), as elsewhere
const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

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

// The handle, hanging straight down from the pivot: lacquered wood with an inlaid line, a curl and a jewel at its end.
const END = CY + 190;
const HANDLE = {
  body: `M${CX - 20} ${CY - 20}L${CX + 20} ${CY - 20}L${CX + 15} ${END - 16}Q${CX} ${END + 8} ${CX - 15} ${END - 16}Z`,
  inlay: `M${CX} ${CY + 34}V${END - 34}`,
  curl: `M${CX} ${CY + 60}c-8 10 -8 22 0 30c8 8 8 20 0 30M${CX} ${CY + 60}c8 10 8 22 0 30`
};

// Each leaf and each black key is drawn pointing straight up in its own SVG, whose box ends at the pivot (so it turns
// about its bottom centre); the viewBox crops the shared drawing to that box.
const LEAF_BOX = { x: CX - 42, y: CY - R - 8, w: 84, h: R + 8 };
const KEY_BOX = { x: CX - 26, y: CY - (R - BAND - 6) - 4, w: 52, h: R - BAND - 6 + 4 };
const boxStyle = b => ({
  left: `${(b.x / 1200) * 100}%`,
  top: `${(b.y / 700) * 100}%`,
  width: `${(b.w / 1200) * 100}%`,
  height: `${(b.h / 700) * 100}%`
});
const viewBox = b => `${b.x} ${b.y} ${b.w} ${b.h}`;
const SCALLOP = Array.from({ length: 11 }, (_, i) => 180 + (i - 5) * 11);

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
  const start = R + 14;
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

function Note({ kind }) {
  const { box, heads, paths } = NOTE_SHAPES[kind];
  return (
    <svg viewBox={`0 0 ${box[0]} ${box[1]}`}>
      {heads.map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx="7.4" ry="5.2" transform={`rotate(-22 ${x} ${y})`} />
      ))}
      {paths.map(d => (
        <path key={d} d={d} />
      ))}
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

  const angles = Array.from({ length: N }, (_, i) => -SPAN + W * (i + 0.5));
  const blacks = [];
  for (let i = 0; i < N - 1; i++) if (BLACK_AFTER.includes(i % 7)) blacks.push({ a: -SPAN + W * (i + 1), midi: whiteMidi(i) + 1 });

  return (
    <div ref={ref} className={`keyfan ${className}`} aria-hidden="true">
      <svg className="keyfan__back" viewBox="0 0 1200 700">
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
            {Array.from({ length: 19 }, (_, i) => (
              <path key={i} className={`keyfan__ray keyfan__ray--${i % 2}`} d={wedge(0, 900, 4.6)} transform={`rotate(${-90 + i * 10} ${CX} ${CY})`} />
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
      </svg>

      {angles.map((a, i) => {
        const L = LEAVES[i % 2];
        return (
          <svg
            key={`l${i}`}
            ref={el => el && blades.current.set(whiteMidi(i), { el, angle: a })}
            className="keyfan__blade"
            viewBox={viewBox(LEAF_BOX)}
            style={{ ...boxStyle(LEAF_BOX), '--a': `${a}deg` }}
          >
            <path className="keyfan__hub" d={HUB} />
            <path className="keyfan__grain" d={GRAIN} />
            <path className="keyfan__ring" d={RING} />
            <path className="keyfan__pins" d={PINS} />
            <path className="keyfan__stick" d={STICK} />
            <g className="keyfan__press" onPointerDown={play(a, whiteMidi(i))}>
              <path className="keyfan__paper" d={L.paper} fill={i % 2 ? 'url(#kf-paper-shade)' : 'url(#kf-paper)'} />
              <path className="keyfan__lit" d={L.paper} />
              <path className="keyfan__fold" d={FOLDS} />
              <path className="keyfan__filigree" d={FILIGREE} />
              <path className="keyfan__band" d={L.band} />
              <path className="keyfan__stripes" d={L.stripes} />
              <path className="keyfan__rim" d={L.rim} />
            </g>
          </svg>
        );
      })}

      {blacks.map(({ a, midi }) => (
        <svg
          key={`b${a}`}
          ref={el => el && blades.current.set(midi, { el, angle: a })}
          className="keyfan__blade"
          viewBox={viewBox(KEY_BOX)}
          style={{ ...boxStyle(KEY_BOX), '--a': `${a}deg` }}
        >
          <path className="keyfan__shadow" d={BLACK.body} transform="translate(4 6)" />
          <g className="keyfan__press" onPointerDown={play(a, midi)}>
            <path className="keyfan__bk" d={BLACK.body} />
            <path className="keyfan__bk-face" d={BLACK.face} fill="url(#kf-black)" />
            <path className="keyfan__bk-front" d={BLACK.front} />
            <path className="keyfan__bk-glint" d={BLACK.glint} />
            <path className="keyfan__bk-lit" d={BLACK.body} />
          </g>
        </svg>
      ))}

      <svg className="keyfan__front" viewBox="0 0 1200 700">
        <path className="keyfan__shadow" d={HANDLE.body} transform="translate(6 4)" />
        <path d={HANDLE.body} fill="url(#kf-wood)" className="keyfan__handle" />
        <path className="keyfan__inlay" d={HANDLE.inlay} />
        <path className="keyfan__curl" d={HANDLE.curl} />
        <circle className="keyfan__jewel" cx={CX} cy={END - 26} r="8.5" />
        <circle className="keyfan__pearl" cx={CX} cy={END - 26} r="2.8" />
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
