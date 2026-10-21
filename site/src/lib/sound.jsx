import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FIRST_TRACK, loadNotes, notesNow, trackSources } from './tracks';

// Site sound: her pieces as audio only (lib/tracks.js), one at a time, starting with her at-home grand performance
// (the cleanest of the eight recordings). Nothing plays on its own: the nav's "Hear me play" starts the current piece
// inside the visitor's click, and stops it again; choosing a piece on the stairs (Stairs.jsx) plays that one instead.
// Each piece carries the notes she plays in it, for the keys to play along.
export const SOUND = {
  volume: 0.6,
  fadeIn: 1.4, // Largo
  fadeOut: 0.6, // Andante
  change: 0.3, // Allegro: one piece fades out, the next fades in, when a piece is chosen
  rest: 2.4 // the pause before the piece starts again
};

const SoundContext = createContext({
  playing: false,
  wanted: false,
  track: FIRST_TRACK,
  toggle: () => {},
  choose: () => {},
  hold: () => () => {},
  playhead: () => null
});
export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }) {
  const [wanted, setWanted] = useState(false); // the visitor asked for sound
  const wantedRef = useRef(false);
  const [track, setTrack] = useState(FIRST_TRACK); // the piece asked for
  const trackRef = useRef(FIRST_TRACK);
  const heldRef = useRef(0);
  const [held, setHeld] = useState(0); // films open (their own sound takes over)
  const [playing, setPlaying] = useState(false);
  const engine = useRef(null);
  const restTimer = useRef(0);
  const changeTimer = useRef(0);

  // Load a piece into the player: `e.track` is the piece actually in it, which the keys follow.
  const load = useCallback((e, id) => {
    const source = trackSources(id).find(s => e.audio.canPlayType(s.type)) || trackSources(id)[1];
    e.audio.src = source.src;
    e.track = id;
    loadNotes(id);
  }, []);

  // Built inside the click that asks for sound, so browsers let it start.
  const build = useCallback(() => {
    if (engine.current) return engine.current;
    const audio = new Audio();
    audio.preload = 'auto';
    let ctx = null;
    let gain = null;
    // Web Audio gives smooth fades everywhere (iOS ignores element.volume); fall back to volume if it's missing.
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      try {
        ctx = new AC();
        gain = ctx.createGain();
        gain.gain.value = 0;
        ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
      } catch {
        ctx = null;
        gain = null;
      }
    }
    if (!gain) audio.volume = 0;
    engine.current = { audio, ctx, gain, track: null };
    load(engine.current, trackRef.current);
    return engine.current;
  }, [load]);

  const ramp = useCallback((to, seconds) => {
    const e = engine.current;
    if (!e) return;
    if (e.gain) {
      const now = e.ctx.currentTime;
      e.gain.gain.cancelScheduledValues(now);
      e.gain.gain.setValueAtTime(e.gain.gain.value, now);
      e.gain.gain.linearRampToValueAtTime(to, now + seconds);
      return;
    }
    const from = e.audio.volume;
    const start = performance.now();
    const step = t => {
      const k = Math.min(1, (t - start) / (seconds * 1000));
      e.audio.volume = from + (to - from) * k;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const start = useCallback(
    (fade = SOUND.fadeIn) => {
      const e = build();
      clearTimeout(restTimer.current);
      clearTimeout(changeTimer.current);
      if (e.track !== trackRef.current) load(e, trackRef.current);
      e.ctx?.resume?.();
      const p = e.audio.play();
      ramp(SOUND.volume, fade);
      return p?.catch?.(() => setPlaying(false));
    },
    [build, load, ramp]
  );

  const stop = useCallback(() => {
    const e = engine.current;
    clearTimeout(restTimer.current);
    clearTimeout(changeTimer.current);
    if (!e) return;
    ramp(0, SOUND.fadeOut);
    restTimer.current = setTimeout(() => e.audio.pause(), SOUND.fadeOut * 1000 + 40);
  }, [ramp]);

  // Must run synchronously inside the click handler (autoplay rules).
  const toggle = useCallback(() => {
    const next = !wantedRef.current;
    wantedRef.current = next;
    setWanted(next);
    if (!next) stop();
    else if (heldRef.current === 0) start();
  }, [start, stop]);

  // Play this piece: another one from its beginning; the one in the player carries on (or resumes where it was paused).
  // Runs inside the gesture that chose it: the first piece starts there and then; a piece already playing fades out
  // first, then the new one starts (the player has been started by a gesture by then, so browsers let it).
  const choose = useCallback(
    id => {
      const e = build();
      trackRef.current = id;
      setTrack(id);
      loadNotes(id);
      wantedRef.current = true;
      setWanted(true);
      if (heldRef.current > 0) return;
      clearTimeout(changeTimer.current);
      clearTimeout(restTimer.current);
      if (id === e.track) {
        // Back to the piece in the player: undo any fade begun for another one.
        if (e.audio.paused) start();
        else ramp(SOUND.volume, SOUND.change);
        return;
      }
      if (e.audio.paused) {
        load(e, id);
        start(SOUND.change);
        return;
      }
      ramp(0, SOUND.change);
      changeTimer.current = setTimeout(() => {
        load(e, id);
        start(SOUND.change);
      }, SOUND.change * 1000);
    },
    [build, load, ramp, start]
  );

  // A film taking the stage: fade the piano out, bring it back when the film closes.
  const hold = useCallback(() => {
    setHeld(n => n + 1);
    return () => setHeld(n => n - 1);
  }, []);

  useEffect(() => {
    heldRef.current = held;
    if (!engine.current || !wanted) return;
    if (held > 0) stop();
    else start();
  }, [held]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep `playing` honest (the nav shows it), and rest a moment before the piece starts again.
  useEffect(() => {
    if (!wanted) return undefined;
    const e = engine.current;
    if (!e) return undefined;
    const a = e.audio;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    const ended = () => {
      setPlaying(false);
      restTimer.current = setTimeout(() => {
        a.currentTime = 0;
        a.play().catch(off);
      }, SOUND.rest * 1000);
    };
    setPlaying(!a.paused);
    a.addEventListener('playing', on);
    a.addEventListener('pause', off);
    a.addEventListener('ended', ended);
    return () => {
      a.removeEventListener('playing', on);
      a.removeEventListener('pause', off);
      a.removeEventListener('ended', ended);
    };
  }, [wanted]);

  // Hidden tab: the piano waits.
  useEffect(() => {
    const onVis = () => {
      const e = engine.current;
      if (!e || !wanted || held > 0) return;
      if (document.hidden) e.audio.pause();
      else start();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [wanted, held, start]);

  // Where the piece in the player has got to, for whatever plays along (the hero keys, the stairs): seconds into it,
  // less the time the sound takes to reach the speakers, its notes and which piece it is. Null while the piano isn't
  // playing. Stable, so it can be read every frame.
  const playhead = useCallback(() => {
    const e = engine.current;
    if (!e || !wantedRef.current || heldRef.current > 0 || e.audio.paused) return null;
    const notes = notesNow(e.track);
    if (!notes) return null;
    return { t: e.audio.currentTime - (e.ctx?.outputLatency || 0), notes, track: e.track };
  }, []);

  const value = useMemo(
    () => ({ playing: wanted && playing, wanted, track, toggle, choose, hold, playhead }),
    [wanted, playing, track, toggle, choose, hold, playhead]
  );
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
