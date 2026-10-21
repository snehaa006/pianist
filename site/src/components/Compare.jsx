import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../lib/hooks';

// How quickly the line catches the pointer: it closes this share of the gap per second, exponentially, so a fast
// move sweeps across and settles about a quarter of a second behind.
const LAG = 9;

// Two pictures in one box, split by a line that follows the pointer, as in a before-and-after slider: `over` shows
// left of the line, `children` right of it. At rest the line waits at the left edge, unseen, so only `children`
// shows; hovering brings the line to the pointer and leaving sends it back. Touch: tap or drag. Keyboard: a range
// input (arrow keys). With reduced motion the line jumps to the pointer instead of trailing it.
export default function Compare({ className = '', label, over, children }) {
  const root = useRef(null);
  const range = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    const input = range.current;
    let at = 0;
    let target = 0;
    let raf = 0;
    let last = 0;
    let dragging = false;

    const draw = () => {
      el.style.setProperty('--at', at.toFixed(4));
      el.classList.toggle('is-open', target > 0 || at > 0.002);
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
      if (reduced) {
        at = target;
        draw();
      } else if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const across = e => {
      const box = el.getBoundingClientRect();
      return (e.clientX - box.left) / box.width;
    };

    const onMove = e => {
      if (e.pointerType === 'mouse' || dragging) go(across(e));
    };
    const onDown = e => {
      if (e.pointerType === 'mouse') return;
      dragging = true;
      el.setPointerCapture?.(e.pointerId);
      go(across(e));
    };
    const onUp = () => {
      dragging = false;
    };
    const onLeave = e => {
      if (e.pointerType === 'mouse') go(0);
    };
    const onInput = () => go(Number(input.value) / 100);

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', onLeave);
    input.addEventListener('input', onInput);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave', onLeave);
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
      <input ref={range} className="sr-only compare__range" type="range" min="0" max="100" defaultValue="0" aria-label={label} />
    </div>
  );
}
