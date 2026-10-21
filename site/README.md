# Selin Incekara: portfolio site

Vite + React static site built with the `/pianist` design system (`.claude/skills/pianist/`).
Base components, Bebas Neue and the client components are copied from the skill unchanged, except for one added prop
on MaskedHeading (`maxFontSize`) so the name can fill the full width (the original caps type at 200px). The colours
are not the skill's: the site now runs a red poster theme (below), so `src/styles/tokens.css` and the palette in
`src/components/fx/presets.js` differ from the skill's copies.

## Theme: a red poster

After a red poster of a pianist (black shapes on red, cream keys). Tokens in `src/styles/tokens.css`:

| Token | Hex | Use |
|---|---|---|
| `--color-crimson` | `#B42F35` | the canvas (Home hero, About, repertoire band, Repertoire, Biography, Contact), the nav |
| `--color-crimson-deep` | `#9A262C` | the red at a poster's edges (`--vignette`), hover on red |
| `--color-oxblood` | `#6E0E12` | deep red surface (`.screen--oxblood`: the note from Selin) |
| `--color-ink` | `#0E0A0A` | headlines on red (`--fg-display`, large type only: 3.2:1), buttons on red, the ink stages |
| `--color-ivory` | `#F4E9D8` | key cream: running text, labels and links on red (5.15:1) and on ink |
| `--color-rose` | `#F5D9CF` | muted text on red (4.62:1) |
| `--color-scarlet` | `#E8524A` | the accent on ink only (5.38:1): accent words, numerals, rings, focus; it replaces brass |

Red screens get a fine grain and a deeper red toward the edges (`--grain`, `--vignette`). Ink stages stay for the
films, the mailing list, Watch and the footer; their primary button is a crimson pill.

## Where each client component lives

| Component | Place |
|---|---|
| MicroSlats | Behind the repertoire band on Home (oxblood hammers on the red) |
| MaskedHeading | Not used since the hero change (the name filled with video was slow to arrive); `hero-loop.*` media is kept if you want it back |
| FoldText | Every screen headline; the hinge changes per screen (bottom, top, left, right) |
| CircularText | Not used (the featured film after the hero, and its "WATCH • THE • FILM •" badge, were removed at the client's request) |
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

The films reel (`src/lib/flyIn.js`, Home's "On stage, and at home"): one pinned screen on the ink stage with all
eight films, each playing as a 6 s muted loop (`public/media/video/loops/`, made by `npm run media -- --loops`), and
her at the middle. Two words slide in from opposite sides. She rises out of the dark at the grand piano at home, lit
like a hologram (her cut-out, `public/media/cutouts/selin-grand.webp`, with a red glow, LED dots and scan lines); a
ring of the films comes in from the bottom left, far back and tilted so it reads as a thin ribbon, glides to the
middle, then swings in and settles round her at the height of the keys, seen from a little above, and turns: she
stands at the ring's centre in the same 3D scene, so the near films pass in front of her and the far ones behind.
Trails of light circle her on tilted orbits (`src/lib/trails.js`, two canvases: behind her and in front of her). The
ring pulls back to a ribbon at the top and sweeps off to the top right (the entrance and exit are the ones from before
she was added), she fades, the light goes out, and the films fly into a 4x2 grid one at a time, each from its own
side, swinging like a sheet of paper; red blinds close over the grid into the repertoire band. GSAP
ScrollTrigger, scrubbed, so scrolling back plays it in reverse; while pinned the ring also turns slowly by itself.
Only the loops that can be seen play. Wide screens (≥900px) with motion allowed; phones and reduced motion get the
headline and a plain grid of stills.

Keys into birds (`src/lib/flight.js`, `src/components/Flight.jsx`), after the Swell Season poster: a key lifts out of
a keyboard, tumbles, and opens into a bird (a swift) that flies off up the page; each key and each bird are the same
16-point outline, so one morphs into the other and the key's long sides become the wings. White keys make cream
birds, black keys ink ones, and a key grows back from below once its bird has gone. On the hero's full 88-key
keyboard (keys leave from its right side; moving the mouse along it sends keys up too). Canvas, running only on
screen and in a visible tab; with reduced motion it draws one still frame of birds already in flight.

The About screen's silhouette turns into her photograph under the pointer (`src/components/Compare.jsx`, after a
before-and-after slider): a cream line glides after the mouse, the silhouette to its left and the photograph it was
cut from (`public/media/cutouts/selin-grand-photo.webp`, same crop) to its right. It follows the mouse's position
across the whole page, held at the picture's edges, so the mouse need not be over the picture: with it on the text
the silhouette shows whole, and moving left across the screen wipes it to the photograph. Phones tap or drag;
keyboards use the slider (arrow keys).

## Run

```bash
npm install
npm run dev          # local
npm run build        # → dist/ (static; every route gets its own index.html, plus 404.html)
npm run preview      # serve dist/ on :4173
```

Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3). Set the project root to `site/`, build command `npm run build`, output `dist`.

## The hero and sound

The landing page is a still poster on the red (`src/components/Hero.jsx`): the supplied photograph of her at the
piano in the Austrian Master Classes hall (`posters/portrait*.webp`, in its original colour) stands on a full
keyboard that runs the width of the screen, and her name fills the column beside it in ink, each letter rising into
place. One fact and one action: "Filmed in concert at the Austrian Master Classes, [Year]." and *Watch the
performance*, which opens that concert's film. Keys on the right of the keyboard fly off as birds (above). On phones
the name comes first, then the photograph, the line, the button and the keyboard. There is no hero film any more
(the old one can still be cut with `../montage/scripts/hero-film.py`).

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
| `public/media/video/loops/*` | 6 s muted warm-monochrome 640x360 loop of every film (MP4 + WebM) for the home reel |
| `public/media/posters/*.webp` | Warm-monochrome stills: posters, hero, fermata |
| `public/media/posters/portrait{,-600}.webp` | The supplied photograph, cropped 4:5, in its original colour (1200 and 600 wide): the hero and Biography |
| `public/media/cutouts/selin-grand.webp` | Her at the grand piano at home, cut out of the film with alpha (606×464): the films ring's hologram, and the About silhouette (as a CSS mask over ink). Made by `python3 -I scripts/cutout.py <dist>`, see the script for the model |
| `public/media/cutouts/selin-grand-photo.webp` | The same frame, untouched, in the same crop (606×464): the photograph the About silhouette wipes to. Written by the same script |
| `public/media/og/selin-incekara-share.jpg` | 1200×630 share image: her silhouette on the red, her name in ink |

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
