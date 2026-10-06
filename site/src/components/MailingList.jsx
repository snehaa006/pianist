import { useRef } from 'react';
import Headline from './Headline.jsx';
import NewsletterForm from './NewsletterForm.jsx';
import { MoltenLayer } from './Effects.jsx';

// The mailing list on a slow brass-and-ink wash (MoltenMetal under a 72% ink scrim).
export default function MailingList({ as: Tag = 'h2' }) {
  const zone = useRef(null);
  return (
    <section ref={zone} className="stage screen band" id="list" aria-labelledby="list-h">
      <MoltenLayer zoneRef={zone} />
      <div className="container band__content">
        <Headline as={Tag} id="list-h" hinge="bottom" accent="list">
          The mailing list
        </Headline>
        <p className="lead muted reveal reveal--rise">New concerts reach the mailing list first.</p>
        <div className="list-anchor">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
