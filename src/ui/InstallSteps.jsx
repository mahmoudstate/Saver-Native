// Saver — "Add to home screen" mini guide: a simple numbered icon sequence,
// shown on first run. Pure presentation; the parent animates it.
import Ico from "./Ico.jsx";
import logo from "../../icon.png";

const STEPS = [
  { icon: "share", title: "Tap the Share button", text: "You will find it in your browser bar." },
  { icon: "plus", title: "Choose Add to Home Screen", text: "Scroll the menu until you see it." },
  { icon: "logo", title: "Open Saver from your screen", text: "From now on it works just like an app." },
];

export default function InstallSteps() {
  return (
    <div>
      {STEPS.map((s, i) => (
        <div className="gsap-step" key={i} style={{ display: "flex", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ width: 42, height: 42, borderRadius: 14, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.icon === "logo" ? <img src={logo} alt="" style={{ width: 26, height: 26, borderRadius: 8 }} /> : <Ico name={s.icon} size={20} />}
            </span>
            {i < STEPS.length - 1 && <span style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 4, minHeight: 18 }} />}
          </div>
          <div style={{ paddingBottom: i < STEPS.length - 1 ? 18 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--acText)" }}>STEP {i + 1}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -.2, marginTop: 2 }}>{s.title}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{s.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
