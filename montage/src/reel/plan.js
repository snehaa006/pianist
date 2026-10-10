// The reel: 13.8 s on the ending of Dog Hungry (Sonny Chua), cut to its accents.
// Film time T = source time − 51.47 (the audio window in scripts/reel-audio.sh). All times in frames at 30 fps.

export const REEL_FPS = 30;
export const REEL_FRAMES = 415; // 13.83 s
export const AUDIO_START = 51.47; // Dog Hungry source time at frame 0
export const syncSrc = frame => AUDIO_START + frame / REEL_FPS; // D2 footage in sync with the soundtrack

// Strong note onsets of the mix (scripts: onset analysis of 14.23.06, 51.4–65.3 s), as frames.
// Every layout switch and every "bump" lands on one of these.
export const HITS = [0, 26, 43, 68, 77, 86, 121, 129, 142, 147, 155, 164, 173, 194, 216, 229, 242, 250, 259, 272, 286, 294, 335];
export const PLAY_END = 300; // her hands leave the keys (61.48 s): one second of silence
export const CHORD = 335; // the final chord (62.64 s)
export const CARD = 346; // end card

// Framings: centre (x, y) in the source frame, zoom z.
export const V = {
  stageWide: { x: 0.46, y: 0.5, z: 1.06 },
  stageClose: { x: 0.47, y: 0.44, z: 1.7 },
  stageFace: { x: 0.57, y: 0.37, z: 1.55 },
  stageHands: { x: 0.42, y: 0.48, z: 1.95 },
  stageEnd: { x: 0.42, y: 0.47, z: 1.5 },
  hallWide: { x: 0.5, y: 0.5, z: 1.0 },
  hallMid: { x: 0.43, y: 0.5, z: 1.0 },
  hallClose: { x: 0.43, y: 0.42, z: 1.6 },
  hallFace: { x: 0.45, y: 0.4, z: 1.75 },
  homeWide: { x: 0.36, y: 0.5, z: 1.0 },
  homeClose: { x: 0.33, y: 0.42, z: 1.8 },
  homeMid: { x: 0.34, y: 0.45, z: 1.2 },
  scaleWide: { x: 0.45, y: 0.5, z: 1.0 },
  scaleHands: { x: 0.48, y: 0.58, z: 1.45 },
  scaleFace: { x: 0.36, y: 0.4, z: 1.65 },
  andHands: { x: 0.5, y: 0.6, z: 1.38 },
  andFace: { x: 0.38, y: 0.33, z: 1.62 },
  g1Her: { x: 0.4, y: 0.42, z: 1.25 },
  g1Hands: { x: 0.5, y: 0.6, z: 1.9 },
  twiWide: { x: 0.55, y: 0.48, z: 1.02 },
  twiHands: { x: 0.5, y: 0.6, z: 1.9 },
  twiFace: { x: 0.6, y: 0.45, z: 1.35 },
  dogHands: { x: 0.45, y: 0.52, z: 1.8 },
  dogFace: { x: 0.66, y: 0.32, z: 1.6 },
  dogWide: { x: 0.5, y: 0.5, z: 1.0 }
};

// The 4 × 4 contact sheet: sixteen moments from all eight films. Tile 5 is the one the camera dives into.
export const GRID = [
  { p: 'O1', src: 18.3, view: V.stageClose },
  { p: 'M', src: 13.2, view: V.hallClose },
  { p: 'S', src: 21.0, view: V.twiWide },
  { p: 'T', src: 16.0, view: V.scaleWide },
  { p: 'A', src: 19.5, view: V.andFace },
  { p: 'H1', src: 12.4, view: V.homeWide },
  { p: 'D', src: 37.0, view: V.dogFace },
  { p: 'G', src: 15.0, view: V.g1Her },
  { p: 'O2', src: 64.0, view: V.stageEnd },
  { p: 'H2', src: 85.0, view: V.homeClose },
  { p: 'M', src: 17.5, view: V.hallFace },
  { p: 'S', src: 26.0, view: V.twiFace },
  { p: 'G', src: 19.0, view: V.g1Hands },
  { p: 'O1', src: 24.0, view: V.stageWide },
  { p: 'T', src: 18.5, view: V.scaleFace },
  { p: 'D', src: 39.0, view: V.dogHands }
];
export const GRID_ORDER = [5, 10, 0, 15, 3, 12, 6, 9, 1, 14, 7, 8, 2, 13, 4, 11];
export const GRID_ZOOM_TILE = 5;
