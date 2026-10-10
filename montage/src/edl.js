// The edit. Every time is in seconds. `at`/`end` are film time; `src` is the source clip's own time.
// Shots play their proxy in sync with the audio cue of the same performance: wherever she is playing on
// screen, you hear that take. Free moments (her walk to the keys, the bow, sitting back) carry applause,
// room tone or a decaying chord, never another piece.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Proxies (scripts/proxies.sh): a window of one source clip, graded, 1920x1080.
export const PROXIES = {
  H1: { clip: '14.22.50', start: 4.8 }, // at home, the grand by the window (60 fps)
  H2: { clip: '14.22.50', start: 83.3 },
  T: { clip: '14.23.15', start: 15.4 }, // Grade 1 technical work (scales)
  A: { clip: '14.23.23', start: 16.2 }, // Andante, Grade 1
  G: { clip: '14.23.31', start: 14.0 }, // Grade 1, List B
  S: { clip: '14.22.59', start: 20.4 }, // Song of Twilight, Grade 3
  D: { clip: '14.23.06', start: 34.7 }, // Dog Hungry, Grade 3
  M: { clip: '14.23.41', start: 5.0 }, // Austrian Master Classes, in concert
  O1: { clip: '14.22.40', start: 15.4 }, // on stage
  O2: { clip: '14.22.40', start: 63.0 }, // on stage, final chords and bow (60 fps)
  D2: { clip: '14.23.06', start: 51.3 }, // Dog Hungry, the ending
  H3: { clip: '14.22.50', start: 76.0 } // at home, the grand: the reel's opening phrase (60 fps)
};

// Audio cues, cut from the original files. `gain` is added after per-cue loudness matching (dB).
export const AUDIO = [
  { id: 'prelude', clip: '14.22.50', src: 5.0, srcEnd: 20.2, at: 0.0, fadeIn: 0, fadeOut: 0.5 },
  { id: 'scale', clip: '14.23.15', src: 16.0, srcEnd: 20.5, at: 15.3, fadeIn: 0.02, fadeOut: 0.3 },
  { id: 'andante', clip: '14.23.23', src: 16.38, srcEnd: 20.6, at: 19.8, fadeIn: 0.02, fadeOut: 0.25 },
  { id: 'grade1', clip: '14.23.31', src: 14.4, srcEnd: 21.8, at: 24.05, fadeIn: 0.02, fadeOut: 0.3 },
  { id: 'twilight', clip: '14.22.59', src: 20.88, srcEnd: 28.42, at: 32.05, fadeIn: 0.02, fadeOut: 0.3 },
  { id: 'dog', clip: '14.23.06', src: 34.96, srcEnd: 39.78, at: 40.15, fadeIn: 0.01, fadeOut: 0.12 },
  { id: 'hall', clip: '14.23.41', src: 5.3, srcEnd: 8.85, at: 45.35, fadeIn: 0.6, fadeOut: 0.2, gain: -4, matchTo: 'concert' },
  { id: 'concert', clip: '14.23.41', src: 10.4, srcEnd: 19.42, at: 48.85, fadeIn: 0.02, fadeOut: 0.3 },
  { id: 'stage', clip: '14.22.40', src: 16.2, srcEnd: 25.88, at: 58.1, fadeIn: 0.02, fadeOut: 0.3 },
  { id: 'finale', clip: '14.22.40', src: 63.55, srcEnd: 71.45, at: 67.7, fadeIn: 0.15, fadeOut: 1.3, matchTo: 'stage', matchWindow: [63.55, 66.3], duck: { at: 66.35, ramp: 0.7, db: -8 } },
  { id: 'return', clip: '14.22.50', src: 83.85, srcEnd: 94.3, at: 75.6, fadeIn: 0.02, fadeOut: 0.8, matchTo: 'prelude' }
];

export const DURATION = 87.3;

