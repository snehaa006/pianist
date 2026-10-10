import { useSound } from '../lib/sound.jsx';

// The visible stop control for the site sound. Three bars move while the piano plays, and rest when it doesn't.
export default function SoundToggle({ className = '' }) {
  const { wanted, playing, toggle } = useSound();
  return (
    <button
      type="button"
      className={`sound-toggle${playing ? ' is-playing' : ''} ${className}`}
      aria-pressed={wanted}
      aria-label={wanted ? 'Sound on: stop the piano' : 'Sound off: play the piano'}
      onClick={toggle}
    >
      <span className="sound-toggle__pill">
        <span className="sound-toggle__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sound-toggle__text" aria-hidden="true">
          {wanted ? 'Sound on' : 'Sound off'}
        </span>
      </span>
    </button>
  );
}
