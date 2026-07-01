// Saver — animated budget donut: total spent vs total limit for a month. The ring
// sweeps from empty to its value on mount; colour reflects health (ac / yellow / red).
import { useState, useEffect } from "react";
import { fmt } from "../lib/format.js";

export default function BudgetRing({ spent, total, size = 132, stroke = 14 }) {
  const pct = total > 0 ? Math.min(100, (spent / total) * 100) : 0;
  const over = total > 0 && spent > total;
  const col = over ? "var(--red)" : pct >= 80 ? "var(--yellow)" : "var(--ac)";
  const r = size / 2 - stroke / 2;
  const C = 2 * Math.PI * r;
  const [fill, setFill] = useState(0);
  useEffect(() => { const t = setTimeout(() => setFill(pct), 70); return () => { clearTimeout(t); setFill(0); }; }, [pct]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={C.toFixed(1)} strokeDashoffset={(C * (1 - fill / 100)).toFixed(1)}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.3,.8,.3,1), stroke .3s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <b className="tnum" style={{ fontSize: 27, fontWeight: 800, letterSpacing: -1, color: col }}>{Math.round(pct)}%</b>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginTop: 1 }}>used</span>
      </div>
    </div>
  );
}
