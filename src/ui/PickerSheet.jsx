// Saver — generic option picker bottom sheet (account / category / goal).
import { Fragment } from "react";
import Ico from "./Ico.jsx";
import CatTile from "./CatTile.jsx";
import BankLogo from "./BankLogo.jsx";
import { useT } from "../lib/i18n.js";

// option: { id, label, sub, catKey, bankColor, glyph, sectionHeader }
// `sectionHeader` (optional) renders a small group label above that option.
export default function PickerSheet({ title, options, selectedId, onPick, onClose }) {
  const tr = useT();
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={title} style={{ maxHeight: "70%", overflowY: "auto" }}>
        <div className="grab" />
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -.3 }}>{title}</div>
          <div style={{ flex: 1 }} />
          <div className="hib" style={{ background: "var(--surface2)", color: "var(--muted)" }} onClick={onClose}><Ico name="close" size={18} /></div>
        </div>
        {options.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "8px 2px 16px" }}>{tr("ui.nothingToPick")}</div>
          : options.map((o) => (
            <Fragment key={o.id}>
              {o.sectionHeader && <div className="over">{o.sectionHeader}</div>}
              <div className="icard" onClick={() => { onPick(o.id); onClose(); }} style={{ cursor: "pointer", ...(o.id === selectedId ? { borderColor: "var(--ac)", boxShadow: "inset 0 0 0 1.5px var(--ac)" } : {}) }}>
                {o.bankColor != null
                  ? <BankLogo name={o.label} domain={o.bankDomain} glyph={o.glyph} color={o.bankColor} size={42} radius={13} iconSize={19} />
                  : <CatTile cat={o.catKey} name={o.label} size={42} />}
                <div><div className="nm">{o.label}</div>{o.sub && <div className="mt">{o.sub}</div>}</div>
                {o.id === selectedId && <span className="amtb"><Ico name="check" size={18} color="var(--ac)" /></span>}
              </div>
            </Fragment>
          ))}
      </div>
    </>
  );
}
