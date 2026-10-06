import { Link } from 'react-router-dom';
import DepthText from '../components/fx/DepthText/DepthText.jsx';
import TextPressure from '../components/fx/TextPressure/TextPressure.jsx';
import { presets } from '../components/fx/presets';
import { useFx, usePageTitle } from '../lib/hooks';

// 88 bars, one per key; the 36 black keys stand taller, in brass.
const BLACK = new Set([1, 4, 6, 9, 11]); // positions in an octave starting on A
const keys = Array.from({ length: 88 }, (_, i) => BLACK.has(i % 12));
const MESSAGE = "This page isn't in the programme.";

// The one playful page: an extruded 404 (DepthText) and a line that leans toward the pointer
// (TextPressure, scale and alpha only, since Bebas Neue has no variable axes). Desktop only.
export default function NotFound() {
  usePageTitle('Not found');
  const fx = useFx();
  return (
    <section className="stage screen page-top notfound" aria-labelledby="nf-h">
      <div className="container">
        <div className="keyboard88" aria-hidden="true">
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
