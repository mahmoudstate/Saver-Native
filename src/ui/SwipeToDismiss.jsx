// Reusable swipe-to-dismiss row (iOS Mail/Messages style). Reveals a delete
// action on the trailing edge — the right in LTR, the left in RTL, matching
// how Apple's own apps mirror this gesture for Arabic.
//
// Controlled: only one row across the whole list can be open at a time
// (isOpen/onOpenChange, driven by the parent) — swiping a new row, or
// tapping anywhere, closes whichever one was open. That's what keeps a
// revealed delete button from ever looking like a lingering, unexplained
// button sitting on the screen.
import { useRef, useState } from "react";
import Ico from "./Ico.jsx";

const REVEAL = 76; // px of delete button revealed on full swipe
const AXIS_LOCK = 8; // px of movement before we decide "this is a horizontal swipe, not a vertical scroll"

export default function SwipeToDismiss({ isOpen, onOpenChange, onDismiss, children }) {
  const [liveDrag, setLiveDrag] = useState(null); // non-null only while actively dragging
  const start = useRef(null); // { x, y }
  const axis = useRef(null); // "x" | "y" | null (undecided)
  const isRTL = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const onPointerDown = (e) => { start.current = { x: e.clientX, y: e.clientY }; axis.current = null; };
  const onPointerMove = (e) => {
    if (start.current == null) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    // Undecided gesture: wait until the finger has clearly moved further on
    // one axis than the other before committing — this is what stops an
    // ordinary vertical scroll from accidentally revealing the delete button.
    if (axis.current == null) {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axis.current !== "x") return; // vertical scroll — let the page handle it, don't reveal

    const base = isOpen ? REVEAL : 0;
    const toward = (isRTL ? dx : -dx) + base; // magnitude of movement toward the trailing edge
    setLiveDrag(Math.max(0, Math.min(REVEAL * 1.4, toward)));
  };
  const onPointerUp = () => {
    const wasSwipe = axis.current === "x";
    start.current = null;
    axis.current = null;
    if (wasSwipe) onOpenChange(liveDrag > REVEAL / 2);
    setLiveDrag(null);
  };

  const drag = liveDrag != null ? liveDrag : (isOpen ? REVEAL : 0);
  const sign = isRTL ? 1 : -1;

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 18 }}>
      <div onClick={() => { onDismiss(); onOpenChange(false); }} style={{
        position: "absolute", zIndex: 0, top: 0, bottom: 0, [isRTL ? "left" : "right"]: 0, width: REVEAL,
        background: "var(--red)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
      }}>
        <Ico name="trash" size={19} />
      </div>
      <div
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onClickCapture={(e) => { if (isOpen) { e.stopPropagation(); onOpenChange(false); } }}
        style={{ position: "relative", zIndex: 1, transform: `translateX(${sign * drag}px)`, transition: liveDrag != null ? "none" : "transform .2s var(--e-out)", touchAction: "pan-y" }}
      >
        {children}
      </div>
    </div>
  );
}
