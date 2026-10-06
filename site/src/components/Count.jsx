import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../lib/hooks';

// A display numeral that counts up once, over Largo, when it scrolls into view ("05").
export default function Count({ to, pad = 2, duration = 1400 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return undefined;
    }
    const el = ref.current;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = now => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4); // legato: fast start, long settle
        setValue(Math.round(eased * to));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration, reduced]);

  return (
    <span ref={ref} aria-hidden="true">
      {String(value).padStart(pad, '0')}
    </span>
  );
}
