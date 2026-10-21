import Headline from '../components/Headline.jsx';
import Opus from '../components/Opus.jsx';
import ContactRows from '../components/ContactRows.jsx';
import NewsletterForm from '../components/NewsletterForm.jsx';
import { usePageTitle, useReveals } from '../lib/hooks';

export default function Contact() {
  usePageTitle('Contact');
  useReveals();

  return (
    <>
      <section className="screen page-top" aria-labelledby="contact-page-h">
        <div className="container">
          <Opus>(Op. 04: Contact)</Opus>
          <Headline as="h1" className="display" id="contact-page-h" hinge="top" accent="concert">
            Book a concert
          </Headline>
          <p className="lead muted reveal reveal--rise">Management, press and direct enquiries.</p>
          <ContactRows />
          {/* The mailing list, part of this screen: the page ends on the footer, not on a second dark band. */}
          <div className="list-anchor" id="list">
            <h2 className="label" id="list-h">
              The mailing list
            </h2>
            <p className="body muted list-anchor__lead">New concerts reach the mailing list first.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
