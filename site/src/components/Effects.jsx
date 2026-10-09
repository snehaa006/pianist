import { Component, lazy, Suspense, useState } from 'react';
import { presets } from './fx/presets';
import { useFxSlot } from '../lib/fxStage.jsx';

// Every canvas/WebGL component is loaded on demand, only on desktop, and only while its section
// holds the stage (see lib/fxStage.jsx). Phones, touch and reduced motion never download them.
const MicroSlats = lazy(() => import('./fx/MicroSlats/MicroSlats.jsx'));
const MoltenMetal = lazy(() => import('./fx/MoltenMetal/MoltenMetal.jsx'));
const AeroShards = lazy(() => import('./fx/AeroShards/AeroShards.jsx'));

// If an effect fails (no WebGL, no WebGPU), the still underneath simply stays.
class Quiet extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Slot({ zoneRef, children }) {
  const on = useFxSlot(zoneRef);
  if (!on) return null;
  return (
    <Quiet>
      <Suspense fallback={null}>{children}</Suspense>
    </Quiet>
  );
}

// Hammers rising and falling behind the repertoire band.
export function SlatsLayer({ zoneRef }) {
  return (
    <div className="fx-layer" aria-hidden="true">
      <Slot zoneRef={zoneRef}>
        <MicroSlats {...presets.MicroSlats} />
      </Slot>
    </div>
  );
}

// Slow brass-and-ink wash, always under a 72% ink scrim.
export function MoltenLayer({ zoneRef }) {
  return (
    <div className="fx-layer fx-layer--scrim" aria-hidden="true">
      <Slot zoneRef={zoneRef}>
        <MoltenMetal {...presets.MoltenMetal} />
      </Slot>
    </div>
  );
}

// Drifting satin shards on the right (WebGPU). Falls back to nothing on browsers without it.
export function ShardsLayer({ zoneRef, onFail }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  if (typeof navigator !== 'undefined' && !navigator.gpu) return null;
  return (
    <div className="fx-layer" aria-hidden="true">
      <Slot zoneRef={zoneRef}>
        <AeroShards
          {...presets.AeroShards}
          onError={() => {
            setFailed(true);
            onFail?.();
          }}
        />
      </Slot>
    </div>
  );
}

