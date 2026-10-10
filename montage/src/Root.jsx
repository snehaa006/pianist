import { Composition } from 'remotion';
import { DURATION, FPS, HEIGHT, WIDTH } from './edl.js';
import { Montage } from './Montage.jsx';
import { Reel } from './reel/Reel.jsx';
import { REEL_FPS, REEL_FRAMES } from './reel/plan.js';
import { VINTAGE_FPS, VINTAGE_FRAMES, Vintage } from './reel/Vintage.jsx';

export function Root() {
  const frames = Math.round(DURATION * FPS);
  return (
    <>
      <Composition id="Montage" component={Montage} durationInFrames={frames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ portrait: false }} />
      {/* phones: the same edit, reframed for a 9:16 screen */}
      {/* the 14-second social cut on the ending of Dog Hungry */}
      <Composition id="Reel" component={Reel} durationInFrames={REEL_FRAMES} fps={REEL_FPS} width={WIDTH} height={HEIGHT} />
      {/* the black-and-white cut on the opening of the home grand recording */}
      <Composition id="ReelVintage" component={Vintage} durationInFrames={VINTAGE_FRAMES} fps={VINTAGE_FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="MontagePortrait" component={Montage} durationInFrames={frames} fps={FPS} width={HEIGHT} height={WIDTH} defaultProps={{ portrait: true }} />
    </>
  );
}
