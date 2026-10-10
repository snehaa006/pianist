import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { PROXIES } from '../edl.js';
import { Grain } from '../Overlays.jsx';
import { clamp, easeInOut, legato, mixView, viewBox } from '../util.js';
import { CARD, CHORD, GRID, GRID_ORDER, GRID_ZOOM_TILE, HITS, PLAY_END, REEL_FPS, V, syncSrc } from './plan.js';

const W = 1920;
const H = 1080;
const INK = '#0B0B0C';
const IVORY = '#F4EFE6';
const DUST = '#A8A196';
const BRASS = '#B8935A';
const font = { fontFamily: 'Bebas Neue', fontWeight: 400, fontSynthesis: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1 };

const fontHandle = delayRender('Bebas Neue (reel)');
new FontFace('Bebas Neue', `url(${staticFile('fonts/BebasNeue-Regular.woff2')}) format('woff2')`)
  .load()
  .then(f => {
    document.fonts.add(f);
    continueRender(fontHandle);
  })
  .catch(() => continueRender(fontHandle));

// ── building blocks ────────────────────────────────────────────────────────────────────────────────────────

// A proxy, playing from `src` (source seconds) at the start of its Sequence, framed by `view` inside w × h.
function Clip({ p, src, view, w = W, h = H, rate = 1 }) {
  const box = viewBox(view, w, h);
  const trimBefore = Math.max(0, Math.round((src - PROXIES[p].start) * REEL_FPS));
  return (
    <div style={{ position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height }}>
      <OffthreadVideo src={staticFile(`proxies/${p}.mp4`)} trimBefore={trimBefore} playbackRate={rate} muted style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

// A framed cell. `pop` (frame it appears, local) gives a white flash and a small scale settle.
function Cell({ x, y, w, h, shot, k = 0, pop, style, children }) {
  const f = useCurrentFrame();
  if (pop !== undefined && f < pop) return null;
  const since = pop === undefined ? 99 : f - pop;
  const s = since < 6 ? 1.08 - 0.08 * legato(since / 6) : 1;
  const view = shot.to ? mixView(shot.view, shot.to, k) : shot.view;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', background: INK, ...style }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${s})` }}>
        <Clip p={shot.p} src={shot.src} view={view} w={w} h={h} rate={shot.rate} />
      </div>
      {since < 2 && <div style={{ position: 'absolute', inset: 0, background: IVORY, opacity: since === 0 ? 1 : 0.55 }} />}
      {children}
    </div>
  );
}

const Full = ({ shot, k, style }) => <Cell x={0} y={0} w={W} h={H} shot={shot} k={k} style={style} />;
const useK = dur => clamp(useCurrentFrame() / Math.max(1, dur - 1));

// Letters rising out of a mask, one frame apart.
function Rise({ text, size, color = IVORY, at = 0, gap = 1, style }) {
  const f = useCurrentFrame();
  return (
    <div style={{ display: 'flex', overflow: 'hidden', ...style }}>
      {Array.from(text).map((c, i) => {
        const e = legato(clamp((f - at - i * gap) / 6));
        return (
          <span key={i} style={{ ...font, fontSize: size, color, display: 'inline-block', transform: `translateY(${(1 - e) * 105}%)`, whiteSpace: 'pre' }}>
            {c}
          </span>
        );
      })}
    </div>
  );
}

// ── the beats ──────────────────────────────────────────────────────────────────────────────────────────────

// 1 · Letterbox opens on the stage; her name flickers through Bebas treatments, then settles.
const NAME_STYLES = [
  { fontSize: 150, letterSpacing: '0.06em', color: IVORY },
  { fontSize: 164, letterSpacing: '0.12em', color: 'transparent', WebkitTextStroke: `2px ${IVORY}` },
  { fontSize: 132, letterSpacing: '0.34em', color: BRASS },
  { fontSize: 128, letterSpacing: '0.02em', color: IVORY, transform: 'scaleY(1.55)' },
  { stacked: true, fontSize: 124, color: IVORY },
  { fontSize: 150, letterSpacing: '0.05em', color: IVORY, transform: 'skewX(-13deg)' },
  { fontSize: 112, letterSpacing: '0.14em', color: INK, background: IVORY, padding: '10px 26px 0' }
];
const NAME_SEQ = [0, 1, 2, 3, 4, 5, 6, 1, 3, 2, 0, 4];
function Opening({ dur }) {
  const f = useCurrentFrame();
  const k = useK(dur);
  const band = 0.03 + 0.97 * legato(clamp(f / 12));
  const inset = ((1 - band) / 2) * 100;
  return (
    <AbsoluteFill style={{ clipPath: `inset(${inset}% 0 ${inset}% 0)` }}>
      <Full shot={{ p: 'O1', src: 16.3, view: V.stageWide, to: { ...V.stageWide, z: 1.14 } }} k={k} />
    </AbsoluteFill>
  );
}
function OpeningName() {
  const f = useCurrentFrame();
  if (f < 9) return null;
  const idx = f >= 39 ? 0 : NAME_SEQ[Math.floor((f - 9) / 3) % NAME_SEQ.length];
  const { stacked, ...st } = NAME_STYLES[idx];
  return (
    <AbsoluteFill style={{ alignItems: 'center', top: 96, justifyContent: 'flex-start' }}>
      {stacked ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...font, ...st, lineHeight: 0.86 }}>Selin</div>
          <div style={{ ...font, ...st, lineHeight: 0.86 }}>Incekara</div>
        </div>
      ) : (
        <div style={{ ...font, ...st, paddingLeft: st.letterSpacing }}>Selin Incekara</div>
      )}
      <div style={{ ...font, fontSize: 26, letterSpacing: '0.5em', paddingLeft: '0.5em', color: DUST, marginTop: 26, opacity: clamp((f - 14) / 6) }}>Pianist</div>
    </AbsoluteFill>
  );
}

