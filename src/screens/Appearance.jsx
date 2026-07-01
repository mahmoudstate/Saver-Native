// Saver — Appearance: ported 1:1 from showcase 24 (light/dark + 6 calm accents).
import Ico from "../ui/Ico.jsx";
import Money from "../ui/Money.jsx";
import { fmt } from "../lib/format.js";
import { ACCENTS } from "../lib/store.js";
import { useLang } from "../lib/i18n.js";
import { totalBalance } from "../lib/calc.js";

export default function Appearance({ store, back }) {
  const { theme, accent, banks = [], txns = [] } = store;
  const { lang, setLang, t } = useLang();
  const total = totalBalance(banks, txns);

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

      <div className="over">{t("appearance.language")}</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        {[["en", "English"], ["ar", "العربية"]].map(([code, label]) => (
          <div key={code} className="card" onClick={() => setLang(code)} style={{ flex: 1, padding: "18px 8px", textAlign: "center", boxShadow: "none", cursor: "pointer", border: `2px solid ${lang === code ? "var(--ac)" : "var(--border)"}` }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="caption" style={{ marginBottom: 20 }}>{t("appearance.languageCaption")}</div>

      <div className="over">{t("appr.accentColour")}</div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "space-between", padding: "0 4px" }}>
        {Object.entries(ACCENTS).map(([name, [c]]) => (
          <span key={name} onClick={() => store.set("accent", name)} title={t("accent." + name)} style={{ width: 40, height: 40, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: accent === name ? "0 0 0 3px var(--bg),0 0 0 5px var(--ac)" : "none" }} />
        ))}
      </div>
      <div className="caption" style={{ textAlign: "center", marginTop: 18 }}>{t("appr.retint", { name: t("accent." + (accent || "mint")) })}</div>
    </div>
  );
}
