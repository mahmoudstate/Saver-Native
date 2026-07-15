// Saver — bill/subscription tile. Brand logo when the service is known, category
// glyph when it isn't, initial as a last resort. Shared by the Bills screen and
// the Home bills card so a bill looks the same wherever it shows up.
import ServiceLogo from "./ServiceLogo.jsx";
import CatTile from "./CatTile.jsx";
import Ico from "./Ico.jsx";

function Tile({ bill, size }) {
  if (bill.domain) return <ServiceLogo domain={bill.domain} name={bill.name} color={bill.color} size={size} />;
  if (bill.glyph) return <CatTile cat={bill.glyph} name={bill.name} color={bill.color} size={size} />;
  return <span className="circ" style={{ width: size, height: size, borderRadius: size * 0.3, background: bill.color || "var(--surface2)", color: "#fff", fontWeight: 800, fontSize: size * 0.34, flexShrink: 0 }}>{(bill.name || "?").slice(0, 1).toUpperCase()}</span>;
}

// `paid` pins a check badge to the tile's trailing corner — it sits on the logo
// rather than the row corner, which is where the amount lives. `ring` should
// match the row's own background so the badge reads as cut out of it.
export default function BillLogo({ bill, size = 44, paid = false, ring = "var(--surface)" }) {
  if (!paid) return <Tile bill={bill} size={size} />;
  const b = Math.round(size * 0.42);
  return (
    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <Tile bill={bill} size={size} />
      <span className="circ" style={{ position: "absolute", bottom: -2, insetInlineEnd: -2, width: b, height: b, borderRadius: "50%", background: "var(--success)", border: `2px solid ${ring}`, color: "#fff" }}>
        <Ico name="check" size={Math.round(b * 0.56)} color="#fff" />
      </span>
    </span>
  );
}
