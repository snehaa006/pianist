import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Headline from '../components/Headline.jsx';
import KeyFan from '../components/KeyFan.jsx';
import { useLightbox } from '../components/Lightbox.jsx';
import CircularText from '../components/fx/CircularText/CircularText.jsx';
import { presets } from '../components/fx/presets';
import { site, isPlaceholder } from '../data/site';
import { bio } from '../data/bio';
import { byId, examFilms, inWords, performances, titleOf } from '../data/performances';
import { useDrift, useFx, usePageTitle, useReveals } from '../lib/hooks';
import { useSound } from '../lib/sound.jsx';

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
  smileHungry: still('smile-hungry', 'Selin Incekara smiling at the camera beside her piano, before playing Dog Hungry.', 432, 540),
  stageArms: still('stage-arms', 'Selin Incekara alone at a grand piano on a dark stage.', 348, 464),
  amcStand: still('amc-stand', 'Selin Incekara standing beside the grand piano on the stage of the Austrian Master Classes hall.', 720, 480),
  stageBow: still('stage-bow', 'Selin Incekara bowing to the audience on a dark stage, beside the grand piano.', 372, 464),
  atHome: poster('at-home-grand', 'Selin Incekara in profile at the grand piano at home, by a window.', 832, 464),
  dogHungry: poster('dog-hungry', 'Selin Incekara at her piano, seen over her shoulder, both hands on the keys.', 1024, 576),
  twilight: poster('song-of-twilight', 'Selin Incekara at her piano, seen from behind, mid-phrase.', 1024, 576),
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

// Biography, after the client's references: a portfolio cover (a word across the top, the artist in front of it), then
// her words on a cream sheet laid on the red, as on a flamenco poster, with a painted fan of piano keys across the
// sheet's foot that lets music notes fly. Then a name behind a row of photographs, a quote among scattered prints, and
// stacked cards. Every picture is her: the cover cut out of her concert film, the rest stills from her films and the
// supplied photograph. Her bio stays exactly as she wrote it (src/data/bio.js).
export default function About() {
  usePageTitle('Biography');
  useReveals();

  return (
    <div className="bio">
      <Cover />
      <div className="bio-sheet" data-surface="paper">
        <Words />
        <KeyFan className="bio-fan" />
      </div>
      <Years />
      <Quote />
      <Stages />
    </div>
  );
}

// The cover, after a portfolio cover the client supplied: the page's name across the top, and her in front of it at
// the black grand on the Austrian Master Classes stage (cut out of the concert film, cutouts/selin-stage*.webp), her
// head over the letters and the piano melting into the dark. Its colours are the repertoire band's: the ink stage, lit
// scarlet behind her. Her name and the facts at the left; a line of hers and what she has done at the right; at the
// corner a turning badge that plays her piano, as the nav's pill does.
function Cover() {
  const fx = useFx();
  const { wanted, toggle } = useSound();
  const badge = 'Hear her play • Hear her play • ';
  return (
    <section className="stage bio-hero" aria-labelledby="bio-h">
      <div className="container bio-hero__top label">
        <span>(Op. 03: About)</span>
        <span>Istanbul, Türkiye</span>
      </div>
      <h1 className="bio-hero__word" id="bio-h">
        Biography
      </h1>
      {/* Two layers of the one cut-out: the whole of it behind the word, her alone in front of it. */}
      <div className="bio-hero__her">
        <img
          className="bio-hero__back"
          src="/media/cutouts/selin-stage.webp"
          srcSet="/media/cutouts/selin-stage-720.webp 1196w, /media/cutouts/selin-stage.webp 2392w"
          sizes="(max-width: 899px) 160vw, min(136svh, 1340px)"
          width="2392"
          height="1248"
          alt="Selin Incekara playing the black grand piano on the stage of the Austrian Master Classes concert."
          fetchPriority="high"
          decoding="async"
        />
        <img
          className="bio-hero__front"
          src="/media/cutouts/selin-stage-front.webp"
          srcSet="/media/cutouts/selin-stage-front-720.webp 1196w, /media/cutouts/selin-stage-front.webp 2392w"
          sizes="(max-width: 899px) 160vw, min(136svh, 1340px)"
          width="2392"
          height="1248"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="container bio-hero__grid">
        <div className="bio-hero__who hero-in" style={{ '--d': '500ms' }}>
          <p className="bio-hero__name">
            Selin <span>Incekara</span>
          </p>
          <p className="label bio-hero__role">Pianist</p>
          <i className="bio-hero__rule" aria-hidden="true" />
          <p className="body-sm muted bio-hero__lead">11 years old, in Istanbul, six years at the piano.</p>
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
        <div className="bio-hero__what hero-in" style={{ '--d': '800ms' }}>
          <p className="bio-hero__line">“Music helps me express my feelings.”</p>
          <span className="bio-hero__keys" aria-hidden="true">
            <i />
            <i />
            <b />
            <i />
            <i />
            <i />
          </span>
          <ul className="label bio-hero__list">
            <li>Austrian Master Classes</li>
            <li>On stage</li>
            <li>London College of Music exams</li>
            <li>Piano competitions</li>
          </ul>
        </div>
      </div>
      <div className="bio-hero__badge">
        {fx ? <CircularText {...presets.CircularText} text={badge.toUpperCase()} /> : <Ring text={badge.toUpperCase()} />}
        <button type="button" className="play bio-hero__play" aria-label={wanted ? 'Pause the piano' : 'Hear her play'} onClick={toggle}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {wanted ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5l11 7-11 7z" />}
          </svg>
        </button>
      </div>
    </section>
  );
}

// CircularText's ring, standing still (phones, touch, reduced motion).
function Ring({ text }) {
  const letters = Array.from(text);
  return (
    <div className="circular-text">
      {letters.map((letter, i) => {
        const f = (Math.PI / letters.length) * i;
        const transform = `rotateZ(${(360 / letters.length) * i}deg) translate3d(${f}px, ${f}px, 0)`;
        return (
          <span key={i} style={{ transform }}>
            {letter}
          </span>
        );
      })}
    </div>
  );
}

// Her own words, as she wrote them, set in steps down the sheet like a poster's text, beside a photo-booth strip of
// her smiling at the piano, four times.
function Words() {
  const strip = [photos.smileTwilight, photos.smileGrade1, photos.smileTechnical, photos.smileAndante];
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

// Six years in five pictures, on the ink stage, her name in red running behind them and sliding as the page scrolls.
function Years() {
  const ref = useRef(null);
  useDrift(ref);
  const row = [
    { photo: photos.grandUp, caption: 'At home' },
    { photo: photos.score, caption: 'Grade 1 exam' },
    { photo: photos.portrait, caption: 'Austrian Master Classes' },
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

// One line of hers, at poster size, among scattered prints that drift at their own speeds.
function Quote() {
  const ref = useRef(null);
  useDrift(ref);
  const prints = [
    { photo: photos.amcStand, tilt: -5, speed: 90 },
    { photo: photos.atHome, tilt: 4, speed: -60 },
    { photo: photos.stageBow, tilt: 3, speed: 130 },
    { photo: photos.dogHungry, tilt: -3, speed: 40 },
    { photo: photos.amcLift, tilt: -2, speed: -90 },
    { photo: photos.twilight, tilt: 5, speed: 110 }
  ];
  return (
    <section ref={ref} className="screen bio-quote" aria-label="Why she plays, in her words">
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
