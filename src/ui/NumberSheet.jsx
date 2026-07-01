// Saver — reusable whole-number entry sheet (quick-pick chips + keypad).
// Ported from showcase 52 ("focused edit sheet"). Used for Months / Due day /
// Already paid / Remind me — anywhere a stepper isn't enough and you want to type.
import { useState } from "react";
import Ico from "./Ico.jsx";
import { useT } from "../lib/i18n.js";

export default function NumberSheet({ title, sub, value, picks = [], min = 0, max = 9999, suffix, onConfirm, onClose }) {
  const [s, setS] = useState(value != null && value !== "" ? String(value) : "");
  const n = parseInt(s) || 0;
  const clamp = (x) => Math.min(max, Math.max(min, x));
  // picks can be plain numbers or { value, label } for friendlier chips.
  const chips = picks.map((p) => (typeof p === "object" ? p : { value: p, label: String(p) }));
  const press = (k) => setS((prev) => {
    if (k === "del") return prev.slice(0, -1);
    const nx = (prev === "0" ? "" : prev) + k;
    return parseInt(nx) > max ? String(max) : nx;
  });
  const done = () => onConfirm(clamp(n));
  const tr = useT();

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="grab" />
        <div className="sectit" style={{ margin: "0 2px 2px" }}><div className="t">{title}</div></div>
        {sub && <div className="caption" style={{ textAlign: "center", marginBottom: 2 }}>{sub}</div>}
        <div className="tnum" style={{ textAlign: "center", fontSize: 46, fontWeight: 800, letterSpacing: -1.5, margin: "6px 0 14px" }}>{s || 0}{suffix ? ` ${suffix}` : ""}</div>
        {chips.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {chips.map((p) => {
              const on = n === p.value;
              return <span key={p.value} onClick={() => setS(String(p.value))} style={{ padding: "8px 16px", borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: "pointer", background: on ? "var(--ac)" : "var(--surface2)", color: on ? "var(--onacc)" : "var(--text)" }}>{p.label}</span>;
            })}
          </div>
        )}
        <div className="kbd" style={{ marginBottom: 14 }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => <button key={k} onClick={() => press(k)}>{k}</button>)}
          <span aria-hidden />
          <button onClick={() => press("0")}>0</button>
          <button onClick={() => press("del")}><Ico name="back" size={20} /></button>
        </div>
        <div className="btn btn-primary btn-full" onClick={done}>{tr("ui.done")}</div>
      </div>
    </>
  );
}
