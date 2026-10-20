import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useFx } from './hooks';

// Budget: one WebGL/canvas effect per viewport. Every section that owns an effect registers here;
// only the section that fills most of the viewport may run its effect. The others show their still.
const FxStageContext = createContext({ active: null, report: () => {}, release: () => {} });

export function FxStageProvider({ children }) {
  const [active, setActive] = useState(null);
  const shares = useRef(new Map());

  const pick = useCallback(() => {
    let best = null;
    let max = 0.35; // a section must fill at least 35% of the viewport to earn the effect
    shares.current.forEach((share, id) => {
      if (share > max) {
        max = share;
        best = id;
      }
    });
    setActive(best);
  }, []);

  const report = useCallback((id, share) => {
    shares.current.set(id, share);
    pick();
  }, [pick]);

  const release = useCallback(id => {
    shares.current.delete(id);
    pick();
  }, [pick]);

  const value = useMemo(() => ({ active, report, release }), [active, report, release]);
  return <FxStageContext.Provider value={value}>{children}</FxStageContext.Provider>;
}

const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

// Returns true while this section holds the stage's one effect (desktop, motion allowed only).
export function useFxSlot(ref) {
  const id = useId();
  const fx = useFx();
  const { active, report, release } = useContext(FxStageContext);

  useEffect(() => {
    const el = ref.current;
    if (!fx || !el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => report(id, entry.intersectionRect.height / window.innerHeight),
      { threshold: THRESHOLDS }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      release(id);
    };
  }, [fx, id, ref, report, release]);

  return fx && active === id;
}
