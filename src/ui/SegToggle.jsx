// Saver — animated segmented control. A single thumb slides between options
// instead of the background snapping per-button. Drop-in for 2+ equal options.
import { useLang } from "../lib/i18n.js";

export default function SegToggle({ options, value, onChange, style }) {
  const { dir } = useLang();
  const n = options.length;
  const idx = Math.max(0, options.findIndex((o) => o.id === value));
  const visualIdx = dir === "rtl" ? (n - 1 - idx) : idx;
  return (
    <div className="segx" style={style}>
      <span className="seg-thumb" style={{ width: `calc((100% - 10px) / ${n})`, transform: `translateX(${visualIdx * 100}%)` }} />
      {options.map((o) => (
        <b key={o.id} className={o.id === value ? "on" : ""} onClick={() => onChange(o.id)}>{o.label}</b>
      ))}
    </div>
  );
}
