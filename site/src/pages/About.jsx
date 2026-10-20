import { Link } from 'react-router-dom';
import Headline from '../components/Headline.jsx';
import Opus from '../components/Opus.jsx';
import { site, isPlaceholder } from '../data/site';
import { bio } from '../data/bio';
import { byId } from '../data/performances';
import { usePageTitle, useReveals } from '../lib/hooks';

const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
);

// Her bio, in her own words and exactly as she wrote it (src/data/bio.js), then the films.
export default function About() {
  usePageTitle('Biography');
  useReveals();
  const stage = byId('on-stage');

  return (
    <>
      <section className="screen page-top" aria-labelledby="bio-h">
        <div className="container grid split split--top">
          <figure className="split__media frame ratio-4x5 reveal reveal--wipe">
            <img
              src="/media/posters/portrait.webp"
              srcSet="/media/posters/portrait-600.webp 600w, /media/posters/portrait.webp 1200w"
              sizes="(max-width: 899px) min(100vw, 520px), min(44vw, 640px)"
              alt={site.portraitAlt}
              width="1200"
              height="1500"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
          <div className="split__text">
            <Opus>(Op. 03: About)</Opus>
            <Headline as="h1" className="display" id="bio-h" hinge="right">
              Biography
            </Headline>
            {bio.map((paragraph, i) => (
              <p key={i} className="body reveal" style={{ '--i': i + 1 }}>
                {paragraph}
              </p>
            ))}
            <p className="body muted reveal" style={{ '--i': 3 }}>
              On film so far: an Austrian Master Classes concert, a performance on stage at {stage.venue}, and London
              College of Music exams at Grades 1 and 3.
            </p>
            <div className="actions">
              <Link className="link" to="/watch">
                Watch the performances <Arrow />
              </Link>
              {!isPlaceholder(site.pressKit) && (
                <a className="link" href={site.pressKit}>
                  Press kit (PDF) <Arrow />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
