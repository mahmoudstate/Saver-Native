// Saver — About us: our story, told simply, with a co-creation invite.
// Opened from Profile → About us.
import Ico from "../ui/Ico.jsx";
import logo from "../../icon.png";
import { useT } from "../lib/i18n.js";
import { APP_VERSION } from "../lib/format.js";

const MAIL = "hello@savertrack.app";
const MAILTO = `mailto:${MAIL}?subject=An idea for Saver&body=Hi Saver team,%0A%0AHere is my idea:%0A`;

// One step in the "how it works" sequence: numbered icon + a short, plain line.
function Step({ icon, title, text, last }) {
  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ width: 42, height: 42, borderRadius: 14, background: "color-mix(in srgb, var(--ac) 14%, transparent)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name={icon} size={20} /></span>
        {!last && <span style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 4, minHeight: 20 }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 20 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: -.2 }}>{title}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--muted)", fontWeight: 600, marginTop: 4 }}>{text}</div>
      </div>
    </div>
  );
}

// A benefit card: category-coloured icon tile, a friendly headline, one plain line.
function Perk({ icon, color, title, text }) {
  return (
    <div className="icard" style={{ alignItems: "flex-start", gap: 12 }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in srgb, ${color} 16%, transparent)`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name={icon} size={20} /></span>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: -.2 }}>{title}</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{text}</div>
      </div>
    </div>
  );
}

// A small trust badge in the privacy row.
function Badge({ icon, label }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "16px 8px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16 }}>
      <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={icon} size={19} /></span>
      <div style={{ fontSize: 12, fontWeight: 800, textAlign: "center" }}>{label}</div>
    </div>
  );
}

const Title = ({ children }) => <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -.3, marginTop: 28, marginBottom: 14 }}>{children}</div>;

export default function About({ back }) {
  const tr = useT();
  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("about.title")}</div><div className="grow" /></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1, paddingTop: 4, paddingBottom: 6 }}>
          <img src={logo} alt="Saver" style={{ width: 78, height: 78, borderRadius: 20, boxShadow: "0 10px 24px rgba(0,0,0,.28)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -.5 }}>Saver</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heroSub)", marginTop: 2 }}>{tr("about.tagline")}</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--faint)", marginTop: 6 }}>{tr("about.version", { v: APP_VERSION })}</div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 15.5, lineHeight: 1.7, fontWeight: 700, letterSpacing: -.2, margin: "22px 0 0", textWrap: "pretty" }}>
        {tr("about.intro1")}
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--muted)", fontWeight: 600, margin: "10px 0 0", textWrap: "pretty" }}>
        {tr("about.intro2")}
      </p>

      <Title>{tr("about.helpsTitle")}</Title>
      <Step icon="eye" title={tr("about.help1nm")} text={tr("about.help1mt")} />
      <Step icon="layers" title={tr("about.help2nm")} text={tr("about.help2mt")} />
      <Step icon="target" title={tr("about.help3nm")} text={tr("about.help3mt")} last />

      <Title>{tr("about.getTitle")}</Title>
      <Perk icon="eye" color="var(--blue)" title={tr("about.perk1nm")} text={tr("about.perk1mt")} />
      <Perk icon="bills" color="var(--purple)" title={tr("about.perk2nm")} text={tr("about.perk2mt")} />
      <Perk icon="target" color="var(--ac)" title={tr("about.perk3nm")} text={tr("about.perk3mt")} />
      <Perk icon="lock" color="var(--orange)" title={tr("about.perk4nm")} text={tr("about.perk4mt")} />

      <Title>{tr("about.yoursTitle")}</Title>
      <div style={{ display: "flex", gap: 10 }}>
        <Badge icon="lock" label={tr("about.trustPhone")} />
        <Badge icon="close" label={tr("about.trustNoAds")} />
        <Badge icon="eyeOff" label={tr("about.trustNoTracking")} />
      </div>

      <div className="card" style={{ marginTop: 28, padding: 18, background: "var(--acDim)", boxShadow: "none", border: "none" }}>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -.3 }}>{tr("about.buildTitle")}</div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)", fontWeight: 600, margin: "8px 0 0", textWrap: "pretty" }}>
          {tr("about.buildText")}
        </p>
        <a href={MAILTO} style={{ textDecoration: "none" }}>
          <div className="btn btn-primary btn-full" style={{ marginTop: 14 }}><Ico name="sparkles" size={17} />{tr("about.shareIdea")}</div>
        </a>
        <a href={`mailto:${MAIL}`} style={{ textDecoration: "none" }}>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="mail" size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--muted)" }}>{tr("about.emailUs")}</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{MAIL}</div>
            </div>
            <Ico name="chev" size={18} color="var(--faint)" />
          </div>
        </a>
      </div>

      <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 11.5, fontWeight: 700, margin: "24px 0 4px", lineHeight: 1.6 }}>{tr("about.footer")}</div>
    </div>
  );
}
