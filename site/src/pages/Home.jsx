import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Headline from '../components/Headline.jsx';
import PerformanceCard from '../components/PerformanceCard.jsx';
import FilmLoop from '../components/FilmLoop.jsx';
import Compare from '../components/Compare.jsx';
import Stairs from '../components/Stairs.jsx';
import Count from '../components/Count.jsx';
import Opus from '../components/Opus.jsx';
import Awards from '../components/Awards.jsx';
import Teachers from '../components/Teachers.jsx';
import { Staff } from '../components/Motifs.jsx';
import { SlatsLayer } from '../components/Effects.jsx';
import { byId, examFilms, inWords, performances, pieces, unfilmed } from '../data/performances';
import { site } from '../data/site';
import { bio } from '../data/bio';
import { usePageTitle, useReveals } from '../lib/hooks';
import { FLY, useFlyIn } from '../lib/flyIn';

const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
);

export default function Home() {
  usePageTitle(null);
  useReveals();
  const concert = byId('austrian-master-classes');
  const onStage = performances.filter(p => p.tags.includes('stage')).length;
  const atHome = performances.filter(p => p.tags.includes('home'));
  const atHomeExams = atHome.filter(p => p.tags.includes('exam')).length;
  const filmsLead = `${inWords(performances.length, true)} films, ${inWords(onStage)} on stage and ${inWords(atHome.length)} at home, ${inWords(atHomeExams)} of them recorded for London College of Music exams.`;
  const films = useRef(null);
  const stairs = useRef({ v: 0 });
  const fly = useFlyIn(films, stairs);
  // The ring always holds the same number of frames (FLY.spread apart), the films in turn, round again as needed.
  const ring = Array.from({ length: Math.round(360 / FLY.spread) }, (_, i) => performances[i % performances.length]);
  // The landed grid: three across for nine films, otherwise four.
  const cols = performances.length % 3 === 0 && performances.length % 4 !== 0 ? 3 : 4;
  const grid = { '--cols': cols, '--rows': Math.ceil(performances.length / cols) };

  return (
    <>
      <Hero />

      {/* Every film. Wide screens: one pinned screen on the ink stage where she sits at the grand in the middle, lit
          like a hologram, while the films turn round her on a ring and light circles her; then the films fly into
          the grid, playing all the while, the red blinds close over them and the piano-key stairs build on the red
          (lib/flyIn.js). Elsewhere: headline and grid, then the stairs as a screen of their own. */}
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
                  {ring.map((p, i) => (
                    <FilmLoop key={`${p.id}-${i}`} item={p} className="reel__tile" style={{ '--n': i }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <canvas className="reel__light reel__light--front" aria-hidden="true" />
          <div className="container reel__films">
            <div className="films films--fly" style={grid}>
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
          <Stairs build={stairs} />
        </section>
      ) : (
        <>
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
          <Stairs />
        </>
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

      <Awards className="screen--oxblood" opus="(Op. 04: Prizes)" />
    </>
  );
}

// Op. 02: what she plays, on the ink stage over a row of rising hammers (MicroSlats: graphite, lit scarlet where the swell
// passes), with three counted facts. After the red stairs, the dark hall.
function RepertoireBand() {
  const zone = useRef(null);
  const facts = [
    { n: pieces.length, label: 'Pieces on film' },
    { n: examFilms.length, label: 'London College of Music exam films' },
    { n: pieces.filter(p => p.tags.includes('stage')).length, label: 'Performances on stage' }
  ];
  const all = pieces.length + unfilmed.length;
  return (
    <section ref={zone} className="stage screen band" id="repertoire" aria-labelledby="rep-h">
      <SlatsLayer zoneRef={zone} />
      <div className="container band__content">
        <Staff />
        <Opus>(Op. 02: Repertoire)</Opus>
        <Headline id="rep-h" hinge="top" accent="plays">
          What she plays
        </Headline>
        <p className="lead muted reveal reveal--rise">
          {inWords(all, true)} solo pieces {site.repertoireRange}, {all === pieces.length ? 'each one' : `${inWords(pieces.length)} of them`} on film.
        </p>
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
// its open lid fading where the photograph's frame cut it. Moving the mouse wipes it to the photograph it was cut from
// (Compare, after the MCIL products page): a line trails the pointer across the page, the photograph left of it and
// the silhouette right, starting halfway. Beside it, her bio in her own words (both paragraphs, as she wrote them),
// signed, and her teachers.
function About() {
  return (
    <section className="screen about" id="about" aria-labelledby="about-h">
      <div className="container grid split">
        <div className="split__media about__figure">
          <Compare
            label="Wipe to her photograph"
            over={
              <img
                className="about__photo"
                src="/media/cutouts/selin-grand-photo.webp"
                alt="The photograph: Selin Incekara playing the grand piano in a bright room at home."
                width="606"
                height="464"
                loading="lazy"
                decoding="async"
              />
            }
          >
            <div
              className="about__shape reveal reveal--wipe"
              role="img"
              aria-label="Selin Incekara at the grand piano at home, in silhouette."
            />
          </Compare>
        </div>
        <div className="split__text">
          <Opus>(Op. 03: About)</Opus>
          <Headline id="about-h" hinge="right">
            The pianist
          </Headline>
          <p className="label muted about__label reveal reveal--track">In her own words</p>
          {bio.map((paragraph, i) => (
            <p key={i} className="body about__para reveal reveal--rise" style={{ '--i': i + 1 }}>
              {paragraph}
            </p>
          ))}
          <p className="label muted about__sign reveal" style={{ '--i': 3 }}>
            — Selin Incekara
          </p>
          <Teachers className="about__teachers reveal" style={{ '--i': 4 }} />
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
