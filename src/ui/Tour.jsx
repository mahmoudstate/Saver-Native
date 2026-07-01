// Saver — interactive coach-mark tour. Spotlights real on-screen elements one by
// one with a moving cutout + a tooltip. Targets are CSS selectors on the live UI,
// so the highlight lands on the actual app, not a picture. Theme-aware via vars.
import { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import Ico from "./Ico.jsx";
import { useT } from "../lib/i18n.js";

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Tour({ steps = [], onClose, onNavigate }) {
  const tr = useT();
  const [i, setI] = useState(0);
  const holeRef = useRef(null);
  const tipRef = useRef(null);
  const step = steps[i];
  const last = i === steps.length - 1;

  useLayoutEffect(() => {
    const place = () => {
      const el = document.querySelector(step.selector);
      if (!el) { last ? onClose?.() : setI((n) => n + 1); return; }
      const r = el.getBoundingClientRect();
      const pad = step.pad ?? 8;
      const box = { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
      const move = { left: box.x, top: box.y, width: box.w, height: box.h };
      if (REDUCED) gsap.set(holeRef.current, move);
      else gsap.to(holeRef.current, { ...move, duration: 0.5, ease: "power3.inOut" });
      // place the tooltip below the target, or above if there is no room
      const below = box.y + box.h + 180 < window.innerHeight;
      gsap.set(tipRef.current, { top: below ? box.y + box.h + 14 : "auto", bottom: below ? "auto" : window.innerHeight - box.y + 14 });
      if (!REDUCED) gsap.fromTo(tipRef.current, { opacity: 0, y: below ? 10 : -10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.12, ease: "power3.out" });
    };
    // a step may switch tab/screen first, then we measure once it has rendered
    if (step.goto) { onNavigate?.(step.goto); const t = setTimeout(place, step.gotoDelay ?? 340); return () => clearTimeout(t); }
    place();
  }, [i]); // eslint-disable-line

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000 }}>
      {/* click-blocker so the app underneath is not tappable mid-tour */}
      <div style={{ position: "absolute", inset: 0 }} />
      {/* the moving spotlight: its huge box-shadow darkens everything else */}
      <div ref={holeRef} style={{ position: "fixed", borderRadius: 18, boxShadow: "0 0 0 9999px rgba(8,10,14,.66)", border: "2px solid var(--ac)", pointerEvents: "none" }} />

      <div ref={tipRef} style={{ position: "fixed", left: 16, right: 16, background: "var(--card)", borderRadius: 20, padding: 18, boxShadow: "0 20px 50px rgba(0,0,0,.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={step.icon || "sparkles"} size={17} /></span>
          <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: -.2 }}>{tr(step.title)}</div>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)", fontWeight: 600 }}>{tr(step.text)}</div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 16, gap: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {steps.map((_, n) => <span key={n} style={{ width: n === i ? 16 : 6, height: 6, borderRadius: 3, background: n === i ? "var(--ac)" : "var(--line)", transition: "width .2s" }} />)}
          </div>
          <div style={{ flex: 1 }} />
          <div onClick={onClose} style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", cursor: "pointer", padding: "8px 6px" }}>{tr("tour.skip")}</div>
          <div className="btn btn-primary" style={{ padding: "10px 18px", height: "auto" }} onClick={() => (last ? onClose?.() : setI((n) => n + 1))}>{last ? tr("tour.done") : tr("tour.next")}</div>
        </div>
      </div>
    </div>
  );
}

// A full walk across the app for a first-time user. Each step can switch tab
// first (goto), then spotlight a live element on that screen.
export const APP_TOUR = [
  { goto: { tab: "home" }, selector: ".tabhost .hero", icon: "wallet", pad: 4, title: "tour.s1t", text: "tour.s1x" },
  { selector: ".tabhost .hero .hib", icon: "eye", pad: 6, title: "tour.s2t", text: "tour.s2x" },
  { selector: ".tabhost .bankcard", icon: "wallet", pad: 6, title: "tour.s3t", text: "tour.s3x" },
  { selector: ".tabhost .tile", icon: "target", pad: 6, title: "tour.s4t", text: "tour.s4x" },
  { selector: '[aria-label="Add"]', icon: "plus", pad: 10, title: "tour.s5t", text: "tour.s5x" },
  { goto: { tab: "bills" }, selector: ".tabhost .segx", icon: "bills", pad: 6, title: "tour.s6t", text: "tour.s6x" },
  { goto: { tab: "activity" }, selector: '.tabhost [aria-label="filter"]', icon: "funnel", pad: 8, title: "tour.s7t", text: "tour.s7x" },
  { goto: { tab: "profile" }, selector: ".tabhost .icard", icon: "layers", pad: 6, title: "tour.s8t", text: "tour.s8x" },
  { selector: '[aria-label="profile"]', icon: "book", pad: 10, title: "tour.s9t", text: "tour.s9x" },
];
