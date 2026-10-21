import { Link, useLocation } from 'react-router-dom';
import { links } from './Nav.jsx';
import Skyline from './Skyline.jsx';
import Marionette from './Marionette.jsx';
import { site, isPlaceholder } from '../data/site';

// Ink band. The footer is her name hanging on strings (Marionette, after the "Play music, be free" poster): the keys
// hang from its top edge, the name under them, and the links and © run along its foot, one piece. On the Biography
// page it ends instead on a keyboard whose white keys rise into a city (Skyline), under the links and the wordmark.
export default function Footer() {
  const socials = site.socials.filter(s => !isPlaceholder(s.url));
  const city = useLocation().pathname.replace(/\/+$/, '') === '/about';
  const row = (
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
  );

  if (city) {
    return (
      <footer className="stage footer footer--city">
        {row}
        <div className="container">
          <p className="footer__mark reveal reveal--lift" aria-hidden="true">
            Selin Incekara
          </p>
        </div>
        <Skyline />
      </footer>
    );
  }
  return (
    <footer className="stage footer footer--strings">
      <div className="container">
        <Marionette className="footer__strings" text="Selin Incekara" />
      </div>
      <div className="footer__foot">{row}</div>
    </footer>
  );
}
