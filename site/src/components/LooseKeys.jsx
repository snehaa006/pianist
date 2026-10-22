import { useMemo } from 'react';

// Piano keys cut loose, for the Biography (after a flamenco poster, where roses lie under the dancer and petals fall
// down the page): a pile of keys under her photograph, and stray keys drifting down the page. Each is a key seen from
// above, cream with an ink edge or ink: a white key keeps the notches where its black keys sit (C and F one on the
// right, D, G and A both sides, E and B one on the left), and a line near its front where the key bends down.
const WHITE = {
  right: 'M0.75 0.75H16.5V95H22.25V149.25H0.75Z',
  both: 'M6.5 0.75H16.5V95H22.25V149.25H0.75V95H6.5Z',
  left: 'M6.5 0.75H22.25V149.25H0.75V95H6.5Z'
};
const SHAPES = ['right', 'both', 'left'];

export function Key({ kind, className = '', style }) {
  if (kind === 'black') {
    return (
      <svg className={`key key--black ${className}`} viewBox="0 0 13 95" style={style} aria-hidden="true">
        <path className="key__body" d="M0.75 0.75H12.25V94.25H0.75Z" />
        <path className="key__face" d="M2.5 2.5H10.5V86H2.5Z" />
      </svg>
    );
  }
  return (
    <svg className={`key key--white ${className}`} viewBox="0 0 23 150" style={style} aria-hidden="true">
      <path className="key__body" d={WHITE[kind]} />
      <path className="key__lip" d="M0.75 142.5H22.25" />
    </svg>
  );
}

// A small seeded generator, so a pile falls the same way on every visit (and on the server and the client).
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Keys dropped in a heap along a band, overlapping, at every angle; they fall into place one after another on arrival.
export function KeyPile({ count = 40, seed = 11, className = '' }) {
  const keys = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, (_, i) => {
      const black = r() < 0.32;
      return {
        kind: black ? 'black' : SHAPES[Math.floor(r() * 3)],
        x: ((i + r()) / count) * 100,
        y: 8 + r() * 84,
        r: (r() * 2 - 1) * 88,
        s: 0.8 + r() * 0.4
      };
    });
  }, [count, seed]);
  return (
    <div className={`keypile ${className}`} aria-hidden="true">
      {keys.map((k, i) => (
        <Key
          key={i}
          kind={k.kind}
          className="keypile__key"
          style={{ left: `${k.x}%`, top: `${k.y}%`, '--r': `${k.r}deg`, '--s': k.s, '--i': i }}
        />
      ))}
    </div>
  );
}

// Strays: each is placed by hand ({ kind, x, y in %, w in px, r deg }) and drifts with its section's --p, at its own
// speed (px a screen) and turning (deg a screen), like petals falling past the text.
export function StrayKeys({ keys, className = '' }) {
  return (
    <div className={`strays ${className}`} aria-hidden="true">
      {keys.map((k, i) => (
        <Key
          key={i}
          kind={k.kind}
          className="stray"
          style={{
            left: `${k.x}%`,
            top: `${k.y}%`,
            '--w': `${k.w}px`,
            '--r': `${k.r}deg`,
            '--speed': k.speed || 0,
            '--spin': `${k.spin || 0}deg`
          }}
        />
      ))}
    </div>
  );
}
