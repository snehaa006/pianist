---
name: pianist
description: Srinijakara design system. Use for anything built for Srinijakara, the concert pianist: website pages, sections, components, landing pages, press kits, social graphics, emails or copy. Applies the colour tokens, Bebas Neue typography, grid, components, client React components, motion, imagery direction and copy rules so every output matches. Trigger on /pianist or any request mentioning Srinijakara or her pianist portfolio site.
---

# /pianist: build anything for Srinijakara in her design system

Srinijakara is a professional pianist. Her site is premium, editorial and music-led. It reads like **a recital programme printed on ivory card, then lit for the stage**. Primary visual reference: the New York Philharmonic "Gustavo" pages (inspired by, never copied). Secondary references: 15 Refero DESIGN.md files, summarised in `references/sources.md`.

Whenever `/pianist` runs, build what the user asks for (a page, section, component, email, post, copy) **using this system and nothing else**.

## Workflow (every time)

1. **Read what the task needs** from this skill's own folder (all paths below are relative to the directory containing this SKILL.md, wherever it is installed: project `.claude/skills/pianist/`, global `~/.claude/skills/pianist/`, or an uploaded skill):
   - `references/design-system.md`: the full spec (palette, type, grid, radius, components, imagery, music motifs, motion, hover states, responsive). **Always read it.**
   - `references/copy-rules.md`: portfolio research plus copy rules plus banned words. **Read it whenever any text is written.**
   - `references/page-copy.md`: approved homepage copy and microcopy. Reuse it verbatim where it fits.
   - `references/components.md`: the client's 15 React components, their roles, presets and recipes. Read it before using any of them.
   - `references/sources.md`: what came from NY Phil and each DESIGN.md. Read it only when justifying a decision.
2. **Start from the assets, don't re-invent them:**
   - `assets/tokens.css`: CSS variables plus @font-face plus base styles (source of truth).
   - `assets/components.css`: buttons, nav, concert row, frames, quote, form, motifs, reveals.
   - `assets/tailwind-theme.css`: the same tokens for Tailwind v4 projects.
   - `assets/fonts/BebasNeue-Regular.woff2|.ttf` plus `OFL.txt`. Self-host them and copy them alongside the CSS.
   - `components/<Name>/`, `components/presets.js`, `components/pianist-overrides.css`.
   - `templates/homepage.html`: a working reference page (static, no build). Copy and adapt it.
3. **Copy the needed assets into the target project** (keep relative font paths working). Never hotlink fonts or stock images.
4. **Build.** Then run the checklist below before you call it done. If a headless browser (e.g. Playwright) is available, render the page at 1440px and 390px and look at it.

## Non-negotiables (the short version)

**Colour:** Ink `#0B0B0C` · Lacquer `#151517` · Graphite `#2A2A2E` · Stone `#8F897F` · Dust `#A8A196` · Felt `#6B665E` · Hairline `#DAD3C7` · Ivory `#F4EFE6` (default canvas) · Paper `#FBF8F3` · **Velvet `#7A1C2A`** (the single primary action) · Velvet-hover `#9A2636` · **Brass `#B8935A`** (ornament, on dark only) · Brass-hover `#D2B07A`. Never pure black or white, never saturated colours, never brass on ivory, one accent moment per viewport.

**Type:** Bebas Neue 400 for headings **and** body (client requirement). There is no bold, so hierarchy comes from size, tracking and colour. The H1 is the name `SRINIJAKARA` as an edge-to-edge wordmark. Body is 20px (never below 18px) at 1.32 line height and +0.035em tracking, with a 34ch measure and paragraphs of 45 words or fewer. Labels are 14px at +0.16em tracking.

**Space & grid:** 8px base. 12/8/4 columns. Margins clamp(16px, 4.5vw, 72px). Max width 1440. Each screen gets 96–192px of vertical padding.

**Shape:** 0 radius for images, cards, sections and inputs. 999px pill for every button, chip and toggle. 50% only for the play button and badge. 1px borders. No shadows: surfaces invert between ivory and ink instead.

**Motion:** legato `cubic-bezier(0.22,1,0.36,1)`. Tempo durations are Presto 150 · Allegro 300 · Andante 600 · Adagio 900 · Largo 1400ms. Arpeggio stagger is 60ms. At most one WebGL effect per viewport and one cursor per site, none on touch. Honour `prefers-reduced-motion`. No autoplay sound.

**Imagery:** the artist and the instrument, observed. Low-key, warm monochrome, cinematic crops, 0 radius, no stock. Use ink placeholders labelled `(Photograph: …)` until real photos arrive.

**Music motifs (sparingly):** opus tags `(Op. 01: Concerts)`, staff-line divider, 2–3 black-key rhythm divider/loader, programme-style lists, a fermata pause screen. No clef icons or note emoji.

**Copy:** one idea per screen. The first screen is the name, one dated current fact and one action. Headlines are 2–6 words, lead lines one sentence of 20 words or fewer. Buttons are verb + object ("Tickets", "Listen", "All concerts →"), never "Learn more", "Discover" or "Click here". Bio in third person. Borrowed praise only (real, attributed quotes). Put unknown facts in `[brackets]` and never invent them. Check every output against the banned-word list in `copy-rules.md` (no "passionate", "journey", "elevate", "captivating", "tapestry", "world-class"…).

**Client React components:** FoldText (headlines), MaskedHeading (hero name), CircularText (Listen badge), OptionWheel (repertoire), GooeyNav, BorderGlow (featured concert), MicroSlats, MoltenMetal, AeroShards, RippleDistortion, GhostCursor/GlowCursor/SwarmCursor (pick one), DepthText/TextPressure (404 only). Always spread `presets.<Name>` and gate with `allowFx()`.

## Homepage order (default information architecture)

Hero (name + next concert + Tickets) → Concerts → Listen → Watch → Repertoire → Fermata (quote/photo) → About → Note from the artist → Next season → Contact/newsletter → Footer (cropped wordmark). Copy for each screen is in `references/page-copy.md`.

## Ship checklist
- [ ] Only token colours. Velvet appears once per viewport. Brass only on ink/lacquer.
- [ ] Bebas Neue loaded (self-hosted), `font-weight: 400` everywhere, `font-synthesis: none`.
- [ ] H1 = SRINIJAKARA. One idea per screen. Schedule within one screen of the top.
- [ ] Radii are only 0, pill, or 50%. No box-shadows.
- [ ] Copy passes the copy-rules self-check: zero banned words, verb+object buttons, no invented facts.
- [ ] Contrast ≥ 4.5:1, visible focus, targets ≥ 48px, alt text describes the moment.
- [ ] Reduced motion and touch: effects off, content visible. No horizontal scroll at 360px.
- [ ] Rendered and looked at on desktop and mobile when tooling allows.
