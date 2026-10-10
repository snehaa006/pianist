// Full render: out/master.mp4 (H.264 CRF 15 + AAC 320k), the source for the web encodes.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { join } from 'node:path';
import { BROWSER, CHROMIUM } from './browser.mjs';

const output = process.argv[2] || 'out/master.mp4';
const serveUrl = await bundle({ entryPoint: join(process.cwd(), 'src/index.jsx') });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || 'Montage', browserExecutable: BROWSER, chromiumOptions: CHROMIUM });
let last = 0;
await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  crf: 15,
  audioCodec: 'aac',
  audioBitrate: '320k',
  pixelFormat: 'yuv420p',
  outputLocation: output,
  concurrency: 4,
  browserExecutable: BROWSER,
  chromiumOptions: CHROMIUM,
  onProgress: ({ progress }) => {
    const p = Math.floor(progress * 20);
    if (p > last) {
      last = p;
      console.log(`${Math.round(progress * 100)}%`);
    }
  }
});
console.log('→', output);
