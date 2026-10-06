import { useState } from 'react';
import Headline from '../components/Headline.jsx';
import Opus from '../components/Opus.jsx';
import { Keys } from '../components/Motifs.jsx';
import { useLightbox } from '../components/Lightbox.jsx';
import OptionWheel from '../components/fx/OptionWheel/OptionWheel.jsx';
import { presets } from '../components/fx/presets';
import { metaOf, performances } from '../data/performances';
import { isPlaceholder } from '../data/site';
import { useFx, usePageTitle, useReveals } from '../lib/hooks';

// Group works by composer, programme-style. Unknown composers are never merged into one group.
function byComposer(list) {
  const groups = [];
  for (const p of list) {
    const known = !isPlaceholder(p.composer);
    const group = known && groups.find(g => g.composer === p.composer);
    if (group) group.works.push(p);
    else groups.push({ key: known ? p.composer : p.id, composer: p.composer, lifespan: p.lifespan, works: [p] });
  }
  const surname = g => g.composer.split(' ').pop();
  return [
    ...groups.filter(g => !isPlaceholder(g.composer)).sort((a, b) => surname(a).localeCompare(surname(b))),
    ...groups.filter(g => isPlaceholder(g.composer))
  ];
}

// The wheel shows the work's title once it is known, otherwise where it was filmed.
const wheelLabel = p => (isPlaceholder(p.work) ? p.short : p.work);

export default function Repertoire() {
  usePageTitle('Repertoire');
  useReveals();
  const fx = useFx();
  const { open } = useLightbox();
  const [index, setIndex] = useState(0);
  const groups = byComposer(performances);
  const current = performances[index];

  return (
    <>
      <section className="screen page-top" aria-labelledby="rep-page-h">
        <div className="container">
          <Opus>(Op. 03: Repertoire)</Opus>
          <Headline as="h1" className="display" id="rep-page-h" hinge="top">
            Repertoire
          </Headline>
          <p className="lead muted reveal reveal--rise">Five solo pieces, each one filmed, grouped by composer.</p>

          {/* Desktop: turn the dial to pick a piece; the programme list below stays for everyone. */}
          {fx && (
            <div className="dial reveal">
              <div className="dial__wheel" aria-hidden="true">
                <OptionWheel
                  {...presets.OptionWheel}
                  items={performances.map(wheelLabel)}
                  defaultSelected={0}
                  onChange={i => setIndex(i)}
                />
              </div>
              <div className="dial__detail" aria-live="polite" key={current.id}>
                <div className="frame scrim ratio-16x9 dial__poster">
                  <img src={current.poster} alt={current.alt} width="1024" height="576" />
                </div>
                <span className="label muted dial__composer">
                  {current.composer} <span className="micro">({current.lifespan})</span>
                </span>
                <p className="h2 dial__work">{current.work}</p>
                <p className="body-sm muted">
                  {[current.collection && `From ${current.collection}`, metaOf(current), current.syllabus].filter(Boolean).join(' · ')}
                </p>
                <div className="actions">
                  <button type="button" className="btn btn--primary" onClick={e => open(current, e.currentTarget)}>
                    Watch the performance
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="divider">
            <Keys />
          </div>
          <ul className="programme">
            {groups.map((g, i) => (
              <li className="programme__group reveal" key={g.key} style={{ '--i': i }}>
                <div className="programme__composer">
                  <h2 className="h3">{g.composer}</h2>
                  <span className="micro muted">({g.lifespan})</span>
                </div>
                <ul className="programme__works">
                  {g.works.map(w => (
                    <li className="programme__work" key={w.id}>
                      <div>
                        <p className="programme__title">{w.work}</p>
                        <p className="body-sm muted programme__meta">
                          {[w.collection && `From ${w.collection}`, w.occasion, w.syllabus].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="link programme__watch"
                        aria-label={`Watch ${w.composer}: ${w.work}`}
                        onClick={e => open(w, e.currentTarget)}
                      >
                        Watch{' '}
                        <span className="arrow" aria-hidden="true">
                          →
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
