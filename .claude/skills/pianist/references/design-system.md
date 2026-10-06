# Srinijakara: Design System

> **A recital programme printed on ivory card, then lit for the stage.**
> Piano-black lacquer and aged-ivory keys. One condensed typeface set like a concert poster. Hall-velvet for the one thing you should press. Pedal brass for ornament, only in the dark.

The tokens live in `assets/tokens.css` (CSS variables) and `assets/tailwind-theme.css` (Tailwind v4). This file says how to use them. Every value below matches those files. Treat the CSS as the source of truth if anything ever disagrees.

---

## 0. Principles (read first)

1. **The name is the headline.** "SRINIJAKARA" set huge, edge to edge, is the brand mark. No slogan competes with it.
2. **One idea per screen.** Each full-height section holds one message: one headline, one supporting line, at most one action.
3. **Binary surfaces.** Pages breathe by switching between ivory (`--color-ivory`) and black (`--color-ink`) full-bleed bands. Depth comes from swapping surfaces. Nothing is lifted with shadows.
4. **One typeface, one weight.** Bebas Neue 400 sets everything. Hierarchy comes from size, tracking, colour and space. Bold does not exist.
5. **Two shapes.** Sharp 0px for everything you look at (photos, cards, sections, inputs). Full pill for everything you press (buttons, chips, nav pills, toggles).
6. **One accent per viewport.** Velvet marks the single primary action. Brass is a decorative hairline or numeral, on dark surfaces only. Never both in one component.
7. **The music sets the timing.** Motion uses tempo names (Presto to Largo) and a legato ease: slow, singing, never bouncy.

---

## 1. Colour palette

| Token | HEX | Role | Contrast |
|---|---|---|---|
| `--color-ink` | `#0B0B0C` | Piano-black lacquer. Text on light, full-bleed stage sections, footer. Use it instead of `#000`. | 17.2:1 on ivory |
| `--color-lacquer` | `#151517` | Raised surface on ink: cards and panels inside dark sections. | |
| `--color-graphite` | `#2A2A2E` | 1px rules and dividers on dark. Pressed dark state. | |
| `--color-stone` | `#8F897F` | Tertiary/meta text on dark. | 5.67:1 on ink |
| `--color-dust` | `#A8A196` | Secondary text on dark. | 7.69:1 on ink |
| `--color-felt` | `#6B665E` | Muted text on light (hammer felt). Dates, captions, meta. | 4.97:1 on ivory |
| `--color-hairline` | `#DAD3C7` | 1px rules on light. Decorative only, never text. | 1.3:1 |
| `--color-ivory` | `#F4EFE6` | **Default canvas.** Aged key ivory. Never pure white. | |
| `--color-paper` | `#FBF8F3` | Alternate light band, input fill, text on velvet. | 9.78:1 on velvet |
| `--color-velvet` | `#7A1C2A` | **The one primary action** per viewport (Tickets, Listen). Text selection. Focus ring on light. | 9.05:1 on ivory |
| `--color-velvet-hover` | `#9A2636` | Hover/active of velvet. | 6.78:1 on ivory |
| `--color-brass` | `#B8935A` | Ornament **on dark only**: concert numerals, staff-line rules, the active nav dot, focus ring on dark. | 6.89:1 on ink · **2.49:1 on ivory, so never use it on light** |
| `--color-brass-hover` | `#D2B07A` | Brass hover on dark. | 9.59:1 on ink |

**Surface stack:** Ivory (L0) → Paper (L0-alt) → Ink (stage) → Lacquer (card on stage). No other backgrounds.

**Allowed overlays:** `--scrim` (ink, from 0% to 72%) over photographs, so ivory text stays readable at the bottom of a frame. No other gradients, except inside the WebGL components in `references/components.md`, and those use palette colours only.

**Never:** pure `#000000` or `#FFFFFF`. Saturated colours. Brass on ivory. Velvet as a background band. Coloured shadows or glows in the UI chrome.

---

