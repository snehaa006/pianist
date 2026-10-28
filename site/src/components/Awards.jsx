import Headline from './Headline.jsx';
import Opus from './Opus.jsx';
import { awards, golds } from '../data/awards';
import { inWords } from '../data/performances';
import { isPlaceholder } from '../data/site';

// Her prizes and certificates (Home and Biography): each diploma on a cream mat like a printed photograph, side by side
// at one height (each column is as wide as its picture's shape needs), and under it what it says: date and place,
// the prize, the competition. Facts not yet known ([placeholders] in data/awards.js) are left off the page.
const known = parts => parts.filter(part => part && !isPlaceholder(part));

export default function Awards({ id = 'awards-h', opus, heading = 'Prizes and certificates', className = '' }) {
  const shapes = awards.map(a => `${(a.image.width / a.image.height).toFixed(3)}fr`).join(' ');
  return (
    <section className={`screen awards ${className}`} aria-labelledby={id}>
      <div className="container">
        {opus && <Opus>{opus}</Opus>}
        <Headline id={id} hinge="left" accent="certificates">
          {heading}
        </Headline>
        <p className="lead muted reveal reveal--rise">
          {inWords(golds, true)} gold prizes, both on 16 October 2026, and a Distinction from London College of Music.
        </p>
        <ol className="awards__list" style={{ '--shapes': shapes }}>
          {awards.map((a, i) => {
            const [date] = known([a.date]);
            return (
              <li key={a.id} className="award reveal reveal--rise" style={{ '--i': i }}>
                <figure className="award__print">
                  <img
                    src={a.image.src}
                    srcSet={a.image.srcSet}
                    sizes="(max-width: 899px) calc(100vw - 32px), 40vw"
                    alt={a.image.alt}
                    width={a.image.width}
                    height={a.image.height}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <div className="award__text">
                  {(date || a.where) && (
                    <p className="label muted">
                      {date && (a.dateIso ? <time dateTime={a.dateIso}>{date}</time> : date)}
                      {date && a.where && ' · '}
                      {a.where}
                    </p>
                  )}
                  <h3 className="h2 award__prize">{a.prize}</h3>
                  <p className="body award__title">{a.title}</p>
                  <p className="body-sm muted">{known(a.detail.split(', ')).join(', ')}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
