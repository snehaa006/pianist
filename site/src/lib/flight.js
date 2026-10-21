// Keys that turn into birds (after the Swell Season poster): a key lifts out of the keyboard, tumbles, and opens
// into a bird that flies off up the page. Each key and each bird is the same 16-point outline, so one morphs into
// the other point by point: the key's long sides become the wings. White keys become cream birds, black keys ink
// ones. A key that has flown grows back from below a moment after its bird has gone.
//
// createFlight(canvas, options) draws on a 2D canvas the size of its CSS box:
//   keybed: () => element   draw a keyboard in this element's box and launch birds from its keys
//   source: () => { x0, x1, y }   or launch them from a line (canvas px), as small slivers of keys
//   from: 0.55              keyboard only: keys launch from this fraction of its width onwards (the right side)
//   every: [0.9, 2.2]       seconds between launches; burst: how many leave together at the start
//   life: [3.4, 5.6]        seconds a flight lasts, from lifting off to leaving
//   reach(x, y, w, h, r)    where a bird leaves the canvas (default: up and to the right, past the top)
//   play: () => { t, notes } | null   keyboard only: music to play along to, `notes` as [start s, end s, MIDI note,
//                           velocity] in order of start and `t` the seconds into it; each key dips while its note sounds
// It returns { start, stop, still, resize, poke(x, y), destroy }. still() draws one fixed frame (reduced motion).

const TAU = Math.PI * 2;
const CREAM = '#F4E9D8';
const INK = '#0E0A0A';

// A swift seen from above, beak to the right (y down): sickle wings twice as wide as it is long, forked tail.
// The wing points (3–5, 11–13) beat.
const BIRD = [
  [0.55, 0.0], [0.38, -0.07], [0.18, -0.09], [0.1, -0.55], [-0.3, -1.0], [-0.08, -0.45], [-0.16, -0.08],
  [-0.74, -0.22], [-0.46, 0.0], [-0.74, 0.22], [-0.16, 0.08], [-0.08, 0.45], [-0.3, 1.0], [0.1, 0.55],
  [0.18, 0.09], [0.38, 0.07]
];
const WING = { 3: 0.7, 4: 1, 5: 0.75, 11: 0.75, 12: 1, 13: 0.7 }; // how far each point travels in a beat
// The same 16 points around an upright key, in the same order: right side, top, left side, bottom.
const KEY = [
  [1, 0], [1, -0.5], [1, -1], [0.5, -1], [0, -1], [-0.5, -1], [-1, -1], [-1, -0.5],
  [-1, 0], [-1, 0.5], [-1, 1], [-0.5, 1], [0, 1], [0.5, 1], [1, 1], [1, 0.5]
];
// Black keys sit after these white keys, counting from A (A0 is the lowest key of a piano): A, C, D, F, G.
const BLACK_AFTER = [true, false, true, true, false, true, true];
// The white keys' notes in each octave from A, in semitones above it; A0 is MIDI note 21.
const WHITE_STEPS = [0, 2, 3, 5, 7, 8, 10];
const whiteNote = j => 21 + 12 * Math.floor(j / 7) + WHITE_STEPS[j % 7];
// A played key: how far it dips (share of its height) and the colour it darkens toward (the deep poster red over the
// cream, the stage graphite over the ink), at full press; how long it takes to go down and to come back up (s).
const PRESS = { dip: 0.07, white: [154, 38, 44], whiteMix: 0.3, black: [58, 42, 43], blackMix: 0.9, down: 0.035, up: 0.14 };
const CREAM_RGB = [244, 233, 216];
const INK_RGB = [14, 10, 10];
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// Small seeded generator, so a still frame is the same every time.
function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bezier = (p, t) => {
  const u = 1 - t;
  return [
    u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
    u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]
  ];
};
const tangent = (p, t) => {
  const u = 1 - t;
  return [
    3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]),
    3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1])
  ];
};

// Default flight: up and to the right, leaving past the top of the canvas.
const upAndRight = (x, y, w, h, r) => [Math.min(x + w * (0.12 + r() * 0.42), w + 60), -40 - r() * 60];

