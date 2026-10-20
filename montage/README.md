# Selin Incekara: films

Four edits from the eight performance videos in `../videos/` (the originals are never modified):

- **Reel** (`src/reel/`): 14.7 s on the closing two phrases of her at-home grand recording. A concert
  programme in motion: ivory and ink pages with an opus number and a bar line that fills as the music plays.
  On each downbeat the frames glide into a new layout (window, spread, triptych, a 15-frame contact sheet
  with one frame ringed in grease pencil, a portrait on ink, two cinemascope strips), footage changes
  behind rising masks, and the last page carries her name edge to edge over her final phrase at the grand.
  `ReelPhone` is the same reel laid out for a 9:16 phone screen (layouts per orientation in `LAYOUTS`,
  `src/reel/plan.js`): the triptych becomes three stacked bands, the contact sheet 3 × 5, the strips stack,
  and her name closes the film on two lines.
- **Vintage reel** (`src/reel/Vintage.jsx`): 15.5 s in black and white on the opening of the same recording,
  a waltz. A programme title card whose black-key ornament is played note by note, silent-film irises, a wipe
  in piano-key strips (two octaves, black keys standing over the seams), a gapless 3 × 3 grid that builds like
  a chord and divides into 4 × 4 before one frame opens onto the stage, and an end card. Film grain, gate
  weave, projector flicker, the odd speck of dust.
- **Film** (`src/edl.js`): 87 s, the long landing-page cut described below.
- **Hero film** (`scripts/hero-film.py`): 10 s, slow and silent, the site's opening screen (below).

### The site's hero film

`scripts/hero-film.py` makes the landing page's opening film: 10 s, silent, looping without a seam. Five moments,
each in slow motion (the 60 fps takes at half speed frame for frame; the 30 fps hall take motion-interpolated),
joined by one-second dissolves, each with a slow camera drift:

| Time | Shot | Source | What happens |
|---|---|---|---|
| 0:00 | window | at home, the grand (14.22.50, 5.5 s) | Her at the keys by the window |
| 0:01 | keys | the same take (40 s), closer | Her hands, the keyboard, the lid's reflection |
| 0:03 | hall | Austrian Master Classes (14.23.41, 84.6 s) | The polka-dot dress at the concert grand |
| 0:05 | stage | the theatre (14.22.40, 64.9 s) | The last chord; her hands rise off the keys in the dark |
| 0:07 | release | at home, the grand (90.4 s) | Her hands lift, she sits back; it dissolves into the first frame |

The grade maps brightness onto the site's palette (ink shadows, felt and stone mids, highlights held below ivory);
only velvet (where the source is pink or red) and brass (where light blooms) keep colour. A brass halation swells
through each dissolve, over a soft diffusion, a vignette into ink and fine grain. The shot list, framings and
grade are at the top of the script.

```bash
python3 scripts/hero-film.py                  # out/hero-film/wide.mp4 (1920x996) and phone.mp4 (1080x1820), ~10 min
python3 scripts/hero-film.py --cut wide --stills 0 4.5 6.6   # review stills → out/hero-film/stills/
bash scripts/encode-hero-film.sh              # → ../site/public/media/video/hero-film* and the posters
```

Needs Python 3 with NumPy and Pillow, and ffmpeg with libx264, libvpx-vp9 and libwebp.

### The earlier hero reels

The colour originals of the programme reel, before any grade, are kept here at full quality with their music:
`selin-incekara-reel-colour-web-1920x1080.mp4` and `selin-incekara-reel-colour-phone-1080x1920.mp4`.

`scripts/grade-reels.sh` builds hero videos from those originals (`hero-reel{,-phone}.*`), in their original colour
with no grade (only re-encoded for the web: silent, H.264 CRF 24 and VP9 CRF 35). The site no longer uses them; to
bring the reel back, run it and point `CUTS` in `../site/src/components/Hero.jsx` at `hero-reel`. `GRADE=silvertone`
brings back the earlier black-and-white look, made on the exported reels with iPhone's Silvertone filter and matched
from the exports into `grade/wide.cube` and `grade/phone.cube` (brightness → tone, within about 3/255). The 848×480
export itself is too small for a hero.

### Reels: rebuild