// Framing: x, y = centre of the view in the source frame (0–1); z = zoom (1 = the whole frame).
// `from` → `to` is the camera move across the shot. `enter` describes how the shot arrives.
export const SHOTS = [
  // ── Prelude: today, at the grand. Opens as a thin band with her name; the band widens to the full frame
  //    on the second phrase.
  { id: 'p1', p: 'H1', at: 0.0, end: 5.95, src: 5.0, from: { x: 0.33, y: 0.385, z: 1.3 }, to: { x: 0.35, y: 0.47, z: 1.08 } },
  { id: 'p2', p: 'H1', at: 5.95, end: 9.95, src: 10.95, from: { x: 0.31, y: 0.43, z: 1.85 }, to: { x: 0.35, y: 0.44, z: 1.92 } },
  { id: 'p3', p: 'H1', at: 9.95, end: 12.35, src: 14.95, from: { x: 0.52, y: 0.36, z: 1.4 }, to: { x: 0.5, y: 0.36, z: 1.5 } },
  { id: 'p4', p: 'H1', at: 12.35, end: 15.7, src: 17.35, from: { x: 0.38, y: 0.5, z: 1.2 }, to: { x: 0.38, y: 0.5, z: 1.02 } },

  // ── Beginnings: Grade 1. The scale climbs; every second note the frame steps closer.
  { id: 't1', p: 'T', at: 14.85, end: 16.37, src: 15.55, from: { x: 0.45, y: 0.5, z: 1.0 }, to: { x: 0.45, y: 0.5, z: 1.04 }, enter: { type: 'time', dur: 0.85 } },
  { id: 't2', p: 'T', at: 16.37, end: 17.37, src: 17.07, from: { x: 0.48, y: 0.58, z: 1.45 }, to: { x: 0.48, y: 0.57, z: 1.5 } },
  { id: 't3', p: 'T', at: 17.37, end: 18.37, src: 18.07, from: { x: 0.36, y: 0.4, z: 1.65 }, to: { x: 0.36, y: 0.39, z: 1.7 } },
  { id: 't4', p: 'T', at: 18.37, end: 18.87, src: 19.07, from: { x: 0.47, y: 0.6, z: 1.95 }, to: { x: 0.47, y: 0.6, z: 1.98 } },
  { id: 't5', p: 'T', at: 18.87, end: 19.37, src: 19.57, from: { x: 0.3, y: 0.27, z: 2.0 }, to: { x: 0.3, y: 0.27, z: 2.04 } },
  { id: 't6', p: 'T', at: 19.37, end: 19.97, src: 20.07, from: { x: 0.44, y: 0.5, z: 1.25 }, to: { x: 0.44, y: 0.5, z: 1.2 } },

  // Andante: one unbroken move, from her hands up to her face.
  { id: 'a1', p: 'A', at: 19.83, end: 24.75, src: 16.41, from: { x: 0.5, y: 0.6, z: 1.38 }, to: { x: 0.38, y: 0.33, z: 1.62 }, enter: { type: 'fade', dur: 0.14 } },

  // Grade 1, List B: a diptych in sync (her, and her hands), then the hands take the frame, then the room.
  {
    id: 'g1', p: 'G', at: 24.05, end: 27.95, src: 14.4, layout: 'diptych', enter: { type: 'split', dur: 0.9 },
    panels: [
      { from: { x: 0.4, y: 0.42, z: 1.25 }, to: { x: 0.38, y: 0.4, z: 1.3 } },
      { from: { x: 0.5, y: 0.6, z: 2.0 }, to: { x: 0.52, y: 0.6, z: 2.06 } }
    ]
  },
  // g2 starts exactly where g1's right panel left off (same zoom, same point at the panel's centre), then opens to the frame.
  { id: 'g2', p: 'G', at: 27.95, end: 29.8, src: 18.3, from: { x: 0.3986, y: 0.6, z: 2.06 }, to: { x: 0.5, y: 0.58, z: 1.96 }, enter: { type: 'expand', dur: 0.5 } },
  { id: 'g3', p: 'G', at: 29.8, end: 31.8, src: 20.15, from: { x: 0.45, y: 0.5, z: 1.0 }, to: { x: 0.45, y: 0.5, z: 1.07 } },

  // ── Grade 3: Song of Twilight. The frame opens out of a line; the last chord is held as a still.
  { id: 's1', p: 'S', at: 31.75, end: 35.98, src: 20.58, from: { x: 0.55, y: 0.48, z: 1.02 }, to: { x: 0.55, y: 0.47, z: 1.09 } },
  { id: 's2', p: 'S', at: 35.98, end: 37.8, src: 24.81, from: { x: 0.5, y: 0.6, z: 1.9 }, to: { x: 0.52, y: 0.6, z: 1.96 } },
  { id: 's3', p: 'S', at: 37.8, end: 39.25, src: 26.63, from: { x: 0.6, y: 0.45, z: 1.35 }, to: { x: 0.6, y: 0.45, z: 1.38 } },
  { id: 's4', p: 'S', at: 39.25, end: 40.15, src: 28.08, freeze: true, from: { x: 0.6, y: 0.45, z: 1.38 }, to: { x: 0.6, y: 0.44, z: 1.47 } },

  // Dog Hungry: the downbeat cuts in on her hands; three angles of the same take lock in on the beat.
  { id: 'd1', p: 'D', at: 40.15, end: 41.15, src: 34.96, from: { x: 0.45, y: 0.52, z: 1.8 }, to: { x: 0.45, y: 0.52, z: 1.86 } },
  {
    id: 'd2', p: 'D', at: 41.15, end: 43.2, src: 35.96, layout: 'triptych', beats: [0, 0.45, 0.9],
    bg: { from: { x: 0.45, y: 0.52, z: 1.86 }, to: { x: 0.45, y: 0.52, z: 1.92 } },
    panels: [
      { from: { x: 0.42, y: 0.52, z: 1.9 }, to: { x: 0.42, y: 0.52, z: 1.95 } },
      { from: { x: 0.5, y: 0.45, z: 1.0 }, to: { x: 0.5, y: 0.45, z: 1.04 } },
      { from: { x: 0.66, y: 0.32, z: 1.6 }, to: { x: 0.66, y: 0.33, z: 1.66 } }
    ]
  },
  { id: 'd3', p: 'D', at: 43.2, end: 44.97, src: 38.01, from: { x: 0.5, y: 0.5, z: 1.0 }, to: { x: 0.48, y: 0.5, z: 1.14 }, exit: { type: 'black', dur: 0.12 } },

  // ── The concert hall. Lights come up on her at the keys, before the first note; colour arrives.
  { id: 'm1', p: 'M', at: 45.35, end: 48.9, src: 5.3, from: { x: 0.5, y: 0.5, z: 1.0 }, to: { x: 0.47, y: 0.47, z: 1.08 }, enter: { type: 'lights', dur: 1.1 } },
  { id: 'm2', p: 'M', at: 48.9, end: 51.6, src: 10.45, from: { x: 0.5, y: 0.5, z: 1.0 }, to: { x: 0.49, y: 0.48, z: 1.06 } },
  { id: 'm3', p: 'M', at: 51.6, end: 53.3, src: 13.15, from: { x: 0.43, y: 0.42, z: 1.6 }, to: { x: 0.44, y: 0.41, z: 1.66 } },
  { id: 'm4', p: 'M', at: 53.3, end: 55.6, src: 14.85, from: { x: 0.5, y: 0.52, z: 1.0 }, to: { x: 0.5, y: 0.5, z: 1.05 } },
  { id: 'm5', p: 'M', at: 55.6, end: 58.0, src: 17.15, from: { x: 0.45, y: 0.4, z: 1.75 }, to: { x: 0.46, y: 0.39, z: 1.82 }, exit: { type: 'dim', dur: 0.75 } },

  // ── On stage. A brass line drawn across the dark, then the theatre comes up out of it.
  { id: 'o1', p: 'O1', at: 58.2, end: 60.2, src: 16.3, from: { x: 0.46, y: 0.5, z: 1.06 }, to: { x: 0.46, y: 0.5, z: 1.11 }, enter: { type: 'spot', dur: 1.1 } },
  { id: 'o2', p: 'O1', at: 60.2, end: 62.0, src: 18.3, from: { x: 0.47, y: 0.44, z: 1.7 }, to: { x: 0.47, y: 0.44, z: 1.76 } },
  { id: 'o3', p: 'O1', at: 62.0, end: 64.1, src: 20.1, from: { x: 0.57, y: 0.37, z: 1.55 }, to: { x: 0.55, y: 0.38, z: 1.62 } },
  { id: 'o4', p: 'O1', at: 64.1, end: 65.8, src: 22.2, from: { x: 0.42, y: 0.48, z: 1.95 }, to: { x: 0.42, y: 0.48, z: 2.0 } },
  { id: 'o5', p: 'O1', at: 65.8, end: 67.95, src: 23.9, from: { x: 0.46, y: 0.5, z: 1.2 }, to: { x: 0.46, y: 0.5, z: 1.08 } },
  // The last chords, then the hands lift in slow motion while the chord rings, then the bow.
  { id: 'f1', p: 'O2', at: 67.55, end: 69.45, src: 63.4, from: { x: 0.42, y: 0.47, z: 1.5 }, to: { x: 0.42, y: 0.46, z: 1.55 }, enter: { type: 'fade', dur: 0.4 } },
  { id: 'f2', p: 'O2', at: 69.45, end: 72.0, src: 65.3, rate: 0.5, from: { x: 0.42, y: 0.46, z: 1.55 }, to: { x: 0.43, y: 0.44, z: 1.68 } },
  { id: 'f3', p: 'O2', at: 71.65, end: 76.1, src: 68.2, rate: 0.5, from: { x: 0.45, y: 0.5, z: 1.18 }, to: { x: 0.45, y: 0.5, z: 1.1 }, enter: { type: 'fade', dur: 0.35 } },

  // ── Home again: the last phrase at the grand, the hands lift, she sits back; the band closes on her name.
  { id: 'r1', p: 'H2', at: 75.1, end: 79.5, src: 83.35, from: { x: 0.36, y: 0.48, z: 1.0 }, to: { x: 0.35, y: 0.47, z: 1.12 }, enter: { type: 'time', dur: 1.0 } },
  { id: 'r2', p: 'H2', at: 79.5, end: 81.9, src: 87.75, from: { x: 0.33, y: 0.42, z: 1.8 }, to: { x: 0.34, y: 0.43, z: 1.86 } },
  { id: 'r3', p: 'H2', at: 81.9, end: 82.55, src: 90.15, from: { x: 0.36, y: 0.47, z: 1.14 }, to: { x: 0.36, y: 0.47, z: 1.12 } },
  { id: 'r4', p: 'H2', at: 82.55, end: 87.3, src: 90.8, rate: 0.5, from: { x: 0.36, y: 0.47, z: 1.12 }, to: { x: 0.33, y: 0.385, z: 1.3 } },
  // The loop seam: the band dissolves to the film's first frame, so the last frame is the first.
  { id: 'loop', p: 'H1', at: 86.7, end: 87.3, src: 5.0, freeze: true, from: { x: 0.33, y: 0.385, z: 1.3 }, to: { x: 0.33, y: 0.385, z: 1.3 }, enter: { type: 'fade', dur: 0.6 } }
];

