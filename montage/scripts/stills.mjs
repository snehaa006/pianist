// Renders stills at given film times (seconds) for review: node scripts/stills.mjs out/stills 0 5.9 12 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { BROWSER, CHROMIUM } from './browser.mjs';

const [outDir, ...times] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: join(process.cwd(), 'src/index.jsx') });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || 'Montage', browserExecutable: BROWSER, chromiumOptions: CHROMIUM });
for (const s of times) {
  const frame = Math.min(composition.durationInFrames - 1, s.startsWith('f') ? parseInt(s.slice(1)) : Math.round(parseFloat(s) * composition.fps));
  await renderStill({ composition, serveUrl, frame, output: join(outDir, `f${String(frame).padStart(4, '0')}.png`), browserExecutable: BROWSER, chromiumOptions: CHROMIUM });
  console.log('still', s, '→ frame', frame);
}
