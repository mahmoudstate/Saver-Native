// Saver — Guide step sequence: numbered, icon-led, theme-coloured. Parent may
// animate the .gsap-step elements. Colours come from CSS vars so they follow the theme.
import Ico from "./Ico.jsx";

export default function GuideSteps({ steps = [], color = "var(--ac)" }) {
  return (
    <div>
      {steps.map((s, i) => (
        <div className="gsap-step" key={i} style={{ display: "flex", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ width: 40, height: 40, borderRadius: 13, background: `color-mix(in srgb, ${color} 14%, transparent)`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name={s.icon} size={19} /></span>
            {i < steps.length - 1 && <span style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 4, minHeight: 16 }} />}
          </div>
          <div style={{ paddingBottom: i < steps.length - 1 ? 18 : 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -.2 }}>{s.title}</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{s.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
