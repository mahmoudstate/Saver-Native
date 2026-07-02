// Saver — reusable amount entry bottom sheet (keypad + optional source-bank picker).
// Used for "Add money" (pick a source bank) and "Return to bank" (auto-split, no source).
import { useState } from "react";
import Ico from "./Ico.jsx";
import PickerSheet from "./PickerSheet.jsx";
import { fmt } from "../lib/format.js";
import { calcBankBalance, calcFrozenForBank } from "../lib/calc.js";
import { bankIcon } from "../lib/bankIcon.js";
import { useT } from "../lib/i18n.js";

export default function AmountSheet({ title, sub, confirmLabel = "Confirm", max, banks, txns, savings, onConfirm, onClose }) {
  const [amt, setAmt] = useState("");
  const liveBanks = banks?.filter((b) => !b.archived) || [];
  const [bankId, setBankId] = useState(liveBanks[0]?.id || null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const val = parseFloat(amt) || 0;
  const over = max != null && val > max;
  const ok = val > 0 && !over;
  const tr = useT();
  const bank = liveBanks.find((b) => b.id === bankId);
  const available = (id) => txns ? calcBankBalance(id, txns) - Math.max(0, calcFrozenForBank(id, savings || [], txns)) : null;

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

        {banks && bank && (
          <div className="field" onClick={() => setPickerOpen(true)} style={{ cursor: "pointer", margin: "6px 0 14px" }}>
            <span className="circ" style={{ width: 34, height: 34, borderRadius: 10, background: `color-mix(in srgb, ${bank.color || "var(--muted)"} 20%, transparent)`, color: bank.color || "var(--muted)" }}>
              <Ico name={bankIcon(bank.glyph)} size={16} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="fv" style={{ fontWeight: 700 }}>{bank.name}</div>
              {available(bank.id) != null && <div className="caption" style={{ marginTop: 1 }}>{tr("ui.available", { amt: fmt(available(bank.id)) })}</div>}
            </div>
            <span className="chev"><Ico name="chev" size={18} color="var(--faint)" /></span>
          </div>
        )}

        {pickerOpen && (
          <PickerSheet title={tr("add.pickAccount")} selectedId={bankId}
            options={liveBanks.map((b) => ({ id: b.id, label: b.name, bankColor: b.color, glyph: b.glyph, sub: available(b.id) != null ? tr("ui.available", { amt: fmt(available(b.id)) }) : undefined }))}
            onPick={setBankId} onClose={() => setPickerOpen(false)} />
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
