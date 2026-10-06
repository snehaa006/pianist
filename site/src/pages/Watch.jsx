import Headline from '../components/Headline.jsx';
import PerformanceCard from '../components/PerformanceCard.jsx';
import SiteCursor from '../components/SiteCursor.jsx';
import { performances } from '../data/performances';
import { usePageTitle, useReveals } from '../lib/hooks';

// Every performance as a grid on the stage; each opens in the ink lightbox.
export default function Watch() {
  usePageTitle('Performances');
  useReveals();
  const [first, ...rest] = performances;

  return (
    <section className="stage screen page-top watch" aria-labelledby="watch-h">
      <SiteCursor />
      <div className="container watch__inner">
        <span className="opus">(Op. 02: Watch)</span>
        <Headline as="h1" className="display" id="watch-h">
          Performances
        </Headline>
        <p className="lead muted">Five performances on film: in concert, on stage and at home.</p>
        <div className="films films--watch">
          <PerformanceCard item={first} size="lg" eager />
          {rest.map((p, i) => (
            <PerformanceCard key={p.id} item={p} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
