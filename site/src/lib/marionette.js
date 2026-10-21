// Her name on strings (the footer), after the "Play music, be free" poster: a row of cream piano keys, cut ragged as if
// torn from paper, hangs along the top, the gaps where the black keys would be cut out of them; from each key thin
// threads run down to the letters of her name, which hang and sway on them. The letters are lowered into place on their
// strings the first time the footer comes into view, and the mouse moving through them sets them swinging. While a piece
// plays, the keys play along: each goes down with its note, and the letters hanging from it dip and swing.
//
// createMarionette(canvas, options) draws on a 2D canvas the size of its CSS box:
//   text: 'Selin Incekara'
//   play: () => { t, notes } | null    the music, as lib/sound.jsx's playhead
// It returns { start, stop, still, resize, lower(), poke(x, y, vx), destroy }. still() draws the letters at rest.

const CREAM = '#F4E9D8';
const CREAM_RGB = [244, 233, 216];
const DUST_RGB = [189, 176, 160]; // a played key, darkened toward the stage's dust
const FONT = '"Bebas Neue", "Oswald", "Arial Narrow", sans-serif';
// The scene, in cap heights of the name (Bebas Neue's capitals stand 0.7 of its size): the gap over the keys, the keys
// (at least, or `band` of the height if that is more), the threads under them (at least: they take whatever height is
// left, so the keys hang from the top and the name stands at the bottom however tall the box), the letters, the room
// under them. The name runs `fill` of the width.
const SCENE = { top: 0.08, keys: 1, band: 0.2, threads: 0.6, letters: 1, foot: 0.06, cap: 0.7, fill: 0.97 };
// The keys: about one to every `pitch` cap heights across; heights `height` (share of the band), notches `notch` wide
// (share of a key) and `depth` deep (share of its height), lean up to `lean` degrees, hang down to `drop` lower (share
// of the band), the top cut ragged by up to `rag` (share of its height); a played key goes `dip` of the band down.
const KEYS = { pitch: 0.52, height: [0.72, 1], notch: 0.3, depth: 0.56, lean: 3.2, drop: 0.14, rag: 0.12, dip: 0.07 };
// The letters swing as pendulums: stiffness, damping, the idle sway's push and speed, how far the mouse pushes, how
// hard a played key tugs; and how they are lowered: from how high (share of the threads), how springy, how far apart.
const SWING = { stiff: 9, damp: 1.3, sway: 0.11, rate: 1.1, poke: 0.00035, tug: 1.6, spring: [70, 9], from: 0.8, stagger: 0.07 };
const PRESS = { down: 0.035, up: 0.14 };

const WHITE_OF = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
const STEPS = [0, 2, 4, 5, 7, 9, 11];
const whiteIndex = m => Math.floor(m / 12) * 7 + WHITE_OF[m % 12];
const whiteNote = w => Math.floor(w / 7) * 12 + STEPS[w % 7];
const blackAbove = w => [0, 1, 3, 4, 5].includes(w % 7);

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;

