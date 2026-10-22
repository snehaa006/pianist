import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Headline from '../components/Headline.jsx';
import Opus from '../components/Opus.jsx';
import KeyFan from '../components/KeyFan.jsx';
import { KeyPile, StrayKeys } from '../components/LooseKeys.jsx';
import { useLightbox } from '../components/Lightbox.jsx';
import { site, isPlaceholder } from '../data/site';
import { bio } from '../data/bio';
import { byId, examFilms, inWords, performances, titleOf } from '../data/performances';
import { useDrift, usePageTitle, useReveals } from '../lib/hooks';

const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
);

// Stills from the films (public/media/about, cut by `npm run media -- --about`), warm monochrome.
const still = (slug, alt, width, height) => ({ src: `/media/about/${slug}.webp`, alt, width, height });
const poster = (id, alt, width, height) => ({ src: `/media/posters/${id}.webp`, alt, width, height });
const photos = {
  smileGrade1: still('smile-grade-1', 'Selin Incekara at the piano at home, smiling sideways after her Grade 1 piece.', 432, 540),
  amcLift: still('amc-lift', 'Selin Incekara lifting both hands from the keys at the Austrian Master Classes concert.', 400, 480),
  smileTwilight: still('smile-twilight', 'Selin Incekara smiling at the camera before playing Song of Twilight.', 432, 540),
  smileTechnical: still('smile-technical', 'Selin Incekara turning from the keys to smile at the camera before her scales.', 432, 540),
  smileAndante: still('smile-andante', 'Selin Incekara seated at the piano, smiling, before playing Andante.', 372, 464),
  grandUp: still('grand-up', 'Selin Incekara at the grand piano at home, looking up as a piece ends.', 348, 464),
  score: still('score', 'Selin Incekara in profile at the piano, reading from the score.', 432, 576),
  amcPlay: still('amc-play', 'Selin Incekara mid-phrase at the concert grand of the Austrian Master Classes, in a dotted dress.', 360, 480),
  smileHungry: still('smile-hungry', 'Selin Incekara smiling at the camera beside her piano, before playing Dog Hungry.', 432, 540),
  stageArms: still('stage-arms', 'Selin Incekara alone at a grand piano on a dark stage.', 348, 464),
  amcStand: still('amc-stand', 'Selin Incekara standing beside the grand piano on the stage of the Austrian Master Classes hall.', 720, 480),
  stageBow: still('stage-bow', 'Selin Incekara bowing to the audience on a dark stage, beside the grand piano.', 372, 464),
  atHome: poster('at-home-grand', 'Selin Incekara in profile at the grand piano at home, by a window.', 832, 464),
  dogHungry: poster('dog-hungry', 'Selin Incekara at her piano, seen over her shoulder, both hands on the keys.', 1024, 576),
  twilight: poster('song-of-twilight', 'Selin Incekara at her piano, seen from behind, mid-phrase.', 1024, 576),
  andante: poster('andante', 'Selin Incekara at the piano with the score open, playing from the music.', 832, 464)
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

// Biography, after a run of editorial references, a flamenco poster above all, with piano keys where it has roses and a
// fan: the cover and her words are a cream sheet laid on the red, her name running behind her in the photograph, keys
// heaped under it and strays falling past the text, and a fan of keys opening across the sheet's foot. Then a name
// behind a row of photographs, a quote among scattered prints, and stacked cards. Her supplied photograph is the
// cover; every other picture is a moment taken from her films. Her bio stays exactly as she wrote it (src/data/bio.js).
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
      <Quote />
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
      <StrayKeys keys={coverStrays} />
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
          <KeyPile className="bio-cover__pile" />
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

// Her own words, as she wrote them, set in steps down the sheet like a poster's text, beside a photo-booth strip of
// her smiling before three exam pieces, with stray keys falling past.
function Words() {
  const ref = useRef(null);
  useDrift(ref);
  const strip = [photos.smileTwilight, photos.smileTechnical, photos.smileAndante];
  return (
    <section ref={ref} className="screen bio-words" aria-labelledby="words-h">
      <StrayKeys keys={wordsStrays} />
      <div className="container grid bio-words__grid">
        <Headline id="words-h" className="h1 bio-words__head" hinge="bottom" accent="own">
          [1] In her own words
        </Headline>
        <span className="bio-words__mark" aria-hidden="true">
          “
        </span>
        {bio.map((paragraph, i) => (
          <p key={i} className={`bio-words__para bio-words__para--${i + 1} reveal`} style={{ '--i': i + 1 }}>
            {paragraph}
          </p>
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

// Strays (StrayKeys): x and y in % of their section, w px wide (black keys are drawn narrower), r deg; speed px and
// spin deg over a screen of scroll. Each sits in a gap the text leaves on wide screens, and drifts within it.
const coverStrays = [
  { kind: 'both', x: 46, y: 12, w: 30, r: 38, speed: 140, spin: 50 },
  { kind: 'black', x: 1.5, y: 52, w: 34, r: -22, speed: 90, spin: -40 },
  { kind: 'left', x: 93, y: 8, w: 26, r: -24, speed: 160, spin: 70 }
];
const wordsStrays = [
  { kind: 'right', x: 66, y: 5, w: 34, r: 64, speed: 90, spin: 60 },
  { kind: 'black', x: 58, y: 30, w: 36, r: -28, speed: 110, spin: -80 },
  { kind: 'both', x: 8, y: 70, w: 30, r: -70, speed: 140, spin: 45 },
  { kind: 'black', x: 22, y: 90, w: 32, r: 24, speed: 80, spin: -50 },
  { kind: 'left', x: 88, y: 91, w: 34, r: 52, speed: 120, spin: 90 }
];
const quoteStrays = [
  { kind: 'both', x: 34, y: 5, w: 34, r: -52, speed: 80, spin: 70 },
  { kind: 'black', x: 64, y: 8, w: 36, r: 35, speed: 70, spin: -60 },
  { kind: 'right', x: 56, y: 88, w: 36, r: 72, speed: 110, spin: 40 },
  { kind: 'left', x: 9, y: 38, w: 28, r: 20, speed: 120, spin: -90 },
  { kind: 'black', x: 40, y: 92, w: 32, r: -64, speed: 90, spin: 70 }
];

// Six years in five pictures, on the ink stage, her name in red running behind them and sliding as the page scrolls.
function Years() {
  const ref = useRef(null);
  useDrift(ref);
  const row = [
    { photo: photos.grandUp, caption: 'At home' },
    { photo: photos.score, caption: 'Grade 1 exam' },
    { photo: photos.amcPlay, caption: 'Austrian Master Classes' },
    { photo: photos.smileHungry, caption: 'Grade 3 exam' },
    { photo: photos.stageArms, caption: 'On stage' }
  ];
  return (
    <section ref={ref} className="stage screen bio-years" aria-labelledby="years-h">
      <p className="bio-years__name" aria-hidden="true">
        Selin Incekara · Selin Incekara
      </p>
      <div className="container bio-years__content">
        <div className="bio-years__head">
          <Headline id="years-h" hinge="left" accent="Six">
            [2] Six years at the piano
          </Headline>
          <p className="lead muted reveal reveal--rise">From her piano at home to the stage of the Austrian Master Classes.</p>
        </div>
        <ol className="bio-years__row">
          {row.map(({ photo, caption }, i) => (
            <li key={photo.src} className="bio-years__item reveal" style={{ '--i': i }}>
              <figure className="frame bio-years__frame">
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

// One line of hers, at poster size, among scattered prints that drift at their own speeds.
function Quote() {
  const ref = useRef(null);
  useDrift(ref);
  const prints = [
    { photo: photos.amcStand, tilt: -5, speed: 90 },
    { photo: photos.atHome, tilt: 4, speed: -60 },
    { photo: photos.stageBow, tilt: 3, speed: 130 },
    { photo: photos.dogHungry, tilt: -3, speed: 40 },
    { photo: photos.andante, tilt: -2, speed: -90 },
    { photo: photos.twilight, tilt: 5, speed: 110 }
  ];
  return (
    <section ref={ref} className="screen bio-quote" aria-label="Why she plays, in her words">
      <StrayKeys keys={quoteStrays} />
      <div className="container">
        <div className="bio-quote__board">
          <figure className="bio-quote__figure">
            <blockquote className="bio-quote__text reveal reveal--rise">
              <p>“Every time I play, I feel like I can tell a story through music.”</p>
            </blockquote>
            <figcaption className="label bio-quote__by reveal reveal--wipe">— Selin Incekara</figcaption>
          </figure>
          {prints.map((p, i) => (
            <Print key={p.photo.src} photo={p.photo} className={`bio-quote__print bio-quote__print--${i + 1}`} tilt={p.tilt} speed={p.speed} i={i} />
          ))}
        </div>
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
        <p className="lead muted reveal reveal--rise">
          {inWords(performances.length, true)} films so far, {inWords(onStage)} on stage and {inWords(atHome)} at home.
        </p>
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
