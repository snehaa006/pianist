import { site, isPlaceholder } from '../data/site';

// Management / Press / Direct, each a name and an email link (plain text until the email is real).
export default function ContactRows() {
  return (
    <ul className="contact-rows body-sm">
      {site.contacts.map(c => (
        <li key={c.role}>
          <span className="label">{c.role}</span>
          {isPlaceholder(c.email) ? (
            <span className="contact-rows__value">{c.name}</span>
          ) : (
            <a className="link" href={`mailto:${c.email}`}>
              {c.name}{' '}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
