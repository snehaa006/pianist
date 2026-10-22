import { useRef } from 'react';
import { useScrub } from '../lib/hooks';

// Text that is read as the page moves: every word starts faded and comes up to full, one after another, as the lines
// pass up the screen, and fades back when the page is scrolled back (useScrub, eased). `accents` are phrases of the
// text to stand out: the accent colour, set heavier. With reduced motion the text is simply there.
const progress = (r, vh) => (vh * 0.88 - r.top) / (vh * 0.33 + r.height);

export default function ScrubText({ as: Tag = 'p', text, accents = [], className = '' }) {
  const ref = useRef(null);
  useScrub(ref, progress);
  const ranges = accents
    .map(a => [text.indexOf(a), a.length])
    .filter(([at]) => at >= 0)
    .map(([at, len]) => [at, at + len]);
  let at = 0;
  const words = text.split(' ').map(word => {
    const start = at;
    at += word.length + 1;
    return { word, accent: ranges.some(([a, b]) => start < b && start + word.length > a) };
  });
  return (
    <Tag ref={ref} className={`scrub ${className}`} style={{ '--n': words.length }}>
      {words.map((w, i) => (
        <span key={i} className={w.accent ? 'scrub__w scrub__w--accent' : 'scrub__w'} style={{ '--i': i }}>
          {w.word}
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
