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

Films flying in (`src/lib/flyIn.js`, Home's "At home, at the piano" grid): the grid pins under the nav while the six
films arrive one at a time as you scroll, each from its own side (top left from the top left, bottom middle straight
up, and so on), swinging and flexing like a sheet of paper before they settle. GSAP ScrollTrigger, scrubbed, so
scrolling back sends them out again. Wide screens (≥900px) with motion allowed; phones keep the plain reveal.

## Run

```bash
npm install
npm run dev          # local
npm run build        # → dist/ (static; every route gets its own index.html, plus 404.html)
npm run preview      # serve dist/ on :4173
```

Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3). Set the project root to `site/`, build command `npm run build`, output `dist`.

## Sound and the hero reel

The landing page opens on her reel, whole and uncovered under the nav (`src/components/Hero.jsx`): the
programme reel from `../montage`, in its original colour (no grade), on wide screens, its phone cut on portrait
screens (`max-aspect-ratio: 4/5`). Both encodes drop the reel's running header strip (her name, which repeated the
nav wordmark), so they are 1920×996 and 1080×1820. The reel always fits the first screen whole: full width where
that fits, otherwise as tall as the screen, centred on the reel's own paper colour so the margins read as the same
sheet. The reel is silent. The H1 is for screen readers (the reel carries her name); the one control is pause / play.
With reduced motion the reel waits on its contact-sheet page until asked.

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
| `public/media/video/hero-loop.*` | 7.5 s muted loop for the name in the hero, seamless crossfade, no audio track |
| `public/media/posters/*.webp` | Warm-monochrome stills: posters, hero, fermata |
| `public/media/posters/portrait{,-600}.webp` | The supplied photograph, cropped 4:5, in its original colour (1200 and 600 wide) |
| `public/media/og/selin-incekara-share.jpg` | 1200×630 share image |

Videos load only when the lightbox opens (`preload="metadata"` on click). Images below the first screen are lazy.

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
