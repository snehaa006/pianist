import { useEffect, useRef, useState } from 'react';
import { useMedia, useReducedMotion } from '../lib/hooks';

// Screen 1: her film, whole and uncovered, on the page directly under the nav. Ten slow seconds of her and the
// piano (at home by the window, in concert, on stage), in slow motion with long dissolves, looping without a seam
// (scripts/hero-film.py in ../montage). Her name is in the nav, so the H1 is for screen readers. The film is
// silent; her piano plays only when the visitor asks for it in the nav. One control: pause / play (autoplaying
// motion must be stoppable). With reduced motion the film waits on a still of her hands rising off the keys.
// Portrait screens get the phone cut, the same edit reframed on her; the film always fits the first screen.
export const PORTRAIT_QUERY = '(max-aspect-ratio: 4/5)';
const CUTS = {
  wide: { video: '/media/video/hero-film', poster: '/media/posters/hero-film.webp', still: '/media/posters/hero-film-still.webp' },
  phone: { video: '/media/video/hero-film-phone', poster: '/media/posters/hero-film-phone.webp', still: '/media/posters/hero-film-phone-still.webp' }
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
    <section ref={section} className="hero hero--film" aria-labelledby="name" aria-describedby="hero-d">
      <h1 className="sr-only" id="name">
        Selin Incekara
      </h1>
      <p className="sr-only" id="hero-d">
        A slow film of her at the piano: at home by the window, in concert and on stage.
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
