import { Link } from 'react-router-dom';
import Headline from '../components/Headline.jsx';
import Opus from '../components/Opus.jsx';
import { site, isPlaceholder } from '../data/site';
import { byId } from '../data/performances';
import { usePageTitle, useReveals } from '../lib/hooks';

const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
);

// Facts first, third person. Every unknown stays in [brackets] until confirmed.
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
              alt="Srinijakara in profile at the grand piano at home, hands on the keys, window light behind her."
              width="371"
              height="464"
              decoding="async"
            />
          </figure>
          <div className="split__text">
            <Opus>(Op. 04: About)</Opus>
            <Headline as="h1" className="display" id="bio-h" hinge="right">
              Biography
            </Headline>
            <p className="lead reveal reveal--rise">Srinijakara is a pianist based in {site.city}.</p>
            <p className="body reveal" style={{ '--i': 2 }}>
              She studies with {site.teacher} at {site.school}. {site.beginnings}
            </p>
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

      <section className="screen screen--paper" aria-labelledby="note-h">
        <div className="container">
          <h2 className="label note__label reveal reveal--track" id="note-h">
            A note from Srinijakara
          </h2>
          <p className="h3 note__body reveal reveal--wipe">{site.note}</p>
          <p className="label muted note__sign">— S.</p>
        </div>
      </section>

    </>
  );
}
