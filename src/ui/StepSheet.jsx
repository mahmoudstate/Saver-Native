// Saver — simple counter sheet: − value + with optional quick-pick chips.
// Clearer than a keypad for small bounded whole numbers (pay-ahead, months,
// already-paid). No typing, no ambiguity.
import { useState } from "react";
import Ico from "./Ico.jsx";
import { useT } from "../lib/i18n.js";

export default function StepSheet({ title, sub, value = 1, min = 1, max = 9999, step = 1, suffix, picks = [], onConfirm, onClose }) {
  const clamp = (x) => Math.min(max, Math.max(min, x));
  const [n, setN] = useState(clamp(value || min));
  const chips = [...new Set(picks.filter((p) => p >= min && p <= max))];
  const tr = useT();

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="grab" />
        <div className="sectit" style={{ margin: "0 2px 2px" }}><div className="t">{title}</div></div>
        {sub && <div className="caption" style={{ textAlign: "center", marginBottom: 2 }}>{sub}</div>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, margin: "16px 0" }}>
          <button className="stepbtn" onClick={() => setN((v) => clamp(v - step))} disabled={n <= min} aria-label={tr("ui.less")}><Ico name="minus" size={22} /></button>
          <div className="tnum" style={{ minWidth: 92, textAlign: "center", fontSize: 46, fontWeight: 800, letterSpacing: -1.5 }}>{n}{suffix ? ` ${suffix}` : ""}</div>
          <button className="stepbtn" onClick={() => setN((v) => clamp(v + step))} disabled={n >= max} aria-label={tr("ui.more")}><Ico name="plus" size={22} /></button>
        </div>
        {chips.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {chips.map((p) => (
              <span key={p} onClick={() => setN(p)} style={{ padding: "8px 16px", borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: "pointer", background: n === p ? "var(--ac)" : "var(--surface2)", color: n === p ? "var(--onacc)" : "var(--text)" }}>{p}</span>
            ))}
          </div>
        )}
        <div className="btn btn-primary btn-full" onClick={() => onConfirm(clamp(n))}>{tr("ui.done")}</div>
      </div>
    </>
  );
}
