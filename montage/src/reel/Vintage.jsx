import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { PROXIES } from '../edl.js';
import { clamp, easeInOut, easeSine, legato, lerp, viewBox } from '../util.js';

// "Vintage": 15.5 s in black and white on the opening of her home grand recording (14.22.50, from 5.35 s),
// a waltz in 3/4. A silent-film title card, iris openings, a wipe in piano-key strips, a gapless 3 × 3 grid that
// divides into 4 × 4 and opens onto the stage, and an end card. Film grain, a little gate weave and projector
// flicker, the odd speck of dust. Every change lands on a downbeat or a beat of the waltz.

export const VINTAGE_FPS = 30;
export const VINTAGE_FRAMES = 465;
const AUDIO_START = 5.35;
const sync = f => AUDIO_START + f / VINTAGE_FPS; // home grand footage (H1) in sync with the music

// Downbeats of the waltz, and the beats between them (frames).
const BARS = [14, 50, 84, 117, 150, 184, 216, 250, 281, 313, 345, 376, 408, 440];
const BEAT = { 162: 1, 173: 1, 195: 1, 206: 1, 228: 1, 238: 1, 325: 1, 335: 1, 386: 1, 398: 1 };

const W = 1920;
const H = 1080;
const INK = '#0B0B0C';
const IVORY = '#F4EFE6';
const DUST = '#A8A196';
const font = { fontFamily: 'Bebas Neue', fontWeight: 400, fontSynthesis: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1 };
const DISSOLVE = 5;

const fontHandle = delayRender('Bebas Neue (vintage)');
new FontFace('Bebas Neue', `url(${staticFile('fonts/BebasNeue-Regular.woff2')}) format('woff2')`)
  .load()
  .then(f => {
    document.fonts.add(f);
    continueRender(fontHandle);
  })
  .catch(() => continueRender(fontHandle));

// ── helpers ────────────────────────────────────────────────────────────────────────────────────────────────

const hash = n => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const smoothNoise = t => {
  const i = Math.floor(t), k = t - i;
  return lerp(hash(i), hash(i + 1), k * k * (3 - 2 * k));
};

function keyAt(keys, f, ease = legato) {
  if (f <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b.f) {
      const e = ease(clamp((f - a.f) / (b.f - a.f || 1)));
      const out = {};
      for (const k of Object.keys(b)) out[k] = typeof b[k] === 'number' && typeof a[k] === 'number' ? lerp(a[k], b[k], e) : b[k];
      return out;
    }
  }
  return keys[keys.length - 1];
}

function Clip({ p, src, view, w = W, h = H, rate = 1 }) {
  const box = viewBox(view, w, h);
  const trimBefore = Math.max(0, Math.round((src - PROXIES[p].start) * VINTAGE_FPS));
  return (
    <div style={{ position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height }}>
      <OffthreadVideo src={staticFile(`proxies/${p}.mp4`)} trimBefore={trimBefore} playbackRate={rate} muted style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

// A frame: keyed rectangles, footage that dissolves from one shot to the next, an optional fade-in.
function Tile({ rects, shots, until, fadeIn = 0, style }) {
  const f = useCurrentFrame();
  const start = rects[0].f;
  if (f < start || (until !== undefined && f >= until)) return null;
  const r = keyAt(rects, f);
  const op = fadeIn ? easeInOut(clamp((f - start) / fadeIn)) : 1;
  return (
    <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, overflow: 'hidden', background: INK, opacity: op, ...style }}>
      {shots.map((s, i) => {
        const next = shots[i + 1];
        const end = next ? next.f + (next.cut ? 0 : DISSOLVE) : Infinity;
        if (f < s.f || f >= end) return null;
        const e = i === 0 || s.cut ? 1 : easeInOut(clamp((f - s.f) / DISSOLVE));
        const view = s.views ? keyAt(s.views, f, s.ease || easeSine) : s.view;
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: e }}>
            <Sequence from={s.f} layout="none">
              <Clip p={s.p} src={s.src} view={view} w={r.w} h={r.h} rate={s.rate} />
            </Sequence>
          </div>
        );
      })}
    </div>
  );
}

