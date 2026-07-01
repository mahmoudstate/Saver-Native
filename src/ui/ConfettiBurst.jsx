// Saver — transparent, non-blocking confetti rain. Pieces fall from above the top
// across the full width, drifting + spinning with a gentle flutter, then fade out.
// Auto-unmounts via onDone. Remount with a changing `key` to replay.
import { useMemo, useEffect } from "react";

const COLORS = ["#5FE3C0", "#E5544E", "#3B82F6", "#A78BFA", "#FBBF24", "#16BFA6", "#FB923C", "#fff"];
const rnd = (a, b) => a + Math.random() * (b - a);

export default function ConfettiBurst({ count = 70, duration = 3000, onDone }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => {
    const ribbon = Math.random() < 0.6;
    return {
      i,
      x: rnd(0, 100),                // column across the full width (%)
      top: rnd(-40, -8),             // start a bit above the top edge (px), staggered
      dx: rnd(-90, 90),              // sideways drift while falling
      rot: rnd(360, 1100) * (Math.random() < .5 ? -1 : 1),
      w: ribbon ? rnd(5, 8) : rnd(7, 11),
      h: ribbon ? rnd(11, 18) : rnd(7, 11),
      bg: COLORS[(Math.random() * COLORS.length) | 0],
      delay: rnd(0, 700),            // staggered so it rains, not drops all at once
      dur: rnd(duration * 0.7, duration),
      radius: ribbon ? "2px" : "50%",
    };
  }), [count, duration]);

  useEffect(() => { const t = setTimeout(() => onDone?.(), duration + 800); return () => clearTimeout(t); }, [duration, onDone]);

  return (
    <div className="confetti-layer" aria-hidden>
      {pieces.map((p) => (
        <span key={p.i} className="confetti-pc" style={{
          left: `${p.x}%`, top: p.top, width: p.w, height: p.h, background: p.bg, borderRadius: p.radius,
          "--dx": `${p.dx}px`, "--rot": `${p.rot}deg`,
          animationDelay: `${p.delay}ms`, animationDuration: `${p.dur}ms`,
        }} />
      ))}
    </div>
  );
}
