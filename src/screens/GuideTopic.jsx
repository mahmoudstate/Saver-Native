// Saver — Guide topic page: a friendly intro, a live demo from the real app
// components, a numbered step sequence, and one tip. GSAP entrance + a soft
// highlight pulse on the demo so the eye lands there first.
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Ico from "../ui/Ico.jsx";
import GuideDemo from "../ui/GuideDemo.jsx";
import GuideSteps from "../ui/GuideSteps.jsx";
import { useTopic } from "../lib/guide.js";
import { useT } from "../lib/i18n.js";

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function GuideTopic({ topicId, back }) {
  const scope = useRef(null);
  const tr = useT();
  const topic = useTopic(topicId);

  useGSAP(() => {
    if (!topic || REDUCED) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".gsap-intro", { opacity: 0, y: 18, duration: 0.5 })
      .from(".gsap-demo", { opacity: 0, y: 22, duration: 0.6 }, "-=0.25")
      .from(".gsap-title", { opacity: 0, y: 14, duration: 0.45 }, "-=0.2")
      .from(".gsap-step", { opacity: 0, x: -16, duration: 0.45, stagger: 0.1 }, "-=0.15")
      .from(".gsap-tip", { opacity: 0, y: 14, duration: 0.45 }, "-=0.1");
    // a gentle one-time highlight so the live demo draws the eye
    gsap.fromTo(".gsap-demo", { boxShadow: `0 0 0 0 color-mix(in srgb, ${topic.color} 0%, transparent)` }, { boxShadow: `0 0 0 4px color-mix(in srgb, ${topic.color} 30%, transparent)`, duration: 0.7, delay: 0.7, yoyo: true, repeat: 1, ease: "sine.inOut" });
  }, { scope });

  if (!topic) return null;

  return (
    <div ref={scope} className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("gd.title")}</div><div className="grow" /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 13, position: "relative", zIndex: 1 }}>
          <span style={{ width: 50, height: 50, borderRadius: 16, background: "var(--heroChip)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={topic.icon} size={24} /></span>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -.5 }}>{topic.title}</div>
        </div>
      </div>

      <p className="gsap-intro" style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--muted)", fontWeight: 600, margin: "4px 0 20px", textWrap: "pretty" }}>{topic.intro}</p>

      <GuideDemo demo={topic.demo} />

      <div className="gsap-title over" style={{ marginTop: 24 }}>{tr("gd.stepByStep")}</div>
      <GuideSteps steps={topic.steps} color={topic.color} />

      {topic.tip && (
        <div className="gsap-tip" style={{ marginTop: 22, display: "flex", gap: 11, alignItems: "flex-start", background: "var(--acDim)", borderRadius: 16, padding: 14 }}>
          <span style={{ flex: "0 0 auto", color: "var(--acText)", marginTop: 1 }}><Ico name="sparkles" size={18} /></span>
          <div style={{ fontSize: 13.5, lineHeight: 1.6, fontWeight: 700, color: "var(--acText)" }}>{topic.tip}</div>
        </div>
      )}
    </div>
  );
}
