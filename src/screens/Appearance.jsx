// Saver — Appearance: ported 1:1 from showcase 24 (light/dark + 6 calm accents).
import { useMemo } from "react";
import Ico from "../ui/Ico.jsx";
import Money from "../ui/Money.jsx";
import { fmt } from "../lib/format.js";
import { ACCENTS } from "../lib/store.js";
import { useLang } from "../lib/i18n.js";
import { totalBalance } from "../lib/calc.js";

export default function Appearance({ store, back }) {
  const { theme, accent, banks = [], txns = [], hapticsEnabled } = store;
  const { t } = useLang();
  const total = useMemo(() => totalBalance(banks, txns), [banks, txns]);
  const haptics = hapticsEnabled !== false;
  const toggleHaptics = () => store.set("hapticsEnabled", !haptics);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{t("profile.appearance")}</div><div className="grow" /></div>
        <div className="lbl">{t("home.totalBalance")}</div><Money className="big tnum" v={total} /><div className="sub">{t("appr.livePreview")}</div>
      </div>

      <div className="over">{t("appr.theme")}</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        {[["system", "device", "var(--blue)", t("common.themeSystem")], ["light", "sun", "var(--yellow)", t("common.themeLight")], ["dark", "moon", "var(--ac)", t("common.themeDark")]].map(([tid, ico, col, label]) => (
          <div key={tid} className="card" onClick={() => store.set("theme", tid)} style={{ flex: 1, padding: "16px 8px", textAlign: "center", boxShadow: "none", cursor: "pointer", border: `2px solid ${theme === tid ? "var(--ac)" : "var(--border)"}` }}>
            <Ico name={ico} size={22} color={col} style={{ margin: "0 auto" }} /><div style={{ fontWeight: 800, fontSize: 13.5, marginTop: 8 }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="caption" style={{ marginBottom: 20 }}>{theme === "system" ? t("appr.followsSystem") : t("appr.always", { theme: t(theme === "dark" ? "common.themeDark" : "common.themeLight") })}</div>

      <div className="over">{t("appr.accentColour")}</div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "space-between", padding: "0 4px" }}>
        {Object.entries(ACCENTS).map(([name, [c]]) => (
          <span key={name} onClick={() => store.set("accent", name)} title={t("accent." + name)} style={{ width: 40, height: 40, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: accent === name ? "0 0 0 3px var(--bg),0 0 0 5px var(--ac)" : "none" }} />
        ))}
      </div>
      <div className="caption" style={{ textAlign: "center", marginTop: 18 }}>{t("appr.retint", { name: t("accent." + (accent || "mint")) })}</div>

      <div className="over" style={{ marginTop: 16 }}>{t("appr.feedback")}</div>
      <div className="icard" onClick={toggleHaptics} style={{ cursor: "pointer" }}>
        <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--acDim)", color: "var(--ac)" }}><Ico name="sparkles" size={20} /></span>
        <div><div className="nm">{t("appr.haptics")}</div><div className="mt">{t(haptics ? "appr.hapticsOnSub" : "appr.hapticsOffSub")}</div></div>
        <span style={{ marginInlineStart: "auto" }}>
          <span style={{ width: 46, height: 28, borderRadius: 99, background: haptics ? "var(--ac)" : "var(--track)", border: haptics ? "none" : "var(--cardBorder)", display: "flex", alignItems: "center", justifyContent: haptics ? "flex-end" : "flex-start", padding: 3, boxSizing: "border-box", transition: "background .2s, justify-content .2s" }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: "#fff", flexShrink: 0 }} />
          </span>
        </span>
      </div>
    </div>
  );
}
