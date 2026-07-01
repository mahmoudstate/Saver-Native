// Saver — reusable colour picker sheet (shared by every "pick a colour" surface:
// accounts, category icons, goals, budgets, projects, bills, installments).
// One screen, fully user-controlled: your saved colours (tap to use, × to remove)
// + a colour WHEEL to create new ones (drag the dot for hue/vividness, slider for
// brightness, then Add). No fixed presets, no OS screen. App-styled.
import { useState, useRef } from "react";
import Ico from "./Ico.jsx";
import { loadKey, saveKey } from "../lib/store.js";
import { useT } from "../lib/i18n.js";

const KEY = "et_customColors";              // shared across all sections
const SEED = ["#0E9F6E", "#2563EB", "#7C3AED", "#D97706", "#E5544E", "#EC4899"]; // 6 calm starters; all removable

// Saved colours, seeding a few removable ones on first run so it's never empty.
export function loadColors() {
  const c = loadKey(KEY, null);
  if (Array.isArray(c) && c.length) return c.slice(0, 24);
  saveKey(KEY, SEED);
  return SEED;
}

function hsvToHex(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  const to = (n) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

// Parse a hex colour back to HSV so the wheel's dot opens ON the current colour
// (not a fixed default) and the picker feels like it's tracking your choice.
function hexToHsv(hex) {
  try {
    const c = hex.replace("#", "");
    const r = parseInt(c.slice(0, 2), 16) / 255, g = parseInt(c.slice(2, 4), 16) / 255, b = parseInt(c.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) { h = (max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60; if (h < 0) h += 360; }
    return { h, s: max === 0 ? 0 : d / max, v: max };
  } catch { return { h: 210, s: 0.7, v: 0.9 }; }
}

export default function ColorSheet({ value, onChange, onClose }) {
  const tr = useT();
  const [saved, setSaved] = useState(loadColors);
  const init = hexToHsv(value || "#5FE3C0");
  const [hue, setHue] = useState(init.h);
  const [sat, setSat] = useState(init.s);
  const [val, setVal] = useState(init.v);
  const wheelRef = useRef(null);
  const dragging = useRef(false);
  const draft = hsvToHex(hue, sat, val);

  const persist = (c) => { setSaved(c); saveKey(KEY, c); };
  const addDraft = () => { if (!saved.includes(draft)) persist([...saved, draft]); onChange(draft); };
  const remove = (c) => persist(saved.filter((x) => x !== c));

  const setFromPoint = (cx, cy) => {
    const el = wheelRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
    setHue(((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360);
    setSat(Math.min(1, Math.hypot(dx, dy) / (r.width / 2)));
  };
  const onDown = (e) => { dragging.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); setFromPoint(e.clientX, e.clientY); };
  const onMove = (e) => { if (dragging.current) setFromPoint(e.clientX, e.clientY); };
  const onUp = () => { dragging.current = false; };

  // handle position (% of wheel) from hue/sat
  const ang = ((hue - 90) * Math.PI) / 180;
  const hx = 50 + Math.cos(ang) * sat * 50, hy = 50 + Math.sin(ang) * sat * 50;
  const brightGrad = `linear-gradient(to right,#000,${hsvToHex(hue, sat, 1)})`;

  return (
    <>
      <style>{`.cs-bright::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid rgba(0,0,0,.15);box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer}.cs-bright::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:2px solid rgba(0,0,0,.15);box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer}`}</style>
      <div className="dim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>{tr("editor.colour")}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 16px" }}>{tr("editor.tapColour")}</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
          {saved.map((c) => (
            <span key={c} style={{ position: "relative", width: 36, height: 36 }}>
              <span onClick={() => onChange(c)} style={{ display: "block", width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: value === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />
              <span onClick={() => remove(c)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--cardShadow)" }}>×</span>
            </span>
          ))}
        </div>

        <div style={{ marginTop: 18, padding: 16, background: "var(--surface2)", borderRadius: 18 }}>
          <div ref={wheelRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
            style={{ position: "relative", width: 184, height: 184, margin: "0 auto 16px", borderRadius: "50%", touchAction: "none", cursor: "pointer",
              background: "radial-gradient(circle at center,#fff 0%,rgba(255,255,255,0) 66%),conic-gradient(from 0deg,hsl(0 100% 50%),hsl(60 100% 50%),hsl(120 100% 50%),hsl(180 100% 50%),hsl(240 100% 50%),hsl(300 100% 50%),hsl(360 100% 50%))",
              boxShadow: "inset 0 0 0 1px var(--border)" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `rgba(0,0,0,${1 - val})`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: `${hx}%`, top: `${hy}%`, width: 24, height: 24, borderRadius: "50%", transform: "translate(-50%,-50%)", background: draft, border: "3px solid #fff", boxShadow: "0 1px 5px rgba(0,0,0,.45)", pointerEvents: "none" }} />
          </div>
          <input className="cs-bright" type="range" min="0" max="100" value={Math.round(val * 100)} onChange={(e) => setVal(+e.target.value / 100)}
            style={{ WebkitAppearance: "none", appearance: "none", width: "100%", height: 14, borderRadius: 999, outline: "none", cursor: "pointer", background: brightGrad }} />
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: 14 }}>
            <span style={{ width: 40, height: 40, borderRadius: 13, background: draft, flexShrink: 0, boxShadow: "inset 0 0 0 2px rgba(255,255,255,.4)" }} />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{tr("editor.newColour")}</div><div className="tnum" style={{ color: "var(--muted)", fontSize: 12.5, fontWeight: 600, textTransform: "uppercase" }}>{draft}</div></div>
            <button className="btn btn-primary" style={{ height: 42, padding: "0 18px" }} onClick={addDraft}><Ico name="plus" size={16} />{tr("editor.add")}</button>
          </div>
        </div>

        <div style={{ marginTop: 18 }}><div className="btn btn-secondary btn-full" onClick={onClose}>{tr("editor.done")}</div></div>
      </div>
    </>
  );
}
