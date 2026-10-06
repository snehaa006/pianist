import FoldText from './fx/FoldText/FoldText.jsx';
import { presets } from './fx/presets';
import { useReducedMotion } from '../lib/hooks';

// Screen headline. Letters unfold as the line scrolls in (FoldText preset); `hinge` varies the fold
// per screen (bottom, top, left, right). One FoldText per word so lines only break between words.
// `accent` names one word to switch to --fg-muted on ivory, brass on ink (emphasis without weight).
// Reduced motion: plain text.
export default function Headline({ as: Tag = 'h2', className = 'h1', id, hinge = 'bottom', accent, children }) {
  const reduced = useReducedMotion();
  const words = String(children).split(' ');

  return (
    <Tag id={id} className={`headline ${className}`}>
      {words.map((word, i) => {
        const content = reduced ? (
          word
        ) : (
          <FoldText
            {...presets.FoldText}
            hinge={hinge}
            text={word}
            color="currentColor"
            fontSize="inherit"
            style={{ ...presets.FoldText.style, lineHeight: 'inherit' }}
          />
        );
        return (
          <span key={`${word}-${i}`} className={accent && word === accent ? 'accent-word' : undefined}>
            {content}
            {i < words.length - 1 ? ' ' : null}
          </span>
        );
      })}
    </Tag>
  );
}
