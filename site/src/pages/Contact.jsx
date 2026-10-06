import Headline from '../components/Headline.jsx';
import ContactRows from '../components/ContactRows.jsx';
import NewsletterForm from '../components/NewsletterForm.jsx';
import { usePageTitle } from '../lib/hooks';

export default function Contact() {
  usePageTitle('Contact');

  return (
    <>
      <section className="screen page-top" aria-labelledby="contact-page-h">
        <div className="container">
          <span className="opus">(Op. 05: Contact)</span>
          <Headline as="h1" id="contact-page-h">
            Book a concert
          </Headline>
          <p className="lead muted">Management, press and direct enquiries.</p>
          <ContactRows />
        </div>
      </section>

      <section className="screen screen--paper" id="list" aria-labelledby="list-h">
        <div className="container">
          <Headline id="list-h">The mailing list</Headline>
          <p className="lead muted">New concerts reach the mailing list first.</p>
          <div className="list-anchor">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
