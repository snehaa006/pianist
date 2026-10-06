// Opus tag, e.g. (Op. 01: Concerts). Its tracking closes in from wide to label width as it arrives.
export default function Opus({ children }) {
  return <span className="opus reveal reveal--track">{children}</span>;
}
