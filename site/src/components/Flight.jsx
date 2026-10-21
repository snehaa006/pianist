import { useEffect, useRef } from 'react';
import { createFlight } from '../lib/flight';
import { useReducedMotion } from '../lib/hooks';

// Keys turning into birds (lib/flight.js) on a canvas that fills its positioned parent. Pass `keybed` (a ref to the
// box the keyboard fills) or `source` (a function giving the line the birds rise from, in the canvas's px).
// `pokeRef`: pointer moves over this element send the key under the pointer up. Runs only while on screen and the
// tab is visible; with reduced motion it draws one still frame of birds already in the air.
export default function Flight({ className = '', keybed, source, pokeRef, ...options }) {
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
    const onMove = e => {
      if (e.pointerType !== 'mouse') return;
      const box = el.getBoundingClientRect();
      flight.poke(e.clientX - box.left, e.clientY - box.top);
    };
    if (zone && !reduced) zone.addEventListener('pointermove', onMove);

    return () => {
      ro.disconnect();
      io?.disconnect();
      document.removeEventListener('visibilitychange', run);
      zone?.removeEventListener('pointermove', onMove);
      flight.destroy();
    };
    // The options are fixed for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return <canvas ref={canvas} className={`flight ${className}`} aria-hidden="true" />;
}
