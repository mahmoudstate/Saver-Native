// Full-screen "swipe anywhere to go back" gesture (WhatsApp/iOS style).
//
// Only the front (top) screen is dragged. Everything beneath it is a real,
// already-mounted screen that never moves, so there is nothing to reveal a
// deeper layer, and returning to it replays no entrance animation (no shake).
//
// Axis handling is what makes this feel native and never "cancel" mid-drag:
//   - The direction is decided decisively on the first real movement.
//   - Once we lock horizontal, every touchmove is preventDefault'd, so the
//     browser/WKWebView can never reclaim the touch for vertical scrolling
//     while the finger is still down. Vertical finger drift is simply ignored.
//   - If the first movement is vertical, we do nothing and let the platform
//     scroll the content natively (smooth, with real momentum, nested
//     horizontal scrollers keep working).
//
// This returns a *callback ref*. React re-invokes it whenever the top screen
// changes, so the listeners always rebind to the current front layer.
import { useCallback, useRef } from "react";

const SLOP = 8; // px of movement before the axis is decided
const COMMIT_RATIO = 0.6; // fraction of width dragged to complete the pop
const COMMIT_VELOCITY = 0.9; // px/ms flick speed that completes regardless of distance
const SETTLE_MS = 300;

const isTextEditable = (el) => !!(el && el.closest && el.closest("input, textarea, [contenteditable='true']"));

// The pointer started inside a horizontally-scrollable/draggable area
// (carousels, the row-level SwipeToDismiss); those own horizontal movement.
const ownedByNestedHorizontalArea = (el, root) => {
  let node = el;
  while (node && node !== root) {
    if (node.hasAttribute && node.hasAttribute("data-no-swipeback")) return true;
    if (node.nodeType === 1) {
      const cs = getComputedStyle(node);
      if ((cs.overflowX === "auto" || cs.overflowX === "scroll") && node.scrollWidth > node.clientWidth + 1) return true;
    }
    node = node.parentElement;
  }
  return false;
};

export function useEdgeSwipeBack({ enabled, onCommit }) {
  const cleanupRef = useRef(null);
  // Live config the bound listeners read at event time, so we can bind once
  // per node without re-binding on every prop change.
  const cfg = useRef({ enabled, onCommit });
  cfg.current.enabled = enabled;
  cfg.current.onCommit = onCommit;

  return useCallback((node) => {
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    if (!node) return;

    const isRTL = () => document.documentElement.dir === "rtl";
    const width = () => node.offsetWidth || window.innerWidth;
    let g = null; // active gesture, or null

    const swallowNextClick = () => {
      const h = (e) => { e.preventDefault(); e.stopPropagation(); };
      window.addEventListener("click", h, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", h, { capture: true }), 400);
    };
    const reset = () => {
      node.style.transition = ""; node.style.transform = "";
      // Deliberately do NOT restore `animation`: clearing it back to the CSS
      // value re-triggers the pushIn entrance keyframe, so a spring-back looks
      // like the screen re-opens. The screen has fully entered already; keep
      // animation:none for the rest of its life.
    };

    const down = (e) => {
      if (!cfg.current.enabled) { g = null; return; }
      if (e.pointerType === "mouse" && e.button !== 0) { g = null; return; }
      if (isTextEditable(e.target) || ownedByNestedHorizontalArea(e.target, node)) { g = null; return; }
      g = { x0: e.clientX, y0: e.clientY, axis: null, dragging: false, raf: null, samples: [{ x: e.clientX, t: e.timeStamp }] };
    };

    const move = (e) => {
      if (!g) return;
      const dx = e.clientX - g.x0;
      const dy = e.clientY - g.y0;

      if (g.axis == null) {
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
        // Decide immediately, no "ambiguous, wait" state. That delay was what
        // let the platform start a vertical scroll and cancel the back-swipe.
        const forward = isRTL() ? dx < 0 : dx > 0; // toward "reveal previous screen"
        g.axis = (Math.abs(dx) > Math.abs(dy) && forward) ? "x" : "y";
        if (g.axis === "x") {
          g.dragging = true;
          try { node.setPointerCapture(e.pointerId); } catch { /* ignore */ }
          node.style.animation = "none";   // pushIn keeps overriding transform otherwise
          node.style.transition = "none";
        }
      }
      if (g.axis !== "x") return; // vertical → leave it to native scrolling

      g.samples.push({ x: e.clientX, t: e.timeStamp });
      if (g.samples.length > 5) g.samples.shift();

      const norm = isRTL() ? -dx : dx;
      const val = norm < 0 ? norm * 0.3 : norm; // gentle rubber-band past the start
      const px = isRTL() ? -val : val;
      if (g.raf == null) {
        g.raf = requestAnimationFrame(() => {
          g.raf = null;
          if (g && g.axis === "x") node.style.transform = `translate3d(${px}px,0,0)`;
        });
      }
    };

    const up = (e) => {
      const s = g; g = null;
      if (!s || !s.dragging) return;
      if (s.raf) cancelAnimationFrame(s.raf);
      try { node.releasePointerCapture(e.pointerId); } catch { /* ignore */ }

      const dx = e.clientX - s.x0;
      const f = s.samples[0];
      const l = s.samples[s.samples.length - 1];
      const dt = Math.max(1, l.t - f.t);
      const v = (l.x - f.x) / dt; // px/ms
      const norm = isRTL() ? -dx : dx;
      const nv = isRTL() ? -v : v;
      const commit = (Math.max(0, norm) / width()) > COMMIT_RATIO || nv > COMMIT_VELOCITY;

      swallowNextClick();
      node.style.transition = `transform ${SETTLE_MS}ms var(--e-out)`;
      let done = false;
      const settle = () => {
        if (done) return;
        done = true;
        node.removeEventListener("transitionend", settle);
        clearTimeout(fb);
        if (commit) {
          // Leave the screen parked off-screen and let React unmount it. Clearing
          // the transform here would snap it back over the previous screen for one
          // frame before the pop lands → the flash the user saw.
          cfg.current.onCommit();
        } else {
          reset();
        }
      };
      node.style.transform = commit ? `translate3d(${isRTL() ? -width() : width()}px,0,0)` : "translate3d(0,0,0)";
      node.addEventListener("transitionend", settle);
      const fb = setTimeout(settle, SETTLE_MS + 120);
    };

    // The one lever that reliably stops WKWebView/browser from scrolling while
    // we drag: preventDefault the touchmove once we've committed to horizontal.
    const touchMove = (e) => { if (g && g.axis === "x") e.preventDefault(); };

    node.addEventListener("pointerdown", down, { passive: true });
    node.addEventListener("pointermove", move, { passive: true });
    node.addEventListener("pointerup", up, { passive: true });
    node.addEventListener("pointercancel", up, { passive: true });
    node.addEventListener("touchmove", touchMove, { passive: false });
    cleanupRef.current = () => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
      node.removeEventListener("touchmove", touchMove);
    };
  }, []);
}
