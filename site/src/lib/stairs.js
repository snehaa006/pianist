// The stairs: a keyboard turned on its side and pulled out into a flight of steps, after the "See you on the other
// side" linocut poster. The keys come out of the left wall one above the other, each a step further out than the one
// above it, so they climb from the floor to the upper left: the low notes at the bottom, the high ones at the top.
// Cream keys, ink black keys at the back, and under every step the ink shadow of the one above, as in the print.
//
// Each piece gets its own flight: the white keys from its low notes to its high ones (nearly all its notes; the few
// beyond are played an octave in), so a piece with a wide range has more, shallower steps. The stairs build up from the
// floor a step at a time; when another piece is chosen they fold back into the wall from the top and the new flight
// builds. While a piece plays, each key goes in (back toward the wall, darkening) for as long as its note sounds,
// further for louder notes.
//
// createStairs(canvas, options) draws on a 2D canvas the size of its CSS box:
//   build: () => number    how far the first build has got, 0..1, read every frame (the films reel's scroll); without
//                          it the stairs wait folded until grow()
//   play: () => { t, notes, track } | null   the music, as lib/sound.jsx's playhead; keys play along only while it
//                          is the piece on the stairs
//   still: true            reduced motion: the keys never move with the music
// It returns { setPiece(id, notes), grow(), start, stop, resize, destroy }.

const CREAM = '#F4E9D8';
const INK = '#0E0A0A';
const CREAM_RGB = [244, 233, 216];
const INK_RGB = [14, 10, 10];
// A played key: how far it goes in (share of a step's height), the colour it darkens toward at full press (the deep
// poster red over the cream, the stage graphite over the ink), and how long it takes to go in and come back (s).
const PRESS = { travel: 0.5, white: [154, 38, 44], whiteMix: 0.35, black: [58, 42, 43], blackMix: 0.9, down: 0.035, up: 0.14 };
// The flight: at least and at most this many steps, no step taller than `pitch` px, the gap between steps (share of a
// step), the bottom step's reach and the top step's (shares of the canvas width), the black keys' length (share of the
// step above them) and thickness (share of a step), and the shadow under each step: where it starts (share of the step
// above, just past the black keys, so the back reads as a keyboard and the front as stairs), its depth (share of a
// step) and how far it runs past the tip of the step above (share of a step), slanting.
const FLIGHT = { min: 14, max: 26, pitch: 64, gap: 0.1, reach: [0.96, 0.24], black: [0.56, 0.6], from: 0.62, shadow: 0.26, overhang: 0.32 };
// Building and folding: each key takes `span` of the run, the bottom one first; a run takes `build` or `fold` s.
const MOTION = { span: 0.3, build: 1.6, fold: 0.6 };

// Where each note sits on a keyboard: the white key at or below each semitone (from C), and the black ones.
const WHITE_OF = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];
const STEPS = [0, 2, 4, 5, 7, 9, 11];
const whiteIndex = m => Math.floor(m / 12) * 7 + WHITE_OF[m % 12];
const whiteNote = w => Math.floor(w / 7) * 12 + STEPS[w % 7];
const blackAbove = w => [0, 1, 3, 4, 5].includes(w % 7); // C, D, F, G and A have a black key above them

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const legato = t => 1 - (1 - t) ** 3;
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;

// The white keys a piece needs: from its lowest notes to its highest, leaving out the rarest 2% at either end, widened
// or narrowed about its middle to between FLIGHT.min and FLIGHT.max steps. Before its notes arrive: C3 to C6.
function flightOf(notes) {
  let lo = whiteIndex(48);
  let hi = whiteIndex(84);
  if (notes?.length) {
    const m = notes.map(n => n[2]).sort((a, b) => a - b);
    const at = p => m[Math.round(p * (m.length - 1))];
    const top = at(0.98);
    lo = whiteIndex(at(0.02));
    hi = whiteIndex(top) + (IS_BLACK[top % 12] ? 1 : 0);
  }
  const n = hi - lo + 1;
  const want = Math.max(FLIGHT.min, Math.min(FLIGHT.max, n));
  if (want !== n) {
    const mid = (lo + hi) / 2;
    lo = Math.round(mid - (want - 1) / 2);
    hi = lo + want - 1;
  }
  return { lo, hi, n: hi - lo + 1, low: whiteNote(lo), high: whiteNote(hi) };
}

