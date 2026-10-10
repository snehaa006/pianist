import { AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { PROXIES } from '../edl.js';
import { Grain } from '../Overlays.jsx';
import { clamp, easeInOut, legato, lerp, viewBox } from '../util.js';
import {
  BARS, BIG_LEFT, BREATH, CHORD, CW, FINAL, M, PORTRAIT, REEL_FPS, REEL_FRAMES, RIGHT_SMALL, SHEET, SHEET_MARK, SLOT,
  STRIP_BOTTOM, STRIP_TOP, TILE, TRI, V, sheetAppear, sync
} from './plan.js';

const W = 1920;
const H = 1080;
const INK = '#0B0B0C';
const GRAPHITE = '#2A2A2E';
const FELT = '#6B665E';
const DUST = '#A8A196';
const HAIRLINE = '#DAD3C7';
const IVORY = '#F4EFE6';
const BRASS = '#B8935A';
const font = { fontFamily: 'Bebas Neue', fontWeight: 400, fontSynthesis: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1 };
// Footage: her colour, quietened and warmed, as on the site.
const GRADE = 'saturate(0.8) sepia(0.06) contrast(1.04)';
const SWAP = 9; // frames for footage to rise into a frame

const fontHandle = delayRender('Bebas Neue (reel)');
new FontFace('Bebas Neue', `url(${staticFile('fonts/BebasNeue-Regular.woff2')}) format('woff2')`)
  .load()
  .then(f => {
    document.fonts.add(f);
    continueRender(fontHandle);
  })
  .catch(() => continueRender(fontHandle));

// ── helpers ────────────────────────────────────────────────────────────────────────────────────────────────

// Keyframed values: [{ f, ...fields }], eased between neighbours, held outside.
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

function Clip({ p, src, view, w, h }) {
  const box = viewBox(view, w, h);
  const trimBefore = Math.max(0, Math.round((src - PROXIES[p].start) * REEL_FPS));
  return (
    <div style={{ position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height, filter: GRADE }}>
      <OffthreadVideo src={staticFile(`proxies/${p}.mp4`)} trimBefore={trimBefore} muted style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

// A frame that moves between layouts (rects, keyed on downbeats) and changes footage behind a rising mask.
function Frame({ rects, shots, until, rise = false, offsetY = 0 }) {
  const f = useCurrentFrame();
  if (f < rects[0].f || (until !== undefined && f >= until)) return null;
  const r = keyAt(rects, f);
  let clip;
  let ty = 0;
  if (rise) {
    const e = legato(clamp((f - rects[0].f) / 11));
    if (e < 1) clip = `inset(${(1 - e) * 100}% 0 0 0)`;
    ty = (1 - e) * 46;
  }
  return (
    <div style={{ position: 'absolute', left: r.x, top: r.y + ty + offsetY, width: r.w, height: r.h, overflow: 'hidden', clipPath: clip, background: INK }}>
      {shots.map((s, i) => {
        const next = shots[i + 1];
        const end = next ? next.f + SWAP : REEL_FRAMES;
        if (f < s.f || f >= end) return null;
        const e = i === 0 ? 1 : legato(clamp((f - s.f) / SWAP));
        const view = s.views ? keyAt(s.views, f, s.ease || legato) : s.view;
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, clipPath: e < 1 ? `inset(${(1 - e) * 100}% 0 0 0)` : undefined }}>
            <Sequence from={s.f} layout="none">
              <Clip p={s.p} src={s.src} view={view} w={r.w} h={r.h} />
            </Sequence>
          </div>
        );
      })}
    </div>
  );
}

// Letters rising out of a mask, `gap` frames apart; fades out after `until`.
function Rise({ text, size, at, gap = 1, until, color = INK, tracking = '0.16em', style }) {
  const f = useCurrentFrame();
  if (f < at || (until !== undefined && f >= until + 6)) return null;
  const out = until !== undefined ? clamp((f - until) / 6) : 0;
  return (
    <div style={{ display: 'flex', overflow: 'hidden', paddingBottom: 2, opacity: 1 - out, ...style }}>
      {Array.from(text).map((c, i) => {
        const e = legato(clamp((f - at - i * gap) / 8));
        return (
          <span key={i} style={{ ...font, fontSize: size, color, letterSpacing: tracking, display: 'inline-block', transform: `translateY(${(1 - e) * 110}%)`, whiteSpace: 'pre' }}>
            {c}
          </span>
        );
      })}
    </div>
  );
}

