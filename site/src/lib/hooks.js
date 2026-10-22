import { useEffect, useRef, useState } from 'react';
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

// One frame loop for every scroll-linked effect (useDrift, useScrub): each frame all of them measure first, then all of
// them write. A write between two measures would make the browser restyle the page just to answer the second measure,
// once per effect per frame; batched, it restyles once. A job's `read` measures and returns its write.
const jobs = new Set();
let loop = 0;
const runJobs = () => {
  loop = 0;
  const due = [...jobs];
  jobs.clear();
  due.map(job => job.read()).forEach(write => write());
};
const schedule = job => {
  jobs.add(job);
  if (!loop) loop = requestAnimationFrame(runJobs);
};

// Drift: sets --p on the element while it is on screen, its distance scrolled past the middle of the viewport in
// screens (0 when its middle is at the viewport's middle, 1 a screen further down the page). CSS moves things by it
// (prints at their own --speed, a name sliding sideways); with reduced motion --p stays unset and nothing moves.
export function useDrift(ref) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !('IntersectionObserver' in window)) return undefined;
    let visible = false;
    const job = {
      read: () => {
        const r = el.getBoundingClientRect();
        const p = ((window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight).toFixed(4);
        return () => el.style.setProperty('--p', p);
      }
    };
    const onScroll = () => {
      if (visible) schedule(job);
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
      jobs.delete(job);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      el.style.removeProperty('--p');
    };
  }, [ref, reduced]);
}

// Scrub: sets a CSS variable (0..1, `--t` unless named) on the element from where it stands in the viewport, eased
// toward that target every frame so wheel steps glide instead of jumping; scrolling back plays it in reverse. The
// easing goes by time, not frames, so it keeps its pace when frames come slower or faster.
// `progress(rect, viewportHeight)` gives the target (clamped to 0..1). Runs only while the element is near the screen;
// with reduced motion the variable stays unset and CSS falls back to the finished state. `name` can instead be a
// function, given each value to apply itself (and null when the scrub stops), for an element whose variable would make
// the browser restyle too much of the page every frame.
export function useScrub(ref, progress, name = '--t') {
  const reduced = useReducedMotion();
  const fn = useRef(progress);
  fn.current = progress;
  const apply = useRef(name);
  apply.current = name;
  const custom = typeof name === 'function';
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !('IntersectionObserver' in window)) return undefined;
    const set = v => (custom ? apply.current(v) : el.style.setProperty(name, v.toFixed(4)));
    let near = false;
    let now = null;
    let last = 0;
    const target = () => Math.min(1, Math.max(0, fn.current(el.getBoundingClientRect(), window.innerHeight)));
    const job = {
      read: () => {
        const to = target();
        const at = performance.now();
        const step = 1 - 0.88 ** (Math.min(100, at - (last || at - 16.7)) / 16.7); // 0.12 of the way each 60 Hz frame
        last = at;
        now = now === null ? to : now + (to - now) * step;
        if (Math.abs(to - now) < 0.0015) now = to;
        const v = now;
        return () => {
          set(v);
          if (near && v !== to) schedule(job);
          else last = 0;
        };
      }
    };
    const kick = () => {
      if (near) schedule(job);
    };
    set(target()); // the starting state, before the first frame
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        kick();
      },
      { rootMargin: '25% 0px' }
    );
    io.observe(el);
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    return () => {
      io.disconnect();
      jobs.delete(job);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      if (custom) apply.current(null);
      else el.style.removeProperty(name);
    };
  }, [ref, reduced, custom ? '' : name]); // eslint-disable-line react-hooks/exhaustive-deps
}
