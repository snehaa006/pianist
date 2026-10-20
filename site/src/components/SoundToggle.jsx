import { useSound } from '../lib/sound.jsx';

// "Hear me play": the one way the site sound starts, and the visible stop control once it has.
// Three bars move while the piano plays, and rest when it doesn't.
export default function SoundToggle({ className = '' }) {
  const { wanted, playing, toggle } = useSound();
  return (
    <button
      type="button"
      className={`sound-toggle${playing ? ' is-playing' : ''} ${className}`}
      aria-label={wanted ? 'Pause the piano' : 'Hear me play'}
      onClick={toggle}
    >
      <span className="sound-toggle__pill">
        <span className="sound-toggle__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sound-toggle__text" aria-hidden="true">
          {wanted ? 'Pause' : 'Hear me play'}
        </span>
      </span>
    </button>
  );
}