// A rule drawn from its centre outwards.
function Rule({ x, y, w, at, frames = 12, color = INK, thick = 1, until }) {
  const f = useCurrentFrame();
  if (f < at || (until !== undefined && f >= until + 8)) return null;
  const e = legato(clamp((f - at) / frames));
  const out = until !== undefined ? clamp((f - until) / 8) : 0;
  return <div style={{ position: 'absolute', left: x + (w * (1 - e)) / 2, top: y, width: w * e, height: thick, background: color, opacity: 1 - out }} />;
}

// ── page furniture ─────────────────────────────────────────────────────────────────────────────────────────

const onInk = f => f >= 225 && f < 345;
const OPUS = [[58, 1], [115, 2], [169, 3], [225, 4], [281, 5]];

function Header() {
  const f = useCurrentFrame();
  const vis = clamp((f - 58) / 8) * (1 - clamp((f - 331) / 6));
  if (vis <= 0) return null;
  const color = onInk(f) ? IVORY : INK;
  // the opus number turns over on each new page
  const idx = OPUS.reduce((a, [at], i) => (f >= at ? i : a), 0);
  const since = f - OPUS[idx][0];
  const roll = idx > 0 && since < 8 ? legato(since / 8) : 1;
  const nameVis = clamp((f - 115) / 8);
  return (
    <>
      <div style={{ position: 'absolute', left: M, top: 44, ...font, fontSize: 22, letterSpacing: '0.16em', color, opacity: vis * nameVis }}>Selin Incekara</div>
      <div style={{ position: 'absolute', right: M, top: 44, display: 'flex', ...font, fontSize: 22, letterSpacing: '0.16em', color: onInk(f) ? BRASS : color, opacity: vis }}>
        <span>(Op. 0</span>
        <span style={{ display: 'inline-block', height: 22, overflow: 'hidden', position: 'relative', width: '0.62em' }}>
          {idx > 0 && roll < 1 && <span style={{ position: 'absolute', left: 0, top: 0, transform: `translateY(${-roll * 110}%)` }}>{OPUS[idx - 1][1]}</span>}
          <span style={{ position: 'absolute', left: 0, top: 0, transform: `translateY(${(1 - roll) * 110}%)` }}>{OPUS[idx][1]}</span>
        </span>
        <span>)</span>
      </div>
    </>
  );
}

// The bar line: a rule along the foot of the page with a tick for every bar of the music, filling as it plays.
function BarLine() {
  const f = useCurrentFrame();
  const vis = clamp((f - 58) / 8) * (1 - clamp((f - 331) / 6));
  if (vis <= 0) return null;
  const ink = onInk(f);
  const base = ink ? GRAPHITE : HAIRLINE;
  const fill = ink ? BRASS : INK;
  const xAt = fr => M + CW * (fr / REEL_FRAMES);
  return (
    <div style={{ position: 'absolute', left: 0, top: 1040, width: W, opacity: vis }}>
      <div style={{ position: 'absolute', left: M, width: CW, height: 1, background: base }} />
      <div style={{ position: 'absolute', left: M, width: xAt(f) - M, height: 1, background: fill }} />
      {BARS.map(b => (
        <div key={b} style={{ position: 'absolute', left: xAt(b), top: -8, width: 1, height: 8, background: f >= b ? fill : base }} />
      ))}
    </div>
  );
}

// ── pages ──────────────────────────────────────────────────────────────────────────────────────────────────

const textW = (size, track) => size * (4.842 + track * 14);

