// Saver — company/service picker. Inline row of popular brand logos + an "All"
// tile that opens a searchable sheet with every service grouped by category
// (same anatomy as the category icon picker). A "Custom" tile lets the user pick
// their own icon + colour instead of a brand. Logos are offline (ServiceLogo).
import { useState, useMemo } from "react";
import Ico from "./Ico.jsx";
import ServiceLogo from "./ServiceLogo.jsx";
import { SUBSCRIPTION_SERVICES, SERVICE_CATEGORIES, POPULAR_SERVICE_IDS } from "../lib/services.js";
import { useT } from "../lib/i18n.js";

const popular = POPULAR_SERVICE_IDS.map((id) => SUBSCRIPTION_SERVICES.find((s) => s.id === id)).filter(Boolean);

function ServiceSheet({ activeDomain, onPick, onCustom, onClose }) {
  const tr = useT();
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SERVICE_CATEGORIES.map((cat) => ({
      cat,
      items: SUBSCRIPTION_SERVICES.filter((s) => s.category === cat && (!query || s.name.toLowerCase().includes(query))),
    })).filter((g) => g.items.length);
  }, [q]);

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>{tr("servicePicker.title")}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 14px" }}>{tr("servicePicker.subtitle")}</div>
        <div className="field" style={{ marginBottom: 14 }}>
          <Ico name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("servicePicker.search")} style={{ flex: 1, border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 600 }} />
          {q && <span className="chev" onClick={() => setQ("")}><Ico name="close" size={16} /></span>}
        </div>
        <div style={{ maxHeight: "52vh", overflowY: "auto", paddingBottom: 4 }}>
          <div onClick={() => { onCustom(); onClose(); }} className="icard" style={{ cursor: "pointer", marginBottom: 14 }}>
            <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--acDim)", color: "var(--acText)" }}><Ico name="pencil" size={20} /></span>
            <div style={{ flex: 1 }}><div className="nm">{tr("servicePicker.custom")}</div><div className="mt">{tr("servicePicker.customSub")}</div></div>
            <span className="chev"><Ico name="chev" size={18} /></span>
          </div>
          {groups.map((g) => (
            <div key={g.cat} style={{ marginBottom: 16 }}>
              <div className="over" style={{ marginTop: 0 }}>{g.cat}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px 8px" }}>
                {g.items.map((s) => (
                  <div key={s.id} onClick={() => { onPick(s); onClose(); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer" }}>
                    <div style={{ position: "relative" }}>
                      <ServiceLogo domain={s.domain} name={s.name} color={s.color} size={52} />
                      {activeDomain === s.domain && <span className="circ" style={{ position: "absolute", right: -3, bottom: -3, width: 19, height: 19, borderRadius: "50%", background: "var(--ac)", color: "var(--onacc)", border: "2px solid var(--surface)" }}><Ico name="check" size={11} /></span>}
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, textAlign: "center", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", color: "var(--text)" }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {groups.length === 0 && <div style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600, padding: "24px 0" }}>{tr("servicePicker.noMatch")}</div>}
        </div>
        <div style={{ marginTop: 14 }}><div className="btn btn-secondary btn-full" onClick={onClose}>{tr("ui.done")}</div></div>
      </div>
    </>
  );
}

// Inline strip used inside the editor: an even row of a few popular logos + an All
// tile that opens the full searchable list. `onPick(svc)`. `onCustom` is offered
// inside the All sheet too. (The editor shows its own "Custom" button above this.)
export default function ServicePicker({ activeDomain, onPick, onCustom }) {
  const tr = useT();
  const [open, setOpen] = useState(false);
  // Even row that fits without horizontal scroll, so the All tile is always visible
  // and the select ring isn't clipped (padding gives the ring room).
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "5px 3px" }}>
        {popular.slice(0, 5).map((s) => (
          <div key={s.id} onClick={() => onPick(s)} style={{ cursor: "pointer", display: "flex", justifyContent: "center" }}>
            <span style={{ display: "inline-flex", borderRadius: 15, boxShadow: activeDomain === s.domain ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }}>
              <ServiceLogo domain={s.domain} name={s.name} color={s.color} size={50} />
            </span>
          </div>
        ))}
        <div onClick={() => setOpen(true)} style={{ cursor: "pointer", display: "flex", justifyContent: "center" }}>
          <span className="circ" style={{ width: 50, height: 50, borderRadius: 15, background: "var(--surface2)", border: "1px dashed var(--border)", color: "var(--muted)", flexDirection: "column", gap: 1 }}>
            <Ico name="layers" size={18} /><span style={{ fontSize: 9, fontWeight: 800 }}>{tr("editor.all")}</span>
          </span>
        </div>
      </div>
      {open && <ServiceSheet activeDomain={activeDomain} onPick={onPick} onCustom={onCustom} onClose={() => setOpen(false)} />}
    </>
  );
}
