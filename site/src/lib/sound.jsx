import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Site sound: her at-home grand performance (the cleanest of the eight recordings), as audio only.
// Nothing plays until the visitor picks "Enter with sound" on the gate; the nav keeps a visible stop control.
export const SOUND = {
  sources: [
    { src: '/media/audio/at-home-grand.webm', type: 'audio/webm; codecs=opus' },
    { src: '/media/audio/at-home-grand.m4a', type: 'audio/mp4' }
  ],
  volume: 0.6,
  fadeIn: 1.4, // Largo
  fadeOut: 0.6, // Andante
  rest: 2.4 // the pause before the piece starts again
};

const KEY = 'sound-choice';
const read = () => {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const write = value => {
  try {
    window.sessionStorage.setItem(KEY, value);
  } catch {
    /* private mode: the gate simply asks again next time */
  }
};

// The gate opens on every fresh load, except after "Enter quietly" earlier in this session.
// (Sound itself can't resume after a reload without a new click, so a "with sound" choice asks again.)
export const gateWanted = () => typeof window !== 'undefined' && read() !== 'quiet';

const SoundContext = createContext({
  gate: false,
  playing: false,
  enter: () => {},
  toggle: () => {},
  hold: () => () => {}
});
export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }) {
  const [gate, setGate] = useState(gateWanted);
  const [wanted, setWanted] = useState(false); // the visitor asked for sound
  const wantedRef = useRef(false);
  const heldRef = useRef(0);
  const [held, setHeld] = useState(0); // films open (their own sound takes over)
  const [playing, setPlaying] = useState(false);
  const engine = useRef(null);
  const restTimer = useRef(0);

  // Built inside the click that asks for sound, so browsers let it start.
  const build = useCallback(() => {
    if (engine.current) return engine.current;
    const audio = new Audio();
    audio.preload = 'auto';
    const source = SOUND.sources.find(s => audio.canPlayType(s.type)) || SOUND.sources[1];
    audio.src = source.src;
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
    engine.current = { audio, ctx, gain };
    return engine.current;
  }, []);

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

  const start = useCallback(() => {
    const e = build();
    clearTimeout(restTimer.current);
    e.ctx?.resume?.();
    const p = e.audio.play();
    ramp(SOUND.volume, SOUND.fadeIn);
    return p?.catch?.(() => setPlaying(false));
  }, [build, ramp]);

  const stop = useCallback(() => {
    const e = engine.current;
    clearTimeout(restTimer.current);
    if (!e) return;
    ramp(0, SOUND.fadeOut);
    restTimer.current = setTimeout(() => e.audio.pause(), SOUND.fadeOut * 1000 + 40);
  }, [ramp]);

  // Must run synchronously inside the click handler (autoplay rules).
  const enter = useCallback(
    withSound => {
      write(withSound ? 'sound' : 'quiet');
      wantedRef.current = withSound;
      setWanted(withSound);
      if (withSound) start();
      setGate(false);
    },
    [start]
  );

  const toggle = useCallback(() => {
    const next = !wantedRef.current;
    wantedRef.current = next;
    setWanted(next);
    if (!next) stop();
    else if (heldRef.current === 0) start();
  }, [start, stop]);

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

  // While the gate is up, the page underneath waits (hero letters hold, no scrolling).
  useEffect(() => {
    document.documentElement.classList.toggle('is-gated', gate);
  }, [gate]);

  const value = useMemo(() => ({ gate, playing: wanted && playing, wanted, enter, toggle, hold }), [
    gate,
    wanted,
    playing,
    enter,
    toggle,
    hold
  ]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
