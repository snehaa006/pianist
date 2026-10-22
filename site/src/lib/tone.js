// A soft struck tone for the keys of the Biography's fan: a few sine partials, each dying away on its own (the high ones
// first), a touch of piano-string stretch in the overtones, and a low-pass that closes with the pitch. Low notes ring
// longer than high ones. Only ever started inside the visitor's own press, so nothing sounds unasked.
let ctx = null;

const PARTIALS = [
  // overtone, loudness, how long it rings (s, before the pitch scaling)
  [1, 1, 1.8],
  [2, 0.42, 1.1],
  [3, 0.2, 0.7],
  [4, 0.09, 0.45],
  [5, 0.05, 0.3]
];

export function strike(midi) {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  if (!ctx) ctx = new Context();
  if (ctx.state === 'suspended') ctx.resume();
  const f = 440 * 2 ** ((midi - 69) / 12);
  const t = ctx.currentTime;
  const ring = Math.min(1.5, Math.max(0.55, 2.3 - midi / 40));
  const out = ctx.createGain();
  out.gain.value = 0.16;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = Math.min(6000, f * 7);
  out.connect(tone);
  tone.connect(ctx.destination);
  PARTIALS.forEach(([k, loud, decay]) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f * k * (1 + 0.0007 * k * k);
    const env = ctx.createGain();
    const end = t + decay * ring;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(loud, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(env);
    env.connect(out);
    osc.start(t);
    osc.stop(end + 0.05);
  });
}
