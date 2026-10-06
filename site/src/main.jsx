import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Order matters: tokens → base components → (component CSS, imported by each component) → overrides → page layout.
import './styles/tokens.css';
import './styles/components.css';
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