// Chapter labels (small, tracked, lower left) and the title.
export const LABELS = [
  { at: 15.75, end: 19.6, text: 'London College of Music · Grade 1' },
  { at: 32.55, end: 35.8, text: 'Song of Twilight · Yoshinao Nakada' },
  { at: 40.45, end: 43.1, text: 'Dog Hungry · Sonny Chua' },
  { at: 46.0, end: 49.8, text: 'Austrian Master Classes · In concert' },
  { at: 58.7, end: 61.6, text: 'On stage' }
];

// Grade 3 is announced on the line, while the frame is closed between the two rooms.
export const LINE_LABELS = [{ at: 31.66, end: 32.75, text: 'Grade 3' }];

// The band: height of the visible picture as a fraction of the frame, keyed in film time (eased between keys).
// It opens the film, closes to a single line between Grade 1 and Grade 3, and closes the film.
export const BAND = [
  { t: 0.0, h: 0.22 },
  { t: 4.45, h: 0.32 },
  { t: 5.95, h: 1.0 },
  { t: 31.15, h: 1.0 },
  { t: 31.75, h: 0.0 },
  { t: 32.2, h: 0.0 },
  { t: 33.0, h: 1.0 },
  { t: 84.9, h: 1.0 },
  { t: 86.5, h: 0.22 },
  { t: 87.3, h: 0.22 }
];