// 2 · Split screen: the hall drops in from above, home rises from below.
function SplitV() {
  const f = useCurrentFrame();
  // already a third of the way in on the cut, so the accent never lands on an empty frame
  const e = legato(clamp((f + 2) / 9));
  const pw = (W - 6) / 2;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(e - 1) * 100}%)` }}>
        <Cell x={0} y={0} w={pw} h={H} shot={{ p: 'M', src: 14.85, view: V.hallMid }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - e) * 100}%)` }}>
        <Cell x={pw + 6} y={0} w={pw} h={H} shot={{ p: 'H1', src: 12.4, view: { x: 0.33, y: 0.45, z: 1.15 } }} />
      </div>
    </AbsoluteFill>
  );
}

// 3 · Punch-in on her hands.
function Punch({ shot, from = 1.16, frames = 7 }) {
  const f = useCurrentFrame();
  const s = from - (from - 1) * legato(clamp(f / frames));
  return (
    <AbsoluteFill style={{ transform: `scale(${s})` }}>
      <Full shot={shot} />
    </AbsoluteFill>
  );
}

// 4 · Triptych, popping in left to right, SOLO / PIANO in the corners.
function Triptych() {
  const pw = (W - 12) / 3;
  const shots = [
    { p: 'S', src: 22.0, view: { x: 0.6, y: 0.45, z: 1.3 } },
    { p: 'A', src: 18.5, view: { x: 0.4, y: 0.38, z: 1.4 } },
    { p: 'D2', src: syncSrc(86), view: { x: 0.58, y: 0.42, z: 1.25 } }
  ];
  return (
    <AbsoluteFill style={{ background: INK }}>
      {shots.map((s, i) => (
        <Cell key={i} x={i * (pw + 6)} y={0} w={pw} h={H} shot={s} pop={i * 4} />
      ))}
      <Rise text="Solo" size={150} at={4} style={{ position: 'absolute', left: 56, top: 44 }} />
      <Rise text="Piano" size={150} at={10} style={{ position: 'absolute', right: 56, bottom: 40 }} />
    </AbsoluteFill>
  );
}

