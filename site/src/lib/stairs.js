// The stairs: a keyboard turned on its side and built into a flight of steps, after the "Howling Black Soul" linocut
// poster. Seen in perspective, the steps climb from the floor, tall near it and smaller as they go up, out of a black
// wall on the left whose edge is cut rough, as in the print; their fronts all end on one smooth S, so the stair's outer
// line winds out and back as it climbs, like a spiral stair seen from the side (after the Beethoven poster). Each step
// is a white key, the low notes at the bottom and the high ones at the top: a cream slab with the ink shadow of the
// step above along its top; the black keys come out of the wall between their two white keys.
//
// Each piece gets its own flight: the white keys from its low notes to its high ones (nearly all its notes; the few
// beyond are played an octave in), so a piece with a wide range has more, shallower steps. The stairs build up from the
// floor a step at a time; when another piece is chosen they fold back into the wall from the top and the new flight
// builds. While a piece plays, each key goes in (back into the wall, darkening) for as long as its note sounds,
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
// The flight: at least and at most this many steps; the bottom step at most `tallest` px high and the top one `recede`
// times its height (perspective); where the wall ends (the steps' back ends) and where the fronts' S runs, at the
// bottom and at the top (shares of the canvas width), winding out and back by `wind` (share of the width), no step
// shorter than `least`; the shadow line under each step above (share of a step's height); the black keys' length
// (share of the tread they lie over) and thickness (share of a step's height); and how rough the wall's edge is (share
// of a step's height).
const FLIGHT = {
  min: 14, max: 26, tallest: 96, recede: 0.32, wall: [0.06, 0.2], nose: [0.74, 0.52], wind: 0.26, least: 0.1,
  line: 0.16, black: [0.5, 0.5], rough: 0.16
};
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
const lerp = (a, b, t) => a + (b - a) * t;

