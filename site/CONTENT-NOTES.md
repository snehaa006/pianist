# Content notes: what the videos show, and what is still unknown

Most facts on the site come from the eight videos in `../videos/`. One photograph and a short first-person bio were
supplied later (October 2026; see below). No dates or press quotes have been supplied.
Nothing was guessed onto the site: anything not certain is a `[placeholder]`.

## The supplied photograph and bio

**Photograph** (`../photos/selin-incekara-austrian-master-classes.jpg`, 1200×1600, colour): Selin seated on the bench of
a grand piano, smiling, a man standing behind her. It is the Austrian Master Classes hall (same columns, stucco and
doors as the concert film) and the same polka-dot dress, so it was taken around that concert. It replaces the video
still as the 4:5 portrait on Home (About) and Biography, cropped to 4:5 and given the site's warm-monochrome grade
(`npm run media` rebuilds it). The original colour file is kept unchanged.

**Bio**, as supplied, in her words: 11 years old, lives in Istanbul, Türkiye, has played the piano for six years and has
taken part in several piano competitions. Where it went:
- The facts are in the third-person biography (`site.age`, `site.city`, `site.beginnings`, `site.competitions`).
- The first two sentences of her second paragraph are "A note from Selin Incekara" (`site.note`), word for word.
- Her last sentence ("…as I follow my passion for the piano!") is not quoted: "passion" and "!" are on the copy rules'
  banned list. What it says (more learning, more competitions) is in the biography as "hopes to enter more".

Still to confirm: who is standing behind her in the photo (the alt text reads `[Name]`), and which competitions she
has entered (names, years, results would make the bio more specific than "several").

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
| `grade-1-technical` | `WhatsApp Video 2026-10-06 at 14.23.15.mp4` (2:17) | LCM recorded exam, **Grade 1 technical work**: scales, broken chords and arpeggios, each named on camera (C major hands together, A minor, D major broken chords, C, F and D minor arpeggios). | Spoken throughout. Shown on Watch and in Past concerts; left out of Repertoire (not a piece). | High |

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

These feed the hero line ("Watch [Composer]'s [Work], filmed at an Austrian Master Classes concert in [Year]."), the featured film, the fermata caption, every card, the lightbox and the repertoire page.

### Site-wide (`src/data/site.js`)
| Field | Appears on |
|---|---|
| `[Teacher]`, `[School]` | Biography |
| `[Name]` in `portraitAlt` (the man in the photograph) | alt text of the portrait, Home and Biography |
| `age` (11, as supplied in October 2026; update on her birthday) | Home About screen, Biography |
| `from [earliest composer] to [latest composer]` | Home repertoire screen |
| Management `[Name], [Agency]` + `[email]` | Home Contact screen, Contact page |
| Press `[Name]` + `[email]` | same |
| Direct `[email]` | same |
| `newsletterAction` (mailing-list form endpoint) | both sign-up forms; until set, sign-ups are not stored |
| `socials` (Instagram, YouTube URLs) | footer; hidden until set |
| `pressKit` (PDF path) | Biography; hidden until set |

### Deployment
- `[Site URL]`: once the domain is known, make `og:image` in `index.html` an absolute URL (some platforms ignore relative share images).

## Things deliberately left out
- **Concert rows**: there are no dates, so the Concerts screen shows the approved empty state ("No public dates right now…" → Join the list).
- **Next season screen**: no project or date exists; it would duplicate the empty state.
- **Press quote**: none exists, so the fermata is a photograph only.
- **Repertoire filter chips** (Solo · Concertos · Chamber): every filmed piece is solo, so the filter would have nothing to sort. The OptionWheel dial lists the five pieces instead.
- **Past concert dates**: the "Past concerts" rows show `[DD]` / `[Month] [Year]` until the real dates are filled in (add a `date` to each film).
- **GhostCursor, GlowCursor and SwarmCursor**: no cursor effect; the hero glow was removed at the client's request.
- **Nav Tickets pill**: nothing is on sale; omitting it keeps one velvet action per viewport.