## 2. Typography

**Family:** Bebas Neue Regular (Dharma Type, SIL OFL 1.1). Files: `assets/fonts/BebasNeue-Regular.woff2` and `.ttf`. It is an all-caps condensed display face with a single weight (400). The client specified it for headings **and** body.

**Using a display face for body text, which needs these rules:**
- Body is never smaller than **18px**. Default body size is 20px.
- Track it open: +0.035em at body, +0.04em at 18px, +0.16em on labels. Bebas is tight by default.
- Line height is 1.32 at body. Bebas has short caps, so tighter leading turns body text into a wall.
- Measure is `--measure: 34ch`. Paragraphs max out at about 45 words. If copy runs longer, split it into two screens or a list.
- `font-synthesis: none` and `font-weight: 400` everywhere. Browsers will otherwise fake a bold, and that looks broken.
- Lowercase input renders as caps. Write copy in sentence case anyway (it stays accessible to screen readers and survives a font swap), and let the font do the uppercasing. Don't add `text-transform` except on labels.

### Type scale

| Token | Size (fluid) | Line height | Tracking | Use |
|---|---|---|---|---|
| `wordmark` | clamp(88px, 21vw, 360px) | 0.80 | -0.01em | The name. Once per page, edge to edge. |
| `display` | clamp(64px, 10vw, 160px) | 0.84 | -0.005em | Hero statement, big concert date numerals |
| `h1` | clamp(48px, 6.2vw, 96px) | 0.90 | 0 | Screen headline (one per screen) |
| `h2` | clamp(36px, 4.2vw, 64px) | 0.95 | 0.005em | Section headline in dense pages |
| `h3` | clamp(28px, 2.6vw, 36px) | 1.00 | 0.01em | Card titles, concert city, album title |
| `h4` | 24px | 1.05 | 0.02em | Sub-items, composer names in repertoire |
| `lead` | clamp(22px, 1.9vw, 28px) | 1.18 | 0.025em | The one supporting sentence under a headline |
| `body` | 20px | 1.32 | 0.035em | Paragraphs |
| `body-sm` | 18px | 1.32 | 0.04em | Captions, programme notes, footer |
| `label` | 14px | 1.20 | 0.16em | Buttons, nav, meta tags, filter chips |
| `micro` | 12px | 1.20 | 0.20em | Opus tags, legal. Never for anything a user must read to act |

### Hierarchy without weight
- **Size jump:** neighbouring levels on the same screen differ by at least 1.6×. A headline next to a lead line should look like a poster next to a caption.
- **Colour step:** primary `--fg`, secondary `--fg-muted`. Use only two text colours per surface.
- **Tracking step:** labels go wide (0.16em). Display goes slightly tight.
- **Opus tags:** a parenthesised micro label above a headline, e.g. `(Op. 03: Recordings)`, in `--fg-muted`. It replaces the generic SaaS eyebrow.
- **Emphasis inside a line:** switch one or two words to `--fg-muted` (light) or `--color-brass` (dark). Never bold or italic. Bebas has neither.

---

## 3. Spacing & grid

