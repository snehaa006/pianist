import { useEffect, useRef, useState } from 'react';
import { useLightbox } from './Lightbox.jsx';
import { useReducedMotion } from '../lib/hooks';
import { useSound } from '../lib/sound.jsx';

const FIRST = 'Selin';
const SECOND = 'Incekara';

// Each letter of the name rises out of a mask, 45ms apart over Andante (about 1.2s in all).
const Letters = ({ word, offset = 0 }) => (
  <span className="wm-line" aria-hidden="true">
    {Array.from(word).map((c, i) => (
      <span className="wm-letter" style={{ '--i': i + offset }} key={i}>
        {c}
      </span>
    ))}
  </span>
);

// Screen 1: the name, one current fact, one action.
// Her black-and-white reel plays full-bleed behind a viewfinder: hairlines on the page margins and thirds,
// corner brackets, a focus mark. [ Reel ] / [ Still ] swaps it for the concert photograph (and is the pause
// control); with reduced motion the still is the default and the reel never loads.
export default function Hero({ item }) {
  const { open } = useLightbox();
  const reduced = useReducedMotion();
  const { gate } = useSound();
  const [choice, setChoice] = useState(null);
  const mode = choice ?? (reduced ? 'still' : 'reel');
  const section = useRef(null);
  const video = useRef(null);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const el = section.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The reel plays only when chosen, once the sound gate has closed, and while the hero is on screen.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (mode === 'reel' && !gate && onScreen) v.play().catch(() => setChoice('still'));
    else v.pause();
  }, [mode, gate, onScreen]);

  // Coming in through the gate, the reel starts from its first page.
  const wasGated = useRef(gate);
  useEffect(() => {
    if (wasGated.current && !gate && video.current) video.current.currentTime = 0;
    wasGated.current = gate;
  }, [gate]);

  return (
    <section ref={section} className="stage screen hero hero--reel" aria-labelledby="name">
      <div className="hero__media">
        {!(reduced && choice === null) && (
          <video
            ref={video}
            className={`hero__reel${mode === 'reel' ? '' : ' is-off'}`}
            muted
            loop
            playsInline
            preload="auto"
            poster="/media/posters/hero-reel.webp"
            aria-hidden="true"
          >
            <source src="/media/video/hero-reel.webm" type="video/webm" />
            <source src="/media/video/hero-reel.mp4" type="video/mp4" />
          </video>
        )}
        <img
          className={`hero__still${mode === 'still' ? ' is-on' : ''}`}
          src="/media/posters/hero.webp"
          alt={mode === 'still' ? item.alt : ''}
          width="848"
          height="480"
          fetchPriority={reduced ? 'high' : 'low'}
        />
        <div className="hero__shade" />
      </div>

      <div className="hero__lines" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="hero__finder hero-in" style={{ '--d': '500ms' }} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <b className="hero__focus" />
      </div>

      <div className="container hero__content">
        <h1 className="wordmark hero__wordmark" id="name" aria-label="Selin Incekara">
          <Letters word={FIRST} />{' '}
          <Letters word={SECOND} offset={FIRST.length} />
        </h1>
        <div className="hero__row">
          <div className="hero__intro">
            <p className="label hero__label hero-in" style={{ '--d': '600ms' }}>
              Pianist
            </p>
            <p className="lead hero__lead hero-in" style={{ '--d': '700ms' }}>
              Watch {item.composer}'s {item.work}, filmed at an Austrian Master Classes concert in {item.year}.
            </p>
            <div className="hero__actions hero-in" style={{ '--d': '900ms' }}>
              <button type="button" className="btn btn--primary btn--lg btn--block-mobile" onClick={e => open(item, e.currentTarget)}>
                Watch the performance
              </button>
            </div>
          </div>
          <div className="hero__views hero-in" style={{ '--d': '1000ms' }} role="group" aria-label="Behind the name">
            {[
              ['reel', 'Reel'],
              ['still', 'Still']
            ].map(([key, label]) => (
              <button key={key} type="button" className="hero__view" aria-pressed={mode === key} onClick={() => setChoice(key)}>
                <span aria-hidden="true">[ </span>
                {label}
                <span aria-hidden="true"> ]</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
