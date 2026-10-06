# Srinijakara: portfolio site

Vite + React static site built with the `/pianist` design system (`.claude/skills/pianist/`).
Tokens, base components, Bebas Neue and the client components (MaskedHeading, FoldText, GhostCursor)
are copied from the skill unchanged, except for one added prop on MaskedHeading (`maxFontSize`) so the name can fill the full width (the original caps type at 200px).

## Run

```bash
npm install
npm run dev          # local
npm run build        # → dist/ (static; every route gets its own index.html, plus 404.html)
npm run preview      # serve dist/ on :4173
```

Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3). Set the project root to `site/`, build command `npm run build`, output `dist`.

## Media

All images come from the performance videos in `../videos/`:

```bash
npm run media        # needs ffmpeg with libx264, libvpx-vp9, libopus, libwebp
```

| Output | What |
|---|---|
| `public/media/video/<slug>.mp4/.webm` | Each performance, H.264 + VP9, native size (all under 1080p), 30 fps max, lightly graded (−20% saturation, warm) |
| `public/media/video/hero-loop.*` | 7.5 s muted loop for the name in the hero, seamless crossfade, no audio track |
| `public/media/posters/*.webp` | Warm-monochrome stills: posters, hero, fermata, 4:5 portrait |
| `public/media/og/srinijakara-share.jpg` | 1200×630 share image |

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
