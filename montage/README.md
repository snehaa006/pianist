# Selin Incekara: films

Two edits from the eight performance videos in `../videos/` (the originals are never modified):

- **Reel** (`src/reel/`): 14.7 s on the closing two phrases of her at-home grand recording. A concert
  programme in motion: ivory and ink pages with an opus number and a bar line that fills as the music plays.
  On each downbeat the frames glide into a new layout (window, spread, triptych, a 15-frame contact sheet
  with one frame ringed in grease pencil, a portrait on ink, two cinemascope strips), footage changes
  behind rising masks, and the last page carries her name edge to edge over her final phrase at the grand.
- **Film** (`src/edl.js`): 87 s, the long landing-page cut described below.

### Reel: rebuild

```bash
npm install && pip install rembg onnxruntime scipy numpy pillow
python3 scripts/grain.py                        # grain tiles
bash scripts/proxies.sh                         # graded proxies (incl. H3, the reel's opening phrase)
bash scripts/reel-audio.sh                      # soundtrack: the home grand, 76.96–91.70 s, at −14 LUFS
COMP=Reel node scripts/render.mjs out/reel-master.mp4   # ~5 min
bash scripts/encode-reel.sh                     # out/web/: Instagram MP4, web MP4/WebM, poster
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
