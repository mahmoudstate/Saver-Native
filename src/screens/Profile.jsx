// Saver — Profile/Settings: ported 1:1 from showcase 23. Wired to store.
import Ico from "../ui/Ico.jsx";
import { useT } from "../lib/i18n.js";

function Row({ icon, bg, color, label, value, onClick }) {
  return (
    <div className="icard" onClick={onClick} style={{ cursor: "pointer" }}>
      <span className="circ" style={{ width: 36, height: 36, borderRadius: 11, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={icon} size={19} /></span>
      <div className="nm">{label}</div>
      <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 8, color: "var(--faint)" }}>
        {value != null && <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700 }}>{value}</span>}
        <Ico name="chev" size={18} />
      </div>
    </div>
  );
}

export default function Profile({ store, go }) {
  const { username, avatar, banks = [], theme } = store;
  const tr = useT();
  const initial = (username || "Y").slice(0, 1).toUpperCase();
  const themeLabel = theme === "dark" ? tr("common.themeDark") : theme === "light" ? tr("common.themeLight") : tr("common.themeSystem");
  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{tr("profile.title")}</div><div className="grow" /><div className="hib" onClick={() => go?.("editProfile")} aria-label={tr("profile.editProfile")}><Ico name="gear" size={20} /></div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,.28)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 21, color: "var(--heroText)" }}>
            {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
          </div>
          <div><div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -.3 }}>{username || tr("profile.yourName")}</div><div style={{ fontSize: 12.5, color: "var(--heroSub)", fontWeight: 600 }}>{tr("profile.freePlan")}</div></div>
        </div>
      </div>

      <div className="over">{tr("profile.yourMoney")}</div>
      <Row icon="wallet" bg="var(--blueDim)" color="var(--blue)" label={tr("profile.bankAccounts")} value={banks.filter((b) => !b.archived).length} onClick={() => go?.("accounts")} />
      <Row icon="layers" bg="var(--orangeDim)" color="var(--orange)" label={tr("profile.categories")} onClick={() => go?.("categories")} />
      <Row icon="target" bg="var(--acDim)" color="var(--ac)" label={tr("profile.savingsGoals")} onClick={() => go?.("goals")} />
      <Row icon="sparkles" bg="var(--purpleDim)" color="var(--purple)" label={tr("profile.budgetsProjects")} onClick={() => go?.("budgets")} />
      <Row icon="zap" bg="var(--yellowDim)" color="var(--yellow)" label={tr("profile.quickActions")} onClick={() => go?.("quickactions")} />

      <div className="over">{tr("profile.app")}</div>
      <Row icon="palette" bg="var(--acDim)" color="var(--ac)" label={tr("profile.appearance")} value={themeLabel} onClick={() => go?.("appearance")} />
      <Row icon="book" bg="var(--acDim)" color="var(--ac)" label={tr("profile.guideTour")} onClick={() => go?.("manual")} />
      <Row icon="crown" bg="var(--purpleDim)" color="var(--purple)" label={tr("profile.plan")} value={tr("profile.planFree")} onClick={() => go?.("plan")} />
      <Row icon="shield" bg="var(--blueDim)" color="var(--blue)" label={tr("profile.privacyBackup")} onClick={() => go?.("privacy")} />
      <Row icon="info" bg="var(--acDim)" color="var(--ac)" label={tr("profile.aboutUs")} onClick={() => go?.("about")} />

      <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", marginTop: 22 }}>{tr("profile.footer", { y: new Date().getFullYear() })}</div>
    </div>
  );
}
