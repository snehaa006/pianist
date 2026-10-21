// The site sound's recordings: every piece she has on film, as audio only, cut to the music (no spoken introduction,
// walk-on or applause) and matched in loudness (scripts/process-media.sh). Each has the notes she plays in it
// (scripts/notes.py), for the keys that play along: [start s, end s, MIDI note, velocity 0..1], in order of start.
// Keyed by performance id (src/data/performances.js); "Hear me play" starts with her at the grand piano at home.
export const FIRST_TRACK = 'at-home-grand';

export const trackSources = id => [
  { src: `/media/audio/${id}.webm`, type: 'audio/webm; codecs=opus' },
  { src: `/media/audio/${id}.m4a`, type: 'audio/mp4' }
];

// Fetched once per piece and shared (the sound and the stairs both read them).
const cache = new Map();
export function loadNotes(id) {
  if (!cache.has(id)) {
    const p = fetch(`/media/audio/${id}.notes.json`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        p.value = d?.notes || null;
        return p.value;
      })
      .catch(() => null);
    p.value = undefined;
    cache.set(id, p);
  }
  return cache.get(id);
}
// The notes if they have arrived, otherwise undefined (and they start loading).
export const notesNow = id => loadNotes(id).value;
