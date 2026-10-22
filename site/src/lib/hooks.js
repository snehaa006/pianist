import { useEffect, useState } from 'react';
import { allowFx } from '../components/fx/presets';

export function useMedia(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');

// Effects (MaskedHeading fill, canvas layers) run on laptop/desktop only: ≥900px, fine pointer,
// motion allowed and not a touch device (allowFx from presets.js).
export function useFx() {
  const wide = useMedia('(min-width: 900px)');
  const reduced = useReducedMotion();
  return wide && !reduced && allowFx();
}

// Arpeggio reveals: anything with .reveal fades up once it is 20% into the viewport.
// Masked variants (wipe, rise) start fully clipped, and IntersectionObserver honours clip-path,
// so for those we watch the parent and reveal the child when the parent arrives.
// The footer wordmark (lift) ends the page, so it can never pass the lower fifth: it arrives with its footer.
const MASKED = '.reveal--wipe, .reveal--rise';
const LIFT = '.reveal--lift';

export function useReveals(deps = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.is-in)'));
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-in'));
      return undefined;
    }
    const byTarget = new Map();
    els.forEach(el => {
      let target = el;
      if (el.matches(MASKED)) target = el.parentElement;
      else if (el.matches(LIFT)) target = el.closest('footer') || el;
      byTarget.set(target, [...(byTarget.get(target) || []), el]);
    });
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          (byTarget.get(e.target) || []).forEach(el => el.classList.add('is-in'));
          io.unobserve(e.target);
        }),
      // "20% into the viewport": fires once the target's top passes the lower fifth of the screen,
      // however tall the target is.
      { threshold: 0, rootMargin: '0px 0px -20% 0px' }
    );
    byTarget.forEach((_, target) => io.observe(target));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Selin Incekara` : 'Selin Incekara · Pianist';
  }, [title]);
}

// Drift: sets --p on the element while it is on screen, its distance scrolled past the middle of the viewport in
// screens (0 when its middle is at the viewport's middle, 1 a screen further down the page). CSS moves things by it
// (prints at their own --speed, a name sliding sideways); with reduced motion --p stays unset and nothing moves.
export function useDrift(ref) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !('IntersectionObserver' in window)) return undefined;
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--p', ((window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight).toFixed(4));
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      onScroll();
    });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      el.style.removeProperty('--p');
    };
  }, [ref, reduced]);
}
