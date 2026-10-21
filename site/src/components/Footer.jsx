import { Link, useLocation } from 'react-router-dom';
import { links } from './Nav.jsx';
import Skyline from './Skyline.jsx';
import Marionette from './Marionette.jsx';
import { site, isPlaceholder } from '../data/site';

// Ink band; the page ends on her name hanging on strings from a row of piano keys (Marionette), after the "Play music,
// be free" poster. On the Biography page it ends instead on a keyboard whose white keys rise into a city (Skyline),
// under the wordmark.
export default function Footer() {
  const socials = site.socials.filter(s => !isPlaceholder(s.url));
  const city = useLocation().pathname.replace(/\/+$/, '') === '/about';
  return (
    <footer className={`stage footer${city ? ' footer--city' : ''}`}>
      <div className="container footer__row label">
        <ul className="footer__links">
          {links.map(l => (
            <li key={l.to}>
              <Link to={l.to}>{l.label}</Link>
            </li>
          ))}
        </ul>
        {socials.length > 0 && (
          <ul className="footer__links">
            {socials.map(s => (
              <li key={s.label}>
                <a href={s.url} rel="noopener">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <span className="micro">© {new Date().getFullYear()} Selin Incekara</span>
      </div>
      <div className="container">
        {city ? (
          <p className="footer__mark reveal reveal--lift" aria-hidden="true">
            Selin Incekara
          </p>
        ) : (
          <Marionette className="footer__strings" text="Selin Incekara" />
        )}
      </div>
      {city && <Skyline />}
    </footer>
  );
}
