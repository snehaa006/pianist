import FoldText from './fx/FoldText/FoldText.jsx';
import { presets } from './fx/presets';
import { useReducedMotion } from '../lib/hooks';

// Screen headline. Letters unfold on a bottom hinge as the line scrolls in (FoldText preset).
// One FoldText per word so lines only ever break between words. Reduced motion: plain text.
export default function Headline({ as: Tag = 'h2', className = 'h1', id, children }) {
  const reduced = useReducedMotion();
  const text = String(children);

  if (reduced) {
    return (
      <Tag id={id} className={`headline ${className}`}>
        {text}
      </Tag>
    );
  }

  const words = text.split(' ');
  return (
    <Tag id={id} className={`headline ${className}`}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <FoldText
            {...presets.FoldText}
            text={word}
            color="currentColor"
            fontSize="inherit"
            style={{ ...presets.FoldText.style, lineHeight: 'inherit' }}
          />
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
