# Content notes: what the videos show, and what is still unknown

Most facts on the site come from the eight videos in `../videos/`. One photograph and a short first-person bio were
supplied later (October 2026; see below). No dates or press quotes have been supplied.
Nothing was guessed onto the site: anything not certain is a `[placeholder]`.

## The supplied photograph and bio

**Photograph** (`../photos/selin-incekara-austrian-master-classes.jpg`, 1200×1600, colour): Selin seated on the bench of
a grand piano, smiling, a man standing behind her. It is the Austrian Master Classes hall (same columns, stucco and
doors as the concert film) and the same polka-dot dress, so it was taken around that concert. It is the landing page's
photograph (Home, first screen) and the portrait on Biography, cropped to 4:5 and shown in its original colour, with no
grade (`npm run media` rebuilds it). Home's About screen shows her silhouette at the grand piano at home instead (cut
from the at-home film), which turns into that film's frame under the pointer. The original file is kept unchanged.

**Bio**, in her own words: two paragraphs, kept exactly as she wrote them in `src/data/bio.js` (first person, her
spelling "İncekara", her punctuation). Never edit or rewrite them; `scripts/check-copy.mjs` skips that file because it
is her text, not site copy. Where it appears:
- Biography: both paragraphs as *[1] In her own words*, and one sentence of the second ("Every time I play, I feel
  like I can tell a story through music.") on its own, at poster size, as a quote.
- Home: the first paragraph on the About screen, the second as "A note from Selin Incekara".

The Biography cover's line, "Selin Incekara is 11, lives in Istanbul and has played the piano for six years.", is
taken from that bio (October 2026); change her age and years with it (`src/pages/About.jsx`). Every other picture on
Biography is a still from her films (`public/media/about/`), named for the moment in its alt text.

Still to confirm: who is standing behind her in the photo (the alt text reads `[Name]`).

## What each video contains

| Site slug | Source file | What it is | How we know | Confidence |
|---|---|---|---|---|
| `song-of-twilight` | `WhatsApp Video 2026-10-06 at 14.22.59.mp4` (1:45) | **Yoshinao Nakada (1923–2000): Song of Twilight**, from *Piano Pieces for Children*. London College of Music (LCM) recorded exam, **Grade 3, Performance List B**. Filmed at home on a red digital piano. | She says so on camera (speech transcribed); note analysis gives A major, matching published notes on the piece; the piece is on the LCM 2021–2024 Grade 3 List B. | High |
| `lcm-grade-1` | `WhatsApp Video 2026-10-06 at 14.23.31.mp4` (1:55) | LCM recorded exam, **Grade 1, Performance List B**. Filmed at home on a red digital piano. | Spoken introduction. The title and composer were not clear enough to transcribe: they sound like "Dusk… Mood" / "Dusk in the Wood" by "Frederick B…". | Exam and grade: high. Title: unknown |
| `austrian-master-classes` | `WhatsApp Video 2026-10-06 at 14.23.41.mp4` (1:37) | Concert performance at an **Austrian Master Classes** concert, in a Rococo hall with stucco and columns. Walk-on, bow, applause. | The roll-up banner on stage reads "austrian master classes · in concert" (amc logo). AMC concerts take place at Schloss Zell an der Pram (Upper Austria), a Cuvilliès castle whose hall matches. | Event: high. Hall: likely, confirm |
| `on-stage` | `WhatsApp Video 2026-10-06 at 14.22.40.mp4` (1:16) | Performance on a theatre stage (black drapes, grand piano, audience applause). | Visible on screen. | Venue unknown |
| `at-home-grand` | `WhatsApp Video 2026-10-06 at 14.22.50.mp4` (1:34) | Performance at home on a black grand piano, by a window. | Visible on screen. | Piece unknown |
| `dog-hungry` | `WhatsApp Video 2026-10-06 at 14.23.06.mp4` (1:11) | **Sonny Chua: Dog Hungry**. LCM recorded exam, **Grade 3, Performance List C**. Same room and dress as *Song of Twilight*. | Spoken introduction (heard as "Dog Hug by Sonny…"); "Dog Hungry" by Sonny Chua is on the LCM 2021–2024 Grade 3 List C. Note analysis: C minor. | High (confirm spelling) |
| `andante` | `WhatsApp Video 2026-10-06 at 14.23.23.mp4` (1:04) | **Charles Henry Wilton: Andante**. LCM recorded exam, **Grade 1, Performance List A**. Same session as the Grade 1 List B piece. | Spoken introduction (heard as "Andante by … Wilton"); an Andante by Charles Henry Wilton is in the LCM 2021–2024 Grade 1 handbook. Note analysis: G major. | Likely, confirm |
| `grade-1-technical` | `WhatsApp Video 2026-10-06 at 14.23.15.mp4` (2:17) | LCM recorded exam, **Grade 1 technical work**: scales, broken chords and arpeggios, each named on camera (C major hands together, A minor, D major broken chords, C, F and D minor arpeggios). | Spoken throughout. Shown on Watch; left out of Repertoire (not a piece). | High |

### The pieces as sound (Home's stairs and "Hear me play")
Each of the seven pieces (every film but the technical work) is also on the site as audio only, cut to the music:
the exam films lose her spoken introduction (the first 10–14 s), the two stage films their walk-on and applause. The
cut points (`scripts/process-media.sh`) were found from the loudness and the transcribed notes, not by ear; if a cut
clips a breath or a last chord, move it there. The stairs name each piece as the Repertoire dial does: its work once
known, otherwise where it was filmed, with `[Composer]` until it is filled in.

### Musical analysis of the three unnamed pieces (never shown on the site)
Notes were transcribed from the audio and analysed for key and texture. These are leads for you to confirm, not identifications:

- **on-stage**: D minor, fast, about 45 seconds of music, opening flourish in the upper register over tonic/dominant chords.
- **at-home-grand**: G minor with long passages in E-flat major; a waltz pattern in 3/4 (bass on the beat, two chords after).
- **austrian-master-classes**: E minor, flowing broken-chord figures, a middle phrase in B minor.

The keys fit several pieces in Burgmüller's *25 Études faciles, Op. 100* (No. 20 Tarentelle in D minor, No. 16 Douce plainte in G minor, No. 18 Inquiétude in E minor), but that is only a hypothesis. Please confirm with her teacher or the programme.

## Placeholders to fill

Edit `src/data/performances.js` (per film) and `src/data/site.js` (site-wide). Nothing else needs touching.

### Per film (`src/data/performances.js`)
| Film | Fields |
|---|---|
| austrian-master-classes | `[Composer]`, `[Lifespan]`, `[Work]`, `[Hall]` (likely Schloss Zell an der Pram, confirm), `[Year]` |
| on-stage | `[Composer]`, `[Lifespan]`, `[Work]`, `[Venue], [City]`, `[Year]` |
| at-home-grand | `[Composer]`, `[Lifespan]`, `[Work]`, `[Year]` |
| song-of-twilight | `[Year]` |
| lcm-grade-1 | `[Composer]`, `[Lifespan]`, `[Work]`, `[Year]` |
| dog-hungry | `[Lifespan]`, `[Year]` |
| andante | `[Lifespan]`, `[Year]` |
| grade-1-technical | `[Year]` |

These feed the hero line ("Filmed in concert at the Austrian Master Classes, [Year]." and the film its button opens), the fermata caption, every card, the lightbox and the repertoire page.

### Site-wide (`src/data/site.js`)
| Field | Appears on |
|---|---|
| `[Name]` in `portraitAlt` (the man in the photograph) | alt text of the photograph, Home (first screen) and Biography |
| `from [earliest composer] to [latest composer]` | Home repertoire screen |
| Management `[Name], [Agency]` + `[email]` | Contact page |
| Press `[Name]` + `[email]` | same |
| Direct `[email]` | same |
| `newsletterAction` (mailing-list form endpoint) | the sign-up form on Contact; until set, sign-ups are not stored |
| `socials` (Instagram, YouTube URLs) | footer; hidden until set |
| `pressKit` (PDF path) | Biography; hidden until set |

### Deployment
- `[Site URL]`: once the domain is known, make `og:image` in `index.html` an absolute URL (some platforms ignore relative share images).

## Things deliberately left out
- **Concerts screen** (Upcoming / Past concerts) and the Home **Book a concert** screen: removed from Home at the client's
  request. Contact details stay on the Contact page.
- **Mailing-list band** (Home and Contact, before the footer): removed at the client's request, so each page ends on
  the footer. The sign-up form stays on Contact, under the contact rows.
- **Next season screen**: no project or date exists.
- **Press quote**: none exists, so the fermata is a photograph only.
- **Repertoire filter chips** (Solo · Concertos · Chamber): every filmed piece is solo, so the filter would have nothing to sort. The OptionWheel dial lists the five pieces instead.
- **GhostCursor, GlowCursor and SwarmCursor**: no cursor effect; the hero glow was removed at the client's request.
- **Nav Tickets pill**: nothing is on sale; omitting it keeps one primary action per viewport.
