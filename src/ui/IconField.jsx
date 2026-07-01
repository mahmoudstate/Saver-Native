// Saver — reusable icon picker row: a curated inline strip + an "All" tile that
// opens a sheet with every icon (same anatomy as the category editor). Drop into
// any editor: <IconField glyph={glyph} color={color} onPick={setGlyph} />.
import { useState } from "react";
import Ico from "./Ico.jsx";
import { CATS } from "./cats.js";
import { useT } from "../lib/i18n.js";

// Sensible general-purpose set (subset of CATS) for installments / custom bills.
const ALL_ICONS = ["phone", "electronics", "car", "transport", "fuel", "home", "furniture", "shopping", "clothing", "jewelry", "bill", "utilities", "electricity", "water", "wifi", "health", "pharmacy", "fitness", "sports", "education", "books", "entertainment", "movie", "music", "gaming", "kids", "pet", "travel", "hotel", "gift", "beauty", "creditcard", "bank", "insurance", "subscription", "repairs", "garden", "laundry", "food", "groceries"];
const QUICK = ["phone", "electronics", "car", "home", "furniture", "shopping", "bill", "fitness", "travel", "creditcard", "gift"];

function Glyph({ g, selected, color, onPick }) {
  return (
    <span onClick={() => onPick(g)} className="circ" style={{ aspectRatio: "1", borderRadius: 14, background: "var(--catTile)", border: selected ? "1.5px solid var(--ac)" : "1px solid var(--catTileBorder)", cursor: "pointer" }}>
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={selected ? color : CATS[g][0]} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: CATS[g][1] }} />
    </span>
  );
}

export function IconSheet({ icons = ALL_ICONS, glyph, color, onPick, onClose }) {
  const tr = useT();
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>{tr("editor.chooseIcon")}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 16px" }}>{tr("editor.tapIcon")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, maxHeight: "46vh", overflowY: "auto", paddingBottom: 4 }}>
          {icons.map((g) => <Glyph key={g} g={g} selected={glyph === g} color={color} onPick={(x) => { onPick(x); onClose(); }} />)}
        </div>
        <div style={{ marginTop: 16 }}><div className="btn btn-secondary btn-full" onClick={onClose}>{tr("editor.done")}</div></div>
      </div>
    </>
  );
}

export default function IconField({ glyph, color, onPick, icons = ALL_ICONS, quick = QUICK, label }) {
  const tr = useT();
  const resolvedLabel = label ?? tr("editor.icon");
  const [open, setOpen] = useState(false);
  const inline = quick.includes(glyph) ? quick : [glyph, ...quick.slice(0, quick.length - 1)];
  return (
    <>
      <div className="over">{resolvedLabel}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 18 }}>
        {inline.filter((g) => CATS[g]).map((g) => <Glyph key={g} g={g} selected={glyph === g} color={color} onPick={onPick} />)}
        <span onClick={() => setOpen(true)} className="circ" style={{ aspectRatio: "1", borderRadius: 14, background: "var(--surface2)", border: "1px dashed var(--border)", cursor: "pointer", flexDirection: "column", gap: 1, color: "var(--muted)" }}>
          <Ico name="layers" size={17} /><span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: ".02em" }}>{tr("editor.all")}</span>
        </span>
      </div>
      {open && <IconSheet icons={icons} glyph={glyph} color={color} onPick={onPick} onClose={() => setOpen(false)} />}
    </>
  );
}
