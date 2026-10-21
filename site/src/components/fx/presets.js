// Selin Incekara on-brand defaults for the packaged React components.
// Usage: <GhostCursor {...presets.GhostCursor} />  (spread first, then override per instance)
// Colours are the design tokens from assets/tokens.css, written as literals because
// WebGL shaders cannot read CSS variables.

export const palette = {
  ink: '#0E0A0A',
  lacquer: '#1A1213',
  graphite: '#3A2A2B',
  dust: '#BDB0A0',
  felt: '#6B5E58',
  ivory: '#F4E9D8',
  paper: '#FBF4EA',
  crimson: '#B42F35',
  crimsonDeep: '#9A262C',
  oxblood: '#6E0E12',
  rose: '#F5D9CF',
  scarlet: '#E8524A',
  scarletHi: '#F06A5A'
};

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isTouch = () =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Gate any cursor / WebGL effect with this: render only when it returns true.
export const allowFx = () => !reduceMotion() && !isTouch();

export const presets = {
  // ---- Typography effects (real text stays in the DOM) ----
  FoldText: {
    hinge: 'bottom',
    duration: 0.9,          // Adagio
    stagger: 0.06,          // Arpeggio
    ease: 'expo.out',       // closest GSAP ease to --ease-legato
    perspective: 900,
    creaseShading: 0.35,
    trigger: 'scroll',
    fontWeight: 400,        // Bebas Neue has one weight
    color: palette.ink,
    style: { fontFamily: "'Bebas Neue', sans-serif", lineHeight: 0.9 }
  },
  MaskedHeading: {
    tag: 'h1',
    mediaType: 'video',     // or 'image' with a warm-monochrome portrait
    grayscale: true,
    brightness: 0.95,
    saturation: 0.8,
    reveal: 'rise',
    duration: 1.4,          // Largo
    stagger: 0.06,
    trigger: 'view',
    align: 'left',
    weight: 400,
    tracking: -0.01,
    lineHeight: 0.8,
    parallax: 12,
    drift: 8,
    style: { fontFamily: "'Bebas Neue', sans-serif" }
  },
  CircularText: {
    text: 'LISTEN • LISTEN • LISTEN • ',
    spinDuration: 30,       // slow, never frantic
    onHover: 'slowDown'     // never 'goBonkers'
  },
  DepthText: {
    faceColor: palette.ivory,
    depthColor: palette.scarlet,
    layers: 18,
    depth: 1.6,
    tilt: 4,
    autoOrbit: false,
    fontWeight: 400,
    shadow: false,
    style: { fontFamily: "'Bebas Neue', sans-serif" }
  },
  TextPressure: {
    // Bebas Neue is not a variable font: width/weight/italic axes do nothing.
    // Only scale/alpha/stroke respond. Prefer FoldText. Use this only for a 404 or playful moment.
    fontFamily: 'Bebas Neue',
    fontUrl: '',            // self-hosted via tokens.css @font-face
    width: false,
    weight: false,
    italic: false,
    alpha: true,
    scale: true,
    textColor: palette.ivory,
    minFontSize: 48
  },

  // ---- Navigation & selection ----
  GooeyNav: {
    animationTime: 600,
    particleCount: 10,
    particleDistances: [70, 10],
    particleR: 80,
    timeVariance: 250,
    colors: [1, 2, 1, 2, 1, 2]   // --color-1 scarlet, --color-2 cream (set in pianist-overrides.css)
  },
  OptionWheel: {
    textColor: palette.rose,  // the repertoire dial sits on the red canvas
    activeColor: palette.ink,
    side: 'left',
    fontSize: 3,
    spacing: 1.3,
    curve: 0.8,
    tilt: 4,
    blur: 1.5,
    fade: 0.3,
    smoothing: 260,
    soundUrl: ''            // silent by default
  },

  // ---- Surfaces & atmosphere (one per viewport, stage sections only) ----
  BorderGlow: {
    backgroundColor: palette.lacquer,
    glowColor: '4 77 60',    // scarlet in "H S L"
    colors: [palette.scarlet, palette.scarletHi, palette.ivory],
    borderRadius: 0,         // two-shape system: cards are sharp
    glowRadius: 32,
    glowIntensity: 0.6,
    coneSpread: 20,
    fillOpacity: 0.25,
    animated: false
  },
  MicroSlats: {
    preset: 'swell',         // reads like a row of hammers/keys: graphite hammers in the dark, lit scarlet as the swell passes
    color: palette.graphite,
    glintColor: palette.scarlet,
    backgroundColor: palette.ink,
    glint: 0.6,              // the stage light on the swell, kept below the preset's so it never outshines the type
    slatWidth: 10,
    slatHeight: 40,
    gap: 6,
    roundness: 0.2,
    cursorStrength: 0.6,
    introDuration: 1.4
  },
  MoltenMetal: {
    color1: palette.ink,
    color2: palette.crimson,
    color3: palette.ivory,
    colorMode: 'ember',
    speed: 0.18,
    glow: 0.9,
    brightness: 0.9,
    grain: true,
    grainIntensity: 0.04,
    mouseStrength: 0.15,
    backgroundColor: palette.ink,
    lightMode: false
  },
  AeroShards: {
    backgroundColor: palette.ink,
    shardColor: palette.graphite,
    accentColor: palette.scarlet,
    material: 'satin',
    flow: 'ribbon',
    placement: 'right',
    detail: 'balanced',
    speed: 0.5,
    spin: 0.4,
    glow: 0.5,
    bloom: 0.25,
    grain: 0.04,
    chromaticAberration: 0,
    interaction: 'repel',
    interactionStrength: 0.3
  },
  RippleDistortion: {
    grayscale: true,
    tint: palette.scarlet,
    tintAmount: 0.08,
    strength: 0.12,
    rings: 3,
    brushSize: 140,
    highlightColor: palette.ivory,
    trigger: 'hover',
    quality: 'low'
  },

  // ---- Cursor (pick ONE for the whole site; desktop only) ----
  GhostCursor: {
    color: palette.ivory,
    brightness: 0.6,
    trailLength: 36,
    inertia: 0.6,
    bloomStrength: 0.08,
    grainIntensity: 0.04,
    mixBlendMode: 'screen'
  },
  GlowCursor: {
    color: palette.scarlet,
    secondaryColor: palette.ivory,
    trailLength: 28,
    trailWidth: 5,
    glowIntensity: 1.0,
    brightness: 0.9,
    pulseSpeed: 0.6,
    blendMode: 'screen'
  },
  SwarmCursor: {
    color: palette.ivory,
    accentColor: palette.scarlet,
    count: 7,
    size: 7,
    glow: 0.4,
    speed: 1.6,
    wander: 0.15,
    scatterOnClick: false
  }
};

export default presets;
