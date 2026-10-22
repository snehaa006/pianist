import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Headline from '../components/Headline.jsx';
import Opus from '../components/Opus.jsx';
import KeyFan from '../components/KeyFan.jsx';
import ScrubText from '../components/ScrubText.jsx';
import { useLightbox } from '../components/Lightbox.jsx';
import { site, isPlaceholder } from '../data/site';
import { bio, bioAccents } from '../data/bio';
import { byId, examFilms, inWords, performances, titleOf } from '../data/performances';
import { useDrift, usePageTitle, useReveals, useScrub } from '../lib/hooks';

const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
);

// Stills from the films (public/media/about, cut by `npm run media -- --about`), warm monochrome.
const still = (slug, alt, width, height) => ({ src: `/media/about/${slug}.webp`, alt, width, height });
const photos = {
  smileGrade1: still('smile-grade-1', 'Selin Incekara at the piano at home, smiling sideways after her Grade 1 piece.', 432, 540),
  amcLift: still('amc-lift', 'Selin Incekara lifting both hands from the keys at the Austrian Master Classes concert.', 400, 480),
  smileTwilight: still('smile-twilight', 'Selin Incekara smiling at the camera before playing Song of Twilight.', 432, 540),
  smileTechnical: still('smile-technical', 'Selin Incekara turning from the keys to smile at the camera before her scales.', 432, 540),
  smileAndante: still('smile-andante', 'Selin Incekara seated at the piano, smiling, before playing Andante.', 372, 464),
  grandUp: still('grand-up', 'Selin Incekara at the grand piano at home, looking up as a piece ends.', 348, 464),
  score: still('score', 'Selin Incekara in profile at the piano, reading from the score.', 432, 576),
  smileHungry: still('smile-hungry', 'Selin Incekara smiling at the camera beside her piano, before playing Dog Hungry.', 432, 540),
  stageArms: still('stage-arms', 'Selin Incekara alone at a grand piano on a dark stage.', 348, 464),
  // The supplied photograph, toned to the films' warm monochrome where it stands among them (tint).
  portrait: { src: '/media/posters/portrait-600.webp', alt: site.portraitAlt, width: 600, height: 750, tint: true }
};

// A printed photograph: a mat round the still (cream on the red, ink on the sheet), a slight tilt, and a drift of its
// own as the screen scrolls (`speed`, px across one screen of scroll; the section's --p drives it, see useDrift).
function Print({ photo, className = '', tilt = 0, speed = 0, i = 0 }) {
  return (
    <figure className={`print reveal ${className}`} style={{ '--tilt': `${tilt}deg`, '--speed': speed, '--i': i }}>
      <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
    </figure>
  );
}

// Biography, after the client's references, a flamenco poster above all: the cover and her words are a cream sheet
// laid on the red, her name running behind her in the photograph, and a painted fan of piano keys across the sheet's
// foot that sends music notes flying up the page. Then a row of photographs that come in from the right, and stacked
// cards. Her supplied photograph is the cover; every other picture is a moment from her films.
// Her bio stays exactly as she wrote it (src/data/bio.js).
export default function About() {
  usePageTitle('Biography');
  useReveals();

  return (
    <div className="bio">
      <div className="bio-sheet" data-surface="paper">
        <Cover />
        <Words />
        <KeyFan className="bio-fan" />
      </div>
      <Years />
      <Stages />
    </div>
  );
}

// The cover: her name runs behind the people in the photograph (the portrait masked by their matte,
// cutouts/portrait-matte.webp, stands in front of the name) and drifts out from behind them as the page scrolls.
function Cover() {
  const ref = useRef(null);
  useDrift(ref);
  const portrait = {
    src: '/media/posters/portrait.webp',
    srcSet: '/media/posters/portrait-600.webp 600w, /media/posters/portrait.webp 1200w',
    sizes: '(max-width: 899px) min(100vw, 560px), min(54svh, 576px)',
    width: 1200,
    height: 1500,
    decoding: 'async'
  };
  return (
    <section ref={ref} className="screen bio-cover" aria-labelledby="bio-h">
      <div className="container">
        <div className="bio-cover__top">
          <Opus>(Op. 03: About)</Opus>
          <span className="label muted">Biography</span>
        </div>
        <div className="bio-cover__stage">
          <div className="bio-cover__photo reveal reveal--wipe">
            <img {...portrait} alt={site.portraitAlt} fetchPriority="high" />
          </div>
          <h1 className="bio-cover__name" id="bio-h">
            <span className="bio-cover__line reveal reveal--rise">Selin</span>{' '}
            <span className="bio-cover__line reveal reveal--rise" style={{ '--i': 2 }}>
              Incekara
            </span>
          </h1>
          <div className="bio-cover__front reveal reveal--wipe" aria-hidden="true">
            <img {...portrait} alt="" />
          </div>
          <Print photo={photos.smileGrade1} className="bio-cover__print bio-cover__print--a" tilt={-4} speed={-70} i={4} />
          <Print photo={photos.amcLift} className="bio-cover__print bio-cover__print--b" tilt={3} speed={50} i={6} />
        </div>
        <div className="bio-cover__rule label">
          <span>Pianist</span>
          <i />
          <span>Istanbul, Türkiye</span>
        </div>
        <div className="bio-cover__foot">
          <p className="lead bio-cover__lead hero-in" style={{ '--d': '700ms' }}>
            Selin Incekara is 11, lives in Istanbul and has played the piano for six years.
          </p>
          <div className="actions hero-in" style={{ '--d': '1000ms' }}>
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
  );
}

