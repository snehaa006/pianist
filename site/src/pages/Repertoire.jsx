import Headline from '../components/Headline.jsx';
import { Keys } from '../components/Motifs.jsx';
import { useLightbox } from '../components/Lightbox.jsx';
import { performances } from '../data/performances';
import { isPlaceholder } from '../data/site';
import { usePageTitle, useReveals } from '../lib/hooks';

// Group works by composer, programme-style. Unknown composers are never merged into one group.
function byComposer(list) {
  const groups = [];
  for (const p of list) {
    const known = !isPlaceholder(p.composer);
    const group = known && groups.find(g => g.composer === p.composer);
    if (group) group.works.push(p);
    else groups.push({ key: known ? p.composer : p.id, composer: p.composer, lifespan: p.lifespan, works: [p] });
  }
  // known composers first, alphabetically by surname; then the ones still to be named
  const surname = g => g.composer.split(' ').pop();
  return [
    ...groups.filter(g => !isPlaceholder(g.composer)).sort((a, b) => surname(a).localeCompare(surname(b))),
    ...groups.filter(g => isPlaceholder(g.composer))
  ];
}

export default function Repertoire() {
  usePageTitle('Repertoire');
  useReveals();
  const { open } = useLightbox();
  const groups = byComposer(performances);

  return (
    <section className="screen page-top" aria-labelledby="rep-page-h">
      <div className="container">
        <span className="opus">(Op. 03: Repertoire)</span>
        <Headline as="h1" className="display" id="rep-page-h">
          Repertoire
        </Headline>
        <p className="lead muted">Five solo pieces, each one filmed, grouped by composer.</p>
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
  );
}