// Look: saturation and warmth over the film. Near-monochrome at home; colour arrives in the hall.
export const LOOK = [
  { t: 0, sat: 0.32, warm: 0.2 },
  { t: 45.4, sat: 0.32, warm: 0.2 },
  { t: 49.0, sat: 0.8, warm: 0.04 },
  { t: 57.8, sat: 0.85, warm: 0.04 },
  { t: 75.2, sat: 0.85, warm: 0.04 },
  { t: 77.4, sat: 0.32, warm: 0.2 },
  { t: 87.3, sat: 0.32, warm: 0.2 }
];

// Warm light passing through at the joins.
export const LEAKS = [
  { at: 1.2, dur: 5.2, from: [-0.2, 0.25], to: [0.45, 0.4], size: 1.1, peak: 0.16 },
  { at: 14.45, dur: 1.9, from: [0.0, 0.5], to: [0.9, 0.45], size: 1.0, peak: 0.42 },
  { at: 44.95, dur: 2.4, from: [0.75, 0.15], to: [0.5, 0.35], size: 1.3, peak: 0.32 },
  { at: 74.5, dur: 2.2, from: [0.1, 0.6], to: [0.85, 0.4], size: 1.1, peak: 0.38 }
];

// Portrait cut (phones): the same edit, reframed. A portrait frame shows about a third of the source width,
// so each shot's centre moves onto her (offset added to x) and zooms are eased back (portrait already magnifies).
export const PORTRAIT_X = {
  p1: -0.035, loop: -0.035, r4: -0.035, p3: -0.12, t1: -0.08, t6: -0.06, g3: -0.07, m1: -0.08, m2: -0.07, m4: -0.07, o3: -0.09, r1: -0.03, r3: -0.03
};
export const portraitZoom = z => 1 + (z - 1) * 0.6;
// Shots whose portrait framing differs from a simple offset (zoom values here are landscape values, eased back
// like the rest). g2's landscape move continues g1's right-hand panel; in portrait it arrives as a dissolve.
export const PORTRAIT_VIEW = {
  g2: { from: { x: 0.5, y: 0.6, z: 2.0 }, to: { x: 0.5, y: 0.58, z: 1.96 }, enter: { type: 'fade', dur: 0.35 } }
};
