// Saver — Guide hub: searchable list of topics grouped by area. Each topic opens
// a page with a live demo built from the real app components.
import { useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Ico from "../ui/Ico.jsx";
import { useGuide, useFaq } from "../lib/guide.js";
import { useT } from "../lib/i18n.js";

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Manual({ back, onOpenTopic, onStartTour }) {
  const scope = useRef(null);
  const [q, setQ] = useState("");
  const [faq, setFaq] = useState(-1);
  const tr = useT();
  const guide = useGuide();
  const FAQ = useFaq();

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return guide;
    return guide.map((g) => ({ ...g, topics: g.topics.filter((t) => (t.title + " " + t.blurb).toLowerCase().includes(term)) })).filter((g) => g.topics.length);
  }, [q, guide]);

  useGSAP(() => {
    if (REDUCED) return;
    gsap.from(".gsap-card", { opacity: 0, y: 20, duration: 0.5, stagger: 0.06, ease: "power3.out" });
  }, { scope, dependencies: [q] });

  return (
    <div ref={scope} className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("gd.title")}</div><div className="grow" /></div>
        <div className="lbl">{tr("gd.howWorks")}</div><div className="big" style={{ fontSize: 32 }}>{tr("gd.learnApp")}</div><div className="sub">{tr("gd.learnSub")}</div>
      </div>

      <div className="gsap-card icard" onClick={() => onStartTour?.()} style={{ cursor: "pointer", background: "var(--acDim)", border: "none", marginBottom: 14 }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: "var(--ac)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="sparkles" size={20} /></span>
        <div><div className="nm">{tr("gd.takeTour")}</div><div className="mt">{tr("gd.takeTourSub")}</div></div>
        <Ico name="chev" size={18} color="var(--acText)" style={{ marginInlineStart: "auto" }} />
      </div>

      <label className="field" style={{ marginBottom: 18 }}>
        <span className="circ" style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surface2)", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="search" size={18} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("gd.searchGuide")} style={{ flex: 1, border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700 }} />
      </label>

      {groups.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr("gd.nothingMatches")}</div>
        : groups.map((g) => (
          <div key={g.label}>
            <div className="over">{g.label}</div>
            {g.topics.map((t) => (
              <div className="icard gsap-card" key={t.id} onClick={() => onOpenTopic?.(t.id)} style={{ cursor: "pointer" }}>
                <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in srgb, ${t.color} 16%, transparent)`, color: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={t.icon} size={20} /></span>
                <div><div className="nm">{t.title}</div><div className="mt">{t.blurb}</div></div>
                <Ico name="chev" size={18} color="var(--faint)" style={{ marginInlineStart: "auto" }} />
              </div>
            ))}
          </div>
        ))}

      {!q && (
        <>
          <div className="over" style={{ marginTop: 8 }}>{tr("gd.tipsFaq")}</div>
          {FAQ.map((f, i) => {
            const open = faq === i;
            return (
              <div className="icard" key={i} onClick={() => setFaq(open ? -1 : i)} style={{ cursor: "pointer", flexDirection: "column", alignItems: "stretch" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="nm" style={{ flex: 1 }}>{f.q}</div>
                  <Ico name="chev" size={18} color="var(--faint)" style={{ transform: open ? "rotate(270deg)" : "rotate(90deg)", transition: "transform .2s" }} />
                </div>
                {open && <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--muted)", fontWeight: 600, marginTop: 10 }}>{f.a}</div>}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
