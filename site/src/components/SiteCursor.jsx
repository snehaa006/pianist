import { lazy, Suspense } from 'react';
import { presets } from './fx/presets';
import { useFx } from '../lib/hooks';

// The one cursor effect on the site: GhostCursor, desktop only, mounted inside a stage section
// (it binds to its parent element). three.js is loaded only when the effect is allowed.
const GhostCursor = lazy(() => import('./fx/GhostCursor/GhostCursor.jsx'));

export default function SiteCursor() {
  const fx = useFx();
  if (!fx) return null;
  return (
    <Suspense fallback={null}>
      <GhostCursor {...presets.GhostCursor} />
    </Suspense>
  );
}
