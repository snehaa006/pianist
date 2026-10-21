import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../lib/hooks';

// How quickly the line catches the pointer: it closes this share of the gap per second, exponentially, so it glides
// after the pointer and settles about a third of a second behind.
const LAG = 7;

// Two pictures in one box, split by a line, as in a before-and-after slider: `children` shows left of the line,
// `over` right of it. With a mouse the line follows the pointer's position across the page, not only over the box
// (held at the box's edges), so moving anywhere on the screen moves it, and leaving the box leaves it where it is. It
// starts at the right edge, so only `children` shows, and is hidden at either edge. Touch: tap or drag on the box.
// Keyboard: a range input (arrow keys). With reduced motion the line jumps to the pointer instead of gliding.
export default function Compare({ className = '', label, over, children }) {
  const root = useRef(null);
  const range = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    const input = range.current;
    let at = 1;
    let target = 1;
    let raf = 0;
    let last = 0;
    let dragging = false;
    let near = false; // the box is on (or about to come on) screen
    let pointerX = null; // the mouse's last clientX, wherever it is

    const draw = () => {
      el.style.setProperty('--at', at.toFixed(4));
      el.classList.toggle('is-open', at > 0.005 && at < 0.995);
    };
    const frame = now => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      at += (target - at) * (1 - Math.exp(-dt * LAG));
      if (Math.abs(target - at) < 0.0005) at = target;
      draw();
      raf = at === target ? 0 : requestAnimationFrame(frame);
    };
    const go = to => {
      target = Math.min(1, Math.max(0, to));
      input.value = String(Math.round(target * 100));
      input.setAttribute('aria-valuetext', `${Math.round((1 - target) * 100)}% photograph`);
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

    // Mouse: anywhere on the page, while the box is near the screen.
    const onPageMove = e => {
      if (e.pointerType !== 'mouse') return;
      pointerX = e.clientX;
      if (near) go(across(pointerX));
    };
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting;
      if (near && pointerX !== null) go(across(pointerX));
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
    go(1);
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
        <span className="compare__handle">
          <svg viewBox="0 0 20 10" width="20" height="10">
            <path d="M5 1 1 5l4 4M15 1l4 4-4 4" />
          </svg>
        </span>
      </span>
      <input ref={range} className="sr-only compare__range" type="range" min="0" max="100" defaultValue="100" aria-label={label} />
    </div>
  );
}
