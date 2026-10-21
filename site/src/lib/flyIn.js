import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMedia, useReducedMotion } from './hooks';

gsap.registerPlugin(ScrollTrigger);

// The films reel: one pinned screen, every film playing as a muted loop.
//   1. As the screen scrolls up, two words slide in from opposite sides ("On stage," from the left, "and at
//      home" from the right).
//   2. Pinned: a ring of the films comes in from the bottom left, tilted so it reads as a ribbon, turning.
//   3. The ring swings up close: the films pass across the screen, large, in front of the words.
//   4. It pulls back to a thin ribbon at the top and sweeps off to the top right; the words, which have been
//      crossing all along, slide off the other way.
//   5. The films fly into a 4x2 grid one at a time, each from its own side, swinging like a sheet of paper.
//   6. Ink blinds close over the grid, lowest band first, and the ink screen after follows on.
// Scroll drives all of it, so scrolling back plays it in reverse. Wide screens with motion allowed only;
// elsewhere the section is a headline and a plain grid.
export const FLY = {
  scroll: 0.3, // screen heights of scrolling per timeline unit
  perspective: 1400, // px, the sky's (.reel__sky) perspective; the ring's depths below are against it
  // The ring's stations: x and y in screen widths and heights from the centre (where its centre appears), z in px
  // from the screen plane, tilt in degrees (leaning back, rising to the right). The films are laid out at the size
  // they show up close and the ring is set back for the smaller stations, so up close nothing is scaled up and
  // the loops stay sharp.
  ring: {
    start: { x: -0.62, y: 0.85, z: -3700, rotationX: -18, rotationZ: -14 },
    ribbon: { x: -0.04, y: 0.14, z: -3700, rotationX: -18, rotationZ: -14 },
    close: { x: 0, y: -0.12, z: -1250, rotationX: -12, rotationZ: -7 },
    top: { x: 0.04, y: -0.3, z: -3700, rotationX: -16, rotationZ: -13 },
    gone: { x: 0.6, y: -0.75, z: -3700, rotationX: -16, rotationZ: -13 }
  },
  spread: 22.5, // degrees between films on the ring: 16 tiles (every film twice), as .reel__tile sets in site.css
  turn: -470, // degrees the ring turns from coming in to leaving (front films travel right to left)
  // Timeline units: when each move starts.
  at: { close: 1.4, hold: 2.4, back: 4.4, leave: 5.4, films: 5.9 },
  step: 0.6, // units between one film setting off and the next
  swing: [1, 0.6, -0.2, 0.06, 0] // the tilt as a film settles: in, still tilted on screen, past flat, back, flat
};

// Where a film sits against the grid's centre: across from -1 (left edge) to 1, and -1, 0 or 1 down.
// Offsets ignore transforms.
const sideOf = (card, grid) => {
  const across = card.offsetLeft + card.offsetWidth / 2 - grid.clientWidth / 2;
  const down = card.offsetTop + card.offsetHeight / 2 - grid.clientHeight / 2;
  return {
    x: across / (grid.clientWidth / 2),
    y: Math.abs(down) < card.offsetHeight / 2 ? 0 : Math.sign(down)
  };
};

// A station in px for GSAP, read when the timeline (re)measures. Set back by z, a move looks smaller by
// perspective / (perspective - z), so x and y are scaled up by the inverse to land where the station says.
const station = s => ({
  x: () => (s.x * window.innerWidth * (FLY.perspective - s.z)) / FLY.perspective,
  y: () => (s.y * window.innerHeight * (FLY.perspective - s.z)) / FLY.perspective,
  z: s.z,
  rotationX: s.rotationX,
  rotationZ: s.rotationZ
});