// Her name: tracks in over the opening window, then steps aside into the right-hand column.
function NameBlock() {
  const f = useCurrentFrame();
  if (f < 6 || f >= 122) return null;
  const move = legato(clamp((f - 44) / 14));
  const size = lerp(150, 92, move);
  const track = lerp(0.6, 0.06, legato(clamp((f - 6) / 34)));
  const centred = W / 2 - textW(size, track) / 2 + (size * track) / 2;
  const left = lerp(centred, RIGHT_SMALL.x, move);
  const top = lerp(140, 130, move);
  const opacity = clamp((f - 6) / 12) * (1 - clamp((f - 112) / 8));
  const first = clamp((f - 22) / 10) * (1 - clamp((f - 38) / 6));
  const second = clamp((f - 60) / 8);
  return (
    <>
      <div style={{ position: 'absolute', left, top, ...font, fontSize: size, letterSpacing: `${track}em`, color: INK, opacity }}>Selin Incekara</div>
      {first > 0 && <div style={{ position: 'absolute', left: 0, right: 0, top: 782, textAlign: 'center', ...font, fontSize: 24, letterSpacing: '0.5em', paddingLeft: '0.5em', color: FELT, opacity: first }}>Pianist</div>}
      {second > 0 && <div style={{ position: 'absolute', left: RIGHT_SMALL.x, top: 246, ...font, fontSize: 24, letterSpacing: '0.5em', color: FELT, opacity: second * opacity }}>Pianist</div>}
    </>
  );
}

// The opening line: drawn across the page, it opens into the first window.
function OpeningLine() {
  const f = useCurrentFrame();
  if (f >= 42) return null;
  const draw = legato(clamp(f / 9));
  const h = f < 9 ? 0 : keyAt([{ f: 9, h: 0 }, { f: 29, h: SLOT.h }], f).h;
  const fade = 1 - clamp((f - 30) / 12);
  const w = CW * draw;
  const x = M + (CW - w) / 2;
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: 540 - h / 2 - 1, width: w, height: 1.5, background: INK, opacity: fade }} />
      {h > 0 && <div style={{ position: 'absolute', left: x, top: 540 + h / 2, width: w, height: 1.5, background: INK, opacity: fade }} />}
    </>
  );
}

// The contact sheet's frame numbers, and the grease-pencil ring around the chosen frame.
function SheetMarks() {
  const f = useCurrentFrame();
  if (f < 169) return null;
  const ring = legato(clamp((f - 199) / 14));
  const t = TILE(SHEET_MARK);
  const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const a = -0.35 + (i / 120) * (Math.PI * 2 + 0.75);
    const r = 1 + 0.03 * Math.sin(3 * a + 1.1) + 0.018 * Math.sin(7 * a + 0.4) + 0.05 * (i / 120);
    pts.push(`${(cx + Math.cos(a) * 222 * r).toFixed(1)},${(cy + Math.sin(a) * 140 * r).toFixed(1)}`);
  }
  return (
    <>
      {Array.from({ length: 15 }).map((_, i) => {
        const tile = TILE(i);
        const at = i % 2 === 0 && i <= 4 ? 181 : sheetAppear(i);
        return (
          <div key={i} style={{ position: 'absolute', left: tile.x, top: tile.y + tile.h + 10, ...font, fontSize: 18, letterSpacing: '0.16em', color: i === SHEET_MARK && f >= 205 ? INK : FELT, opacity: clamp((f - at) / 6) }}>
            {String(i + 1).padStart(2, '0')}
          </div>
        );
      })}
      {f >= 199 && (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, transform: `rotate(-5deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <path d={`M${pts.join(' L')}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      )}
    </>
  );
}

function SheetTile({ i }) {
  const f = useCurrentFrame();
  const at = sheetAppear(i);
  if (f < at) return null;
  const e = legato(clamp((f - at) / 9));
  const t = TILE(i);
  return (
    <div style={{ position: 'absolute', left: t.x, top: t.y + (1 - e) * 14, width: t.w, height: t.h, overflow: 'hidden', opacity: e, background: INK }}>
      <Sequence from={at} layout="none">
        <Clip {...SHEET[i]} w={t.w} h={t.h} />
      </Sequence>
    </div>
  );
}

