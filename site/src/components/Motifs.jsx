import { strike } from '../lib/tone';
import { letNotes } from '../lib/notes';

// Music motifs, used sparingly: staff lines (once per page) and the 2–3 black-key rhythm.

export function Staff() {
  return (
    <div className="staff" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

// `playable`: the five are an octave's black keys (C♯ D♯, F♯ G♯ A♯ above middle C) and sound when pressed.
const BLACKS = [61, 63, 66, 68, 70];

function press(e) {
  const key = e.target.closest('[data-note]');
  if (!key) return;
  strike(Number(key.dataset.note));
  key.classList.add('is-down');
  setTimeout(() => key.classList.remove('is-down'), 220);
  const box = key.getBoundingClientRect();
  letNotes(box.left + box.width / 2, box.top, { count: 2, tones: ['ink', 'ivory'], seed: Number(key.dataset.note) });
}

export function Keys({ loading = false, playable = false }) {
  const key = i => (
    <span className="keys__key" style={{ animationDelay: `${i * 120}ms` }} data-note={playable ? BLACKS[i] : undefined} />
  );
  return (
    <div
      className={`keys${loading ? ' keys--loading' : ''}${playable ? ' keys--play' : ''}`}
      {...(loading ? { role: 'status', 'aria-label': 'Loading' } : { 'aria-hidden': true })}
      onPointerDown={playable ? press : undefined}
    >
      <span className="keys__group">
        {key(0)}
        {key(1)}
      </span>
      <span className="keys__group">
        {key(2)}
        {key(3)}
        {key(4)}
      </span>
    </div>
  );
}