**Base unit 8px**, with 4px as a half-step: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 192` (`--space-1` … `--space-11`).

| Context | Value |
|---|---|
| Screen (section) vertical padding | `--section-y`: clamp(96px, 14vh, 192px) |
| Page side margin | `--page-margin`: clamp(16px, 4.5vw, 72px) |
| Column gutter | `--gutter`: clamp(16px, 2vw, 24px) |
| Content max width | `--page-max`: 1440px (the wordmark and full-bleed photos ignore it) |
| Headline → lead line | 24–32px |
| Lead line → action | 32–48px |
| Card internal padding | 24px (32px on ≥1200px) |
| Inline element gap (chips, buttons in a row) | 8–12px |
| List row (concert, repertoire) height | min 88px desktop / 72px mobile |

**Grid**

| Breakpoint | Columns | Margin | Gutter |
|---|---|---|---|
| < 640 (mobile) | 4 | 16px | 16px |
| 640–899 (tablet) | 8 | 32px | 20px |
| 900–1199 (laptop) | 12 | 48px | 24px |
| ≥ 1200 (desktop) | 12 | 72px | 24px, max 1440 |

**Editorial placements (12-col):**
- Statement: headline spans cols 1–9. Lead line spans cols 1–6 (or 7–12 for the asymmetric split).
- Portrait split: image cols 1–7 full-bleed to the left edge, text cols 8–12.
- Concert list: date cols 1–2 · city/venue cols 3–6 · programme cols 7–10 · action cols 11–12.
- Recordings: 3-up grid of square covers, or 4-up on ≥1440.

---

## 4. Shape, radius & component sizing

| Element | Radius |
|---|---|
| Photographs, video, album covers, cards, sections, modals | **0** |
| Inputs, textareas, selects | **0** (1px border) |
| Buttons, filter chips, nav pills, toggles, tags | **999px** |
| Play button, circular "Listen" badge, nav active dot | **50%** |

Do not mix radii. There is no 8px or 24px "soft card". Corners are either sharp or a pill.

| Component | Height | Horizontal padding | Type |
|---|---|---|---|
| Button sm | 36px | 16px | label 14px |
| Button md (default) | 48px | 28px | label 14px |
| Button lg (hero) | 60px | 36px | label 16px / 0.14em |
| Filter chip | 36px | 16px | label 14px |
| Input | 48px | 16px | body-sm 18px |
| Nav bar | 72px (64px mobile) | `--page-margin` | label 14px |
| Play button | 72px circle (56px mobile) | | icon 20px |
| Icon stroke | 1.5px, 24px box, line icons only | | |
| Minimum touch target | 48 × 48px | | |

Borders are always 1px. The only 2px line is the focus outline.

---

## 5. Components

> Labels, nav and buttons use the `label` style (14px, 0.16em tracking). Copy follows `references/copy-rules.md`.

### 5.1 Navigation bar
- 72px high and transparent over the hero, with ivory text on the photo. Once the hero scrolls out (after about 80vh) it becomes solid `--bg` with a 1px `--rule` bottom border. The change takes `--dur-allegro`.
- Left: `SRINIJAKARA` at h4 size, tracking 0.12em (a small wordmark).
- Centre/right: five single-noun links at most: **Concerts · Listen · Repertoire · About · Contact**.
- Far right: one velvet pill, **Tickets** (or **Listen**, if no concert is on sale).
- Active link: a 6px brass dot (on dark) or ink dot (on light) centred 8px below the label. No underline bars.
- Mobile: name left and a "Menu" text button right. The menu opens a full-screen ink panel with links at h1 size, stacked, revealed with an arpeggio stagger. Optional component: `GooeyNav`, desktop only.

### 5.2 Buttons
| Variant | Rest | Hover | Pressed | Use |
|---|---|---|---|---|
| **Primary** | velvet fill, paper text, pill | `--color-velvet-hover`; arrow nudges 4px right | scale 0.98 | One per viewport: Tickets / Listen |
| **Primary on stage** | ivory fill, ink text | paper fill | scale 0.98 | The single action inside dark sections |
| **Secondary** | transparent, 1px `--fg` border, `--fg` text | fills `--fg`, text inverts to `--bg` (`--dur-allegro`) | scale 0.98 | Secondary actions: "All dates", "Biography" |
| **Text link** | `--fg` label, trailing `→` | a 1px underline draws left to right in 300ms, arrow moves 4px | | Tertiary, inline |
| **Play** | 72px circle, 1px ivory border, ▶ glyph | fills ivory, glyph turns ink; ring breathes 1.0→1.06 | | Video and audio previews |

Button text is a verb plus an object (see copy rules). Arrows are a typed `→`, not an icon font. Disabled state: 40% opacity, no hover.

### 5.3 Concert row (signature component)
```
| 14        | LONDON                  | Rachmaninoff · Piano Concerto No. 2   | Tickets → |
| NOV 2026  | Wigmore Hall            | with [Orchestra], [Conductor]         |           |
```
- Date: day number at `display` size (64–96px) in `--fg`, or **brass** on stage. Month and year as a `label` underneath.
- City in h3, venue in body-sm `--fg-muted`. Programme in body. The action is a text link, or a secondary pill when the date is on sale now.
- Rows are separated by 1px `--rule` lines that run edge to edge across the content width.
- Hover (pointer devices): the whole row's background shifts to `--bg-alt` and the date numerals slide 8px right (`--dur-andante`, legato).
- States: **Sold out** (label in `--fg-muted`, no link) · **Few seats** (opus tag in velvet) · **Past** (whole row at 55% opacity, in the archive only).
- The featured next concert can sit in a `BorderGlow` wrapper on stage, themed brass. That is the only glow allowed.

### 5.4 Recording card
- Square cover, 0 radius, no border or shadow. Title h3, label/year in `label`, `--fg-muted`.
- Hover: the cover scales 1.03 inside its frame (`overflow:hidden`, 600ms legato), and a 56px play circle fades in at the bottom-left.
- Action under the card: **Listen →**. Streaming platform choice goes in a small popover of text links, not a row of logos.

### 5.5 Repertoire index
- Grouped by composer. Composer name in h3, with lifespan as a `micro` tag `(1873–1943)`. Works listed in body, one per line, with a 1px rule between composers.
- Filter chips above: **All · Solo · Concertos · Chamber**. Active chip is filled `--fg` with inverted text; inactive is 1px outline.
- Optional: `OptionWheel` as the composer picker on desktop (see `references/components.md`).

### 5.6 Press quote
- One quote per screen, in `h1`/`display` size. It is the only place curly quotes appear as large brass glyphs (on stage), 1.5× the text size.
- Attribution: `label`, `--fg-muted`: `— PUBLICATION, YEAR`. A real, named source only. Never invent quotes.

### 5.7 Video feature
- Full-bleed 16:9 still with `--scrim`, the play button centred, and the piece title bottom-left in h3 with the composer as a `label`.
- On click, video opens in place (lightbox on ink, 0 radius, close "×" top-right with a 48px target). Never autoplay sound.

### 5.8 Bio block ("About")
- Split layout: a portrait (4:5) on the left at 0 radius, with text on the right. The first line is a `lead` sentence and is the only thing above the fold of that screen. The full bio sits behind **Read the biography →**.
- Downloadable press kit appears as a text link: **Press kit (PDF) →**.

### 5.9 Newsletter / contact
- Single input row: input (0 radius, 1px `--fg` border, paper fill) plus a primary pill attached on the right. On mobile they stack, both full-width.
- Labels sit above the field in the `label` style. No placeholder-only labels.
- Success state: the row is replaced by one line: "You're on the list. The next concert date comes to your inbox first."
- Contact page: separate rows for **Management**, **Press** and **Direct**, each with a name and email as a text link.

### 5.10 Footer
- Ink band. The wordmark at `display` size, cropped by the bottom edge (only the top 70% visible) as a closing gesture. Nav links, socials (as text: Instagram · YouTube · Spotify), and legal in `micro`.

### 5.11 Section divider: staff lines
- Five 1px rules, 6px apart, 120px wide, in `--rule` (light) or brass (dark). Centred or left-aligned with the content. Use at most once per page, as the transition into the press or repertoire screen.

---

## 6. Photography & imagery

- **Subject:** the artist and the instrument, observed. Hands in motion, the profile against the lid, the pause before the first note, the bow. No stock photos, no generic "piano keys close-up" filler, no sheet-music clip-art.
- **Light:** low-key, single-source, tungsten-warm. Deep blacks that melt into `--color-ink` so photos bleed into stage sections. Rim light on hair and hands.
- **Grade:** warm monochrome as the default (lifted blacks at about 4%, warm highlights). Colour is allowed for concert-hall and performance shots, desaturated about 20% and warm-shifted. Never cool or teal-orange.
- **Crop:** cinematic and asymmetric. The subject sits on a third, with negative space to one side where the headline lives. Common ratios: 16:9 hero, 4:5 portrait, 1:1 covers, 3:2 performance strip.
- **Treatment:** 0 radius, no borders, no frames, no rotation, no collage. Full-bleed or locked to the grid edge, flush with the margin or bleeding off the page.
- **On the image:** only the wordmark, one headline, or a play button. Always over `--scrim` or a naturally dark area.
- **Formats:** AVIF/WebP, `loading="lazy"` below the first screen, explicit width/height, and alt text that describes the moment ("Srinijakara at the keyboard, mid-phrase, eyes closed") rather than "pianist image".
- **Placeholder rule:** when real photos are missing, render an ink or lacquer block with a 1px graphite frame and a micro label `(Photograph: portrait, 4:5)`. Never hotlink stock.

---

## 7. Piano & music visual language

Use these motifs sparingly, one or two per page. They should read as craft details, not decoration.

| Motif | How |
|---|---|
| **Keyboard rhythm** | The 2–3 black-key grouping as a divider or loader: short ink/brass bars in the pattern `▮▮ ▮▮▮` (bar 10px wide × 40px tall, 6px gap, 18px gap between groups). Also used as the page-load indicator, lighting up key by key. |
| **Staff lines** | Five hairlines (see §5.11). |
| **Opus numbering** | Section tags read `(Op. 01: Concerts)`, `(Op. 02: Listen)`… Works and recordings carry real catalogue numbers in `micro`. |
| **Programme layout** | Concert and repertoire lists borrow from printed recital programmes: composer, work, and movements indented beneath. |
| **Dynamics as emphasis** | `pp` = muted text, `mf` = default, `ff` = display size. The markings never appear as literal UI text. They are a mental model for how loud each element should be. |
| **Fermata** | One deliberate empty screen-height pause (just a quote or just a photo) between dense sections. |
| **88** | Counts and grids may nod to 88 (for example, a keyboard-rhythm divider of exactly 88 bars on the 404 page). |
| **Tempo names** | Motion durations (§8). |

Never: treble-clef icons, music-note emoji, rainbow waveforms, piano-key borders around boxes.

---

## 8. Animation & motion

**Character:** legato. Things arrive slowly and settle softly, like a sustained chord. Nothing bounces, overshoots, or spins (except the slow `CircularText` badge).

| Token | Duration | Use |
|---|---|---|
| `--dur-presto` | 150ms | Colour/opacity hover, focus |
| `--dur-allegro` | 300ms | Buttons, underlines, chips, nav background |
| `--dur-andante` | 600ms | Card and image reveals, row hovers |
| `--dur-adagio` | 900ms | Headline reveals (FoldText / MaskedHeading) |
| `--dur-largo` | 1400ms | Hero entrance, page transitions |

Easing: `--ease-legato` cubic-bezier(0.22, 1, 0.36, 1) by default. `--ease-staccato` for exits. `--ease-rubato` for crossfades and loops.

**Patterns**
- **Arpeggio reveal:** siblings (list rows, cards, characters) enter with 60ms stagger, translateY 24px → 0 and opacity 0 → 1, triggered at 20% into the viewport, once.
- **Hero entrance (Largo):** photo fades from ink (1400ms). The wordmark rises from a mask, by letter (FoldText `hinge="bottom"` or MaskedHeading `reveal="rise"`). The lead line and button follow 300ms after.
- **Scroll:** native scroll. No scroll-jacking. Subtle parallax only on full-bleed photos (max 8% translate).
- **Page transitions:** ink curtain wipes up, 600ms in and 600ms out.
- **Sound:** silent by default. Any audio preview starts only on click, with a visible stop control.
- **Budget:** one WebGL/canvas effect per viewport, one cursor effect per site, none on touch devices.
- **Reduced motion:** `prefers-reduced-motion: reduce` turns off all reveals (content shows immediately), WebGL components render a static frame or the poster, and cursor effects are disabled. tokens.css already zeroes CSS durations. JS components must also be gated (see `references/components.md`).

---

## 9. Interaction & hover states

| Element | Hover (pointer: fine) | Focus-visible | Active |
|---|---|---|---|
| Primary pill | velvet → velvet-hover, arrow +4px | 2px velvet outline, 3px offset (brass on stage) | scale 0.98 |
| Secondary pill | fill inverts | same | scale 0.98 |
| Text link | underline draws L→R (scaleX 0→1, origin left, 300ms) | outline | colour to `--fg-muted` |
| Nav link | colour to `--fg-muted`, then back on active | outline | dot appears |
| Concert row | bg → `--bg-alt`, date slides 8px | outline around row | |
| Recording / photo | image scale 1.03 inside frame | outline on card | |
| Filter chip | border → `--fg`, text → `--fg` | outline | fills `--fg` |
| Play | fills ivory, glyph inverts | outline | scale 0.96 |
| Input | border → `--fg` (from `--fg-muted`) | 2px outline in `--focus` | |

- Cursor: default arrow. On stage sections, one optional cursor effect (`GhostCursor` themed ivory/brass) for desktop only.
- Touch devices get no hover-only information. Everything revealed on hover is also visible or tappable.
- Error state: a velvet 1px border and a body-sm velvet message below ("Add an email so we can reach you."). Never a red/green system palette.

---

## 10. Tone of voice

Full rules and the portfolio research are in `references/copy-rules.md`. In short:
- **Like a printed concert programme, spoken by a person.** Concrete, calm, assured.
- Third person for the bio. First person only in one short note from the artist ("A note from Srinijakara").
- Nouns and verbs over adjectives. Name the composer, the work, the hall, the date.
- One idea per screen. Headlines run 2–6 words. Lead lines are a single sentence of 20 words or fewer.
- No AI-sounding vocabulary (banned list in the copy rules).

---

## 11. Responsive behaviour

| | Mobile < 640 | Tablet 640–899 | Laptop 900–1199 | Desktop ≥ 1200 |
|---|---|---|---|---|
| Wordmark | 21vw, may wrap to 2 lines ("SRINI / JAKARA" hyphen-free split) | 21vw single line | single line | max 360px, single line |
| Hero | photo 100svh, text bottom-left over scrim | same | split allowed | split or full-bleed |
| Nav | name + Menu (full-screen panel) | same | full links | full links + Tickets pill |
| Concert row | stacked: date+city line, venue, programme, action full-width | 2-col (date / rest) | 4-col | 4-col |
| Recordings | 1-up, horizontal swipe rail (scroll-snap) | 2-up | 3-up | 3/4-up |
| Repertoire | accordion by composer | 2-col | 2-col + chips | 3-col + chips / OptionWheel |
| Section padding | 96px | 112px | 144px | up to 192px |
| Body text | 18–20px | 20px | 20px | 20px |
| WebGL/cursor FX | off (use poster/static) | off | on (one per viewport) | on |
| Buttons | full-width when alone in a block | auto | auto | auto |

Use `svh`/`dvh` for full-height screens. Never let the page scroll horizontally, and test at 360px. The only horizontal scroll is an intentional, snapping rail.

---

## 12. Accessibility checklist

- Text contrast is at least 4.5:1 (all token pairings above pass). Brass only on ink or lacquer.
- One `<h1>` per page (usually the wordmark, given `aria-label="Srinijakara"`). Logical h2/h3.
- WebGL canvases are `aria-hidden="true"`. Text effects keep the real text in the DOM (the packaged components already do this, or wrap them with an `sr-only` copy).
- All interactive targets are at least 48px. Visible focus everywhere.
- Media has captions and transcripts. Nothing autoplays with sound.
- `lang="en"` and real `<time datetime>` on concert dates.
