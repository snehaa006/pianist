import { site } from '../data/site';

// Her teachers, programme-style: what each one teaches her, then their name, between hairlines.
export default function Teachers({ className = '', style }) {
  return (
    <div className={`teachers ${className}`} style={style}>
      <p className="label muted teachers__title">Her teachers</p>
      <dl className="teachers__list">
        {site.teachers.map(t => (
          <div className="teachers__row" key={t.subject}>
            <dt className="label muted">{t.subject}</dt>
            <dd className="teachers__name">{t.name}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
