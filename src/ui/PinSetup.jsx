// Two-step PIN setup overlay: enter a 4-digit PIN, then confirm it.
import { useState } from "react";
import Ico from "./Ico.jsx";
import { useT } from "../lib/i18n.js";

export default function PinSetup({ onDone, onCancel }) {
  const tr = useT();
  const [step, setStep] = useState(0); // 0 = enter, 1 = confirm
  const [first, setFirst] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  const commit = (value) => {
    if (step === 0) { setFirst(value); setPin(""); setStep(1); return; }
    if (value === first) { onDone?.(value); }
    else { setErr(true); setPin(""); setFirst(""); setStep(0); setTimeout(() => setErr(false), 600); }
  };

  const tap = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) setTimeout(() => commit(next), 120);
  };
  const del = () => setPin((p) => p.slice(0, -1));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)", userSelect: "none" }}>
      <div style={{ position: "absolute", top: "calc(var(--safe-top) + 14px)", left: 16 }} onClick={onCancel}>
        <div className="hib"><Ico name="back" size={20} /></div>
      </div>
      <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
        {step === 0 ? tr("lock.setPin") : tr("lock.confirmPin")}
      </div>
      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 26 }}>
        {step === 0 ? tr("lock.setPinSub") : tr("lock.confirmPinSub")}
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 32, animation: err ? "shake .4s" : "none" }}>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}`}</style>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 13, height: 13, borderRadius: 99, background: i < pin.length ? "var(--ac)" : "transparent", border: "2px solid var(--ac)" }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,72px)", gap: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} onClick={() => tap(String(n))} style={key}>{n}</button>
        ))}
        <div />
        <button onClick={() => tap("0")} style={key}>0</button>
        <button onClick={del} style={{ ...key, fontSize: 20 }}>⌫</button>
      </div>
    </div>
  );
}

const key = { width: 72, height: 72, borderRadius: 99, background: "var(--surface)", border: "var(--cardBorder)", color: "var(--text)", fontSize: 26, fontWeight: 600, cursor: "pointer" };
