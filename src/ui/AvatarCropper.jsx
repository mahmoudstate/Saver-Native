// Saver — circular avatar cropper (WhatsApp-style): drag to pan, slider to zoom,
// then renders the visible circle to a 256² JPEG data URL.
import { useState, useRef, useEffect } from "react";
import Ico from "./Ico.jsx";

const V = 280;   // square viewport size (px)
const OUT = 256; // output image size (px)

export default function AvatarCropper({ src, onCancel, onDone }) {
  const [nat, setNat] = useState(null);       // natural image dimensions
  const [zoom, setZoom] = useState(1);        // user zoom multiplier (>= 1)
  const [pan, setPan] = useState({ x: 0, y: 0 }); // translation of image centre (px)
  const imgRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    const im = new Image();
    im.onload = () => { setNat({ w: im.naturalWidth, h: im.naturalHeight }); imgRef.current = im; };
    im.src = src;
  }, [src]);

  // base scale so the image always covers the viewport at zoom = 1
  const bs = nat ? Math.max(V / nat.w, V / nat.h) : 1;
  const es = bs * zoom;                       // effective scale
  const dw = nat ? nat.w * es : 0, dh = nat ? nat.h * es : 0;

  // keep the viewport fully covered: clamp pan to the overflow on each axis
  const clamp = (p) => {
    const mx = Math.max(0, (dw - V) / 2), my = Math.max(0, (dh - V) / 2);
    return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) };
  };
  useEffect(() => { setPan((p) => clamp(p)); /* re-clamp on zoom */ }, [zoom, nat]); // eslint-disable-line

  const onDown = (e) => { drag.current = { px: e.clientX, py: e.clientY, ...pan }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => { if (!drag.current) return; setPan(clamp({ x: drag.current.x + (e.clientX - drag.current.px), y: drag.current.y + (e.clientY - drag.current.py) })); };
  const onUp = () => { drag.current = null; };

  const confirm = () => {
    if (!nat || !imgRef.current) return;
    // viewport top-left in image space → source rect that maps to the square
    const tlx = V / 2 + pan.x - dw / 2, tly = V / 2 + pan.y - dh / 2;
    const sx = -tlx / es, sy = -tly / es, sSize = V / es;
    const c = document.createElement("canvas");
    c.width = OUT; c.height = OUT;
    const ctx = c.getContext("2d");
    ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, OUT, OUT);
    onDone(c.toDataURL("image/jpeg", 0.85));
  };

  return (
    <>
      <div className="dim" onClick={onCancel} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>Adjust photo</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 16px" }}>Drag to position · slide to zoom.</div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: V, height: V, borderRadius: 18, overflow: "hidden", background: "var(--surface2)", touchAction: "none", cursor: "grab" }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            {nat && (
              <img src={src} alt="" draggable={false} style={{
                position: "absolute", left: "50%", top: "50%", width: dw, height: dh,
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`, userSelect: "none", pointerEvents: "none",
              }} />
            )}
            {/* dim everything outside the circle */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "rgba(0,0,0,.45)", WebkitMaskImage: `radial-gradient(circle ${V / 2}px at 50% 50%, transparent 99%, #000 100%)`, maskImage: `radial-gradient(circle ${V / 2}px at 50% 50%, transparent 99%, #000 100%)` }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: V - 2, height: V - 2, transform: "translate(-50%,-50%)", borderRadius: "50%", border: "2px solid rgba(255,255,255,.9)", pointerEvents: "none" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 4px 4px" }}>
          <Ico name="search" size={16} color="var(--muted)" />
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ flex: 1, accentColor: "var(--ac)" }} />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <div className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Cancel</div>
          <div className="btn btn-primary" style={{ flex: 1 }} onClick={confirm}><Ico name="check" size={18} />Use photo</div>
        </div>
      </div>
    </>
  );
}
