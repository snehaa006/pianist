import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Headline from '../components/Headline.jsx';
import PerformanceCard from '../components/PerformanceCard.jsx';
import NewsletterForm from '../components/NewsletterForm.jsx';
import ContactRows from '../components/ContactRows.jsx';
import { Staff } from '../components/Motifs.jsx';
import { useLightbox } from '../components/Lightbox.jsx';
import { byId } from '../data/performances';
import { site } from '../data/site';
import { usePageTitle, useReveals } from '../lib/hooks';

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
  const atHome = ['at-home-grand', 'song-of-twilight', 'lcm-grade-1'].map(byId);

  return (
    <>
      <Hero item={concert} />

      {/* Concerts: no public dates yet, so the empty state, never invented rows */}
      <section className="screen" id="concerts" aria-labelledby="concerts-h">
        <div className="container">
          <span className="opus">(Op. 01: Concerts)</span>
          <Headline id="concerts-h">Hear her live</Headline>
          <div className="concerts concert-empty">
            <div className="concert-empty__text">
              <p className="lead">No public dates right now.</p>
              <p className="body muted">New concerts reach the mailing list first.</p>
            </div>
            <a className="btn btn--primary concert-empty__action" href="#list">
              Join the list
            </a>
          </div>
        </div>
      </section>

      <FeaturedFilm item={stage} />

      {/* Three films from home, two of them exam recordings */}
      <section className="screen" aria-labelledby="home-h">
        <div className="container">
          <span className="opus">(Op. 02: Watch)</span>
          <Headline id="home-h">At home, at the piano</Headline>
          <p className="lead muted">Three performances filmed at home, two of them for London College of Music exams.</p>
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

      <section className="stage screen" id="repertoire" aria-labelledby="rep-h">
        <div className="container">
          <Staff />
          <span className="opus">(Op. 03: Repertoire)</span>
          <Headline id="rep-h">What she plays</Headline>
          <p className="lead muted">Five solo pieces, each one on film, {site.repertoireRange}.</p>
          <div className="actions">
            <Link className="btn btn--secondary" to="/repertoire">
              See the repertoire <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* Fermata: no press quote exists, so a photograph only */}
      <section className="stage fermata" aria-label="The hall before the music">
        <figure className="fermata__figure frame scrim">
          <img
            src="/media/posters/fermata.webp"
            alt="An Austrian Master Classes concert seen from the audience: Srinijakara at the grand piano, beyond the backs of the front-row chairs."
            width="848"
            height="480"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="container fermata__caption label">
            Austrian Master Classes, {concert.venue}, {concert.year}.
          </figcaption>
        </figure>
      </section>

      <section className="screen" id="about" aria-labelledby="about-h">
        <div className="container grid split">
          <figure className="split__media frame ratio-4x5 reveal">
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
            <span className="opus">(Op. 04: About)</span>
            <Headline id="about-h">The pianist</Headline>
            <p className="lead">Srinijakara is a pianist based in {site.city}.</p>
            <p className="body muted">
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
          <h2 className="label note__label" id="note-h">
            A note from Srinijakara
          </h2>
          <p className="h3 note__body">{site.note}</p>
          <p className="label muted note__sign">— S.</p>
        </div>
      </section>

      <section className="screen" id="contact" aria-labelledby="contact-h">
        <div className="container">
          <span className="opus">(Op. 05: Contact)</span>
          <Headline id="contact-h">Book a concert</Headline>
          <p className="lead muted">Management, press and direct enquiries.</p>
          <ContactRows />
          <div id="list" className="list-anchor">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}

// Watch: one filmed performance, full-bleed, play in place.
function FeaturedFilm({ item }) {
  const { open } = useLightbox();
  return (
    <section className="stage feature" aria-labelledby="feature-h">
      <div className="feature__frame frame scrim">
        <img src={item.poster} alt={item.alt} width="832" height="464" loading="lazy" decoding="async" />
      </div>
      <div className="container feature__text">
        <div>
          <span className="label muted">{item.composer}</span>
          <h2 className="h1" id="feature-h">
            {item.work}
          </h2>
          <p className="lead muted feature__lead">
            Filmed live on stage at {item.venue}, {item.year}.
          </p>
          <Link className="link feature__link" to="/watch">
            All performances <Arrow />
          </Link>
        </div>
        <button type="button" className="play feature__play" aria-label="Watch the performance" onClick={e => open(item, e.currentTarget)}>
          <span aria-hidden="true">▶</span>
        </button>
      </div>
    </section>
  );
}
