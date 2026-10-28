import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Headline from '../components/Headline.jsx';
import Opus from '../components/Opus.jsx';
import KeyFan from '../components/KeyFan.jsx';
import ScrubText from '../components/ScrubText.jsx';
import Awards from '../components/Awards.jsx';
import Teachers from '../components/Teachers.jsx';
import { useLightbox } from '../components/Lightbox.jsx';
import { site, isPlaceholder } from '../data/site';
import { photos } from '../data/photos';
import { bio, bioAccents } from '../data/bio';
import { byId, examFilms, inWords, performances, titleOf } from '../data/performances';
import { useDrift, usePageTitle, useReveals, useScrub } from '../lib/hooks';

const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
);

// Her photographs (data/photos.js), in colour, and the supplied portrait from the Austrian Master Classes.
const amcPortrait = {
  src: '/media/posters/portrait-600.webp',
  srcSet: '/media/posters/portrait-600.webp 600w, /media/posters/portrait.webp 1200w',
  alt: site.portraitAlt,
  width: 600,
  height: 750
};

// A photograph at a given width on the page (`sizes`), cropped where its frame cuts it to keep `at` in view.
const Img = ({ photo, sizes, className }) => (
  <img
    className={className}
    src={photo.src}
    srcSet={photo.srcSet}
    sizes={sizes}
    alt={photo.alt}
    width={photo.width}
    height={photo.height}
    style={photo.at ? { objectPosition: photo.at } : undefined}
    loading="lazy"
    decoding="async"
  />
);

// A printed photograph: a mat round the picture (cream on the red, ink on the sheet), cut to 4:5, a slight tilt, and a
// drift of its own as the screen scrolls (`speed`, px across one screen of scroll; the section's --p drives it, see
// useDrift).
function Print({ photo, className = '', tilt = 0, speed = 0, i = 0 }) {
  return (
    <figure className={`print reveal ${className}`} style={{ '--tilt': `${tilt}deg`, '--speed': speed, '--i': i }}>
      <Img photo={photo} sizes="(max-width: 899px) 30vw, 210px" />
    </figure>
  );
}

// Biography, after the client's references, a flamenco poster above all: the cover and her words are a cream sheet
// laid on the red, her name running behind her in the photograph, and a painted fan of piano keys across the sheet's
// foot that sends music notes flying up the page. Then a row of photographs that come in from the right, stacked
// cards of her films, her prizes, and her recitals with the other young pianists. The pictures are her own
// photographs (October 2026); the cards show stills from the films they open.
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
      <Awards id="bio-awards-h" heading="[4] Prizes and certificates" className="screen--oxblood" />
      <Recitals />
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
          <Print photo={photos.lightsPiano} className="bio-cover__print bio-cover__print--a" tilt={-4} speed={-70} i={4} />
          <Print photo={photos.studioGrand} className="bio-cover__print bio-cover__print--b" tilt={3} speed={50} i={6} />
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
// word comes up from faded, ScrubText), signed, with her teachers under them, beside a photo-booth strip of her
// photographs: after a recital, after a concert, in a gallery.
function Words() {
  const strip = [photos.recitalHug, photos.afterConcert, photos.gallery];
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
        <Teachers className="bio-words__teachers reveal" style={{ '--i': 4 }} />
        <div className="bio-words__booth">
          <ol className="booth reveal">
            {strip.map(photo => (
              <li key={photo.src}>
                <Img photo={photo} sizes="(max-width: 899px) 30vw, 180px" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// Six years in five of her photographs, on the ink stage, from a bouquet when she was younger to the Austrian Master
// Classes. As the row comes up the screen it slides in from the right as one strip
// and comes to rest, and slides back out when the page is scrolled back (useScrub; on phones it is a rail).
const rowIn = (r, vh) => (vh - r.top) / (vh * 0.75);

function Years() {
  const row = useRef(null);
  useScrub(row, rowIn);
  const pictures = [
    { photo: photos.flowers, caption: 'After a concert' },
    { photo: photos.classStairs, caption: 'At Christmas' },
    { photo: photos.stageRecital, caption: 'On stage' },
    { photo: photos.classDecollage, caption: 'Decollage Art Space' },
    { photo: amcPortrait, caption: 'Austrian Master Classes' }
  ];
  return (
    <section className="stage screen bio-years" aria-labelledby="years-h">
      <div className="container bio-years__content">
        <div className="bio-years__head">
          <Headline id="years-h" hinge="left" accent="Six">
            [2] Six years at the piano
          </Headline>
          <ScrubText className="lead muted" text="From a bouquet after an early concert to the stage of the Austrian Master Classes." />
        </div>
        <ol ref={row} className="bio-years__row">
          {pictures.map(({ photo, caption }, i) => (
            <li key={photo.src} className="bio-years__item">
              <figure className="frame bio-years__frame">
                <Img photo={photo} sizes="(max-width: 899px) min(62vw, 280px), 18vw" />
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

// Recitals with the other young pianists: five group photographs on the ink stage, one large and four beside and
// under it (phones: one large, then two by two).
function Recitals() {
  const pictures = [photos.classSalon, photos.classWinter, photos.classStudio, photos.classSalonScreen, photos.classEvening];
  return (
    <section className="stage screen bio-recitals" aria-labelledby="recitals-h">
      <div className="container">
        <Headline id="recitals-h" hinge="bottom" accent="Recital">
          [5] Recital days
        </Headline>
        <ScrubText
          className="lead muted"
          text="Recitals with other young pianists, in salons and studios, in summer and at Christmas."
        />
        <ul className="bio-recitals__grid">
          {pictures.map((photo, i) => (
            <li key={photo.src} className="bio-recitals__item reveal" style={{ '--i': i }}>
              <figure className="frame bio-recitals__frame">
                <Img photo={photo} sizes={i === 0 ? '(max-width: 899px) 100vw, 62vw' : '(max-width: 899px) 50vw, 31vw'} />
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
