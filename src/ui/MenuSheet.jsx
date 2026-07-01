// Saver — lightweight bottom action sheet. Pass a list of items; destructive ones
// render in red. Used for secondary detail-screen actions (Edit / Stop / Delete).
import Ico from "./Ico.jsx";
import { useT } from "../lib/i18n.js";

export default function MenuSheet({ title, items, onClose }) {
  const tr = useT();
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="menu" aria-label={title || tr("ui.actions")}>
        <div className="grab" />
        {title && <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3, marginBottom: 10 }}>{title}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((it) => (
            <div key={it.label} className="icard" role="menuitem" onClick={() => { onClose(); it.onClick(); }} style={{ cursor: "pointer" }}>
              <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: it.danger ? "var(--redDim)" : "var(--acDim)", color: it.danger ? "var(--red)" : "var(--acText)" }}><Ico name={it.icon} size={19} color={it.danger ? "var(--red)" : "var(--acText)"} /></span>
              <div style={{ flex: 1 }}><div className="nm" style={it.danger ? { color: "var(--red)" } : undefined}>{it.label}</div>{it.sub && <div className="mt">{it.sub}</div>}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}><div className="btn btn-secondary btn-full" onClick={onClose}>{tr("ui.cancel")}</div></div>
      </div>
    </>
  );
}
