// Saver — reusable amount entry bottom sheet (keypad + optional source-bank picker).
// Used for "Add money" (pick a source bank) and "Return to bank" (auto-split, no source).
import { useState } from "react";
import Ico from "./Ico.jsx";
import { fmt } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

export default function AmountSheet({ title, sub, confirmLabel = "Confirm", max, banks, onConfirm, onClose }) {
  const [amt, setAmt] = useState("");
  const [bankId, setBankId] = useState(banks?.[0]?.id || null);
  const val = parseFloat(amt) || 0;
  const over = max != null && val > max;
  const ok = val > 0 && !over;
  const tr = useT();

  const press = (k) => {
    setAmt((s) => {
      if (k === "del") return s.slice(0, -1);
      if (k === ".") return s.includes(".") ? s : (s || "0") + ".";
      if (s.includes(".") && s.split(".")[1].length >= 2) return s; // cap 2 decimals
      return (s === "0" ? "" : s) + k;
    });
  };

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="grab" />
        <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
          <div><div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -.3 }}>{title}</div>{sub && <div className="caption" style={{ marginTop: 2 }}>{sub}</div>}</div>
          <div className="grow" style={{ flex: 1 }} />
          <div className="hib" style={{ background: "var(--surface2)", color: "var(--muted)" }} onClick={onClose}><Ico name="close" size={18} /></div>
        </div>

        <div style={{ textAlign: "center", padding: "14px 0 6px" }}>
          <div className="tnum" style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5, color: over ? "var(--red)" : "var(--text)" }}>{amt ? fmt(val) : fmt(0)}</div>
          {max != null && <div className="caption" style={{ marginTop: 4, color: over ? "var(--red)" : "var(--muted)" }}>{over ? tr("ui.max", { amt: fmt(max) }) : tr("ui.available", { amt: fmt(max) })}</div>}
        </div>

        {banks && (
          <div className="hscroll" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "6px 0 14px" }}>
            {banks.filter((b) => !b.archived).map((b) => (
              <button key={b.id} onClick={() => setBankId(b.id)} className="chip" style={bankId === b.id ? { background: "var(--acDim)", color: "var(--acText)", borderColor: "transparent" } : {}}>
                <span style={{ width: 16, height: 16, borderRadius: 5, background: b.color || "var(--muted)", display: "inline-block" }} />{b.name}
              </button>
            ))}
          </div>
        )}

        <div className="kbd">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((k) => (
            <button key={k} onClick={() => press(k)}>{k === "del" ? <Ico name="back" size={20} /> : k}</button>
          ))}
        </div>

        <button className="btn btn-primary btn-full" style={{ marginTop: 14, opacity: ok ? 1 : .5 }} disabled={!ok} onClick={() => ok && onConfirm(val, bankId)}>{confirmLabel}</button>
      </div>
    </>
  );
}