```bash
npm install && pip install rembg onnxruntime scipy numpy pillow
python3 scripts/grain.py                        # grain tiles
bash scripts/proxies.sh                         # graded proxies (incl. H3, the reel's opening phrase)
bash scripts/reel-audio.sh                      # both soundtracks (home grand: 76.96–91.70 s and 5.35–20.25 s)
COMP=Reel node scripts/render.mjs out/reel-master.mp4   # ~5 min
bash scripts/encode-reel.sh                     # out/web/: Instagram MP4, web MP4/WebM, poster
COMP=ReelPhone node scripts/render.mjs out/reel-phone-master.mp4   # the 9:16 cut, ~5 min
COMP=ReelVintage node scripts/render.mjs out/vintage-master.mp4   # ~7 min
bash scripts/encode-reel.sh vintage
```

## The film (87 s)

An 87-second film cut from all eight performance videos in `../videos/` (the originals are never modified).
Built with Remotion (picture, motion, type) and ffmpeg (proxies, soundtrack, web encodes).

## The film

| Time | Chapter | Source | What happens |
|---|---|---|---|
| 0:00 | Prelude | at home, the grand (14.22.50) | Opens as a thin band with her name; the band's edges are brass strings that ring with each note. It widens to the full frame on the second phrase. |
| 0:15 | Grade 1 | technical work (14.23.15) | The C major scale climbs; every second note the frame steps closer. |
| 0:20 | | Andante (14.23.23) | One unbroken move from her hands up to her face. |
| 0:24 | | Grade 1, List B (14.23.31) | A diptych in sync (her, her hands); the hands take the frame on the chord. |
| 0:31 | Grade 3 | Song of Twilight (14.22.59) | The frame closes to a single line ("Grade 3") and opens on the older girl in the next room. The last chord is held as a still. |
| 0:40 | | Dog Hungry (14.23.06) | The new section's downbeat cuts in on her hands; three angles of the same take lock in on the beat. Cut to black on the breath. |
| 0:45 | In concert | Austrian Master Classes (14.23.41) | Lights come up on the hall in silence; colour arrives as she plays. |
| 0:57 | On stage | theatre (14.22.40) | The hall goes dark; a brass waveform is drawn across the black and settles to the stage floor as the theatre lights up. The last chords, then her hands lift in slow motion (60 fps source) and the bow. |
| 1:15 | Home | the grand again | Her final phrase; she lifts her hands and sits back in slow motion. The band closes on her name. The last frame is the first frame, so it loops. |

Sound: every on-screen performance is heard in its own take. Pieces change only at a breath (found from the
recordings' spectra), each cue is loudness-matched to −19 LUFS, and the only overlap is a short fade. Free
moments (lights coming up, the bow, sitting back) carry their own room tone, applause or a ringing chord.

## Versions

| File (`out/web/`) | Use |
|---|---|
| `selin-incekara-film.mp4` | 1920×1080 H.264, the main landscape hero (about 18 MB) |
| `selin-incekara-film.webm` | the same in VP9, smaller where supported |
| `selin-incekara-film-720.mp4` | 1280×720 for slow connections |
| `selin-incekara-film-portrait.mp4` / `.webm` | 1080×1920 for phones: every shot reframed on her, split screens stacked |
| `*-poster.*` | the first frame (it is also the last, so the film loops seamlessly) |

The first frame works without sound: her name and the band of her at the grand.

## Rebuild

```bash
npm install
python3 scripts/grain.py         # grain tiles
bash scripts/proxies.sh          # graded 1080p proxies of only the windows used → public/proxies/
node scripts/audio.mjs           # soundtrack.wav + src/envelope.json (drives the strings)
node scripts/render.mjs          # out/master.mp4 (~25 min on 4 cores)
COMP=MontagePortrait node scripts/render.mjs out/master-portrait.mp4   # the phone cut
bash scripts/encode.sh           # out/web/: 1080p MP4, 720p MP4, WebM, poster
npx remotion studio src/index.jsx   # preview and scrub
node scripts/stills.mjs out/stills 0 12.5 40   # stills at film times, for review
```

The edit lives in `src/edl.js`: every shot (source time, framing, camera move, transition), every audio cue,
the band, the look and the labels. Change times there and re-run `audio.mjs` and `render.mjs`.