// Play a muted loop only while it can be seen; pause it otherwise.
const run = (video, on) => {
  if (on && video.paused) video.play().catch(() => {});
  else if (!on && !video.paused) video.pause();
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
      const orbit = q('.reel__orbit')[0];
      const ring = q('.reel__ring')[0];
      const tiles = q('.reel__tile');
      const [wordA, wordB] = q('.reel__word');
      const { ring: R, at } = FLY;
      const landed = at.films + (cards.length - 1) * FLY.step + 1;
      const blinds = landed + 0.5;

      // 1. The words slide in while the screen scrolls up to the pin.
      gsap.fromTo(wordA, { xPercent: -140 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top top', scrub: 0.8 }
      });
      gsap.fromTo(wordB, { xPercent: 140 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top top', scrub: 0.8 }
      });

      // Each frame: which loops play, and how much of the ring's far side shows. As a ribbon only the near
      // side shows; up close the far side shows too, over the near side, holding its frames (`far` below).
      let active = false;
      let tl = null;
      const far = { show: 0 };
      const sync = () => {
        if (!tl) return;
        const t = tl.time();
        const ringUp = active && t < at.leave + 1;
        const turn = gsap.getProperty(ring, 'rotationY');
        tiles.forEach((tile, n) => {
          const facing = Math.cos(((n * FLY.spread + turn) * Math.PI) / 180);
          const near = gsap.utils.clamp(0, 1, (facing + 0.25) / 0.3);
          tile.style.opacity = near + (1 - near) * far.show;
          run(tile, ringUp && facing > 0.25);
        });
        cards.forEach((card, i) => run(card.querySelector('video'), active && t > at.films + i * FLY.step && t < blinds + 1));
      };

      tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: sync,
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * FLY.scroll * tl.duration()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onToggle: self => {
            active = self.isActive;
            sync();
          }
        }
      });

      // 2–4. The ring: in from the bottom left, up close, back to a ribbon at the top, away to the top right.
      // It turns the whole time.
      tl.fromTo(ring, { rotationY: 70 }, { rotationY: 70 + FLY.turn, duration: at.leave + 1 }, 0)
        .fromTo(orbit, station(R.start), { ...station(R.ribbon), duration: at.close, ease: 'power2.out' }, 0)
        .to(orbit, { ...station(R.close), duration: at.hold - at.close, ease: 'sine.inOut' }, at.close)
        .to(orbit, { ...station(R.top), duration: at.leave - at.back, ease: 'sine.inOut' }, at.back)
        .to(orbit, { ...station(R.gone), scale: 0.8, duration: 1, ease: 'power2.in' }, at.leave)
        .fromTo(far, { show: 0 }, { show: 1, duration: (at.hold - at.close) * 0.6 }, at.close + (at.hold - at.close) * 0.4)
        .to(far, { show: 0, duration: (at.leave - at.back) * 0.4 }, at.back)
        .fromTo(q('.reel__sky'), { opacity: 1 }, { opacity: 0, duration: 0.4 }, at.leave + 0.6)
        .to(q('.reel__intro'), { opacity: 0, duration: 0.4 }, at.close - 0.4);

      // The words cross while the ring is up (the upper one to the right, the lower one to the left), then
      // slide off past the screen's edges.
      tl.to(wordA, { x: () => window.innerWidth * 0.52, duration: at.leave }, 0)
        .to(wordB, { x: () => -window.innerWidth * 0.52, duration: at.leave }, 0)
        .to(wordA, { x: () => window.innerWidth - wordA.offsetLeft + 40, duration: 1, ease: 'power2.in' }, at.leave)
        .to(wordB, { x: () => -(wordB.offsetLeft + wordB.offsetWidth + 40), duration: 1, ease: 'power2.in' }, at.leave);

      // 5. The films fly in.
      cards.forEach((card, i) => {
        // The column and row only change at the breakpoint that turns this off, so they are read once.
        const s = sideOf(card, grid);
        const from = FLY.at.films + i * FLY.step;
        const swing = start => FLY.swing.map(k => k * start);
        const sx = Math.sign(s.x);
        gsap.set(card, { transformPerspective: 1100, transformOrigin: '50% 50%' });
        tl.fromTo(
          card,
          { x: () => s.x * window.innerWidth * 0.7, y: () => s.y * window.innerHeight * 0.8 },
          { x: 0, y: 0, duration: 1, ease: 'power1.out' },
          from
        )
          .fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.25 }, from)
          .to(
            card,
            {
              keyframes: {
                rotationX: swing(-s.y * 55 || 38),
                rotationY: swing(s.x * 50),
                // Inner columns fall straighter than outer ones, with a sway so they still read as paper.
                rotationZ: swing(sx * (s.y || 1) * (6 + Math.abs(s.x) * 10)),
                scaleX: [1.1, 1.04, 0.97, 1.01, 1],
                scaleY: [0.75, 0.88, 1.05, 0.99, 1],
                easeEach: 'sine.inOut'
              },
              duration: 1
            },
            from
          );
      });

      // 6. Every film in place for a moment, then the blinds.
      tl.fromTo(q('.reel__blinds i'), { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: 'power1.in', stagger: { each: 0.07, from: 'end' } }, blinds)
        .to({}, { duration: 0.2 });
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
