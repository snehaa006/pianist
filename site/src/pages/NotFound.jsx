import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import DepthText from '../components/fx/DepthText/DepthText.jsx';
import TextPressure from '../components/fx/TextPressure/TextPressure.jsx';
import { presets } from '../components/fx/presets';
import { useFx, usePageTitle } from '../lib/hooks';
import { strike } from '../lib/tone';
import { letNotes } from '../lib/notes';

// 88 bars, one per key; the 36 black keys stand taller, in scarlet.
const BLACK = new Set([1, 4, 6, 9, 11]); // positions in an octave starting on A
const keys = Array.from({ length: 88 }, (_, i) => BLACK.has(i % 12));
const MESSAGE = "This page isn't in the programme.";

// The 88 can be played: press a bar, or press and run along them, and each one passed sounds (A0 at the left), lights
// and lets a note go. Found by where the pointer is along the row, since the bars are only 2px wide.
function playAlong(rowRef) {
  let last = -1;
  const at = e => {
    const box = rowRef.current.getBoundingClientRect();
    return Math.min(87, Math.max(0, Math.floor(((e.clientX - box.left) / box.width) * 88)));
  };
  const play = i => {
    if (i === last) return;
    last = i;
    const bar = rowRef.current.children[i];
    strike(21 + i);
    bar.classList.add('is-down');
    setTimeout(() => bar.classList.remove('is-down'), 220);
    const box = bar.getBoundingClientRect();
    letNotes(box.left + box.width / 2, box.top, { count: 1, tones: [keys[i] ? 'scarlet' : 'ivory'], seed: i });
  };
  return {
    onPointerDown: e => {
      last = -1;
      play(at(e));
    },
    onPointerMove: e => e.buttons & 1 && play(at(e)),
    onPointerUp: () => (last = -1)
  };
}

// The one playful page: an extruded 404 (DepthText) and a line that leans toward the pointer
// (TextPressure, scale and alpha only, since Bebas Neue has no variable axes). Desktop only.
export default function NotFound() {
  usePageTitle('Not found');
  const fx = useFx();
  const row = useRef(null);
  const playing = useMemo(() => playAlong(row), []);
  return (
    <section className="stage screen page-top notfound" aria-labelledby="nf-h">
      <div className="container">
        <div ref={row} className="keyboard88" aria-hidden="true" {...playing}>
          {keys.map((black, i) => (
            <span key={i} className={black ? 'is-black' : undefined} />
          ))}
        </div>
        <div className="notfound__numeral" aria-hidden="true">
          {fx ? (
            <DepthText {...presets.DepthText} text="404" fontSize="clamp(8rem, 22vw, 20rem)" />
          ) : (
            <span className="notfound__plain">404</span>
          )}
        </div>
        {fx ? (
          <div className="notfound__pressure" id="nf-h">
            <TextPressure {...presets.TextPressure} text={MESSAGE} />
          </div>
        ) : (
          <h1 className="h1" id="nf-h">
            {MESSAGE}
          </h1>
        )}
        <div className="actions">
          <Link className="btn btn--primary" to="/">
            Back to the homepage{' '}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
