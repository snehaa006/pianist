import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import { LightboxProvider } from './components/Lightbox.jsx';
import { Keys } from './components/Motifs.jsx';
import { FxStageProvider } from './lib/fxStage.jsx';
import { useReducedMotion } from './lib/hooks';
import Home from './pages/Home.jsx';

const Watch = lazy(() => import('./pages/Watch.jsx'));
const Repertoire = lazy(() => import('./pages/Repertoire.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// While a page loads: the keyboard-rhythm loader, lighting up key by key.
function PageLoader() {
  return (
    <div className="page-loader stage">
      <Keys loading />
    </div>
  );
}

// Page transition: an ink curtain, keyed to the route, lifts away over Andante.
// Not on the first load, so nothing covers the landing screen while the name rises.
function Curtain() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const initial = useRef(pathname);
  const navigated = useRef(false);
  if (pathname !== initial.current) navigated.current = true;
  if (reduced || !navigated.current) return null;
  return (
    <div className="curtain" key={pathname} aria-hidden="true">
      <Keys />
    </div>
  );
}

// New page → top of page; a #hash → that section.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView());
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <FxStageProvider>
      <LightboxProvider>
        <ScrollManager />
        <Curtain />
        <Nav />
        <main id="main" tabIndex={-1}>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/repertoire" element={<Repertoire />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </main>
        <Footer />
      </LightboxProvider>
      </FxStageProvider>
    </BrowserRouter>
  );
}