// Her own words, as she wrote them, set in steps down the sheet like a poster's text and read as the page moves (each
// word comes up from faded, ScrubText), beside a photo-booth strip of her smiling at the piano before three exam
// pieces.
function Words() {
  const strip = [photos.smileTwilight, photos.smileTechnical, photos.smileAndante];
  return (
    <section className="screen bio-words" aria-labelledby="words-h">
      <div className="container grid bio-words__grid">
        <Headline id="words-h" className="h1 bio-words__head" hinge="bottom" accent="own">
          [1] In her own words
        </Headline>
        <span className="bio-words__mark" aria-hidden="true">
          “
        </span>
        {bio.map((paragraph, i) => (
          <ScrubText key={i} text={paragraph} accents={bioAccents[i]} className={`bio-words__para bio-words__para--${i + 1}`} />
        ))}
        <p className="label muted bio-words__sign reveal" style={{ '--i': 3 }}>
          — Selin Incekara
        </p>
        <div className="bio-words__booth">
          <ol className="booth reveal">
            {strip.map(photo => (
              <li key={photo.src}>
                <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// Six years in five pictures, on the ink stage. As the row comes up the screen it slides in from the right as one strip
// and comes to rest, and slides back out when the page is scrolled back (useScrub; on phones it is a rail).
const rowIn = (r, vh) => (vh - r.top) / (vh * 0.75);

function Years() {
  const row = useRef(null);
  useScrub(row, rowIn);
  const pictures = [
    { photo: photos.grandUp, caption: 'At home' },
    { photo: photos.score, caption: 'Grade 1 exam' },
    { photo: photos.portrait, caption: 'Austrian Master Classes' },
    { photo: photos.smileHungry, caption: 'Grade 3 exam' },
    { photo: photos.stageArms, caption: 'On stage' }
  ];
  return (
    <section className="stage screen bio-years" aria-labelledby="years-h">
      <div className="container bio-years__content">
        <div className="bio-years__head">
          <Headline id="years-h" hinge="left" accent="Six">
            [2] Six years at the piano
          </Headline>
          <ScrubText className="lead muted" text="From her piano at home to the stage of the Austrian Master Classes." />
        </div>
        <ol ref={row} className="bio-years__row">
          {pictures.map(({ photo, caption }, i) => (
            <li key={photo.src} className="bio-years__item">
              <figure className={`frame bio-years__frame${photo.tint ? ' bio-years__frame--tint' : ''}`}>
                <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
                <figcaption className="label bio-years__caption">
                  <span className="bio-years__n">{String(i + 1).padStart(2, '0')}</span> {caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Where she has played, as cards that stack under the nav as the page scrolls, each leaving its tab showing.
function Stages() {
  const { open } = useLightbox();
  const concert = byId('austrian-master-classes');
  const stage = byId('on-stage');
  const home = byId('at-home-grand');
  const exam = byId('song-of-twilight');
  const onStage = performances.filter(p => p.tags.includes('stage')).length;
  const atHome = performances.filter(p => p.tags.includes('home')).length;
  const cards = [
    {
      surface: 'ink',
      kicker: 'In concert',
      when: concert.year,
      title: 'Austrian Master Classes',
      line: `${titleOf(concert)}. ${concert.venue}.`,
      photo: { src: concert.poster, alt: concert.alt, width: 848, height: 480 },
      film: concert
    },
    {
      surface: 'oxblood',
      kicker: 'On stage',
      when: stage.year,
      title: stage.venue,
      line: `${titleOf(stage)}.`,
      photo: { src: stage.poster, alt: stage.alt, width: 832, height: 464 },
      film: stage
    },
    {
      surface: 'paper',
      kicker: 'At home',
      when: home.year,
      title: 'The grand piano',
      line: `${titleOf(home)}.`,
      photo: { src: home.poster, alt: home.alt, width: 832, height: 464 },
      film: home
    },
    {
      surface: 'ink',
      kicker: 'Exams',
      when: 'Grades 1 and 3',
      title: 'London College of Music',
      line: `${inWords(examFilms.length, true)} recorded exams: pieces from Lists A, B and C, and the Grade 1 technical work.`,
      photo: { src: exam.poster, alt: exam.alt, width: 1024, height: 576 },
      film: exam,
      action: `Watch ${exam.work}`
    }
  ];
  return (
    <section className="screen bio-stages" aria-labelledby="stages-h">
      <div className="container">
        <Headline id="stages-h" hinge="right">
          [3] Where she has played
        </Headline>
        <ScrubText
          className="lead muted"
          text={`${inWords(performances.length, true)} films so far, ${inWords(onStage)} on stage and ${inWords(atHome)} at home.`}
        />
        <ol className="cards">
          {cards.map((c, i) => (
            <li key={c.title} className={`card card--${c.surface}`} data-surface={c.surface} style={{ '--i': i }}>
              <div className="card__tab label">
                <span className="card__n">{String(i + 1).padStart(2, '0')}</span>
                <span>{c.kicker}</span>
                <span className="card__when muted">{c.when}</span>
              </div>
              <div className="card__body">
                <div className="card__text">
                  <h3 className="h1 card__title">{c.title}</h3>
                  <p className="body muted card__line">{c.line}</p>
                  <div className="actions">
                    <button type="button" className="btn btn--primary" onClick={e => open(c.film, e.currentTarget)}>
                      {c.action || 'Watch the performance'} <Arrow />
                    </button>
                  </div>
                </div>
                <figure className="frame card__photo">
                  <img src={c.photo.src} alt={c.photo.alt} width={c.photo.width} height={c.photo.height} loading="lazy" decoding="async" />
                </figure>
              </div>
            </li>
          ))}
        </ol>
        <div className="actions bio-stages__more">
          <Link className="link" to="/watch">
            All performances <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
