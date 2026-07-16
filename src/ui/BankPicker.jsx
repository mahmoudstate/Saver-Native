// Saver — bank picker. Inline row of popular real bank logos + an "All" tile
// that opens a searchable sheet with every bank grouped by region (same
// anatomy as ServicePicker). A "Custom" tile lets the user pick their own
// icon + colour instead. Logos are offline (BankLogo).
import { useState, useMemo } from "react";
import Ico from "./Ico.jsx";
import BankLogo from "./BankLogo.jsx";
import { BANK_PRESETS, POPULAR_BANK_IDS, getBankRegions, bankRegionLabel, bankDisplayName } from "../lib/banks.js";
import { useLang } from "../lib/i18n.js";
import { focusNext } from "../lib/focusNext.js";

const popular = POPULAR_BANK_IDS.map((id) => BANK_PRESETS.find((b) => b.id === id)).filter(Boolean);

function BankSheet({ activeDomain, onPick, onCustom, onClose }) {
  const { t: tr, lang } = useLang();
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    return getBankRegions(lang).map((region) => ({
      region,
      items: BANK_PRESETS.filter((b) => b.region === region && (!query || b.name.toLowerCase().includes(query))),
    })).filter((g) => g.items.length);
  }, [q, lang]);

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>{tr("bankPicker.title")}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 14px" }}>{tr("bankPicker.subtitle")}</div>
        <div className="field" style={{ marginBottom: 14 }}>
          <Ico name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={focusNext} enterKeyHint="search" placeholder={tr("bankPicker.search")} style={{ flex: 1, border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 600 }} />
          {q && <span className="chev" onClick={() => setQ("")}><Ico name="close" size={16} /></span>}
        </div>
        <div style={{ maxHeight: "52vh", overflowY: "auto", paddingBottom: 4 }}>
          <div onClick={() => { onCustom(); onClose(); }} className="icard" style={{ cursor: "pointer", marginBottom: 14 }}>
            <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--acDim)", color: "var(--acText)" }}><Ico name="pencil" size={20} /></span>
            <div style={{ flex: 1 }}><div className="nm">{tr("bankPicker.custom")}</div><div className="mt">{tr("bankPicker.customSub")}</div></div>
            <span className="chev"><Ico name="chev" size={18} /></span>
          </div>
          {groups.map((g) => (
            <div key={g.region} style={{ marginBottom: 16 }}>
              <div className="over" style={{ marginTop: 0 }}>{bankRegionLabel(g.region, lang)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px 8px" }}>
                {g.items.map((b) => (
                  <div key={b.id} onClick={() => onPick(b)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer", minWidth: 0 }}>
                    <div style={{ position: "relative" }}>
                      <BankLogo domain={b.id} name={bankDisplayName(b, lang)} color={b.color} size={52} />
                      {activeDomain === b.id && <span className="circ" style={{ position: "absolute", right: -3, bottom: -3, width: 19, height: 19, borderRadius: "50%", background: "var(--ac)", color: "var(--onacc)", border: "2px solid var(--surface)" }}><Ico name="check" size={11} /></span>}
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, textAlign: "center", lineHeight: 1.2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", maxWidth: "100%", color: "var(--text)" }}>{bankDisplayName(b, lang)}</span>
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

export default function BankPicker({ activeDomain, onPick, onCustom }) {
  const { t: tr, lang } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "5px 3px" }}>
        {popular.slice(0, 5).map((b) => (
          <div key={b.id} onClick={() => onPick(b)} style={{ cursor: "pointer", display: "flex", justifyContent: "center" }}>
            <span style={{ display: "inline-flex", borderRadius: 15, boxShadow: activeDomain === b.id ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }}>
              <BankLogo domain={b.id} name={bankDisplayName(b, lang)} color={b.color} size={50} />
            </span>
          </div>
        ))}
        <div onClick={() => setOpen(true)} style={{ cursor: "pointer", display: "flex", justifyContent: "center" }}>
          <span className="circ" style={{ width: 50, height: 50, borderRadius: 15, background: "var(--surface2)", border: "1px dashed var(--border)", color: "var(--muted)", flexDirection: "column", gap: 1 }}>
            <Ico name="layers" size={18} /><span style={{ fontSize: 9, fontWeight: 800 }}>{tr("editor.all")}</span>
          </span>
        </div>
      </div>
      {open && <BankSheet activeDomain={activeDomain} onPick={onPick} onCustom={onCustom} onClose={() => setOpen(false)} />}
    </>
  );
}
