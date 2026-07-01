// Saver — offline service/company logo tile. Bundled brand glyph (Simple Icons
// style) on a brand-colour tile, else a colour monogram. No network, no emoji.
import { BRAND_ICONS } from "../lib/services.js";

const lum = (hex) => {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return 0.5;
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(v.slice(0, 2), 16) / 255, g = parseInt(v.slice(2, 4), 16) / 255, b = parseInt(v.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export default function ServiceLogo({ domain, name, color, size = 44, style = {} }) {
  const tile = color || "#6ee7b7";
  const fg = lum(tile) > 0.7 ? "#111" : "#fff";
  const radius = size * 0.3;
  const ic = domain && BRAND_ICONS[domain];
  const box = { width: size, height: size, borderRadius: radius, background: tile, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style };
  if (ic) {
    return (
      <div style={box}>
        <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill={fg} aria-label={name}><path d={ic.p} /></svg>
      </div>
    );
  }
  const initials = (name || "?").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return <div style={box}><span style={{ color: fg, fontSize: size * 0.4, fontWeight: 800, letterSpacing: -0.5 }}>{initials}</span></div>;
}