// An iris: the layer shows through a soft-edged circle (keyed { f, r, x, y }); fully open beyond the frame.
function Iris({ keys, children, from, until }) {
  const f = useCurrentFrame();
  if (f < from || (until !== undefined && f >= until)) return null;
  const k = keyAt(keys, f, easeInOut);
  const open = k.r >= 1250;
  const mask = open ? undefined : `radial-gradient(circle at ${k.x}px ${k.y}px, #000 ${Math.max(0, k.r - 10)}px, transparent ${k.r + 10}px)`;
  if (k.r <= 0.5) return null;
  return <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask }}>{children}</AbsoluteFill>;
}

// The key wipe: the incoming layer appears in fourteen white-key strips, two octaves, in the groups of a
// keyboard (C–E, F–B); black keys stand over the seams while it forms, then lift away.
const KW = W / 14;
const GROUPS = [[0, 1, 2], [3, 4, 5, 6], [7, 8, 9], [10, 11, 12, 13]];
const BLACK = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13]; // seams (left edge of these white keys) that carry a black key
function keyReveal(f, at) {
  return Array.from({ length: 14 }, (_, s) => {
    const g = GROUPS.findIndex(gr => gr.includes(s));
    return legato(clamp((f - at - g * 4) / 6));
  });
}
function KeyWipe({ at, children }) {
  const f = useCurrentFrame();
  if (f < at) return null;
  const rev = keyReveal(f, at);
  const done = rev.every(v => v >= 1);
  const mask = done
    ? undefined
    : rev.map(() => 'linear-gradient(#000, #000)').join(', ');
  const maskSize = rev.map(v => `${KW + 0.5}px ${v * H}px`).join(', ');
  const maskPos = rev.map((_, s) => `${s * KW}px 0px`).join(', ');
  return (
    <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: maskSize, maskSize, WebkitMaskPosition: maskPos, maskPosition: maskPos, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }}>
      {children}
    </AbsoluteFill>
  );
}
function KeyWipeKeys({ at }) {
  const f = useCurrentFrame();
  if (f < at || f > at + 34) return null;
  const rev = keyReveal(f, at);
  const lift = easeInOut(clamp((f - at - 18) / 14));
  return (
    <AbsoluteFill>
      {Array.from({ length: 13 }, (_, i) => (
        <div key={`s${i}`} style={{ position: 'absolute', left: (i + 1) * KW - 1, top: 0, width: 2, height: H, background: INK, opacity: (1 - lift) * Math.max(rev[i], rev[i + 1]) * 0.9 }} />
      ))}
      {BLACK.map(s => {
        const v = Math.max(rev[s - 1], rev[s]);
        return (
          <div
            key={s}
            style={{ position: 'absolute', left: s * KW - KW * 0.3, top: 0, width: KW * 0.6, height: H * 0.6 * v * (1 - lift), background: INK, opacity: 0.94 }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// Letters closing in from wide tracking (the site's "track" reveal).
function Tracked({ text, size, at, from = 0.7, to = 0.16, frames = 30, color = IVORY, style }) {
  const f = useCurrentFrame();
  if (f < at) return null;
  const e = legato(clamp((f - at) / frames));
  const t = lerp(from, to, e);
  return (
    <div style={{ ...font, fontSize: size, letterSpacing: `${t}em`, paddingLeft: `${t}em`, color, opacity: easeInOut(clamp((f - at) / 12)), ...style }}>{text}</div>
  );
}

// ── cards ──────────────────────────────────────────────────────────────────────────────────────────────────

// The black-key ornament: two keys, then three, each pressed on a note.
function Keys({ beats, y }) {
  const f = useCurrentFrame();
  const kw = 14, kh = 62, gap = 9, group = 30;
  const xs = [0, kw + gap, 2 * (kw + gap) + group, 3 * (kw + gap) + group, 4 * (kw + gap) + group];
  const total = xs[4] + kw;
  return (
    <div style={{ position: 'absolute', left: W / 2 - total / 2, top: y, width: total, height: kh }}>
      {xs.map((x, i) => {
        const e = legato(clamp((f - beats[i]) / 5));
        return <div key={i} style={{ position: 'absolute', left: x, top: 0, width: kw, height: kh * e, background: IVORY }} />;
      })}
    </div>
  );
}

// A programme card: double rule drawn round the page, the ornament, her name, "Pianist".
function Card({ at, keys, out }) {
  const f = useCurrentFrame();
  if (f < at || (out !== undefined && f >= out + 8)) return null;
  const draw = legato(clamp((f - at) / 18));
  const fade = out !== undefined ? 1 - easeInOut(clamp((f - out) / 8)) : 1;
  const outer = { x: 96, y: 96, w: W - 192, h: H - 192 };
  const inner = { x: 112, y: 112, w: W - 224, h: H - 224 };
  return (
    <AbsoluteFill style={{ background: INK, opacity: fade }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {[outer, inner].map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} stroke={IVORY} strokeOpacity={i ? 0.55 : 0.9} strokeWidth={i ? 1 : 1.5} fill="none" />
        ))}
      </svg>
      <Keys beats={keys} y={330} />
      <Tracked text="Selin Incekara" size={150} at={at + 4} style={{ position: 'absolute', left: 0, right: 0, top: 452, textAlign: 'center' }} />
      <Tracked text="Pianist" size={28} at={at + 16} from={1.0} to={0.6} frames={24} color={DUST} style={{ position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center' }} />
    </AbsoluteFill>
  );
}

// A caption between two short rules, centred at the foot of the frame.
function Caption({ text, at, until }) {
  const f = useCurrentFrame();
  if (f < at || f >= until) return null;
  const e = legato(clamp((f - at) / 12));
  const o = easeInOut(clamp((f - at) / 8)) * (1 - easeInOut(clamp((f - until + 8) / 8)));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 958, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: o }}>
      <div style={{ width: 56 * e, height: 1, background: IVORY }} />
      <div style={{ ...font, fontSize: 26, letterSpacing: `${0.5 - 0.22 * e}em`, paddingLeft: `${0.5 - 0.22 * e}em`, color: IVORY }}>{text}</div>
      <div style={{ width: 56 * e, height: 1, background: IVORY }} />
    </div>
  );
}

// ── the grid ───────────────────────────────────────────────────────────────────────────────────────────────

const T3 = i => ({ x: (i % 3) * 640, y: Math.floor(i / 3) * 360, w: 640, h: 360 });
const T4 = i => ({ x: (i % 4) * 480, y: Math.floor(i / 4) * 270, w: 480, h: 270 });
const v = (x, y, z) => ({ x, y, z });

// 3 × 3: the centre on the downbeat, the four sides on beat two, the corners on beat three (a chord building);
// then the corners turn over on the next downbeat's second beat, the sides on its third. The centre is her,
// at the grand, in sync.
const GRID3 = [
  { at: 173, shots: [{ p: 'T', src: 16.0, view: v(0.45, 0.5, 1.0) }, { f: 195, p: 'H2', src: 85.0, view: v(0.29, 0.42, 1.7) }] },
  { at: 162, shots: [{ p: 'M', src: 11.0, view: v(0.5, 0.52, 1.0) }, { f: 206, p: 'G', src: 19.0, view: v(0.5, 0.6, 1.9) }] },
  { at: 173, shots: [{ p: 'G', src: 15.0, view: v(0.42, 0.42, 1.15) }, { f: 195, p: 'M', src: 17.0, view: v(0.45, 0.42, 1.6) }] },
  { at: 162, shots: [{ p: 'O1', src: 19.0, view: v(0.46, 0.5, 1.06) }, { f: 206, p: 'O1', src: 22.0, view: v(0.45, 0.45, 1.7) }] },
  { at: 150, shots: [{ p: 'H1', src: sync(150), view: v(0.36, 0.5, 1.0) }] },
  { at: 162, shots: [{ p: 'S', src: 22.0, view: v(0.6, 0.45, 1.2) }, { f: 206, p: 'A', src: 19.5, view: v(0.4, 0.38, 1.4) }] },
  { at: 173, shots: [{ p: 'D', src: 36.0, view: v(0.64, 0.4, 1.2) }, { f: 195, p: 'S', src: 25.0, view: v(0.5, 0.6, 1.9) }] },
  { at: 162, shots: [{ p: 'A', src: 17.5, view: v(0.5, 0.6, 1.38) }, { f: 206, p: 'H3', src: 78.0, view: v(0.28, 0.4, 1.9) }] },
  { at: 173, shots: [{ p: 'O2', src: 63.8, view: v(0.45, 0.48, 1.0) }, { f: 195, p: 'D2', src: 56.0, view: v(0.45, 0.52, 1.8) }] }
];
// 4 × 4: the grid divides on the next downbeat, column by column across the bar.
const GRID4 = [
  { p: 'H2', src: 86.0, view: v(0.36, 0.5, 1.0) },
  { p: 'M', src: 12.5, view: v(0.43, 0.42, 1.6) },
  { p: 'S', src: 23.5, view: v(0.55, 0.48, 1.02) },
  { p: 'T', src: 18.0, view: v(0.36, 0.4, 1.65) },
  { p: 'A', src: 20.0, view: v(0.38, 0.33, 1.62) },
  { p: 'O1', src: 17.0, view: v(0.46, 0.5, 1.06) }, // opens onto the stage
  { p: 'G', src: 16.0, view: v(0.5, 0.6, 1.9) },
  { p: 'D', src: 38.0, view: v(0.5, 0.5, 1.0) },
  { p: 'O2', src: 64.2, view: v(0.42, 0.46, 1.5) },
  { p: 'H3', src: 80.0, view: v(0.33, 0.5, 1.9) },
  { p: 'M', src: 14.0, view: v(0.5, 0.52, 1.0) },
  { p: 'D2', src: 58.0, view: v(0.64, 0.4, 1.2) },
  { p: 'S', src: 26.5, view: v(0.6, 0.45, 1.35) },
  { p: 'O1', src: 24.0, view: v(0.57, 0.37, 1.55) },
  { p: 'H1', src: 6.0, view: v(0.28, 0.4, 1.9) },
  { p: 'G', src: 20.5, view: v(0.4, 0.42, 1.25) }
];
const STAGE_TILE = 5;

function Grid() {
  const f = useCurrentFrame();
  if (f < 150 || f >= 262) return null;
  return (
    <AbsoluteFill>
      {GRID3.map((g, i) => (
        <Tile key={`a${i}`} until={240} fadeIn={5} rects={[{ f: g.at, ...T3(i) }]} shots={g.shots.map((s, j) => ({ f: j === 0 ? g.at : s.f, ...s }))} />
      ))}
      {GRID4.map((g, i) =>
        i === STAGE_TILE ? null : (
          <Tile key={`b${i}`} fadeIn={5} rects={[{ f: 216 + (i % 4) * 3, ...T4(i) }]} shots={[{ f: 216 + (i % 4) * 3, ...g }]} />
        )
      )}
    </AbsoluteFill>
  );
}

// ── film texture ───────────────────────────────────────────────────────────────────────────────────────────

const SPECKS = (() => {
  const out = [];
  for (let f = 0; f < VINTAGE_FRAMES; f++) {
    if (hash(f * 3.1) > 0.82) {
      const n = hash(f * 7.7) > 0.7 ? 2 : 1;
      for (let j = 0; j < n; j++) {
        out.push({ f, x: 120 + hash(f * 11 + j) * 1680, y: 80 + hash(f * 13 + j) * 920, s: 2 + hash(f * 17 + j) * 5, light: hash(f * 19 + j) > 0.7, r: hash(f * 23 + j) * 180, hair: hash(f * 29 + j) > 0.93 });
      }
    }
  }
  return out;
})();
const SCRATCHES = [[118, 146, 1230], [338, 361, 640]];

function Texture() {
  const f = useCurrentFrame();
  const specks = SPECKS.filter(s => s.f === f);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* lens vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 80% at 50% 50%, rgba(11,11,12,0) 52%, rgba(11,11,12,0.62) 100%)' }} />
      {SCRATCHES.map(([a, b, x0], i) =>
        f >= a && f < b ? (
          <div key={i} style={{ position: 'absolute', left: x0 + Math.sin(f * 0.7) * 6 + (f - a) * 0.8, top: 0, width: 1.4, height: H, background: IVORY, opacity: 0.1 + 0.18 * hash(f * 5.3) }} />
        ) : null
      )}
      {specks.map((s, i) =>
        s.hair ? (
          <svg key={i} width={90} height={60} style={{ position: 'absolute', left: s.x, top: s.y, opacity: 0.55 }}>
            <path d={`M4 ${30 + s.s} Q 30 ${4 + s.s * 2} 52 30 T 86 ${22 + s.s}`} stroke={INK} strokeWidth={1.2} fill="none" />
          </svg>
        ) : (
          <div key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: s.s, height: s.s * 0.7, borderRadius: '50%', transform: `rotate(${s.r}deg)`, background: s.light ? IVORY : INK, opacity: s.light ? 0.5 : 0.7 }} />
        )
      )}
    </AbsoluteFill>
  );
}

