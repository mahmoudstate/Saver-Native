// Saver — Splash: original app's animation, themed to match the app. Background
// follows the active theme; a soft accent glow beats under the logo like a pulse.
import { useState, useEffect } from "react";
import logo from "../../icon.png";
import { APP_VERSION } from "../lib/format.js";

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (REDUCED) { const t = setTimeout(() => onDone?.(), 800); return () => clearTimeout(t); }
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 2100);
    const t3 = setTimeout(() => onDone?.(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []); // eslint-disable-line

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: phase === 2 ? 0 : 1, transition: phase === 2 ? "opacity 0.7s ease" : "none", userSelect: "none" }}>
      <style>{`@keyframes saverLogoIn{0%{transform:scale(0.75) translateY(10px);opacity:0}60%{transform:scale(1.05) translateY(-3px);opacity:1}100%{transform:scale(1) translateY(0);opacity:1}}@keyframes saverFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes saverPulse{0%,100%{box-shadow:0 0 6px 1px color-mix(in srgb, var(--ac) 24%, transparent)}50%{box-shadow:0 0 15px 3px color-mix(in srgb, var(--ac) 55%, transparent)}}@keyframes saverBounce{0%,80%,100%{transform:translateY(0);opacity:0.3}40%{transform:translateY(-7px);opacity:1}}`}</style>

      <div style={{ position: "relative", marginBottom: 24, animation: "saverLogoIn 1.0s cubic-bezier(0.175,0.885,0.32,1.275) both" }}>
        <img src={logo} alt="Saver" style={{ width: 120, height: 120, borderRadius: 28, display: "block", animation: "saverPulse 2.8s ease-in-out infinite" }} />
      </div>

      <div style={{ color: "var(--text)", fontSize: 32, fontWeight: 800, letterSpacing: 10, textTransform: "uppercase", marginBottom: 6, animation: "saverLogoIn 1.0s 0.15s both" }}>Saver</div>

      <div style={{ color: "var(--ac)", fontSize: 12.5, fontWeight: 500, letterSpacing: 2, opacity: phase >= 1 ? 1 : 0, animation: phase >= 1 ? "saverFadeUp 0.6s ease forwards" : "none", marginBottom: 80 }}>Save it the easy way</div>

      <div style={{ display: "flex", gap: 7, position: "absolute", bottom: 70 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 5, height: 5, borderRadius: 99, background: "var(--ac)", animation: `saverBounce 1.3s ease ${i * 0.22}s infinite` }} />)}
      </div>

      <div style={{ color: "var(--faint)", fontSize: 10, position: "absolute", bottom: 24, fontWeight: 700, letterSpacing: 1 }}>Saver One V{APP_VERSION}</div>
    </div>
  );
}
