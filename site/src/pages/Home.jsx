import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Headline from '../components/Headline.jsx';
import PerformanceCard from '../components/PerformanceCard.jsx';
import MailingList from '../components/MailingList.jsx';
import ContactRows from '../components/ContactRows.jsx';
import Count from '../components/Count.jsx';
import Opus from '../components/Opus.jsx';
import { Staff } from '../components/Motifs.jsx';
import { SlatsLayer } from '../components/Effects.jsx';
import CircularText from '../components/fx/CircularText/CircularText.jsx';
import { presets } from '../components/fx/presets';
import { useLightbox } from '../components/Lightbox.jsx';
import { byId, examFilms, inWords, performances, pieces } from '../data/performances';
import { site } from '../data/site';
import { usePageTitle, useReducedMotion, useReveals } from '../lib/hooks';

const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
);

export default function Home() {
  const [view, setView] = useState('upcoming');
  usePageTitle(null);
  useReveals([view]);
  const concert = byId('austrian-master-classes');
  const stage = byId('on-stage');
  const atHome = performances.filter(p => p.tags.includes('home'));
  const atHomeExams = atHome.filter(p => p.tags.includes('exam')).length;

  return (
    <>
      <Hero item={concert} />

      <Concerts view={view} setView={setView} />

      <FeaturedFilm item={stage} />

      {/* Three films from home, two of them exam recordings */}
      <section className="screen" aria-labelledby="home-h">
        <div className="container">
          <Opus>(Op. 02: Watch)</Opus>
          <Headline id="home-h" hinge="left" accent="piano">
            At home, at the piano
          </Headline>
          <p className="lead muted reveal reveal--rise">
            {inWords(atHome.length, true)} films from home, {inWords(atHomeExams)} of them recorded for London College of Music
            exams.
          </p>
          <div className="films">
            {atHome.map((p, i) => (
              <PerformanceCard key={p.id} item={p} index={i} />
            ))}
          </div>
          <div className="actions">
            <Link className="link" to="/watch">
              All performances <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <RepertoireBand />

      {/* Fermata: no press quote exists, so a photograph only */}
      <section className="stage fermata" aria-label="The hall before the music">
        <figure className="fermata__figure scrim">
          <div className="fermata__image">
            <img
              src="/media/posters/fermata.webp"
              alt="An Austrian Master Classes concert seen from the audience: Srinijakara at the grand piano, beyond the backs of the front-row chairs."
              width="848"
              height="480"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption className="container fermata__caption label reveal reveal--wipe">
            Austrian Master Classes, {concert.venue}, {concert.year}.
          </figcaption>
        </figure>
      </section>

      <section className="screen" id="about" aria-labelledby="about-h">
        <div className="container grid split">
          <figure className="split__media frame ratio-4x5 reveal reveal--wipe">
            <img
              src="/media/posters/portrait.webp"
              alt="Srinijakara in profile at the grand piano at home, hands on the keys, window light behind her."
              width="371"
              height="464"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="split__text">
            <Opus>(Op. 04: About)</Opus>
            <Headline id="about-h" hinge="right">
              The pianist
            </Headline>
            <p className="lead reveal reveal--rise">Srinijakara is a pianist based in {site.city}.</p>
            <p className="body muted reveal" style={{ '--i': 2 }}>
              On film so far: an Austrian Master Classes concert, a performance on stage at {stage.venue}, and London
              College of Music exams at Grades 1 and 3.
            </p>
            <div className="actions">
              <Link className="link" to="/about">
                Read the biography <Arrow />
              </Link>
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
          <p className="label muted note__sign reveal" style={{ '--i': 3 }}>
            — S.
          </p>
        </div>
      </section>

      <section className="screen" id="contact" aria-labelledby="contact-h">
        <div className="container">
          <Opus>(Op. 05: Contact)</Opus>
          <Headline id="contact-h" hinge="top">
            Book a concert
          </Headline>
          <p className="lead muted reveal reveal--rise">Management, press and direct enquiries.</p>
          <ContactRows />
        </div>
      </section>

      <MailingList />
    </>
  );
}