function Grain() {
  const f = useCurrentFrame();
  return (
    <Img
      src={staticFile(`grain/${f % 6}.png`)}
      style={{ position: 'absolute', inset: 0, width: W, height: H, opacity: 0.16, mixBlendMode: 'overlay', transform: `translate(${(hash(f) - 0.5) * 40}px, ${(hash(f + 9) - 0.5) * 40}px) scale(1.05)` }}
    />
  );
}

// ── the reel ───────────────────────────────────────────────────────────────────────────────────────────────

// Centres of the irises (screen px), on her.
const HOME_HER = { x: 556, y: 470 };
const STAGE_HER = { x: 875, y: 500 };
const TWI_HER = { x: 1340, y: 400 };

function Picture() {
  return (
    <AbsoluteFill style={{ background: INK }}>
      {/* bar 2–4: the iris opens on her at the grand (in sync), then closer on bar 3 */}
      <Iris from={48} until={140} keys={[{ f: 48, r: 0, ...HOME_HER }, { f: 66, r: 1300, ...HOME_HER }]}>
        <Tile
          until={140}
          rects={[{ f: 48, x: 0, y: 0, w: W, h: H }]}
          shots={[
            { f: 48, p: 'H1', src: sync(48), views: [{ f: 48, ...v(0.33, 0.48, 1.12) }, { f: 84, ...v(0.36, 0.5, 1.0) }] },
            { f: 84, cut: true, p: 'H1', src: sync(84), views: [{ f: 84, ...v(0.27, 0.42, 1.75) }, { f: 117, ...v(0.28, 0.41, 1.9) }] }
          ]}
        />
      </Iris>
      {/* bar 4: the hall, in piano-key strips */}
      <KeyWipe at={117}>
        <Tile until={182} rects={[{ f: 117, x: 0, y: 0, w: W, h: H }]} shots={[{ f: 117, p: 'M', src: 10.6, views: [{ f: 117, ...v(0.5, 0.52, 1.0) }, { f: 182, ...v(0.47, 0.5, 1.09) }] }]} />
      </KeyWipe>
      {/* bars 5–7: the grid builds, turns over, divides */}
      <Grid />
      {/* bar 8: one frame of the 4 × 4 opens onto the stage; bar 9 the iris closes on her, then opens on Song of Twilight */}
      <Iris from={219} until={305} keys={[{ f: 219, r: 1300, ...STAGE_HER }, { f: 281, r: 1300, ...STAGE_HER }, { f: 291, r: 0, ...STAGE_HER }]}>
        <Tile
          until={293}
          fadeIn={5}
          rects={[{ f: 219, ...T4(STAGE_TILE) }, { f: 250, ...T4(STAGE_TILE) }, { f: 262, x: 0, y: 0, w: W, h: H }]}
          shots={[{ f: 219, ...GRID4[STAGE_TILE] }]}
        />
      </Iris>
      <Iris from={292} until={340} keys={[{ f: 292, r: 0, ...TWI_HER }, { f: 309, r: 1300, ...TWI_HER }]}>
        <Tile until={340} rects={[{ f: 292, x: 0, y: 0, w: W, h: H }]} shots={[{ f: 292, p: 'S', src: 22.6, views: [{ f: 292, ...v(0.55, 0.48, 1.02) }, { f: 320, ...v(0.58, 0.46, 1.1) }] }]} />
      </Iris>
      {/* bar 10: two doors slide in; each panel turns over on a beat */}
      <Tile until={384} rects={[{ f: 313, x: -958, y: 0, w: 958, h: H }, { f: 322, x: 0, y: 0, w: 958, h: H }]} shots={[{ f: 313, p: 'G', src: 15.2, view: v(0.42, 0.42, 1.15) }, { f: 325, p: 'T', src: 17.6, view: v(0.45, 0.52, 1.25) }]} />
      <Tile until={384} rects={[{ f: 313, x: W, y: 0, w: 958, h: H }, { f: 322, x: 962, y: 0, w: 958, h: H }]} shots={[{ f: 313, p: 'A', src: 18.2, view: v(0.4, 0.38, 1.3) }, { f: 335, p: 'D', src: 36.6, view: v(0.64, 0.4, 1.2) }]} />
      {/* bar 11: the stage again, in key strips: her hands lift from the last chord, in slow motion */}
      <KeyWipe at={345}>
        <Tile until={392} rects={[{ f: 345, x: 0, y: 0, w: W, h: H }]} shots={[{ f: 345, p: 'O2', src: 65.05, rate: 0.5, views: [{ f: 345, ...v(0.43, 0.47, 1.45) }, { f: 392, ...v(0.43, 0.45, 1.62) }] }]} />
      </KeyWipe>
      {/* bar 12: back at the grand, in sync: wide, hands, face, wide; bar 13 the iris closes on her */}
      <Iris from={376} until={432} keys={[{ f: 376, r: 1300, ...HOME_HER }, { f: 408, r: 1300, ...HOME_HER }, { f: 430, r: 0, ...HOME_HER }]}>
        <Tile
          until={432}
          fadeIn={8}
          rects={[{ f: 376, x: 0, y: 0, w: W, h: H }]}
          shots={[
            { f: 376, p: 'H1', src: sync(376), view: v(0.36, 0.5, 1.0) },
            { f: 386, cut: true, p: 'H1', src: sync(386), view: v(0.34, 0.52, 1.9) },
            { f: 398, cut: true, p: 'H1', src: sync(398), view: v(0.27, 0.39, 1.9) },
            { f: 408, cut: true, p: 'H1', src: sync(408), views: [{ f: 408, ...v(0.36, 0.5, 1.0) }, { f: 432, ...v(0.33, 0.47, 1.12) }] }
          ]}
        />
      </Iris>
    </AbsoluteFill>
  );
}

