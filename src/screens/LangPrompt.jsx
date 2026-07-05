// Saver — one-time Arabic/English prompt shown before Onboarding, only in
// markets where the OS device language isn't a reliable signal (Egypt, Saudi
// Arabia, UAE, Kuwait, Qatar, Oman — see ASKS_LANG_CHOICE in firstRunDefaults.js).
// Deliberately bilingual and self-labelled (no tr()) since it renders before a
// language is chosen. Not shown anywhere else, and not reachable again after —
// once answered, later language changes go through iOS Settings > Saver > Language.
import iconUrl from "../../icon.png";
import { useLang } from "../lib/i18n.js";
import { HAPTICS } from "../lib/format.js";

const OPTIONS = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "ar", flag: "🇸🇦", name: "العربية" },
];

export default function LangPrompt({ onDone }) {
  const { setLang } = useLang();
  const pick = (code) => { HAPTICS.light(); setLang(code); onDone(); };

  return (
    <>
      <div className="hero" style={{ textAlign: "center" }}>
        <img src={iconUrl} alt="Saver" style={{ width: 64, height: 64, borderRadius: 18, boxShadow: "0 12px 26px rgba(0,0,0,.24)" }} />
        <div className="big" style={{ fontSize: 22, marginTop: 16 }}>Choose your language</div>
        <div className="sub" style={{ marginTop: 2 }}>اختر لغتك</div>
      </div>
      <div className="content" style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          {OPTIONS.map((o) => (
            <button
              key={o.code}
              className="lang-btn"
              onClick={() => pick(o.code)}
            >
              <span style={{ fontSize: 26, lineHeight: 1 }}>{o.flag}</span>
              <span style={{ fontWeight: 800, fontSize: 16.5, flex: 1, textAlign: "start" }}>{o.name}</span>
              <span className="lang-btn-chev">›</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
