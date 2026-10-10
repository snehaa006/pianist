import { useMemo } from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import envelope from './envelope.json';
import { BAND, FPS, LABELS, LEAKS, LINE_LABELS } from './edl.js';
import { clamp, easeInOut, keyed, legato } from './util.js';

const INK = '#0B0B0C';
const IVORY = '#F4EFE6';
const DUST = '#A8A196';
const BRASS = '#B8935A';
const BRASS_HI = '#D2B07A';

// Struck-string energy: each note onset excites the strings, which then ring down (about a third of a second).
function useStrike() {
  return useMemo(() => {
    const decay = Math.exp(-1 / (0.34 * FPS));
    const out = new Float32Array(envelope.onset.length);
    let s = 0;
    for (let i = 0; i < out.length; i++) {
      s = Math.max(envelope.onset[i], s * decay);
      out[i] = s;
    }
    return out;
  }, []);
}

export const bandAt = t => clamp(keyed(BAND, t, 'h'));

// The band's edges are two brass strings. They vibrate with the music under them; when the band closes
// they meet in a single line.
export function Strings() {
  const { width: WIDTH, height: HEIGHT } = useVideoConfig();
  const frame = useCurrentFrame();
  const strike = useStrike();
  const t = frame / FPS;
  const h = bandAt(t);
  if (h > 0.995) return null;
  const visible = clamp((0.995 - h) / 0.06);
  const energy = strike[Math.min(frame, strike.length - 1)] || 0;
  const loud = envelope.rms[Math.min(frame, envelope.rms.length - 1)] || 0;
  const amp = (1.2 + 9 * energy + 2.5 * loud) * visible;
  const line = (y0, phase) => {
    const pts = [];
    for (let i = 0; i <= 160; i++) {
      const x = (i / 160) * WIDTH;
      const u = x / WIDTH;
      // three standing-wave modes, each ringing at its own rate
      const d =
        Math.sin(Math.PI * u) * Math.cos(2 * Math.PI * 2.1 * t + phase) * 1.0 +
        Math.sin(2 * Math.PI * u) * Math.cos(2 * Math.PI * 3.3 * t + phase * 1.7) * 0.45 +
        Math.sin(3 * Math.PI * u) * Math.cos(2 * Math.PI * 5.2 * t + phase * 2.3) * 0.25;
      pts.push(`${x.toFixed(1)},${(y0 + d * amp).toFixed(2)}`);
    }
    return `M${pts.join(' L')}`;
  };
  const top = HEIGHT / 2 - (h * HEIGHT) / 2;
  const bottom = HEIGHT / 2 + (h * HEIGHT) / 2;
  const paths = h < 0.004 ? [line(HEIGHT / 2, 0)] : [line(top, 0), line(bottom, 1.3)];
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0, opacity: 0.92 }}>
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} stroke={BRASS_HI} strokeWidth={7} strokeOpacity={0.1 + 0.12 * energy} fill="none" />
          <path d={d} stroke={BRASS} strokeWidth={1.6} fill="none" />
        </g>
      ))}
    </svg>
  );
}

