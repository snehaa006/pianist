// Builds the soundtrack from the original recordings, following src/edl.js:
//   each cue is cut at its breath, loudness-matched (the eight phones recorded at very different levels),
//   faded, placed on the timeline and mixed; then a gentle limiter.
// Also writes public/envelope.json: per-frame loudness and note onsets of the mix, which drive the strings.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUDIO, DURATION, FPS } from '../src/edl.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const videos = join(root, '..', 'videos');
const work = join(root, 'out', 'audio');
const pub = join(root, 'public', 'audio');
mkdirSync(work, { recursive: true });
mkdirSync(pub, { recursive: true });

const TARGET = -19; // LUFS for the music cues
const clipPath = clip => join(videos, `WhatsApp Video 2026-10-06 at ${clip}.mp4`);
const ff = args => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });

// Integrated loudness (ebur128 prints its summary on stderr).
function measure(file, a, b) {
  const args = ['-hide_banner', '-nostats'];
  if (a !== undefined) args.push('-ss', String(a), '-to', String(b));
  args.push('-i', file, '-af', 'ebur128', '-f', 'null', '-');
  const res = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  const m = [...res.stderr.matchAll(/^\s+I:\s+(-?[\d.]+) LUFS/gm)].pop();
  return m ? parseFloat(m[1]) : -30;
}

// 1. cut every cue from its original file (48 kHz stereo)
const gains = {};
for (const c of AUDIO) {
  const raw = join(work, `${c.id}.wav`);
  ff(['-ss', String(c.src), '-to', String(c.srcEnd), '-i', clipPath(c.clip), '-vn', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s24le', raw]);
  if (!c.matchTo) {
    const lufs = measure(raw);
    gains[c.id] = TARGET - lufs;
    console.log(`${c.id.padEnd(9)} ${lufs.toFixed(1)} LUFS → ${gains[c.id] >= 0 ? '+' : ''}${gains[c.id].toFixed(1)} dB`);
  }
}
for (const c of AUDIO.filter(c => c.matchTo)) {
  let g = gains[c.matchTo];
  if (c.matchWindow) {
    // the finale: match its music (the last chords) to the target, so the applause after keeps its natural level
    const lufs = measure(clipPath(c.clip), c.matchWindow[0], c.matchWindow[1]);
    g = TARGET - lufs;
  }
  gains[c.id] = g + (c.gain || 0);
  console.log(`${c.id.padEnd(9)} matched → ${gains[c.id] >= 0 ? '+' : ''}${gains[c.id].toFixed(1)} dB`);
}

// 2. place, fade and mix
const inputs = [];
const chains = [];
AUDIO.forEach((c, i) => {
  inputs.push('-i', join(work, `${c.id}.wav`));
  const len = c.srcEnd - c.src;
  const parts = [`volume=${gains[c.id].toFixed(2)}dB`];
  // after the last chord has rung, the applause sits lower than her playing
  if (c.duck) parts.push(`volume='1-${1 - Math.pow(10, c.duck.db / 20)}*min(max((t-${c.duck.at - c.src})/${c.duck.ramp},0),1)':eval=frame`);
  if (c.fadeIn > 0) parts.push(`afade=t=in:st=0:d=${c.fadeIn}:curve=qsin`);
  if (c.fadeOut > 0) parts.push(`afade=t=out:st=${(len - c.fadeOut).toFixed(3)}:d=${c.fadeOut}:curve=qsin`);
  const ms = Math.round(c.at * 1000);
  parts.push(`adelay=${ms}|${ms}`);
  chains.push(`[${i}:a]${parts.join(',')}[a${i}]`);
});
const mixIn = AUDIO.map((_, i) => `[a${i}]`).join('');
const graph = `${chains.join(';')};${mixIn}amix=inputs=${AUDIO.length}:normalize=0:dropout_transition=0,` +
  `apad=whole_dur=${DURATION},atrim=0:${DURATION},alimiter=limit=0.89:attack=5:release=80:level=false[out]`;
const mix = join(pub, 'soundtrack.wav');
ff([...inputs, '-filter_complex', graph, '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', mix]);
console.log('mix →', mix, 'integrated', measure(mix).toFixed(1), 'LUFS');

// 3. envelope for the strings: per frame loudness (0–1) and onset strength (0–1)
const SR = 12000;
const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', mix, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4);
const hop = SR / FPS;
const frames = Math.round(DURATION * FPS);
const rms = [];
const flux = [];
let prevBands = null;
const N = 512;
for (let f = 0; f < frames; f++) {
  const s = Math.floor(f * hop);
  let acc = 0;
  for (let i = s; i < s + hop && i < x.length; i++) acc += x[i] * x[i];
  const r = Math.sqrt(acc / hop) + 1e-9;
  rms.push(Math.max(0, Math.min(1, (20 * Math.log10(r) + 50) / 40)));
  // crude spectral flux: energy in 8 bands from a short DFT-free filter bank (first differences of band energy)
  const bands = new Array(8).fill(0);
  for (let b = 0; b < 8; b++) {
    const step = 1 << b;
    let e = 0;
    for (let i = s; i < s + N && i + step < x.length; i++) {
      const d = x[i + step] - x[i];
      e += d * d;
    }
    bands[b] = Math.log1p(e * 50);
  }
  let fl = 0;
  if (prevBands) for (let b = 0; b < 8; b++) fl += Math.max(0, bands[b] - prevBands[b]);
  prevBands = bands;
  flux.push(fl);
}
const sorted = [...flux].sort((a, b) => a - b);
const p98 = sorted[Math.floor(sorted.length * 0.98)] || 1;
const onset = flux.map(v => Math.max(0, Math.min(1, v / p98)));
writeFileSync(join(root, 'src', 'envelope.json'), JSON.stringify({ fps: FPS, rms: rms.map(v => +v.toFixed(3)), onset: onset.map(v => +v.toFixed(3)) }));
console.log('envelope →', frames, 'frames');
