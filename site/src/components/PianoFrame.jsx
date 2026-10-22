// A grand piano seen from above, as a frame, after the client's piano-lessons flyer: the case is a dark brown shape,
// straight along the left and the top, its bentside sweeping down the right in an S from the tail to the treble cheek,
// open at its foot, where it stands on a keyboard drawn elsewhere (the hero's: site.css runs the case on down behind
// those keys). The picture (children) fills the lid inside a rim of even width: the bentside's inner edge is the
// outline offset inward, sampled. The case is mahogany, the site's oxblood darkened with ink (see tokens.css).
const W = 800;
const RIM = 20;
const WIN = { w: W - 2 * RIM, h: 950 }; // the picture, 4:5
const RAIL = 28; // case between the picture and the keys
const H = RIM + WIN.h + RAIL;

// The bentside, from the tail at the top to the cheek at the right: cubic segments [from, control, control, to].
const BENT = [
  [[470, 0], [545, 0], [585, 45], [585, 130]],
  [[585, 130], [585, 250], [640, 330], [730, 380]],
  [[730, 380], [785, 410], [800, 440], [800, 500]]
];
const CHEEK = BENT[BENT.length - 1][3];

const n = v => +v.toFixed(1);
const CASE =
  `M0 0H${BENT[0][0][0]}` +
  BENT.map(([, a, b, p]) => `C${a[0]} ${a[1]} ${b[0]} ${b[1]} ${p[0]} ${p[1]}`).join('') +
  `V${H}H0Z`;

// The bentside's inner edge: each point moved RIM along the normal into the case (travelling clockwise, the inside
// is to the right).
const inset = ([p0, c1, c2, p1], steps = 24) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const u = 1 - t;
    const at = k => u * u * u * p0[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * p1[k];
    const d = k => 3 * u * u * (c1[k] - p0[k]) + 6 * u * t * (c2[k] - c1[k]) + 3 * t * t * (p1[k] - c2[k]);
    const len = Math.hypot(d(0), d(1)) || 1;
    return `${n(at(0) - (d(1) / len) * RIM)} ${n(at(1) + (d(0) / len) * RIM)}`;
  });
const WINDOW =
  `M${RIM} ${RIM}L` + BENT.flatMap((s, i) => inset(s).slice(i ? 1 : 0)).join('L') + `L${CHEEK[0] - RIM} ${RIM + WIN.h}H${RIM}Z`;

const pct = (v, of) => `${(v / of) * 100}%`;

export default function PianoFrame({ id = 'piano-window', className = '', children }) {
  return (
    <figure className={`piano ${className}`} style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={id} clipPathUnits="objectBoundingBox">
            <path d={WINDOW} transform={`scale(${1 / WIN.w} ${1 / WIN.h}) translate(${-RIM} ${-RIM})`} />
          </clipPath>
        </defs>
        <path className="piano__case" d={CASE} />
      </svg>
      <div
        className="piano__window"
        style={{
          left: pct(RIM, W),
          top: pct(RIM, H),
          width: pct(WIN.w, W),
          height: pct(WIN.h, H),
          clipPath: `url(#${id})`
        }}
      >
        {children}
      </div>
    </figure>
  );
}
