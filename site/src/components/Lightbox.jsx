import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { metaOf } from '../data/performances';
import { useSound } from '../lib/sound.jsx';

const LightboxContext = createContext({ open: () => {} });
export const useLightbox = () => useContext(LightboxContext);

// Ink lightbox for a performance. Opens only from a click, so sound starts only when asked for.
export function LightboxProvider({ children }) {
  const [item, setItem] = useState(null);
  const returnFocus = useRef(null);

  const open = useCallback((performance, trigger) => {
    returnFocus.current = trigger || document.activeElement;
    setItem(performance);
  }, []);

  const close = useCallback(() => {
    setItem(null);
    const el = returnFocus.current;
    if (el && typeof el.focus === 'function') requestAnimationFrame(() => el.focus());
  }, []);

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {item && <Lightbox item={item} onClose={close} />}
    </LightboxContext.Provider>
  );
}

function Lightbox({ item, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const videoRef = useRef(null);
  const { hold } = useSound();

  // The film has its own sound: the site piano fades out while it is open and returns after.
  useEffect(() => hold(), [hold]);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    // The visitor pressed play to get here, so start the film (with sound) straight away.
    videoRef.current?.play?.().catch(() => {});

    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const focusables = dialogRef.current.querySelectorAll('button, video, a[href]');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="lightbox stage"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      ref={dialogRef}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button ref={closeRef} className="lightbox__close" type="button" aria-label="Close the film" onClick={onClose}>
        <span aria-hidden="true">×</span>
      </button>
      <figure className="lightbox__figure">
        <div className="lightbox__frame">
          <video ref={videoRef} controls playsInline preload="metadata" poster={item.poster}>
            {item.sources.map(s => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        </div>
        <figcaption className="lightbox__caption">
          <span className="label muted">{item.composer}</span>
          <h2 className="h3" id="lightbox-title">
            {item.work}
          </h2>
          <span className="body-sm muted">
            {metaOf(item)} · {item.duration}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
