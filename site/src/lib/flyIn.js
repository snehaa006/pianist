import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMedia, useReducedMotion } from './hooks';
import { createTrails } from './trails';

gsap.registerPlugin(ScrollTrigger);

// The films reel: one pinned screen on the ink stage, every film playing as a muted loop, with her at the middle.
//   1. As the screen scrolls up, two words slide in from opposite sides ("On stage," from the left, "and at
//      home" from the right).
//   2. Pinned: she appears in the middle, at the grand piano at home, lit like a hologram (her cut-out from the
//      film, rising out of the dark from the floor up).
//   3. A ring of the films comes in from the bottom left, far back and tilted so it reads as a ribbon, glides to the
//      middle, then swings in and settles round her at the height of the keys, seen from a little above. It turns:
//      the films in front pass before her, the far ones behind her.
//   4. Trails of light circle her on tilted orbits (lib/trails.js), behind her and in front of her.
//   5. The ring pulls back to a thin ribbon at the top and sweeps off to the top right; she fades, the light goes
//      out, and the words, which have been crossing all along, slide off the other way.
//   6. The films fly into a 4x2 grid one at a time, each from its own side, swinging like a sheet of paper.
//   7. Red blinds close over the grid, lowest band first, and the red band after follows on.
// Scroll drives all of it, so scrolling back plays it in reverse; while the screen is pinned the ring also turns
// slowly by itself. Wide screens with motion allowed only; elsewhere the section is a headline and a plain grid.
export const FLY = {
  scroll: 0.3, // screen heights of scrolling per timeline unit
  perspective: 1400, // px, the sky's (.reel__sky) perspective; the depths below are against it
  drop: 0.1, // screen heights from the screen's centre down to her scene's origin (.reel__scene, top 60%)
  scene: [-700, -380], // px, her scene's depth: the view moves in on her until the ring pulls back
  // The ring's stations away from her: x and y in screen widths and heights from the screen's centre (where the
  // ring's centre appears), z in px from the screen plane, tilt in degrees (leaning back, rising to the right).
  // Set back this far the ring reads as a thin ribbon.
  ring: {
    start: { x: -0.62, y: 0.85, z: -1100, rotationX: -18, rotationZ: -14 },
    ribbon: { x: -0.04, y: 0.14, z: -1100, rotationX: -18, rotationZ: -14 },
    top: { x: 0.04, y: -0.3, z: -1100, rotationX: -16, rotationZ: -13 },
    gone: { x: 0.6, y: -0.75, z: -1100, rotationX: -16, rotationZ: -13 }
  },
  tilt: { rotationX: -16, rotationZ: -4 }, // the ring settled round her, seen from a little above
  spread: 22.5, // degrees between films on the ring: 16 tiles (every film twice), as .reel__tile sets in site.css
  turn: -470, // degrees the ring turns from coming in to leaving (front films travel right to left)
  spin: 9, // degrees a second it turns by itself while the screen is pinned
  // Timeline units: when each move starts.
  at: { ribbon: 1.4, settled: 2.4, back: 4.4, leave: 5.4, films: 5.9 },
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

// Her scene's depth at timeline time t.
const sceneZ = t => gsap.utils.interpolate(...FLY.scene, gsap.parseEase('sine.inOut')(gsap.utils.clamp(0, 1, t / FLY.at.back)));

// A station in px for GSAP, read when the timeline (re)measures. The ring hangs in her scene, `deep` px back at that
// moment, whose origin sits FLY.drop below the centre; set back by z in all, a move looks smaller by
// perspective / (perspective - z), so x and y are scaled up by the inverse to land where the station says.
const station = (s, deep) => {
  const k = (FLY.perspective - s.z) / FLY.perspective;
  return {
    x: () => s.x * k * window.innerWidth,
    y: () => (s.y * k - FLY.drop) * window.innerHeight,
    z: s.z - deep,
    rotationX: s.rotationX,
    rotationZ: s.rotationZ
  };
};

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
    let trails = null;
    let tick = null;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(stage);
      const grid = q('.films')[0];
      const cards = gsap.utils.toArray(grid.children);
      const scene = q('.reel__scene')[0];
      const her = q('.reel__her')[0];
      const orbit = q('.reel__orbit')[0];
      const ring = q('.reel__ring')[0];
      const tiles = q('.reel__tile');
      const [wordA, wordB] = q('.reel__word');
      const [backLight, frontLight] = q('.reel__light');
      const { ring: R, at } = FLY;
      const landed = at.films + (cards.length - 1) * FLY.step + 1;
      const blinds = landed + 0.5;

      // Her middle and the globe of light's radius, in the light canvases' px.
      trails = createTrails(backLight, frontLight, {
        centre: () => {
          const b = her.getBoundingClientRect();
          const c = backLight.getBoundingClientRect();
          return { x: b.left - c.left + b.width * 0.5, y: b.top - c.top + b.height * 0.56, r: b.width * 0.5 };
        }
      });

      // 1. The words slide in while the screen scrolls up to the pin.
      gsap.fromTo(wordA, { xPercent: -140 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top top', scrub: 0.8 }
      });
      gsap.fromTo(wordB, { xPercent: 140 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top top', scrub: 0.8 }
      });

      // The ring's turn is the scroll's share plus its own slow spin; `show` dims every film together (opacity on
      // the ring itself would flatten its 3D). As a ribbon only the near side shows; round her the far side shows
      // too, dimmed, behind her (`far`).
      const turn = { deg: 70, spin: 0 };
      const show = { v: 1 };
      const far = { show: 0 };
      let active = false;
      let tl = null;
      const sync = () => {
        if (!tl) return;
        const t = tl.time();
        const angle = turn.deg + turn.spin;
        gsap.set(ring, { rotationY: angle });
        const ringUp = active && show.v > 0.05;
        tiles.forEach((tile, n) => {
          const facing = Math.cos(((n * FLY.spread + angle) * Math.PI) / 180);
          const near = gsap.utils.clamp(0, 1, (facing + 0.2) / 0.5);
          tile.style.opacity = show.v * (near + (1 - near) * 0.32 * far.show);
          run(tile, ringUp && facing > 0.3);
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
            if (!active) trails.clear();
            sync();
          }
        }
      });

      // While pinned the ring keeps turning and the light keeps circling, scroll or no scroll.
      tick = (time, deltaMs) => {
        if (!active) return;
        const dt = Math.min(deltaMs, 50) / 1000;
        turn.spin += dt * FLY.spin;
        trails.step(dt);
        sync();
      };
      gsap.ticker.add(tick);

      // 2. Her, rising out of the dark from the floor up (the clip reaches past her sides and feet, so her glow is never
      // cut square); the view moves in on her slowly the whole time.
      tl.fromTo(her, { clipPath: 'inset(100% -20% -20% -20%)', opacity: 0 }, { clipPath: 'inset(-20% -20% -20% -20%)', opacity: 1, duration: 1.2, ease: 'power1.out' }, 0)
        .fromTo(scene, { z: FLY.scene[0] }, { z: FLY.scene[1], duration: at.back, ease: 'sine.inOut' }, 0)
        .to(q('.reel__intro'), { opacity: 0, duration: 0.4 }, at.ribbon - 0.4)
        .fromTo(q('.reel__foot'), { opacity: 0 }, { opacity: 1, duration: 0.6 }, at.films + 1);

      // 3. The ring: in from the bottom left as a ribbon, to the middle, then in round her; later back to a ribbon
      // at the top and away to the top right. It turns the whole time.
      tl.fromTo(turn, { deg: 70 }, { deg: 70 + FLY.turn, duration: at.leave + 1 }, 0)
        .fromTo(orbit, station(R.start, sceneZ(0)), { ...station(R.ribbon, sceneZ(at.ribbon)), duration: at.ribbon, ease: 'power2.out' }, 0)
        .to(orbit, { x: 0, y: 0, z: 0, ...FLY.tilt, duration: at.settled - at.ribbon, ease: 'sine.inOut' }, at.ribbon)
        .to(orbit, { ...station(R.top, sceneZ(at.leave)), duration: at.leave - at.back, ease: 'sine.inOut' }, at.back)
        .to(orbit, { ...station(R.gone, sceneZ(at.leave)), scale: 0.8, duration: 1, ease: 'power2.in' }, at.leave)
        .fromTo(far, { show: 0 }, { show: 1, duration: (at.settled - at.ribbon) * 0.6 }, at.ribbon + (at.settled - at.ribbon) * 0.4)
        .to(far, { show: 0, duration: (at.leave - at.back) * 0.4 }, at.back)
        .fromTo(show, { v: 1 }, { v: 0, duration: 0.4 }, at.leave + 0.6);

      // 4. The light comes up once the ring has settled, and goes out as it pulls back. 5. She fades.
      tl.fromTo(trails, { level: 0 }, { level: 1, duration: 1.2 }, at.settled - 0.5)
        .to(trails, { level: 0, duration: 0.7 }, at.back)
        .to(her, { opacity: 0, scale: 0.94, duration: 0.8, ease: 'power1.in' }, at.back + 0.15);

      // The words cross behind her while the ring is up (the upper one to the right, the lower one to the left),
      // then slide off past the screen's edges.
      tl.to(wordA, { x: () => window.innerWidth * 0.52, duration: at.leave }, 0)
        .to(wordB, { x: () => -window.innerWidth * 0.52, duration: at.leave }, 0)
        .to(wordA, { x: () => window.innerWidth - wordA.offsetLeft + 40, duration: 1, ease: 'power2.in' }, at.leave)
        .to(wordB, { x: () => -(wordB.offsetLeft + wordB.offsetWidth + 40), duration: 1, ease: 'power2.in' }, at.leave);

      // 6. The films fly in.
      cards.forEach((card, i) => {
        // The column and row only change at the breakpoint that turns this off, so they are read once.
        const s = sideOf(card, grid);
        const from = at.films + i * FLY.step;
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

      // 7. Every film in place for a moment, then the blinds.
      tl.fromTo(q('.reel__blinds i'), { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: 'power1.in', stagger: { each: 0.07, from: 'end' } }, blinds)
        .to({}, { duration: 0.2 });
    }, stage);
    const onResize = () => trails?.resize();
    window.addEventListener('resize', onResize);
    // Later triggers on the page (headline folds) must measure with the pin's extra scroll in place.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', onResize);
      if (tick) gsap.ticker.remove(tick);
      ctx.revert();
    };
  }, [on, ref]);

  return on;
}
