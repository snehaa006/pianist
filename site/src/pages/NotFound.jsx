import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/hooks';

// 88 bars, one per key; the 36 black keys stand taller, in brass.
const BLACK = new Set([1, 4, 6, 9, 11]); // positions in an octave starting on A
const keys = Array.from({ length: 88 }, (_, i) => BLACK.has(i % 12));

export default function NotFound() {
  usePageTitle('Not found');
  return (
    <section className="stage screen page-top notfound" aria-labelledby="nf-h">
      <div className="container">
        <div className="keyboard88" aria-hidden="true">
          {keys.map((black, i) => (
            <span key={i} className={black ? 'is-black' : undefined} />
          ))}
        </div>
        <h1 className="h1" id="nf-h">
          This page isn't in the programme.
        </h1>
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