// 6 · Diagonal stripes sweep the hall in.
function Stripes({ shot, frames = 10, k }) {
  const f = useCurrentFrame();
  const e = legato(clamp(f / frames));
  const P = 260;
  const w = e * P;
  const mask = e < 1 ? `repeating-linear-gradient(115deg, #000 0px, #000 ${w}px, transparent ${w}px, transparent ${P}px)` : undefined;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskPosition: `${e * 220}px 0`, maskPosition: `${e * 220}px 0` }}>
        <Full shot={shot} k={k} />
      </AbsoluteFill>
      {e < 1 && (
        <AbsoluteFill
          style={{
            background: `repeating-linear-gradient(115deg, transparent 0px, transparent ${w}px, rgba(244,239,230,0.95) ${w}px, rgba(244,239,230,0.95) ${w + 22}px, transparent ${w + 22}px, transparent ${P}px)`,
            backgroundPosition: `${e * 220}px 0`,
            opacity: 1 - e * 0.6
          }}
        />
      )}
    </AbsoluteFill>
  );
}
function HallWithTiles({ dur }) {
  const k = useK(dur);
  const qw = (W - 6) / 2;
  const qh = (H - 6) / 2;
  return (
    <AbsoluteFill>
      <Stripes shot={{ p: 'M', src: 10.5, view: V.hallWide, to: { ...V.hallWide, z: 1.08 } }} k={k} />
      {/* picture-in-picture tiles snap into three quadrants on the accents */}
      <Cell x={0} y={0} w={qw} h={qh} shot={{ p: 'O1', src: 18.0, view: V.stageClose }} pop={13} />
      <Cell x={qw + 6} y={0} w={qw} h={qh} shot={{ p: 'H2', src: 86.0, view: V.homeClose }} pop={18} />
      <Cell x={0} y={qh + 6} w={qw} h={qh} shot={{ p: 'S', src: 25.0, view: V.twiHands }} pop={26} />
    </AbsoluteFill>
  );
}

// 7 · Circle iris opens from her hands.
function Iris({ dur }) {
  const f = useCurrentFrame();
  const k = useK(dur);
  const e = legato(clamp(f / 9));
  const r = 20 + 1280 * e;
  const cx = 860, cy = 600;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: e < 1 ? `circle(${r}px at ${cx}px ${cy}px)` : undefined }}>
        <Full shot={{ p: 'O2', src: 63.4, view: V.stageEnd, to: { ...V.stageEnd, z: 1.62 } }} k={k} />
      </AbsoluteFill>
      {e < 1 && (
        <div style={{ position: 'absolute', left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `3px solid ${IVORY}`, opacity: 1 - e }} />
      )}
    </AbsoluteFill>
  );
}

