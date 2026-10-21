# Selin Incekara: portfolio site

Vite + React static site built with the `/pianist` design system (`.claude/skills/pianist/`).
Tokens, base components, Bebas Neue and the client components are copied from the skill unchanged, except for one
added prop on MaskedHeading (`maxFontSize`) so the name can fill the full width (the original caps type at 200px).

## Where each client component lives

| Component | Place |
|---|---|
| MicroSlats | Behind the repertoire band on Home |
| MaskedHeading | Not used since the hero change (the name filled with video was slow to arrive); `hero-loop.*` media is kept if you want it back |
| FoldText | Every screen headline; the hinge changes per screen (bottom, top, left, right) |
| CircularText | "WATCH • THE • FILM •" badge around the featured film's play button |
| RippleDistortion | Not used (removed from the fermata photo and the portrait at the client's request) |
| MoltenMetal | Mailing-list band (Home, Contact), under a 72% ink scrim |
| AeroShards | Watch header (WebGPU only; closes up without it) |
| GooeyNav | Watch filter: All · On stage · At home · Exams (chips on phones) |
| BorderGlow | Brass edge-light on the lead film of the Watch grid |
| OptionWheel | Repertoire dial with a detail panel (desktop) |
| DepthText, TextPressure | 404 only |

Budget: `src/lib/fxStage.jsx` lets only the section filling most of the viewport run its WebGL/canvas effect;
effects are code-split and never load on phones, touch devices or with reduced motion.

Text motion: FoldText headlines, mask *rise* for lead lines, *wipe* for captions, notes and portraits, *track* for opus
tags (tracking closes from 0.6em to label width), *lift* for the footer wordmark (shown whole, not cropped), counted
display numerals, an ink curtain between pages and the keyboard-rhythm loader while a page loads.

The films reel (`src/lib/flyIn.js`, Home's "On stage, and at home"): one pinned screen with all eight films, each
playing as a 6 s muted loop (`public/media/video/loops/`, made by `npm run media -- --loops`). Two words slide in from
opposite sides; a ring of the films comes in from the bottom left as a ribbon, swings up close (the far side showing
over the near side) while the words cross behind it, pulls back to a ribbon at the top and sweeps off to the top
right. The films then fly into a 4x2 grid one at a time, each from its own side, swinging like a sheet of paper, and
ink blinds close over the grid into the repertoire band. GSAP ScrollTrigger, scrubbed, so scrolling back plays it in
reverse; only the loops that can be seen play. Wide screens (≥900px) with motion allowed; phones and reduced motion
get the headline and a plain grid of stills.

## Run

```bash
npm install
npm run dev          # local
npm run build        # → dist/ (static; every route gets its own index.html, plus 404.html)
npm run preview      # serve dist/ on :4173
```

Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3). Set the project root to `site/`, build command `npm run build`, output `dist`.

## Sound and the hero film

The landing page opens on her film, whole and uncovered under the nav (`src/components/Hero.jsx`): ten slow
seconds of her and the piano, looping without a seam, made by `../montage/scripts/hero-film.py`. Five moments from
the performance videos (at home by the window, her hands at the keys, the Austrian Master Classes hall, her hands
rising off the keys on stage, and at home again as she lifts her hands and sits back), all in slow motion, joined
by long dissolves, each with a slow camera drift. The look is warm monochrome in the site's own tones; only
velvet (her concert dress, the wreath at home) and brass (where light blooms) keep any colour, under a soft
halation, a vignette and fine grain. The wide cut is 1920×996, the phone cut (portrait screens,
`max-aspect-ratio: 4/5`) 1080×1820, reframed on her. The film always fits the first screen whole: full width where
that fits, otherwise as tall as the screen, centred on ink, which its vignette fades into. The film is silent. The
H1 is for screen readers (her name is in the nav); the one control is pause / play. With reduced motion the film
waits on a still of her hands rising off the keys until asked.

Nothing plays on arrival. The nav's *Hear me play* pill (`src/components/SoundToggle.jsx`) starts her at-home grand
recording (`public/media/audio/at-home-grand.webm|.m4a`, the cleanest of the eight recordings) inside that click,
fading in over Largo; pressed again (*Pause*) it fades out. On phones the pill shows its three bars only. The piano
keeps playing from page to page, fades out while a film is open in the lightbox, rests 2.4 s between plays and
pauses in hidden tabs. Logic lives in `src/lib/sound.jsx`.

## Media

All images come from the performance videos in `../videos/`, except the portrait, which is built from the supplied
photograph in `../photos/`:

```bash
npm run media        # needs ffmpeg with libx264, libvpx-vp9, libopus, libwebp
```

| Output | What |
|---|---|
| `public/media/video/<slug>.mp4/.webm` | Each performance, H.264 + VP9, native size (all under 1080p), 30 fps max, lightly graded (−20% saturation, warm) |
| `public/media/video/hero-film{,-phone}.*` | The hero film (built in `../montage`, see above), silent, H.264 + VP9 |
| `public/media/video/hero-loop.*` | 7.5 s muted loop for the name in the hero, seamless crossfade, no audio track |
| `public/media/video/loops/*` | 6 s muted warm-monochrome 640x360 loop of every film (MP4 + WebM) for the home reel |
| `public/media/posters/*.webp` | Warm-monochrome stills: posters, hero, fermata |
| `public/media/posters/portrait{,-600}.webp` | The supplied photograph, cropped 4:5, in its original colour (1200 and 600 wide) |
| `public/media/og/selin-incekara-share.jpg` | 1200×630 share image |

Full performances load only when the lightbox opens (`preload="metadata"` on click). The reel's loops (about 100 KB
each) load when it first plays them. Images below the first screen are lazy.

## Facts and placeholders

Everything a visitor reads that is not yet known is written as `[bracketed]` text. Fill it in two files:

- `src/data/performances.js`: composer, work, venue and year for each film. The `hint` field holds what the video analysis found (key, metre, likely venue); it never renders.
- `src/data/site.js`: city, teacher, contacts, newsletter endpoint, social links, press kit.

Then search the source for remaining brackets: `grep -rn "\[" src --include=*.jsx`.

## Checks

```bash
node scripts/check-copy.mjs                                  # banned words, banned button labels, "!"
npm run build && (npx vite preview --port 4173 &) && node scripts/screenshots.mjs screenshots
```
