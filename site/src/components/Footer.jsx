import { Link, useLocation } from 'react-router-dom';
import { links } from './Nav.jsx';
import Skyline from './Skyline.jsx';
import { site, isPlaceholder } from '../data/site';

// Ink band; the wordmark is cropped by the bottom edge as a closing gesture. On the Biography page the page ends
// instead on a keyboard whose white keys rise into a city (Skyline), under the wordmark.
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
        <p className="footer__mark reveal reveal--lift" aria-hidden="true">
          Selin Incekara
        </p>
      </div>
      {city && <Skyline />}
    </footer>
  );
}
