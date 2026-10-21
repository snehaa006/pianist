import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Headline from '../components/Headline.jsx';
import PerformanceCard from '../components/PerformanceCard.jsx';
import FilmLoop from '../components/FilmLoop.jsx';
import Flight from '../components/Flight.jsx';
import MailingList from '../components/MailingList.jsx';
import Count from '../components/Count.jsx';
import Opus from '../components/Opus.jsx';
import { Staff } from '../components/Motifs.jsx';
import { SlatsLayer } from '../components/Effects.jsx';
import CircularText from '../components/fx/CircularText/CircularText.jsx';
import { presets } from '../components/fx/presets';
import { useLightbox } from '../components/Lightbox.jsx';
import { byId, examFilms, inWords, performances, pieces } from '../data/performances';
import { site } from '../data/site';
import { bio } from '../data/bio';
import { usePageTitle, useReducedMotion, useReveals } from '../lib/hooks';
import { useFlyIn } from '../lib/flyIn';

const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
);

export default function Home() {
  usePageTitle(null);
  useReveals();
  const concert = byId('austrian-master-classes');
  const stage = byId('on-stage');
  const onStage = performances.filter(p => p.tags.includes('stage')).length;
  const atHome = performances.filter(p => p.tags.includes('home'));
  const atHomeExams = atHome.filter(p => p.tags.includes('exam')).length;
  const filmsLead = `${inWords(performances.length, true)} films, ${inWords(onStage)} on stage and ${inWords(atHome.length)} at home, ${inWords(atHomeExams)} of them recorded for London College of Music exams.`;
  const films = useRef(null);
  const fly = useFlyIn(films);

  return (
    <>
      <Hero />

      <FeaturedFilm item={stage} />

      {/* Every film. Wide screens: one pinned screen on the ink stage where she sits at the grand in the middle, lit
          like a hologram, while the films turn round her on a ring and light circles her; then the films fly into
          the grid, playing all the while (lib/flyIn.js). Elsewhere: headline and grid. */}
      {fly ? (
        <section ref={films} className="stage reel" aria-labelledby="films-h">
          <h2 className="reel__title" id="films-h">
            <span className="reel__word reel__word--a">On stage,</span>{' '}
            <span className="reel__word reel__word--b">
              and <span className="accent-word">at home</span>
            </span>
          </h2>
          <div className="reel__intro">
            <Opus>(Op. 01: Watch)</Opus>
          </div>
          <canvas className="reel__light" aria-hidden="true" />
          <div className="reel__sky" aria-hidden="true">
            <div className="reel__scene">
              <div className="reel__her">
                <img src="/media/cutouts/selin-grand.webp" alt="" width="606" height="464" decoding="async" />
                <span className="reel__dots" />
              </div>
              <div className="reel__orbit">
                <div className="reel__ring">
                  {[...performances, ...performances].map((p, i) => (
                    <FilmLoop key={`${p.id}-${i}`} item={p} className="reel__tile" style={{ '--n': i }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <canvas className="reel__light reel__light--front" aria-hidden="true" />
          <div className="container reel__films">
            <div className="films films--fly">
              {performances.map((p, i) => (
                <PerformanceCard key={p.id} item={p} index={i} compact />
              ))}
            </div>
          </div>
          <div className="container reel__foot">
            <p className="body-sm muted reel__lead">{filmsLead}</p>
            <Link className="link" to="/watch">
              All performances <Arrow />
            </Link>
          </div>
          <div className="reel__blinds" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
        </section>
      ) : (
        <section className="stage screen" aria-labelledby="films-h">
          <div className="container">
            <Opus>(Op. 01: Watch)</Opus>
            <Headline id="films-h" hinge="left" accent="home">
              On stage and at home
            </Headline>
            <p className="lead muted reveal reveal--rise">{filmsLead}</p>
            <div className="films">
              {performances.map((p, i) => (
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
      )}

      <RepertoireBand />

      {/* Fermata: no press quote exists, so a photograph only */}
      <section className="stage fermata" aria-label="The hall before the music">
        <figure className="fermata__figure scrim">
          <div className="fermata__image">
            <img
              src="/media/posters/fermata.webp"
              alt="An Austrian Master Classes concert seen from the audience: Selin Incekara at the grand piano, beyond the backs of the front-row chairs."
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

      <About />

      <section className="screen screen--oxblood" aria-labelledby="note-h">
        <div className="container">
          <h2 className="label note__label reveal reveal--track" id="note-h">
            A note from Selin Incekara
          </h2>
          <p className="h3 note__body reveal reveal--wipe">{bio[1]}</p>
          <p className="label muted note__sign reveal" style={{ '--i': 3 }}>
            — S.
          </p>
        </div>
      </section>

      <MailingList />
    </>
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

// Op. 02: what she plays, over a row of rising hammers (MicroSlats, oxblood on the red), with three counted facts.
function RepertoireBand() {
  const zone = useRef(null);
  const facts = [
    { n: pieces.length, label: 'Pieces on film' },
    { n: examFilms.length, label: 'London College of Music exam films' },
    { n: performances.filter(p => p.tags.includes('stage')).length, label: 'Performances on stage' }
  ];
  return (
    <section ref={zone} className="screen band" id="repertoire" aria-labelledby="rep-h">
      <SlatsLayer zoneRef={zone} />
      <div className="container band__content">
        <Staff />
        <Opus>(Op. 02: Repertoire)</Opus>
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

// Op. 03: her at the grand piano at home, an ink silhouette on the red (the cut-out from the films ring, as a mask),
// with birds rising out of the open lid, where the photograph's frame fades it away.
function About() {
  const stage = byId('on-stage');
  const shape = useRef(null);
  // The lid's open top, in the canvas's px: from 56% to 78% across the silhouette, a tenth of the way down.
  const lid = canvas => {
    const s = shape.current.getBoundingClientRect();
    const c = canvas.getBoundingClientRect();
    return { x0: s.left - c.left + s.width * 0.56, x1: s.left - c.left + s.width * 0.78, y: s.top - c.top + s.height * 0.1 };
  };
  return (
    <section className="screen about" id="about" aria-labelledby="about-h">
      <div className="container grid split">
        <div className="split__media about__figure">
          <div
            ref={shape}
            className="about__shape reveal reveal--wipe"
            role="img"
            aria-label="Selin Incekara at the grand piano at home, in silhouette, with birds rising out of the open lid."
          />
          <Flight className="about__flight" source={lid} burst={9} every={[0.35, 0.9]} life={[4.8, 7.2]} seed={11} />
        </div>
        <div className="split__text">
          <Opus>(Op. 03: About)</Opus>
          <Headline id="about-h" hinge="right">
            The pianist
          </Headline>
          <p className="body reveal reveal--rise">{bio[0]}</p>
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
  );
}