// 8 · The contact sheet: sixteen tiles in a scattered arpeggio, then the camera dives into one.
const GAP = 4;
const TW = (W - 3 * GAP) / 4;
const TH = (H - 3 * GAP) / 4;
function Grid({ zoomAt }) {
  const f = useCurrentFrame();
  const zi = GRID_ZOOM_TILE;
  const col = zi % 4, row = Math.floor(zi / 4);
  const cx = col * (TW + GAP) + TW / 2;
  const cy = row * (TH + GAP) + TH / 2;
  const S = H / TH;
  const e = easeInOut(clamp((f - zoomAt) / 7));
  const s = 1 + (S - 1) * e;
  const tx = cx + (W / 2 - cx) * e - cx * s;
  const ty = cy + (H / 2 - cy) * e - cy * s;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        {GRID.map((g, i) => (
          <Cell key={i} x={(i % 4) * (TW + GAP)} y={Math.floor(i / 4) * (TH + GAP)} w={TW} h={TH} shot={g} pop={GRID_ORDER.indexOf(i)} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

// 9 · Film strip racing across the frame.
function FilmStrip() {
  const f = useCurrentFrame();
  const e = 1 - Math.pow(1 - clamp(f / 21), 2.2);
  const fw = 760, fh = 428, gap = 34;
  const shots = [
    { p: 'O1', src: 21.0, view: V.stageFace },
    { p: 'M', src: 16.0, view: V.hallClose },
    { p: 'S', src: 23.5, view: V.twiFace },
    { p: 'A', src: 20.0, view: V.andHands },
    { p: 'D', src: 36.0, view: V.dogWide },
    { p: 'H2', src: 88.0, view: V.homeWide },
    { p: 'G', src: 21.0, view: V.g1Her }
  ];
  const x = 300 - 3400 * e;
  const holes = Array.from({ length: 110 });
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: 'absolute', left: -300, top: H / 2 - 270, width: W + 600, height: 540, transform: 'rotate(-3deg)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: x, top: 0, height: 540, width: shots.length * (fw + gap) + 900, background: '#151517' }}>
          {[16, 500].map(top => (
            <div key={top} style={{ position: 'absolute', top, left: 0, display: 'flex', gap: 22 }}>
              {holes.map((_, i) => (
                <div key={i} style={{ width: 18, height: 24, background: '#2A2A2E' }} />
              ))}
            </div>
          ))}
          {shots.map((s, i) => (
            <Cell key={i} x={300 + i * (fw + gap)} y={56} w={fw} h={fh} shot={s} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// 10 · Her first name, cut out of the hall footage; burns out to white.
function NameMask({ dur }) {
  const f = useCurrentFrame();
  const s = 1.3 - 0.3 * legato(clamp(f / 6));
  const burn = clamp((f - (dur - 4)) / 4);
  return (
    <AbsoluteFill style={{ background: INK, filter: burn > 0 ? `blur(${2 + 10 * burn}px) contrast(${1 + 5 * burn}) brightness(${1 + 3 * burn})` : undefined }}>
      <AbsoluteFill style={{ isolation: 'isolate' }}>
        <AbsoluteFill style={{ filter: 'brightness(1.25) contrast(0.9)' }}>
          <Full shot={{ p: 'H1', src: 8.0, view: { x: 0.42, y: 0.45, z: 1.15 } }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: '#000', mixBlendMode: 'multiply', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...font, fontSize: 760, letterSpacing: '0.02em', color: '#fff', transform: `scale(${s})`, marginTop: 40 }}>Selin</div>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...font, fontSize: 760, letterSpacing: '0.02em', color: 'transparent', WebkitTextStroke: `2px ${IVORY}`, transform: `scale(${s})`, marginTop: 40 }}>Selin</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// 11 · Home again, burning in from white.
function BurnIn({ shot, dur, frames = 7 }) {
  const f = useCurrentFrame();
  const k = useK(dur);
  const b = 1 - easeInOut(clamp(f / frames));
  return (
    <AbsoluteFill style={{ filter: b > 0 ? `blur(${10 * b}px) contrast(${1 + 5 * b}) brightness(${1 + 3 * b})` : undefined }}>
      <Full shot={shot} k={k} />
    </AbsoluteFill>
  );
}

// 12 · Three columns gliding in opposite directions.
function Columns({ dur }) {
  const f = useCurrentFrame();
  const e = easeInOut(clamp(f / (dur - 1)));
  const cw = (W - 12) / 3;
  const th = 700;
  const travel = 2 * th + 6 - H;
  const cols = [
    [{ p: 'O1', src: 20.2, view: V.stageFace }, { p: 'D2', src: syncSrc(272), view: { x: 0.6, y: 0.45, z: 1.3 } }],
    [{ p: 'S', src: 24.0, view: V.twiHands }, { p: 'M', src: 18.0, view: V.hallFace }],
    [{ p: 'A', src: 17.0, view: V.andFace }, { p: 'O2', src: 64.6, view: V.stageEnd }]
  ];
  return (
    <AbsoluteFill style={{ background: INK }}>
      {cols.map((c, i) => {
        const y = i === 1 ? -travel + travel * e : -travel * e;
        return (
          <div key={i} style={{ position: 'absolute', left: i * (cw + 6), top: 0, width: cw, height: H, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: y, width: cw }}>
              {c.map((s, j) => (
                <Cell key={j} x={0} y={j * (th + 6)} w={cw} h={th} shot={s} />
              ))}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// 13 · Diagonal split: the stage sweeps in over Dog Hungry along a slanted edge.
function Diagonal() {
  const f = useCurrentFrame();
  const off = 1000 * (1 - legato(clamp(f / 5)));
  const x1 = 1120 + off, x2 = 800 + off;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ clipPath: `polygon(0 0, ${x1}px 0, ${x2}px ${H}px, 0 ${H}px)` }}>
        <Full shot={{ p: 'D2', src: syncSrc(286), view: { x: 0.45, y: 0.52, z: 1.55 } }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `polygon(${x1}px 0, ${W}px 0, ${W}px ${H}px, ${x2}px ${H}px)` }}>
        <Full shot={{ p: 'O2', src: 64.2, view: { x: 0.5, y: 0.45, z: 1.5 } }} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={x1} y1={0} x2={x2} y2={H} stroke={IVORY} strokeWidth={5} />
      </svg>
    </AbsoluteFill>
  );
}

// 14 · The silence: her hands leave the keys and travel to the final chord, in sync; the frame closes in.
function Silence({ dur }) {
  const f = useCurrentFrame();
  const k = legato(clamp(f / (dur - 1)));
  return (
    <AbsoluteFill style={{ filter: `brightness(${1 - 0.28 * k})` }}>
      <Full shot={{ p: 'D2', src: syncSrc(PLAY_END), view: { x: 0.47, y: 0.5, z: 1.2 }, to: { x: 0.42, y: 0.55, z: 1.75 } }} k={k} />
    </AbsoluteFill>
  );
}

// 15 · End card: cut-outs of her at five pianos pop onto warm grey under her name.
const CUTS = [
  { name: 'hall', h: 400, left: 40, bottom: 250, at: 4 },
  { name: 'stage', h: 450, left: 1420, bottom: 240, at: 8 },
  { name: 'andante', h: 560, left: 150, bottom: -40, at: 12 },
  { name: 'twilight', h: 520, left: 1110, bottom: -60, at: 16 },
  { name: 'home', h: 700, left: 640, bottom: -30, at: 20 }
];
const SIZES = { hall: [568, 370], stage: [342, 326], andante: [548, 439], twilight: [796, 479], home: [591, 464] };
const GLINTS = [
  [1180, 120, 18, 0], [1560, 300, 12, 1.3], [980, 260, 10, 2.1], [1300, 250, 16, 0.6], [1320, 420, 9, 2.8],
  [600, 520, 12, 1.9], [1850, 330, 10, 0.9], [880, 90, 8, 3.4], [1240, 40, 10, 2.4], [420, 600, 9, 0.3]
];
function Glint({ x, y, s, phase }) {
  const f = useCurrentFrame();
  const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / 7 + phase));
  const z = s * (0.7 + 0.5 * tw);
  return (
    <svg width={z * 2} height={z * 2} style={{ position: 'absolute', left: x - z, top: y - z, opacity: tw }}>
      <path d={`M${z} 0 L${z * 1.18} ${z * 0.82} L${z * 2} ${z} L${z * 1.18} ${z * 1.18} L${z} ${z * 2} L${z * 0.82} ${z * 1.18} L0 ${z} L${z * 0.82} ${z * 0.82} Z`} fill={IVORY} />
    </svg>
  );
}
function EndCard({ dur }) {
  const f = useCurrentFrame();
  const zoom = 1 + 0.035 * (f / dur);
  const slam = 1.18 - 0.18 * legato(clamp(f / 6));
  const tag = legato(clamp((f - 6) / 5));
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 30%, #A8A196 0%, #8F897F 55%, #6B665E 100%)', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {CUTS.map(c => {
          const [w0, h0] = SIZES[c.name];
          const w = (c.h * w0) / h0;
          const since = f - c.at;
          if (since < 0) return null;
          const e = legato(clamp(since / 7));
          const silhouette = since < 2;
          return (
            <Img
              key={c.name}
              src={staticFile(`cutouts/${c.name}.png`)}
              style={{
                position: 'absolute',
                left: c.left,
                bottom: c.bottom,
                height: c.h,
                width: w,
                transform: `translateY(${(1 - e) * 60}px) scale(${0.94 + 0.06 * e})`,
                transformOrigin: '50% 100%',
                filter: silhouette ? 'brightness(0) invert(0.95)' : 'grayscale(1) contrast(1.12) brightness(1.02)'
              }}
            />
          );
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 260, background: `linear-gradient(rgba(11,11,12,0), rgba(11,11,12,0.55))` }} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 84, top: 70, transform: `scale(${slam})`, transformOrigin: '0 0' }}>
        <div style={{ ...font, fontSize: 250, letterSpacing: '0.01em', color: IVORY, lineHeight: 0.8 }}>Selin</div>
        <div style={{ ...font, fontSize: 250, letterSpacing: '0.01em', color: IVORY, lineHeight: 0.8 }}>Incekara</div>
        <div
          style={{
            position: 'absolute', left: 150, top: 168, padding: '10px 22px 6px', borderRadius: 999, background: INK,
            ...font, fontSize: 30, letterSpacing: '0.28em', color: IVORY, transform: `scale(${tag})`, transformOrigin: '0 50%'
          }}
        >
          Pianist
        </div>
      </div>
      <div style={{ position: 'absolute', right: 84, top: 92, textAlign: 'right' }}>
        <Rise text="On stage · in concert" size={52} at={9} gap={0.5} style={{ justifyContent: 'flex-end' }} />
        <Rise text="and at home" size={52} at={14} gap={0.5} style={{ justifyContent: 'flex-end' }} />
      </div>
      {f > 10 && GLINTS.map(([x, y, s, p], i) => <Glint key={i} x={x} y={y} s={s} phase={p} />)}
    </AbsoluteFill>
  );
}

// ── timeline ───────────────────────────────────────────────────────────────────────────────────────────────

// [from, to) frames; later entries draw over earlier ones (overlaps carry the outgoing shot under a wipe).
const TIMELINE = [
  [0, 43, Opening],
  [43, 77, SplitV],
  [77, 86, () => <Punch shot={{ p: 'G', src: 18.3, view: V.g1Hands }} />],
  [86, 121, Triptych],
  [121, 139, () => <Punch shot={{ p: 'T', src: 17.2, view: V.scaleHands }} from={1.1} />],
  [129, 173, HallWithTiles],
  [164, 194, Iris],
  [194, 223, () => <Grid zoomAt={22} />],
  [223, 229, () => <Full shot={{ p: 'H1', src: 12.4 + 29 / 30, view: V.homeWide }} />],
  [229, 250, FilmStrip],
  [250, 259, NameMask],
  [259, 272, ({ dur }) => <BurnIn dur={dur} shot={{ p: 'H2', src: 86.6, view: V.homeWide, to: { ...V.homeWide, z: 1.1 } }} />],
  [272, 286, Columns],
  [286, 294, Diagonal],
  [294, 300, () => <Punch shot={{ p: 'D2', src: syncSrc(294), view: { x: 0.42, y: 0.55, z: 1.7 } }} from={1.12} frames={5} />],
  [300, CHORD, Silence],
  [CHORD, CARD, () => <Punch shot={{ p: 'D2', src: syncSrc(CHORD), view: { x: 0.42, y: 0.56, z: 1.8 } }} from={1.22} frames={6} />]
];

// White flashes on the biggest accents: [frame, peak, length].
const FLASHES = [[294, 0.9, 3], [CHORD, 1, 4], [CARD, 0.75, 3]];

export function Reel() {
  const f = useCurrentFrame();
  // every accent nudges the picture: a quick 3% bump that settles in five frames
  const last = [...HITS].reverse().find(h => h <= f);
  const since = last === undefined ? 99 : f - last;
  const bump = since < 5 && f < PLAY_END ? 1 + 0.03 * Math.pow(1 - since / 5, 2) : 1;
  // an exposure flicker as the stage cuts in (frame 286)
  const flicker = { 286: 1.7, 287: 1.0, 288: 1.4 }[f] || 1;
  const flash = FLASHES.map(([at, peak, len]) => (f >= at && f < at + len ? peak * (1 - (f - at) / len) : 0)).reduce((a, b) => Math.max(a, b), 0);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Audio src={staticFile('audio/reel.wav')} />
      {/* the picture: warm black and white, high contrast */}
      <AbsoluteFill style={{ transform: `scale(${bump})`, filter: `grayscale(1) sepia(0.14) contrast(1.2) brightness(${1.02 * flicker})` }}>
        {TIMELINE.map(([a, b, C], i) => (
          <Sequence key={i} from={a} durationInFrames={b - a} layout="none">
            <C dur={b - a} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Sequence from={0} durationInFrames={43} layout="none">
        <AbsoluteFill style={{ transform: `scale(${bump})` }}>
          <OpeningName />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={CARD} durationInFrames={415 - CARD} layout="none">
        <EndCard dur={415 - CARD} />
      </Sequence>
      {flash > 0 && <AbsoluteFill style={{ background: IVORY, opacity: flash }} />}
      <Grain />
    </AbsoluteFill>
  );
}
