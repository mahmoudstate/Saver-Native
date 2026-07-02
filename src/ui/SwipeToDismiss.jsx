// Reusable swipe-to-dismiss row (iOS Mail/Messages style). Reveals a delete
// action on the trailing edge — the right in LTR, the left in RTL, matching
// how Apple's own apps mirror this gesture for Arabic.
import { useRef, useState } from "react";
import Ico from "./Ico.jsx";

const REVEAL = 76; // px of delete button revealed on full swipe

export default function SwipeToDismiss({ onDismiss, children }) {
  const [drag, setDrag] = useState(0); // 0..REVEAL, magnitude toward trailing edge
  const [dragging, setDragging] = useState(false);
  const start = useRef(null);
  const isRTL = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const onPointerDown = (e) => { start.current = e.clientX; setDragging(true); };
  const onPointerMove = (e) => {
    if (start.current == null) return;
    const raw = e.clientX - start.current; // + = finger moved right, − = moved left
    const toward = isRTL ? raw : -raw; // magnitude of movement toward the trailing edge
    setDrag(Math.max(0, Math.min(REVEAL * 1.4, toward)));
  };
  const onPointerUp = () => {
    setDragging(false);
    start.current = null;
    setDrag((d) => (d > REVEAL / 2 ? REVEAL : 0));
  };

  const sign = isRTL ? 1 : -1;

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 18 }}>
      <div onClick={() => { onDismiss(); setDrag(0); }} style={{
        position: "absolute", top: 0, bottom: 0, [isRTL ? "left" : "right"]: 0, width: REVEAL,
        background: "var(--red)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
      }}>
        <Ico name="trash" size={19} />
      </div>
      <div
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        style={{ transform: `translateX(${sign * drag}px)`, transition: dragging ? "none" : "transform .2s var(--e-out)", touchAction: "pan-y" }}
      >
        {children}
      </div>
    </div>
  );
}
