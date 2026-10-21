import { useRef } from 'react';
import Flight from './Flight.jsx';
import { useLightbox } from './Lightbox.jsx';
import { byId } from '../data/performances';
import { site } from '../data/site';

// Screen 1, a poster on the red: her photograph at the piano in the Austrian Master Classes hall, standing on a full
// keyboard that runs the width of the screen, and her name in ink beside it. Keys on the right lift out of the
// keyboard and fly off as birds (Flight); moving the mouse along the keys sends them up too. One fact, one action:
// the concert the photograph was taken at, and its film.
const letters = (word, from) =>
  [...word].map((c, i) => (
    <span key={i} className="wm-letter" style={{ '--i': from + i }}>
      {c}
    </span>
  ));

export default function Hero() {
  const { open } = useLightbox();
  const concert = byId('austrian-master-classes');
  const section = useRef(null);
  const keybed = useRef(null);

  return (
    <section ref={section} className="hero hero--poster" aria-labelledby="name">
      <div className="container hero__stage">
        <figure className="hero__photo frame">
          <img
            src="/media/posters/portrait.webp"
            srcSet="/media/posters/portrait-600.webp 600w, /media/posters/portrait.webp 1200w"
            sizes="(max-width: 899px) min(calc(100vw - 32px), 520px), 44vh"
            alt={site.portraitAlt}
            width="1200"
            height="1500"
            fetchPriority="high"
            decoding="async"
          />
        </figure>
        <div className="hero__text">
          <h1 className="wordmark hero__name" id="name">
            <span className="sr-only">Selin Incekara</span>
            <span className="wm-line" aria-hidden="true">{letters('Selin', 0)}</span>
            <span className="wm-line" aria-hidden="true">{letters('Incekara', 5)}</span>
          </h1>
          <div className="hero__foot">
            <p className="lead hero__lead hero-in" style={{ '--d': '700ms' }}>
              Filmed in concert at the Austrian Master Classes, {concert.year}.
            </p>
            <div className="hero__actions hero-in" style={{ '--d': '850ms' }}>
              <button type="button" className="btn btn--primary btn--lg" onClick={e => open(concert, e.currentTarget)}>
                Watch the performance
              </button>
            </div>
          </div>
        </div>
      </div>
      <div ref={keybed} className="hero__keys" aria-hidden="true" />
      <Flight className="hero__flight" keybed={keybed} pokeRef={section} />
    </section>
  );
}