// Op. 01: Upcoming (empty state, never invented rows) or the archive of filmed performances as programme rows.
function Concerts({ view, setView }) {
  const { open } = useLightbox();
  return (
    <section className="screen" id="concerts" aria-labelledby="concerts-h">
      <div className="container">
        <Opus>(Op. 01: Concerts)</Opus>
        <Headline id="concerts-h">Hear her live</Headline>
        <div className="chips" role="group" aria-label="Which concerts">
          <button type="button" className="chip" aria-pressed={view === 'upcoming'} onClick={() => setView('upcoming')}>
            Upcoming
          </button>
          <button type="button" className="chip" aria-pressed={view === 'past'} onClick={() => setView('past')}>
            Past concerts
          </button>
        </div>

        {view === 'upcoming' ? (
          <div className="concerts concert-empty" key="upcoming">
            <div className="concert-empty__text">
              <p className="lead reveal reveal--rise">No public dates right now.</p>
              <p className="body muted reveal" style={{ '--i': 2 }}>
                New concerts reach the mailing list first.
              </p>
            </div>
            <a className="btn btn--primary concert-empty__action" href="#list">
              Join the list <Arrow />
            </a>
          </div>
        ) : (
          <ul className="concerts" key="past">
            {performances.map((p, i) => (
              <li className="concert concert--past reveal" style={{ '--i': i }} key={p.id}>
                <span className="concert__date">
                  <span className="concert__day">[DD]</span>
                  <span className="concert__month">[Month] {p.year}</span>
                </span>
                <div>
                  <div className="concert__city">{p.tags.includes('home') ? 'At home' : p.short}</div>
                  <div className="concert__venue">{p.tags.includes('home') ? p.occasion : p.venue}</div>
                </div>
                <div className="concert__programme body-sm">
                  {p.composer}: {p.work}
                  {p.syllabus && (
                    <>
                      <br />
                      <span className="muted">Performance {p.syllabus}</span>
                    </>
                  )}
                </div>
                <button type="button" className="link concert__action" onClick={e => open(p, e.currentTarget)}>
                  Watch <Arrow />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// Watch: one filmed performance, full-bleed; the play button sits inside a slowly turning badge.
function FeaturedFilm({ item }) {
  const { open } = useLightbox();
  const reduced = useReducedMotion();
  return (
    <section className="stage feature" aria-labelledby="feature-h">
      <div className="feature__frame frame scrim">
        <img src={item.poster} alt={item.alt} width="832" height="464" loading="lazy" decoding="async" />
      </div>
      <div className="container feature__text">
        <div>
          <span className="label muted reveal reveal--track">{item.composer}</span>
          <h2 className="h1 reveal reveal--rise" id="feature-h">
            {item.work}
          </h2>
          <p className="lead muted feature__lead reveal" style={{ '--i': 2 }}>
            Filmed live on stage at {item.venue}, {item.year}.
          </p>
          <Link className="link feature__link" to="/watch">
            All performances <Arrow />
          </Link>
        </div>
        <div className="badge">
          {!reduced && (
            <div className="badge__ring" aria-hidden="true">
              <CircularText {...presets.CircularText} text="WATCH • THE • FILM • WATCH • THE • FILM • " />
            </div>
          )}
          <button type="button" className="play badge__play" aria-label="Watch the performance" onClick={e => open(item, e.currentTarget)}>
            <span aria-hidden="true">▶</span>
          </button>
        </div>
      </div>
    </section>
  );
}

// Op. 03: what she plays, over a row of rising hammers (MicroSlats), with three counted facts.
function RepertoireBand() {
  const zone = useRef(null);
  const facts = [
    { n: pieces.length, label: 'Pieces on film' },
    { n: examFilms.length, label: 'London College of Music exam films' },
    { n: performances.filter(p => p.tags.includes('stage')).length, label: 'Performances on stage' }
  ];
  return (
    <section ref={zone} className="stage screen band" id="repertoire" aria-labelledby="rep-h">
      <SlatsLayer zoneRef={zone} />
      <div className="container band__content">
        <Staff />
        <Opus>(Op. 03: Repertoire)</Opus>
        <Headline id="rep-h" hinge="top" accent="plays">
          What she plays
        </Headline>
        <p className="lead muted reveal reveal--rise">{inWords(pieces.length, true)} solo pieces, each one on film, {site.repertoireRange}.</p>
        <dl className="facts">
          {facts.map((f, i) => (
            <div className="facts__item reveal" style={{ '--i': i }} key={f.label}>
              <dt className="label muted">{f.label}</dt>
              <dd className="display facts__n">
                <Count to={f.n} />
                <span className="sr-only">{f.n}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="actions">
          <Link className="btn btn--secondary" to="/repertoire">
            See the repertoire <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
