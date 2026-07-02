// Full-screen lock gate. Prompts biometric on mount; PIN entry as fallback.
import { useState, useEffect, useCallback } from "react";
import logo from "../../icon.png";
import Ico from "./Ico.jsx";
import { verifyPin, hasPin } from "../lib/appLock.js";
import { useT } from "../lib/i18n.js";

export default function LockScreen({ onUnlock, tryBiometric }) {
  const tr = useT();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [pinExists, setPinExists] = useState(false);

  useEffect(() => { hasPin().then(setPinExists); }, []);

  // Auto-prompt Face ID / Touch ID once on mount.
  useEffect(() => { tryBiometric?.(); }, [tryBiometric]);

  const submit = useCallback(async (value) => {
    if (await verifyPin(value)) { onUnlock?.(); }
    else { setErr(true); setPin(""); setTimeout(() => setErr(false), 600); }
  }, [onUnlock]);

  const tap = (d) => {
    if (pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    if (next.length >= 4 && next.length === 4) submit(next);
  };
  const del = () => setPin((p) => p.slice(0, -1));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", userSelect: "none", paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}>
      <img src={logo} alt="Saver" style={{ width: 84, height: 84, borderRadius: 20, marginBottom: 22 }} />
      <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{tr("lock.locked")}</div>

      {!pinMode && (
        <>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 28 }}>{tr("lock.unlockToContinue")}</div>
          <button onClick={() => tryBiometric?.()} style={btn}>
            <Ico name="lock" size={18} color="#fff" /> {tr("lock.unlockFaceId")}
          </button>
          {pinExists && (
            <button onClick={() => setPinMode(true)} style={{ ...btn, background: "transparent", color: "var(--ac)", marginTop: 12 }}>
              {tr("lock.enterPinInstead")}
            </button>
          )}
        </>
      )}

      {pinMode && (
        <>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>{tr("lock.enterYourPin")}</div>
          <div style={{ display: "flex", gap: 14, marginBottom: 30, animation: err ? "shake .4s" : "none" }}>
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
        </>
      )}
    </div>
  );
}

const btn = { display: "inline-flex", alignItems: "center", gap: 9, background: "var(--ac)", color: "#fff", border: "none", borderRadius: 14, padding: "13px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer" };
const key = { width: 72, height: 72, borderRadius: 99, background: "var(--surface)", border: "var(--cardBorder)", color: "var(--text)", fontSize: 26, fontWeight: 600, cursor: "pointer" };
