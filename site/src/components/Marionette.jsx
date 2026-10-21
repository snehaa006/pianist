import { useEffect, useRef } from 'react';
import { createMarionette } from '../lib/marionette';
import { useReducedMotion } from '../lib/hooks';
import { useSound } from '../lib/sound.jsx';

// Her name hanging on strings from a row of piano keys (lib/marionette.js), on a canvas that fills its box. Runs only
// while on screen and the tab is visible; the letters are lowered into place the first time it comes into view; the
// mouse passing through them sets them swinging; while a piece plays the keys play along and tug their letters. With
// reduced motion the name hangs still.
export default function Marionette({ className = '', text }) {
  const canvas = useRef(null);
  const reduced = useReducedMotion();
  const { playhead } = useSound();

  useEffect(() => {
    const el = canvas.current;
    const scene = createMarionette(el, { text, play: playhead });
    let visible = false;
    const run = () => (visible && !document.hidden && !reduced ? scene.start() : scene.stop());
    const ro = new ResizeObserver(() => {
      scene.resize();
      if (reduced) scene.still();
    });
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (e.intersectionRatio >= 0.4) scene.lower();
        run();
      },
      { threshold: [0, 0.4] }
    );
    io.observe(el);
    document.addEventListener('visibilitychange', run);
    if (reduced) scene.still();

    let lastX = null;
    let lastT = 0;
    const onMove = e => {
      if (e.pointerType !== 'mouse') return;
      const box = el.getBoundingClientRect();
      const now = performance.now();
      const vx = lastX === null ? 0 : ((e.clientX - lastX) / Math.max(8, now - lastT)) * 1000;
      lastX = e.clientX;
      lastT = now;
      scene.poke(e.clientX - box.left, e.clientY - box.top, vx);
    };
    if (!reduced) el.addEventListener('pointermove', onMove);

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', run);
      el.removeEventListener('pointermove', onMove);
      scene.destroy();
    };
  }, [reduced, playhead, text]);

  return <canvas ref={canvas} className={`marionette ${className}`} aria-hidden="true" />;
}
