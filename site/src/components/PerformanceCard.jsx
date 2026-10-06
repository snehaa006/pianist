import { useLightbox } from './Lightbox.jsx';
import { metaOf } from '../data/performances';

// A filmed performance: 16:9 warm-monochrome still, play circle, composer / work / where.
export default function PerformanceCard({ item, index = 0, size = 'md', eager = false }) {
  const { open } = useLightbox();
  return (
    <article className={`film film--${size} reveal`} style={{ '--i': index }}>
      <button
        type="button"
        className="film__button"
        aria-label={`Watch ${item.composer}: ${item.work}, ${item.duration}`}
        onClick={e => open(item, e.currentTarget)}
      >
        <span className="film__frame frame scrim ratio-16x9">
          <img
            src={item.poster}
            alt={item.alt}
            width="1024"
            height="576"
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
          <span className="play film__play" aria-hidden="true">
            ▶
          </span>
          <span className="film__duration label" aria-hidden="true">
            {item.duration}
          </span>
        </span>
      </button>
      <div className="film__text">
        <span className="label muted">{item.composer}</span>
        <h3 className="h3 film__title">{item.work}</h3>
        <p className="body-sm muted film__meta">{metaOf(item)}</p>
      </div>
    </article>
  );
}
