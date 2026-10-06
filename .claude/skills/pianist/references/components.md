# React Components (client-supplied, packaged for the Srinijakara system)

All 15 components the client added (`components.txt/` in the repo) are packaged under `.claude/skills/pianist/components/<Name>/` as `<Name>.jsx` + `<Name>.css`. The CSS was split out of the comment blocks that were appended to each original file. The originals carried `.tsx`/`.ts` extensions but contain untyped JSX, so they are shipped as `.jsx` (rename to `.tsx` and add prop types if the project is strict TypeScript). Every file was syntax-checked with esbuild.

**Always do this when using one:**
1. Copy the component folder into the project (e.g. `src/components/fx/<Name>/`).
2. Import `assets/tokens.css` once globally, then the component CSS, then `components/pianist-overrides.css`.
3. Spread the on-brand preset: `import { presets, allowFx } from './presets'` → `<FoldText {...presets.FoldText} text="Hear her live" />`.
4. Gate motion-heavy components: `{allowFx() && <GhostCursor {...presets.GhostCursor} />}`. For layout-critical ones (MaskedHeading, FoldText), pass a static fallback when `prefers-reduced-motion` is set.
5. Respect the budget: **one WebGL/canvas effect per viewport, one cursor effect per site, none on touch.**

## Dependencies
| Package | Needed by |
|---|---|
| `react` ≥ 18 (all are `'use client'`, so they work in Next.js App Router) | all |
| `gsap` (+ `ScrollTrigger`) | FoldText, MaskedHeading |
| `motion` (`motion/react`) | CircularText |
| `three` | GhostCursor |
| `ogl` | GlowCursor, RippleDistortion, SwarmCursor, MicroSlats, MoltenMetal |
| `vgpu` (WebGPU helper; needs a WebGPU-capable browser) | AeroShards |

## Catalogue: what each one is for in this brand

| Component | Role on the site | Where it belongs | Rule |
|---|---|---|---|
| **FoldText** | Default headline reveal: letters unfold on a bottom hinge as you scroll in | Every screen headline (h1/h2) | `trigger="scroll"`, once. Adagio timing via preset |
| **MaskedHeading** | The name filled with performance video/photo (hands on keys, warm mono) | Hero wordmark only, once per site | `tag="h1"`, `grayscale`, poster image required. Reduced motion → plain ink wordmark |
| **CircularText** | Slow-spinning "LISTEN • LISTEN •" badge around a play button | Listen screen, album hero | `spinDuration` ≥ 25, `onHover="slowDown"`; never `goBonkers` |
| **OptionWheel** | Composer picker that scrolls like a dial | Repertoire page (desktop ≥ 900px) | Silent (`soundUrl=""`). Mobile → accordion |
| **GooeyNav** | Section switcher with brass/ivory particles | Optional desktop nav on stage (ink) headers; or Concerts/Past toggle | Stage sections only; `items=[{label, href}]` |
| **BorderGlow** | Brass edge-light on the featured next concert | One card on a stage section | Preset sets radius 0, brass hues |
| **MicroSlats** | Rows of slats like piano hammers rising and falling | Background of the Listen or Repertoire stage band | `preset="swell"`, graphite + brass glint, on ink |
| **MoltenMetal** | Slow brass-and-ink liquid wash | Album launch / "Next season" stage band | `colorMode="ember"`, low speed. Never behind body text without a 72% ink scrim |
| **AeroShards** | Drifting satin shards (WebGPU) | Optional hero atmosphere for a launch page, right placement | Heaviest component: feature-detect `navigator.gpu`, pass `onError` to fall back to a still |
| **RippleDistortion** | Water-ripple under the cursor on a grayscale portrait | About portrait or Fermata photo | `grayscale`, brass tint 0.08, `trigger="hover"` |
| **GhostCursor** | Soft ivory smoke trail | **Default site cursor** (desktop, stage sections) | Choose ONE of Ghost/Glow/Swarm |
| **GlowCursor** | Brass light trail, wraps children | Alternative cursor for a single dark landing page | Wraps content: `<GlowCursor>{children}</GlowCursor>` |
| **SwarmCursor** | Small ivory particles that follow the pointer, wraps children | Alternative cursor; playful pages (404) | `scatterOnClick={false}` |
| **DepthText** | Extruded 3D letters | 404 page "404" or a single numeral (e.g. "88") | Never for the name or headlines |
| **TextPressure** | Letters react to cursor distance | 404/easter egg only | Needs a variable font for width/weight; with Bebas only `scale`/`alpha` work. Prefer FoldText |

## Recipes

**Hero (Screen 1)**
```jsx
<section className="stage hero">
  {allowFx()
    ? <MaskedHeading {...presets.MaskedHeading} text="Srinijakara" src="/media/hands-loop.mp4" poster="/media/hands.jpg" />
    : <h1 className="wordmark">Srinijakara</h1>}
  <p className="lead">Next: Rachmaninoff's Piano Concerto No. 2, [Venue], [City], [Date].</p>
  <a className="btn btn--primary-stage" href="/concerts">Tickets <span aria-hidden>→</span></a>
</section>
```

**Screen headline**
```jsx
<h2 className="h1"><FoldText {...presets.FoldText} text="Hear her live" /></h2>
```

**Featured concert on stage**
```jsx
<BorderGlow {...presets.BorderGlow}><ConcertRow featured {...nextConcert} /></BorderGlow>
```

**Site cursor**
```jsx
{allowFx() && <GhostCursor {...presets.GhostCursor} />}
```

## Don'ts
- Don't keep the components' original default colours (purples `#7c3aed`, `#A855F7`, cyan `#67E8F9`, pink `#FF9FFC`). Always spread `presets`.
- Don't stack two canvas effects in one viewport, or a cursor plus a WebGL background on the same screen on mobile.
- Don't use weight props above 400. Bebas Neue will fake-bold and smear.
- Don't put text effects on body copy. They are for headlines, numerals and badges only.
- Don't enable component sounds.
