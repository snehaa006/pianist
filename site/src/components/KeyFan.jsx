import { useRef } from 'react';
import { useDrift } from '../lib/hooks';

// A hand fan made of piano keys (after the painted fan on a flamenco poster): four octaves of white keys, C to C, fan
// out round a red pivot, their fronts making the rim and their black keys on the inner side, with bare ribs between
// the keys and the pivot and a guard stick at each end. It opens as it scrolls into view (--open, from useDrift's --p;
// shut it is a single key standing on the pivot) and is fully open by the time it reaches the middle of the screen;
// with reduced motion it is simply open.
const N = 29; // white keys
const CX = 500;
const CY = 500; // the pivot, in the viewBox
const R = 470; // the keys' fronts
const R0 = 140; // the keys' backs, where the ribs end
const HUB = 34;
const STEP = 180 / N; // degrees of fan per white key
const BLACK_AFTER = [0, 1, 3, 4, 5]; // white keys (C=0 … B=6) followed by a black key

// A point at radius r, `deg` degrees either side of straight up from the pivot.
const at = (r, deg) => {
  const t = (deg * Math.PI) / 180;
  return `${(CX + r * Math.sin(t)).toFixed(2)} ${(CY - r * Math.cos(t)).toFixed(2)}`;
};
const wedge = (r1, r2, half) => `M${at(r1, -half)}L${at(r2, -half)}L${at(r2, half)}L${at(r1, half)}Z`;

const whiteKey = wedge(R0, R, STEP / 2 - 0.35);
const lip = `M${at(R - 16, -(STEP / 2 - 0.35))}L${at(R - 16, STEP / 2 - 0.35)}`;
const rib = `M${at(HUB, 0)}L${at(R0, 0)}`;
const blackKey = wedge(R0 + 4, R0 + (R - R0) * 0.6, STEP * 0.3);
const guard = `M${CX - 6} ${CY - HUB}L${CX - 6} ${CY - R - 18}L${CX + 6} ${CY - R - 18}L${CX + 6} ${CY - HUB}Z`;
const inlay = `M${CX} ${CY - HUB - 24}L${CX} ${CY - R - 6}`;

const angle = i => -90 + STEP * i; // i in white-key widths from the left edge

export default function KeyFan({ className = '' }) {
  const ref = useRef(null);
  useDrift(ref);
  const whites = Array.from({ length: N }, (_, i) => angle(i + 0.5));
  const blacks = [];
  for (let i = 0; i < N - 1; i++) if (BLACK_AFTER.includes(i % 7)) blacks.push(angle(i + 1));

  return (
    <div ref={ref} className={`keyfan ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1000 540">
        {whites.map((a, i) => (
          <g key={`w${i}`} className="keyfan__k" style={{ '--a': `${a}deg` }}>
            <path className="keyfan__rib" d={rib} />
            <path className="keyfan__white" d={whiteKey} />
            <path className="keyfan__lip" d={lip} />
          </g>
        ))}
        {blacks.map((a, i) => (
          <g key={`b${i}`} className="keyfan__k" style={{ '--a': `${a}deg` }}>
            <path className="keyfan__black" d={blackKey} />
          </g>
        ))}
        {[-90, 90].map(a => (
          <g key={`g${a}`} className="keyfan__k" style={{ '--a': `${a}deg` }}>
            <path className="keyfan__guard" d={guard} />
            <path className="keyfan__inlay" d={inlay} />
          </g>
        ))}
        <circle className="keyfan__hub" cx={CX} cy={CY} r={HUB} />
        <circle className="keyfan__rivet" cx={CX} cy={CY} r={11} />
        <circle className="keyfan__pin" cx={CX} cy={CY} r={4} />
      </svg>
    </div>
  );
}
