import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMedia, useReducedMotion } from './hooks';

gsap.registerPlugin(ScrollTrigger);

// Films flying in: one pinned screen. It opens on a ring of the films turning in the air, tilted so it reads as
// a ribbon, under two big words drifting across. As you scroll the ring sweeps away to the top right, the words
// slide off, and the films arrive in the grid one at a time, each from its own side of the screen (top left
// from the top left, top middle straight down, bottom middle straight up, and so on). On the way in each one
// swings like a sheet of paper, tilting and flexing, and settles flat in its place. Scroll drives it, so
// scrolling back sends them out and brings the ring back. Wide screens with motion allowed only; elsewhere the
// section is a headline and a plain grid.
export const FLY = {
  intro: 1.6, // timeline units the ring turns before the first film sets off
  scroll: 0.32, // screen heights of scrolling per timeline unit
  overlap: 0.3, // how far into one film's flight the next one sets off
  tilt: { x: -16, z: -13 }, // the ring's lean: leaning back, rising to the right
  turn: -70, // degrees the ring turns over the intro
  swing: [1, 0.6, -0.2, 0.06, 0] // the tilt as a film settles: in, still tilted on screen, past flat, back, flat
};

// Just past the left edge of the screen, wherever the word starts. Offsets ignore transforms.
const offLeft = (i, word) => -(word.offsetLeft + word.offsetWidth + 40);

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
    const stage = ref.current;
    if (!on || !stage) return undefined;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(stage);
      const grid = q('.films')[0];
      const cards = gsap.utils.toArray(grid.children);
      const units = FLY.intro + (cards.length - 1) * (1 - FLY.overlap) + 1 + 0.35;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * FLY.scroll * units}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true
        }
      });

      // The ring turns the whole intro and keeps turning as it leaves for the top right.
      gsap.set(q('.reel__orbit'), { rotationX: FLY.tilt.x, rotationZ: FLY.tilt.z });
      tl.fromTo(q('.reel__ring'), { rotationY: 20 }, { rotationY: 20 + FLY.turn, duration: FLY.intro + 0.6 }, 0)
        .to(
          q('.reel__orbit'),
          { x: () => window.innerWidth * 0.5, y: () => -window.innerHeight * 0.55, scale: 0.8, duration: 1, ease: 'power2.in' },
          FLY.intro - 0.6
        )
        .to(q('.reel__sky'), { opacity: 0, duration: 0.4 }, FLY.intro)
        // Both words drift left, the way the ring turns; the lower one faster, then they slide off.
        .fromTo(q('.reel__word--a'), { x: () => window.innerWidth * 0.12 }, { x: () => -window.innerWidth * 0.08, duration: FLY.intro }, 0)
        .fromTo(q('.reel__word--b'), { x: () => window.innerWidth * 0.18 }, { x: () => -window.innerWidth * 0.1, duration: FLY.intro }, 0)
        .to(q('.reel__word--a'), { x: offLeft, duration: 1, ease: 'power2.in' }, FLY.intro - 0.3)
        .to(q('.reel__word--b'), { x: offLeft, duration: 1, ease: 'power2.in' }, FLY.intro - 0.4)
        .to(q('.reel__intro'), { opacity: 0, duration: 0.4 }, FLY.intro - 0.9);

      cards.forEach((card, i) => {
        // The column and row only change at the breakpoint that turns this off, so they are read once.
        const s = sideOf(card, grid);
        const at = FLY.intro + i * (1 - FLY.overlap);
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
    }, stage);
    // Later triggers on the page (headline folds) must measure with the pin's extra scroll in place.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
  }, [on, ref]);

  return on;
}