function random(seed) {
  let x = seed >>> 0;
  return () => {
    x = (x + 0x6d2b79f5) >>> 0;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMarionette(canvas, options = {}) {
  const o = { text: 'Selin Incekara', ...options };
  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let dpr = 1;
  let keys = [];
  let letters = [];
  let low = 60;
  let high = 72;
  let clock = 0;
  let raf = 0;
  let last = 0;
  let ready = false; // the font has arrived
  let lowering = -1; // when the letters started down on their strings (clock), or -1 before

  function layout() {
    const box = canvas.getBoundingClientRect();
    W = box.width;
    H = box.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    if (!ready || !W || !H) return;

    const text = o.text.toUpperCase();
    ctx.font = `100px ${FONT}`;
    const at100 = ctx.measureText(text).width;
    const least = SCENE.top + SCENE.keys + SCENE.threads + SCENE.letters + SCENE.foot;
    const size = Math.min((W * SCENE.fill * 100) / at100, H / (least * SCENE.cap));
    const cap = size * SCENE.cap;
    const r = random(23);
    const rest = cap * (SCENE.top + SCENE.threads + SCENE.letters + SCENE.foot); // all but the keys, at their least

    // The keys, from a C, centred on middle C, the band's width shared out between them.
    const band = { top: cap * SCENE.top, h: Math.min(Math.max(cap * SCENE.keys, H * SCENE.band), H - rest) };
    const n = Math.max(6, Math.min(24, Math.round(W / (cap * KEYS.pitch))));
    const first = whiteIndex(60) - Math.floor(n / 2);
    const kw = W / n;
    keys = Array.from({ length: n }, (_, i) => {
      const w = whiteIndex(whiteNote(first + i));
      const h = band.h * lerp(KEYS.height[0], KEYS.height[1], r());
      const bottom = band.top + band.h - r() * KEYS.drop * band.h;
      const half = (kw * 0.9) / 2;
      const notch = kw * 0.9 * KEYS.notch;
      const left = blackAbove(w - 1) ? notch : 0;
      const right = blackAbove(w) ? notch : 0;
      const neck = -h * KEYS.depth;
      // Corners from the bottom left, clockwise, about the key's bottom centre; the top cut ragged.
      const rag = () => -h + (r() - 0.3) * KEYS.rag * h;
      const shape = [
        [-half, (r() - 0.5) * 0.04 * h],
        [-half, left ? neck : rag()],
        ...(left ? [[-half + left, neck], [-half + left, rag()]] : []),
        [lerp(-half + left, half - right, 0.3 + r() * 0.4), rag()],
        ...(right ? [[half - right, rag()], [half - right, neck]] : []),
        [half, right ? neck : rag()],
        [half, (r() - 0.5) * 0.04 * h]
      ];
      return {
        note: whiteNote(first + i),
        x: kw * (i + 0.5),
        bottom,
        h,
        shape,
        lean: ((r() * 2 - 1) * KEYS.lean * Math.PI) / 180,
        phase: r() * Math.PI * 2,
        press: 0,
        dip: 0
      };
    });
    low = keys[0].note;
    high = keys[keys.length - 1].note;

    // The letters, side by side across the foot of the box, each hung from the key above it on one thread or two.
    const top = H - cap * (SCENE.letters + SCENE.foot);
    const drop = (top - band.top - band.h) * SWING.from; // how far up they start, to be lowered
    ctx.font = `${size}px ${FONT}`;
    let x = (W - ctx.measureText(text).width) / 2;
    const old = letters;
    letters = [];
    [...text].forEach((ch, i) => {
      const w = ctx.measureText(ch).width;
      if (ch !== ' ') {
        const ties = w > cap * 0.42 ? [-0.3, 0.3] : [0];
        const threads = ties.map(t => {
          const tx = x + w / 2 + t * w;
          const key = keys.reduce((best, k) => (Math.abs(k.x - tx) < Math.abs(best.x - tx) ? k : best), keys[0]);
          return { dx: t * w, key };
        });
        const was = old[letters.length];
        letters.push({ ch, x, w, top, size, cap, drop, threads, a: was?.a || 0, va: was?.va || 0, y: was?.y || 0, vy: was?.vy || 0, phase: r() * Math.PI * 2, i });
      }
      x += w;
    });
  }

  // The notes sounding now, as how far down each key is. A note beyond the row is played an octave or more in; a
  // black key's note goes to the white key below it.
  function listen() {
    keys.forEach(k => (k.press = 0));
    const p = !o.still && o.play?.();
    if (!p) return;
    const { t, notes } = p;
    for (const [start, end, note, velocity] of notes) {
      if (start - PRESS.down > t) break;
      if (end + PRESS.up < t) continue;
      let m = note;
      while (m < low) m += 12;
      while (m > high) m -= 12;
      const k = keys.find(key => key.note === whiteNote(whiteIndex(m)));
      if (!k) continue;
      const down = smooth(start - PRESS.down, start, t) * (1 - smooth(end, end + PRESS.up, t));
      k.press = Math.max(k.press, down * (0.6 + 0.4 * velocity));
    }
  }

  function step(dt) {
    clock += dt;
    listen();
    for (const k of keys) {
      const dip = k.press * KEYS.dip * k.h;
      k.tug = (dip - k.dip) / Math.max(dt, 1e-3); // how fast it is going down
      k.dip = dip;
    }
    const [stiff, damp] = SWING.spring;
    for (const l of letters) {
      // Down on the strings: from high up to their place, each a little after the one before.
      const start = lowering < 0 ? Infinity : lowering + l.i * SWING.stagger;
      const hang = l.threads.reduce((s, th) => s + th.key.dip, 0) / l.threads.length;
      const target = clock < start ? -l.drop : hang;
      if (lowering < 0 || clock < start) {
        l.y = target;
        l.vy = 0;
      } else {
        l.vy += (stiff * (target - l.y) - damp * l.vy) * dt;
        l.y += l.vy * dt;
      }
      // Swinging: a pendulum, pushed a little all the time, and tugged by a key going down (the left thread's key one
      // way, the right's the other).
      let push = SWING.sway * Math.sin(clock * SWING.rate + l.phase);
      l.threads.forEach(th => (push += (th.dx >= 0 ? 1 : -1) * th.key.tug * SWING.tug * 0.001 * (l.threads.length > 1 ? 1 : 0.5)));
      l.va += (-SWING.stiff * l.a - SWING.damp * l.va + push) * dt;
      l.va = Math.max(-1, Math.min(1, l.va));
      l.a += l.va * dt;
    }
  }

  // Where a key's bottom is, under a point at x, as it leans and dips.
  const keyFoot = (k, x) => {
    const lean = k.lean + 0.01 * Math.sin(clock * 0.8 + k.phase);
    return { x, y: k.bottom + k.dip + (x - k.x) * Math.sin(lean), lean };
  };

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!ready) return;

    // The threads, from each key's foot down to its letter.
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    for (const l of letters) {
      const cx = l.x + l.w / 2;
      const cy = l.top + l.y;
      for (const th of l.threads) {
        const ax = cx + th.dx * Math.cos(l.a);
        const ay = cy + th.dx * Math.sin(l.a);
        const foot = keyFoot(th.key, ax);
        ctx.moveTo(foot.x, foot.y - 2);
        ctx.lineTo(ax, ay + 2);
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // The keys.
    for (const k of keys) {
      const { lean } = keyFoot(k, k.x);
      ctx.save();
      ctx.translate(k.x, k.bottom + k.dip);
      ctx.rotate(lean);
      ctx.fillStyle = k.press ? mix(CREAM_RGB, DUST_RGB, k.press) : CREAM;
      ctx.beginPath();
      k.shape.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // The letters, each turning about the middle of its top edge.
    ctx.fillStyle = CREAM;
    ctx.textBaseline = 'alphabetic';
    for (const l of letters) {
      ctx.save();
      ctx.translate(l.x + l.w / 2, l.top + l.y);
      ctx.rotate(l.a);
      ctx.font = `${l.size}px ${FONT}`;
      ctx.fillText(l.ch, -l.w / 2, l.cap);
      ctx.restore();
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }

  // The name is drawn only once its face has arrived, so it is never set in a stand-in.
  const font = document.fonts?.load ? document.fonts.load(`100px ${FONT}`) : Promise.resolve();
  font.then(() => {
    ready = true;
    layout();
    if (!raf) draw();
  });
  layout();

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
    // The letters at rest, hanging still (reduced motion).
    still() {
      o.still = true;
      lowering = 0;
      clock = 1e3;
      letters.forEach(l => Object.assign(l, { a: 0, va: 0, y: 0, vy: 0 }));
      draw();
    },
    resize() {
      layout();
      if (!raf) draw();
    },
    // Lower the letters into place on their strings (once, when the footer first comes into view).
    lower() {
      if (lowering < 0) lowering = clock + 0.15;
    },
    // The mouse passing through a letter at (x, y), moving vx px/s, sets it swinging.
    poke(x, y, vx) {
      for (const l of letters) {
        if (x < l.x || x > l.x + l.w || y < l.top + l.y - l.cap * 0.2 || y > l.top + l.y + l.cap * 1.1) continue;
        l.va += vx * SWING.poke;
      }
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}