export function createStairs(canvas, options = {}) {
  const o = { still: false, ...options };
  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let dpr = 1;
  let piece = { id: null, ...flightOf(null) }; // the flight on the stairs
  let next = null; // the piece to build once the stairs have folded
  let grown = !!o.build; // asked to build (straight away when something outside drives the first build)
  let own = grown ? 1 : 0; // how built the stairs are by themselves, 0..1 (folding and building between pieces)
  let aim = own; // where `own` is heading
  let press = new Map(); // key (white index, or white index + 0.5 for the black key above it) → 0..1
  let raf = 0;
  let last = 0;
  let drawn = ''; // what the last frame showed, so an unchanged frame is not drawn again

  function resize() {
    const box = canvas.getBoundingClientRect();
    W = box.width;
    H = box.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    drawn = '';
  }

  // Each key's share of the run v (0..1): the bottom key moves first. Building, v rises and the steps come out from the
  // floor up; folding, v falls and they go back in from the top.
  const out = (rank, n, v) => legato(clamp01((v - (rank / n) * (1 - MOTION.span)) / MOTION.span));

  // The notes sounding now, as how far each key is in. A note beyond the flight is played an octave or more in.
  function listen() {
    press = new Map();
    const p = !o.still && o.play?.();
    if (!p || p.track !== piece.id) return;
    const { t, notes } = p;
    for (const [start, end, note, velocity] of notes) {
      if (start - PRESS.down > t) break;
      if (end + PRESS.up < t) continue;
      let m = note;
      while (m < piece.low) m += 12;
      while (m > piece.high + 1) m -= 12;
      const w = whiteIndex(m);
      const key = IS_BLACK[m % 12] ? w + 0.5 : w;
      if (key < piece.lo || key > piece.hi) continue;
      const down = smooth(start - PRESS.down, start, t) * (1 - smooth(end, end + PRESS.up, t));
      press.set(key, Math.max(press.get(key) || 0, down * (0.6 + 0.4 * velocity)));
    }
  }

  function step(dt) {
    if (o.still) own = aim;
    if (own !== aim) {
      const rate = 1 / (aim > own ? MOTION.build : MOTION.fold);
      own = aim > own ? Math.min(aim, own + dt * rate) : Math.max(aim, own - dt * rate);
    }
    // Folded away for a new piece: lay out its flight and build it.
    if (next && own === 0) {
      piece = next;
      next = null;
      aim = grown ? 1 : 0;
      if (o.still) own = aim;
    }
  }

  function draw() {
    listen();
    const built = o.build ? clamp01(o.build()) : 1;
    const sig = `${W}x${H} ${piece.id} ${built.toFixed(4)} ${own.toFixed(4)} ${[...press.values()].map(v => v.toFixed(2)).join()}`;
    if (sig === drawn) return;
    drawn = sig;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const { n, lo } = piece;
    if (!W || !H || built <= 0 || own <= 0) return;

    const pitch = Math.min(FLIGHT.pitch, (H - Math.min(24, H * 0.05)) / n); // a little headroom over the top step
    const gap = Math.max(2, Math.round(pitch * FLIGHT.gap));
    const reach = i => W * (FLIGHT.reach[0] + ((FLIGHT.reach[1] - FLIGHT.reach[0]) * i) / Math.max(1, n - 1));
    const shadow = pitch * FLIGHT.shadow;
    const overhang = pitch * FLIGHT.overhang;
    // How far out each white key is (0 inside the wall .. 1 in place), and how far it has gone in with its note (px).
    const shown = i => Math.min(out(i, n, built), out(i, n, own));
    const pushed = key => (press.get(key) || 0) * pitch * PRESS.travel;
    const tip = i => reach(i) * shown(i) - (1 - shown(i)) * (overhang + 8) - pushed(lo + i);

    // Bottom up: a step, then the shadow the step above casts on it; the step above then sits on the shadow's edge.
    for (let i = 0; i < n; i++) {
      const y = H - (i + 1) * pitch;
      const x = tip(i);
      if (x > 0) {
        const k = press.get(lo + i) || 0;
        ctx.fillStyle = k ? mix(CREAM_RGB, PRESS.white, k * PRESS.whiteMix) : CREAM;
        ctx.fillRect(0, y + gap, x, pitch - gap);
      }
      if (i + 1 < n) {
        const above = tip(i + 1);
        const from = Math.max(0, above * FLIGHT.from);
        if (above + overhang > from) {
          ctx.fillStyle = INK;
          ctx.beginPath();
          ctx.moveTo(from, y);
          ctx.lineTo(Math.max(from, above), y);
          ctx.lineTo(Math.max(from, above + overhang), y + gap + shadow);
          ctx.lineTo(from, y + gap + shadow);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    // The black keys, raised over the white ones at the back, each centred on the line between two steps.
    for (let i = 0; i < n - 1; i++) {
      if (!blackAbove(lo + i)) continue;
      const key = lo + i + 0.5;
      const k = press.get(key) || 0;
      const v = Math.min(out(i + 0.6, n, built), out(i + 0.6, n, own));
      const len = reach(i + 1) * FLIGHT.black[0];
      const x = len * v - (1 - v) * 8 - pushed(key);
      if (x <= 0) continue;
      const th = pitch * FLIGHT.black[1];
      const cy = H - (i + 1) * pitch + gap / 2;
      ctx.fillStyle = k ? mix(INK_RGB, PRESS.black, k * PRESS.blackMix) : INK;
      ctx.fillRect(0, cy - th / 2, x, th);
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }

  resize();

  return {
    // The piece to show. The first one is laid out straight away; after that the stairs fold and rebuild (going back
    // to the piece still on the stairs just builds them out again).
    setPiece(id, notes) {
      if (id === piece.id) {
        next = null;
        aim = grown ? 1 : 0;
      } else if (piece.id === null || own === 0 || o.still) {
        piece = { id, ...flightOf(notes) };
        next = null;
        aim = grown ? 1 : 0;
      } else {
        next = { id, ...flightOf(notes) };
        aim = 0;
      }
      step(0);
      drawn = '';
      if (!raf) draw();
    },
    // Build the stairs from the floor (once they come into view, when nothing outside drives them).
    grow() {
      grown = true;
      if (!next) aim = 1;
      step(0);
      if (!raf) draw();
    },
    start() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    resize() {
      resize();
      if (!raf) draw();
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}
