import { useEffect, useRef, useState } from 'react';
import { useMedia, useReducedMotion } from '../lib/hooks';

// Screen 1: her reel, whole and uncovered, on the page directly under the nav. The reel carries her name
// (it opens and closes on it), so the H1 is for screen readers. The reel is silent; her piano plays only when
// the visitor asks for it in the nav. One control: pause / play (autoplaying motion must be stoppable). With
// reduced motion the reel waits on its contact-sheet page until asked to play.
// Portrait screens get the reel's phone cut; the two are the same edit. Both encodes
// drop the reel's running header (her name repeated under the nav), and the film always fits the first screen.
export const PORTRAIT_QUERY = '(max-aspect-ratio: 4/5)';
const CUTS = {
  wide: { video: '/media/video/hero-reel', poster: '/media/posters/hero-reel.webp', still: '/media/posters/hero-reel-still.webp' },
  phone: { video: '/media/video/hero-reel-phone', poster: '/media/posters/hero-reel-phone.webp', still: '/media/posters/hero-reel-phone-still.webp' }
};

export default function Hero() {
  const reduced = useReducedMotion();
  const portrait = useMedia(PORTRAIT_QUERY);
  const cut = CUTS[portrait ? 'phone' : 'wide'];
  const [choice, setChoice] = useState(null); // 'play' | 'pause', once the visitor chooses
  const paused = choice ? choice === 'pause' : reduced;
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

  // Plays while on screen, unless paused.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!paused && onScreen) v.play().catch(() => setChoice('pause'));
    else v.pause();
  }, [paused, onScreen, portrait]);

  return (
    <section ref={section} className="hero hero--reel" aria-labelledby="name" aria-describedby="hero-d">
      <h1 className="sr-only" id="name">
        Selin Incekara
      </h1>
      <p className="sr-only" id="hero-d">
        A short film of her performances: at home at the grand, in concert and on stage.
      </p>
      <div className="hero__film">
        <video
          key={portrait ? 'phone' : 'wide'}
          ref={video}
          muted
          loop
          playsInline
          preload={reduced ? 'none' : 'auto'}
          poster={reduced ? cut.still : cut.poster}
          aria-hidden="true"
        >
          <source src={`${cut.video}.webm`} type="video/webm" />
          <source src={`${cut.video}.mp4`} type="video/mp4" />
        </video>
        <button
          type="button"
          className={`hero__pause${paused ? ' is-paused' : ''}`}
          aria-label={paused ? 'Play the film' : 'Pause the film'}
          onClick={() => setChoice(paused ? 'play' : 'pause')}
        >
          <span aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
