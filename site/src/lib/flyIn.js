import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMedia, useReducedMotion } from './hooks';

gsap.registerPlugin(ScrollTrigger);

// Films flying in: the grid holds still under the nav while its films arrive one at a time, each from its own
// side of the screen (top left from the top left, top middle straight down, bottom middle straight up, and so
// on). On the way in each one swings like a sheet of paper, tilting and flexing, and settles flat in its place.
// Scroll drives it, so scrolling back sends them out again. Wide screens with motion allowed only; elsewhere
// the films keep the plain reveal.
export const FLY = {
  scroll: 0.32, // screen heights of scrolling per film
  overlap: 0.3, // how far into one film's flight the next one sets off
  swing: [1, 0.6, -0.2, 0.06, 0] // the tilt as it settles: in, still tilted on screen, past flat, back, flat
};

// Where a film sits against the grid's centre: -1, 0 or 1 across and down. Offsets ignore transforms.
const sideOf = (card, grid) => {
  const across = card.offsetLeft + card.offsetWidth / 2 - grid.clientWidth / 2;
  const down = card.offsetTop + card.offsetHeight / 2 - grid.clientHeight / 2;
  return {
    x: Math.abs(across) < card.offsetWidth / 2 ? 0 : Math.sign(across),
    y: Math.abs(down) < card.offsetHeight / 2 ? 0 : Math.sign(down)
  };
};

export function useFlyIn(ref) {
  const wide = useMedia('(min-width: 900px)');
  const reduced = useReducedMotion();
  const on = wide && !reduced;

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!on || !grid) return undefined;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(grid.children);
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: grid,
          // Hold the grid centred in the space under the nav; if it is taller than that, from just under the nav.
          start: () => {
            const nav = document.querySelector('.nav')?.offsetHeight || 0;
            const free = window.innerHeight - nav;
            return `top ${nav + Math.max(16, (free - grid.offsetHeight) / 2)}px`;
          },
          end: () => `+=${window.innerHeight * FLY.scroll * cards.length}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true
        }
      });

      cards.forEach((card, i) => {
        // The column and row only change at the breakpoint that turns this off, so they are read once.
        const s = sideOf(card, grid);
        const at = i * (1 - FLY.overlap);
        const swing = start => FLY.swing.map(k => k * start);
        gsap.set(card, { transformPerspective: 1100, transformOrigin: '50% 50%' });
        tl.fromTo(
          card,
          { x: () => s.x * window.innerWidth * 0.55, y: () => s.y * window.innerHeight * 0.8 },
          { x: 0, y: 0, duration: 1, ease: 'power1.out' },
          at
        )
          .fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.25 }, at)
          .to(
            card,
            {
              keyframes: {
                rotationX: swing(-s.y * 55 || 38),
                rotationY: swing(s.x * 45),
                // The middle column falls straight, with a slight sway so it still reads as paper.
                rotationZ: swing(s.x * (s.y || 1) * 14 || (s.y < 0 ? 6 : -6)),
                scaleX: [1.1, 1.04, 0.97, 1.01, 1],
                scaleY: [0.75, 0.88, 1.05, 0.99, 1],
                easeEach: 'sine.inOut'
              },
              duration: 1
            },
            at
          );
      });
      // A moment with every film in place before the page moves on.
      tl.to({}, { duration: 0.35 });
    }, grid);
    // Later triggers on the page (headline folds) must measure with the pin's extra scroll in place.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
  }, [on, ref]);

  return on;
}
