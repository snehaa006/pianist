import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../lib/hooks';

// How much of the gap to the pointer the line closes each 60th of a second: low enough that it trails the pointer
// rather than snapping to it (after the products page wipe on the MCIL site).
const EASE = 0.14;
// Where the line waits before the pointer has said otherwise: dead centre, half of each picture.
const REST = 0.5;

// Two pictures in one box, split by a line, as in a before-and-after slider: `over` shows left of the line,
// `children` right of it. With a mouse the line takes the pointer's x across the page, measured across the box and
// held at its edges, so it still runs end to end when the pointer passes above or below the box rather than through
// it; it starts in the middle. Its chevron points at whichever side still has the most to give. Without a mouse
// (touch) only `children` shows until a tap or drag on the box brings the line in. Keyboard: a range input (arrow
// keys). With reduced motion the line jumps to the pointer instead of trailing it.
export default function Compare({ className = '', label, over, children }) {
  const root = useRef(null);
  const range = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    const input = range.current;
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let at = mouse ? REST : 0;
    let target = at;
    let raf = 0;
    let last = 0;
    let dragging = false;
    let near = false; // the box is on (or about to come on) screen

    const draw = () => {
      el.style.setProperty('--at', at.toFixed(4));
      el.classList.toggle('is-right', at > 0.5);
    };
    const frame = now => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      at += (target - at) * (1 - (1 - EASE) ** (dt * 60));
      if (Math.abs(target - at) < 0.0005) at = target;
      draw();
      raf = at === target ? 0 : requestAnimationFrame(frame);
    };
    const go = to => {
      target = Math.min(1, Math.max(0, to));
      el.classList.add('is-open');
      input.value = String(Math.round(target * 100));
      input.setAttribute('aria-valuetext', `${Math.round(target * 100)}% photograph`);
      if (reduced) {
        at = target;
        draw();
      } else if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const across = x => {
      const box = el.getBoundingClientRect();
      return (x - box.left) / box.width;
    };

    // Mouse: anywhere on the page, while the box is near the screen. The line waits where it is until the mouse moves.
    const onPageMove = e => {
      if (e.pointerType === 'mouse' && near) go(across(e.clientX));
    };
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting;
    }, { rootMargin: '25% 0px' });
    io.observe(el);

    // Touch and pen: tap or drag on the box.
    const onDown = e => {
      if (e.pointerType === 'mouse') return;
      dragging = true;
      el.setPointerCapture?.(e.pointerId);
      go(across(e.clientX));
    };
    const onMove = e => {
      if (dragging) go(across(e.clientX));
    };
    const onUp = () => {
      dragging = false;
    };
    const onInput = () => go(Number(input.value) / 100);

    window.addEventListener('pointermove', onPageMove, { passive: true });
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    input.addEventListener('input', onInput);
    input.value = String(Math.round(at * 100));
    el.classList.toggle('is-open', mouse);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onPageMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      input.removeEventListener('input', onInput);
    };
  }, [reduced]);

  return (
    <div ref={root} className={`compare ${className}`}>
      {children}
      <div className="compare__over">{over}</div>
      <span className="compare__line" aria-hidden="true">
        <svg className="compare__chevron" viewBox="0 0 24 24" width="20" height="20">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </span>
      <input ref={range} className="sr-only compare__range" type="range" min="0" max="100" defaultValue="0" aria-label={label} />
    </div>
  );
}
