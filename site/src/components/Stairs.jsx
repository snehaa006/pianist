import { useEffect, useRef } from 'react';
import OptionWheel from './fx/OptionWheel/OptionWheel.jsx';
import { presets } from './fx/presets';
import { useLightbox } from './Lightbox.jsx';
import { metaOf, pieces } from '../data/performances';
import { isPlaceholder } from '../data/site';
import { useSound } from '../lib/sound.jsx';
import { loadNotes } from '../lib/tracks';
import { createStairs } from '../lib/stairs';
import { useFx, useReducedMotion } from '../lib/hooks';

// The pieces are named by their work once it is known, otherwise by where they were filmed (as on the Repertoire dial).
const nameOf = p => (isPlaceholder(p.work) ? p.short : p.work);

// Hear her play: the piano keys as a flight of stairs on the red (lib/stairs.js), and beside them every piece she has on
// film. Choosing a piece plays it (the site sound, lib/sound.jsx): the stairs fold back into the wall and build again on
// that piece's notes, and each key goes in as she plays it. Nothing sounds until a piece is chosen or Play is pressed.
// Desktop turns the pieces on a dial (OptionWheel: click, drag or arrow keys; the mouse wheel stays with the page);
// phones and touch get a plain list.
// `build`: a ref ({ v: 0..1 }) the films reel turns as it scrolls (lib/flyIn.js); the stairs then sit over the reel's
// blinds and build with them. Without it they are a screen of their own and build once they come into view.
export default function Stairs({ build }) {
  const { track, wanted, choose, toggle, playhead } = useSound();
  const { open } = useLightbox();
  const fx = useFx();
  const reduced = useReducedMotion();
  const root = useRef(null);
  const canvas = useRef(null);
  const engine = useRef(null);
  const trackRef = useRef(track);
  trackRef.current = track;
  const index = Math.max(0, pieces.findIndex(p => p.id === track));
  const current = pieces[index];

  useEffect(() => {
    const el = canvas.current;
    const stairs = createStairs(el, { build: build ? () => build.current.v : undefined, play: playhead, still: reduced });
    engine.current = stairs;
    let live = true;
    const id = trackRef.current;
    loadNotes(id).then(notes => live && stairs.setPiece(id, notes));
    let visible = false;
    const run = () => (visible && !document.hidden ? stairs.start() : stairs.stop());
    const ro = new ResizeObserver(() => stairs.resize());
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (!build && e.intersectionRatio >= 0.35) stairs.grow();
        run();
      },
      { threshold: [0, 0.35] }
    );
    io.observe(root.current);
    document.addEventListener('visibilitychange', run);
    return () => {
      live = false;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', run);
      stairs.destroy();
      engine.current = null;
    };
  }, [build, playhead, reduced]);

  // The stairs show the piece in the player.
  useEffect(() => {
    let live = true;
    loadNotes(track).then(notes => live && engine.current?.setPiece(track, notes));
    return () => {
      live = false;
    };
  }, [track]);

  return (
    <section ref={root} className={`stairs${build ? ' stairs--reel' : ' screen'}`} aria-labelledby="stairs-h">
      <canvas ref={canvas} className="stairs__keys" aria-hidden="true" />
      <div className="stairs__panel">
        <div className="stairs__head">
          <h2 className="label" id="stairs-h">
            Hear her play
          </h2>
          <p className="lead stairs__lead">Choose a piece. The keys play it with her.</p>
        </div>
        {fx ? (
          <div className="stairs__wheel">
            <OptionWheel
              {...presets.OptionWheel}
              items={pieces.map(nameOf)}
              defaultSelected={index}
              onChange={i => choose(pieces[i].id)}
              scroll={false}
              ariaLabel="Her pieces: choose one to hear it"
            />
          </div>
        ) : (
          <ul className="stairs__list">
            {pieces.map(p => (
              <li key={p.id}>
                <button
                  type="button"
                  className="stairs__piece"
                  aria-pressed={p.id === track && wanted}
                  data-current={p.id === track || undefined}
                  onClick={() => choose(p.id)}
                >
                  {nameOf(p)}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="stairs__foot">
          <p className="stairs__now" aria-live="polite">
            <span className="label">{current.composer}</span>
            <span className="body-sm muted">{metaOf(current)}</span>
          </p>
          <div className="stairs__actions">
            <button type="button" className="btn btn--primary" onClick={() => (wanted ? toggle() : choose(track))}>
              {wanted ? 'Pause' : 'Play the piece'}
            </button>
            <button type="button" className="link" onClick={e => open(current, e.currentTarget)}>
              Watch the film{' '}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
