# Selin Incekara: portfolio site

Vite + React static site built with the `/pianist` design system (`.claude/skills/pianist/`).
Base components, Bebas Neue and the client components are copied from the skill unchanged, except for one added prop
on MaskedHeading (`maxFontSize`) so the name can fill the full width (the original caps type at 200px), and two on
OptionWheel: `scroll={false}` leaves the mouse wheel to the page (the dial then turns by click, drag and arrow keys) and
`ariaLabel` names it. The colours
are not the skill's: the site now runs a red poster theme (below), so `src/styles/tokens.css` and the palette in
`src/components/fx/presets.js` differ from the skill's copies.

## Theme: a red poster

After a red poster of a pianist (black shapes on red, cream keys). Tokens in `src/styles/tokens.css`:

| Token | Hex | Use |
|---|---|---|
| `--color-crimson` | `#B42F35` | the canvas (Home hero, the stairs, About, Repertoire, Biography, Contact), the nav |
| `--color-crimson-deep` | `#9A262C` | the red at a poster's edges (`--vignette`), hover on red |
| `--color-oxblood` | `#6E0E12` | deep red surface (`.screen--oxblood`: the note from Selin) |
| `--color-ink` | `#0E0A0A` | headlines on red (`--fg-display`, large type only: 3.2:1), buttons on red, the ink stages |
| `--color-ivory` | `#F4E9D8` | key cream: running text, labels and links on red (5.15:1) and on ink |
| `--color-rose` | `#F5D9CF` | muted text on red (4.62:1) |
| `--color-scarlet` | `#E8524A` | the accent on ink only (5.38:1): accent words, numerals, rings, focus; it replaces brass |

Red screens get a fine grain and a deeper red toward the edges (`--grain`, `--vignette`). Ink stages stay for the
films, the repertoire band on Home, the mailing list, Watch and the footer; their primary button is a crimson pill.

## Where each client component lives