// Pages 1–3 on ivory: the window, the spread, the triptych, the contact sheet; then the camera enters frame 08.
function Paper() {
  const f = useCurrentFrame();
  if (f > 225) return null;
  const t = TILE(SHEET_MARK);
  const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
  const S = W / t.w;
  const e = easeInOut(clamp((f - BREATH) / (225 - BREATH)));
  const s = 1 + (S - 1) * e;
  const tx = cx + (W / 2 - cx) * e - cx * s;
  const ty = cy + (H / 2 - cy) * e - cy * s;
  const tri = [TRI(0), TRI(1), TRI(2)];
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <OpeningLine />
        {/* A: the window → the large frame → triptych left → sheet 01 */}
        <Frame
          rects={[{ f: 9, ...SLOT, y: 540, h: 0 }, { f: 29, ...SLOT }, { f: 58, ...SLOT }, { f: 65, ...SLOT, w: BIG_LEFT.w }, { f: 74, ...BIG_LEFT }, { f: 115, ...BIG_LEFT }, { f: 127, ...tri[0] }, { f: 169, ...tri[0] }, { f: 181, ...TILE(0) }]}
          shots={[
            { f: 0, p: 'H3', src: sync(0), views: [{ f: 0, ...V.homeBand }, { f: 58, ...V.homeBand }, { f: 72, ...V.homeWide }] },
            { f: 86, p: 'M', src: 10.5, view: V.hallWide },
            { f: 115, p: 'O1', src: 17.0, view: V.stagePortrait },
            { f: 142, p: 'M', src: 15.5, view: V.hallFace }
          ]}
        />
        {/* B: the small frame in the right column → triptych right → sheet 05 */}
        <Frame
          rise
          rects={[{ f: 67, ...RIGHT_SMALL }, { f: 115, ...RIGHT_SMALL }, { f: 127, ...tri[2] }, { f: 169, ...tri[2] }, { f: 181, ...TILE(4) }]}
          shots={[
            { f: 67, p: 'H3', src: sync(67), view: V.homeFace },
            { f: 115, p: 'A', src: 18.0, view: V.andFace },
            { f: 148, p: 'D', src: 36.0, view: V.dogFace }
          ]}
        />
        {/* C: rises into the middle of the triptych on the second beat → sheet 03 */}
        <Frame
          rise
          rects={[{ f: 124, ...tri[1] }, { f: 169, ...tri[1] }, { f: 181, ...TILE(2) }]}
          shots={[
            { f: 124, p: 'S', src: 22.0, view: V.twiFace },
            { f: 145, p: 'G', src: 15.0, view: V.g1Her }
          ]}
        />
        <NameBlock />
        <Rule x={RIGHT_SMALL.x} y={300} w={RIGHT_SMALL.w} at={72} until={110} />
        {/* captions: the spread, then one under each panel of the triptych */}
        <Rise text="At home, the grand" size={24} at={72} until={84} style={{ position: 'absolute', left: M, top: 984 }} />
        <Rise text="Austrian Master Classes, in concert" size={24} at={90} until={110} gap={0.6} style={{ position: 'absolute', left: M, top: 984 }} />
        {[['On stage', 'In concert'], ['Song of Twilight', 'Grade 1'], ['Andante', 'Dog Hungry']].map(([a, b], i) => (
          <div key={i}>
            <Rise text={a} size={24} at={128 + i * 3} until={140} style={{ position: 'absolute', left: tri[i].x, top: 962 }} />
            <Rise text={b} size={24} at={146 + i * 3} until={164} style={{ position: 'absolute', left: tri[i].x, top: 962 }} />
          </div>
        ))}
        {SHEET.map((s, i) => (s ? <SheetTile key={i} i={i} /> : null))}
        <SheetMarks />
      </div>
    </AbsoluteFill>
  );
}

