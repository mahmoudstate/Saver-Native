// Saver — combined icon + colour picker in one sheet (the "Custom" identity flow).
// Optionally shows a name field (used for "New category"). Returns {glyph,color,name}.
import { useState } from "react";
import Ico from "./Ico.jsx";
import CatTile from "./CatTile.jsx";
import ColorSheet, { loadColors } from "./ColorSheet.jsx";
import { IconSheet } from "./IconField.jsx";
import { CATS } from "./cats.js";
import { useT } from "../lib/i18n.js";

const QUICK = ["subscription", "creditcard", "bill", "phone", "wifi", "movie", "music", "gaming", "fitness", "shopping", "home", "gift"];

function Glyph({ g, selected, color, onPick }) {
  return (
    <span onClick={() => onPick(g)} className="circ" style={{ aspectRatio: "1", borderRadius: 14, background: "var(--catTile)", border: selected ? "1.5px solid var(--ac)" : "1px solid var(--catTileBorder)", cursor: "pointer" }}>
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={selected ? color : CATS[g][0]} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: CATS[g][1] }} />
    </span>
  );
}

export default function CustomIconSheet({ title, withName = false, name: name0 = "", glyph: g0 = "subscription", color: c0, doneLabel, onDone, onClose }) {
  const tr = useT();
  const ttl = title || tr("iconSheet.customIcon");
  const dl = doneLabel || tr("iconSheet.done");
  const [glyph, setGlyph] = useState(g0 || "subscription");
  const [color, setColor] = useState(c0 || loadColors()[0]);
  const [name, setName] = useState(name0);
  const [sub, setSub] = useState(null); // "icons" | "color"
  const swatches = loadColors().slice(0, 8);
  const ok = !withName || name.trim();

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={ttl}>
        <div className="grab" />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <CatTile cat={glyph} name={name} color={color} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>{ttl}</div>
            <div className="caption" style={{ marginTop: 2 }}>{withName ? tr("iconSheet.nameCaption") : tr("iconSheet.pickCaption")}</div>
          </div>
        </div>

        {withName && (
          <label className="field" style={{ marginBottom: 14 }}>
            <div style={{ flex: 1 }}><div className="fl">{tr("iconSheet.name")}</div>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("iconSheet.namePlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
            </div>
          </label>
        )}

        <div className="over" style={{ marginTop: 0 }}>{tr("editor.colour")}</div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 9, marginBottom: 16 }}>
          {swatches.map((c) => <span key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: color === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />)}
          <span onClick={() => setSub("color")} className="circ" style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}><Ico name="plus" size={15} /></span>
        </div>

        <div className="over">{tr("iconSheet.icon")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 4 }}>
          {QUICK.filter((x) => CATS[x]).map((x) => <Glyph key={x} g={x} selected={glyph === x} color={color} onPick={setGlyph} />)}
          <span onClick={() => setSub("icons")} className="circ" style={{ aspectRatio: "1", borderRadius: 14, background: "var(--surface2)", border: "1px dashed var(--border)", cursor: "pointer", flexDirection: "column", gap: 1, color: "var(--muted)" }}>
            <Ico name="layers" size={17} /><span style={{ fontSize: 8.5, fontWeight: 800 }}>{tr("iconSheet.all")}</span>
          </span>
        </div>

        <div className="btn btn-primary btn-full" style={{ marginTop: 14, opacity: ok ? 1 : .5 }} onClick={() => { if (ok) onDone({ glyph, color, name: name.trim() }); }}>{dl}</div>
      </div>

      {sub === "color" && <ColorSheet value={color} onChange={setColor} onClose={() => setSub(null)} />}
      {sub === "icons" && <IconSheet glyph={glyph} color={color} onPick={setGlyph} onClose={() => setSub(null)} />}
    </>
  );
}
