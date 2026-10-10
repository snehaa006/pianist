import { Freeze, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FPS, PORTRAIT_VIEW, PORTRAIT_X, PROXIES, portraitZoom } from './edl.js';
import { clamp, easeInOut, easeSine, frames, legato, mixView, viewBox } from './util.js';

// One view of a proxy, cropped and positioned inside a panel.
function View({ p, src, rate = 1, freeze, view, pw, ph }) {
  const { width, height } = useVideoConfig();
  const box = viewBox(view, pw ?? width, ph ?? height);
  const trimBefore = Math.max(0, Math.round((src - PROXIES[p].start) * FPS));
  const video = (
    <OffthreadVideo
      src={staticFile(`proxies/${p}.mp4`)}
      trimBefore={trimBefore}
      playbackRate={rate}
      muted
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
  return (
    <div style={{ position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height }}>
      {freeze ? <Freeze frame={0}>{video}</Freeze> : video}
    </div>
  );
}

const GAP = 4;

export function Shot({ shot: base, portrait = false }) {
  const shot = portrait && PORTRAIT_VIEW[base.id] ? { ...base, ...PORTRAIT_VIEW[base.id] } : base;
  const f = useCurrentFrame();
  const { width: WIDTH, height: HEIGHT } = useVideoConfig();
  // portrait: move the frame's centre onto her and ease the zoom back
  const fit = v => (portrait ? { x: v.x + (PORTRAIT_X[shot.id] || 0), y: v.y, z: portraitZoom(v.z) } : v);
  const at = (a, b, kk) => fit(mixView(a, b, kk));
  const len = frames(shot.end) - frames(shot.at);
  const t = f / FPS;
  const k = easeSine(clamp(f / Math.max(1, len - 1)));
  const remain = (len - 1 - f) / FPS;

  let opacity = 1;
  const filters = [];
  let clipPath;
  let mask;
  const enter = shot.enter;
  if (enter) {
    const e = clamp(t / enter.dur);
    if (enter.type === 'fade') opacity = easeInOut(e);
    if (enter.type === 'time') {
      // present ↔ past: the new image arrives out of soft focus and a little light
      opacity = easeInOut(e);
      if (e < 1) filters.push(`blur(${((1 - legato(e)) * 9).toFixed(2)}px)`, `brightness(${(1 + 0.22 * (1 - e)).toFixed(3)})`);
    }
    if (enter.type === 'lights') {
      opacity = legato(e);
      if (e < 1) filters.push(`brightness(${(0.25 + 0.75 * legato(e)).toFixed(3)})`);
    }
    if (enter.type === 'spot') {
      const r = 140 * legato(e);
      if (e < 1) mask = `radial-gradient(ellipse 60% 70% at ${portrait ? 50 : 44}% 52%, #000 ${Math.max(0, r - 60)}%, transparent ${r}%)`;
    }
    if (enter.type === 'expand') clipPath = portrait ? `inset(${(1 - legato(e)) * 50}% 0 0 0)` : `inset(0 0 0 ${(1 - legato(e)) * 50}%)`;
  }
  const exit = shot.exit;
  if (exit && remain < exit.dur) {
    const x = clamp(1 - remain / exit.dur);
    if (exit.type === 'black') opacity *= 1 - x;
    if (exit.type === 'dim') filters.push(`brightness(${(1 - 0.95 * easeInOut(x)).toFixed(3)})`);
  }
  if (shot.freeze && shot.id !== 'loop') filters.push(`brightness(${(1 - 0.12 * k).toFixed(3)})`);

  const style = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    opacity,
    filter: filters.length ? filters.join(' ') : undefined,
    clipPath,
    WebkitMaskImage: mask,
    maskImage: mask
  };

  if (shot.layout === 'diptych') {
    // side by side in landscape, stacked in portrait; both open from the dividing line
    const pw = portrait ? WIDTH : (WIDTH - GAP) / 2;
    const ph = portrait ? (HEIGHT - GAP) / 2 : HEIGHT;
    const e = shot.enter?.type === 'split' ? legato(clamp(t / shot.enter.dur)) : 1;
    return (
      <div style={style}>
        {shot.panels.map((panel, i) => {
          const r = (1 - e) * 100;
          const reveal = portrait ? (i === 0 ? `inset(${r}% 0 0 0)` : `inset(0 0 ${r}% 0)`) : i === 0 ? `inset(0 0 0 ${r}%)` : `inset(0 ${r}% 0 0)`;
          const pos = portrait ? { left: 0, width: pw, top: i * (ph + GAP), height: ph } : { top: 0, height: ph, left: i * (pw + GAP), width: pw };
          return (
            <div key={i} style={{ position: 'absolute', ...pos, overflow: 'hidden', clipPath: reveal }}>
              <View p={shot.p} src={shot.src} view={at(panel.from, panel.to, k)} pw={pw} ph={ph} />
            </div>
          );
        })}
      </div>
    );
  }

  if (shot.layout === 'triptych') {
    // three columns in landscape, three bands in portrait
    const pw = portrait ? WIDTH : (WIDTH - 2 * GAP) / 3;
    const ph = portrait ? (HEIGHT - 2 * GAP) / 3 : HEIGHT;
    const place = i => (portrait ? { left: 0, width: pw, top: i * (ph + GAP), height: ph } : { top: 0, height: ph, left: i * (pw + GAP), width: pw });
    const seam = i => (portrait ? { left: 0, width: WIDTH, top: (i + 1) * ph + i * GAP, height: GAP } : { top: 0, height: HEIGHT, left: (i + 1) * pw + i * GAP, width: GAP });
    return (
      <div style={style}>
        {shot.bg && <View p={shot.p} src={shot.src} view={at(shot.bg.from, shot.bg.to, k)} />}
        {/* ink seams between neighbouring panels once both are in */}
        {[0, 1].map(i => {
          const both = Math.min(legato(clamp((t - shot.beats[i]) / 0.24)), legato(clamp((t - shot.beats[i + 1]) / 0.24)));
          return both > 0 ? <div key={`g${i}`} style={{ position: 'absolute', ...seam(i), background: '#0B0B0C', opacity: both, zIndex: 2 }} /> : null;
        })}
        {shot.panels.map((panel, i) => {
          const e = legato(clamp((t - shot.beats[i]) / 0.24));
          if (e <= 0) return null;
          return (
            <div key={i} style={{ position: 'absolute', ...place(i), overflow: 'hidden', clipPath: portrait ? `inset(0 ${(1 - e) * 100}% 0 0)` : `inset(0 0 ${(1 - e) * 100}% 0)`, background: '#0B0B0C' }}>
              <View p={shot.p} src={shot.src} view={at(panel.from, panel.to, k)} pw={pw} ph={ph} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={style}>
      <View p={shot.p} src={shot.src} rate={shot.rate} freeze={shot.freeze} view={at(shot.from, shot.to, k)} />
    </div>
  );
}
