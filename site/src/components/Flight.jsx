import { useEffect, useRef } from 'react';
import { createFlight } from '../lib/flight';
import { useReducedMotion } from '../lib/hooks';
import { strike } from '../lib/tone';
import { letNotes } from '../lib/notes';

// Keys turning into birds (lib/flight.js) on a canvas that fills its positioned parent. Pass `keybed` (a ref to the
// box the keyboard fills) or `source` (a function giving the line the birds rise from, in the canvas's px).
// `pokeRef`: the mouse sweeping over this element sends the key under it up; a press on a key plays it (its note sounds,
// it goes down and lets notes go, in `noteTones`). Runs only while on screen and the tab is visible; with reduced motion
// it draws one still frame of birds already in the air.
export default function Flight({ className = '', keybed, source, pokeRef, noteTones = ['ink', 'ivory'], ...options }) {
  const canvas = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = canvas.current;
    if (!el) return undefined;
    const flight = createFlight(el, {
      ...options,
      keybed: keybed ? () => keybed.current : undefined,
      source: source ? () => source(el) : undefined
    });
    let visible = !('IntersectionObserver' in window);
    const run = () => (visible && !document.hidden && !reduced ? flight.start() : flight.stop());
    const ro = new ResizeObserver(() => {
      flight.resize();
      if (reduced) flight.still();
    });
    ro.observe(el);
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        run();
      })
      : null;
    io?.observe(el);
    document.addEventListener('visibilitychange', run);
    if (reduced) flight.still();
    run();

    const zone = pokeRef?.current;
    // Only a sweep sends keys up (faster than 0.5 px/ms), so a key can be reached at a walk and played.
    let last = null;
    const onMove = e => {
      if (e.pointerType !== 'mouse') return;
      const t = e.timeStamp;
      const fast = last && Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(1, t - last.t) > 0.5;
      last = { x: e.clientX, y: e.clientY, t };
      if (!fast) return;
      const box = el.getBoundingClientRect();
      flight.poke(e.clientX - box.left, e.clientY - box.top);
    };
    if (zone && !reduced) zone.addEventListener('pointermove', onMove);
    const onDown = e => {
      const box = el.getBoundingClientRect();
      const hit = flight.tap(e.clientX - box.left, e.clientY - box.top);
      if (!hit) return;
      strike(hit.note);
      letNotes(box.left + hit.x, box.top + hit.y, { tones: noteTones, seed: hit.note });
    };
    (zone || el).addEventListener('pointerdown', onDown);

    return () => {
      ro.disconnect();
      io?.disconnect();
      document.removeEventListener('visibilitychange', run);
      zone?.removeEventListener('pointermove', onMove);
      (zone || el).removeEventListener('pointerdown', onDown);
      flight.destroy();
    };
    // The options are fixed for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return <canvas ref={canvas} className={`flight ${className}`} aria-hidden="true" />;
}
