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

export function Keys({ loading = false }) {
  return (
    <div
      className={`keys${loading ? ' keys--loading' : ''}`}
      {...(loading ? { role: 'status', 'aria-label': 'Loading' } : { 'aria-hidden': true })}
    >
      <span className="keys__group">
        <span className="keys__key" style={{ animationDelay: '0ms' }} />
        <span className="keys__key" style={{ animationDelay: '120ms' }} />
      </span>
      <span className="keys__group">
        <span className="keys__key" style={{ animationDelay: '240ms' }} />
        <span className="keys__key" style={{ animationDelay: '360ms' }} />
        <span className="keys__key" style={{ animationDelay: '480ms' }} />
      </span>
    </div>
  );
}