export function createFlight(canvas, options = {}) {
  const o = { from: 0.55, every: [0.9, 2.2], burst: 12, life: [3.4, 5.6], reach: upAndRight, seed: 7, ...options };
  const ctx = canvas.getContext('2d');
  const r = random(o.seed);
  let W = 0;
  let H = 0;
  let dpr = 1;
  let keys = [];
  let fliers = [];
  let clock = 0;
  let next = 0;
  let queue = []; // [time, key] for the opening flock
  let raf = 0;
  let last = 0;
  let lastPoke = 0;
  let size = 14; // a bird's half-span in px
  let byNote = new Map(); // MIDI note → key
  let low = 21; // the keyboard's lowest and highest notes
  let high = 108;

  function resize() {
    const box = canvas.getBoundingClientRect();
    W = box.width;
    H = box.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    build();
  }

  // The keyboard fills the keybed's box: about one white key per 28px, up to the 52 of a full piano. A shorter one is
  // the middle of the piano, so the notes most music is played in are on it.
  function build() {
    keys = [];
    byNote = new Map();
    fliers.forEach(f => (f.key = null)); // birds already up fly on; their keys are rebuilt whole
    if (!o.keybed) {
      size = Math.max(10, Math.min(20, W / 36));
      return;
    }
    const bed = o.keybed()?.getBoundingClientRect();
    const box = canvas.getBoundingClientRect();
    if (!bed || !bed.height) return;
    const top = bed.top - box.top;
    const left = bed.left - box.left;
    const n = Math.max(14, Math.min(52, Math.round(bed.width / 28)));
    const first = Math.round((52 - n) / 2); // white keys of the full piano left off below this keyboard
    const ww = bed.width / n;
    const gap = Math.max(1, ww * 0.07);
    const key = (black, note, x, y, w, h) => {
      const k = { black, note, x, y, w, h, state: 'rest', at: 0, press: 0 };
      keys.push(k);
      byNote.set(note, k);
    };
    for (let i = 0; i < n; i++) key(false, whiteNote(first + i), left + i * ww + gap / 2, top, ww - gap, bed.height);
    for (let i = 0; i < n - 1; i++) {
      if (!BLACK_AFTER[(first + i) % 7]) continue;
      const bw = ww * 0.56;
      key(true, whiteNote(first + i) + 1, left + (i + 1) * ww - bw / 2, top - 1, bw, bed.height * 0.62);
    }
    low = whiteNote(first);
    high = whiteNote(first + n - 1);
    size = Math.max(9, Math.min(24, ww * 0.85));
  }

  // Play along: each key's press (0..1) from the notes sounding now. A note beyond the keyboard is played an octave
  // or more in, on a key it has; a key that has flown is skipped.
  function listen() {
    keys.forEach(k => (k.press = 0));
    const p = o.play?.();
    if (!p) return;
    const { t, notes } = p;
    for (const [start, end, note, velocity] of notes) {
      if (start - PRESS.down > t) break;
      if (end + PRESS.up < t) continue;
      let m = note;
      while (m < low) m += 12;
      while (m > high) m -= 12;
      const k = byNote.get(m);
      if (!k || k.state !== 'rest') continue;
      const down = smooth(start - PRESS.down, start, t) * (1 - smooth(end, end + PRESS.up, t));
      k.press = Math.max(k.press, down * (0.6 + 0.4 * velocity));
    }
  }

  // A flier leaves from a key's box: (x, y) its centre, (w, h) its size.
  function launch(x, y, w, h, black, key, t = clock) {
    const lift = h * 0.35;
    const start = [x, y - lift];
    const end = o.reach(x, y, W, H, r);
    const rise = Math.max(80, y - end[1]);
    const path = [
      start,
      [x + (r() - 0.35) * W * 0.12, start[1] - rise * (0.3 + r() * 0.2)],
      [end[0] - (end[0] - x) * (0.2 + r() * 0.3), end[1] + rise * (0.25 + r() * 0.2)],
      end
    ];
    if (key) key.state = 'gone';
    fliers.push({
      x, y, w, h, black, key, path, lift,
      born: t,
      life: lerp(o.life[0], o.life[1], r()),
      spin: [-1, 0, 1][Math.floor(r() * 3)] * TAU,
      beat: 8 + r() * 5,
      phase: r() * TAU,
      span: size * (0.85 + r() * 0.35),
      sway: r() * TAU
    });
  }

  function fromKey(key, t) {
    launch(key.x + key.w / 2, key.y + key.h / 2, key.w, key.h, key.black, key, t);
  }

  // A resting key on the right side, the rightmost ones most often.
  function pickKey() {
    const span = keys.length ? keys[keys.length - 1].x + keys[keys.length - 1].w : W;
    const free = keys.filter(k => k.state === 'rest' && !k.press && k.x + k.w / 2 > span * o.from);
    if (!free.length) return null;
    const weights = free.map(k => 0.15 + ((k.x + k.w / 2) / span - o.from) ** 1.5);
    let pick = r() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < free.length; i++) {
      pick -= weights[i];
      if (pick <= 0) return free[i];
    }
    return free[free.length - 1];
  }

  // From a source line: a sliver the size of a key, cream or ink.
  function fromLine(t) {
    const s = o.source?.();
    if (!s) return;
    const x = lerp(s.x0, s.x1, r());
    const h = size * (1.6 + r() * 0.8);
    launch(x, s.y + (r() - 0.5) * size, h * 0.26, h, r() < 0.55, null, t);
  }

  function release(t) {
    if (o.keybed) {
      const key = pickKey();
      if (key) fromKey(key, t);
    } else fromLine(t);
  }

  // The opening flock: on a keyboard, about one key in seven (a phone's short keyboard sends up three or four).
  function opening() {
    queue = [];
    const n = o.keybed ? Math.min(o.burst, Math.max(3, Math.round(keys.length * 0.14))) : o.burst;
    for (let i = 0; i < n; i++) queue.push(0.25 + i * (0.16 + r() * 0.22));
    next = queue[queue.length - 1] + o.every[0];
  }

  function step(dt) {
    clock += dt;
    while (queue.length && queue[0] <= clock) {
      queue.shift();
      release(clock);
    }
    if (!queue.length && clock >= next) {
      release(clock);
      next = clock + lerp(o.every[0], o.every[1], r());
    }
    fliers = fliers.filter(f => {
      if (clock - f.born < f.life) return true;
      if (f.key) {
        f.key.state = 'regrow';
        f.key.at = clock + 0.5 + r() * 0.8;
      }
      return false;
    });
    keys.forEach(k => {
      if (k.state === 'regrow' && clock > k.at + 1) k.state = 'rest';
    });
  }

  function drawKey(k) {
    let dy = 0;
    let alpha = 1;
    if (k.state === 'gone') return;
    if (k.state === 'regrow') {
      const p = clamp01(clock - k.at);
      if (p <= 0) return;
      const e = 1 - (1 - p) ** 3;
      dy = (1 - e) * k.h * 0.9;
      alpha = e;
    }
    ctx.globalAlpha = alpha;
    if (k.press) {
      dy += k.press * k.h * PRESS.dip;
      ctx.fillStyle = k.black ? mix(INK_RGB, PRESS.black, k.press * PRESS.blackMix) : mix(CREAM_RGB, PRESS.white, k.press * PRESS.whiteMix);
    } else ctx.fillStyle = k.black ? INK : CREAM;
    ctx.fillRect(k.x, k.y + dy, k.w, k.h);
  }

  function drawFlier(f, t) {
    const u = clamp01((t - f.born) / f.life);
    const liftEnd = 0.1;
    let x;
    let y;
    let heading;
    let v = 0;
    if (u < liftEnd) {
      const e = 1 - (1 - u / liftEnd) ** 2;
      x = f.x;
      y = f.y - f.lift * e;
      heading = -Math.PI / 2;
    } else {
      v = (u - liftEnd) / (1 - liftEnd);
      const s = v ** 1.15;
      [x, y] = bezier(f.path, s);
      const [dx, dy] = tangent(f.path, s);
      heading = Math.atan2(dy, dx) + Math.sin(t * 2.1 + f.sway) * 0.12 * smooth(0.2, 0.6, u);
    }
    const m = smooth(0.06, 0.42, u); // key → bird
    const turn = lerp(0, heading + f.spin, m * m * (3 - 2 * m));
    const wobble = (1 - m) * Math.sin(u * 40 + f.sway) * 0.08;
    const span = f.span * (1 - 0.45 * v);
    // The wings beat once the shape is mostly a bird; now and then a bird glides.
    const glide = Math.sin(t * 0.7 + f.sway) > 0.82 ? 0.35 : 1;
    const beat = 0.5 + 0.5 * Math.cos(f.phase + t * f.beat);
    const flap = lerp(1, lerp(1, 0.22 + 0.78 * beat, glide), smooth(0.4, 0.8, m));
    const a = f.w / 2;
    const b = f.h / 2;
    const cos = Math.cos(turn + wobble);
    const sin = Math.sin(turn + wobble);

    ctx.globalAlpha = 1 - smooth(0.9, 1, u);
    ctx.fillStyle = f.black ? INK : CREAM;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const w = WING[i] || 0;
      const bx = BIRD[i][0] * span + w * (1 - flap) * span * 0.18;
      const by = BIRD[i][1] * span * (w ? lerp(1, flap, w) : 1);
      const px = lerp(KEY[i][0] * a, bx, m);
      const py = lerp(KEY[i][1] * b, by, m);
      const sx = x + px * cos - py * sin;
      const sy = y + px * sin + py * cos;
      if (i) ctx.lineTo(sx, sy);
      else ctx.moveTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    listen();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    keys.forEach(k => !k.black && drawKey(k));
    keys.forEach(k => k.black && drawKey(k));
    fliers.forEach(f => drawFlier(f, clock));
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }

  resize();
  opening();

  return {
    start() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    // One fixed frame: a few birds in the air and the keys they came from missing.
    still() {
      fliers = [];
      queue = [];
      const n = o.keybed ? Math.max(3, Math.round(keys.length * 0.1)) : Math.max(4, Math.round(o.burst * 0.75));
      for (let i = 0; i < n; i++) {
        const born = -(0.45 + (i / n) * 0.48) * 4.4; // far enough along that every one is a bird
        if (o.keybed) {
          const key = pickKey();
          if (key) fromKey(key, born);
        } else fromLine(born);
      }
      fliers.forEach(f => (f.life = 4.4));
      clock = 0;
      draw();
    },
    resize() {
      resize();
      if (!raf) draw();
    },
    // The pointer over the keyboard sends the key under it up.
    poke(px, py) {
      if (!o.keybed || clock - lastPoke < 0.09) return;
      const hit = [...keys].reverse().find(k => k.state === 'rest' && px >= k.x && px <= k.x + k.w && py >= k.y && py <= k.y + k.h);
      if (!hit) return;
      lastPoke = clock;
      fromKey(hit);
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}
