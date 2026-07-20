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
const WALLET_PATH = "M931.759008 327.468021h-38.696221L743.377405 68.09335c-24.797578-42.995801-79.992188-57.794356-122.98799-32.996777L518.099404 94.290792l-96.990528-76.29255C401.810761 3.599648 378.013085-2.399766 354.315399 1.099893c-23.797676 3.499658-44.795625 15.998438-58.994239 35.096572L72.842886 329.667806c-40.196075 8.999121-70.393126 44.895616-70.393125 87.791426v516.549556c0 49.595157 40.396055 89.991212 89.991212 89.991212h839.318035c49.595157 0 89.991212-40.396055 89.991212-89.991212V417.459232c0.09999-49.595157-40.296065-89.991212-89.991212-89.991211zM645.886925 79.292257c18.598184-10.798945 42.59584-4.39957 53.394786 14.298603L824.969437 311.369593H243.926179l401.960746-232.077336zM336.017186 66.893467c6.199395-8.39918 15.398496-13.798652 25.69749-15.298506 10.298994-1.499854 20.597988 1.099893 28.497217 6.899327l80.39215 63.293819-313.169417 180.682355L336.017186 66.893467z m634.838004 696.331999H754.27634c-48.295284 0-87.491456-39.296162-87.491456-87.491456 0-48.295284 39.296162-87.491456 87.491456-87.491456H970.95518v174.982912zM754.27634 537.347525c-76.29255 0-138.486476 62.093936-138.486476 138.486476s62.093936 138.486476 138.486476 138.486476H970.95518v119.788301c0 21.597891-17.498291 39.096182-39.096182 39.096182h-694.932135v-74.692705h-48.395274v74.692705h-95.990626c-21.597891 0-39.096182-17.498291-39.096182-39.096182V417.459232c0-21.597891 17.498291-39.096182 39.096182-39.096182h95.990626v76.19256h48.395274v-76.19256h694.832145c21.597891 0 39.096182 17.498291 39.096182 39.096182v119.788302H754.27634z M188.531589 500.151157h48.395274v87.191485h-48.395274zM188.531589 632.93819h48.395274v87.191485h-48.395274zM188.531589 765.625232h48.395274v87.191485h-48.395274z M754.27634 675.73401m-64.593692 0a64.593692 64.593692 0 1 0 129.187384 0 64.593692 64.593692 0 1 0-129.187384 0Z";

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
        <svg viewBox="0 0 1024 1024" width={size * 0.52} height={size * 0.52} fill={fg} fillRule="evenodd" aria-label={name}><path d={WALLET_PATH} /></svg>
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
