import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import SoundToggle from './SoundToggle.jsx';

export const links = [
  { to: '/watch', label: 'Watch' },
  { to: '/repertoire', label: 'Repertoire' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

// Pages that open on an ink stage: the nav starts transparent with ivory text.
// Home turns solid ivory once the hero has scrolled away; Watch stays on ink.
const onInk = { top: 'stage', after: 'ink', threshold: () => 24 };
const surfaces = {
  '/': { top: 'stage', after: 'ivory', threshold: () => window.innerHeight * 0.8 },
  '/watch': onInk
};
const ivoryPages = ['/repertoire', '/about', '/contact'];
// Unknown paths render the 404, which is on ink too.
const surfaceFor = path => surfaces[path] || (ivoryPages.includes(path) ? undefined : onInk);

export default function Nav() {
  const { pathname } = useLocation();
  const surface = surfaceFor(pathname.replace(/\/+$/, '') || '/');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    if (!surface) return undefined;
    const onScroll = () => setScrolled(window.scrollY > surface.threshold());
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname, surface]);

  let mode = 'nav--solid';
  if (surface) mode = !scrolled ? 'nav--over-stage' : surface.after === 'ink' ? 'nav--ink' : 'nav--solid';

  return (
    <>
      <a className="skip-link label" href="#main">
        Skip to content
      </a>
      <nav className={`nav ${mode}`} aria-label="Main">
        <Link className="nav__name" to="/">
          Selin Incekara
        </Link>
        <ul className="nav__links">
          {links.map(l => (
            <li key={l.to}>
              <NavLink to={l.to}>{l.label}</NavLink>
            </li>
          ))}
        </ul>
        <SoundToggle className="nav__sound" />
        <button
          className="nav__menu"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="menu-panel"
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </button>
      </nav>
      {menuOpen && <MenuPanel onClose={() => setMenuOpen(false)} />}
    </>
  );
}

// Mobile: full-screen ink panel, links at h1 size, arpeggio stagger.
function MenuPanel({ onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="menu stage" id="menu-panel" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="menu__bar">
        <Link className="nav__name" to="/" onClick={onClose}>
          Selin Incekara
        </Link>
        <button ref={closeRef} className="nav__menu menu__close" type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <ul className="menu__links">
        <li className="menu__item" style={{ '--i': 0 }}>
          <NavLink className="h1" to="/" end onClick={onClose}>
            Home
          </NavLink>
        </li>
        {links.map((l, i) => (
          <li className="menu__item" key={l.to} style={{ '--i': i + 1 }}>
            <NavLink className="h1" to={l.to} onClick={onClose}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
