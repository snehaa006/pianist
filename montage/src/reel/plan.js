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

// The phone sheet (3 × 5): the three moving frames arrive along the top row; tile 7, in the middle, is still
// the stage and still the one entered.
const SHEET_PHONE = [
  null, null, null,
  { p: 'H1', src: 9.0, view: V.homeClose },
  { p: 'S', src: 25.0, view: V.twiHands },
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

// Every page's geometry, per orientation. Landscape is the 1920 × 1080 reel; phone is 1080 × 1920.
const triL = [TRI(0), TRI(1), TRI(2)];
const PW = (968 - 2 * 24) / 3;
const PH = PW * (9 / 16);
const triP = [0, 1, 2].map(i => ({ x: 56, y: 180 + i * 560, w: 968, h: 480 }));
export const LAYOUTS = {
  landscape: {
    W: 1920, H: 1080, M, CW,
    header: { top: 44, size: 22 },
    barTop: 1040,
    SLOT, BIG: BIG_LEFT, SMALL: RIGHT_SMALL, TRI: triL,
    cols: 5, TILE, moving: [0, 2, 4], sheet: SHEET, mark: SHEET_MARK,
    nameStart: { top: 140, size: 150, track: 0.6 },
    nameEnd: { left: RIGHT_SMALL.x, top: 130, size: 92 },
    pianist1Top: 782,
    pianist2: { left: RIGHT_SMALL.x, top: 246 },
    nameRule: { x: RIGHT_SMALL.x, y: 300, w: RIGHT_SMALL.w },
    spreadCaption: { left: M, top: 984 },
    triCaption: i => ({ left: triL[i].x, top: 962 }),
    ring: { rx: 222, ry: 140 },
    PORTRAIT, portraitExitY: -930, onStageTop: 958,
    STRIP_TOP, STRIP_BOTTOM,
    stripCaptions: { top: { left: M, top: 526 }, bottom: { left: M, top: 946 } },
    FINAL,
    finaleName: [{ text: 'Selin Incekara', top: 742 }], finaleSize: 366, finaleRuleY: 1046, finalePianistTop: 54,
    stageViews: [V.stageWide, V.stageWide, V.stagePortrait]
  },
  phone: {
    W: 1080, H: 1920, M: 56, CW: 968,
    header: { top: 52, size: 26 },
    barTop: 1868,
    SLOT: { x: 56, y: 640, w: 968, h: 560 },
    BIG: { x: 56, y: 340, w: 968, h: 900 },
    SMALL: { x: 480, y: 1330, w: 544, h: 400 },
    TRI: triP,
    cols: 3,
    TILE: i => ({ x: 56 + (i % 3) * (PW + 24), y: 410 + Math.floor(i / 3) * (PH + 52), w: PW, h: PH }),
    moving: [0, 1, 2], sheet: SHEET_PHONE, mark: 7,
    nameStart: { top: 300, size: 104, track: 0.3 },
    nameEnd: { left: 56, top: 150, size: 72 },
    pianist1Top: 1240,
    pianist2: { left: 56, top: 240 },
    nameRule: { x: 56, y: 292, w: 968 },
    spreadCaption: { left: 56, top: 1256 },
    triCaption: i => ({ left: 56, top: triP[i].y + triP[i].h + 12 }),
    ring: { rx: PW * 0.66, ry: PH * 0.74 },
    PORTRAIT: { x: 140, y: 420, w: 800, h: 1000 }, portraitExitY: -1100, onStageTop: 1460,
    STRIP_TOP: { x: 56, y: 330, w: 968, h: 560 },
    STRIP_BOTTOM: { x: 56, y: 1030, w: 968, h: 560 },
    stripCaptions: { top: { left: 56, top: 902 }, bottom: { left: 56, top: 1602 } },
    FINAL: { x: 56, y: 210, w: 968, h: 900 },
    finaleName: [{ text: 'Selin', top: 1160 }, { text: 'Incekara', top: 1420 }], finaleSize: 324, finaleRuleY: 1800, finalePianistTop: 112,
    // the stage enters exactly where the zoomed sheet frame left it, then centres on her in the portrait frame
    stageViews: [{ x: 0.4718, y: 0.5, z: 1.06 }, V.stageWide, { x: 0.43, y: 0.55, z: 1.15 }]
  }
};
export const sheetAppearIn = (L, i) => 169 + 2 * ((i % L.cols) + Math.floor(i / L.cols));