| Component | Place |
|---|---|
| MicroSlats | Behind the repertoire band on Home (graphite hammers on the ink stage, lit scarlet as the swell passes) |
| MaskedHeading | Not used since the hero change (the name filled with video was slow to arrive); `hero-loop.*` media is kept if you want it back |
| FoldText | Every screen headline; the hinge changes per screen (bottom, top, left, right) |
| CircularText | Not used (the featured film after the hero, and its "WATCH • THE • FILM •" badge, were removed at the client's request) |
| RippleDistortion | Not used (removed from the fermata photo and the portrait at the client's request) |
| MoltenMetal | Mailing-list band (Home, Contact), under a 72% ink scrim |
| AeroShards | Watch header (WebGPU only; closes up without it) |
| GooeyNav | Watch filter: All · On stage · At home · Exams (chips on phones) |
| BorderGlow | Brass edge-light on the lead film of the Watch grid |
| OptionWheel | Repertoire dial with a detail panel (desktop); her pieces beside the stairs on Home (desktop, `scroll={false}`) |
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
side, swinging like a sheet of paper (the grid runs 12% wider than the text column, as far as half a page margin from
the screen's edges); red blinds close over the grid, and the piano-key stairs follow them up out of the red (below),
before the screen lets go into the repertoire band. GSAP ScrollTrigger, scrubbed, so scrolling back plays it in
reverse; while pinned the ring also turns slowly by itself. Only the loops that can be seen play. Wide screens (≥900px)
with motion allowed; phones and reduced motion get the headline and a plain grid of stills, then the stairs as a
screen of their own.

The stairs (`src/components/Stairs.jsx`, `src/lib/stairs.js`; Home, after the films), after the "See you on the
other side" linocut poster and a keyboard turned on its side: the keys come out of the screen's left edge one above
the other, each a step further out than the one above, so they climb from the floor to the upper left, low notes at
the bottom and high ones at the top. Cream keys, ink black keys at the back, and under the front of every step the ink
shadow of the one above, so the back reads as a keyboard and the front as stairs. In the films reel they build with
the scroll as the blinds close, the bottom step coming out as the lowest band shuts, then her pieces arrive on the
right: a dial of every piece she has on film (OptionWheel, as on Repertoire; a plain list on phones and touch), the
piece's composer and where it was filmed, *Play the piece* / *Pause* and *Watch the film*. Choosing a piece plays it
(the site sound, below): the stairs fold back into the wall from the top and build again on that piece's notes, each
piece its own flight (its white keys from its low notes to its high ones, so the steps and the black keys' places
change), and while it plays each key goes in, back toward the wall and darkening, for as long as she holds its note.
Nothing sounds until a piece is chosen or *Play the piece* is pressed. On phones the stairs stay under the nav while
the list scrolls beneath them, so a chosen piece is seen playing. With reduced motion the stairs stand still, built,
and the keys don't move with the music.

The Biography page ends on a keyboard that turns into a city (`src/components/Skyline.jsx`, after a poster the client
supplied): under the footer's wordmark the keys run toward you in perspective, and at their far end every white key
rises into a tower (flat roofs, aerials, setbacks, sloped tops, roof blocks), cream on the ink, shading where the
towers meet the keys. There the footer is exactly one screen under the nav bar: links, wordmark, then the city
filling the rest, edge to edge and down to the bottom of the page (on phones it stays lower, under a taller sky). One
SVG from a fixed seed, sized by that height and drawn a screen's width further either side, so wide screens see more
keys and narrow ones the middle. The towers grow up out of the keys as it arrives, from the middle outward (none of
that with reduced motion). Only on /about; the other pages keep the plain footer.

Keys into birds (`src/lib/flight.js`, `src/components/Flight.jsx`), after the Swell Season poster: a key lifts out of
a keyboard, tumbles, and opens into a bird (a swift) that flies off up the page; each key and each bird are the same
16-point outline, so one morphs into the other and the key's long sides become the wings. White keys make cream
birds, black keys ink ones, and a key grows back from below once its bird has gone. On the hero's full 88-key
keyboard (keys leave from its right side; moving the mouse along it sends keys up too). Canvas, running only on
screen and in a visible tab; with reduced motion it draws one still frame of birds already in flight.

The About screen's silhouette turns into her photograph under the pointer (`src/components/Compare.jsx`, after the
products page wipe on the MCIL site): a 2px cream line with a lone chevron trails the mouse, the photograph it was cut
from (`public/media/cutouts/selin-grand-photo.webp`, same crop) to its left and the silhouette to its right. It starts
halfway and follows the mouse's position across the whole page, held at the picture's edges, so the mouse need not be
over the picture; the chevron points at the side with more to give. Phones show the silhouette until a tap or drag;
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
fading in over Largo; pressed again (*Pause*) it fades out. On phones the pill shows its three bars only. Choosing a
piece on the stairs plays that piece instead, from its beginning (the one playing fades out over Allegro first), and
the pill then pauses and resumes that one. The piano keeps playing from page to page, fades out while a film is open
in the lightbox, rests 2.4 s between plays (the same piece again) and pauses in hidden tabs. Logic lives in
`src/lib/sound.jsx`; the pieces' files in `src/lib/tracks.js`.

Every piece she has on film is there as audio only (`public/media/audio/<slug>.webm|.m4a`), cut to the music: no
spoken exam introduction, walk-on or applause, the last chord left to ring, all at -20 LUFS so one is as loud as the
next (`npm run media -- --audio`; the cut points are in `scripts/process-media.sh`).

While a piece plays, the hero keyboard and the stairs play along: each key goes down (or in) and darkens (rose on the
cream keys, graphite on the black) for as long as she holds its note, lighter for softer notes. The notes come from
the recordings themselves (`public/media/audio/<slug>.notes.json`, 154 to 852 notes a piece, transcribed by Spotify's
Basic Pitch with `scripts/notes.py`; rerun it for a piece if its audio changes), read against the audio's own clock
(`useSound().playhead`). A keyboard shorter than a piece's range plays the notes beyond it an octave or more in. Keys
that are sounding never fly off as birds; with reduced motion the keys stay still.

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
| `public/media/audio/<slug>.webm/.m4a` | Each piece as audio only, cut to the music, -20 LUFS (Opus 96k + AAC 128k): the site sound and the stairs (`--audio` encodes these alone) |
| `public/media/audio/<slug>.notes.json` | The notes she plays in each piece, for the keys that play along. Made by `python3 -I scripts/notes.py [slug …]`, see the script for the model |

Full performances load only when the lightbox opens (`preload="metadata"` on click). The reel's loops (about 100 KB
each) load when it first plays them. A piece's audio (0.6 to 1.6 MB) loads when it is first played, its notes (under
20 KB) when the stairs first show it. Images below the first screen are lazy.

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