// Small seeded generator, so each flight is cut the same way every time.
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
  let laid = ''; // the canvas size and piece the flight below was laid out for
  let flight = { steps: [], specks: [], outline: () => 0 }; // each step's shape, the S, the specks of the print

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

  // The flight's shape for this canvas and piece: each step's height and place, the wall's rough edge and the specks of
  // the print. Seeded by the piece, so it is cut the same way every time it comes back.
  function lay() {
    const { n, lo } = piece;
    const r = random(31 + lo);
    const q = FLIGHT.recede ** (1 / Math.max(1, n - 1));
    const first = Math.min(FLIGHT.tallest, (H * (1 - q)) / (1 - q ** n));
    const steps = [];
    let y = H;
    for (let i = 0; i < n; i++) {
      const h = first * q ** i;
      const t = i / Math.max(1, n - 1);
      steps.push({
        h,
        bottom: y,
        top: y - h,
        back: W * lerp(FLIGHT.wall[0], FLIGHT.wall[1], t ** 1.4) + (r() - 0.5) * h * 0.4,
        front: 0,
        rough: [0, 1, 2, 3].map(() => 1 + r() * FLIGHT.rough * h)
      });
      y -= h;
    }
    // The S every front ends on, as a function of height (not of step, which perspective crowds at the top): out to the
    // right over the lower half, back in to the left over the upper half, smooth all the way up.
    const top = y;
    const outline = yy => {
      const u = clamp01((H - yy) / (H - top));
      const wall = lerp(FLIGHT.wall[0], FLIGHT.wall[1], u ** 1.4);
      return W * Math.max(wall + FLIGHT.least, lerp(FLIGHT.nose[0], FLIGHT.nose[1], u) + FLIGHT.wind * Math.sin(2 * Math.PI * u));
    };
    steps.forEach(st => (st.front = outline(st.bottom - st.h / 2)));
    // Cream specks in the wall, thickest near its edge; ink specks on the steps by the wall.
    const specks = [];
    const area = W * (H - y);
    for (let k = 0; k < area / 1400; k++) {
      const yy = y + r() * (H - y);
      const row = steps.findIndex(st => yy <= st.bottom && yy > st.top);
      if (row < 0) continue;
      const edge = steps[row].back;
      const xx = r() * edge;
      if (r() > 0.15 + 0.85 * (xx / edge) ** 4) continue;
      specks.push({ row, x: xx, y: yy, s: 0.8 + r() * 1.8, ink: false });
    }
    steps.forEach((st, row) => {
      for (let k = 0; k < 7; k++) {
        const line = Math.max(2, st.h * FLIGHT.line);
        specks.push({ row, x: st.back + st.rough[0] + r() * r() * (st.front - st.back) * 0.35, y: st.top + line + r() * (st.h - line), s: 0.6 + r() * 1.5, ink: true });
      }
    });
    flight = { steps, specks, outline };
    laid = `${W}x${H} ${piece.id}`;
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
    if (laid !== `${W}x${H} ${piece.id}`) lay();
    const { steps, specks, outline } = flight;

    // How far out of the wall each step is (0 inside .. 1 in place), and how far it has gone in with its note (px).
    const shown = i => Math.min(out(i, n, built), out(i, n, own));
    // A step's front at height yy: on the S once it is out, short of it on the way, back from it while its note sounds.
    const front = (i, yy) => {
      const st = steps[i];
      return st.back + (outline(yy) - st.back) * shown(i) - (press.get(lo + i) || 0) * st.h * PRESS.travel;
    };

    // The steps, bottom up: each a cream slab under the shadow of the step above, both ending on the S.
    let reached = -1; // the highest step out of the wall at all
    for (let i = 0; i < n; i++) {
      if (shown(i) <= 0) break;
      reached = i;
      const st = steps[i];
      const line = Math.max(2, st.h * FLIGHT.line);
      const k = press.get(lo + i) || 0;
      const band = (from, to) => {
        ctx.beginPath();
        ctx.moveTo(st.back - 8, from);
        for (let j = 0; j <= 6; j++) {
          const yy = lerp(from, to, j / 6);
          ctx.lineTo(front(i, yy), yy);
        }
        ctx.lineTo(st.back - 8, to);
        ctx.closePath();
        ctx.fill();
      };
      ctx.fillStyle = k ? mix(CREAM_RGB, PRESS.white, k * PRESS.whiteMix) : CREAM;
      band(st.top + line, st.bottom);
      ctx.fillStyle = INK;
      band(st.top, st.top + line);
    }
    if (reached < 0) return;

    // The wall, rising with the steps, its edge cut rough over their back ends; then its specks.
    let top = H;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let i = 0; i <= reached; i++) {
      const st = steps[i];
      const rise = Math.min(1, shown(i) * 3);
      const y1 = st.bottom - st.h * rise;
      st.rough.forEach((d, j) => ctx.lineTo(st.back + d, lerp(st.bottom, y1, j / 3)));
      top = y1;
      if (rise < 1) break;
    }
    ctx.lineTo(0, top);
    ctx.closePath();
    ctx.fill();
    for (const sp of specks) {
      if (sp.row > reached || sp.y < top) continue;
      if (sp.ink && shown(sp.row) < 1) continue;
      ctx.fillStyle = sp.ink ? INK : CREAM;
      ctx.fillRect(sp.x, sp.y, sp.s, sp.s);
    }

    // The black keys, out of the wall between their two white keys, over the shadow line between them.
    for (let i = 0; i < Math.min(reached, n - 1); i++) {
      if (!blackAbove(lo + i)) continue;
      const key = lo + i + 0.5;
      const e = Math.min(out(i + 0.6, n, built), out(i + 0.6, n, own));
      if (e <= 0) continue;
      const below = steps[i];
      const above = steps[i + 1];
      const th = FLIGHT.black[1] * (below.h + above.h) / 2;
      const len = (outline(below.top) - above.back) * FLIGHT.black[0];
      const x = above.back + len * e - (press.get(key) || 0) * above.h * PRESS.travel;
      const k = press.get(key) || 0;
      ctx.fillStyle = k ? mix(INK_RGB, PRESS.black, k * PRESS.blackMix) : INK;
      ctx.beginPath();
      ctx.moveTo(0, below.top - th / 2);
      ctx.lineTo(x, below.top - th / 2);
      ctx.lineTo(x - th * 0.35, below.top + th / 2);
      ctx.lineTo(0, below.top + th / 2);
      ctx.closePath();
      ctx.fill();
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
