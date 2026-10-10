import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import DustRing from './DustRing.jsx';
import { Keys } from './Motifs.jsx';
import { presets } from './fx/presets';
import { useFx, useReducedMotion } from '../lib/hooks';
import { useSound } from '../lib/sound.jsx';

const AeroShards = lazy(() => import('./fx/AeroShards/AeroShards.jsx'));

// If the shards fail (no WebGPU adapter), the dust ring takes their place.
class Fallback extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// The ring: the Watch ribbon of shards closed into a circle (WebGPU, desktop), or the same path in dust.
function Ring() {
  const fx = useFx();
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const gpu = typeof navigator !== 'undefined' && !!navigator.gpu;
  const shards = fx && gpu && failed === false;
  if (shards === false) return <DustRing still={reduced} />;
  return (
    <Fallback fallback={<DustRing still={reduced} />}>
      <Suspense fallback={null}>
        <AeroShards {...presets.AeroShardsRing} onError={() => setFailed(true)} />
      </Suspense>
    </Fallback>
  );
}

// First screen of every visit: ask before any sound plays. "Enter with sound" starts her at-home grand
// recording inside that click; "Enter quietly" keeps the site silent (the nav can still turn it on).
function Gate({ closing }) {
  const { enter } = useSound();
  const ref = useRef(null);

  useEffect(() => {
    // Focus the dialog, not the button: keyboard users Tab straight to it, and nobody sees a ring they didn't ask for.
    ref.current?.focus({ preventScroll: true });
    const root = document.getElementById('root');
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    if (root) root.inert = true;
    const onKey = e => {
      if (e.key !== 'Tab') return;
      const items = ref.current.querySelectorAll('button');
      const a = items[0];
      const b = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      if (root) root.inert = false;
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!closing) return;
    const root = document.getElementById('root');
    if (root) root.inert = false;
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [closing]);

  return (
    <div
      ref={ref}
      className={`gate stage${closing ? ' gate--closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-h"
      aria-describedby="gate-d"
      tabIndex={-1}
    >
      <div className="gate__ring" aria-hidden="true">
        <Ring />
      </div>
      <div className="gate__content">
        <div className="gate__mark" style={{ '--i': 0 }}>
          <Keys />
          <span className="gate__name">Selin Incekara</span>
        </div>
        <h2 className="gate__title" id="gate-h" style={{ '--i': 1 }}>
          Hear her play
          <br />
          while you browse
        </h2>
        <p className="gate__lead" id="gate-d" style={{ '--i': 2 }}>
          We recommend sound on: her grand piano recording from home plays as you look around.
        </p>
        <div className="gate__actions" style={{ '--i': 3 }}>
          <button type="button" className="gate__sound" onClick={() => enter(true)}>
            <span className="gate__sound-icon" aria-hidden="true">
              <span className="gate__wave">
                <span />
                <span />
                <span />
              </span>
            </span>
            <span className="gate__sound-label">Enter with sound</span>
          </button>
          <button type="button" className="gate__quiet" onClick={() => enter(false)}>
            Enter quietly
          </button>
        </div>
      </div>
    </div>
  );
}

// Stays mounted through the fade-out after a choice, so the page rises up through the ring.
export default function SoundGate() {
  const { gate } = useSound();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(gate);

  useEffect(() => {
    if (gate) {
      setShown(true);
      return undefined;
    }
    const t = setTimeout(() => setShown(false), reduced ? 0 : 900);
    return () => clearTimeout(t);
  }, [gate, reduced]);

  if (!shown) return null;
  return createPortal(<Gate closing={!gate} />, document.body);
}