// Pages 4–5 on ink: the stage, then two cinemascope strips gliding in from either side.
function Stage() {
  const f = useCurrentFrame();
  if (f < 225 || f >= 352) return null;
  const tileStart = sheetAppear(SHEET_MARK);
  // the brass frame follows the portrait frame while it rests, then leaves with it
  const frameRect = keyAt([{ f: 266, ...PORTRAIT }, { f: 281, ...PORTRAIT }, { f: 293, ...PORTRAIT, y: -930 }], f);
  const border = legato(clamp((f - 266) / 14));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Frame
        until={294}
        rects={[{ f: 225, x: 0, y: 0, w: W, h: H }, { f: 254, x: 0, y: 0, w: W, h: H }, { f: 266, ...PORTRAIT }, { f: 281, ...PORTRAIT }, { f: 293, ...PORTRAIT, y: -930 }]}
        shots={[{ f: 225, p: 'O1', src: SHEET[SHEET_MARK].src + (225 - tileStart) / REEL_FPS, views: [{ f: 225, ...V.stageWide }, { f: 254, ...V.stageWide }, { f: 266, ...V.stagePortrait }] }]}
      />
      {f >= 266 && f < 294 && (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <rect x={frameRect.x - 16} y={frameRect.y - 16} width={frameRect.w + 32} height={frameRect.h + 32} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - border} stroke={BRASS} strokeWidth={1.2} fill="none" />
        </svg>
      )}
      <Rise text="On stage" size={26} at={268} until={280} color={BRASS} style={{ position: 'absolute', left: 0, right: 0, top: 958, justifyContent: 'center' }} />
      <Frame
        until={352}
        rects={[{ f: 281, ...STRIP_TOP, x: W }, { f: 295, ...STRIP_TOP }]}
        shots={[
          { f: 281, p: 'M', src: 11.5, views: [{ f: 281, ...V.hallWide }, { f: 337, ...V.hallWide, x: 0.54 }], ease: x => x },
          { f: 310, p: 'O2', src: 63.8, view: V.stageEnd }
        ]}
      />
      <Frame
        until={352}
        rects={[{ f: 285, ...STRIP_BOTTOM, x: -CW }, { f: 299, ...STRIP_BOTTOM }]}
        shots={[
          { f: 285, p: 'H1', src: 14.0, views: [{ f: 285, x: 0.42, y: 0.55, z: 1.0 }, { f: 337, x: 0.38, y: 0.55, z: 1.0 }], ease: x => x },
          { f: 313, p: 'S', src: 23.0, view: V.twiWide }
        ]}
      />
      <Rise text="In concert" size={22} at={297} until={309} color={BRASS} style={{ position: 'absolute', left: M, top: 526 }} />
      <Rise text="On stage" size={22} at={314} until={334} color={BRASS} style={{ position: 'absolute', left: M, top: 526 }} />
      <Rise text="At home" size={22} at={301} until={312} color={BRASS} style={{ position: 'absolute', left: M, top: 946 }} />
      <Rise text="Song of Twilight" size={22} at={317} until={334} color={BRASS} style={{ position: 'absolute', left: M, top: 946 }} />
    </AbsoluteFill>
  );
}

// Page 6: an ivory page rises over the stage, carrying her last phrase at the grand and her name, edge to edge.
function Finale() {
  const f = useCurrentFrame();
  if (f < 337) return null;
  const up = legato(clamp((f - 337) / 14));
  const top = lerp(H, 0, up);
  return (
    <div style={{ position: 'absolute', left: 0, top, width: W, height: H, background: IVORY }}>
      {up < 1 && <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 1, background: INK }} />}
      <Frame
        rects={[{ f: 337, ...FINAL }]}
        shots={[{ f: 337, p: 'H2', src: sync(337), views: [{ f: 337, ...V.homeWide, z: 1.12 }, { f: 441, ...V.homeWide, z: 1.0 }], ease: easeInOut }]}
      />
      <Rise text="Selin Incekara" size={366} at={347} gap={2} tracking="0" style={{ position: 'absolute', left: M - 4, top: 742, lineHeight: 0.8 }} />
      <Rule x={M} y={1046} w={CW} at={CHORD} frames={16} />
      <Rise text="Pianist" size={26} at={CHORD} gap={1.2} color={FELT} tracking="0.5em" style={{ position: 'absolute', left: 0, right: 0, top: 54, justifyContent: 'center' }} />
    </div>
  );
}

export function Reel() {
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <Audio src={staticFile('audio/reel.wav')} />
      <Paper />
      <Stage />
      <Header />
      <BarLine />
      <Finale />
      <Grain />
    </AbsoluteFill>
  );
}
