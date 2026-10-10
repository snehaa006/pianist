// The reel: 14.7 s on the closing two phrases of her at-home grand recording (14.22.50, 76.96–91.70 s).
// A concert programme in motion: ivory and ink surfaces, precise frames that glide into new layouts on the
// downbeats, footage that changes behind rising masks. All times are frames at 30 fps.

export const REEL_FPS = 30;
export const REEL_FRAMES = 442;
export const AUDIO_START = 76.96;
export const sync = frame => AUDIO_START + frame / REEL_FPS; // home footage in sync with the soundtrack

// Downbeats of the 3/4 bars (strong onsets, about 0.95 s apart); a beat is a third of a bar.
export const BARS = [0, 29, 58, 86, 115, 142, 169, 199, 225, 254, 281, 310, 337, 365, 392];
export const BREATH = 208; // the breath between the two phrases (83.9 s)
export const CHORD = 412; // the final chord (90.68 s)

// Canvas: 72 px margins (the site's page margin), a 1776 px measure.
export const M = 72;
export const CW = 1776;

// Layout rectangles.
export const SLOT = { x: M, y: 330, w: CW, h: 420 };
export const BIG_LEFT = { x: M, y: 120, w: 1056, h: 840 };
export const RIGHT_SMALL = { x: 1176, y: 548, w: 672, h: 378 };
export const TRI = i => ({ x: M + i * 600, y: 140, w: 576, h: 800 });
export const TILE = i => ({ x: M + (i % 5) * 360, y: 168 + Math.floor(i / 5) * 262, w: 336, h: 189 });
export const PORTRAIT = { x: 672, y: 110, w: 576, h: 820 };
export const STRIP_TOP = { x: M, y: 150, w: CW, h: 360 };
export const STRIP_BOTTOM = { x: M, y: 570, w: CW, h: 360 };
export const FINAL = { x: 432, y: 110, w: 1056, h: 594 };

// Framings: centre (x, y) in the source frame, zoom z.
export const V = {
  homeBand: { x: 0.45, y: 0.56, z: 1.0 },
  homeWide: { x: 0.36, y: 0.5, z: 1.0 },
  homeFace: { x: 0.31, y: 0.43, z: 1.7 },
  homeClose: { x: 0.33, y: 0.42, z: 1.8 },
  hallWide: { x: 0.5, y: 0.52, z: 1.0 },
  hallFace: { x: 0.45, y: 0.42, z: 1.3 },
  hallClose: { x: 0.43, y: 0.42, z: 1.6 },
  stageWide: { x: 0.46, y: 0.5, z: 1.06 },
  stagePortrait: { x: 0.33, y: 0.55, z: 1.15 },
  stageClose: { x: 0.47, y: 0.44, z: 1.7 },
  stageEnd: { x: 0.45, y: 0.48, z: 1.0 },
  twiWide: { x: 0.55, y: 0.48, z: 1.02 },
  twiFace: { x: 0.6, y: 0.45, z: 1.2 },
  twiHands: { x: 0.5, y: 0.6, z: 1.9 },
  andFace: { x: 0.4, y: 0.42, z: 1.2 },
  g1Her: { x: 0.42, y: 0.42, z: 1.15 },
  g1Hands: { x: 0.5, y: 0.6, z: 1.9 },
  dogFace: { x: 0.64, y: 0.4, z: 1.2 },
  dogHands: { x: 0.45, y: 0.52, z: 1.8 },
  scaleWide: { x: 0.45, y: 0.5, z: 1.0 }
};

// The contact sheet: fifteen frames from all eight films. Tiles 0, 2 and 4 are the three moving frames
// arriving; tile 7, in the middle, is the one marked and entered.
export const SHEET = [
  null,
  { p: 'H1', src: 9.0, view: V.homeClose },
  null,
  { p: 'S', src: 25.0, view: V.twiHands },
  null,
  { p: 'T', src: 16.5, view: V.scaleWide },
  { p: 'A', src: 19.0, view: V.andFace },
  { p: 'O1', src: 18.0, view: V.stageWide },
  { p: 'O2', src: 63.6, view: V.stageEnd },
  { p: 'H2', src: 84.5, view: V.homeWide },
  { p: 'M', src: 11.0, view: V.hallWide },
  { p: 'S', src: 21.5, view: V.twiWide },
  { p: 'D', src: 37.5, view: V.dogHands },
  { p: 'G', src: 19.0, view: V.g1Hands },
  { p: 'O1', src: 22.0, view: V.stageClose }
];
export const SHEET_MARK = 7;
export const sheetAppear = i => 169 + 2 * ((i % 5) + Math.floor(i / 5)); // a diagonal cascade
