# Content notes: what the videos show, and what is still unknown

Most facts on the site come from the videos in `../videos/`. One photograph and a short first-person bio were supplied
later (October 2026), then her photographs, diplomas, teachers and three of her pieces (27 October 2026; see below). No
press quotes have been supplied.
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
- Home: both paragraphs together on the About screen, signed, with her teachers under them (they were two screens
  until October 2026: the About screen and "A note from Selin Incekara").

The Biography cover's line, "Selin Incekara is 11, lives in Istanbul and has played the piano for six years.", is
taken from that bio (October 2026); change her age and years with it (`src/pages/About.jsx`).

Who is standing behind her is not known (October 2026), so the alt text says "a man".

## Supplied 27 October 2026: photographs, diplomas, teachers, pieces

**Teachers** (`src/data/site.js`, shown on Home's About screen and under her words on Biography): piano, Eser Bilgeman;
solfège ("solfej"), Eser Tiryakioglu, spelled as the client gave it.

**Photographs** (`../photos/WhatsApp Image 2026-10-27 at 16.18.*.jpeg`, kept unchanged; `npm run media -- --photos`
makes the WebPs in `public/media/photos/`, original colour, slugs in `scripts/process-media.sh`). Every one is on the
site (`src/data/photos.js` has the alt text):
- Diplomas, on Home's *Prizes* screen and Biography's *[4] Prizes and certificates* (`src/data/awards.js`):
  - Ravel Award International Music Competition: **Gold Prize**, category piano, age group C, Gdańsk, Poland, 16 October 2026 (16.18.05).
  - Piano Competition Online, 17th edition (international competition for pianists): **Gold Prize**, category III, Gdańsk, Poland, 16 October 2026 (16.18.06).
  - Her holding a University of West London certificate (the home of London College of Music exams) marked
    **Distinction** (16.18.22). Its grade and year are too small to read and the client does not know them, so the
    site gives neither.
- Biography cover, beside the portrait: at a piano strung with lights (16.18.24), beside a grand in a studio (16.18.14).
- Biography *[1] In her own words*, the photo-booth strip: 16.18.10, 16.18.35, 16.18.25.
- Biography *[2] Six years at the piano*: with a bouquet, younger (16.18.19), on the stairs at Christmas (16.18.08), on
  a theatre stage (16.18.07), Decollage Art Space (16.18.28, its sign is in the picture), then the Austrian Master Classes portrait.
- Biography *[5] Recital days*, the group photographs: 16.18.12, 16.18.15, 16.18.13, 16.18.20, 16.18.17.

Nobody but Selin is named: who the adults with her are is not known (the client asked for them simply as pictures),
so the alt text describes them ("a woman", "two women"). The Biography's film stills (`public/media/about/`) are no longer shown; `npm run media -- --about` still cuts them.

**The new video** (`../videos/WhatsApp Video 2026-10-27 at 16.18.32.mp4`, 0:11, sent among the photos): the same
Austrian Master Classes performance as `austrian-master-classes`, from another phone across the hall. Same pink
polka-dot dress, and its notes are that film's opening, note for note. On the site as `austrian-master-classes-wide`
(Watch, the Home reel, the lightbox); left out of Repertoire and the site sound because it is not another piece.

**Her pieces**, named by the client:
- **Pyotr Ilyich Tchaikovsky: Waltz, Op. 39 No. 9** (*Album for the Young*, E-flat major, 3/4) is `at-home-grand`: her
  only waltz on film, and it opens in E-flat major with a C minor middle section.
- **Carl Albert Löschhorn: Study in D minor, Op. 65 No. 40** (an Allegro) is `on-stage`: her only film in D minor, fast,
  about 50 seconds of music.
- **Joseph Haydn: Sonata in G major, Hob. XVI:G1, Finale (Presto)** is in none of the films. G major is not the key of
  any piece still unnamed (the Austrian Master Classes piece is in E minor, the Grade 1 List B piece in C major), so it
  is listed on Repertoire as not on film yet (`unfilmed` in `src/data/performances.js`).

The first two are matched by key and metre, not by ear against a score: confirm with her teacher.

## What each video contains

| Site slug | Source file | What it is | How we know | Confidence |
|---|---|---|---|---|
| `song-of-twilight` | `WhatsApp Video 2026-10-06 at 14.22.59.mp4` (1:45) | **Yoshinao Nakada (1923–2000): Song of Twilight**, from *Piano Pieces for Children*. London College of Music (LCM) recorded exam, **Grade 3, Performance List B**. Filmed at home on a red digital piano. | She says so on camera (speech transcribed); note analysis gives A major, matching published notes on the piece; the piece is on the LCM 2021–2024 Grade 3 List B. | High |
| `lcm-grade-1` | `WhatsApp Video 2026-10-06 at 14.23.31.mp4` (1:55) | LCM recorded exam, **Grade 1, Performance List B**. Filmed at home on a red digital piano. | Spoken introduction. The title and composer were not clear enough to transcribe: they sound like "Dusk… Mood" / "Dusk in the Wood" by "Frederick B…". | Exam and grade: high. Title: unknown |
| `austrian-master-classes` | `WhatsApp Video 2026-10-06 at 14.23.41.mp4` (1:37) | Concert performance at an **Austrian Master Classes** concert, in a Rococo hall with stucco and columns. Walk-on, bow, applause. | The roll-up banner on stage reads "austrian master classes · in concert" (amc logo). AMC concerts take place at Schloss Zell an der Pram (Upper Austria), a Cuvilliès castle whose hall matches. | Event: high. Hall: likely, confirm |
| `on-stage` | `WhatsApp Video 2026-10-06 at 14.22.40.mp4` (1:16) | **Carl Albert Löschhorn (1819–1905): Study in D minor, Op. 65 No. 40**. Performance on a theatre stage (black drapes, grand piano, audience applause). | Piece named by the client (October 2026); her only D minor film. | Piece: likely, confirm. Venue unknown |
| `at-home-grand` | `WhatsApp Video 2026-10-06 at 14.22.50.mp4` (1:34) | **Pyotr Ilyich Tchaikovsky (1840–1893): Waltz, Op. 39 No. 9**, from *Album for the Young*. At home on a black grand piano, by a window. | Piece named by the client (October 2026); her only waltz on film, in its key. | Likely, confirm |
| `austrian-master-classes-wide` | `WhatsApp Video 2026-10-27 at 16.18.32.mp4` (0:11) | The Austrian Master Classes performance's opening, from across the hall. | Same dress and hall; the notes match the concert film's first bars. | High |
| `dog-hungry` | `WhatsApp Video 2026-10-06 at 14.23.06.mp4` (1:11) | **Sonny Chua: Dog Hungry**. LCM recorded exam, **Grade 3, Performance List C**. Same room and dress as *Song of Twilight*. | Spoken introduction (heard as "Dog Hug by Sonny…"); "Dog Hungry" by Sonny Chua is on the LCM 2021–2024 Grade 3 List C. Note analysis: C minor. | High (confirm spelling) |
| `andante` | `WhatsApp Video 2026-10-06 at 14.23.23.mp4` (1:04) | **Charles Henry Wilton: Andante**. LCM recorded exam, **Grade 1, Performance List A**. Same session as the Grade 1 List B piece. | Spoken introduction (heard as "Andante by … Wilton"); an Andante by Charles Henry Wilton is in the LCM 2021–2024 Grade 1 handbook. Note analysis: G major. | Likely, confirm |
| `grade-1-technical` | `WhatsApp Video 2026-10-06 at 14.23.15.mp4` (2:17) | LCM recorded exam, **Grade 1 technical work**: scales, broken chords and arpeggios, each named on camera (C major hands together, A minor, D major broken chords, C, F and D minor arpeggios). | Spoken throughout. Shown on Watch; left out of Repertoire (not a piece). | High |

### The pieces as sound (Home's stairs and "Hear me play")
Each of the seven pieces (every film but the technical work) is also on the site as audio only, cut to the music:
the exam films lose her spoken introduction (the first 10–14 s), the two stage films their walk-on and applause. The
cut points (`scripts/process-media.sh`) were found from the loudness and the transcribed notes, not by ear; if a cut
clips a breath or a last chord, move it there. The stairs name each piece as the Repertoire dial does: its work once
known, otherwise where it was filmed, with `[Composer]` until it is filled in.

### Musical analysis of the pieces still unnamed (never shown on the site)
Notes were transcribed from the audio and analysed for key and texture. These are leads for you to confirm, not identifications:

- **austrian-master-classes** (and its second angle): E minor, flowing broken-chord figures, a middle phrase in B minor.
  It opens on broken E minor chords with E above, then a C major chord, rising through A, F♯ and D to an A♯ that
  leads to B. The key fits Burgmüller's Inquiétude (*25 Études faciles, Op. 100*, No. 18), but that is only a
  hypothesis. Please confirm with her teacher or the programme.
- **lcm-grade-1**: C major, slow and quiet over a low C (see the table above).

## Placeholders to fill

Edit `src/data/performances.js` (per film) and `src/data/site.js` (site-wide). Nothing else needs touching.

### Per film (`src/data/performances.js`)
| Film | Fields |
|---|---|
| austrian-master-classes and austrian-master-classes-wide | `[Composer]`, `[Lifespan]`, `[Work]` (once, in `amcPiece`), `[Hall]` (likely Schloss Zell an der Pram, confirm), `[Year]` |
| on-stage | `[Venue], [City]`, `[Year]` |
| at-home-grand | `[Year]` |
| song-of-twilight | `[Year]` |
| lcm-grade-1 | `[Composer]`, `[Lifespan]`, `[Work]`, `[Year]` |
| dog-hungry | `[Lifespan]`, `[Year]` |
| andante | `[Lifespan]`, `[Year]` |
| grade-1-technical | `[Year]` |

These feed the hero line ("Filmed in concert at the Austrian Master Classes, [Year]." and the film its button opens), the fermata caption, every card, the lightbox and the repertoire page.

### Site-wide (`src/data/site.js`)
| Field | Appears on |
|---|---|
| `repertoireRange`, now "from Haydn to Sonny Chua" (Haydn, born 1732, is the earliest composer she plays; Sonny Chua, a composer working today, the latest) | Home repertoire screen |
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
