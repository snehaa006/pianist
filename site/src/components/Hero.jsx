import { useMemo, useRef } from 'react';
import MaskedHeading from './fx/MaskedHeading/MaskedHeading.jsx';
import { presets } from './fx/presets';
import { CursorLayer } from './Effects.jsx';
import { useLightbox } from './Lightbox.jsx';
import { useFx } from '../lib/hooks';

// Screen 1: the name, one current fact, one action.
// Desktop: the name is filled with a muted loop of the concert (MaskedHeading).
// Phones, touch and reduced motion: a plain ivory wordmark over a warm-monochrome still.
export default function Hero({ item }) {
  const fx = useFx();
  const { open } = useLightbox();
  const zone = useRef(null);
  // MaskedHeading takes one source: H.264 where the browser has it, VP9 WebM otherwise.
  const loop = useMemo(() => {
    const v = document.createElement('video');
    return v.canPlayType('video/mp4; codecs="avc1.640028"') ? '/media/video/hero-loop.mp4' : '/media/video/hero-loop.webm';
  }, []);

  return (
    <section ref={zone} className="stage screen hero" aria-labelledby="name">
      {fx ? (
        <CursorLayer zoneRef={zone} />
      ) : (
        <div className="hero__media frame scrim">
          <img src="/media/posters/hero.webp" alt={item.alt} width="848" height="480" fetchPriority="high" />
        </div>
      )}
      <div className="container hero__content">
        {fx ? (
          <MaskedHeading
            {...presets.MaskedHeading}
            id="name"
            className="hero__masked"
            text="Srinijakara"
            src={loop}
            poster="/media/posters/hero-fill.webp"
            grayscale={false}
            textScale={0.259}
            maxFontSize={360}
          />
        ) : (
          <h1 className="wordmark hero__wordmark" id="name" aria-label="Srinijakara">
            <span aria-hidden="true">Srini</span>
            <span aria-hidden="true">jakara</span>
          </h1>
        )}
        <p className="lead hero__lead reveal reveal--rise" style={{ '--i': 6 }}>
          Watch {item.composer}'s {item.work}, filmed at an Austrian Master Classes concert in {item.year}.
        </p>
        <div className="hero__actions reveal" style={{ '--i': 10 }}>
          <button type="button" className="btn btn--primary btn--lg btn--block-mobile" onClick={e => open(item, e.currentTarget)}>
            Watch the performance
          </button>
        </div>
      </div>
    </section>
  );
}
