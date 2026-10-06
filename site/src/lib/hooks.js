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

// Effects (MaskedHeading fill, cursor) run on laptop/desktop only: ≥900px, fine pointer,
// motion allowed and not a touch device (allowFx from presets.js).
export function useFx() {
  const wide = useMedia('(min-width: 900px)');
  const reduced = useReducedMotion();
  return wide && !reduced && allowFx();
}

// Arpeggio reveals: anything with .reveal fades up once it is 20% into the viewport.
export function useReveals(deps = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.is-in)'));
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Srinijakara` : 'Srinijakara · Pianist';
  }, [title]);
}
