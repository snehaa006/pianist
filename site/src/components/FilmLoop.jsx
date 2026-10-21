// A film's 6 s muted loop over its still. It never starts by itself: the home reel (lib/flyIn.js) plays it while
// it can be seen and pauses it otherwise.
export default function FilmLoop({ item, className, style }) {
  return (
    <video className={className} style={style} poster={item.poster} muted loop playsInline preload="none" aria-hidden="true">
      {item.loop.map(s => (
        <source key={s.type} src={s.src} type={s.type} />
      ))}
    </video>
  );
}
