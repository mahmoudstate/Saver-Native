// Saver — pick a day of the month (1–28) from a calendar-style grid. Clearer than
// a number keypad for a day. Tap a day to confirm. Used for billing / due day.
import { useT } from "../lib/i18n.js";

export default function DayGridSheet({ title = "Day of month", sub = "Pick the day the payment lands.", value, onConfirm, onClose }) {
  const tr = useT();
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>{title}</div>
        <div className="caption" style={{ margin: "3px 0 16px" }}>{sub}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
          {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => {
            const on = value === d;
            return (
              <span key={d} onClick={() => onConfirm(d)} className="circ tnum" style={{ aspectRatio: "1", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer", background: on ? "var(--ac)" : "var(--surface2)", color: on ? "var(--onacc)" : "var(--text)" }}>{d}</span>
            );
          })}
        </div>
        <div className="caption" style={{ textAlign: "center", marginTop: 14 }}>{tr("common.daysFootnote")}</div>
      </div>
    </>
  );
}
