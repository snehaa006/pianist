// Light circling her (the films reel, lib/flyIn.js): thin trails of light run round her on tilted orbits, like
// the lines of a globe, cream and scarlet, brightest at the head. Two canvases the size of the screen: the parts of
// each orbit behind her draw on the one under her, the parts in front of her on the one over her.
//
// createTrails(back, front, { centre }) — centre() gives her middle and the globe's radius in canvas px, read every
// frame because the scene moves. step(dt) advances and draws; level (0–1) is how bright the light is (0: nothing
// drawn). The camera looks down on the globe from a little above, as it does on the films ring.

const TAU = Math.PI * 2;
const PERSPECTIVE = 1400;
const SEGMENTS = 18;

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

// Rotation about x, then y, as a 3x3 matrix applied to an orbit point (R cos a, 0, R sin a).
function orient(incline, node, view) {
  const [ci, si, cn, sn, cv, sv] = [Math.cos(incline), Math.sin(incline), Math.cos(node), Math.sin(node), Math.cos(view), Math.sin(view)];
  // Rx(view) · Ry(node) · Rx(incline), keeping only the columns the orbit uses (x and z).
  const col = (x, y, z) => {
    // Rx(incline)
    const y1 = y * ci - z * si;
    const z1 = y * si + z * ci;
    // Ry(node)
    const x2 = x * cn + z1 * sn;
    const z2 = -x * sn + z1 * cn;
    // Rx(view)
    return [x2, y1 * cv - z2 * sv, y1 * sv + z2 * cv];
  };
  return [col(1, 0, 0), col(0, 0, 1)];
}

export function createTrails(back, front, { centre, count = 56, view = -16, seed = 5 } = {}) {
  const r = random(seed);
  const canvases = [back, front];
  const ctxs = canvases.map(c => c.getContext('2d'));
  let W = 0;
  let H = 0;
  let dpr = 1;
  let drawn = false;
  const orbits = Array.from({ length: count }, () => {
    const warm = r() < 0.62;
    return {
      size: 0.78 + r() * 0.55,
      basis: orient((r() - 0.5) * 1.5, r() * TAU, (view * Math.PI) / 180),
      angle: r() * TAU,
      speed: (0.35 + r() * 0.85) * (r() < 0.85 ? 1 : -1),
      length: 0.5 + r() * 1.4,
      width: 0.8 + r() * 1.6,
      colour: warm ? [232, 82 + r() * 50, 64 + r() * 20] : [255, 236, 218]
    };
  });
  const api = { level: 0 };

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvases.forEach(c => {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    });
  }

  function clear() {
    ctxs.forEach(ctx => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
    });
  }

  api.step = dt => {
    orbits.forEach(o => (o.angle += o.speed * dt));
    if (api.level <= 0.001) {
      if (drawn) clear();
      drawn = false;
      return;
    }
    const c = centre();
    if (!c) return;
    clear();
    drawn = true;
    ctxs.forEach(ctx => {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
    });
    for (const o of orbits) {
      const R = c.r * o.size;
      const [ax, az] = o.basis;
      let prev = null;
      for (let k = 0; k <= SEGMENTS; k++) {
        const a = o.angle - (o.length * k) / SEGMENTS * Math.sign(o.speed);
        const px = Math.cos(a) * R;
        const pz = Math.sin(a) * R;
        const x = ax[0] * px + az[0] * pz;
        const y = ax[1] * px + az[1] * pz;
        const z = ax[2] * px + az[2] * pz;
        const s = PERSPECTIVE / (PERSPECTIVE - z);
        const point = [c.x + x * s, c.y + y * s, z, s];
        if (prev) {
          const fade = (1 - k / SEGMENTS) ** 1.7;
          const ctx = ctxs[(prev[2] + z) / 2 > 0 ? 1 : 0];
          const [cr, cg, cb] = o.colour;
          ctx.strokeStyle = `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${(api.level * fade * 0.85).toFixed(3)})`;
          ctx.lineWidth = o.width * point[3] * (0.5 + fade);
          ctx.beginPath();
          ctx.moveTo(prev[0], prev[1]);
          ctx.lineTo(point[0], point[1]);
          ctx.stroke();
        }
        prev = point;
      }
    }
  };

  api.resize = resize;
  api.clear = clear;
  resize();
  return api;
}
