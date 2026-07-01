// Saver — category icon tile (NEW design: neutral tile + coloured glyph, matches showcase)
import { CATS, resolveCat } from "./cats.js";

export default function CatTile({ txn, cat, color, name, size = 44, style = {} }) {
  const key = cat && CATS[cat] ? cat : (txn ? resolveCat(txn) : null);
  const entry = key ? CATS[key] : null;
  // An explicit `color` always wins (e.g. the colour you picked for a category);
  // otherwise fall back to the glyph's own default colour, then the txn colour.
  const col = color || (entry ? entry[0] : (txn?.catColor || "var(--muted)"));
  const inner = entry
    ? <svg viewBox="0 0 24 24" width={Math.round(size * 0.56)} height={Math.round(size * 0.56)} fill="none" stroke={col} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: entry[1] }} />
    : <span style={{ color: col, fontSize: size * 0.42, fontWeight: 800 }}>{((name || txn?.catName || "?")).slice(0, 1).toUpperCase()}</span>;
  return (
    <span className="circ" style={{ width: size, height: size, borderRadius: 14, background: "var(--catTile)", border: "1px solid var(--catTileBorder)", color: col, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style }}>
      {inner}
    </span>
  );
}
