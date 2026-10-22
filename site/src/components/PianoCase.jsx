import { useLayoutEffect, useRef, useState } from 'react';

// The hero's piano, after the client's piano-lessons flyer: one black case as wide as the keyboard it stands on (it
// runs on down behind the keys, so the gaps between them are black), square at the top left, its bentside sweeping
// down the right in an S round a red bay. Drawn in the hero's own pixels from where her name and photograph are, and
// again whenever they move: on wide screens the case starts under the nav, her name stands in the bay and the tail
// keeps clear of the photograph; on phones, where the name comes first, the case starts under it and the bentside
// reaches the right edge before the photograph.
const K = 0.5523; // a quarter circle's control points, as a share of its radius

// Clockwise from the top left: the top edge to the tail (x0), the tail rounding down to the bay's left side (xL, yT),
// down that side, a concave corner (radius r) into the bay's floor (B), then the floor sweeping out to the right edge,
// which it meets `drop` lower, and on down to the foot.
const casePath = ({ W, H, top, x0, xL, yT, B, r, drop }) => {
  const f = v => Math.round(v * 10) / 10;
  const tw = xL - x0;
  return (
    `M0 ${f(top)}H${f(x0)}` +
    `C${f(x0 + K * tw)} ${f(top)} ${f(xL)} ${f(yT - K * (yT - top))} ${f(xL)} ${f(yT)}` +
    `V${f(B - r)}` +
    `C${f(xL)} ${f(B - r + K * r)} ${f(xL + r - K * r)} ${f(B)} ${f(xL + r)} ${f(B)}` +
    `C${f(xL + r + K * (W - xL - r))} ${f(B)} ${f(W)} ${f(B + drop - K * drop)} ${f(W)} ${f(B + drop)}` +
    `V${f(H)}H0Z`
  );
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// The SVG fills the hero (site.css), so it measures itself rather than the hero, whose ref is not yet set while its
// children's layout effects run. `name` and `photo` must come before it in the hero for the same reason.
export default function PianoCase({ name, photo }) {
  const svg = useRef(null);
  const [d, setD] = useState('');

  useLayoutEffect(() => {
    const el = svg.current;
    if (!el || !name.current || !photo.current) return undefined;
    const draw = () => {
      const box = el.getBoundingClientRect();
      const rel = node => {
        const b = node.getBoundingClientRect();
        return { left: b.left - box.left, right: b.right - box.left, top: b.top - box.top, bottom: b.bottom - box.top };
      };
      const n = rel(name.current);
      const p = rel(photo.current);
      const W = box.width;
      const H = box.height;
      if (n.bottom <= p.top + 1) {
        // Phones: the name above, the case from under it to the foot.
        const top = n.bottom + 20;
        const D = Math.max(40, p.top - top - 16);
        const x0 = W * 0.42;
        const xL = x0 + Math.max(32, W * 0.12);
        setD(casePath({ W, H, top, x0, xL, yT: top + 0.4 * D, B: top + 0.65 * D, r: 0.2 * D, drop: 0.35 * D }));
        return;
      }
      const top = parseFloat(getComputedStyle(el).getPropertyValue('--nav-height')) || 0; // inherited from :root
      const g = clamp((n.bottom - n.top) * 0.14, 20, 44);
      const xL = n.left - g;
      const B = n.bottom + g;
      const x0 = Math.min(xL - 24, Math.max(p.right + g, xL - W * 0.1));
      const yT = top + Math.min(1.6 * (xL - x0), 0.5 * (B - top));
      setD(casePath({ W, H, top, x0, xL, yT, B, r: Math.min(2.8 * g, B - yT), drop: Math.max(0, 0.3 * (p.bottom - B)) }));
    };
    draw();
    const ro = new ResizeObserver(draw);
    [el, name.current, photo.current].forEach(node => ro.observe(node));
    document.fonts?.ready.then(draw);
    return () => ro.disconnect();
  }, [name, photo]);

  return (
    <svg ref={svg} className="hero__case" aria-hidden="true" focusable="false">
      {d && <path d={d} />}
    </svg>
  );
}
