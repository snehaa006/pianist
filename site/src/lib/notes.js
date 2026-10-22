// Music notes let go by a played key, anywhere on the site: a few glyphs rise from a point on the screen, spread and
// fade, like the birds off the hero's keyboard. One fixed layer over the page (under the nav), made on first use; each
// note removes itself when its flight ends, and the layer keeps no more than 60 at once. The Biography's fan draws its
// own (KeyFan.jsx) from the same shapes, so they scroll with it.

// The glyphs, drawn on a 32 x 44 (36 x 46 for the beamed pair) box: note heads (ellipses, tilted), then stems, flags
// and beams as paths. q a crotchet, e a quaver, s a semiquaver, b two beamed quavers.
export const NOTE_SHAPES = {
  q: { box: [32, 44], heads: [[10, 36]], paths: ['M15.6 6h2.2v30h-2.2z'] },
  e: { box: [32, 44], heads: [[10, 36]], paths: ['M15.6 6h2.2v30h-2.2z', 'M17.8 6c.2 7 9.2 9 7.2 20-1-7-4-10-7.2-11z'] },
  s: {
    box: [32, 44],
    heads: [[10, 36]],
    paths: ['M15.6 6h2.2v30h-2.2z', 'M17.8 6c.2 7 9.2 9 7.2 20-1-7-4-10-7.2-11z', 'M17.8 13c.2 7 9.2 9 7.2 20-1-7-4-10-7.2-11z']
  },
  b: { box: [36, 46], heads: [[8, 38], [25, 34]], paths: ['M13.4 10.5h2.2V38h-2.2zM30.4 6.5h2.2V34h-2.2zM13.4 10.5L32.6 6.5v5.4L13.4 16z'] }
};
export const NOTE_KINDS = ['q', 'e', 'b', 's'];

const svgOf = kind => {
  const { box, heads, paths } = NOTE_SHAPES[kind];
  const h = heads.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7.4" ry="5.2" transform="rotate(-22 ${x} ${y})"/>`);
  return `<svg viewBox="0 0 ${box[0]} ${box[1]}">${h.join('')}${paths.map(d => `<path d="${d}"/>`).join('')}</svg>`;
};

let layer = null;

// Let `count` notes go from (x, y), in viewport px. `tones` are colour tokens, the first note taking the first.
export function letNotes(x, y, { count = 3, tones = ['ink', 'ink'], size = 1, rise = 1, seed = 0 } = {}) {
  if (typeof document === 'undefined') return;
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'note-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
  }
  for (let k = 0; k < count; k++) {
    const note = document.createElement('span');
    note.className = 'note-flight';
    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    note.style.color = `var(--color-${tones[Math.min(k, tones.length - 1)]})`;
    note.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
    note.style.setProperty('--rise', `${(200 + Math.random() * 260) * rise}px`);
    note.style.setProperty('--r0', `${(Math.random() - 0.5) * 40}deg`);
    note.style.setProperty('--r1', `${(Math.random() - 0.5) * 70}deg`);
    note.style.setProperty('--size', `${(0.85 + Math.random() * 0.5) * size}`);
    note.style.setProperty('--dur', `${2.2 + Math.random() * 1.1}s`);
    note.style.setProperty('--delay', `${k * 0.09}s`);
    note.innerHTML = svgOf(NOTE_KINDS[(seed + k) % NOTE_KINDS.length]);
    note.addEventListener('animationend', () => note.remove(), { once: true });
    layer.appendChild(note);
  }
  while (layer.childElementCount > 60) layer.firstElementChild.remove();
}