// Between the hall and the theatre: a single brass waveform is drawn across the dark, and the stage comes up
// behind it. Its shape is the music's own loudness, so it swells where the playing does.
export function StageWave() {
  const { width: WIDTH, height: HEIGHT } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const A = 57.78, B = 59.05;
  if (t < A || t > B) return null;
  const draw = legato(clamp((t - A) / 0.8));
  const fade = 1 - easeInOut(clamp((t - 58.3) / 0.7));
  // drawn across the middle of the dark, then it settles onto the stage floor as the theatre lights up
  const base = 0.5 + 0.31 * easeInOut(clamp((t - 58.15) / 0.6));
  const lines = [0, 1, 2].map(n => {
    const pts = [];
    for (let i = 0; i <= 220; i++) {
      const u = i / 220;
      const x = u * WIDTH;
      const fr = Math.max(0, Math.min(envelope.rms.length - 1, Math.round(frame - 40 + u * 80)));
      const swell = 0.35 + (envelope.rms[fr] || 0);
      const y =
        HEIGHT * base +
        Math.sin(u * Math.PI * (2.2 + n * 0.35) + t * (1.1 + n * 0.2) + n) * 44 * swell * Math.sin(Math.PI * u) +
        Math.sin(u * Math.PI * 7 + t * 2.4 + n * 2) * 7 * swell;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M${pts.join(' L')}`;
  });
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0, opacity: fade, mixBlendMode: 'screen' }}>
      {lines.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          stroke={i === 0 ? BRASS_HI : BRASS}
          strokeWidth={i === 0 ? 1.8 : 1}
          strokeOpacity={i === 0 ? 0.9 : 0.4}
          fill="none"
        />
      ))}
    </svg>
  );
}

// Warm light passing across the frame at the joins.
export function Leaks() {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <>
      {LEAKS.map((l, i) => {
        const k = (t - l.at) / l.dur;
        if (k < 0 || k > 1) return null;
        const bell = Math.sin(Math.PI * k) ** 2;
        const x = l.from[0] + (l.to[0] - l.from[0]) * easeInOut(k);
        const y = l.from[1] + (l.to[1] - l.from[1]) * easeInOut(k);
        const r = 60 * l.size;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              mixBlendMode: 'screen',
              opacity: bell * l.peak,
              background: `radial-gradient(ellipse ${r}% ${r * 1.3}% at ${x * 100}% ${y * 100}%, rgba(226,186,128,0.95) 0%, rgba(184,120,70,0.45) 38%, rgba(11,11,12,0) 72%)`
            }}
          />
        );
      })}
    </>
  );
}

export function Vignette() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 78% 82% at 50% 50%, rgba(11,11,12,0) 58%, rgba(11,11,12,0.5) 100%)'
      }}
    />
  );
}

// Restrained film grain: six tiles, a new one every two frames.
export function Grain() {
  const { width: WIDTH, height: HEIGHT } = useVideoConfig();
  const frame = useCurrentFrame();
  return (
    <Img
      src={staticFile(`grain/${Math.floor(frame / 2) % 6}.png`)}
      style={{ position: 'absolute', inset: 0, width: WIDTH, height: HEIGHT, opacity: 0.075, mixBlendMode: 'overlay' }}
    />
  );
}

const font = { fontFamily: 'Bebas Neue', fontWeight: 400, fontSynthesis: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap' };

// A tracked label: the letters close in from wide spacing (the site's "track" reveal), a brass rule draws first.
function Tracked({ text, t, dur, size = 28, color = IVORY, rule = true, align = 'left' }) {
  const inK = legato(clamp(t / 0.95));
  const outK = clamp((t - (dur - 0.55)) / 0.55);
  const spacing = 0.62 - 0.36 * inK + 0.1 * outK;
  const opacity = clamp(t / 0.5) * (1 - easeInOut(outK));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: align === 'center' ? 'center' : 'flex-start', opacity }}>
      {rule && <div style={{ width: 44 * legato(clamp(t / 0.6)), height: 1.5, background: BRASS }} />}
      <span style={{ ...font, fontSize: size, letterSpacing: `${spacing}em`, paddingLeft: align === 'center' ? `${spacing}em` : 0, color, lineHeight: 1 }}>{text}</span>
    </div>
  );
}

export function Labels() {
  const { width: WIDTH, height: HEIGHT } = useVideoConfig();
  const tall = HEIGHT > WIDTH;
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <>
      {/* soft ink under the lower-left corner, only while a label shows */}
      {LABELS.map((l, i) =>
        t >= l.at && t <= l.end ? (
          <div key={`s${i}`} style={{ position: 'absolute', left: 0, bottom: 0, width: 1100, height: 300, opacity: clamp((t - l.at) / 0.5) * (1 - clamp((t - l.end + 0.5) / 0.5)), background: 'radial-gradient(ellipse 70% 80% at 0% 100%, rgba(11,11,12,0.55) 0%, rgba(11,11,12,0) 70%)' }} />
        ) : null
      )}
      {LABELS.map((l, i) =>
        t >= l.at && t <= l.end ? (
          <div key={i} style={{ position: 'absolute', left: tall ? 64 : 96, bottom: tall ? 150 : 92 }}>
            <Tracked text={l.text} t={t - l.at} dur={l.end - l.at} size={tall ? 26 : 28} />
          </div>
        ) : null
      )}
      {LINE_LABELS.map((l, i) =>
        t >= l.at && t <= l.end ? (
          <div key={`l${i}`} style={{ position: 'absolute', left: 0, right: 0, top: HEIGHT / 2 - 54 }}>
            <Tracked text={l.text} t={t - l.at} dur={l.end - l.at} size={26} rule={false} align="center" color={IVORY} />
          </div>
        ) : null
      )}
    </>
  );
}

// The name, set in the ink around the band: PIANIST above, SELIN INCEKARA below. Shown while the band is
// narrow (the first and last seconds), tracking out as it opens and in as it closes.
export function Title() {
  const { width: WIDTH, height: HEIGHT } = useVideoConfig();
  const tall = HEIGHT > WIDTH;
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t > 9 && t < 82) return null;
  const h = bandAt(t);
  const vis = clamp((0.47 - h) / 0.15);
  if (vis <= 0) return null;
  const top = HEIGHT / 2 - (h * HEIGHT) / 2;
  const bottom = HEIGHT / 2 + (h * HEIGHT) / 2;
  const spread = 1 - legato(vis);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: top - 60, textAlign: 'center', opacity: vis }}>
        <span style={{ ...font, fontSize: 30, letterSpacing: `${0.46 + 0.3 * spread}em`, paddingLeft: `${0.46 + 0.3 * spread}em`, color: DUST }}>Pianist</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: bottom + 30, textAlign: 'center', opacity: vis }}>
        <span style={{ ...font, fontSize: tall ? 96 : 118, letterSpacing: `${0.12 + (tall ? 0.08 : 0.22) * spread}em`, paddingLeft: `${0.12 + (tall ? 0.08 : 0.22) * spread}em`, color: IVORY, lineHeight: 1 }}>Selin Incekara</span>
      </div>
    </>
  );
}

export { INK };
