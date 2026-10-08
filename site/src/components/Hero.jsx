import { useRef } from 'react';
import { CursorLayer } from './Effects.jsx';
import { useLightbox } from './Lightbox.jsx';
import { useFx } from '../lib/hooks';

const FIRST = 'Srini';
const SECOND = 'jakara';

// Each letter of the name rises out of a mask, 45ms apart over Andante (about 1.2s in all).
const Letters = ({ word, offset = 0 }) => (
  <span className="wm-line" aria-hidden="true">
    {Array.from(word).map((c, i) => (
      <span className="wm-letter" style={{ '--i': i + offset }} key={i}>
        {c}
      </span>
    ))}
  </span>
);

// Screen 1: the name, one current fact, one action.
// The name over a warm-monochrome still of the concert; on desktop the one site cursor (GhostCursor) lives here.
export default function Hero({ item }) {
  const fx = useFx();
  const { open } = useLightbox();
  const zone = useRef(null);

  return (
    <section ref={zone} className="stage screen hero" aria-labelledby="name">
      <div className="hero__media frame scrim">
        <img src="/media/posters/hero.webp" alt={item.alt} width="848" height="480" fetchPriority="high" />
      </div>
      {fx && <CursorLayer zoneRef={zone} />}
      <div className="container hero__content">
        <h1 className="wordmark hero__wordmark" id="name" aria-label="Srinijakara">
          <Letters word={FIRST} />
          <Letters word={SECOND} offset={FIRST.length} />
        </h1>
        <p className="lead hero__lead hero-in" style={{ '--d': '700ms' }}>
          Watch {item.composer}'s {item.work}, filmed at an Austrian Master Classes concert in {item.year}.
        </p>
        <div className="hero__actions hero-in" style={{ '--d': '900ms' }}>
          <button type="button" className="btn btn--primary btn--lg btn--block-mobile" onClick={e => open(item, e.currentTarget)}>
            Watch the performance
          </button>
        </div>
      </div>
    </section>
  );
}
