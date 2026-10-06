import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Order matters: tokens → base components → (component CSS, imported by each component) → overrides → page layout.
import './styles/tokens.css';
import './styles/components.css';
// Every client component's CSS loads up front, so the overrides below always come after it,
// even for components that are code-split and arrive later.
import './components/fx/MaskedHeading/MaskedHeading.css';
import './components/fx/FoldText/FoldText.css';
import './components/fx/CircularText/CircularText.css';
import './components/fx/OptionWheel/OptionWheel.css';
import './components/fx/GooeyNav/GooeyNav.css';
import './components/fx/BorderGlow/BorderGlow.css';
import './components/fx/MicroSlats/MicroSlats.css';
import './components/fx/MoltenMetal/MoltenMetal.css';
import './components/fx/AeroShards/AeroShards.css';
import './components/fx/RippleDistortion/RippleDistortion.css';
import './components/fx/DepthText/DepthText.css';
import './components/fx/GhostCursor/GhostCursor.css';
import App from './App.jsx';
import './components/fx/pianist-overrides.css';
import './styles/site.css';

// FoldText measures its scroll triggers on mount. Bebas Neue is narrower than the fallback face, so once it
// loads the page gets shorter; re-measure then, or headlines near the bottom would never unfold.
document.fonts?.load('1em "Bebas Neue"').then(() => requestAnimationFrame(() => ScrollTrigger.refresh()));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
