// Upscales an image 4x with Real-ESRGAN (the "general" compact model) in TensorFlow.js, tile by tile, on the CPU.
// The Biography cover's cut-out is made from a 4x frame of the concert film (see scripts/cutout.py, `stage`): the films
// are under 1080p, and she stands most of a screen tall there.
//
// The model ships, converted to TensorFlow.js, in the @plotdb/upscaler npm package; TensorFlow.js is not a dependency
// of the site, so run this from a scratch folder that has both:
//   npm pack @plotdb/upscaler@0.0.5 && tar xzf plotdb-upscaler-0.0.5.tgz
//   npm i @tensorflow/tfjs@4.22.0 @tensorflow/tfjs-backend-wasm@4.22.0
//   node <site>/scripts/upscale.mjs package/models/realesrgan/general_fast-64 in.png out.png
// Needs ffmpeg and ffprobe (to read and write the image). About 1.5 minutes for a 768x480 frame.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const [modelDir, input, output] = process.argv.slice(2);
if (!output) {
  console.error('usage: node upscale.mjs <model-dir> <in> <out.png>');
  process.exit(1);
}
const require = createRequire(join(process.cwd(), 'noop.js')); // TensorFlow.js from the folder this runs in
const tf = require('@tensorflow/tfjs');
const wasm = require('@tensorflow/tfjs-backend-wasm');
wasm.setWasmPaths(join(dirname(require.resolve('@tensorflow/tfjs-backend-wasm')), '/'));
await tf.setBackend('wasm');
await tf.ready();

const json = JSON.parse(readFileSync(join(modelDir, 'model.json'), 'utf8'));
const bin = readFileSync(join(modelDir, json.weightsManifest[0].paths[0]));
const model = await tf.loadGraphModel(
  tf.io.fromMemory({
    modelTopology: json.modelTopology,
    weightSpecs: json.weightsManifest[0].weights,
    weightData: bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength),
    format: json.format,
    signature: json.signature
  })
);

const [W, H] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
  '-of', 'csv=p=0', resolve(input)]).toString().trim().split(',').map(Number);
const src = execFileSync('ffmpeg', ['-v', 'error', '-i', resolve(input), '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt',
  'rgb24', '-'], { maxBuffer: 1 << 30 });

// 64px tiles (the model's input), each keeping an 8px margin of context that is thrown away after, so seams don't show.
const T = 64, M = 8, S = T - 2 * M, X = 4;
const px = (x, y, c) => src[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 3 + c] / 255;
const out = Buffer.alloc(W * X * H * X * 3);
const rows = Math.ceil(H / S), cols = Math.ceil(W / S);
for (let ty = 0; ty < rows; ty++) {
  for (let tx = 0; tx < cols; tx++) {
    const x0 = tx * S - M, y0 = ty * S - M;
    const tile = new Float32Array(T * T * 3);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) for (let c = 0; c < 3; c++) tile[(y * T + x) * 3 + c] = px(x0 + x, y0 + y, c);
    const res = tf.tidy(() => model.predict(tf.tensor4d(tile, [1, T, T, 3])).clipByValue(0, 1));
    const data = res.dataSync();
    res.dispose();
    for (let y = M * X; y < (M + S) * X; y++) {
      const oy = y0 * X + y;
      if (oy < 0 || oy >= H * X) continue;
      for (let x = M * X; x < (M + S) * X; x++) {
        const ox = x0 * X + x;
        if (ox < 0 || ox >= W * X) continue;
        for (let c = 0; c < 3; c++) out[(oy * W * X + ox) * 3 + c] = Math.round(data[(y * T * X + x) * 3 + c] * 255);
      }
    }
  }
  process.stdout.write(`\rrow ${ty + 1}/${rows}`);
}
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W * X}x${H * X}`, '-i', '-',
  resolve(output)], { input: out });
console.log(`\n${output}: ${W * X}x${H * X}`);
