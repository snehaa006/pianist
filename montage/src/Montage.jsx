import { AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LOOK, SHOTS } from './edl.js';
import { Grain, INK, Labels, Leaks, StageWave, Strings, Title, Vignette, bandAt } from './Overlays.jsx';
import { Shot } from './Shot.jsx';
import { frames, keyed } from './util.js';

// Bebas Neue, self-hosted (the site's face).
const fontHandle = delayRender('Bebas Neue');
const face = new FontFace('Bebas Neue', `url(${staticFile('fonts/BebasNeue-Regular.woff2')}) format('woff2')`);
face
  .load()
  .then(loaded => {
    document.fonts.add(loaded);
    continueRender(fontHandle);
  })
  .catch(() => continueRender(fontHandle));

export function Montage({ portrait = false }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const h = bandAt(t);
  const inset = ((1 - h) / 2) * 100;
  const sat = keyed(LOOK, t, 'sat');
  const warm = keyed(LOOK, t, 'warm');
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Audio src={staticFile('audio/soundtrack.wav')} />
      <AbsoluteFill
        style={{
          clipPath: h < 0.999 ? `inset(${inset}% 0 ${inset}% 0)` : undefined,
          filter: `saturate(${sat.toFixed(3)}) sepia(${warm.toFixed(3)}) contrast(1.03)`
        }}
      >
        {SHOTS.map(shot => (
          <Sequence key={shot.id} from={frames(shot.at)} durationInFrames={frames(shot.end) - frames(shot.at)} layout="none">
            <Shot shot={shot} portrait={portrait} />
          </Sequence>
        ))}
        <Vignette />
      </AbsoluteFill>
      <Leaks />
      <StageWave />
      <Strings />
      <Title />
      <Labels />
      <Grain />
    </AbsoluteFill>
  );
}