export function Vintage() {
  const f = useCurrentFrame();
  // projector flicker and gate weave
  const flicker = 1 + 0.05 * (smoothNoise(f * 0.9) - 0.5) + 0.02 * (hash(f) - 0.5);
  const dx = (smoothNoise(f * 0.13 + 3) - 0.5) * 3 + (hash(f * 2.3) - 0.5) * 1.2;
  const dy = (smoothNoise(f * 0.11 + 8) - 0.5) * 3 + (hash(f * 3.7) - 0.5) * 1.2;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Audio src={staticFile('audio/reel-vintage.wav')} />
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(1.012)`, filter: `grayscale(1) sepia(0.05) contrast(1.24) brightness(${(0.98 * flicker).toFixed(3)})` }}>
        <Picture />
        <KeyWipeKeys at={117} />
        <KeyWipeKeys at={345} />
        <Caption text="Austrian Master Classes" at={124} until={150} />
        <Caption text="On stage" at={264} until={288} />
        <Caption text="Song of Twilight" at={300} until={313} />
        <Texture />
      </AbsoluteFill>
      {/* the programme cards: title, then the end */}
      <Card at={0} keys={[14, 20, 27, 33, 39]} out={44} />
      <Card at={430} keys={[436, 440, 446, 450, 454]} />
      <Grain />
    </AbsoluteFill>
  );
}

export { BARS, BEAT };
