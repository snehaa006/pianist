import Headline from '../components/Headline.jsx';
import Opus from '../components/Opus.jsx';
import ContactRows from '../components/ContactRows.jsx';
import MailingList from '../components/MailingList.jsx';
import { usePageTitle, useReveals } from '../lib/hooks';

export default function Contact() {
  usePageTitle('Contact');
  useReveals();

  return (
    <>
      <section className="screen page-top" aria-labelledby="contact-page-h">
        <div className="container">
          <Opus>(Op. 05: Contact)</Opus>
          <Headline as="h1" className="display" id="contact-page-h" hinge="top" accent="concert">
            Book a concert
          </Headline>
          <p className="lead muted reveal reveal--rise">Management, press and direct enquiries.</p>
          <ContactRows />
        </div>
      </section>

      <MailingList />
    </>
  );
}
