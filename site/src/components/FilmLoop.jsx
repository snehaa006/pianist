// A film's 6 s muted loop over its still. The still is an image of its own under the video, so the frame shows it at
// once and keeps it until the loop has a frame to show (a video's own poster goes blank in Safari while the loop
// loads); the video fades in once it plays. It never starts by itself: the home reel (lib/flyIn.js) fetches it ahead
// as the reel comes near, plays it while it can be seen and pauses it otherwise.
export default function FilmLoop({ item, className = '', style }) {
  return (
    <span className={`loop ${className}`} style={style} aria-hidden="true">
      <img src={item.poster} alt="" width="1024" height="576" decoding="async" />
      <video muted loop playsInline preload="none" onPlaying={e => e.currentTarget.classList.add('is-on')}>
        {item.loop.map(s => (
          <source key={s.type} src={s.src} type={s.type} />
        ))}
      </video>
    </span>
  );
}
