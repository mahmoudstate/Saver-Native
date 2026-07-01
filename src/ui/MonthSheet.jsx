// Saver — quick month picker sheet: year nav + a 12-month grid (one tap to any
// month). Future months past `max` are disabled. Used for the Budgets month filter.
import { useState } from "react";
import Ico from "./Ico.jsx";
import { monthName, currentMonth } from "../lib/format.js";

const pad = (n) => String(n).padStart(2, "0");

export default function MonthSheet({ value, max = currentMonth(), onPick, onClose }) {
  const sel = value || currentMonth();
  const [year, setYear] = useState(+sel.slice(0, 4));
  const maxYear = +max.slice(0, 4);

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label="Pick a month">
        <div className="grab" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="hib" onClick={() => setYear((y) => y - 1)}><Ico name="back" size={18} /></div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{year}</div>
          <div className="hib" onClick={() => year < maxYear && setYear((y) => y + 1)} style={{ transform: "scaleX(-1)", opacity: year >= maxYear ? .3 : 1 }}><Ico name="back" size={18} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
          {Array.from({ length: 12 }, (_, i) => {
            const ym = `${year}-${pad(i + 1)}`;
            const on = ym === sel, future = ym > max;
            return (
              <div key={ym} onClick={() => !future && onPick(ym)} style={{ textAlign: "center", padding: "14px 0", borderRadius: 13, cursor: future ? "default" : "pointer", fontWeight: on ? 800 : 700, fontSize: 14, ...(on ? { background: "var(--ac)", color: "var(--onacc)" } : future ? { background: "var(--surface2)", color: "var(--faint)", opacity: .5 } : { background: "var(--surface2)", color: "var(--text)" }) }}>{monthName(i)}</div>
            );
          })}
        </div>
      </div>
    </>
  );
}
