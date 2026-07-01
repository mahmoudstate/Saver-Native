// Saver — What's New sheet: ported 1:1 from showcase 28.
import Ico from "./Ico.jsx";
import { APP_VERSION } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

const ITEMS = [
  { icon: "wallet", bg: "var(--acDim)", color: "var(--acText)", nm: "whatsnew.item1nm", mt: "whatsnew.item1mt" },
  { icon: "target", bg: "var(--yellowDim)", color: "var(--yellow)", nm: "whatsnew.item2nm", mt: "whatsnew.item2mt" },
  { icon: "note", bg: "var(--blueDim)", color: "var(--blue)", nm: "whatsnew.item3nm", mt: "whatsnew.item3mt" },
];

export default function WhatsNew({ onClose }) {
  const tr = useT();
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={tr("whatsnew.ariaLabel")}>
        <div className="grab" />
        <div style={{ textAlign: "center", padding: "4px 6px 8px" }}>
          <span className="circ" style={{ width: 54, height: 54, borderRadius: 17, background: "linear-gradient(135deg,var(--ac),var(--ac2))", color: "var(--onacc)", margin: "0 auto 14px" }}><Ico name="sparkles" size={26} /></span>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.4 }}>{tr("whatsnew.title", { v: APP_VERSION })}</div>
        </div>
        {ITEMS.map((it, i) => (
          <div className="icard" key={i} style={{ marginTop: i === 0 ? 6 : undefined }}>
            <span className="circ" style={{ width: 36, height: 36, borderRadius: 11, background: it.bg, color: it.color }}><Ico name={it.icon} size={18} /></span>
            <div><div className="nm">{tr(it.nm)}</div><div className="mt">{tr(it.mt)}</div></div>
          </div>
        ))}
        <div className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={onClose}>{tr("ui.gotIt")}</div>
      </div>
    </>
  );
}
