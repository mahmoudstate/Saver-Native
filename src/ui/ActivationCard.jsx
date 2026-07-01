// Saver — first-run setup guide. Two phases the user works through (or skips):
//   1. Your money    → add an account, then a first transaction
//   2. Stay on track → add a bill, then a goal
// Each step auto-checks off from real data; skips persist in localStorage. The
// whole card disappears once every step is done or skipped.
import { useState } from "react";
import Ico from "./Ico.jsx";
import { useT } from "../lib/i18n.js";

const SKIP_KEY = "et_setupSkipped";

export default function ActivationCard({ store, onAdd, onAddAccount, onAddBill, onAddGoal }) {
  const tr = useT();
  const { txns = [], banks = [], bills = [], savings = [] } = store;
  const [skipped, setSkipped] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(SKIP_KEY) || "[]")); } catch { return new Set(); }
  });
  const skip = (...ids) => setSkipped((prev) => {
    const next = new Set(prev); ids.forEach((id) => next.add(id));
    try { localStorage.setItem(SKIP_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
    return next;
  });

  const phases = [
    { id: 1, title: tr("setup.phaseMoney"), steps: [
      { id: "account", label: tr("setup.account"), icon: "wallet", done: banks.length > 0, action: onAddAccount },
      { id: "txn", label: tr("setup.txn"), icon: "plus", done: txns.length > 0, action: onAdd },
    ] },
    { id: 2, title: tr("setup.phaseTrack"), steps: [
      { id: "bill", label: tr("setup.bill"), icon: "bills", done: bills.length > 0, action: onAddBill },
      { id: "goal", label: tr("setup.goal"), icon: "target", done: savings.some((s) => s.status !== "archived"), action: onAddGoal },
    ] },
  ];
  const resolved = (s) => s.done || skipped.has(s.id);
  const phase = phases.find((p) => p.steps.some((s) => !resolved(s)));
  if (!phase) return null; // every step done or skipped → hide for good

  let firstActive = true;
  return (
    <div className="icard" style={{ flexDirection: "column", alignItems: "stretch", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 38, height: 38, borderRadius: 12, background: "color-mix(in srgb, var(--ac) 16%, transparent)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ico name="sparkles" size={20} />
        </span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.2 }}>{tr("setup.title")}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{tr("setup.step", { n: phase.id, phase: phase.title })}</div>
        </div>
      </div>

      {phase.steps.map((s) => {
        if (s.done) return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.6 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name="check" size={16} /></span>
            <div style={{ fontSize: 14, fontWeight: 700, textDecoration: "line-through" }}>{s.label}</div>
          </div>
        );
        if (skipped.has(s.id)) return null;
        const primary = firstActive; firstActive = false;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className={`btn ${primary ? "btn-primary" : ""} btn-full`} onClick={s.action} style={{ flex: 1, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", ...(primary ? {} : { background: "var(--surface2)", color: "var(--acText)" }) }}>
              <Ico name={s.icon} size={18} /> {s.label}
            </div>
            <div role="button" aria-label={`${tr("setup.skip")} ${s.label}`} onClick={() => skip(s.id)} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", cursor: "pointer", padding: "0 6px", flexShrink: 0 }}>{tr("setup.skip")}</div>
          </div>
        );
      })}

      <div role="button" onClick={() => skip(...phase.steps.map((s) => s.id))} style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, color: "var(--faint)", cursor: "pointer" }}>{tr("setup.skipForNow")}</div>
    </div>
  );
}
