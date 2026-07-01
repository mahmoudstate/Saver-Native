// Saver — reusable "Colour" form row: label + up to 6 of your colours + a + that
// opens the ColorSheet (wheel). Drop into any editor: <ColorField value onChange />.
import { useState } from "react";
import Ico from "./Ico.jsx";
import ColorSheet, { loadColors } from "./ColorSheet.jsx";
import { useT } from "../lib/i18n.js";

export default function ColorField({ value, onChange, style }) {
  const tr = useT();
  const [open, setOpen] = useState(false);
  // Stable order: show your saved colours in place so the SELECT ring moves to the
  // swatch you tap — instead of the tapped colour jumping to the front. If the current
  // colour isn't among them, surface it in the last slot (earlier swatches stay put).
  const saved = loadColors();
  let outside = saved.slice(0, 6);
  if (value && !outside.includes(value)) outside = [...saved.slice(0, 5), value];

  return (
    <>
      <div className="tile" style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, ...style }}>
        <div className="fl">{tr("editor.colour")}</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 9 }}>
          {outside.map((c) => (
            <span key={c} onClick={() => onChange(c)} style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: value === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />
          ))}
          <span onClick={() => setOpen(true)} style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}><Ico name="plus" size={14} /></span>
        </div>
      </div>
      {open && <ColorSheet value={value} onChange={onChange} onClose={() => setOpen(false)} />}
    </>
  );
}
