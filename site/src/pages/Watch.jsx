import { useRef, useState } from 'react';
import Headline from '../components/Headline.jsx';
import PerformanceCard from '../components/PerformanceCard.jsx';
import Opus from '../components/Opus.jsx';
import { ShardsLayer } from '../components/Effects.jsx';
import GooeyNav from '../components/fx/GooeyNav/GooeyNav.jsx';
import BorderGlow from '../components/fx/BorderGlow/BorderGlow.jsx';
import { presets } from '../components/fx/presets';
import { filters, performances } from '../data/performances';
import { useFx, usePageTitle, useReveals } from '../lib/hooks';

// Every performance on the stage. Desktop filters with GooeyNav, phones with pill chips;
// the first film of the current filter sits in a brass BorderGlow; each opens in the ink lightbox.
export default function Watch() {
  const [filter, setFilter] = useState('all');
  const [shardsFailed, setShardsFailed] = useState(false);
  const fx = useFx();
  const zone = useRef(null);
  usePageTitle('Performances');
  useReveals([filter]);

  // The tall header is for the AeroShards shards (WebGPU); without them it closes up.
  const shards = fx && !shardsFailed && typeof navigator !== 'undefined' && !!navigator.gpu;
  const shown = performances.filter(p => filter === 'all' || p.tags.includes(filter));
  const [first, ...rest] = shown;

  // GooeyNav renders links; keep its particle animation, but filter in place instead of navigating.
  const pick = e => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    const index = Array.from(li.parentElement.children).indexOf(li);
    setFilter(filters[index].key);
  };

  return (
    <>
      <section ref={zone} className={`stage screen page-top watch-head${shards ? ' watch-head--tall' : ''}`} aria-labelledby="watch-h">
        <ShardsLayer zoneRef={zone} onFail={() => setShardsFailed(true)} />
        <div className="container band__content">
          <Opus>(Op. 02: Watch)</Opus>
          <Headline as="h1" className="display" id="watch-h" hinge="left">
            Performances
          </Headline>
          <p className="lead muted reveal reveal--rise">Five performances on film: in concert, on stage and at home.</p>
        </div>
      </section>

      <section className="stage screen watch" aria-label="Films">
        <div className="container">
          <div className="watch__filter" role="group" aria-label="Filter the films">
            {fx ? (
              <div onClickCapture={pick} onKeyDownCapture={e => (e.key === 'Enter' || e.key === ' ') && pick(e)}>
                <GooeyNav {...presets.GooeyNav} items={filters.map(f => ({ label: f.label, href: `#${f.key}` }))} />
              </div>
            ) : (
              <div className="chips">
                {filters.map(f => (
                  <button key={f.key} type="button" className="chip" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            <p className="label muted" aria-live="polite">
              {shown.length} {shown.length === 1 ? 'film' : 'films'}
            </p>
          </div>

          <div className="films films--watch" key={filter}>
            {first && (
              <div className="film-glow reveal">
                <BorderGlow {...presets.BorderGlow}>
                  <PerformanceCard item={first} size="lg" eager />
                </BorderGlow>
              </div>
            )}
            {rest.map((p, i) => (
              <PerformanceCard key={p.id} item={p} index={i + 1} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
