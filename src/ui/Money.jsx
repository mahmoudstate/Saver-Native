// Saver — big-amount renderer: shows the currency part smaller/lighter than the
// number so a long code (e.g. "EGP") never matches the size of a big total.
import { fmtParts } from "../lib/format.js";

export default function Money({ v, sign = "", masked = false, className = "", style, curSize = 0.55 }) {
  if (masked) return <span className={className} style={style}>••••</span>;
  const { cur, num } = fmtParts(v);
  return (
    <span className={className} style={style}>
      {cur && <span style={{ fontSize: `${curSize}em`, fontWeight: 700, opacity: 0.55, marginRight: "0.18em" }}>{cur}</span>}
      {sign}{num}
    </span>
  );
}
