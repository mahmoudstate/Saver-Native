// Saver: one-time "how to add the widget" sheet. iOS gives apps no way to
// place a widget on the Home Screen programmatically, so this just walks the
// manual steps once, right after the notification prompt, same cadence as
// What's New (new install: shown right away; update: shown after What's New).
import Ico from "./Ico.jsx";
import { useT } from "../lib/i18n.js";

const STEPS = ["step1", "step2", "step3", "step4"];

export default function WidgetGuide({ onClose }) {
  const tr = useT();
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={tr("widgetGuide.title")}>
        <div className="grab" />
        <div style={{ textAlign: "center", padding: "4px 6px 8px" }}>
          <span className="circ" style={{ width: 54, height: 54, borderRadius: 17, background: "linear-gradient(135deg,var(--ac),var(--ac2))", color: "var(--onacc)", margin: "0 auto 14px" }}><Ico name="device" size={26} /></span>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.4 }}>{tr("widgetGuide.title")}</div>
          <div className="mt" style={{ marginTop: 6, padding: "0 12px" }}>{tr("widgetGuide.subtitle")}</div>
        </div>
        {STEPS.map((s, i) => (
          <div className="icard" key={s} style={{ marginTop: i === 0 ? 6 : undefined }}>
            <span className="circ" style={{ width: 30, height: 30, borderRadius: 10, background: "var(--acDim)", color: "var(--acText)", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{i + 1}</span>
            <div className="nm" style={{ fontWeight: 600 }}>{tr(`widgetGuide.${s}`)}</div>
          </div>
        ))}
        <div className="btn btn-primary btn-full" style={{ marginTop: 14 }} onClick={onClose}>{tr("ui.gotIt")}</div>
      </div>
    </>
  );
}
