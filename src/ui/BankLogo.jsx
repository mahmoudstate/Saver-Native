// Saver — account icon tile. Priority: real bank brand logo (bundled, offline,
// same visual regardless of language — matched by stored preset id, or by
// name for accounts that pre-date the bank picker) > a custom icon+colour the
// user picked > the legacy glyph circle (cash wallet / plain bank card).
import Ico from "./Ico.jsx";
import CatTile from "./CatTile.jsx";
import { CATS } from "./cats.js";
import { bankIcon } from "../lib/bankIcon.js";
import { resolveBankIcon } from "../lib/banks.js";

const lum = (hex) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Filled cash-wallet mark, colour fully driven by the account's chosen colour
// (the punched-out circle shows the tile colour through, like a clasp).
const WALLET_PATH = "M2 7a3 3 0 0 1 3-3h13a2 2 0 0 1 2 2v2h1a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7Z M18 12.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z";

export default function BankLogo({ name, domain, glyph, color, size = 44, radius, iconSize, style = {} }) {
  const icon = resolveBankIcon(domain, name);
  const r = radius ?? size * 0.318;
  const box = { width: size, height: size, borderRadius: r, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style };
  if (icon?.img && icon.full) {
    return (
      <span className="circ" style={{ ...box, overflow: "hidden" }}>
        <img src={icon.img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </span>
    );
  }
  if (icon?.img) {
    return (
      <span className="circ" style={{ ...box, background: "#fff", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }}>
        <img src={icon.img} alt={name} style={{ width: "68%", height: "68%", objectFit: "contain" }} />
      </span>
    );
  }
  // Outer ring (not inset) so the tile stays visible even when it sits on a
  // card whose own background is the same colour as this tile (e.g. a cash
  // wallet's card and its logo both use the account's own colour) — an inset
  // ring blends into a same-hue background, an outer one always separates.
  const RING = "0 0 0 1.5px rgba(255,255,255,.55), 0 2px 6px rgba(0,0,0,.25)";
  if (icon) {
    const tile = `#${icon.h}`;
    const fg = lum(tile) > 0.7 ? "#111" : "#fff";
    return (
      <span className="circ" style={{ ...box, background: tile, boxShadow: RING }}>
        <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill={fg} aria-label={name}><path d={icon.p} /></svg>
      </span>
    );
  }
  if (glyph === "wallet") {
    const tile = color || "#0e9f6e";
    const fg = lum(tile) > 0.7 ? "#111" : "#fff";
    return (
      <span className="circ" style={{ ...box, background: tile, boxShadow: RING }}>
        <svg viewBox="0 0 24 24" width={size * 0.52} height={size * 0.52} fill={fg} fillRule="evenodd" aria-label={name}><path d={WALLET_PATH} /></svg>
      </span>
    );
  }
  if (glyph && CATS[glyph]) return <CatTile cat={glyph} name={name} color={color} size={size} style={style} />;
  return (
    <span className="circ" style={{ ...box, background: `color-mix(in srgb, ${color || "var(--muted)"} 20%, transparent)`, color: color || "var(--muted)" }}>
      <Ico name={bankIcon(glyph)} size={iconSize ?? size * 0.43} />
    </span>
  );
}
